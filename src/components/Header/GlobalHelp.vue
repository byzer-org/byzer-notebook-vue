
<template>
  <div class="global-help">
    <el-dropdown @command="handleCommand">
      <i class="el-ksd-icon-help_22 drop-icon"></i>
      <el-dropdown-menu slot="dropdown" class="global-help-drop">
        <el-dropdown-item command="https://github.com/byzer-org">{{$t('menu.give_feedback')}}</el-dropdown-item>
        <el-dropdown-item command="https://docs.byzer.org/#/byzer-notebook/zh-cn/">{{$t('menu.Byzer_docs')}}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { mapState } from 'vuex'

@Component({
  computed: {
    ...mapState({
      isTrial: state => state.global.is_trial
    })
  }
})
export default class GlobalHelp extends Vue {

  handleCommand (command) {
    window.open(command)
  }
}
</script>
<style lang="scss">

.global-help {
  margin-right: 10px;
  .drop-icon {
    display: block;
    line-height: 24px;
    margin-top: 12px;
    font-size: 24px;
    color: $--color-white;
    cursor: pointer;
  }
}
.global-help-drop {
  .el-dropdown-menu__item {
    a {
      color: $--color-text-primary;
    }
  }
}
</style>
