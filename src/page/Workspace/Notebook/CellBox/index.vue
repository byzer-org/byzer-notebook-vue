
<template>
  <div class="cell-box" @mouseenter="showAddCode=true" @mouseleave="showAddCode=false" >
    <div :ref="'cellBtn' + cellId" class="cell-box-add-left" :style="{'display': showAddCode ? 'block' : 'none'}">
      <el-button type="text" size="medium" icon="el-ksd-icon-grab_dots_22" :disabled="isRunningAll" class="move-cell"></el-button><br />
      <el-button type="text" size="medium" icon="el-ksd-icon-add_22" @click="handleAddBelow"></el-button>
    </div>
    <div class="cell-box-container" :class="{'active': isActive, 'is-md-cell': editType === 'Markdown'}" v-if="showCode">
      <!-- Code编辑器 & log -->
      <span v-if="editType === 'MLSQL' || editType === 'Python'">
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
      </span>
      <div class="cell-btns" :ref="'cellHover' + cellId">
        <ActionButton :actions="actions" />
      </div>
      <span v-if="editType === 'MLSQL' || editType === 'Python'">
        <div class="excute-result" v-if="status !== 'NEW'">
          <el-tabs v-model="activeTab" class="tabs_button">
            <el-tab-pane label="Result" name="result">
              <ExcuteResult :result="excuteResult" :status="status" />
            </el-tab-pane>
            <el-tab-pane label="Job Details" name="details">
              <ExcuteDetail :result="excuteResult" :jobId="jobId"/>
            </el-tab-pane>
            <el-tab-pane label="Log Message" name="logs">
              <LogMessage :result="excuteResult" v-if="jobId" :status="status" :jobId="jobId"/>
            </el-tab-pane>
          </el-tabs>
        </div>
      </span>
      <!-- markdown编辑器 -->
      <CodeMarkdownEditor
        v-else-if="editType === 'Markdown'"
        :cellId="cellId"
        :readOnly="mode !== 'edit'"
        :ref="'cellEditor' + cellId"
        :value="content"
        :mode="mode"
        :isSelected="selectCell.id === cellId"
        @changeContent="changeContent"
      />
    </div>
    <div class="cell-box-container" v-else>
      <div class="cell-btns hide-mode" :ref="'cellHover' + cellId">
        <ActionButton :actions="actions" />
      </div>
      <CollapseCode :value="content" @toggleShowCode="toggleShowCode" />
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
import { mapActions } from 'vuex'
import { JOB_STATUS, MarkdownTag } from '@/config'

export default {
  props: ['cellInfo', 'selectCell', 'disableDelete', 'isRunningAll', 'currentNotebook', 'mode', 'cellId', 'newCellList'],
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
      editType: this.cellInfo.editType || 'MLSQL' // 编辑器类型
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
    if (this.cellInfo.job_id) { // cell cell 状态获取
      this.getStatus(this.cellInfo.job_id)
    }
  },
  computed: {
    actions () {
      return [
        { disabled: this.isRunningAll, isShow: this.status !== 'RUNNING', label: this.$t('common.run'), iconClass: 'el-ksd-icon-play_outline_22', handler: this.handleRun },
        { disabled: this.isRunningAll, isShow: this.status === 'RUNNING', label: this.$t('common.stop'), iconClass: 'el-ksd-icon-stop_with_border_22', handler: this.handleStop },
        { disabled: this.isRunningAll, isShow: !this.showCode, label: this.$t('notebook.showCode'), iconClass: 'el-ksd-icon-arrow_down_2_22', handler: this.toggleShowCode },
        { disabled: this.isRunningAll, isShow: this.showCode, label: this.$t('notebook.hideCode'), iconClass: 'el-ksd-icon-arrow_up_2_22', handler: this.toggleShowCode },
        { disabled: this.isRunningAll, isShow: true, label: this.$t('notebook.addAbove'), iconClass: '', handler: this.handleAddAbove },
        { disabled: this.isRunningAll, isShow: true, label: this.$t('notebook.addBelow'), iconClass: '', handler: this.handleAddBelow },
        { disabled: this.isRunningAll || this.disableDelete, isShow: true, label: this.$t('notebook.deleteCell'), iconClass: '', type: 'delete', handler: this.handleDelete }
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
        this.editType = this.cellInfo.editType || 'MLSQL'
        if (!newVal.job_id) {
          this.excuteResult = {}
          this.status = 'NEW'
          this.jobId = ''
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    ...mapActions({
      excuteCell: 'HANDLE_EXCUTE_CELL',
      getJobStatus: 'GET_JOB_STATUS',
      cancelExcuteCell: 'CANCEL_EXCUTE_CELL'
    }),
    changeStatus (status) {
      this.status = JOB_STATUS[status]
      this.$emit('changeStatus', this.status)
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
        const res = await this.excuteCell(params)
        this.jobId = res.data.job_id
        this.getStatus(this.jobId)
      } catch (err) {
        this.excuteResult = err.data
        this.loading = false
        this.changeStatus('-1')
      }
    },
    async handleStop () {
      this.$emit('handleSave')
      this.$confirm(this.$t('notebook.discardJobText'), this.$t('notebook.discardTitle'), {
          confirmButtonText: this.$t('common.discard'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'warning',
          centerButton: true
      }).then(() => {
        this.confirmStopJob()
      })
    },
    async confirmStopJob () {
      window.clearTimeout(this.timer)
      try {
        await this.cancelExcuteCell(this.jobId)
        this.getStatus(this.jobId)
      } catch (err) {
        this.loading = false
        this.pollingData(this.jobId)
      }
    },
    async getStatus (id) {
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
        this.changeStatus(status)
        if (['1', '2', '3'].includes(status)) {
          this.activeTab = 'result'
        } else {
          this.loading = true
          this.pollingData(job_id)
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
    toggleShowCode () {
      this.showCode = !this.showCode
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
@import '../../../../assets/css/variables.scss';
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
    border: 1px solid $--border-secondary;
    &:hover {
      box-shadow: 0px 1px 4px rgba(63, 89, 128, 0.16);
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
      height: 30px;
      padding: 4px 5px;
      padding-top: 0;
      display: none;
      background-color: transparent;
      position: absolute;
      right: 8px;
      top: 12px;
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
