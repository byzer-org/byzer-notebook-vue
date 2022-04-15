
<template>
  <transition name="el-fade-in-linear">
    <div class="shortcut-prompt" v-if="isShow">
      <div class="header">
        <i class="el-ksd-icon-close_22" @click="handleClose"></i>
      </div>
      <div class="content">
        <el-tabs>
          <el-tab-pane :label="$t('notebook.commandMode')" name="0">
            <ShortcutDetail :mode="'command'" :type="'global'" />
            <ShortcutDetail :mode="'command'" :type="'md'" />
          </el-tab-pane>
          <el-tab-pane :label="$t('notebook.editMode')">
            <ShortcutDetail :mode="'edit'" :type="'global'" />
            <ShortcutDetail :mode="'edit'" :type="'md'" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </transition>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import ShortcutDetail from '../ShortcutDetail'

@Component({
  components: {
    ShortcutDetail
  }
})
export default class ShortcutPrompt extends Vue {
  isShow = false

  handleClose () {
    this.isShow = false
  }
}
</script>

<style lang="scss">


.shortcut-prompt {
  .header {
    height: 48px;
    line-height: 48px;
    text-align: right;
    i {
      font-size: 24px;
      cursor: pointer;
    }
  }
  .content {
    padding: 0 0 10px 15px;
    height: calc(100% - 48px);
    .el-tabs {
      &.el-tabs--top {
        height: 100%;
        .el-tabs__content {
          height: calc(100% - 49px);
          overflow: auto;
        }
      }
    }
  }
}
</style>
