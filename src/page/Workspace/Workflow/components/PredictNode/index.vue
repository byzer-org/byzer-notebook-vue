<template>
  <div class="node-container" :class="type === 'add' && 'extra-style'">
    <div class="node-container-form">
      <el-form ref="form" label-position="top" :model="ruleForm" :rules="rules">
        <el-form-item label="Select the Table to Be Predicted" prop="source">
          <el-select v-model="ruleForm.source" style="width: 100%;" :placeholder="$t('pleaseSelect')">
            <el-option :label="item" :value="item" v-for="item in tableList" :key="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Select the Model" prop="model">
          <el-select filterable v-model="ruleForm.model" @change="changeModel" style="width: 100%;" :placeholder="$t('pleaseSelect')">
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
        <el-form-item label="Select the Prediction Parameter Group" prop="predict_param.auto">
          <el-radio-group v-model="ruleForm.predict_param.auto" @change="changeGroupType">
            <el-radio :label="true">Auto Recommendation</el-radio>
            <el-radio :label="false">Custom</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="autoSelectByMetric" class="indent predict" key="auto" prop="predict_param.value" v-if="ruleForm.predict_param.auto">
          <el-select v-model="ruleForm.predict_param.value" style="width: 100%;" :placeholder="$t('pleaseSelect')">
            <el-option :label="item" :value="item" v-for="item in modelGroupList" :key="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Model Group Index" class="indent predict" prop="predict_param.value" key="custom" v-else>
          <el-select v-model="ruleForm.predict_param.value" style="width: 100%;" :placeholder="$t('pleaseSelect')">
            <el-option :label="item.label" :value="item.value" v-for="item in aigIndexList" :key="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Output" prop="target">
          <el-input v-model.trim="ruleForm.target" style="width: 100%;" :placeholder="$t('pleaseInput')" />
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
        model: [
          { required: true, message: this.$t('pleaseSelect'), trigger: 'change' }
        ],
        target: [
          { required: true, validator: this.validateTarget, trigger: 'blur' }
        ],
        'predict_param.auto': [
          { required: true, message: this.$t('pleaseSelect'), trigger: 'change' }
        ],
        'predict_param.value': [
          { required: false, validator: this.validateValue, trigger: 'change'}
        ]
      }
    }
  },
  methods: {
    ...mapActions({
      getExistingTable: 'GET_EXISTING_TABLE',
      getExistingModel: 'GET_EXISTING_MODEL',
      getModelGroup: 'GET_MODEL_GROUP',
      getModelIndex: 'GET_MODEL_INDEX'
    })
  },
  components: {
    CodeEditor
  }
})
export default class SaveNodeForm extends Vue {
  ruleForm = {
    source: '',
    target: '',
    model: '',
    predict_param: {
      auto: true,
      value: ''
    }
  }
  tableList = []
  modelList = []
  aigIndexList = []
  modelGroupList = ['f1', 'weightedPrecision', 'weightedRecall', 'accuracy']
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

  created () {
    this.getExistTables()
    this.getExistModels()
  }

  changeModel (value) {
    const modelItem = this.modelList.find(item => (value === item.model))
    if (modelItem) {
      this.aigIndexList = this.getAigIndexs(modelItem.group_size)
    } else {
      this.aigIndexList = []
    }
  }

  getAigIndexs (length) {
    let arr = []
    for (let i = 0; i < length; i++) {
      arr.push({value: i, label: `${i}`})
    }
    return arr
  }

  validateValue (rule, value, callback) {
    if (!value && value !== 0) {
      return callback(new Error(this.$t('pleaseSelect')))
    } else {
      return callback()
    }
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

  validateGroup (rule, value, callback) {
    if (!value) {
      return callback(this.$t('pleaseSelect'))
    }
  }

  getConnectionMlsql (form) {
    if (!form) {
      return ''
    }
    const {
      source = '',
      target = '',
      model = '',
      predict_param = {
        auto: true,
        value: ''
      }
    } = form
    const { auto, value } = predict_param
    const param = auto ? 'autoSelectByMetric' : 'aigIndex'
    return `predict ${source} as ${model} where ${param}="${value}" as ${target};`
  }

  initData () {
    const form = this.initRuleForm || {}
    const { source = '', model = '', target = '', predict_param = { auto: true, value: ''} } = form
    const modelItem = this.modelList.find(v => (v.model === model))
    let model1 = modelItem ? modelItem.model : ''
    this.changeModel(model1)
    if (!modelItem && !predict_param.auto) {
      predict_param.value = ''
    }
    this.ruleForm = {
      source,
      model: model1,
      target,
      predict_param
    }
    this.initSql = this.getConnectionMlsql(this.ruleForm)
  }
  changeGroupType () {
    this.ruleForm.predict_param.value = ''
  }

  async getExistTables () {
    try {
      const res = await this.getExistingTable()
      this.tableList = res.data?.output ?? []
    } catch (e){
      console.log(e)
    }
  }
  async getExistModels () {
    try {
      const id = this.activeNotebook.id
      const res = await this.getExistingModel(id)
      const list = res.data?.models ?? []
      this.modelList = list.map(item => ({model: `${item.algorithm}.\`${item.path}\``, group_size: item.group_size}))
      this.initData()
    } catch (e) {
      console.log(e)
    }
  }

  clearResult () {
    this.$refs.form.clearValidate()
  }

  checkForm () {
    return this.$refs.form.validate()
  }
  onCopy () {
    this.$message.success(this.$t('copySuccess'))
  }
}
</script>

<style lang="scss">
</style>

