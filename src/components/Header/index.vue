
<template>
  <div class="page-header">
    <div class="page-header-left">
      <span class="page-header-left-logo">Byzer Notebook</span>
      <header-menu v-if="!isLoginPage"></header-menu>
    </div>
    <div class="page-header-right">
      <EngineInfo />
      <GlobalHelp />
      <ChangeLang />
      <UserInfo class="page-header-right-item" v-if="!isLoginPage" />
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import HeaderMenu from './HeaderMenu'
import UserInfo from './UserInfo'
import GlobalHelp from './GlobalHelp'
import ChangeLang from './ChangeLang'
import EngineInfo from './EngineInfo'
import { mapState } from 'vuex'
@Component({
  components: {
    HeaderMenu,
    UserInfo,
    GlobalHelp,
    ChangeLang,
    EngineInfo
  },
  computed: {
    ...mapState({
      userInfo: state => state.user.userInfo,
      isTrial: state => state.global.is_trial
    }),
    isLoginPage () {
      return this.$route.name === 'login'
    }
  }
})
export default class Header extends Vue {
}
</script>
<style lang="scss" scoped>

.page-header {
  display: flex;
  background-color: $--color-nav;
  height: $page-header-height;
  justify-content: space-between;
  &-left {
    display: flex;
    &-logo {
      width: 300px;
      font-size: 20px;
      color: $--color-white;
      line-height: 48px;
      padding: 0 20px;
    }
  }
  &-right {
    padding-right: 20px;
    display: flex;
    &-item {
      margin-left: 10px;
    }
  }
}
</style>