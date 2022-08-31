<template>
  <section class="instance-page page-outer-padding">
    <div class="page-inner-header">
      <i
        class="el-ksd-icon-arrow_left_L_22 hasEvent"
        @click="back"
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
        :min-width="'200'"
      ></el-table-column>
      <el-table-column
        sortable
        show-overflow-tooltip
        :prop="'start_time'"
        :label="$t('schedules.ins_schTime')"
        :min-width="'225'"
      ></el-table-column>
      <el-table-column
        show-overflow-tooltip
        :prop="'duration'"
        :label="$t('schedules.ins_duration')"
        :min-width="'100'"
      ></el-table-column>
      <el-table-column
        show-overflow-tooltip
        :prop="'owner'"
        :min-width="'110'"
        :label="$t('schedules.ins_executeUser')"
      ></el-table-column>
      <el-table-column
        show-overflow-tooltip
        :label="$t('schedules.ins_status')"
        :min-width="'180'"
      >
        <template slot-scope="scope">
          <div class="schedule-type-header">
            <!-- Running -->
            <i
              v-if="checkScope(['0'], scope.row.state)"
              class="el-ksd-icon-loading_22 content-icon running_execution rotating"
            ></i>
            <!-- Pausing -->
            <i
              v-else-if="checkScope(['1'], scope.row.state)"
              class="el-ksd-icon-loading_22 content-icon running_execution rotating"
            ></i>
            <!-- Paused -->
            <i
              v-else-if="checkScope(['2'], scope.row.state)"
              class="el-ksd-icon-pause_22 content-icon pause"
            ></i>
            <!-- Stopping -->
            <i
              v-else-if="checkScope(['3'], scope.row.state)"
              class="el-ksd-icon-loading_22 content-icon running_execution rotating"
            ></i>
            <!-- Stopped -->
            <i
              v-else-if="checkScope(['4', '7'], scope.row.state)"
              class="el-ksd-icon-discarded_22 content-icon stop"
            ></i>
            <!-- Success -->
            <i
              v-else-if="checkScope(['6'], scope.row.state)"
              class="el-ksd-icon-right_fill_16 content-icon success"
            ></i>
            <!-- Error -->
            <i
              v-else-if="checkScope(['5'], scope.row.state)"
              class="el-ksd-icon-wrong_fill_22 content-icon failure"
            ></i>
            <!-- waiting -->
            <i
              v-else-if="checkScope(['8', '9', '10'], scope.row.state)"
              class="el-ksd-icon-time_16 content-icon waiting"
            ></i>
            <!-- else Pending -->
            <i v-else class="el-ksd-icon-time_16 content-icon waiting"></i>
            <span>{{ $t(`schedules.${ checkStatus(scope.row) }`) }}</span>
            <a
              v-if="checkScope(['5'], scope.row.state)"
              class="view-detail hasEvent"
              @click="handleViewDetail(scope.row)"
            >
              {{ $t('schedules.viewDetail') }}
            </a>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('schedules.action')" :min-width="'100'">
        <template slot-scope="scope">
          <div class="schedule-type-header">
            <!-- pause -->
            <el-tooltip
              placement="top"
              :content="$t('schedules.action_pause')">
              <i
                v-if="!checkScope(['2', '5'], scope.row.state)"
                class="el-ksd-icon-pause_with_border_22 content-icon hasEvent"
                :class="{ 'setting-disabled': !checkScope(['0'], scope.row.state) }"
                @click="handleAction(scope.row, 0, ['0'])"
              ></i>
            </el-tooltip>
            <!-- resume -->
            <el-tooltip
              placement="top"
              :content="$t('schedules.action_run')">
              <i
                v-if="checkScope(['2', '5'], scope.row.state)"
                class="el-ksd-icon-play_outline_22 content-icon hasEvent"
                @click="handleAction(scope.row, 1)"
              ></i>
            </el-tooltip>
            <!-- stop -->
            <el-tooltip
              placement="top"
              :content="$t('schedules.action_stop')">
              <i
                class="el-ksd-icon-stop_with_border_22 content-icon hasEvent"
                :class="{ 'setting-disabled': !checkScope(['0', '8', '9', '10'], scope.row.state) }"
                @click="handleAction(scope.row, 2, ['0', '8', '9', '10'])"
              ></i>
            </el-tooltip>
            <!-- repeat running -->
            <el-tooltip
              placement="top"
              :content="$t('schedules.action_rerun')">
              <i
                class="el-ksd-icon-resure_22 content-icon hasEvent"
                :class="{ 'setting-disabled': !checkScope(['2', '5'], scope.row.state) }"
                @click="handleAction(scope.row, 3, ['2', '5'])"
              ></i>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
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
import { ACTION_OF_STATE, INSTANCE_STATE, INSTANCE_STATE_MAP } from '../../../config'
import { actionsTypes } from '../../../store'
import axios from 'axios'

