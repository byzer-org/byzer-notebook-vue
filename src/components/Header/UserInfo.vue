
<template>
  <div class="user-info-wrapper">
    <el-dropdown @command="handleUser">
      <span class="el-dropdown-link user-center">
        <span class="user-box">{{simplyName}}</span><span class="username ellipsis-item">{{userInfo && userInfo.username}}</span><i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item>{{$t('login.userName')}}: {{userInfo && userInfo.username || ''}}</el-dropdown-item>
        <el-dropdown-item command="logout">{{$t('login.logout')}}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator';
import { mapActions, mapMutations, mapState } from 'vuex'

@Component({
  computed: {
    ...mapState({
      userInfo: state => state.user.userInfo
    })
  },
  methods: {
    ...mapActions({
      logout: 'HANDLE_LOGOUT'
    }),
    ...mapMutations({
      clearUserInfo: 'CLEAR_USER_INFO'
    })
  }
})

export default class UserInfo extends Vue {
  get simplyName () {
    return this.userInfo && this.userInfo.username && this.userInfo.username.slice(0, 1)
  }

  handleUser (command) {
    if (command === 'logout') {
      this.handleLogout()
    }
  }
  async handleLogout () {
    try {
      await this.logout()
      this.clearUserInfo(null)
      this.$router.push({name: 'login'})
    } catch (e) {
      console.log(e)
    }
  }
}
</script>
<style lang="scss">

.user-info-wrapper {
  display: flex;
  align-items: center;
}
.user-center {
  color: $--color-white;
  line-height: $page-header-height;
  display: flex;
  align-items: center;
  .user-box {
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 50%;
    margin-right: 5px;
    color: $--color-white;
    background-color: $--color-primary;
  }
  .username {
    max-width: 80px;
  }
}
</style>