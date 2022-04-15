<template>
  <div class="node-container train" :class="type === 'add' && 'extra-style'">
    <div class="node-container-form">
      <el-form ref="form" label-position="top" :model="ruleForm" :rules="rules">
        <el-form-item :label="$t('selectAlgorithm')" prop="algorithm">
          <el-select v-model="ruleForm.algorithm" @change="changeAlgorithm" style="width: 100%;" :placeholder="$t('pleaseSelect')">
            <el-option filterable :label="item.name" :value="item.name" v-for="item in algorithmList" :key="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('tableTrained')" prop="source">
          <el-select filterable v-model="ruleForm.source" style="width: 100%;" :placeholder="$t('pleaseSelect')">
            <el-option :label="item" :value="item" v-for="item in tableList" :key="item"></el-option>
          </el-select>
          <el-alert
            class="hide-bg"
            v-if="!tableList.length"
            :title="$t('noTableTip')"
            icon="el-ksd-icon-info_border_16"
            :show-background="false"
            :closable="false"
            type="info">
          </el-alert>
        </el-form-item>
        <template v-if="ruleForm.algorithm && Object.keys(parameters).length">
          <!-- Object.keys(parameters).length 当 originParamter 刚刚获取到，paramters 还未生成时会出现报错（初始值类型可能不对） -->
          <div class="form-custom">
            <span class="txt-danger">* </span>
            <span class="label">{{$t('parameterSetting')}}</span>
          </div>
          <el-form class="form-form" ref="paramForm" label-position="left" label-width="160px" :model="parameters">
            <el-form-item
              v-for="formItem in originParamter"
              :key="formItem.name"
              :prop="formItem.name"
              :rules="[
                { required: formItem.required, type: 'arr', validator: (rule, value, callback) => validateParameter(rule, value, callback, formItem), trigger: ['ARRAY', 'ENUM'].includes(formItem.value_type) ? 'change' : 'blur' },
              ]">
              <span slot="label">
                <el-tooltip placement="top" :content="formItem.description" :disabled="!formItem.description" >
                  <span>{{formItem.name}}</span>
                </el-tooltip>
              </span>
              <el-select v-if="formItem['value_type'] === 'ENUM'" v-model="parameters[formItem.name]" style="width: 100%;" :placeholder="$t('pleaseSelect')">
                <el-option :label="item" :value="item" v-for="item in formItem['enum_values']" :key="item"></el-option>
              </el-select>
              <!-- <InputToTag :key="formItem.name" v-model="parameters[formItem.name]" v-else-if="formItem['value_type'] === 'ARRAY'"/> -->
              <el-select
                :key="formItem.name"
                v-else-if="formItem['value_type'] === 'ARRAY'"
                v-model="parameters[formItem.name]"
                multiple
                filterable
                allow-create
                :duplicate-remove="true"
                :placeholder="$t('pleaseInput')"
                default-first-option>
              </el-select>
              <el-input v-else v-model.trim="parameters[formItem.name]" style="width: 100%;" :placeholder="$t('pleaseInput')" />
            </el-form-item>
          </el-form>
        </template>
        <el-form-item :label="$t('modelName')" prop="target">
          <el-input v-model.trim="ruleForm.target" :placeholder="$t('pleaseInput')" />
        </el-form-item>
        <el-form-item :label="$t('savePath')" prop="save_path">
          <el-input v-model.trim="ruleForm.save_path" :placeholder="$t('pleaseInput')" />
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
import { mapActions } from 'vuex'
import CodeEditor from '../CodeEditor'
import InputToTag from '../../../../../components/InputTag'
import { getParamGroup, getParamsGroupObj } from './handler'
import ParameterValid from './ParameterValid.vue'

@Component({
  props: ['initRuleForm', 'type'],
  computed: {
    rules () {
      return {
        source: [
          { required: true, message: this.$t('pleaseSelect'), trigger: 'change' }
        ],
        algorithm: [
          { required: true, message: this.$t('pleaseSelect'), trigger: 'change' }
        ],
        target: [
          { required: true, validator: this.validateModel, trigger: 'blur' }
        ],
        save_path: [
          { required: true, validator: this.validatePath, trigger: 'blur' }
        ]
      }
    }
  },
  components: {
    CodeEditor,
    InputToTag
  },
  methods: {
    ...mapActions({
      getExistingList: 'GET_EXISTING_TABLE',
      getAlgorithmList: 'GET_ALGORITHM_LIST',
      getParamsById: 'GET_PARAM_BY_ID',
      getExistingModel: 'GET_EXISTING_MODEL'
    })
  },
  mixins: [ParameterValid]
})
export default class TrainNodeForm extends Vue {
  ruleForm = {
    algorithm: '',
    target: '',
    source: '',
    save_path: '',
    group_size: 1,
    train_param: this.parameters
  }
  parameters = {}
  originParamter = []
  modelList = [] // 用于校验 model

  algorithmList = []
  tableList = []
  initModel = ''
  initSql = ''

  @Watch('initRuleForm')
  onInitRuleFormChange () {
    this.initData()
  }

  get detailIsChanged () {
    const newSql = this.connectedMlsql
    return this.initSql !== newSql
  }

