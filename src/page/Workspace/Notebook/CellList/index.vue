<template>
  <div class="cellListPage" v-loading="isLoading || isLoadingResult">
    <div class="cellListPage-header">
      <div class="cellListPage-header-btns">
        <el-dropdown class="btn" @command="handleNotebook">
          <span class="el-dropdown-link">
            <i class="el-ksd-icon-document_22 font-22"></i><i class="el-ksd-icon-arrow_down_22 font-22"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="!isDemo" command="add">{{ $t('notebook.createNotebook') }}</el-dropdown-item>
            <el-dropdown-item v-if="!isDemo" command="rename">{{ $t('rename') }}</el-dropdown-item>
            <el-dropdown-item command="clone">{{ $t('clone') }}</el-dropdown-item>
            <el-dropdown-item v-if="!isDemo" command="delete"> <span class="txt-danger">{{ $t('notebook.deleteNotebook') }}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <div class="btn" v-if="!isDemo">
          <icon-btn icon="el-ksd-icon-save_22" :disabled="isRunningAll" :text="$t('save')" :handler="() => handleSave(true)" />
        </div>
        <SetDemo
          :userInfo="userInfo"
          :activeNotebook="activeNotebook"
          @offlineTab="handleOfflineTab"
          @runAll="handleRunAll"
          @operateDemoSuccess="handleOperateDemoSuccess"
        />
        <div class="btn" v-if="!isDemo">
          <icon-btn icon="el-ksd-icon-add_22" :disabled="isRunningAll" :text="$t('notebook.addCell')" :handler="() => handleAddCell({ type: 'below' }, selectCell)" />
        </div>
        <el-dropdown class="btn divider" @command="handleChanged" v-if="!isDemo">
          <span class="drop-text hasEvent">
            {{ editType }}<i class="el-ksd-icon-arrow_down_22 font-22"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="Byzer-lang">Byzer-lang</el-dropdown-item>
            <el-dropdown-item command="Python">Python</el-dropdown-item>
            <el-dropdown-item command="Markdown">Markdown</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <div class="btn" v-if="!isDemo">
          <icon-btn v-if="selectCellStatus !== 'RUNNING' || isRunningAll" icon="el-ksd-icon-play_outline_22" :disabled="isRunningAll" :text="$t('run')" :handler="() => hanldeExcuteSelectCell('run')" />
          <icon-btn v-else icon="el-ksd-icon-stop_with_border_22" :disabled="isRunningAll" :text="$t('notebook.stop')" :handler="() => hanldeExcuteSelectCell('stop')" />
        </div>
        <div class="btn" v-if="!isDemo">
          <icon-btn icon="el-ksd-icon-fast_forward_outline_22" :disabled="isRunningAll" :text="$t('notebook.runNext')" :handler="handleRunNext" />
        </div>
        <div class="btn" v-if="!isDemo">
          <icon-btn v-if="isRunningAll" icon="el-ksd-icon-stop_with_border_22" :text="$t('notebook.cancelAll')" :handler="() => hanldeExcuteAll('stop')" />
          <icon-btn v-else icon="el-ksd-icon-play_all_outline_22" :disabled="selectCellStatus === 'RUNNING'" :text="$t('notebook.runAll')" :handler="() => hanldeExcuteAll('run')" />
        </div>
        <div class="btn" v-if="!isDemo">
          <icon-btn icon="el-ksd-icon-delete_22" :disabled="newCellList.length === 1 || isRunningAll" :text="$t('delete')" :handler="() => hanldeExcuteSelectCell('delete')" />
        </div>
        <div class="btn divider" v-if="!isDemo">
          <icon-btn icon="el-ksd-icon-clear_22" :disabled="isRunningAll" :text="$t('notebook.clearAllResult')" :handler="clearAllResult" />
        </div>
        <div class="btn" v-if="!isDemo">
          <icon-btn v-if="showAllCell" icon="el-ksd-icon-arrow_up_2_22" :text="$t('notebook.hideAllCell')" :handler="handleToggleCellShow" />
          <icon-btn v-else icon="el-ksd-icon-arrow_down_2_22" :text="$t('notebook.showAllCell')" :handler="handleToggleCellShow" />
        </div>
        <div class="btn" v-if="!isDemo">
          <icon-btn icon="el-ksd-icon-keyboard" :text="$t('notebook.shortcut')" :handler="handleShowShortcutHelp" />
        </div>
        <div class="btn right-bar" v-if="is_scheduler_enabled && !isDemo">
          <div v-if="added" class="added-to-schedule-wrap">
            <span class="add-to-schedule add-btn" @click="viewDAG">
              <i class="el-ksd-icon-confirm_22"></i>
              {{ $t('schedules.addedToSchedule') }}
            </span>
            <el-tooltip placement="top" :content="$t('schedules.updateScheduleTask')">
              <el-dropdown @command="handleCommand" trigger="click">
                <span class="add-to-schedule update-btn">
                  <svg-icon
                    class="menu-icon font-14"
                    :icon-class="'schedule_update'"
                  ></svg-icon>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="'handleUpdate'">{{ $t('schedules.updateScheduleTask') }}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </el-tooltip>
          </div>
          <span
            v-else
            class="add-to-schedule"
            @click="addToSchedule"
          >
            <i class="el-ksd-icon-add_22"></i>
            {{ $t('schedules.addToSchedule') }}
          </span>
        </div>
      </div>
      <div class="cellListPage-header-progress" v-if="showProgress">
        <el-progress :percentage="runPercentage" :show-text="runningStatus !== 'COMPLETED'" :color="progressColor" :format="progressText"></el-progress>
        <i 
          v-if="['ERROR', 'COMPLETED'].includes(runningStatus)"
          :class="[runningStatus === 'ERROR' ? 'el-ksd-icon-wrong_fill_22 txt-danger' : 'el-icon-success txt-success', runningStatus === 'COMPLETED' ? 'ml-5' : '']"></i>
      </div>
    </div>
    <div class="cellListPage-container">
      <div class="cellListPage-container-left">
        <el-alert
          v-if="isDemo"
          type="info"
          show-icon>
          <div slot="title">
            {{$t('workflow.readOnlyTip')}}
            <a
              href="javascript:;"
              @click="handleNotebook('clone')"
            >
              {{$t('workflow.clone')}}
            </a>
          </div>
        </el-alert>
        <ul
          class="cell-list"
          :ref="'dragWrapper' + currentNotebook.uniq"
          @scroll="scrollCell"
        >
          <draggable
            ref="dragInner"
            :options="draggableOptions"
            v-model="newCellList"
            @end="handleDragEnd"
            ghostClass="sortable-ghost"
            chosenClass="sortable-chosen"
            dragClass="sortable-drag"
            @change="changeMove"
            :move="moveCell"
            style="width:100%;">
            <li
              :class="showDragStyle && index === draggedIndex && 'active'"
              v-for="(cell, index) in newCellList"
              :key="cell.id"
              @click="handleSelectCell(cell)"
              :ref="'cellLi' + cell.id">
              <div class="cell-order"><div class="text">Cell {{index + 1}}</div></div>
              <cell-box
                class="editor-extra-header"
                :key="'cell_'+ cell.id"
                :isRunningAll="isRunningAll"
                :disableDelete="newCellList.length <= 1"
                :ref="'cell' + cell.id"
                :cellId="cell.id"
                :newCellList="newCellList"
                @changeCellContent="changeCellContent"
                :cellInfo="cell"
                :currentNotebook="currentNotebook"
                :selectCell="selectCell"
                @changeStatus="(status, progressStatus) => changeStatus(status, cell, progressStatus)"
                @handleAddCell="(data) => handleAddCell(data, cell)"
                @handleDeleteCell="() => handleDeleteCell(cell)"
                @handleSave="handleSave"
                @handleRunToHere="handleRunToHere"
                @handleStopHere="hanldeExcuteAll('stop')"
                :mode="isDemo ? 'command' : mode"
                @gotoNextCell="gotoNextCell"
                @changeMode="changeMode"
                :showAllCell="showAllCell"
                @changeShowAllCell="changeShowAllCell"
              />
            </li>
          </draggable>
        </ul>
      </div>
    </div>
    <ShortcutPrompt ref="shortcutPrompt" class="shortcut-wrap"></ShortcutPrompt>
    <FindAndReplace
      :replacedText="replacedText"
      ref="findAndReplace"
      :results="results"
      @handleReplace="handleReplace"
      @handleFindKeyChanged="handleFindKeyChanged"
      @handleReplaceKeyChanged="handleReplaceKeyChanged">
    </FindAndReplace>
  </div>
