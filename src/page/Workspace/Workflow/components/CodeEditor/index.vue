
<template>
  <div class="Byzer-editor" :class="{ 'active-editor': isSelected && !readOnly }" >
    <!-- 光标移动原因：编辑器接收值后会重新渲染编辑器，会导致光标移动到最开头。 -->
    <editor :value="content" ref="nodeEditor" :height="height" lang="sql" :options="options" @input="changeContent"></editor>
  </div>
</template>

<script>
import { Vue, Component, Watch } from 'vue-property-decorator'
import { mapActions } from 'vuex'
import ace from 'brace'
import { SpecialCodeSuggestKey } from '../../../../../config'
@Component({
  props: {
    height: {
      type: String,
      default: '100'
    },
    value: {
      type: String,
      default: ''
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    showGutter: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    ...mapActions({
      autoComplete: 'AUTO_COMPLETE'
    })
  }
})
export default class NodeCodeEditor extends Vue {
  content = this.value
  contentBackup = ''
  options = {
    wrap: 'free',
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
    autoScrollEditorIntoView: true,
    readOnly: this.readOnly,
    showPrintMargin: false,
    showGutter: this.showGutter,
    fontSize: 14,
    newLineMode: 'auto'
  }

  @Watch('value')
  onValueChange (newVal) {
    this.content = newVal
  }
  @Watch('readOnly')
  onReadOnlyChange () {
    this.setReadOnly()
  }
  @Watch('showGutter')
  onShowGutterChange (newVal) {
    this.changeOptions('showGutter', newVal)
  }
  mounted () {
    this.codeSuggest()
  }

  changeOptions (option, value) {
    this.$refs.nodeEditor.editor.setOption(option, value)
  }
  setReadOnly () {
    this.$refs.nodeEditor.editor.setReadOnly(this.readOnly)
  }
  changeContent (value) {
    this.$emit('changeContent', value)
    // this.queryCompleters(value)
    // 清空默认的代码提示
    const lnTools = ace.acequire('ace/ext/language_tools')
    lnTools?.setCompleters([])

    this.$nextTick(() => {
      let v = value
      ;(this.contentBackup || '').split('').forEach(i => {
        v = v.replace(i, '')
      })
      if (SpecialCodeSuggestKey.includes(v)) {
        const codeEditor = this.$refs['nodeEditor']
        codeEditor?.editor.execCommand('startAutocomplete')
      }
      this.contentBackup = value;
    })
  }
  /**
   * @description: 获取文本
   * @param {value} 当前文本
   * @Date: 2021-11-11 18:45:42
   */
  getAllContent (value) {
    let editor = null
    if (this.$refs['nodeEditor']) {
      editor = this.$refs['nodeEditor'].editor
      const { column, row } = editor.getCursorPosition()

      return {
        sql: value, // sql脚本内容
        lineNum: row + 1, // pos所在行数,1开始
        columnNum: column // pos所在列数,1开始，如果光标在列开头,则为0
      }
    } else {
      return {}
    }
  }
  /**
   * @description: 代码补全
   * @Date: 2021-11-11 18:41:28
   */
  queryCompleters (value) {
    const lnTools = ace.acequire('ace/ext/language_tools')
    // 覆盖默认代码提示
    lnTools?.setCompleters([
      {
        getCompletions: async (editor, session, pos, prefix, callback) => {
          const {sql, lineNum, columnNum} = this.getAllContent(value)
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
                resl.data.reverse().map((item, index) => ({
                  meta: item.extra?.desc || '',
                  caption: item.name,
                  value: item.name,
                  score: index + 1 // score越大，越靠前显示
                }))
              )
            } else {
              callback(null, [])
            }
          } catch (e) {
            callback(null, [])
          }
        }
      }
    ])
  }
  bindEnter () {
    let editor = null
    if (this.$refs['nodeEditor']) {
      editor = this.$refs['nodeEditor'].editor
      editor.commands.addCommand({
        name: 'enter',
        bindKey: { win: 'enter',  mac: 'enter' },
        exec: editor => {
          if (!this.readOnly) {
            editor.insert('\n' + '')
          }
        },
        readOnly: true
      })
    }
  }
  codeSuggest () {
    let editor = null
    if (this.$refs['nodeEditor']) {
      editor = this.$refs['nodeEditor'].editor
      editor.commands.addCommand({
        name: 'enter',
        bindKey: { win: 'Alt-Space', mac: 'Option-Space' },
        exec: editor => {
          this.queryCompleters(this.contentBackup)
          editor.execCommand('startAutocomplete')
        }
      })
    }
  }
}
</script>

<style lang="scss">
</style>
