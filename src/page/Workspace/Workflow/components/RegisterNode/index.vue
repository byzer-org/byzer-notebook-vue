<template>
  <div class="node-container register" :class="type === 'add' && 'extra-style'">
    <div class="node-container-form">
      <el-form ref="form" label-position="top" :model="ruleForm" :rules="rules">
        <el-form-item label="Select the Model to be registered" prop="source">
          <el-select filterable v-model="ruleForm.source" style="width: 100%;" :placeholder="$t('pleaseSelect')">
            <el-option :label="item.model" :value="item.model" v-for="item in modelList" :key="item.model"></el-option>
          </el-select>
          <el-alert
            class="hide-bg"
            v-if="!modelList.length"
            :title="$t('workflow.noModelTip')"
            icon="el-ksd-icon-info_border_16"
            :show-background="false"
            :closable="false"
            type="info">
          </el-alert>
        </el-form-item>
        <el-form-item label="Resigter the Model as a function" prop="target">
          <el-input v-model.trim="ruleForm.target" :placeholder="$t('pleaseInput')" />
        </el-form-item>
        <el-form-item class="mb0">
          <span slot="label"><el-checkbox label="Deploy Mode" v-model="deploy_mode"></el-checkbox></span>
        </el-form-item>
        <el-form-item ref="deployUrl" label="URL" class="indent" prop="deploy_mode_param.url">
          <el-input :disabled="!deploy_mode" v-model.trim="ruleForm.deploy_mode_param.url" :placeholder="$t('pleaseInput')" />
        </el-form-item>
        <el-form-item ref="deployToken" label="Access Token" class="indent" prop="deploy_mode_param.access_token">
          <el-input :disabled="!deploy_mode" v-model.trim="ruleForm.deploy_mode_param.access_token" :placeholder="$t('pleaseInput')" />
        </el-form-item>
      </el-form>
    </div>
    <div class="view-sql">
      <div class="view-sql-label">
        Byzer VIEWER
        <el-tooltip placement="top" :content="$t('copy')">
          <i class="hasEvent copy-icon el-ksd-icon-dup_16" type="text" v-clipboard:success="onCopy" v-clipboard:copy="connectedMlsql"></i>
        </el-tooltip>
      </div>
      <div class="view-sql-content">
        <CodeEditor height="100" :value="connectedMlsql" :showGutter="false" :readOnly="true"></CodeEditor>
      </div>
    </div>
  </div>
</template>

<script>
import { Component, Vue, Watch } from 'vue-property-decorator'
import { mapState, mapActions } from 'vuex'
import CodeEditor from '../CodeEditor'

@Component({
  props: ['initRuleForm', 'type'],
  computed: {
    ...mapState({
      activeNotebook: state => state.notebook.activeNotebook
    }),
    rules () {
      return {
        source: [
          { required: true, message: this.$t('pleaseSelect'), trigger: 'change' }
        ],
        target: [
          { required: true, validator: this.validateTarget, trigger: 'blur' }
        ],
        'deploy_mode_param.url': [
          { required: false, validator: this.validateURL, trigger: 'blur' }
        ],
        'deploy_mode_param.access_token': [
          { required: false, validator: this.validateToken, trigger: 'blur' }
        ]
      }
    }

  },
  methods: {
    ...mapActions({
      getExistingModel: 'GET_EXISTING_MODEL',
      getExistingTable: 'GET_EXISTING_TABLE'
    })
  },
  components: {
    CodeEditor
  }
})
export default class SaveNodeForm extends Vue {
  ruleForm = {
    target: '',
    source: '',
    deploy_mode_param: {
      url: '',
      access_token: ''
    }
  }
  deploy_mode = false
  modelList = []
  tableList = [] // 用于校验 function 是否重复
  originDeployParams = ''
  initSql = ''

  @Watch('initRuleForm')
  onInitRuleFormChange () {
    this.initData()
    this.originDeployParams = JSON.stringify(this.initRuleForm.deploy_mode_param)
  }

  @Watch('deploy_mode')
  onDeployModeChange () {
    this.resetDeployForm()
  }

  get detailIsChanged () {
    const newSql = this.connectedMlsql
    const url_token_changed = this.originDeployParams !== JSON.stringify(this.ruleForm.deploy_mode_param)
    return this.initSql !== newSql || url_token_changed
  }

  get connectedMlsql () {
    return this.getConnectionMlsql(this.ruleForm)
  }

  mounted () {
    this.getExistModels()
    this.getExistTables()
  }

  resetDeployForm () {
    this.$refs.deployUrl.resetField()
    this.$refs.deployToken.resetField()
  }

  validateTarget (rule, value, callback) {
    if (!value) {
      return callback(new Error(this.$t('pleaseInput')))
    } else {
      const initOutput = this.initRuleForm?.target ?? ''
      const duplicateOutputCount = this.tableList.filter(v => v === value).length
      const isDuplicate = (duplicateOutputCount > 0) && (initOutput !== value)
      return isDuplicate ? callback(new Error(this.$t('workflow.outputDuplicate'))) : callback()
    }
  }

  validateURL (rule, value, callback) {
    if (!value && this.deploy_mode) {
      return callback(new Error(this.$t('pleaseInput')))
    } else {
      return callback()
    }
  }

  validateToken (rule, value, callback) {
    if (!value && this.deploy_mode) {
      return callback(new Error(this.$t('pleaseInput')))
    } else {
      return callback()
    }
  }

  getConnectionMlsql (form) {
    if (!form) {
      return ''
    }
    const {
      source = '',
      target = ''
    } = form || {}
    return `register ${source} as ${target};`
  }

  initData () {
    const form = this.initRuleForm || {}
    const { source = '', target = '', deploy_mode_param = { url: '', access_token: '' } } = form
    const modelItem = this.modelList.find(v => (v.model === source))
    let source1 = modelItem ? modelItem.model : ''
    this.ruleForm = {
      source: source1,
      target,
      deploy_mode_param
    }
    if (deploy_mode_param.url || deploy_mode_param.access_token) {
      this.deploy_mode = true
    }
    this.initSql = this.getConnectionMlsql(this.ruleForm)
  }
  async getExistTables () {
    try {
      const res = await this.getExistingTable()
      this.tableList = res.data?.output ?? []
    } catch (e) {
      console.log(e)
    }
  }
  async getExistModels () {
    try {
      const id = this.activeNotebook.id
      const res = await this.getExistingModel(id)
      const list = res.data?.models ?? []
      this.modelList = list.map(item => ({model: `${item.algorithm}.\`${item.path}\``}))
      this.initData()
    } catch (e){
      console.log(e)
    }
  }

  clearResult () {
    this.$refs.form.clearValidate()
  }

  checkForm () {
    this.$refs.form.validate(valid => {
      if (valid) {
        if (!this.deploy_mode) {
          this.ruleForm.deploy_mode_param = {
            url: '',
            access_token: ''
          }
        }
      }
    })
    return this.$refs.form.validate()
  }
  onCopy () {
    this.$message.success(this.$t('copySuccess'))
  }
}
</script>

<style lang="scss">
</style>

