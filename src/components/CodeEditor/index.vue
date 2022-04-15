
<template>
  <div
    class="Byzer-editor"
    :class="{ 'active-editor': isSelected && !readOnly }"
  >
    <editor
      v-if="lang"
      :ref="'codeEditor' + cellId"
      v-model="content"
      :lang="lang"
      :options="options"
      @input="changeContent"
    ></editor>
  </div>
</template>

<script>
import ace from 'brace'
import { mapActions } from 'vuex'
import { PythonTag, SpecialCodeSuggestKey } from '../../config'

export default {
  props: {
    value: {
      type: String,
      default: ''
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    cellId: {
      type: String,
      default: ''
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    newCellList: {
      type: Array
    }
  },
  data () {
    return {
      lang: '',
      content: this.value,
      options: {
        wrap: 'free',
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        autoScrollEditorIntoView: true,
        readOnly: this.readOnly,
        showPrintMargin: false,
        maxLines: Infinity,
        minLines: 2,
        fontSize: 14,
        newLineMode: 'auto'
      }
    }
  },
  watch: {
    value (newVal, oldVal) {
      if (this.readOnly) {
        this.content = newVal
      }
      this.checkLang()

      ;(oldVal || '').split('').forEach(i => {
        newVal = newVal.replace(i, '')
      })
      if (SpecialCodeSuggestKey.includes(newVal)) {
        const codeEditor = this.$refs['codeEditor' + this.cellId]
        codeEditor?.editor.execCommand('startAutocomplete')
      }
    },
    readOnly () {
      this.setReadOnly()
    },
    isSelected (newVal) {
      if (newVal) {
        const codeEditor = this.$refs['codeEditor' + this.cellId]
        codeEditor?.editor.textInput.focus()
      }
    }
  },
  created () {
    this.checkLang()
  },
  mounted () {
    this.bindCommand()
  },
  methods: {
    ...mapActions({
      autoComplete: 'AUTO_COMPLETE'
    }),
    checkLang () {
      let lang = ''
      if (this.content.split('\n').map(i => i.trim()).indexOf(PythonTag) > -1) {
        lang = 'python'
      } else {
        lang = 'sql'
      }
      if (lang !== this.lang) {
        this.lang = lang
      }
      // 每次输入都要重新init代码提示，否则在getCompletions中都是上一次init时的数据
      // this.queryCompleters()
      // 清空默认的代码提示
      const lnTools = ace.acequire('ace/ext/language_tools')
      lnTools?.setCompleters([])
    },
    /**
     * @description: 获取代码补全
     * @Date: 2021-11-04 15:42:38
     */
    queryCompleters () {
      const lnTools = ace.acequire('ace/ext/language_tools')
      // 覆盖默认代码提示
      lnTools?.setCompleters([
        {
          getCompletions: async (editor, session, pos, prefix, callback) => {
            const {sql, lineNum, columnNum} = this.getAllContent()
            if (this.lang === 'sql') {
              try {
                const resl = await this.autoComplete({
                  excuteMode: 'autoSuggest', // 脚本执行类，autoSuggest->语法提示
                  sql,
                  lineNum,
                  columnNum,
                  isDebug: false // 后台是否显示debug日志
                })
                if (resl && Object.prototype.toString.call(resl.data).slice(8, -1) === 'Array') {
                  callback(
                    null,
                    resl.data.reverse().map((item, index) => {
                      item.name = item.name.startsWith('/') ? item.name.replace('/', '') : item.name
                      return {
                        meta: item.extra?.desc || '',
                        caption: item.name,
                        value: item.name,
                        score: index + 1 // score越大，越靠前显示
                      }
                    })
                  )
                } else {
                  callback(null, [])
                }
              } catch (e) {
                callback(null, [])
              }
            } else {
              callback(null, [])
            }
          }
        }
      ])
    },
    /**
     * @description: 获取所有除markdown以外的代码
     * @Date: 2021-11-05 15:42:24
     */
    getAllContent () {
      let editor = null
      if (this.$refs['codeEditor' + this.cellId]) {
        editor = this.$refs['codeEditor' + this.cellId].editor
        const { column, row } = editor.getCursorPosition()
        // 除markdown和当前cell外其余cell的内容
        let beforeCellValue = ''
        // 当前cell的index
        const cellIndex = this.newCellList.findIndex(
          i => i.id === this.cellId
        )
        // 当前cell光标所在行
        let lineNum = 0
        for (let index in this.newCellList) {
          index = index * 1
          const { editType, content } = this.newCellList[index]
          if (index < cellIndex && editType !== 'Markdown') {
            const lineList = content.split('\n')
            lineNum += lineList.length
            beforeCellValue =
              beforeCellValue +
              (lineList.length > 1
                ? lineList.slice(0, -1).join('\n') + '\n'
                : '') + // 除最后一行外直接添加
              lineList.slice(-1) +
              '\n' // 最后一行添加换行符
          }
        }
        return {
          sql: beforeCellValue + this.content, // sql脚本内容
          lineNum: lineNum + row + 1, // pos所在行数,1开始
          columnNum: column // pos所在列数,1开始，如果光标在列开头,则为0
        }
      } else {
        return {}
      }
    },
    /**
     * @description: 注册快捷键
     * @Date: 2021-08-24 18:36:24
     */
    bindCommand () {
      this.indentCommand()
      this.startAutoCompleter()
      this.bindUndoAndRedo()
      this.outdentCommand()
      this.goLineDown()
      this.goLineUp()
      this.bindEnter()
      this.disableDragDropText()
    },
    /**
     * @description: tab键弹出代码提示
     * @Date: 2021-11-12 14:31:00
     */
    startAutoCompleter () {
      let editor = null
      if (this.$refs['codeEditor'+ this.cellId]) {
        editor = this.$refs['codeEditor'+ this.cellId].editor
        editor.commands.addCommand({
          name: 'myCommand-handle-show-completer',
          bindKey: { win: 'Alt-Space', mac: 'Option-Space' },
          exec: editor => {
            // 每次输入都要重新init代码提示，否则在getCompletions中都是上一次init时的数据
            this.queryCompleters()
            editor.execCommand('startAutocomplete')
          }
        })
      }
    },
    /**
     * @description: 为了防止查找和替换后的undo和redo会自动添加selection
     * @Date: 2021-09-09 15:29:18
     */
    bindUndoAndRedo () {
      let editor = null
      if (this.$refs['codeEditor'+ this.cellId]) {
        editor = this.$refs['codeEditor'+ this.cellId].editor
        editor.commands.addCommand({
          name: 'myCommand-handle-undo',
          bindKey: { win: 'Ctrl-Z',  mac: 'Command-Z' },
          exec: editor => {
            const cursorPos = editor.getCursorPosition()
            editor.undo()
            editor.clearSelection();
            editor.moveCursorToPosition(cursorPos)
          }
        })
        editor.commands.addCommand({
          name: 'myCommand-handle-redo',
          bindKey: { win: 'Ctrl-Y',  mac: 'Command-Y' },
          exec: editor => {
            const cursorPos = editor.getCursorPosition()
            editor.redo()
            editor.clearSelection();
            editor.moveCursorToPosition(cursorPos)
          }
        })
      }
    },
    /**
     * @description: 禁止ace-editor拖放文本
     * @Date: 2021-08-24 18:44:07
     */
    disableDragDropText () {
      let editor = null;
      if (this.$refs['codeEditor'+ this.cellId]) {
        editor = this.$refs['codeEditor'+ this.cellId].editor;
        // "dragenter", "dragover", "dragend", "dragstart", "dragleave", "drop"
        !['drop'].forEach(eventName => {
          editor.container.addEventListener(
            eventName,
            function (e) {
              e.stopPropagation()
            },
            true
          )
        });
        editor.setOption('dragEnabled', false)
      }
    },
    bindEnter () {
      let editor = null
      if (this.$refs['codeEditor'+ this.cellId]) {
        editor = this.$refs['codeEditor'+ this.cellId].editor
        editor.commands.addCommand({
          name: 'myCommand-enter',
          bindKey: { win: 'enter',  mac: 'enter' },
          exec: editor => {
            if (this.readOnly) {
              this.$emit('changeMode', 'edit')
            } else {
              editor.insert('\n' + '')
            }
          },
          readOnly: true
        })
      }
    },
    goLineDown () {
      let editor = null
      if (this.$refs['codeEditor'+ this.cellId]) {
        editor = this.$refs['codeEditor'+ this.cellId].editor
        editor.commands.addCommand({
          name: 'myCommand-linedown',
          bindKey: { win: 'Down',  mac: 'Down' },
          exec: (editor, args) => {
            if (this.readOnly) {
              this.$emit('gotoNextCell', 'next')
            } else {
              editor.commands.commands.golinedown.exec(editor, args)
            }
          },
          readOnly: true
        })
      }
    },
    goLineUp () {
      let editor = null
      if (this.$refs['codeEditor'+ this.cellId]) {
        editor = this.$refs['codeEditor'+ this.cellId].editor
        editor.commands.addCommand({
          name: 'myCommand-lineup',
          bindKey: { win: 'Up',  mac: 'Up' },
          exec: (editor, args) => {
            if (this.readOnly) {
              this.$emit('gotoNextCell', 'prev')
            } else {
              editor.commands.commands.golineup.exec(editor, args)
            }
          },
          readOnly: true
        })
      }
    },
    indentCommand () {
      let editor = null
      if (this.$refs['codeEditor'+ this.cellId]) {
        editor = this.$refs['codeEditor'+ this.cellId].editor
        editor.commands.addCommand({
          name: 'myCommand-indent',
          bindKey: { win: 'Ctrl-]',  mac: 'Command-]' },
          exec: editor => {
            editor.commands.commands.indent.exec(editor)
          }
        })
      }
    },
    outdentCommand () {
      let editor = null
      if (this.$refs['codeEditor'+ this.cellId]) {
        editor = this.$refs['codeEditor'+ this.cellId].editor
        editor.commands.addCommand({
          name: 'myCommand-outdend',
          bindKey: { win: 'Ctrl-[',  mac: 'Command-[' },
          exec: editor => {
            editor.commands.commands.outdent.exec(editor)
          }
        })
      }
    },
    setReadOnly () {
      this.$refs['codeEditor'+ this.cellId]?.editor.setReadOnly(this.readOnly)
    },
    getCurrentRowText (editor) {
      const result = editor.selection.getCursor();
      const row = result.row
      const content = editor.selection.doc.$lines[row]
      return { content, ...result }
    },
    changeContent () {
      this.$emit('changeContent', this.content)
      this.checkLang()
    }
  }
}
</script>

<style lang="scss">

</style>
