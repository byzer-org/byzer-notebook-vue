
<template>
  <div class="collapse-editor">
    <div ref="editorLine"
      class="editor-line"
      v-for="(line, index) in valueArr"
      :key="index"
    >
    <div class="editor-line-gutter">{{index + 1}}</div>
    <div class="editor-line-content" v-html="hljs.highlight(line, { language: curLang }).value"></div>
    </div>
  </div>
</template>

<script>
import { Vue, Component, Watch } from 'vue-property-decorator'
const hljs = require('highlight.js')    
hljs.registerLanguage('byzer', require('./byzer_highlight'))
hljs.registerLanguage('python', require('highlight.js/lib/languages/python'))
hljs.registerLanguage('markdown', require('highlight.js/lib/languages/markdown'))
require('highlight.js/styles/vs.css') 
@Component({
  props: ['content', 'lang']
})
export default class CollapseCodeEditor extends Vue {
  valueArr = []
  value = ''
  langObj = {
    'Byzer-lang': 'byzer',
    'Markdown': 'markdown',
    'Python': 'python'
  }
  hljs = hljs
  @Watch('content')
  onContentChange (newVal) {
    if (newVal) {
      this.valueArr = newVal.split('\n')
    }
  }
  get curLang () {
    return this.langObj[this.lang]
  }
}
</script>

<style lang="scss" scoped>

.collapse-editor {
  background-color: #fff;
  font: 14px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  height: 37px;
  overflow: hidden;
  .editor-line {
    display: flex;
    &-gutter {
      width: 60px;
      color: #CED7E4;
      padding-left: 13px;
      padding-right: 19px;
      text-align: right;
      line-height: 18.5px;
    }
    &-content {
      width: 0;
      flex: 1;
      line-height: 18.5px;
      color: #2c3e50;
      font-size: 14px;
    }
  }
 
  
}
</style>
<style lang="scss">

  // 颜色设置
  .hljs-comment, .hljs-constant.hljs-numeric {
    color: $cellCommentColor;
  }
  .hljs-identifier {
    color: $cellTextColor;
  }
  .hljs-keyword, .hljs-storage, .hljs-type {
    color:$cellKeywordColor;
  }
  .hljs-keyword.hljs-operator {
    color: $cellTextColor;
  }
  .hljs-string {
    color: $cellStringColor;
  }
  .hljs-section {
    color: #1890ff;
    font-weight: bold;
  }
</style>
