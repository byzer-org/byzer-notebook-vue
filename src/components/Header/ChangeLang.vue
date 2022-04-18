
<template>
  <div class="change-lang">
    <el-dropdown @command="handleCommand">
      <i class="el-ksd-icon-language_22 drop-icon"></i>
      <el-dropdown-menu slot="dropdown" class="global-help-drop">
        <el-dropdown-item command="zh" :disabled="lang === 'zh'">中文</el-dropdown-item>
        <el-dropdown-item command="en" :disabled="lang === 'en'">English</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { mapState, mapMutations } from 'vuex'

@Component({
  computed: {
    ...mapState({
      lang: state => state.global.lang
    })
  },
  methods: {
    ...mapMutations({
      changeLang: 'CHANGE_LANG' // 修改notebook 模式 edit/command
    })
  }
})
export default class ChangeLang extends Vue {

  handleCommand (lang) {
    // this.$i18n.locale = lang
    window.NotebookVue.$i18n.locale = lang
    this.changeLang(lang)
  }
}
</script>
<style lang="scss">

.change-lang {
  margin-right: 10px;
  .drop-icon {
    display: block;
    line-height: 24px;
    margin-top: 12px;
    font-size: 22px;
    color: $--color-white;
    cursor: pointer;
  }
}
</style>
