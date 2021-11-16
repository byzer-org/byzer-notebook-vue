
<template>
  <div class="page-header">
    <div class="page-header-left">
      <img src="@/assets/images/MLSQL_LAB.svg" alt="" v-if="isTrial">
      <!-- <img src="@/assets/images/logo.svg" alt="" v-else> -->
      <span class="page-header-left-logo" v-else>Byzer</span>
      <header-menu v-if="!isLoginPage"></header-menu>
    </div>
    <div class="page-header-right">
      <GlobalHelp />
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
import { mapState } from 'vuex'
@Component({
  components: {
    HeaderMenu,
    UserInfo,
    GlobalHelp
  },
  computed: {
    ...mapState({
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
@import '../../assets/css/config.scss';
.page-header {
  display: flex;
  background-color: $--color-nav;
  height: $page-header-height;
  justify-content: space-between;
  &-left {
    display: flex;
    &-logo {
      width: 180px;
      font-size: 20px;
      color: $--color-white;
      line-height: 48px;
      padding: 0 20px;
    }
    img {
      width: 180px;
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