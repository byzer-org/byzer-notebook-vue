
<template>
  <div class="cell-box" @dblclick="dbClickCollapseCell" @mouseenter="showAddCode=true" @mouseleave="showAddCode=false" >
    <div :ref="'cellBtn' + cellId" class="cell-box-add-left" :style="{'display': showAddCode && !isDemo ? 'block' : 'none'}">
      <div><icon-btn icon="el-ksd-icon-grab_dots_16" class="move-cell" :disabled="isRunningAll" /></div>
      <div class="mt-5"><icon-btn icon="el-ksd-icon-add_22" :handler="handleAddBelow" /></div>
    </div>
    <div class="cell-box-container" :class="{'active': isActive, 'is-md-cell': editType === 'Markdown'}" v-if="showCode">
      <!-- Code编辑器 & log -->
      <div v-if="editType === 'Byzer-lang' || editType === 'Python'">
        <div class="mock-editor" :class="!(mode === 'edit' && selectCell.id === cellId) && 'preview'"><div class="mock-editor-gutter"></div><div class="mock-editor-content"></div></div>
        <CodeEditor
          @changeMode="changeMode"
          :cellId="cellId"
          :readOnly="mode !== 'edit'"
          :ref="'cellEditor' + cellId"
          :value="content"
          :editType="editType"
          :newCellList="newCellList"
          @changeContent="changeContent"
          @gotoNextCell="gotoNextCell"
          :isSelected="selectCell.id===cellId"
        />
      </div>
      <div class="cell-btns" :ref="'cellHover' + cellId">
        <ActionButton :actions="actions" />
      </div>
      <div v-if="editType === 'Byzer-lang' || editType === 'Python'">
        <div class="excute-result" v-if="status !== 'NEW' || loadingExcute" v-loading="loadingExcute">
          <el-tabs v-model="activeTab" class="tabs_button">
            <el-tab-pane label="Result" name="result">
              <ExcuteResult :result="excuteResult" :status="status" :innerMaxHeight="innerMaxHeight" />
            </el-tab-pane>
            <el-tab-pane label="Job Details" name="details">
              <ExcuteDetail :result="excuteResult" :jobId="jobId" :innerMaxHeight="innerMaxHeight" />
            </el-tab-pane>
            <el-tab-pane label="Log Message" name="logs">
              <LogMessage
                v-if="jobId"
                :isDemo="isDemo"
                :cellId="cellId"
                :currentNotebook="currentNotebook"
                :result="excuteResult"
                :status="status"
                :jobId="jobId"
                :innerMaxHeight="innerMaxHeight"
              />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <!-- markdown编辑器 -->
      <template v-else-if="editType === 'Markdown'">
        <CodeMarkdownEditor
          :cellId="cellId"
          :ref="'cellEditor' + cellId"
          :value="content"
          :mode="mode"
          :isSelected="selectCell.id === cellId"
          @changeContent="changeContent"
          @changeMdMode="changeMdMode"
        />
      </template>
    </div>
    <div class="cell-box-container" :class="{'active': isActive}" v-else>
      <div class="cell-btns hide-mode" :ref="'cellHover' + cellId">
        <ActionButton :actions="actions" />
      </div>
      <CollapseCode :type="editType" :value="content" :status="status" @toggleShowCode="toggleShowCode" />
    </div>
  </div>
</template>
<script>
import CodeEditor from '@/components/CodeEditor'
import CodeMarkdownEditor from '@/components/CodeMarkdownEditor'
import ActionButton from '../ActionButton'
import ExcuteResult from '../ExcuteResult'
import CollapseCode from '../CollapseCode'
import ExcuteDetail from '../ExcuteDetail'
import LogMessage from '../LogMessage'
import { mapMutations, mapActions, mapGetters, mapState } from 'vuex'
import { JOB_STATUS, MarkdownTag } from '@/config'

