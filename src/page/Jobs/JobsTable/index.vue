<template>
  <section class="jobs-table-wrap">
    <div class="btns-search">
      <div class="btns">
        <!-- <el-button type="primary" text :disabled="deleteList.length === 0" icon="el-ksd-icon-delete_22" @click="handleDelete()">{{$t('delete')}}</el-button> -->
        <el-button
          type="text"
          size="medium"
          :disabled="stopList.length === 0"
          icon="el-ksd-icon-stop_with_border_22"
          @click="handleStop()"
        >
          {{ $t('discard') }}
        </el-button>
      </div>
      <el-input
        prefix-icon="el-ksd-icon-search_22"
        style="width: 248px"
        :placeholder="$t('jobs.filterHolder')"
        v-model="filterData.keyword"
      />
    </div>
    <el-table
      v-loading="loadingData"
      :data="jobList"
      style="width: 100%"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
      row-key="job_id"
      @filter-change="handleFilterChange"
      :default-sort="defaultSortObj"
    >
      <el-table-column
        type="selection"
        :reserve-selection="true"
        width="55"
      ></el-table-column>
      <el-table-column prop="job_id" :label="$t('jobs.jobId')" min-width="150">
        <template slot-scope="scope">
          <div class="job-id-wrap">
            <span>{{ scope.row.job_id }}</span>
            <icon-btn
              icon="el-ksd-icon-dup_16"
              :text="$t('copy')"
              style="fontsize: 16px"
              v-clipboard:success="onCopy"
              v-clipboard:copy="scope.row.job_id"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        prop="user"
        :label="$t('jobs.user')"
        width="100"
      ></el-table-column>
      <el-table-column
        show-overflow-tooltip
        prop="notebook"
        :label="$t('jobs.notebook')"
        width="120"
      ></el-table-column>
      <el-table-column
        sortable
        show-overflow-tooltip
        prop="start_time"
        :label="$t('jobs.startTime')"
        :formatter="formateDate"
        width="180"
      ></el-table-column>
      <el-table-column
        show-overflow-tooltip
        prop="duration"
        :label="$t('jobs.duration')"
        :formatter="formateDuration"
        width="140"
      ></el-table-column>
      <el-table-column
        show-overflow-tooltip
        prop="status"
        :label="$t('jobs.status')"
        width="150"
        column-key="status"
        :filter-multiple="false"
        :filters="statusFiltersList"
        filter-icon="el-ksd-icon-filter_22"
        filter-placement="bottom-end"
      >
        <template slot-scope="scope">
          <el-tag :type="getJobTag(scope.row.status).type">
            {{ getJobTag(scope.row.status).text }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="engine"
        :label="$t('jobs.engine')"
        width="100"
      ></el-table-column>
      <el-table-column :label="$t('action')" width="100">
        <template slot-scope="scope">
          <icon-btn
            icon="el-ksd-icon-view_22"
            class="mr-10"
            :text="$t('view')"
            :handler="() => getCode(scope.row)"
          />
          <icon-btn
            v-if="dataType === 'latest'"
            icon="el-ksd-icon-stop_with_border_22"
            :text="$t('discard')"
            :disabled="scope.row.status !== '0'"
            :handler="() => handleStop(scope.row)"
          />
          <!-- <icon-btn icon="el-icon-ksd-delete_22" :disabled="scope.row.status === '0'" :text="$t('delete')" :handler="() => handleDelete(scope.row)" /> -->
        </template>
      </el-table-column>
    </el-table>
    <div class="text-center pt-15">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="filterData.page_offset + 1"
        :page-sizes="[10, 15, 20, 50]"
        :page-size="filterData.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total_size"
      ></el-pagination>
    </div>
  </section>
</template>


<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapActions } from 'vuex'
import { formatGetParams, timeToStr } from '@/util'
import IconBtn from '../../../components/IconBtn'
import moment from 'moment'

@Component({
  props: {
    dataType: {
      type: String,
      default: 'latest',
      required: true
    }
  },
  components: {
    IconBtn
  },
  methods: {
    ...mapActions({
      getJobList: 'GET_JOB_LIST',
      getCodeById: 'GET_CODE_BY_ID',
      deleteJobs: 'DELETE_JOBS',
      cancelExcuteCell: 'CANCEL_EXCUTE_CELL'
    }),
    ...mapActions('CodeModal', {
      callCodeModal: 'CALL_MODAL'
    })
  }
})
export default class JobsTable extends Vue {
  jobList = []
  total_size = 0
  filterData = {
    page_offset: 0,
    page_size: 20,
    sort_by: 'start_time',
    reverse: true,
    keyword: '',
    engine: ''
  }
  filterTags = []
  selectedList = []
  timer = null
  loadingData = true
  defaultSortObj = {
    prop: 'start_time',
    order: 'descending'
  }

