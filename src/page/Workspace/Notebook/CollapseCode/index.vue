
<template>
  <div class="collapse-code">
    <div class="collapse-code-content">
      <CodeEditor :lang="type" ref="codeEditor" :content="editorContent" />
    </div>
    <div class="collapse-code-btn mt-12">
      <el-tag type="danger" v-if="status==='ERROR'">
        <i class="el-ksd-icon-wrong_fill_16 font16 txt-danger"></i>
        Error
      </el-tag>
      <a class="code-btn" href="javascript:;" @click.stop="toggleShowCode">{{$t('notebook.showCode')}}</a>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import CodeEditor from './Editor.vue'

@Component({
  props: ['value', 'type', 'status'],
  components: {
    CodeEditor
  }
})
export default class CollapseCode extends Vue {
  editorContent = ''
  toggleShowCode () {
    this.$emit('toggleShowCode')
  }
  @Watch('value', { immediate: true })
  onValueChange (newVal) {
    this.getEditorContent(newVal)
  }
  getEditorContent (value) {
    if (value) {
      const valArr = value.split('\n').filter((v, index) => index < 2)
      this.$nextTick(() => {
        this.editorContent = valArr.join('\n')
      })
    }
  }
}
</script>
<style lang="scss">

.collapse-code {
  padding-top: 19px;
  .code-btn {
    padding-left: 10px;
    font-size: 12px;
    color: $--color-primary;
  }
}
</style>