  get connectedMlsql () {
    return this.getConnectionMlsql(this.ruleForm)
  }

  validateModel (rule, value, callback) {
    if (!value) {
      return callback(new Error(this.$t('pleaseInput')))
    } else {
      return this.checkPathIsDuplicate(callback)
    }
  }
  checkPathIsDuplicate (callback) {
    const model = this.getCompleteModel(this.ruleForm)
    const initModel = this.type === 'edit' ? this.getCompleteModel(this.initRuleForm) : ''
    // 和初始的相同可以保存 和初始值不同并且在已有 model 列表中不能找到同名的
    const duplicateModelsCount = this.modelList.filter(v => v.path === model).length
    if (duplicateModelsCount > 0 && initModel !== model) {
      return callback(new Error(this.$t('modelExist')))
    } else {
      return callback()
    }
  }
  validatePath (rule, value, callback) {
    if (!value) {
      return callback(new Error(this.$t('pleaseInput')))
    } else if (!value.startsWith('/')) {
      return callback(new Error(this.$t('pathValid')))
    } else {
      return this.checkPathIsDuplicate(callback)
    }
  }

  async getExistModels () {
    try {
      const res = await this.getExistingModel()
      this.modelList = res.data?.models ?? []
    } catch (e) {
      console.log(e)
    }
  }

  getCompleteModel ({ target, save_path }) {
    return `${save_path}/${target}`
  }

  created () {
    this.getAlgorithms()
    this.getExistTables()
    this.getExistModels()
  }

  getConnectionMlsql (form) {
    if (!form) {
      return ''
    }
    const {
      algorithm = '',
      source = '',
      target = '',
      save_path = ''
    } = form || {}
    const str = getParamGroup(this.originParamter, this.parameters)
    const mode = this.getCompleteModel({ target, save_path })
    return `train ${source} as ${algorithm}.\`${mode}\` ${ str ? `where ${str}` : ''};`
  }

  initData () {
    const form = this.initRuleForm || {}
    const { algorithm = '', source = '', target = '', save_path = '', train_param = '' } = form
    this.ruleForm = {
      algorithm,
      source,
      target,
      save_path,
      train_param
    }
    if (algorithm) {
      this.getParamters(JSON.parse(train_param))
    }
  }

  async getAlgorithms () {
    try {
      const res = await this.getAlgorithmList()
      this.algorithmList = res.data.def_list || []
      this.initData()
    } catch (e) {
      console.log(e)
    }
  }
  async getExistTables () {
    try {
      const res = await this.getExistingList()
      this.tableList = res.data?.output ?? []
    } catch (e) {
      console.log(e)
    }
  }
  changeAlgorithm () {
    this.originParamter = []
    this.parameters = null
    this.getParamters()
  }
  getParamsAndInitSql (parameters) {
    this.originParamter.forEach(v => {
      this.$set(this.parameters, v.name, this.getDefaultValue(v, parameters))
    })
    if (parameters) {
      this.$nextTick(() => {
        this.initSql = this.getConnectionMlsql(this.initRuleForm)
      })
    }
  }
  async getParamters (parameters) {
    this.parameters = {}
    if (!this.ruleForm.algorithm) {
      return
    }
    const train_node_id = this.algorithmList.find(v => v.name === this.ruleForm.algorithm)?.id ?? ''
    if (!train_node_id) {
      return
    }
    try {
      const res = await this.getParamsById(train_node_id)
      this.originParamter = res.data?.params ?? []
      this.getParamsAndInitSql(parameters)
    } catch (e){
      console.log(e)
    }
  }
  validateParameter (rule, value, callback, item) {
    const paramGroupObj = getParamsGroupObj(this.originParamter, this.parameters)
    const length = paramGroupObj && paramGroupObj.allGroup && paramGroupObj.allGroup.length || 0
    this.validAllTypeParameters(rule, value, callback, item, length)
  }
  clearResult () {
    this.$refs.form?.clearValidate()
    this.$refs.paramForm?.clearValidate()
  }
  checkForm () {
    const paramGroupObj = getParamsGroupObj(this.originParamter, this.parameters)
    let size = 1
    if (paramGroupObj && paramGroupObj.allGroup) {
      const { allGroup } = paramGroupObj
      size = allGroup.length
    }
    this.ruleForm.group_size = size > 0 ? size : 1
    this.ruleForm.train_param = JSON.stringify(this.parameters)
    return Promise.all([this.$refs.form.validate(), this.$refs.paramForm.validate()])
  }
  onCopy () {
    this.$message.success(this.$t('copySuccess'))
  }

}
</script>

<style lang="scss">

.node-container.train {
  .node-container-form {
    padding: 16px;
    .form-form {
      padding-left: 12px;
      padding-bottom: 8px;
    }
    .el-form--label-top {
      .el-form--label-left {
        .el-form-item {
          margin-bottom: 2px;
          .el-form-item__label {
            float: left;
            line-height: 34px !important;
          }
        }
      }
    }
    .form-custom {
      line-height: 34px;
      font-weight: 500;
      .start {
        margin-right: 5px;
      }
    }
  }
}
</style>

