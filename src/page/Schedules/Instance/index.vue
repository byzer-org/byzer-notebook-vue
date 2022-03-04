<template>
  <section class="instance-page page-outer-padding">
    <div class="page-inner-header">
      <i
        class="el-ksd-icon-arrow_left_L_22 hasEvent"
        @click="$router.back()"
      ></i>
      <span>{{ $t('schedules.instanceTitle') }}</span>
    </div>
    <el-table
      v-loading="loading"
      style="width: 100%"
      :row-key="'id'"
      :data="tableData"
      :default-sort="defaultSort"
      @sort-change="handleSortChange"
      @filter-change="handleFilterChange"
    >
      <el-table-column
        show-overflow-tooltip
        :prop="'task_name'"
        :label="$t('schedules.ins_schName')"
        :min-width="'100'"
      ></el-table-column>
      <el-table-column
        show-overflow-tooltip
        :label="$t('schedules.ins_status')"
        :min-width="'150'"
      >
        <template slot-scope="scope">
          <div class="schedule-type-header">
            <i
              v-if="checkStatus(scope.row) === 'success'"
              class="el-ksd-icon-right_fill_16 content-icon success"
            ></i>
            <i
              v-else-if="checkStatus(scope.row) === 'failure'"
              class="el-ksd-icon-wrong_fill_22 content-icon failure"
            ></i>
            <i
              v-else-if="checkStatus(scope.row) === 'running_execution'"
              class="el-ksd-icon-loading_22 content-icon running_execution"
            ></i>
            <i v-else class="el-ksd-icon-time_16 content-icon pending"></i>
            <span>{{ $t(`schedules.${checkStatus(scope.row)}`) }}</span>
            <a
              v-if="checkStatus(scope.row) === 'failure'"
              class="view-detail hasEvent"
              @click="handleViewDetail(scope.row)"
            >
              {{ $t('schedules.viewDetail') }}
            </a>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        sortable
        show-overflow-tooltip
        :prop="'start_time'"
        :label="$t('schedules.ins_schTime')"
        :min-width="'200'"
      ></el-table-column>
      <el-table-column
        show-overflow-tooltip
        :prop="'owner'"
        :min-width="'80'"
        :label="$t('schedules.ins_executeUser')"
      ></el-table-column>
    </el-table>
    <div class="text-center pt-15">
      <el-pagination
        :total="instanceList.length"
        :current-page="pagination.pageIndex"
        :page-sizes="[10, 15, 20, 50]"
        :page-size="pagination.pageSize"
        :layout="'total, sizes, prev, pager, next, jumper'"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>
  </section>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapActions } from 'vuex'
import { cloneDeep } from 'lodash'
import moment from 'moment'

@Component({
  methods: {
    ...mapActions({
      getInstanceList: 'GET_INSTANCE_LIST',
      getInstanceById: 'GET_INSTANCE_BY_ID'
    }),
    ...mapActions('FailureDetailModal', {
      callAddScheduleModal: 'CALL_MODAL'
    })
  }
})
export default class Instance extends Vue {
  /** search params */
  keyword = ''

  /** table params */
  loading = false
  taskType = []
  tableData = []
  defaultSort = {
    prop: '',
    order: ''
  }
  sortParam = {
    prop: '',
    order: ''
  }

  params = {}

  /** pagination params */
  pagination = {
    pageIndex: 1,
    pageSize: 20
  }

  /** full data */
  instanceList = []

  /** methods */
  filterSchedules () {
    this.startLoading()
    const { pageIndex, pageSize } = this.pagination
    const { prop, order } = this.sortParam
    this.tableData = this.instanceList
      .map(ins => ({
        ...ins,
        start_time: moment(moment.utc(ins.start_time).format()).format(
          'YYYY-MM-DD HH:mm:ss'
        ),
        end_time: moment(moment.utc(ins.end_time).format()).format(
          'YYYY-MM-DD HH:mm:ss'
        )
      }))
      .sort((a, b) => {
        if (prop && order === 'ascending') {
          return new Date(a[prop]) - new Date(b[prop])
        } else if (prop && order === 'descending') {
          return new Date(b[prop]) - new Date(a[prop])
        } else {
          return 0
        }
      })
      .slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
    this.stopLoading()
  }

