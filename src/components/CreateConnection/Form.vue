<template>
  <div class="connect-form">
    <el-form size="small" ref="form" :model="form" :rules="rules">
      <el-form-item :label="$t('settings.connectionName')" prop="name">
        <el-input v-model.trim="form.name" :placeholder="$t('pleaseInput')">
          <template slot="prepend">{{ userInfo.username + '_' }}</template>
        </el-input>
      </el-form-item>
      <el-form-item :label="$t('settings.dataSource')" prop="datasource">
        <el-select v-model="form.datasource" style="width: 100%;" @change="value => handleInput('datasource', value)"  :placeholder="$t('pleaseSelect')">
          <el-option :label="item.label" :value="item.value" v-for="item in dataSourceList" :key="item.value"></el-option>
        </el-select>
      </el-form-item>
      <div class="connection">
        <el-form-item :label="$t('settings.url')" prop="url">
          <el-input v-model.trim="form.url" :placeholder="$t('pleaseInput')" @change="value => handleInput('url', value)" />
        </el-form-item>
        <el-form-item :label="$t('settings.driver')" prop="driver">
          <el-input v-model.trim="form.driver" :placeholder="$t('pleaseInput')" @change="value => handleInput('driver', value)" />
        </el-form-item>
        <el-form-item :label="$t('settings.username')" prop="username">
          <el-input v-model.trim="form.username" :placeholder="$t('pleaseInput')" @change="value => handleInput('username', value)" />
        </el-form-item>
        <el-form-item :label="$t('settings.password')" prop="password">
          <el-input v-model.trim="form.password" type="password" :placeholder="$t('pleaseInput')"  @change="value => handleInput('password', value)"/>
        </el-form-item>
        <div class="connection-parameters">
          <div class="connection-parameters-container">
            <div class="connection-parameters-container-key mr-12 el-form-item__label">{{$t('settings.paramName')}}</div>
            <div class="connection-parameters-container-value el-form-item__label">{{$t('settings.paramValue')}}</div>
          </div>
          <div class="connection-parameters-container" v-for="(item, index) in form.parameter" :key="index">
            <div class="connection-parameters-container-key mr-12">
              <el-form-item
                label=""
                :key="'parameter.' + index + '.name'"
                :prop="'parameter.' + index + '.name'"
                >
                <el-input v-model.trim="item.name" :placeholder="$t('pleaseInput')" />
              </el-form-item>
            </div>
            <div class="connection-parameters-container-value">
              <el-form-item
                label=""
                :key="'parameter.' + index + '.value'"
                :prop="'parameter.' + index + '.value'"
                >
                <el-input v-model.trim="item.value" :placeholder="$t('pleaseInput')" />
              </el-form-item>
            </div>
            <div class="connection-parameters-container-btns">
              <icon-btn @click.native="addParams(item)" icon="el-ksd-icon-add_16" />
              <icon-btn @click.native="removeParams(item)" :disabled="form.parameter.length < 2" icon="el-ksd-icon-minus_16" />
            </div>
          </div>
        </div>
        <div class="connection-connect">
          <el-button size="small" type="primary" @click="testConnection">{{$t('connect')}}</el-button>
          <span class="status" :class="connectionResult" v-if="connectionResult"><span class="icon"></span>{{$t(`settings.${connectionResult}`)}}</span>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { mapState, mapMutations, mapActions } from 'vuex'
import { actionsTypes } from '../../store'
import { encryptData } from '@/util'

@Component({
  computed: {
    ...mapState({
      userInfo: state => state.user.userInfo
    }),
    ...mapState('CreateConnectionModal', {
      form: state => state.form,
      type: state => state.type,
      callback: state => state.callback
    }),
    rules () {
      return {
        name: [
          { required: true, validator: this.validateName, trigger: 'blur' }
        ],
        datasource: [
          { required: true, message: this.$t('pleaseSelect'), trigger: 'change' }
        ],
        url: [
          { required: true, message: this.$t('pleaseInput'), trigger: 'blur' }
        ],
        driver: [
          { required: true, message: this.$t('pleaseInput'), trigger: 'blur' }
        ],
        username: [
          { required: true, message: this.$t('pleaseInput'), trigger: 'blur' }
        ],
        password: [
          { required: false, message: this.$t('pleaseInput'), trigger: 'blur' }
        ]
      } 
    }
  },
  methods: {
    ...mapMutations('CreateConnectionModal', {
      setModalForm: actionsTypes.SET_MODAL_FORM
    }),
    ...mapActions({
      checkConnection: 'CHECK_CONNECTION'
    })
  }
})

export default class CreateConnectionForm extends Vue {
  dataSourceList = [
    { label: 'JDBC', value: 'jdbc'}
  ]
  connectionResult = ''

  validateName (rule, value, callback) {
    if (!value) {
      return callback(new Error(this.$t('pleaseInput')))
    } else if (!/^[0-9a-zA-Z][0-9a-zA-Z_]*$/.test(value)) {
      return callback(new Error(this.$t('settings.validator1')))
    } else if (value.length > 50) {
      return callback(new Error(this.$t('settings.validator2')))
    } else {
      return callback()
    }
  }

  handleInput (key, value) {
    this.setModalForm({ [key]: value })
  }
  removeParams (item) {
    const paramsList = this.form.parameter.filter(v => v.key !== item.key)
    this.handleInput('parameter', paramsList)
  }
  addParams () {
    const paramsList = [...this.form.parameter]
    paramsList.push({
      value: '',
      name: '',
      key: String(Date.now())
    })
    this.handleInput('parameter', paramsList)
  }
  async testConnection () {
    try {
      await this.checkForm()
      this.connectionResult = 'connecting'
      const params = {
        name: this.form.name,
        content: { ...this.form }
      }
      if (params.content.password) {
        params.content.password = await encryptData(params.content.password)
      }
      const res = await this.checkConnection(params)
      this.connectionResult = res.data
    } catch (e) {
      console.log(e)
      if (e) {
        this.connectionResult = 'error'
      }
    }
  }
  checkForm () {
    return this.$refs.form.validate()
  }
}
</script>

<style lang="scss">

.connect-form {
  height: 450px;
  overflow-y: auto;
  .connection {
    border-radius: 6px;
    padding: 4px;
    padding-bottom: 8px;
    margin-top: -10px;
    background-color: $--background-color-secondary;
    &-user {
      display: flex;
      justify-content: space-between;
      .el-form-item {
        width: 178px;
      }
    }
    &-parameters {
      margin-top: 4px;
      &-container {
        display: flex;
        .el-form-item--mini.el-form-item, 
        .el-form-item--small.el-form-item {
          margin-bottom: 8px;
        }
        &-key {
          width: 137px;
          text-align: left;
        }
        &-value {
          width: 135px;
          text-align: left;
        }
        &-btns {
          margin-left: 6px;
          width: 52px;
          height: 34px;
          padding: 3px 0;
          display: flex;
        }
      }
    }
    &-connect {
      display: flex;
      .status {
        margin-left: 12px;
        padding-left: 15px;
        line-height: 28px;
        position: relative;
        .icon {
          position: absolute;
          left: 0;
          top: 9px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        &.success {
          color: $--color-success;
          .icon {
            background-color: $--color-success;
          }
        }
        &.error {
          color: $--color-danger-light;
          .icon {
            background-color: $--color-danger-light;
          }
        }
        &.connecting {
          color: $--font-color-disabled-base;
          .icon {
            background-color: $--font-color-disabled-base;
          }
        }
      }
    }
  }
}
</style>

