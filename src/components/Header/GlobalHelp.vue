
<template>
  <div class="global-help" v-show="isTrial">
    <el-dropdown>
      <i class="el-ksd-icon-help_22 drop-icon"></i>
      <el-dropdown-menu slot="dropdown" class="global-help-drop">
        <el-dropdown-item command=""><a href="https://github.com/allwefantasy/mlsql" target="_blank">Give Feedback</a></el-dropdown-item>
        <el-dropdown-item command=""><a href="https://mlsql-docs.kyligence.io/latest/zh-hans/" target="_blank">MLSQL Docs</a></el-dropdown-item>
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
}
</script>
<style lang="scss">
@import '../../assets/css/variable.scss';
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
