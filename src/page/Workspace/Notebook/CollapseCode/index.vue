
<template>
  <div class="collapse-code">
    <p class="ellipsis-item hide-code">{{value}}</p>
    <a class="code-btn" href="javascript:;" @click.stop="toggleShowCode">{{$t('notebook.showCode')}}</a>
  </div>
</template>
<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'

@Component({
  props: ['value']
})
export default class CollapseCode extends Vue {
  toggleShowCode () {
    this.$emit('toggleShowCode')
  }
}
</script>
<style lang="scss">
@import '../../../../assets/css/variables.scss';
.collapse-code {
  .ellipsis-item {
    padding-bottom: 15px;
    width: 200px;
  }
  .code-btn {
    padding-left: 10px;
    font-size: 12px;
    color: $--color-primary;
  }
}
</style>

