<template>
  <div></div>
</template>
<script>
import { debounce } from 'lodash'
import { PythonTag } from '../../../../config'

export default {
  name: 'cellList',
  data () {
    return {
      timer: undefined,
      doublePressD: false, // 是否双击D
      operateContent: '', // 剪切/复制的内容
      deletedCellList: [], // 被删除的cell
      shortcutPromptInstance: undefined, // 快捷键帮助组件实例
      findAndReplaceInstance: undefined, // 查找和替换组件实例
      replacedText: ''
    }
  },
  watch: {
    currentNotebook: {
      // 每次切换tab后重新绑定快捷键，否则快捷键仅绑定在最初的notebook上
      handler (newValue, oldValue) {
        if (newValue.active === oldValue?.active) return;
        if (newValue?.active === 'true') {
          // 放在异步任务中延迟绑定，避免后面的解绑将该绑定解除
          this.$nextTick(() => {
            this.bindAllKey()
          })
        } else {
          this.unbindAllKey()
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted () {
    this.shortcutPromptInstance = this.$refs['shortcutPrompt']
    this.findAndReplaceInstance = this.$refs['findAndReplace']
  },
  beforeDestroy () {
    this.unbindAllKey()
  },
  methods: {
    unbindAllKey () {
      this.$shortcut.unbind('⌘+s, ctrl+s')
      this.$shortcut.unbind('enter')
      this.$shortcut.unbind('esc')
      this.$shortcut.unbind('shift+enter')
      this.$shortcut.unbind('up')
      this.$shortcut.unbind('down')
      this.$shortcut.unbind('A')
      this.$shortcut.unbind('B')
      // 二阶段
      this.$shortcut.unbind('E')
      this.$shortcut.unbind('M')
      this.$shortcut.unbind('F')
      this.$shortcut.unbind('D')
      this.$shortcut.unbind('X')
      this.$shortcut.unbind('C')
      this.$shortcut.unbind('shift+V')
      this.$shortcut.unbind('V')
      this.$shortcut.unbind('Z')
      this.$shortcut.unbind('S')
      this.$shortcut.unbind('H')
      this.$shortcut.unbind('K')
      this.$shortcut.unbind('J')
      this.$shortcut.unbind('1')
      this.$shortcut.unbind('2')
      this.$shortcut.unbind('3')
      this.$shortcut.unbind('4')
    },
    bindAllKey () {
      if (this.currentNotebook.id !== this.activeNotebookId) {
        return
      } else if (this.currentNotebook.type === 'workflow') {
        this.unbindAllKey()
        return
      }
      this.$shortcut.bind('⌘+s, ctrl+s', debounce(this.handleSaveCurrent, 200))
      this.$shortcut.bind('enter', this.changeModeToEdit)
      this.$shortcut.bind('esc', this.changeModeToCommand)
      // 编辑模式下需要
      this.$shortcut.bind('shift+enter', debounce(this.handleRunAndNext, 200))
      // 命令模式下需要
      this.$shortcut.bind('up', debounce(this.selectPrevCell, 200))
      this.$shortcut.bind('down', debounce(this.selectNextCell, 200))
      this.bindSomeKey()
    },
    bindSomeKey () {
      if (this.mode === 'command') {
        this.$shortcut.bind('A', debounce(this.insertCellUp, 200))
        this.$shortcut.bind('B', debounce(this.insertCellDown, 200))
        // 二阶段
        // 编辑器类型从 Code -> Markdown
        this.$shortcut.bind('E', debounce(this.changeCurrentEditType, 200))
        // 编辑器类型从 Markdown -> Code
        this.$shortcut.bind('M', debounce(this.changeCurrentEditType, 200))
        // 查找和替换
        this.$shortcut.bind('F', debounce(this.findAndReplace, 200))
        // 删除本单元格
        this.$shortcut.bind('D', this.handleKeyBoardDeleteCell)
        // 剪切选中单元格的内容
        this.$shortcut.bind('X', debounce(this.cutCurrentContent, 200))
        // 复制选中单元格的内容
        this.$shortcut.bind('C', debounce(this.copyCurrentContent, 200))
        // 将operateContent的内容粘贴到上方单元格
        this.$shortcut.bind('shift+V', debounce(this.pasteToUpperCell, 200))
        // 将operateContent的内容粘贴到下方单元格
        this.$shortcut.bind('V', debounce(this.pasteToBelowCell, 200))
        // 撤销删除单元格
        this.$shortcut.bind('Z', debounce(this.undoDelete, 200))
        // 保存
        this.$shortcut.bind('S', debounce(this.handlesaveAll, 200))
        // 显示快捷键帮助
        this.$shortcut.bind('H', debounce(this.showShortcutHelp, 200))
        // 选中上方单元格
        this.$shortcut.bind('K', debounce(this.selectPrevCell, 200))
        // 选中下方单元格
        this.$shortcut.bind('J', debounce(this.selectNextCell, 200))
        // markdown第一行改为1级标题
        this.$shortcut.bind('1', debounce(this.changMdTittle1, 200))
        // markdown第一行改为2级标题
        this.$shortcut.bind('2', debounce(this.changMdTittle2, 200))
        // markdown第一行改为3级标题
        this.$shortcut.bind('3', debounce(this.changMdTittle3, 200))
        // markdown第一行改为4级标题
        this.$shortcut.bind('4', debounce(this.changMdTittle4, 200))
      } else {
        this.$shortcut.unbind('A')
        this.$shortcut.unbind('B')
        // 二阶段
        this.$shortcut.unbind('E')
        this.$shortcut.unbind('M')
        this.$shortcut.unbind('F')
        this.$shortcut.unbind('D')
        this.$shortcut.unbind('X')
        this.$shortcut.unbind('C')
        this.$shortcut.unbind('shift+V')
        this.$shortcut.unbind('V')
        this.$shortcut.unbind('Z')
        this.$shortcut.unbind('S')
        this.$shortcut.unbind('H')
        this.$shortcut.unbind('K')
        this.$shortcut.unbind('J')
        this.$shortcut.unbind('1')
        this.$shortcut.unbind('2')
        this.$shortcut.unbind('3')
        this.$shortcut.unbind('4')
      }
    },
    /**
     * @description: 修改markdown标题等级
     * @param {tag} markdown标题标记
     * @Date: 2021-09-01 17:09:13
     */
    checkAndChangeTitleLevel (tag) {
      if ((this.currentNotebook.id === this.activeNotebookId) && this.selectCell?.editType === 'Markdown') {
        const {id} = this.selectCell
        // editor元素
        const node = this.$refs['cell' + id][0].$refs['cellEditor'+ id]
        // 修改后的第一行
        let newLine = ''
        // 当前第一行
        const firstLine = node.cmInstance.getLine(0) || ''
        const spaceIndex = firstLine.lastIndexOf('# ')
        const startIndex = firstLine.indexOf('#')
        if (spaceIndex > -1) {
          newLine = firstLine.replace(firstLine.slice(startIndex, spaceIndex + 1), tag)
        } else {
          newLine = tag + ' ' + firstLine;
        }
        node.cmInstance.replaceRange(newLine, {line: 0, ch: 0}, {line: 0, ch: firstLine.length})
      }
    },
    /**
     * @description: markdown第一行改为1级标题
     * @Date: 2021-09-01 15:59:55
     */
    changMdTittle1 () {
      this.checkAndChangeTitleLevel('#')
    },
    /**
     * @description: markdown第一行改为2级标题
     * @Date: 2021-09-01 15:59:55
     */
    changMdTittle2 () {
      this.checkAndChangeTitleLevel('##')
    },
    /**
     * @description: markdown第一行改为3级标题
     * @Date: 2021-09-01 15:59:55
     */
    changMdTittle3 () {
      this.checkAndChangeTitleLevel('###')
    },
    /**
     * @description: markdown第一行改为4级标题
     * @Date: 2021-09-01 15:59:55
     */
    changMdTittle4 () {
      this.checkAndChangeTitleLevel('####')
    },
    /**
     * @description: 显示快捷键帮助
     * @Date: 2021-09-01 15:06:43
     */
    showShortcutHelp () {
      if (this.currentNotebook.id === this.activeNotebookId) {
        this.$refs['shortcutPrompt'].isShow = !this.$refs['shortcutPrompt'].isShow;
      }
    },
    /**
     * @description: 保存
     * @Date: 2021-09-01 15:02:58
     */
    handlesaveAll () {
      if (this.currentNotebook.id === this.activeNotebookId) {
        this.handleSave(true);
      }
    },
    /**
     * @description: 撤销删除单元格
     * @Date: 2021-09-01 14:35:44
     */
    undoDelete () {
      if ((this.currentNotebook.id === this.activeNotebookId) && this.deletedCellList.length > 0) {
        const {cell, cellIndex} = this.deletedCellList.shift();
        if (cellIndex > this.newCellList.length - 1) {
          this.newCellList.push(cell)
        } else {
          this.newCellList.splice(cellIndex, 0, cell)
        }
        this.handleSave();
      }
    },
    /**
     * @description: 将operateContent的内容粘贴到下方单元格
     * @Date: 2021-09-01 14:27:03
     */
    pasteToBelowCell () {
      if (this.currentNotebook.id === this.activeNotebookId) {
        let index = this.newCellList.findIndex(i => i.id === this.selectCell.id)
        index = index + 1 > this.newCellList.length - 1 ? this.newCellList.length - 1 : index + 1
        this.newCellList = this.newCellList.map((i, idx) => {
          if (index === idx) {
            i.content = (i.content || '') + this.operateContent
          }
          return i
        })
        this.refreshSelectCell();
        this.handleSave()
      }
    },
    /**
     * @description: 将operateContent的内容粘贴到上方单元格
     * @Date: 2021-09-01 13:10:24
     */
    pasteToUpperCell () {
      if (this.currentNotebook.id === this.activeNotebookId) {
        let index = this.newCellList.findIndex(i => i.id === this.selectCell.id)
        index = index - 1 > -1 ? index - 1 : 0
        this.newCellList = this.newCellList.map((i, idx) => {
          if (index === idx) {
            i.content = (i.content || '') + this.operateContent
          }
          return i
        })
        this.refreshSelectCell();
        this.handleSave()
      }
    },
    /**
     * @description: 复制当前单元格的内容
     * @Date: 2021-09-01 11:17:04
     */
    copyCurrentContent () {
      if (this.currentNotebook.id === this.activeNotebookId) {
        const index = this.newCellList.findIndex(i => i.id === this.selectCell.id)
        this.operateContent = this.newCellList[index].content || '';
      }
    },
    /**
     * @description: 剪切当前单元格的内容
     * @Date: 2021-08-31 17:22:16
     */
    cutCurrentContent () {
      if (this.currentNotebook.id === this.activeNotebookId) {
        this.newCellList = this.newCellList.map(i => {
          if (i.id === this.selectCell.id) {
            this.operateContent = i.content;
            i.content = '';
          }
          return i;
        })
        this.handleSave();
      }
    },
    /**
     * @description: 查找和替换
     * @Date: 2021-09-02 09:58:09
     */
    findAndReplace () {
      this.replacedText = this.getSelectedText()
      if (this.currentNotebook.id === this.activeNotebookId) {
        this.findAndReplaceInstance.showMsg = true
        this.handleFindKeyChanged(this.findKey)
      }
    },
    getSelectedText () {
      const editorType = ['Byzer-lang', 'Python']
      const { editType, id } = this.selectCell
      const node = this.$refs['cell' + id][0].$refs['cellEditor' + id]
      if (editorType.includes(editType)) {
        const editor = node.$refs['codeEditor' + id].editor
        return editor.getSelectedText()
      }
      return ''
    },

    /**
     * @description: D(连续按两次) 删除本单元格
     * @Date: 2021-08-31 17:15:28
     */
    handleKeyBoardDeleteCell () {
      if (this.currentNotebook.id === this.activeNotebookId) {
        // 一下还没按为false
        if (!this.doublePressD) {
          // 按了一下之后变为true
          this.doublePressD = true;
          this.timer = setTimeout(() => {
            this.doublePressD = false
          }, 1000)
        } else {
          // doublePressD为true表示 1 秒内按了第二次
          clearTimeout(this.timer)
          this.doublePressD = false
          this.handleDeleteCell(this.selectCell)
        }
      }
    },
    /**
     * @description: 切换当前选中editor的模式
     * @Date: 2021-08-30 14:28:38
     */
    changeCurrentEditType () {
      if (this.currentNotebook.id === this.activeNotebookId) {
        let editType = ''
        if (this.selectCell.editType === 'Byzer-lang' || this.selectCell.editType === 'Python') {
          editType = 'Markdown'
        } else {
          editType = 'Byzer-lang'
          if (this.selectCell.content.split('\n').map(i => i.trim()).indexOf(PythonTag) > -1) {
            editType = 'Python'
          }
        }
        this.handleChanged(editType);
      }
    },
    changeModeToEdit () {
      this.changeMode('edit')
    },
    changeModeToCommand () {
      this.changeMode('command')
    },
    handleRunSelect () {
      if (this.selectCell.id) {
        this.$refs[`cell${this.selectCell.id}`][0].handleRun()
      }
    },
    handleSaveCurrent () {
      this.handleSave(true)
    },
    handleRunAndNext () {
      if ((this.currentNotebook.id === this.activeNotebookId) && this.selectCell.id) {
        this.$refs[`cell${this.selectCell.id}`][0].handleRun()
      }
    },
    scrollToSelectCell () {
      setTimeout(() => {
        this.$refs['cellLi' + this.selectCell.id] && this.$refs['cellLi' + this.selectCell.id][0].scrollIntoView()
      }, 200)
    },
    insertCellUp () {
      if (this.mode === 'edit') {
        return
      }
      const data = { type: 'up' }
      const cell = this.selectCell.id ? this.selectCell : this.newCellList[0]
      this.handleAddCell(data, cell)
    },
    insertCellDown () {
      if (this.mode === 'edit') {
        return
      }
      const data = { type: 'below' }
      const cell = this.selectCell.id ? this.selectCell : this.newCellList[0]
      this.handleAddCell(data, cell)
    },
    selectNextCell () {
      if (this.mode === 'edit') {
        return
      }
      const index = this.newCellList.findIndex(v => v.id === this.selectCell.id)
      const maxIndex = this.newCellList.length - 1
      if (index !== -1 && (index < maxIndex)) {
        this.selectCell = this.newCellList[index + 1]
        this.scrollToSelectCell(index + 1)
      }
    },
    selectPrevCell () {
      if (this.mode === 'edit') {
        return
      }
      const index = this.newCellList.findIndex(v => v.id === this.selectCell.id)
      if (index > 0) {
        this.selectCell = this.newCellList[index - 1]
        this.scrollToSelectCell(index - 1)
      }
    },
    gotoNextCell (type) {
      if (type === 'next') {
        this.selectNextCell()
      } else {
        this.selectPrevCell()
      }
    }
  }
}
</script>
<style lang="scss">
</style>
