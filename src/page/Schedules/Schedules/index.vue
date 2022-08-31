<template>
  <section class="schedules-page page-outer-padding">
    <div class="page-inner-header">{{ $t('schedules.title') }}</div>
    <div class="btns-search">
      <el-input
        prefix-icon="el-ksd-icon-search_22"
        style="width: 248px"
        :placeholder="$t('schedules.filterHolder')"
        v-model="keyword"
      />
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
        :prop="'name'"
        :label="$t('schedules.name')"
        :min-width="'150'"
      >
        <template slot-scope="scope">
          <a href="javascript:;" @click="handleViewInstance(scope.row)">{{scope.row.name}}</a>
        </template>
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        :label="$t('schedules.status')"
        :min-width="'80'"
      >
        <template slot-scope="scope">
          <div class="schedule-type-header">
            <i
              class="el-ksd-icon-state_16 content-icon"
              :class="isOnline(scope.row) ? 'online' : 'offline'"
            ></i>
            <span>{{ $t(getIntlKey(scope.row, 'release_state')) }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        sortable
        show-overflow-tooltip
        :prop="'create_time'"
        :label="$t('schedules.createTime')"
        :min-width="'200'"
      ></el-table-column>
      <el-table-column
        sortable
        show-overflow-tooltip
        :prop="'update_time'"
        :label="$t('schedules.updateTime')"
        :min-width="'200'"
      ></el-table-column>
      <el-table-column
        show-overflow-tooltip
        :prop="'description'"
        :min-width="'180'"
      >
        <template slot="header">
          <div class="schedule-type-header">
            <span>{{ $t('schedules.scheduleDesc') }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('schedules.action')" :min-width="'100'">
        <template slot-scope="scope">
          <div class="schedule-type-header">
            <el-tooltip placement="top" :content="$t('schedules.settings')">
              <i
                class="el-ksd-icon-setting_22 icon-btn hasEvent"
                :class="{ 'setting-disabled': isOnline(scope.row) }"
                @click="handleSettings(scope.row)"
              ></i>
            </el-tooltip>
            <el-tooltip
              v-if="isOnline(scope.row)"
              placement="top"
              :content="$t(getIntlKey(scope.row, 'release_state', true))"
            >
              <i
                class="el-ksd-icon-arrow_down_with_border_22 icon-btn hasEvent"
                @click="handleToggle(scope.row, 'offline')"
              ></i>
            </el-tooltip>
            <el-tooltip
              v-else
              placement="top"
              :content="$t(getIntlKey(scope.row, 'release_state', true))"
            >
              <i
                class="el-ksd-icon-arrow_up_with_border_22 icon-btn hasEvent"
                @click="handleToggle(scope.row, 'online')"
              ></i>
            </el-tooltip>
            <el-tooltip placement="top" :content="$t('schedules.more')">
              <el-dropdown trigger="click">
                <span>
                  <i class="el-ksd-icon-more_16 icon-btn hasEvent"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :disabled="!isOnline(scope.row)">
                    <div
                      class="schedules-action-dropdown"
                      @click="handleRun(scope.row.id)"
                    >
                      <i class="el-ksd-icon-play_outline_16 icon-btn"></i>
                      {{ $t('run') }}
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item :disabled="isOnline(scope.row)">
                    <div
                      class="schedules-action-dropdown"
                      :class="{ 'schedule-delete': !isOnline(scope.row) }"
                      @click="confirmDelete(scope.row)"
                    >
                      <i class="el-ksd-icon-delete_16 icon-btn"></i>
                      {{ $t('delete') }}
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <div
                      class="schedules-action-dropdown"
                      @click="viewDAG(scope.row)"
                    >
                      <i class="el-ksd-icon-notbook_16 icon-btn"></i>
                      {{ $t('schedules.viewDAG') }}
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="text-center pt-15">
      <el-pagination
        :total="schedulesList.length"
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
import { mapActions, mapState } from 'vuex'
import { debounce, cloneDeep } from 'lodash'
import moment from 'moment'

@Component({
  computed: {
    ...mapState({
      is_scheduler_enabled: state => state.global.is_scheduler_enabled
    })
  },
  methods: {
    ...mapActions({
      getSchedulesList: 'GET_SCHEDULE_LIST',
      runSchedule: 'RUN_SCHEDULE',
      deleteSchedule: 'DELETE_SCHEDULE',
      toggleSchedule: 'TOGGLE_SCHEDULE'
    }),
    ...mapActions('SetScheduleModal', {
      callAddScheduleModal: 'CALL_MODAL'
    })
  }
})
export default class Schedules extends Vue {
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

  /** pagination params */
  pagination = {
    pageIndex: 1,
    pageSize: 20
  }

  /** full data */
  schedulesList = []

  /** status */
  isToggling = false

  /** methods */
  filterSchedules = debounce(function () {
    this.startLoading()
    const { pageIndex, pageSize } = this.pagination
    const { prop, order } = this.sortParam
    this.tableData = this.schedulesList
      // data format
      .map(sch => ({
        ...sch,
        create_time: moment(sch.create_time).format('YYYY-MM-DD HH:mm:ss'),
        update_time: moment(sch.update_time).format('YYYY-MM-DD HH:mm:ss'),
        release_type: sch.release_type || 'ETL'
      }))
      // data sort
      .sort((a, b) => {
        if (prop && order === 'ascending') {
          return new Date(a[prop]) - new Date(b[prop])
        } else if (prop && order === 'descending') {
          return new Date(b[prop]) - new Date(a[prop])
        } else {
          return 0
        }
      })
      // data filter
      .filter(sch => {
        const matchKeyword =
          sch.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1
        return matchKeyword
      })
      .slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
    this.stopLoading()
  }, 200)

  @Watch('keyword')
  keywordChanged () {
    this.resetPageIndex()
    this.filterSchedules()
  }

  async querySchedules () {
    if (!this.is_scheduler_enabled) {
      return
    }
    this.startLoading()
    try {
      const res = await this.getSchedulesList()
      this.schedulesList = cloneDeep(res.data)
      this.filterSchedules()
    } finally {
      this.stopLoading()
    }
  }

  viewDAG ({ id }) {
    this.$router.push({ name: 'dag', params: { id } })
  }

  async handleRun (id) {
    try {
      await this.runSchedule(id)
      this.$message.success(this.$t('schedules.runScheduleSuccess'))
    } catch (err) {
      console.log(err)
    }
  }

  confirmDelete ({ id }) {
    this.$confirm(
      this.$t('schedules.confirmDeleteschedule'),
      this.$t('schedules.deleteTitle'),
      {
        confirmButtonText: this.$t('delete'),
        cancelButtonText: this.$t('cancel'),
        confirmButtonClass: 'el-button--danger',
        type: 'warning',
        customClass: 'centerButton'
      }
    ).then(async () => {
      await this.deleteSchedule(id)
      await this.querySchedules()
    })
  }

  async handleSettings (row) {
    if (row.release_state === 'ONLINE') return
    try {
      const { isSubmit } = await this.callAddScheduleModal(row)
      if (isSubmit) {
        this.querySchedules()
      }
    } catch (err) {
      console.log(err)
    }
  }

  handleViewInstance ({ id }) {
    this.$router.push({ name: 'instance', params: { id } })
  }

  async handleToggle (row, release_state) {
    if (this.isToggling) {
      return
    }
    this.isToggling = true
    try {
      await this.toggleSchedule({ ...row, release_state })
    } catch (err) {
      console.log(err)
    } finally {
      this.querySchedules()
      this.isToggling = false
    }
  }

  isOnline ({ release_state }) {
    return release_state === 'ONLINE'
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
    this.querySchedules()
  }
}
</script>

<style lang="scss">

.schedules-page {
  .btns-search {
    margin: 10px 0;
    display: flex;
    justify-content: flex-end;
    line-height: 34px;
  }
  .schedule-type-header {
    display: flex;
    align-items: center;
    .content-icon {
      margin-right: 10px;
      font-size: 10px;
      &.online {
        color: $--color-success;
      }
      &.offline {
        color: $--color-text-placeholder;
      }
    }
    .icon-btn {
      margin-right: 7px;
      font-size: 22px;
    }
    .setting-disabled {
      color: $--border-color-base;
      cursor: not-allowed;
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