export default {
  props: ['cellInfo', 'selectCell', 'disableDelete', 'isRunningAll', 'currentNotebook', 'mode', 'cellId', 'newCellList', 'showAllCell'],
  data () {
    return {
      message: '',
      showCode: true,
      status: 'NEW',
      excuteResult: {},
      content: this.cellInfo.content,
      loading: false,
      timer: null,
      jobId: '',
      activeTab: 'details',
      showExcuteDetails: true,
      startTime: 0,
      showAddCode: false,
      editType: this.cellInfo.editType || 'Byzer-lang', // 编辑器类型
      mdMode: 'preview',
      innerMaxHeight: '',
      loadingExcute: false
    }
  },
  components: {
    CodeEditor,
    CodeMarkdownEditor,
    ActionButton,
    ExcuteResult,
    CollapseCode,
    ExcuteDetail,
    LogMessage
  },
  created () {
    this.calInnerMaxHeight()
  },
  computed: {
    ...mapState({
      resultList: state => state.notebook.resultList,
      activeNotebook: state => state.notebook.activeNotebook
    }),
    ...mapGetters(['isDemo']),
    actions () {
      return [
        { disabled: this.isRunningAll, isShow: this.status !== 'RUNNING' && !this.isDemo, label: this.$t('run'), iconClass: 'el-ksd-icon-play_outline_22', handler: this.handleRun },
        { disabled: this.isRunningAll, isShow: this.status === 'RUNNING' && !this.isDemo, label: this.$t('stop'), iconClass: 'el-ksd-icon-stop_with_border_22', handler: this.handleStop },
        { disabled: this.isRunningAll, isShow: this.status !== 'RUNNING' && !this.isDemo, label: this.$t('notebook.runToHere'), iconClass: 'el-ksd-icon-run_to_here_16', handler: this.handleRunToHere },
        // { disabled: this.isRunningAll, isShow: this.status === 'RUNNING', label: this.$t('stop'), iconClass: 'el-ksd-icon-stop_with_border_22', handler: this.handleStopToHere },
        { disabled: this.isRunningAll, isShow: !this.showCode, label: this.$t('notebook.showCode'), iconClass: 'el-ksd-icon-arrow_down_2_22', handler: this.toggleShowCode },
        { disabled: this.isRunningAll, isShow: this.showCode, label: this.$t('notebook.hideCode'), iconClass: 'el-ksd-icon-arrow_up_2_22', handler: this.toggleShowCode },
        { disabled: this.isRunningAll, isShow: !this.isDemo, label: this.$t('notebook.addAbove'), iconClass: '', handler: this.handleAddAbove },
        { disabled: this.isRunningAll, isShow: !this.isDemo, label: this.$t('notebook.addBelow'), iconClass: '', handler: this.handleAddBelow },
        { disabled: this.isRunningAll || this.disableDelete, isShow: !this.isDemo, label: this.$t('notebook.deleteCell'), iconClass: '', type: 'delete', handler: this.handleDelete }
      ]
    },
    isActive () {
      return this.cellInfo.name === this.selectCell.name && this.cellInfo.id === this.selectCell.id
    }
  },
  watch: {
    cellInfo: {
      handler (newVal) {
        this.content = this.cellInfo.content
        this.editType = this.cellInfo.editType || 'Byzer-lang'
        if (!newVal.job_id) {
          this.excuteResult = {}
          this.status = 'NEW'
          this.jobId = ''
        }
      },
      immediate: true,
      deep: true
    },
    activeNotebook: {
      handler (newVal) {
        if (this.cellInfo.job_id && newVal.uniq === this.currentNotebook.uniq && 
          (this.isDemo || !this.resultList[newVal.id] || (this.resultList[newVal.id] && !this.resultList[newVal.id].includes(this.cellId)))
        ) {
          this.getStatus(this.cellInfo.job_id)
          if (!this.isDemo) {
            this.addResult({ name: 'resultList', notebookId: newVal.id, cellId: this.cellId })
          }
        }
      },
      immediate: true,
      deep: true
    },
    showAllCell (newVal) {
      this.showCode = newVal
    }
  },
  methods: {
    ...mapActions({
      excuteCell: 'HANDLE_EXCUTE_CELL',
      getJobStatus: 'GET_JOB_STATUS',
      cancelExcuteCell: 'CANCEL_EXCUTE_CELL'
    }),
    ...mapMutations({
      addResult: 'SET_LOADED_CELL_LIST'
    }),
    changeMdMode (mode) {
      if (this.isDemo) return
      this.mdMode = mode
    },
    /**
     * @description: cal the max-height of the inner elements in px
     * @return {*} string
     * @Date: 2021-12-14 14:15:37
     */
    calInnerMaxHeight () {
      let avlHeight = 0
      if (window.innerHeight) {
        avlHeight = window.innerHeight
      } else if (document.body && document.body.clientHeight) {
        avlHeight = document.body.clientHeight
      }
      if (
        document.documentElement &&
        document.documentElement.clientHeight &&
        document.documentElement.clientWidth
      ) {
        avlHeight = document.documentElement.clientHeight
      }
      this.innerMaxHeight = Math.round(avlHeight * 0.53) + 'px'
    },
    changeStatus (status, progressStatus) {
      this.status = JOB_STATUS[status]
      this.$emit('changeStatus', this.status, progressStatus)
    },
    initData () {
      this.activeTab = 'details'
      this.changeStatus('-1')
      this.totalDuration = 0
    },
    handleRunCurrent () {
      if (this.cellInfo.id === this.selectCell.id) {
        this.handleRun()
      }
    },
    handleRunToHere () {
      this.$emit('handleRunToHere', this.cellId)
    },
    handleStopToHere () {
      this.$emit('handleStopHere')
    },
    async handleRun () {
      if (this.editType === 'Markdown') {
        // markdown
        this.changeStatus('1')
        this.loading = false
        return
      }
      this.$emit('handleSave')
      if (!this.content) {
        this.changeStatus('-1')
        return
      }
      this.initData()
      // 编辑器
      this.changeStatus('0')
      this.loading = true
      this.startTime = Date.now()
      const params = {
        sql: this.content,
        notebook: this.currentNotebook.name,
        cell_id: this.cellInfo.id
      }
      try {
        this.loadingExcute = true
        const res = await this.excuteCell(params)
        this.loadingExcute = false
        this.getStatus(res.data.job_id)
      } catch (err) {
        this.loadingExcute = false
        this.excuteResult = err.data
        this.loading = false
        this.changeStatus('-1')
      }
    },
    async handleStop () {
      this.$emit('handleSave')
      this.$confirm(this.$t('notebook.discardJobText'), this.$t('notebook.discardTitle'), {
          confirmButtonText: this.$t('discard'),
          cancelButtonText: this.$t('cancel'),
          type: 'warning',
          customClass: 'centerButton'
      }).then(() => {
        this.confirmStopJob()
      })
    },
    async confirmStopJob () {
      window.clearTimeout(this.timer)
      try {
        await this.cancelExcuteCell(this.jobId)
        this.getStatus(this.jobId, 'DISCARDED') // 传一个参数给run all/run to here 做状态提示
      } catch (err) {
        this.loading = false
        this.pollingData(this.jobId)
      }
    },
    async getStatus (id, progressStatus) {
      this.jobId = id
      this.loading = true
      if (this._isDestroyed) {
        return false
      }
      try {
        const res = await this.getJobStatus(id)
        this.loading = false
        if (this._isDestroyed) {
          return false
        }
        const { status, job_id } = res.data
        this.changeStatus(status, progressStatus)
        if (['1', '2', '3'].includes(status)) {
          this.activeTab = 'result'
        } else {
          this.loading = true
          this.pollingData(job_id, progressStatus)
        }
        this.excuteResult = res.data
      } catch (err) {
        if (this._isDestroyed) {
          return false
        }
        this.changeStatus('0')
        this.pollingData(this.jobId)
        this.loading = false
        this.excuteResult = err.data
      }
    },
    pollingData (id) {
      window.clearTimeout(this.timer)
      if (this._isDestroyed) {
        return false
      }
      this.timer = setTimeout(() => {
        this.getStatus(id)
      }, 1000);
    },
    dbClickCollapseCell () {
      if (!this.showCode) {
        this.toggleShowCode()
      }
    },
    toggleShowCode () {
      this.showCode = !this.showCode
      this.$emit('changeShowAllCell')
    },
    handleAddAbove () {
      this.$emit('handleAddCell', { type: 'above'})
    },
    handleAddBelow () {
      this.$emit('handleAddCell', { type: 'below'})
    },
    handleDelete () {
      this.$emit('handleDeleteCell', this.cellInfo)
    },
    changeContent (value) {
      let newValue = value
      this.content = newValue
      if (this.editType === 'Markdown') {
        newValue = `${MarkdownTag}${newValue}`
      }
      this.$emit('changeCellContent', {
        value: newValue,
        cellInfo: this.cellInfo,
        reserve: this.editType === 'Markdown'
      })
    },
    gotoNextCell (type) {
      this.$emit('gotoNextCell', type)
    },
    changeMode (mode) {
      this.$emit('changeMode', mode)
    }
  },
  beforeDestory () {
    window.clearTimeout(this.timer)
  }
}
</script>
<style lang="scss">

