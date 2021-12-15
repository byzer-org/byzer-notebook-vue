
<template>
  <div class="cellListPage" v-loading="isLoading || isLoadingResult">
    <div class="cellListPage-header">
      <div class="cellListPage-header-btns">
        <el-dropdown class="btn" @command="handleNotebook">
          <span class="el-dropdown-link">
            <i class="el-ksd-icon-document_22 font-22"></i><i class="el-ksd-icon-arrow_down_22 font-22"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="add">{{ $t('notebook.createNotebook') }}</el-dropdown-item>
            <el-dropdown-item command="rename">{{ $t('rename') }}</el-dropdown-item>
            <el-dropdown-item command="clone">{{ $t('clone') }}</el-dropdown-item>
            <el-dropdown-item command="delete"> <span class="txt-danger">{{ $t('notebook.deleteNotebook') }}</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <div class="btn">
          <icon-btn icon="el-ksd-icon-save_22" :disabled="isRunningAll" :text="$t('save')" :handler="() => handleSave(true)" />
        </div>
        <div class="btn">
          <icon-btn icon="el-ksd-icon-add_22" :disabled="isRunningAll" :text="$t('notebook.addCell')" :handler="() => handleAddCell({ type: 'below' }, selectCell)" />
        </div>
        <div class="btn">
          <icon-btn v-if="selectCellStatus !== 'RUNNING' || isRunningAll" icon="el-ksd-icon-play_outline_22" :disabled="isRunningAll" :text="$t('run')" :handler="() => hanldeExcuteSelectCell('run')" />
          <icon-btn v-else icon="el-ksd-icon-stop_with_border_22" :disabled="isRunningAll" :text="$t('notebook.stop')" :handler="() => hanldeExcuteSelectCell('stop')" />
        </div>
        <div class="btn">
          <icon-btn icon="el-ksd-icon-fast_forward_outline_22" :disabled="isRunningAll" :text="$t('notebook.runNext')" :handler="handleRunNext" />
        </div>
        <div class="btn">
          <icon-btn v-if="isRunningAll" icon="el-ksd-icon-stop_with_border_22" :text="$t('notebook.cancelAll')" :handler="() => hanldeExcuteAll('stop')" />
          <icon-btn v-else icon="el-ksd-icon-play_all_outline_22" :disabled="selectCellStatus === 'RUNNING'" :text="$t('notebook.runAll')" :handler="() => hanldeExcuteAll('run')" />
        </div>
        <div class="btn">
          <icon-btn icon="el-ksd-icon-delete_22" :disabled="newCellList.length === 1" :text="$t('delete')" :handler="() => hanldeExcuteSelectCell('delete')" />
        </div>
        <div class="btn">
          <icon-btn icon="el-ksd-icon-clear_22" :disabled="isRunningAll" :text="$t('notebook.clearAllResult')" :handler="clearAllResult" />
        </div>
        <el-dropdown class="btn" trigger="hover" @command="handleChanged">
          <span class="drop-text">
            {{ editType }}<i class="el-ksd-icon-arrow_down_22 font-22"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="Kolo">Kolo</el-dropdown-item>
            <el-dropdown-item command="Python">Python</el-dropdown-item>
            <el-dropdown-item command="Markdown">Markdown</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <div class="btn">
          <span class="hasEvent" @click="handleShowShortcutHelp">{{ $t('notebook.showShortcutHelp') }}</span>
        </div>
      </div>
    </div>
    <div class="cellListPage-container">
      <div class="cellListPage-container-left">
        <ul
          class="cell-list"
          :ref="'dragWrapper' + currentNotebook.id"
          @scroll="scrollCell"
        >
          <draggable
            ref="dragInner"
            :options="draggableOptions"
            v-model="newCellList"
            @start="handleDragStart"
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
                @changeStatus="(status) => changeStatus(status, cell)"
                @handleAddCell="(data) => handleAddCell(data, cell)"
                @handleDeleteCell="() => handleDeleteCell(cell)"
                @handleSave="handleSave"
                :mode="mode"
                @gotoNextCell="gotoNextCell"
                @changeMode="changeMode"
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
import { mapState, mapMutations, mapActions } from 'vuex'
import CellBox from '../CellBox'
import ShortcutPrompt from '../ShortcutPrompt'
import FindAndReplace from '../FindAndReplace'
import { debounce, cloneDeep } from 'lodash'
import draggable from 'vuedraggable'
import cellCommand from './command.vue'
import { MarkdownTag } from '@/config'
import { PythonTag } from '../../../../config'

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
      // mode: 'edit',
      showDragStyle: true,
      draggedIndex: -1,
      selectCellStatus: 'NEW',
      editType: '', // 当前选中cell的类型
      findKey: '',
      replaceKey: '',
      results: [] // 查找的结果
    }
  },
  props: ['currentNotebook', 'activeNotebookId'],
  components: {
    CellBox,
    draggable,
    ShortcutPrompt,
    FindAndReplace
  },
  computed: {
    ...mapState({
      activeNotebook: state => state.notebook.activeNotebook,
      mode: state => state.notebook.activeNotebook.mode,
      openedNotebookList: state => state.notebook.openedNotebooks
    }),
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
    openedNotebookList: {
      handler () {
        this.clearUnOpenedList()
      },
      deep: true
    },
    activeNotebookId () {
      this.initAllData()
      this.shouldGetScrollTop()
      this.changeMode('edit')
      this.bindAllKey()
    },
    selectCell: {
      handler (newVal, oldValue) {
        const {id, editType} = newVal
        const {editType: oldEditType} = oldValue
        if (id) {
          this.editType = newVal.editType || '';
          if (
            editType === 'Markdown' &&
            (oldEditType === 'Kolo' || oldEditType === 'Python')
          ) {
            const mdEditorInstance = this.$refs['cell' + id][0].$refs[
              'cellEditor' + id
            ]
            mdEditorInstance.mdMode = 'preview'
          }
          if (this.mode === 'edit') {
            this.handleCodeFocus(id)
          }
        }
      },
      deep: true
    }
  },
  methods: {
    ...mapMutations({
      changeNotebookMode: 'CHANGE_NOTEBOOK_MODE' // 修改notebook 模式 edit/command
    }),
    ...mapActions({
      getNotebookList: 'GET_NOTEBOOK_LIST',
      deleteNotebook: 'DEL_NOTEBOOK',
      saveNotebook: 'SAVE_NOTEBOOK',
      getNotebookById: 'GET_NOTEBOOK_BY_ID',
      createCell: 'CREATE_CELL',
      deleteCell: 'DELETE_CELL',
      clearResult: 'CLEAR_RESULT'
    }),
    initAllData () {
      this.isRunningAll = false
      this.selectCellStatus = 'NEW'
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
      this.replaceKey = e;
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
          if (item.editType === 'Kolo' || item.editType === 'Python') {
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
      const type = Object.prototype.toString.call(param).slice(8, -1);
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
      (this.newCellList || []).forEach(item => {
        // editor元素
        const node = this.$refs['cell' + item.id][0].$refs['cellEditor'+ item.id]
        // 包裹editor的li
        const containerNode = this.$refs['cellLi' + item.id][0]
        // 每个li的左侧拖拽和添加icon
        const btnNode = this.$refs['cell' + item.id][0].$refs['cellBtn' + item.id]
        // 运行和折叠按钮
        const runBtnNode = this.$refs['cell' + item.id][0].$refs['cellHover' + item.id]
        // 点击的位置不在包裹editor的li中
        if (!containerNode.contains(event.target)) {
          if (item.editType === 'Markdown') {
            // markdown变为预览模式
            node.mdMode = 'preview'
          }
        } else {
          // 点击区域在单个运行和折叠代码内
          if (runBtnNode.contains(event.target)) {
            node.mdMode = 'preview'
          } else {
            // 点击的位置在包裹editor的li中切不在拖拽和添加按钮中
            if (!btnNode.contains(event.target)) {
              // 模式变为编辑模式
              this.changeMode('edit')
              if (item.editType === 'Markdown') {
                // markdown变为编辑模式并聚焦
                node.mdMode = 'edit'
                node.handleFocus();
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
      this.editType = e;
      this.refreshSelectCell()
      let newValue = this.selectCell?.content || '';
      const index = this.newCellList.findIndex(i => i.id === this.selectCell.id);
      this.$set(this.newCellList, index, Object.assign(this.newCellList[index], {
        editType: e
      }));
      if (e === 'Markdown') {
        newValue = `${MarkdownTag}${newValue}`;
        this.handleSave()
      } else {
        if (newValue.startsWith(MarkdownTag)) {
          newValue = newValue.replace(MarkdownTag, '')
        }
        const index = newValue.split('\n').map(i => i.trim()).indexOf(PythonTag);
        if (e === 'Python' && index < 0) {
          newValue = PythonTag + '\n' + newValue
          this.setEditorValue(newValue)
        }
        if (e === 'Kolo') {
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
      this.selectCell = this.newCellList.find(i => i.id === this.selectCell.id) || {};
    },
    /**
     * @description: ace editor失焦
     * @Date: 2021-09-01 11:05:44
     */
    handleCodeBlur () {
      this.$nextTick(() => {
        const cellRef = this.$refs['cell' + this.selectCell.id] && (this.$refs['cell' + this.selectCell.id][0])
        const codeEditor = cellRef?.$refs['cellEditor' + this.selectCell.id]?.$refs['codeEditor'+this.selectCell.id]
        codeEditor?.editor.textInput.blur();
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
        (this.selectCell.editType === 'Kolo' ||
          this.selectCell.editType === 'Python')
      ) {
        // 切换为command模式后ace editor失焦
        this.handleCodeBlur()
      } else if (
        mode === 'edit' &&
        (this.selectCell.editType === 'Kolo' ||
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
    handleDragStart () {
    },
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
      this.isRunningAll = value
      this.draggableOptions.disabled = value
    },
    shouldGetScrollTop () {
      if (this.activeNotebookId === this.currentNotebook.id) {
        if (this.newCellList.every(v => !v.loadingResult)) {
          this.getScrollTop()
        }
      }
    },
    changeStatus (status, cell) {
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
      if (status !== 'RUNNING' && status !== 'NEW' && this.isRunningAll) {
        this.confirmExcuteAll()
      } else if (status === 'NEW' && this.exuteType === 'stop') {
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
    /**
     * @description: 格式化newCellList的格式 获取editType
     * @param {cellList} res.data.cell_list
     * @Date: 2021-08-31 13:28:05
     */
    dataProcess (cellList = []) {
      return cellList.map(item => {
        if (item.content && item.content.startsWith(MarkdownTag)) {
          item.content = item.content.replace(MarkdownTag, '')
          // ！！！从备份中取保存前编辑器的模式
          const temp = this.oldCellList.find(i => i.id === item.id) || {};
          item.editType = temp.editType || 'Markdown';
        } else {
          item.editType = 'Kolo'
          if (
            (item.content || '').split('\n').map(i => i.trim()).indexOf(PythonTag) > -1
          ) {
            item.editType = 'Python'
          }
        }
        return item;
      });
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
        const res = await this.getNotebookById({ id: this.currentNotebook.id })
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
        console.log(e)
      }
    },
    /**
     * @description: 保存
     * @param {showMessage} 是否出loading
     * @Date: 2021-08-31 14:09:51
     */
    handleSave (showMessage) { // 保存所有的cell
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
          item.content = item.content || '';
          if (item.editType === 'Markdown') {
            if (!(item.content || '').startsWith(MarkdownTag)) {
              item.content = MarkdownTag + item.content;
            }
          }
          return item;
        });
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
        const selectCellRef = this.selectCell && this.$refs['cell' + this.selectCell.id][0] || null
        if (selectCellRef) {
          type === 'run' ? selectCellRef.handleRun() : selectCellRef.handleStop()
        }
      }
    },
    async hanldeExcuteAll (type) {
      try {
        await this.autoSaveCell()
        this.exuteType = type
        if (this.exuteType === 'stop') {
          this.$confirm(this.$t('notebook.discardAllJob'), this.$t('notebook.discardTitle'), {
              confirmButtonText: this.$t('discard'),
              cancelButtonText: this.$t('cancel'),
              type: 'warning',
              customClass: 'centerButton'
            }).then(() => {
            this.confirmExcuteAll(true)
          })
        } else {
          this.confirmExcuteAll(true)
        }
      } catch (e) {
        console.log(e)
      }
    },
    confirmExcuteAll (isFirst) {
      this.changeRunAll(true)
      if (this.exuteType === 'run') {
        this.confirmRunAll(isFirst)
      } else {
        this.confirmStopAll(isFirst)
      }
    },
    confirmRunAll () {
      this.runningIndex++
      const ids = this.newCellList.map(v => v.id)
      const id = ids[this.runningIndex]
      if (id) {
        const domRef = `cell${id}`
        if (this.$refs[domRef] && this.$refs[domRef][0].content) {
          // 运行到哪个，哪个就切换为选中状态
          const index = this.newCellList.findIndex(i => i.id === id)
          this.selectCell = this.newCellList[index]
          this.$refs[domRef] && this.$refs[domRef][0].handleRun()
        } else {
          this.confirmRunAll()
        }
      } else {
        this.changeRunAll(false)
        this.runningIndex = -1
      }
    },
    confirmStopAll (isFirst) {
      if (!isFirst) {
        this.runningIndex++
      } else {
        let firstIndex = this.newCellList.findIndex(v => v.status === 'RUNNING')
        this.runningIndex = firstIndex
      }
      const ids = this.newCellList.map(v => v.id)
      const id = ids[this.runningIndex]
      const domRef = `cell${id}`
      if (id && this.$refs[domRef][0].status === 'RUNNING') {
        this.$refs[domRef] && this.$refs[domRef][0].confirmStopJob()
      } else {
        this.changeRunAll(false)
        this.runningIndex = -1
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
      let editType = 'Kolo'
      // 保存时给markdown添加标记
      if ((value || '').startsWith(MarkdownTag)) {
        editType = 'Markdown'
      } else if (
        (value || '').split('\n').map(i => i.trim()).indexOf(PythonTag) > -1
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
      const index = this.newCellList.findIndex(v => v.id === cell.id);
      const insertIndex = type === 'below' ? index + 1 : index;
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
        this.selectCell = Object.assign(newCell.data, { editType: 'Kolo' })
        this.changeMode('edit')
        this.autoScrollCells(insertIndex, type)
      } catch (e) {
        this.loadingSave = false
      }
    },
    autoScrollCells (insertIndex, type) {
      this.selectCell = this.newCellList[insertIndex]
      const scrollTop = this.$refs['dragWrapper' + this.currentNotebook.id].scrollTop
      this.$nextTick(() => {
        const autoScrollHeight = this.$refs['cellLi' + this.selectCell.id][0].offsetHeight
        const plusHeight = scrollTop + autoScrollHeight
        const minusHeight = scrollTop - 60
        const scrollHeight = type === 'below' ? plusHeight : minusHeight
        this.$refs['dragWrapper' + this.currentNotebook.id].scrollTop = scrollHeight
      })
    },
    setScrollTopToLocal () {
      const scrollList = JSON.parse(localStorage.getItem('scrollList')) || []
      this.$nextTick(() => {
        const wrapper = this.$refs['dragWrapper' + this.currentNotebook.id]
        if (!wrapper) {
          return
        }
        const curScrollTop = this.$refs['dragWrapper' + this.currentNotebook.id].scrollTop
        const index = scrollList.findIndex(v => v.id === this.currentNotebook.id)
        if (index === -1) {
          scrollList.push({...this.currentNotebook, scrollTop: curScrollTop })
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
      const newList = scrollList.filter(v => this.openedNotebookList.map(v => v.id).includes(v.id))
      localStorage.setItem('scrollList', JSON.stringify(newList))
    }
  }
}
</script>

<style lang="scss">
@import '../../../../assets/css/variable.scss';
.cellListPage {
  width: 100%;
  background-color: $--color-white;
  &-header {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid $--border-color-light;
    &-btns {
      flex: 1;
      width: 0;
      padding: 13px 0;
      padding-left: 30px;
      display: flex;
      .btn {
        height: 22px;
        margin-right: 15px;
        line-height: 22px;
        .drop-text {
          i {
            vertical-align: middle;
          }
        }
      }
    }
    &-catalog {
      width: 300px;
      padding-right: 20px;
      text-align: right;
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
        height: calc(100vh - 48px - 110px);
        padding-bottom: 50vh;
        overflow-y: auto;
        > div > li {
          margin-top: 12px;
          background-color: $--color-white;
          position: relative;
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
</style>
