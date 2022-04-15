<template>
  <div
    class="markdown-editor"
    :class="{ 'active-editor': isSelected && !readOnly }"
  >
    <v-md-editor
      v-if="mdMode === 'edit'"
      v-model="content"
      :ref="'md' + cellId"
      :mode="'edit'"
      @input="changeContent"
    ></v-md-editor>
    <v-md-editor
      v-if="mdMode === 'preview'"
      v-model="value"
      :ref="'md' + cellId"
      :mode="'preview'"
      :text="value"
    ></v-md-editor>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'

import VMdEditor from '@kangc/v-md-editor/lib/codemirror-editor'
import createKatexPlugin from '@kangc/v-md-editor/lib/plugins/katex/npm'
import createMermaidPlugin from '@kangc/v-md-editor/lib/plugins/mermaid/npm'
import '@kangc/v-md-editor/lib/style/codemirror-editor.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'
// highlightjs
import hljs from 'highlight.js'
// codemirror 编辑器的相关资源
import Codemirror from 'codemirror'
// mode
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/css/css'
import 'codemirror/mode/htmlmixed/htmlmixed'
import 'codemirror/mode/vue/vue'
// edit
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/matchbrackets'
// placeholder
import 'codemirror/addon/display/placeholder'
// active-line
import 'codemirror/addon/selection/active-line'
// scrollbar
import 'codemirror/addon/scroll/simplescrollbars'
import 'codemirror/addon/scroll/simplescrollbars.css'
// style
import 'codemirror/lib/codemirror.css'
// katex
import 'katex/dist/katex.css'
// mermaid
import '@kangc/v-md-editor/lib/plugins/mermaid/mermaid.css'
import { debounce } from '@antv/x6/lib/util/function/function'

@Component({
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
    /**
     * markdown模式
     * edit(纯编辑模式) editable(编辑与预览模式) preview(纯预览模式)
     */
    mode: {
      type: String,
      default: 'preview'
    }
  }
})
export default class CodeMarkdownEditor extends Vue {
  /** md编辑器模式 edit——编辑模式 preview——预览模式 */
  mdMode = 'preview'

  dblClickStatus = false

  timer = null

  /** 编辑器内容 */
  content = this.value

  /** 编辑器中的codemirror实例 */
  cmInstance = undefined

  /**
   * @description: 修改编辑器内容
   * @Date: 2021-08-26 15:42:22
   */
  changeContent () {
    this.$emit('changeContent', this.content)
  }

  singleClick = debounce(function () {
    if (!this.dblClickStatus) {
      this.dblClickStatus = true
      this.timer = setTimeout(() => {
        this.dblClickStatus = false
      }, 1000);
    } else {
      clearTimeout(this.timer)
      this.dblClickStatus = false
      this.mdMode = 'edit'
      this.handleFocus()
    }
  }, 50)

  /**
   * @description: 获绑定codemirror实例
   * @Date: 2021-08-30 14:55:46
   */
  bindCmInstance () {
    this.cmInstance = this.$refs['md' + this.cellId].codemirrorInstance
  }

  /**
   * @description: 聚焦md
   * @Date: 2021-08-30 16:01:50
   */
  handleFocus () {
    this.$nextTick(() => {
      // 聚焦
      this.$refs['md' + this.cellId].focus()
    })
  }

  @Watch('mode')
  modeHandler (newValue, oldValue) {
    if (newValue === oldValue) {
      return
    }
    if (newValue === 'edit') {
      if (this.isSelected) {
        this.singleClick()
      } else {
        this.mdMode = 'preview'
      }
    } else {
      this.mdMode = 'preview'
    }
  }

  @Watch('mdMode') 
  onMdModeChange (newVal) {
    this.content = this.value
    this.$emit('changeMdMode', newVal)
  }

  @Watch('isSelected')
  isSelectedHandler (newValue) {
    if (!newValue) {
      this.mdMode = 'preview'
    }
  }

  created () {
    VMdEditor.Codemirror = Codemirror
    VMdEditor.use(githubTheme, {
      Hljs: hljs
    })
    // formula
    VMdEditor.use(createKatexPlugin())
    VMdEditor.use(createMermaidPlugin())

    Vue.use(VMdEditor)
  }

  mounted () {
    this.bindCmInstance()
  }
}
</script>

<style lang="scss">

/* 工具栏 */
.v-md-editor__toolbar {
  display: none;
}

.v-md-editor__preview-wrapper {
  li {
    list-style: inherit;
  }
}

/* 编辑器最小高度 */
.v-md-editor {
  min-height: 38px;
}

/* 编辑器底部留白 */
.github-markdown-body {
  padding: 16px 32px 0;
}
/* 去除h1和h2标签的下划线 */
.github-markdown-body h1,
.github-markdown-body h2 {
  border-bottom: none;
}
</style>