@Component({
  methods: {
    ...mapActions({
      getInstanceList: actionsTypes.GET_INSTANCE_LIST,
      getInstance: actionsTypes.GET_INSTANCE,
      getInstanceById: actionsTypes.GET_INSTANCE_BY_ID,
      setInstanceState: actionsTypes.SET_INSTANCE_STATE,
      getNotebookById: actionsTypes.GET_NOTEBOOK_BY_ID
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

  /** initial loading */
  isInit = true

  /** polling */
  timer = null

  cancelSearch = ''

  /** methods */
  filterInstance () {
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
    this.filterInstance()
  }

  back () {
    this.$router.push({ name: 'schedulesHome' })
  }

  queryInstance () {
    this.pollingData()
    this.startLoading()
    const CancelToken = axios.CancelToken
    axios({
      method: 'get',
      url: `/api/schedule/task/instance?task_id=${this.params.id}`,
      cancelToken: new CancelToken(c => {
        this.cancelSearch = c
      })
    }).then(res => {
      this.instanceList = cloneDeep(res.data?.data || [])
    }).catch(err => {
      console.log(err)
    }).finally (() => {
      this.cancelSearch = ''
      this.filterInstance()
      this.stopLoading()
      this.pollingData()
    })
  }

  /**
   * @description: 判断是否在给定的 dolphin 状态中
   * @param {*} list state list Array<String>
   * @param {*} state
   * @return {*} boolean
   * @Date: 2022-03-17 10:35:41
   */
  checkScope (list = [], state) {
    return list.map(i => INSTANCE_STATE[i]).includes(state)
  }

  handleViewInstance ({ id }) {
    this.$router.push({ name: 'instance', params: { id } })
  }

  /**
   * @description: 
   * @param {*} id
   * @param {*} state
   * @param {*} index
   * @Date: 2022-03-17 10:58:13
   */
  async handleAction ({ id, state }, index, scopeList = []) {
    if (scopeList.length > 0 && !this.checkScope(scopeList, state)) {
      return
    }
    if (this.cancelSearch) {
      this.cancelSearch('cancel')
      this.cancelSearch = ''
    }
    this.pollingData()
    try {
      this.startLoading()
      await this.setInstanceState({ id, status: ACTION_OF_STATE[state][index] })
      // dolphin 切换状态有延迟，延迟 500 ms 再刷新列表
      setTimeout(async () => {
        await this.getInstanceState({ id, state })
      }, 500)
    } catch (err) {
      console.log(err)
    } finally {
      this.pollingData()
    }
  }

  async getInstanceState ({ id, state }) {
    try {
      const res = await this.getInstance(id)
      if (res.data) {
        if (res.data === state) {
          await this.getInstanceState({ id, state })
        } else {
          this.instanceList = this.instanceList.map(i => {
            if (i.id === id) {
              i.state = res.data
            }
            return i
          })
        }
      }
    } catch (err) {
      console.log(err)
    } finally {
      this.filterInstance()
    }
  }

  checkStatus ({ state }) {
    return INSTANCE_STATE_MAP[state] ? INSTANCE_STATE_MAP[state] : INSTANCE_STATE_MAP[INSTANCE_STATE['8']]
  }

  async handleViewDetail ({ id }) {
    let failureDetail = {}
    try {
      const res = await this.getInstanceById(id)
      failureDetail = res.data.find(i => this.checkScope(['5'], i.state))
      const notebookInfo = await this.getNotebookById({id: failureDetail?.entity?.entity_id})
      failureDetail.notebook = notebookInfo?.data
    } catch (err) {
      console.log(err)
    } finally {
      this.callAddScheduleModal(failureDetail)
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
    this.filterInstance()
  }

  handleSizeChange (pageSize) {
    this.pagination.pageSize = pageSize
    this.resetPageIndex()
    this.filterInstance()
  }

  handleCurrentChange (pageIndex) {
    this.pagination.pageIndex = pageIndex
    this.filterInstance()
  }

  resetPageIndex () {
    this.pagination.pageIndex = 1
  }

  pollingData () {
    if (this && this._isDestroyed) {
      return
    }
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    } else {
      this.timer = setInterval(() => {
        this.queryInstance()
      }, 5000)
    }
  }

  startLoading () {
    if (this.isInit) {
      this.loading = true
      this.isInit = false
    }
  }

  stopLoading () {
    this.loading = false
  }

  mounted () {
    this.params = this.$route.params
    this.queryInstance()
    this.pollingData()
  }

  beforeDestroy () {
    if (this.cancelSearch) {
      this.cancelSearch('cancel')
    }
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>

<style lang="scss">

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
      margin-left: 60px;
    }
    .content-icon {
      margin-right: 10px;
      font-size: 20px;
      &.success {
        color: $pattern-green-700;
      }
      &.failure {
        color: $--color-danger;
      }
      &.running_execution {
        color: $pattern-blue-500;
      }
      &.rotating {
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
      &.pause {
        color: $--color-primary;
      }
    }
    .setting-disabled {
      color: $--border-color-base;
      cursor: not-allowed;
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
