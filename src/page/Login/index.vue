
<template>
  <div id="loginPage">
    <div class="login-box">
      <div class="login-logo">
        <div class="login-logo-text">Byzer Notebook</div>
      </div>
      <div class="login-form">
        <el-form :model="user" ref="loginForm" :rules="rules">
          <div class="input_group">
            <el-form-item label="" prop="username">
              <el-input v-model.trim="user.username" auto-complete="on" :autofocus="true" :placeholder="$t('login.userName')" name="username"></el-input>
            </el-form-item>
            <el-form-item label="" prop="password" class="password">
              <el-input type="password" v-model.trim="user.password" name="password" :placeholder="$t('login.password')"></el-input>
            </el-form-item>
          </div>
          <el-form-item class="login-btn" :class="isTrial && 'hide-sign'">
            <el-button v-if="!isTrial" size="medium" @click.native="checkForm('sign-up')" :disabled="loadingLogin" :loading="loadingSign">{{$t('login.signUp')}}</el-button>
            <el-button type="primary" size="medium" native-type="submit" @click.native="checkForm('login')" :disabled="loadingSign" :loading="loadingLogin">{{$t('login.signIn')}}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapState, mapActions } from 'vuex'
@Component({
  computed: {
    ...mapState({
      isTrial: state => state.global.is_trial
    })
  },
  methods: {
    ...mapActions({
      handleLogin: 'HANDLE_LOGIN',
      handleSignUp: 'HANDLE_SIGN_UP'
    })
  }
})

export default class Login extends Vue {
  // 读取 url 中是否有username 有则填充 没有则不填充
  loadingLogin = false
  loadingSign = false
  user = {
    username: '',
    password: ''
  }
  showSignUp = true
  @Watch('$route')
  onRouteParamChange () {
    this.setUsernameToForm()
  }

  mounted () {
    this.setUsernameToForm()
  }

  setUsernameToForm () {
    const { query }= this.$route
    if (query.username && !this.user.username) {
      this.user.username = query.username
    }
  }

  get rules () {
    return {
      username: [{ required: true, message: this.$t('login.noUserName'), trigger: 'blur' }],
      password: [{ required: true, message: this.$t('login.noUserPwd'), trigger: 'blur' }]
    }
  }

  checkForm (type) {
    this.$refs['loginForm'].validate(valid => {
      if (valid) {
        if (type === 'login') {
          this.submitLogin()
        } else {
          this.submitSignUp()
        }
      }
    })
  }

  async submitSignUp () {
    this.loadingSign = true
    try {
      await this.handleSignUp(this.user)
      this.loadingSign = false
      this.submitLogin()
    } catch (e) {
      this.loadingSign = false
    }
  }
  async submitLogin () {
    this.loadingLogin = true
    try {
      await this.handleLogin(this.user)
      this.loadingLogin = false
      this.$router.push({name: 'home'})
    } catch (e) {
      this.loadingLogin = false
    }
  }
}
</script>
<style lang="scss">
@import '../../assets/css/variable.scss';
#loginPage {
  .login-box {
    width: 500px;
    height: 420px;
    border-radius: 4px;
    box-shadow: inset 0px 0px 10px 0px $--border-color-light;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .login-logo {
      padding-top: 50px;
      &-text {
        font-size: 30px;
        font-weight: 500;
        width: 100%;
        text-align: center;
      }
      img {
        display: block;
        margin: 0 auto;
        height: 71px;
        width: 100px;
      }
    }
    .login-form {
      padding: 50px 100px;
      .login-btn {
        margin-top: 30px;
        text-align: right;
        &.hide-sign {
          .el-button {
            width: 300px;
          }
        }
        .el-button {
          width: 145px;
        }
      }
      .sign-up-tip {
        margin-top: 20px;
        font-size: 12px;
      }
    }
  }
}
</style>
