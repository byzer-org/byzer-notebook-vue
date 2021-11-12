<!--

-->

<template>
  <el-menu :default-active="activeIndex" class="el-menu-header" mode="horizontal" @select="handleSelect">
    <el-menu-item index="home">
      <template slot="title">
        <svg-icon class="menu-icon font-24" icon-class="nav_homepage_24"></svg-icon>
        <span>{{$t('menu.home')}}</span>
      </template>
    </el-menu-item>
     <el-menu-item index="notebook">
      <template slot="title">
        <svg-icon class="menu-icon font-24" icon-class="nav_workspace_24"></svg-icon>
        <span>{{$t('menu.workspace')}}</span>
      </template>
    </el-menu-item>
    <el-menu-item index="jobs">
      <template slot="title">
        <svg-icon class="menu-icon font-24" icon-class="nav_monitor_24"></svg-icon>
        <span>{{$t('menu.jobs')}}</span>
      </template>
    </el-menu-item>
    <el-menu-item index="settings" v-if="!isTrial">
      <template slot="title">
        <svg-icon class="menu-icon font-24" icon-class="nav_setting_24"></svg-icon>
        <span>{{$t('menu.settings')}}</span>
      </template>
    </el-menu-item>
  </el-menu>
</template>
<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {}
  },
  computed: {
    ...mapState({
      isTrial: state => state.global.is_trial
    }),
    activeIndex () {
      return this.$route.name
    }
  },
  methods: {
    handleSelect(key) {
      this.$router.push({name: key})
    }
  }
}
</script>
<style lang="scss">
@import '../../assets/css/config.scss';
.el-menu--horizontal {
  &.el-menu-header {
    .el-menu-item:not(.is-disabled):focus, .el-menu-item:not(.is-disabled):hover, .el-submenu .el-submenu__title:hover {
      background-color: rgb(8, 69, 125);
      outline: 0;
      color: #fff;
    }
    > .el-menu-item {
      height: $page-header-height;
      line-height: $page-header-height;
      background-color: $--color-nav;
      color: #fff;
      &.is-active {
        color: #fff;
      }
      .menu-icon {
        font-size: 24px;
        vertical-align: middle;
        margin-right: 5px;
      }
    } 
  }
}
</style>