  get statusFiltersList () {
    return [
      { text: this.$t('jobs.RUNNING'), value: '0', type: '' },
      { text: this.$t('jobs.COMPLETED'), value: '1', type: 'success' },
      { text: this.$t('jobs.ERROR'), value: '2', type: 'danger' },
      { text: this.$t('jobs.DISCARDED'), value: '3', type: 'info' }
    ]
  }

  get stopList () {
    return this.selectedList.filter(v => v.status === '0')
  }

  get deleteList () {
    return this.selectedList.filter(v => v.status !== '0')
  }

  getJobTag (status) {
    const statusItem = this.statusFiltersList.find(v => v.value === status)
    return { text: statusItem.text, type: statusItem.type }
  }


  @Watch('filterData.keyword')
  onKeywordChange () {
    window.clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.filterData.page_offset = 0
      this.fetchData()
    }, 1000)
  }

  mounted () {
    this.fetchData()
  }

  async fetchData () {
    try {
      this.loadingData = true
      const params = formatGetParams(this.filterData)
      const res = await this.getJobList({ params, dataType: this.dataType })
      this.loadingData = false
      this.jobList = res.data?.list ?? []
      this.total_size = Number(res.data.total_size)
    } catch (e) {
      this.loadingData = false
    }
  }
  handleDelete (item) {
    this.$confirm(this.$t('jobs.confirmDeleteJobs'), this.$t('jobs.deleteTitle'), {
      confirmButtonText: this.$t('delete'),
      cancelButtonText: this.$t('cancel'),
      type: 'warning',
      customClass: 'centerButton'
    }).then(() => {
      this.confirmDelete(item)
    })
  }
  async confirmDelete (item) {
    try {
      let ids = ''
      ids = item ? item.job_id : this.selectedList.map(v => v.job_id).join(',')
      await this.deleteJobs(ids)
      this.fetchData()
    } catch (e) {
      console.log(e)
    }
  }

  handleSizeChange (val) {
    this.filterData.page_size = val
    this.fetchData()
  }

  handleCurrentChange (val) {
    this.filterData.page_offset = val - 1
    this.fetchData()
  }
  handleSortChange ({ prop, order }) {
    if (prop && order) {
      this.filterData.sort_by = prop
      this.filterData.reverse = order === 'descending' // ascending
    }
    this.fetchData()
  }

  handleFilterChange (filters) {
    this.filterData.status = filters.status.join(',')
    this.fetchData()
  }

  handleSelectionChange (val) {
    this.selectedList = val
  }

  getCode (item) { // 只能查看原始的code 不能查看正在运行中的 code
    this.callCodeModal({ id: item.job_id, type: 'job' })
  }

  formateDate (row, column, time) {
    return moment(time).format('yyyy-MM-DD HH:mm:ss')
  }

  getUnit (count, unit) {
    return count > 0 ? count + unit : ''
  }
  formateDuration (row, column, time) {
    if (!time) {
      return '-'
    }
    const { day, hour, minutes, seconds, ms } = timeToStr(time)
    const { getUnit } = this
    return getUnit(day, 'd') + getUnit(hour, 'h') + getUnit(minutes, 'm') + getUnit(seconds, 's') + getUnit(ms, 'ms') || '0s'
  }

  async handleStop (item) {
    const text = item ? this.$t('notebook.discardJobText') : this.$t('notebook.discardAllJob')
    this.$confirm(text, this.$t('notebook.discardTitle'), {
      confirmButtonText: this.$t('discard'),
      cancelButtonText: this.$t('cancel'),
      type: 'warning',
      customClass: 'centerButton'
    }).then(() => {
      this.confirmStopJob(item)
    })
  }

  async confirmStopJob (item) {
    const ids = item ? [item.job_id] : this.stopList.map(v => v.job_id)
    try {
      await this.cancelAll(ids)
      this.fetchData(this.jobId)
    } catch (e) {
      console.log(e)
    }
  }
  async cancelAll (ids) {
    return Promise.all([...ids].map(async v => {
      return await this.cancelExcuteCell(v)
    }))
  }
  onCopy () {
    this.$message.success(this.$t('copySuccess'))
  }
}
</script>

<style lang="scss">

.jobs-table-wrap {
  .job-id-wrap {
    display: flex;
    justify-content: space-between;
    line-height: 28px;
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .btns-search {
    margin: 10px 0;
    line-height: 34px;
    display: flex;
    justify-content: space-between;
    .btns {
      font-size: 14px;
    }
  }
  .is-disabled {
    color: $--font-color-disabled-base;
  }
}
</style>