</template>
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import CellBox from '../CellBox'
import ShortcutPrompt from '../ShortcutPrompt'
import FindAndReplace from '../FindAndReplace'
import SetDemo from '@/components/SetDemo'
import { debounce, cloneDeep } from 'lodash'
import draggable from 'vuedraggable'
import cellCommand from './command.vue'
import { MarkdownTag } from '@/config'
import { PythonTag } from '../../../../config'
import { formatGetParams } from '../../../../util'

export default {
  name: 'cellList',
  data () {
    return {
      oldCellList: [], // 保存后作为保存的newCellList的备份,保存editType
      selectCell: {},
      newCellList: [],
      initList: [{ id: '1', content: '' }],
      someIsRunning: false,
      runningIndex: -1,
      runToIndex: -1, // index of run to here cell
      exuteType: 'run',
      isRunningAll: false,
      draggableOptions: {
        handle: '.move-cell',
        animation: 200,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost'
      },
      showTree: true,
      loadingList: false,
      loadingSave: false,
      showDragStyle: true,
      draggedIndex: -1,
      selectCellStatus: 'NEW',
      editType: '', // 当前选中cell的类型
      findKey: '',
      replaceKey: '',
      results: [], // 查找的结果
      setDemoParams: null,
      showAllCell: true,
      showProgressDuration: 3000,
      runningStatus: 'NEW'
    }
  },
  props: ['removeTabId', 'currentNotebook', 'activeNotebookId'],
  components: {
    CellBox,
    draggable,
    ShortcutPrompt,
    FindAndReplace,
    SetDemo
  },
  computed: {
    ...mapState({
      userInfo: state => state.user.userInfo,
      activeNotebook: state => state.notebook.activeNotebook,
      mode: state => state.notebook.activeNotebook.mode,
      openedNotebookList: state => state.notebook.openedNotebooks,
      is_scheduler_enabled: state => state.global.is_scheduler_enabled,
      showProgress: state => state.notebook.showProgress
    }),
    ...mapState('DAGViewModal', {
      taskInfo: state => state.taskInfo
    }),
    ...mapGetters(['isDemo']),
    disableCellAction () {
      return Object.keys(this.selectCell).length === 0 || this.newCellList.length === 1 || this.isRunningAll
    },
    disableMoveUp () {
      return this.newCellList.findIndex(v => v.id === this.selectCell.id) === 0
    },
    disableMoveDown () {
      return this.newCellList.findIndex(v => v.id === this.selectCell.id) === (this.newCellList.length - 1)
    },
    isLoading () {
      return this.loadingList || this.loadingSave
    },
    isLoadingResult () {
      return this.newCellList.some(v => v.loadingResult)
    },
    added () {
      return this.taskInfo && this.taskInfo.scheduleInfo
    },
    runPercentage () {
      const toIndex = this.runToIndex
      const curIndex = this.runningIndex
      if (toIndex === -1) {
        return 0
      } else {
        return (curIndex + 1) / (toIndex + 1) * 100
      }
    }
  },
  created () {
    if (this.currentNotebook.type === 'notebook') {
      this.reloadCellList(false, true)
    }
  },
  mounted () {
    document.addEventListener('click', this.listenFun)
  },
  destroyed () {
    document.removeEventListener('click', this.listenFun)
  },
  mixins: [cellCommand],
  watch: {
    setDemoParams: {
      async handler (newVal, oldVal) {
        if (!newVal && oldVal && oldVal.setDemo) {
          const { params, setDemo, command } = oldVal

          const res = await setDemo(params)
          if (res?.data === 'success') {
            this.$message.success(this.$t('notebook.' + command + 'Success'))
            this.handleOperateDemoSuccess()
          }
        }
      }
    },
    openedNotebookList: {
      handler () {
        this.clearUnOpenedList()
      },
      deep: true
    },
    activeNotebookId: {
      handler () {
        this.initAllData()
        if (this.activeNotebookId === this.currentNotebook?.id) {
          this.shouldGetScrollTop()
          this.changeMode('edit')
          this.bindAllKey()
          this.checkNotebook()
        } else {
          this.resetIndex()
        }
      },
      immediate: true
    },
    selectCell: {
      handler (newVal, oldValue) {
        const {id, editType} = newVal
        const {editType: oldEditType} = oldValue
        if (id) {
          this.editType = newVal.editType || ''
          if (
            editType === 'Markdown' &&
            (oldEditType === 'Byzer-lang' || oldEditType === 'Python')
          ) {
            const mdEditorInstance = this.$refs['cell' + id][0].$refs[
              'cellEditor' + id
            ]
            mdEditorInstance && (mdEditorInstance.mdMode = 'preview')
          }
          if (this.mode === 'edit') {
            this.handleCodeFocus(id)
          }
        }
      },
      deep: true
    },
    removeTabId : {
      handler (newVal) {
        if (this.isDemo) {
          return
        }
        if (newVal === this.currentNotebook.uniq) {
          this.removeLoadedCellList({
            name: 'logMessageList',
            notebookId: this.currentNotebook.id,
            cellIdList: this.newCellList.map(i => i.id)
          })
          this.removeLoadedCellList({
            name: 'resultList',
            notebookId: this.currentNotebook.id,
            cellIdList: this.newCellList.map(i => i.id)
          })
        }
      }
    }
  },
  methods: {
    ...mapMutations({
      changeNotebookMode: 'CHANGE_NOTEBOOK_MODE', // 修改notebook 模式 edit/command
      removeLoadedCellList: 'REMOVE_LOADED_CELL_LIST',
      changeRunningAll: 'CHANGE_RUN_ALL',
      changeShowProgress: 'CHANGE_SHOW_PROGRESS'
    }),
    ...mapActions('AddScheduleModal', {
      callAddScheduleModal: 'CALL_MODAL'
    }),
    ...mapActions('DAGViewModal', {
      callDAGViewModal: 'CALL_MODAL'
    }),
    ...mapMutations('DAGViewModal', {
      setTaskInfo: 'SET_TASK_INFO'
    }),
    ...mapActions('CheckActionModal', {
      callCheckActionModal: 'CALL_MODAL'
    }),
    ...mapActions({
      deleteNotebook: 'DEL_NOTEBOOK',
      saveNotebook: 'SAVE_NOTEBOOK',
      getNotebookById: 'GET_NOTEBOOK_BY_ID',
      createCell: 'CREATE_CELL',
      deleteCell: 'DELETE_CELL',
      clearResult: 'CLEAR_RESULT',
      setDemo: 'SET_DEMO',
      getNotebookInfo: 'GET_NOTEBOOK_INFO',
      updateSchedule: 'UPDATE_SCHEDULE'
    }),
    ...mapActions('CreateNoteBookModal', {
      callCreateNoteBookModal: 'CALL_MODAL'
    }),
    progressColor () {
      const statusObj = {
        'ERROR': '#CA1616',
        'DISCARDED': '#A5B2C5',
        'RUNNING': '#0875DA',
        'COMPLETED': '#49A82B'
      }
      return statusObj[this.runningStatus]
    },
    progressText () {
      const toIndex = this.runToIndex
      const curIndex = this.runningIndex
      return `${curIndex + 1}/${toIndex + 1}`
    },
    initAllData () {
      this.isRunningAll = false
      this.selectCellStatus = 'NEW'
    },
    async checkNotebook () {
      if (!this.is_scheduler_enabled) {
        return
      }
      const params = formatGetParams({
        entity_type: 'notebook',
        entity_id: this.activeNotebookId
      })
      try {
        const res = await this.getNotebookInfo(params)
        this.setTaskInfo({ taskInfo: { scheduleInfo: res.data, currentNotebook: this.currentNotebook }})
      } catch (e) {
        this.setTaskInfo({ taskInfo: undefined })
      }
    },
    /**
     * @description: 运行下一个
     * @Date: 2021-11-05 13:41:46
     */
    handleRunNext () {
      const index = this.newCellList.findIndex(
        v => v.id === this.selectCell.id
      )
      const maxIndex = this.newCellList.length - 1
      if (index !== -1 && index < maxIndex) {
        this.selectCell = this.newCellList[index + 1]
        this.scrollToSelectCell(index + 1)
      }
      this.hanldeExcuteSelectCell('run')
    },
    handleToggleCellShow () {
      this.showAllCell = !this.showAllCell
    },
    changeShowAllCell () {
      // 判断是否所有的 cell 都是 收起/展开
      const list = this.newCellList.map(v => this.$refs[`cell${v.id}`][0].showCode)
      const allShowCode = list.every(v => v)
      const allHideCode = list.every(v => !v)
      if (allShowCode) { // 所有 cell 都是展开状态
        this.showAllCell = allShowCode
      }
      if (allHideCode) { // 所有 cell 都是收起状态
        this.showAllCell = !allHideCode
      }
    },
    handleShowShortcutHelp () {
      const isShow = this.$refs.shortcutPrompt.isShow
      // 切换为command模式 打开快捷键帮助面板
      const mode = isShow ? 'edit' : 'command'
      this.changeMode(mode)
      this.$refs.shortcutPrompt.isShow = !isShow
    },
    /**
     * @description: 查找内容改变
     * @param {*} e
     * @Date: 2021-09-07 13:46:01
     */
    handleFindKeyChanged (e) {
      this.findKey = e
      const temp = []
      if (!e) {
        return
      } else {
        this.newCellList.forEach((i, cellIndex) => {
          if (i.content) {
            // 按行分割
            i.content.split('\n').forEach((it, lineIndex) => {
              if (it.indexOf(e) > -1) {
                temp.push({
                  cellIndex, // 当前是哪个cell，展示在查询结果最左侧
                  lineIndex, // 行号
                  content: it, // 当前行的文本
                  cellInfo: i // 当前cell的信息
                })
              }
            })
          }
        })
        this.results = temp
      }
    },
    /**
     * @description: 替换内容改变
     * @param {*} e
     * @return {*}
     * @Date: 2021-09-07 13:46:28
     */
    handleReplaceKeyChanged (e) {
      this.replaceKey = e
    },
    /**
     * @description: 修改content
     * @param {param} cellId + '-' + cellIndex + '-' + lineIndex + '-' + pos
     * @Date: 2021-09-07 14:38:28
     */
    doReplace (param) {
      const [cellId = '', cellIndex = '', lineIndex = '', pos = ''] = param.split('-')
      this.newCellList = this.newCellList.map((item, index) => {
        if (item.content && item.id === cellId) {
          // 按行分割
          const lineList = item.content.split('\n')
          // 按行根据param替换原文本
          lineList.forEach((it, idx, arr) => {
            if (item.id === cellId && (index + '' === cellIndex) && (idx + '' === lineIndex)) {
              arr[idx] = arr[idx].slice(0, pos) + this.replaceKey + arr[idx].slice(parseInt(pos, 10) + this.findKey.length)
            }
          })
          const node = this.$refs['cell' + item.id][0].$refs['cellEditor'+ item.id]
          if (item.editType === 'Byzer-lang' || item.editType === 'Python') {
            // ace-editor直接改content来修改文本会导致Ctrl+Z无法undo
            // 并且光标可能会重置在{column:0, row: 0}的位置
            const editor = node.$refs['codeEditor'+ cellId].editor
            const cursorPos = editor?.getCursorPosition()
            editor?.setValue(lineList.join('\n'), cursorPos)
          } else {
            // markdown可以直接修改content
            node.content = lineList.join('\n')
          }
          item.content = lineList.join('\n')
        }
        return item
      })
    },
    /**
     * @description: 替换
     * @param {param} '' || [],需要替换的一项或者全部
     * @Date: 2021-09-07 13:31:02
     */
    handleReplace (param) {
      if (!this.findKey) {
        return
      }
      const type = Object.prototype.toString.call(param).slice(8, -1)
      if (type === 'String') {
        // 单个替换
        this.doReplace(param)
      } else if (type === 'Array') {
        // 全部替换
        param.reverse().forEach(({cellId = '', cellIndex = '', lineIndex = '', pos = ''}) => {
          this.doReplace(cellId + '-' + cellIndex + '-' + lineIndex + '-' + pos)
        })
      }
      this.handleFindKeyChanged(this.findKey)
    },
    /**
     * @description: 处理鼠标点击时间
     * @param {event} mouseEvent
     * @Date: 2021-09-07 13:30:15
     */
    listenFun (event) {
      if (this.isDemo) return
      (this.newCellList || []).forEach(item => {
        // editor元素
        const node = this.$refs['cell' + item.id][0].$refs['cellEditor'+ item.id]
        // 包裹editor的li
        const containerNode = this.$refs['cell' + item.id][0].$el
        // 每个li的左侧拖拽和添加icon
        const btnNode = this.$refs['cell' + item.id][0].$refs['cellBtn' + item.id]
        // 运行和折叠按钮
        const runBtnNode = this.$refs['cell' + item.id][0].$refs['cellHover' + item.id]
        // 点击的位置不在包裹editor的li中
        if (containerNode && !containerNode.contains(event.target)) {
          if (item.editType === 'Markdown') {
            // markdown变为预览模式
            node && (node.mdMode = 'preview')
          }
        } else {
          // 点击区域在单个运行和折叠代码内
          if (runBtnNode && runBtnNode.contains(event.target)) {
            node && (node.mdMode = 'preview')
          } else {
            // 点击的位置在包裹editor的li中切不在拖拽和添加按钮中
            if (!btnNode.contains(event.target)) {
              // 模式变为编辑模式
              this.changeMode('edit')
              if (item.editType === 'Markdown' && node) {
                // markdown变为编辑模式并聚焦
                node.singleClick()
              }
            }
          }
        }
      })
    },
    /**
     * @description: 下拉框change事件
     * @param {e} new editType
     * @Date: 2021-08-27 10:22:54
     */
    handleChanged (e) {
      this.editType = e
      this.refreshSelectCell()
      let newValue = this.selectCell?.content || ''
      const index = this.newCellList.findIndex(i => i.id === this.selectCell.id)
      this.$set(this.newCellList, index, Object.assign(this.newCellList[index], {
        editType: e
      }))
      if (e === 'Markdown') {
        newValue = `${MarkdownTag}${newValue}`
        this.handleSave()
      } else {
        if (newValue.startsWith(MarkdownTag)) {
          newValue = newValue.replace(MarkdownTag, '')
        }
        const index = newValue.split('\n').map(i => i.trim()).indexOf(PythonTag)
        if (e === 'Python' && index < 0) {
          newValue = PythonTag + '\n' + newValue
          this.setEditorValue(newValue)
        }
        if (e === 'Byzer-lang') {
          if (index > -1) {
            newValue = newValue.replace(PythonTag, '')
          }
          this.setEditorValue(newValue)
        }
        if (this.mode === 'command') {
          this.handleCodeBlur()
        }
      }
      this.refreshSelectCell()
    },
    setEditorValue (value) {
      const { id } = this.selectCell
      this.$nextTick(() => {
        const node = this.$refs['cell' + id][0].$refs['cellEditor' + id]
        const editor = node.$refs['codeEditor' + id].editor
        editor?.setValue(value, { column: 0, row: 0 })
      })
    },
    /**
     * @description: 刷新选中selectCell的数据
     * @Date: 2021-08-27 10:56:49
     */
    refreshSelectCell () {
      this.selectCell = this.newCellList.find(i => i.id === this.selectCell.id) || {}
    },
    /**
     * @description: ace editor失焦
     * @Date: 2021-09-01 11:05:44
     */
    handleCodeBlur () {
      this.$nextTick(() => {
        const cellRef = this.$refs['cell' + this.selectCell.id] && (this.$refs['cell' + this.selectCell.id][0])
        const codeEditor = cellRef?.$refs['cellEditor' + this.selectCell.id]?.$refs['codeEditor'+this.selectCell.id]
        codeEditor?.editor.textInput.blur()
      })
    },
    /**
     * @description: ace editor聚焦
     * @param {id} cell.id
     * @Date: 2021-09-01 11:41:50
     */
    handleCodeFocus (id) {
      this.$nextTick(() => {
        const cellRef = this.$refs['cell' + id] && (this.$refs['cell' + id][0])
        this.selectCellStatus = cellRef.status
        // 如果是markdown，codeEditor是undefined
        const codeEditor = cellRef?.$refs['cellEditor' + id]?.$refs['codeEditor'+id]
        codeEditor?.editor.textInput.focus()
      })
    },
    changeMode (mode) {
      if (this.mode === mode) {
        return
      }
      const { id, type } = this.activeNotebook
      this.changeNotebookMode({notebookId: id, type, mode})
      if (
        mode === 'command' &&
        (this.selectCell.editType === 'Byzer-lang' ||
          this.selectCell.editType === 'Python')
      ) {
        // 切换为command模式后ace editor失焦
        this.handleCodeBlur()
      } else if (
        mode === 'edit' &&
        (this.selectCell.editType === 'Byzer-lang' ||
          this.selectCell.editType === 'Python')
      ) {
        // 切换为edit模式后ace editor聚焦
        this.handleCodeFocus(this.selectCell.id)
      }
      this.bindSomeKey()
    },
    scrollCell: debounce(function () {
      this.setScrollTopToLocal()
    }, 200),
    handleDragEnd () {
      this.handleSave()
      this.showDragStyle = false
      this.draggedIndex = -1
    },
    changeMove () {
      this.showDragStyle = false
    },
    moveCell ({ draggedContext }) {
      const { futureIndex } = draggedContext
      this.showDragStyle = true
      this.draggedIndex = futureIndex + 1
    },
    changeRunAll (value) {
      this.changeRunningAll(value)
      this.isRunningAll = value
      this.draggableOptions.disabled = value
      if (value) {
          this.changeShowProgress(value)
      } else {
        setTimeout(() => {
          this.runningIndex = this.runToIndex = -1
          this.changeShowProgress(false)
        }, this.showProgressDuration)
      }
    },
    resetIndex () {
      this.runningIndex = -1
      this.runToIndex = -1
      this.runningStatus = 'NEW'
    },
    shouldGetScrollTop () {
      if (this.activeNotebookId === this.currentNotebook.id) {
        if (this.newCellList.every(v => !v.loadingResult)) {
          this.getScrollTop()
        }
      }
    },
    changeStatus (status, cell, progressStatus) {
      // 运行结束 runningStatus 标志为对应的状态
      this.runningStatus = progressStatus || status
      if (status === 'ERROR' && this.excuteType) { // 避免上次执行失败 再刷新页面出提示
        this.$message.error(this.$t('notebook.runningError'))
      }
      let index = this.newCellList.findIndex(v => v.id === cell.id)
      this.newCellList[index].status = status
      if (cell.id === this.selectCell.id) {
        this.selectCellStatus = status
      }
      this.newCellList[index].loadingResult = false
      this.someIsRunning = this.newCellList.some(cell => cell.status === 'RUNNING')
      // 为了通知运行结束
      if (this.runningIndex === -1) {
        return
      }
      if (progressStatus) {
        this.changeRunAll(false)
        this.$message.success(this.$t('notebook.canceled'))
        return
      }
      if (status !== 'RUNNING' && status !== 'NEW' && this.isRunningAll) {
        if (status === 'ERROR' || status === 'DISCARDED') { // 运行失败停留在当前 cell, 停止运行
          this.changeRunAll(false)
          return
        } else {
          this.confirmRunAll()
        }
      } else if (status === 'NEW' && this.excuteType === 'stop') {
        this.confirmStopAll()
      }
    },
    handleNotebook (type) {
      let handleName = ''
      switch (type) {
        case 'add':
          handleName = 'handleCreate'
          break
        case 'clone':
          handleName = 'handleClone'
          break
        case 'delete':
          handleName = 'handleDelete'
          break
        case 'rename':
          handleName = 'handleRename'
          break
        default:
          break
      }
      this.$emit(handleName, this.currentNotebook)
    },
    handleOfflineTab (tabId) {
      this.$emit('handleOfflineTab', tabId)
    },
    handleRunAll ({ params, setDemo, command }) {
      this.setDemoParams = {
        params,
        setDemo,
        command
      }
      this.hanldeExcuteAll('run')
    },
    /**
     * @description: 格式化newCellList的格式 获取editType
     * @param {cellList} res.data.cell_list
     * @Date: 2021-08-31 13:28:05
     */
    dataProcess (cellList = []) {
      return cellList.map(item => {
        // compatible markdown's history mark
        if (item.content && item.content.startsWith('-- Markdown')) {
          item.content = item.content.replace('-- Markdown', MarkdownTag)
        }
        if (item.content && item.content.startsWith(MarkdownTag)) {
          item.content = item.content.replace(MarkdownTag, '')
          // ！！！从备份中取保存前编辑器的模式
          const temp = this.oldCellList.find(i => i.id === item.id) || {}
          item.editType = temp.editType || 'Markdown'
        } else {
          item.editType = 'Byzer-lang'
          if (
            (item.content || '').split('\n').map(i => i.trim()).indexOf(PythonTag) > -1
          ) {
            item.editType = 'Python'
          }
        }
        return item
      })
    },
    handleOperateDemoSuccess () {
      this.$emit('handleRefresh')
    },
    /**
     * @description: 加载cell
     * @param {hideLoading} 是否隐藏loading
     * @param {setScroll} 是否设置 scrollTop
     * @Date: 2021-08-31 13:57:51
     */
    async reloadCellList (hideLoading, setScroll) {
      this.loadingList = !hideLoading
      try {
        const res = await this.getNotebookById({ id: this.currentNotebook.id, commit_id: this.currentNotebook.commit_id })
        this.loadingList = false
        this.newCellList = this.dataProcess(res.data.cell_list)
        this.refreshSelectCell()
        if (!this.newCellList.find(v => v.id === this.selectCell.id)) {
          this.selectCell = this.newCellList[0]
        }
        if (setScroll) {
          this.newCellList = this.newCellList.map(v => ({ ...v, loadingResult: Boolean(v.job_id) }))
          this.shouldGetScrollTop()
        }
      } catch (e) {
        this.loadingList = false
      }
    },
    /**
     * @description: 保存
     * @param {showMessage} 是否出loading
     * @Date: 2021-08-31 14:09:51
     */
    handleSave (showMessage) {
      // 保存所有的cell
      Promise.resolve(this.autoSaveCell(showMessage))
    },
    async clearAllResult () {
      try {
        await this.clearResult(this.activeNotebookId)
        this.reloadCellList()
      } catch (e) {
        console.log(e)
      }
    },
    /**
     * @description: 保存
     * @param {showMessage} 是否出loading
     * @Date: 2021-08-27 15:06:09
     */
    autoSaveCell (showMessage) {
      return new Promise((resolve, reject) => {
        // 自动保存不用出 loading 和 message
        this.loadingSave = showMessage ? true : false
        // 处理content并保存
        this.oldCellList = cloneDeep(this.newCellList).map(item => {
          item.content = item.content || ''
          if (item.editType === 'Markdown') {
            if (!(item.content || '').startsWith(MarkdownTag)) {
              item.content = MarkdownTag + item.content
            }
          }
          return item
        })
        const params = {
          id: this.activeNotebookId,
          data: {
            cell_list: this.oldCellList
          }
        }
        this.saveNotebook(params).then(() => {
            this.loadingSave = false
            if (showMessage) {
              this.$message.success(this.$t('workspace.saveSuccess'))
            }
            this.reloadCellList(!showMessage) // 隐藏 loading
            resolve('save')
          }).catch(e => {
            reject(e)
            this.loadingSave = false
          })
      })
    },
    hanldeExcuteSelectCell (type) {
      if (type === 'delete') {
        this.handleDeleteCell(this.selectCell)
      } else {
        const selectCellRef =
          (this.selectCell && this.$refs['cell' + this.selectCell.id][0]) ||
          null
        if (selectCellRef) {
          type === 'run'
            ? selectCellRef.handleRun()
            : selectCellRef.handleStop()
        }
      }
    },
    handleRunToHere (cellId) {
      this.runToIndex = this.newCellList.findIndex(i => i.id === cellId)
      this.exuteType = 'run'
      this.confirmExcuteAll(true, 'run')
    },
    async hanldeExcuteAll (type) {
      try {
        if (type === 'stop') {
          await this.$confirm(
            this.$t('notebook.discardAllJob'),
            this.$t('notebook.discardTitle'),
            {
              confirmButtonText: this.$t('discard'),
              cancelButtonText: this.$t('cancel'),
              type: 'warning',
              customClass: 'centerButton'
            }
          )
          this.confirmExcuteAll(true, 'stop')
        } else {
          this.runToIndex = this.newCellList.length - 1
          this.confirmExcuteAll(true, 'run')
        }
      } catch (e) {
        console.log(e)
      }
    },
    confirmExcuteAll (isFirst, type) {
      this.changeRunAll(true)
      if (type) {
        this.excuteType = type
      }
      if (this.excuteType === 'run') {
        this.confirmRunAll(isFirst)
      } else {
        this.confirmStopAll(isFirst)
      }
    },
    confirmRunAll () {
      this.runningIndex++ // 从 -1 开始 每开始一次+1， 运行结束
      const ids = this.newCellList.map(v => v.id)
      const id = ids[this.runningIndex]
      if (id && this.runToIndex >= (this.runningIndex)) { // 还没运行结束
        const domRef = `cell${id}`
        if (this.$refs[domRef] && this.$refs[domRef][0].content) {
          // 运行到哪个，哪个就切换为选中状态
          const index = this.newCellList.findIndex(i => i.id === id)
          this.selectCell = this.newCellList[index]
          this.scrollToSelectCell(index)
          this.$refs[domRef] && this.$refs[domRef][0].handleRun()
        } else {
          this.confirmRunAll()
        }
      } else { // 执行到最后一个了
        this.runningStatus = 'COMPLETED'
        this.$message.success(this.$t('notebook.runningSuccess'))
        this.runningIndex = this.runToIndex
        this.changeRunAll(false)
        this.setDemoParams = null
      }
    },
    confirmStopAll (isFirst) {
      const ids = this.newCellList.map(v => v.id)
      let id = ''
      if (!isFirst) {
        id = ids[this.runningIndex]
      } else {
        let firstIndex = this.newCellList.findIndex(
          v => v.status === 'RUNNING'
        )
        id = firstIndex !== -1 ? ids[firstIndex] : ''
      }
      const domRef = `cell${id}`
      const domData = this.$refs[domRef] && this.$refs[domRef][0]
      if (id && domData?.status === 'RUNNING') {
        this.$refs[domRef][0].confirmStopJob()
      } else {
        this.changeRunAll(false)
      }
    },
    // 当前选中的 cell 操作
    handleSelectCell (item) {
      this.changeMode('edit')
      if (!this.isRunningAll) {
        this.selectCell = item
      }
    },
    // 内容改变 新增 删除之后等操作都需要保存到后端
    changeCellContent ({ value, cellInfo }) {
      this.changeInput({ value, cellInfo })
    },
    changeInput: debounce(function ({ value, cellInfo }) {
      const index = this.newCellList.findIndex(v => v.id === cellInfo.id)
      this.newCellList[index].content = value
      let editType = 'Byzer-lang'
      // 保存时给markdown添加标记
      if ((value || '').startsWith(MarkdownTag)) {
        editType = 'Markdown'
      } else if (
        (value || '')
          .split('\n')
          .map(i => i.trim())
          .indexOf(PythonTag) > -1
      ) {
        editType = 'Python'
      }
      this.$set(
        this.newCellList,
        index,
        Object.assign(this.newCellList[index], {
          editType
        })
      )
      this.handleSave()
    }, 300),
    handleMove (type) {
      const index = this.newCellList.findIndex(v => v.id === this.selectCell.id)
      const moveItem = this.newCellList[index]
      const cloneList = cloneDeep(this.newCellList)
      const insertIndex = type === 'up' ? index - 1 : index + 1
      cloneList.splice(index, 1)
      cloneList.splice(insertIndex, 0, moveItem)
      this.newCellList = cloneList
      this.handleSave()
    },
    async handleDeleteCell (item) {
      if (this.isRunningAll) {
        return
      }
      const params = {
        id: this.activeNotebookId,
        cell_id: item.id
      }
      try {
        await this.deleteCell(params)
        this.deletedCellList.unshift({
          cell: cloneDeep(this.selectCell),
          cellIndex: this.newCellList.findIndex(i => i.id === this.selectCell.id)
        })
        this.reloadCellList()
      } catch (e) {
        console.log(e)
      }
    },
    async handleAddCell (data, cell) {
      const { type } = data
      const index = this.newCellList.findIndex(v => v.id === cell.id)
      const insertIndex = type === 'below' ? index + 1 : index
      if (this.activeNotebookId !== this.currentNotebook.id) {
        return
      }
      const params = {
        id: this.activeNotebookId,
        data: {
          cell_index: insertIndex
        }
      }
      this.loadingSave = true
      try {
        await this.autoSaveCell()
        const newCell = await this.createCell(params)
        const res = await this.getNotebookById({ id: this.activeNotebookId })
        this.loadingSave = false
        this.newCellList = this.dataProcess(res.data.cell_list)
        this.selectCell = Object.assign(newCell.data, {
          editType: 'Byzer-lang'
        })
        this.changeMode('edit')
        this.autoScrollCells(insertIndex)
      } catch (e) {
        this.loadingSave = false
      }
    },
    autoScrollCells (insertIndex) {
      this.selectCell = this.newCellList[insertIndex]
      this.scrollToSelectCell(insertIndex)
    },
    setScrollTopToLocal () {
      const scrollList = JSON.parse(localStorage.getItem('scrollList')) || []
      this.$nextTick(() => {
        const wrapper = this.$refs['dragWrapper' + this.currentNotebook.uniq]
        if (!wrapper) {
          return
        }
        const curScrollTop =
          this.$refs['dragWrapper' + this.currentNotebook.uniq].scrollTop
        const index = scrollList.findIndex(
          v => v.uniq === this.currentNotebook.uniq
        )
        if (index === -1) {
          scrollList.push({ ...this.currentNotebook, scrollTop: curScrollTop })
        } else {
          scrollList[index].scrollTop = curScrollTop
        }
        localStorage.setItem('scrollList', JSON.stringify(scrollList))
      })
    },
    getScrollTop () {
      const scrollList = JSON.parse(localStorage.getItem('scrollList')) || []
      const curNotebook = scrollList.find(v => v.id === this.activeNotebookId)
      if (curNotebook) {
        const { scrollTop, id } = curNotebook
        window.setTimeout(() => {
          if (this.$refs['dragWrapper' + id]) {
            this.$refs['dragWrapper' + id].scrollTo(0, scrollTop)
          }
        }, 200)
      }
    },
    clearUnOpenedList () {
      const scrollList = JSON.parse(localStorage.getItem('scrollList')) || []
      const newList = scrollList.filter(v =>
        this.openedNotebookList.map(v => v.id).includes(v.id)
      )
      localStorage.setItem('scrollList', JSON.stringify(newList))
    },
    async addToSchedule () {
      try {
        const { finished } = await this.callAddScheduleModal(
          this.activeNotebook
        )
        if (finished) {
          await this.checkNotebook()
        }
      } catch (err) {
        console.log(err)
      }
    },
    async viewDAG () {
      const { type } = await this.callDAGViewModal(cloneDeep(this.taskInfo))
      this.checkNotebook()
      if (type === 'update') {
        this.viewDAG()
      }
    },
    handleCommand (command) {
      this[command]()
    },
    async handleUpdate () {
      const params = this.formatParams()
      if (this.taskInfo.scheduleInfo?.release_state === 'ONLINE') {
        try {
          await this.callCheckActionModal({
            type: 'update',
            ...cloneDeep(params)
          })
        } catch (err) {
          console.log(err)
        }
      } else {
        try {
          const res = await this.updateSchedule(params)
          if (res?.msg === 'success') {
            this.showUpdatesuccessMsg()
          }
        } catch (err) {
          console.log(err)
        }
      }
      this.checkNotebook()
    },
    showUpdatesuccessMsg () {
      this.$message.success(
        this.$t('schedules.updateSuccessMsg')
      )
    },
    formatParams () {
      const {
        scheduleInfo: { name, connects, entities, description },
        currentNotebook: { id: currentNotebookId }
      } = this.taskInfo
      const entity = entities.find(e => e.entity_id === Number(currentNotebookId))

      const params = {
        name: name,
        description: description,
        modification: {
          entity_type: entity.entity_type,
          entity_id: entity.entity_id,
          task_name: entity.name,
          task_desc: entity.description,
          action: 'update'
        }
      }
      /**
       * c
       * { endPointSourceId: "notebook-xxxx", endPointTargetId: "notebook-xxxx" }
       * endPointSourceId 上一个
       * endPointTargetId 下一个
       */
      const previousTaskId = connects.find(
        c =>
          c.endPointTargetId === entity.entity_type + '-' + entity.entity_id
      )?.endPointSourceId
      const previousTaskName = entities.find(
        e => e.entity_type + '-' + e.entity_id === previousTaskId
      )?.name
      const attach_to = entities.filter(
        item => item.name === previousTaskName
      )
      attach_to.length > 0 ? params['modification']['attach_to'] = attach_to : null
      return { id: this.taskInfo.scheduleInfo.id, params }
    }
  }
}
</script>