.cell-box {
  width: 100%;
  position: relative;
  padding: 0 20px;
  padding-left: 45px;
  &:hover {
    .cell-btns {
      display: block;
    }
  }
  &-add-left {
    width: 30px;
    position: absolute;
    left: 9px;
    .el-button--text {
      padding: 2px;
      i {
        font-size: 22px;
      }
    }
    .move-cell {
      cursor: move;
      &.disabled {
        cursor: auto;
      }
    }
  }
  &-container {
    position: relative;
    border-radius: 4px;
    min-height: 60px;
    padding: 8px;
    padding-left: 15px;
    border: 1px solid $--border-color-light;
    &:hover {
      box-shadow: 0px 1px 4px rgba(63, 89, 128, 0.16);
    }
    .mock-editor {
      display: flex;
      height: 19px;
      &.preview {
        .mock-editor-gutter {
          background-color: $--color-white;
        }
        .mock-editor-content {
          background-color: $--color-white;
        }
      }
      &-gutter {
        width: 60px;
        background-color: $--background-color-hover;
      }
      &-content {
        flex: 1;
        background-color: $--background-color-secondary;
      }
    }
    &.is-md-cell {
      border: none;
    }
    &.active {
      padding-left: 8px;
      border: 1px solid $--color-primary;
      border-left: 8px solid $--color-primary;
      &:hover {
        box-shadow: 0px 1px 4px rgba(63, 89, 128, 0.16);
      }
    }
    .cell-btns {
      z-index: 999;
      // height: 30px;
      padding: 4px 5px;
      padding-top: 0;
      display: none;
      background-color: transparent;
      position: absolute;
      right: 8px;
      top: 10px;
    }
    .excute-result {
      margin-top: 15px;
      .el-tabs--button > .el-tabs__header {
        padding: 0px;
        display: inline-block;
      }
    }
  }
}
</style>
