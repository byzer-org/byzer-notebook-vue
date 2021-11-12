<!--

-->

<template>
  <div class="global-help" v-show="(inNotebook && isNotebook) || isTrial">
    <el-dropdown @command="handleCommand">
      <i class="el-ksd-icon-help_22 drop-icon"></i>
      <el-dropdown-menu slot="dropdown" class="global-help-drop">
        <el-dropdown-item command="handleShowShortcutHelp" v-show="inNotebook && isNotebook">{{ $t('showShortcutHelp') }}</el-dropdown-item>
        <el-dropdown-item command="" v-show="isTrial"><a href="https://github.com/allwefantasy/mlsql" target="_blank">Give Feedback</a></el-dropdown-item>
        <el-dropdown-item command="" v-show="isTrial"><a href="https://mlsql-docs.kyligence.io/latest/zh-hans/" target="_blank">MLSQL Docs</a></el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { mapState, mapMutations } from 'vuex'
import { findChildren } from '../../util'

@Component({
  computed: {
    ...mapState({
      /* 当前打开的是notebook(true)或者是workflow(false) */
      isNotebook: (state) => state.notebook?.activeNotebook?.type === 'notebook',
      activedNotebook: (state) => state.notebook?.activeNotebook,
      isTrial: state => state.global.is_trial
    })
  },
  watch: {
    $route: {
      handler(to) {
        // 在页面渲染完成后再进行判断，否则初次加载时cellList为undefined
        this.$nextTick(() => {
          // 是否在notebook路由中
          this.inNotebook = to.path.indexOf('/notebook') > -1
        })
      },
      deep: true
    }
  },
  methods: {
    ...mapMutations({
      changeNotebookMode: 'CHANGE_NOTEBOOK_MODE' // 修改notebook 模式 edit/command
    })
  }
})
export default class GlobalHelp extends Vue {
  /* 当前路由在notebook中 */
  inNotebook = false

  /**
   * @description: 点击每一项的回调事件
   * @param {*} e 下拉项名
   * @Date: 2021-09-13 17:02:44
   */
  handleCommand(e) {
    if (e) {
      this[e]()
    }
  }

  /**
   * @description: 展开快捷键帮助面板
   * @Date: 2021-09-13 17:03:14
   */
  handleShowShortcutHelp() {
    // 当前notebook容器
    const refNode = findChildren(this.$root, 'cellList' + this.activedNotebook?.id)
    const node = refNode && refNode[0] && refNode[0][0] ? refNode[0][0] : {}
    // 切换为command模式
    this.changeMode('command')
    // 打开快捷键帮助面板
    node.$refs['shortcutPrompt'].isShow = true
  }
  changeMode (mode) {
    const { id, type } = this.activedNotebook
    this.changeNotebookMode({ notebookId: id, type, mode})
  }
}
</script>
<i18n>
  {
    "zh": {
      "showShortcutHelp": "Show Shortcut Help",
      "Github": "Github"
    },
    "en": {
      "showShortcutHelp": "Show Shortcut Help",
      "Github": "Github"
    }
  }
</i18n>
<style lang="scss">
@import '../../assets/css/config.scss';
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
      color: #333;
    }
  }
}
</style>