<style lang="scss">

.cellListPage {
  width: 100%;
  background-color: $--color-white;
  &-header {
    border-bottom: 1px solid $--border-color-light;
    &-btns {
      width: 100%;
      padding: 13px 0;
      padding-left: 30px;
      display: flex;
      position: relative;
      .btn {
        height: 22px;
        padding-right: 15px;
        line-height: 22px;
        &.divider {
          padding-right: 27px;
          position: relative;
          &::after {
            content: '';
            position: absolute;
            right: 12px;
            top: 0px;
            width: 1px;
            height: 22px;
            background-color: #E6EBF4;
          }
        }
        &.right-bar {
          padding-right: 0px;
          position: absolute;
          right: 20px;
        }
        .drop-text {
          color: $--color-black;
          i {
            vertical-align: middle;
          }
        }
        .added-to-schedule-wrap {
          display: inline-flex;
          align-items: center;
          height: 100%;
          & > span {
            height: 38px;
          }
          .add-btn {
            padding: 0 5px;
            border: 1px solid $--border-update-schedule;
            border-top-left-radius: 6px;
            border-bottom-left-radius: 6px;
            border-right: none;
          }
          .update-btn {
            padding: 0 4px;
            height: 38px;
            background: $pattern-green-100;
            border-top-right-radius: 6px;
            border-bottom-right-radius: 6px;
            border: 1px solid $--border-update-schedule;
          }
        }
        .add-to-schedule {
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          i {
            margin-right: 3px;
          }
        }
      }
    }
    &-progress {
      padding: 16px;
      display: flex;
      align-items: center;
      .el-progress {
        flex: 1;
      }
    }
  }
  &-container {
    display: flex;
    justify-content: space-between;
    &-left {
      flex: 1;
      width: 0;
      .sortable-drag {
        opacity: 0.2;
      }
      .cell-list {
        height: calc(100vh - $page-header-height - 105px);
        padding-bottom: 50vh;
        overflow-y: auto;
        > div > li {
          margin-top: 12px;
          background-color: $--color-white;
          position: relative;
          .editor-extra-header {
            .ace_gutter-layer {
              width: 60px !important;
            }
            // md
            .CodeMirror-sizer > div:first-child {
              padding-top: 19px !important;
            }
          }
          &.active::before {
            content: '';
            position: absolute;
            left: 20px;
            top: -6px;
            width: 2px;
            height: 2px;
            border: 2px solid $pattern-blue-400;
            border-radius: 50%;
          }
          &.active::after {
            content: '';
            position: absolute;
            left: 26px;
            top: -4px;
            width: 70%;
            height: 2px;
            background-color: $pattern-blue-400;
          }
          .cell-order {
            width: 100%;
            padding-left: 55px;
            color: $--color-info;
            padding-bottom: 4px;
            .text {
              display: inline-block;
              font-size: 12px;
              transform: scale(0.75);
            }
          }
        }
      }
    }
    &-right {
      width: 300px;
      height: calc(100vh - 48px - 110px);
      padding-top: 15px;
      padding-right: 10px;
    }
  }
  // z-index需要比悬浮之后展示的run按钮层级高 run按钮999
  .shortcut-wrap {
    position: absolute;
    top: 0;
    right: 0;
    width: 280px;
    height: 100%;
    z-index: 1000;
    background: #FFFFFF;
    box-shadow: 0px 0px 32px rgba(53, 72, 100, 0.24);
    border: 1px solid #eeeeee;
  }
}
.update-btn-dropdown-wrap {
  display: flex;
  align-items: center;
  width: 240px;
  .update-btn-dropdown-text {
    margin-left: 10px;
  }
}
</style>