  @Watch('keyword')
  keywordChanged () {
    this.resetPageIndex()
    this.filterSchedules()
  }

  async queryInstance () {
    this.startLoading()
    try {
      const res = await this.getInstanceList()
      // const res = await this.getInstanceById(this.params.id)
      this.instanceList = cloneDeep(res.data)
      this.filterSchedules()
    } finally {
      this.stopLoading()
    }
  }

  handleViewInstance ({ id }) {
    this.$router.push({ name: 'instance', params: { id } })
  }

  checkStatus ({ state }) {
    if (['SUCCESS', 'FAILURE', 'RUNNING_EXECUTION'].includes(state)) {
      return state.toLowerCase()
    } else {
      return 'pending'
    }
  }

  async handleViewDetail ({ id }) {
    let failureDetailList = {}
    try {
      const res = await this.getInstanceById(id)
      failureDetailList = res.data
    } catch (err) {
      console.log(err)
    } finally {
      this.callAddScheduleModal(failureDetailList)
    }
  }

  /**
   * @description:
   * @param {*} row
   * @param {*} key
   * @param {*} reverse reverse the results
   * @return {*} locale key
   * @Date: 2022-01-26 14:44:57
   */
  getIntlKey (row, key, reverse) {
    let result = 'schedules.'
    if (key === 'release_state' && reverse) {
      return row[key] === 'ONLINE' ? `${result}offline` : `${result}online`
    } else {
      return `schedules.${row[key].toLowerCase()}`
    }
  }

  handleSortChange ({ prop, order }) {
    this.sortParam = {
      prop,
      order
    }
    this.resetPageIndex()
  }

  handleFilterChange ({ release_type }) {
    this.releaseTypeFilters = release_type
    this.resetPageIndex()
    this.filterSchedules()
  }

  handleSizeChange (pageSize) {
    this.pagination.pageSize = pageSize
    this.resetPageIndex()
    this.filterSchedules()
  }

  handleCurrentChange (pageIndex) {
    this.pagination.pageIndex = pageIndex
    this.filterSchedules()
  }

  resetPageIndex () {
    this.pagination.pageIndex = 1
  }

  startLoading () {
    this.loading = true
  }

  stopLoading () {
    this.loading = false
  }

  mounted () {
    this.params = this.$route.params
    this.queryInstance()
  }
}
</script>

<style lang="scss">
@import '../../../assets/css/variable.scss';
.instance-page {
  .page-inner-header {
    display: flex;
    align-items: center;
    & > span {
      margin-left: 10px;
    }
  }
  .schedule-type-header {
    display: flex;
    align-items: center;
    .view-detail {
      margin-left: 10px;
    }
    .content-icon {
      margin-right: 10px;
      font-size: 20px;
      &.success {
        color: $--color-success;
      }
      &.failure {
        color: $--color-danger;
      }
      &.running_execution {
        color: $pattern-blue-500;
        animation: rotateSetting 1s linear infinite;
        -webkit-animation: rotateSetting 1s linear infinite; // Chrome && safari
        -moz-animation: rotateSetting 1s linear infinite; // Firefox
        -o-animation: rotateSetting 1s linear infinite; // Opera
        -ms-animation: rotateSetting 1s linear infinite; // IE 9
      }
      @keyframes rotateSetting {
        0% {
          transform: rotateZ(0deg);
        }
        25% {
          transform: rotateZ(90deg);
        }
        50% {
          transform: rotateZ(180deg);
        }
        75% {
          transform: rotateZ(270deg);
        }
        100% {
          transform: rotateZ(360deg);
        }
      }
    }
    .icon-btn {
      margin-right: 7px;
      font-size: 22px;
    }
  }
  .el-table__column-filter-trigger {
    display: none;
  }
}
.schedules-action-dropdown {
  display: flex;
  align-items: center;
  width: 120px;
  &.schedule-delete {
    color: $--color-danger;
  }
}
</style>
