<template>
  <div class="node-container load" :class="type === 'add' && 'extra-style'">
    <div class="node-container-form">
      <el-form ref="form" label-position="top" :model="ruleForm" :rules="rules">
        <el-form-item label="Data Source" prop="datasource_type">
          <el-select v-model="ruleForm.datasource_type" @change="changeDatasourceType" style="width: 100%;" :placeholder="$t('pleaseSelect')">
            <el-option :label="item.label" :value="item.value" v-for="item in dataSourceList" :key="item.value"></el-option>
          </el-select>
        </el-form-item>
        <div class="form-part" v-if="ruleForm.datasource_type==='hdfs'">
          <el-form-item label="Data Type" prop="data_type">
            <el-select v-model="ruleForm.data_type" @change="handleChangeDataType" style="width: 100%;" :placeholder="$t('pleaseSelect')">
              <el-option :label="item" :value="item" v-for="item in dataTypeList" :key="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Source File Name" prop="source" key="hdfs-source">
            <el-cascader
              style="width: 100%;"
              :props="casProps"
              v-model="ruleForm.source"
              filterable
              :separator="'/'"
              clearable
            ></el-cascader>
          </el-form-item>
        </div>
        <div class="form-part" v-if="['hive'].includes(ruleForm.datasource_type)">
          <el-form-item label="Database" prop="database" key="hive-database">
            <el-select filterable v-model="ruleForm.database" @visible-change="getDatabaseList" @change="changeDatabase" style="width: 100%;" :placeholder="$t('pleaseSelect')">
              <el-option :label="item" :value="item" v-for="item in databaseList" :key="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Source Table Name" prop="source" key="hive-table">
            <el-select filterable v-model="ruleForm.source" @visible-change="getTableList"  style="width: 100%;" :placeholder="$t('pleaseSelect')">
              <el-option :label="item" :value="item" v-for="item in tableList" :key="item"></el-option>
            </el-select>
          </el-form-item>
        </div>
        <div class="form-part" v-if="['deltalake'].includes(ruleForm.datasource_type)">
          <el-form-item label="Database" prop="database" key="deltalake-database">
            <el-select filterable v-model="ruleForm.database" @visible-change="getDatabaseList" @change="changeDatabase" style="width: 100%;" :placeholder="$t('pleaseSelect')">
              <el-option :label="item" :value="item" v-for="item in databaseList" :key="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Source Table Name" prop="source" key="deltalake-table">
            <el-select filterable v-model="ruleForm.source" @visible-change="getTableList" style="width: 100%;" :placeholder="$t('pleaseSelect')">
              <el-option :label="item" :value="item" v-for="item in tableList" :key="item"></el-option>
            </el-select>
          </el-form-item>
        </div>
        <div class="form-part" v-if="ruleForm.datasource_type==='jdbc'">
          <el-form-item label="Exsisting Connection" prop="connection">
            <el-select filterable v-model="ruleForm.connection" :disabled="!connectionList.length" @change="changeConnection" style="width: 100%;" :placeholder="$t('pleaseSelect')">
              <el-option :label="item.name" :value="item.id" v-for="item in connectionList" :key="item.id"></el-option>
            </el-select>
            <el-alert
              class="hide-bg"
              v-if="!connectionList.length"
              :title="$t('workflow.connectionTip')"
              icon="el-ksd-icon-info_border_16"
              :show-background="false"
              :closable="false"
              type="info">
            </el-alert>
          </el-form-item>
          <el-form-item label="Source Table Name" prop="source" key="jdbc-source">
            <el-select filterable v-model="ruleForm.source" @visible-change="getTableByConnection" style="width: 100%;" :placeholder="$t('pleaseSelect')">
              <el-option :label="item" :value="item" v-for="item in connectionTableList" :key="item"></el-option>
            </el-select>
            <el-alert
              class="hide-bg"
              v-if="!connectionList.length"
              :title="$t('workflow.connectionTip')"
              icon="el-ksd-icon-info_border_16"
              :show-background="false"
              :closable="false"
              type="info">
            </el-alert>
          </el-form-item>
        </div>
        <el-form-item label="Output" prop="target">
          <el-input v-model.trim="ruleForm.target" :placeholder="$t('pleaseInput')"></el-input>
        </el-form-item>
        <el-form-item label="Advanced Parameter" v-if="(ruleForm.datasource_type==='hdfs') && (ruleForm.data_type === 'csv')">
          <el-switch v-model="showAdvancedParams"></el-switch>
        </el-form-item>
        <!-- advanced parameter -->
        <template v-if="showAdvancedParams && (ruleForm.datasource_type==='hdfs') && (ruleForm.data_type === 'csv')">
          <el-form class="form-form" ref="paramForm" label-position="left" label-width="160px" :model="parameters" >
            <el-form-item
              v-for="formItem in originParamter"
              :key="formItem.name"
              :prop="formItem.name"
              :rules="[
                { required: formItem.required, validator: (rule, value, callback) => validateParameter(rule, value, callback, formItem), trigger: ['ARRAY', 'ENUM'].includes(formItem.value_type) ? 'change' : 'blur' },
              ]">
              <span slot="label">
                <el-tooltip placement="top" :content="formItem.description" :disabled="!formItem.description" >
                  <span>{{formItem.name}}</span>
                </el-tooltip>
              </span>
              <el-select v-if="formItem['value_type'] === 'ENUM'" v-model="parameters[formItem.name]" style="width: 100%;" :placeholder="$t('pleaseSelect')">
                <el-option :label="item" :value="item" v-for="item in formItem['enum_values']" :key="item"></el-option>
              </el-select>
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
      </el-form>
    </div>
    <div class="view-sql">
      <div class="view-sql-label">Byzer VIEWER
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
import { dataTypeList, dataSourceList } from '@/config'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { mapState, mapActions } from 'vuex'
import CodeEditor from '../CodeEditor'
import ParameterValid from '../TrainNode/ParameterValid.vue'

@Component({
  props: ['initRuleForm', 'type'],
  computed: {
    ...mapState({
      isTrial: state => state.global.is_trial
    }),
    rules () {
      return {
        datasource_type: [
          { required: true, message: this.$t('pleaseSelect'), trigger: 'change' }
        ],
        data_type: [
          { required: true, message: this.$t('pleaseSelect'), trigger: 'change' }
        ],
        database: [
          { required: true, message: this.$t('pleaseSelect'), trigger: 'change' }
        ],
        connection: [
          { required: true, message: this.$t('pleaseSelect'), trigger: 'change' }
        ],
        source: [
          { required: true, message: this.$t('pleaseSelect'), trigger: 'change' }
        ],
        target: [
          { required: true, validator: this.validateTarget, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    ...mapActions({
      getFileList: 'GET_FILE_LIST',
      getConnectionList: 'GET_CONNECTION_LIST',
      getExistingTable: 'GET_EXISTING_TABLE',
      getConnectionTable: 'GET_CONNECTION_TABLE',
      getDBList: 'GET_DB_LIST',
      getTables: 'GET_TABLE_LIST',
      getLoadParams: 'GET_LOAD_PARAMS'
    })
  },
  components: {
    CodeEditor
  },
  mixins: [ParameterValid]
})

export default class LoadNodeForm extends Vue {
  emitPath = false
  ruleForm = {
    datasource_type: '',
    database: '',
    connection: '',
    data_type: '',
    source: '',
    target: '',
    extra_params: this.parameters
  }
  allDataSourceList = dataSourceList
  dataTypeList = dataTypeList
  fileList = []
  existingTableList = []
  tableList = []
  connectionTableList = []
  connectionList = []
  databaseList = []
  headerList = ['true', 'false']
  casProps = {
    lazy: true,
    checkStrictly: true,
    lazyLoad: (node, resolve) => {
      this.getFileListByFolder(node, resolve)
    }
  }
  parameters = {}
  originParamter = []
  showAdvancedParams = true

  @Watch('initRuleForm')
  onInitRuleFormChange () {
    this.initData()
  }

  get detailIsChanged () {
    const originSql = this.getConnectionMlsql(this.initRuleForm)
    const newSql = this.connectedMlsql
    return originSql !== newSql
  }

  get dataSourceList () {
    if (this.isTrial) {
      return this.allDataSourceList.filter(v => !['jdbc', 'hive'].includes(v.value))
    } else {
      return this.allDataSourceList
    }
  }

  get connectedMlsql () {
    const { datasource_type, source } = this.ruleForm
    const source1 = datasource_type !== 'hdfs' ? source : (source?.length ? source[source.length - 1] : '')
    const newForm = Object.assign({...this.ruleForm}, {source: source1})
    return this.getConnectionMlsql(newForm)
  }
  mounted () {
    if (!this.isTrial) {
      this.getConnections()
    }
    this.getExsitTables()
  }

  getConnectionMlsql (form) {
    if (!form) {
      return ''
    }
    const {
      datasource_type = '',
      connection = '',
      data_type = '',
      database = '',
      source = '',
      target = ''
    } = form
    const connectionItem = this.connectionList.find(v => v.id === connection)
    const connectionName = connectionItem?.name || ''
    switch (datasource_type) {
      case 'hdfs':
        if (data_type === 'csv') {
          const str = this.getAdvancedSql()
          let str1 = str
          if (!this.showAdvancedParams) {
            str1 = ''
          }
          return `load csv.\`${source}\` ${str1} as ${target};`
        } else {
          return `load ${data_type}.\`${source}\` as ${target};`
        }
      case 'jdbc':
        return `load jdbc.\`${connectionName}.${source}\` as ${target};`
      case 'hive':
        return `load hive.\`${database}.${source}\` as ${target};`
      case 'deltalake':
        return `load delta.\`${database}.${source}\` as ${target};`
    }
  }

  validateParameter (rule, value, callback, item) {
    this.validAllTypeParameters(rule, value, callback, item, 0)
  }

  getAdvancedSql () {
    let str = ''
    for (let key in this.parameters) {
      if (this.parameters[key]) {
        const temp = this.parameters[key]
        const value = (key === 'quote' && temp.includes('"')) ? `'''${temp}'''` : `"${temp}"`
        if (str) {
          str += `\nand ${key}=${value}`
        } else {
          str += `${key}=${value}`
        }
      }
    }
    return str ? `where ${str}` : ''
  }

  initData () {
    const form = this.initRuleForm || {}
    const { datasource_type, connection, data_type, source, database, target, extra_params = null } = form
    let source1 = source
    if (datasource_type === 'hdfs') {
      source1 = this.getSourceFileValue(source)
    }
    const connectionItem = this.connectionList.find(v => v.id === connection)
    this.ruleForm = {
      datasource_type: datasource_type || '',
      connection: connectionItem ? connection : '',
      data_type: data_type || '',
      source: source1 || '',
      database: database || '',
      target: target || ''
    }
    if (this.type === 'edit' && !extra_params) {
      this.showAdvancedParams = false
    } else {
      this.showAdvancedParams = true
    }
    if (datasource_type === 'hdfs' && data_type === 'csv') {
      this.getParamters(extra_params)
    }
  }

  handleChangeDataType (value) {
    if (value === 'csv') {
      this.originParamter = []
      this.parameters = {}
      this.getParamters()
    }
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
  // 获取所有的参数
  async getParamters (parameter) {
    try {
      const { datasource_type, data_type } = this.ruleForm
      const params = {
        node_type: 'load',
        node_name: datasource_type,
        param_name: data_type
      }
      const res = await this.getLoadParams(params)
      this.originParamter = res.data.bind_params
      this.getParamsAndInitSql(parameter)
    } catch (e) {
      console.log(e)
    }
  }
  validateTarget (rule, value, callback) {
    if (!value) {
      return callback(new Error(this.$t('pleaseInput')))
    } else {
      const initOutput = this.initRuleForm?.target ?? ''
      const duplicateOutputCount = this.existingTableList.filter(v => v === value).length
      const isDuplicate = (duplicateOutputCount > 0) && (initOutput !== value)
      return isDuplicate ? callback(new Error(this.$t('workflow.outputDuplicate'))) : callback()
    }
  }

  getSourceFileValue (path) {
    const arr = path.split('/').slice(1)
    const temp = []
    for (var i = 0; i < arr.length; i++) {
      if (i >= 1) {
        temp.push(temp[i - 1] + '/' + arr[i])
      } else {
        temp.push('/' + arr[i])
      }
    }
    return temp
  }

  async getFileListByFolder (node, resolve) {
    const path = node.level === 0 ? '' : node.data.path
    try {
      const res = await this.getFileList(path)
      const list = res.data?.list ?? []
      const fileList = list.map(v => {
        return {
          label: v.name,
          value: v.path,
          path: v.path,
          leaf: v.type === 'file',
          children: []
        }
      })
      resolve(fileList)
    } catch (e) {
      console.log(e)
    }
  }

  clearResult () {
    this.$refs.paramForm && this.$refs.paramForm.clearValidate()
    this.$refs.form.clearValidate()
  }
  checkForm () {
    const { datasource_type, data_type } = this.ruleForm
    if (datasource_type !== 'jdbc') {
      this.ruleForm.connection = ''
      if (datasource_type === 'hdfs') {
        if (data_type !== 'csv') {
          this.ruleForm.extra_params = ''
        }
        const length = this.ruleForm.source.length
        this.ruleForm.source = this.ruleForm.source[length - 1]
        this.ruleForm.database = ''
      } else {
        this.ruleForm.data_type = ''
      }
    } else {
      this.ruleForm.database = ''
    }
    this.ruleForm.extra_params = null
    let allPromise = [this.$refs.form.validate()]
    if (this.showAdvancedParams && datasource_type === 'hdfs' && data_type === 'csv') {
      this.ruleForm.extra_params = this.parameters
      allPromise = [this.$refs.form.validate(), this.$refs.paramForm.validate()]
    }
    return Promise.all(allPromise)
  }
  async getExsitTables () {
    try {
      const res = await this.getExistingTable()
      this.existingTableList = res.data?.output ?? []
    } catch (e) {
      console.log(e)
    }
  }
  async getConnections () {
    try {
      const res = await this.getConnectionList()
      this.connectionList = res.data?.connection_list ?? []
      this.initData()
    } catch (e) {
      console.log(e)
    }
  }
  // source table name hive-table
  // existing table name output-table
  // output table connection-table
  async getTableByConnection (visible) {
    if (!visible || !this.ruleForm.connection) {
      return
    }
    try {
      const res = await this.getConnectionTable(this.ruleForm.connection)
      this.connectionTableList = res.data || []
    } catch (e) {
      console.log(e)
    }
  }

  changeDatasourceType (value) {
    const { target } = this.ruleForm
    this.ruleForm = {
      datasource_type: value,
      database: '',
      connection: '',
      data_type: '',
      source: '',
      target
    }
    this.databaseList = []
    this.tableList = []
    this.connectionTableList = []
    this.originParamter = []
    this.parameters = {}
  }

  changeConnection () {
    this.ruleForm.source = ''
  }

  changeDatabase () {
    this.ruleForm.source = ''
  }

  // hive/deltalake 需要 database 和 table
  async getDatabaseList (visible) {
    if (!visible) {
      return
    }
    const datasource_type = this.ruleForm.datasource_type === 'hive' ? 'hive' : 'delta'
    try {
      let res = await this.getDBList(datasource_type)
      this.databaseList = res.data?.list ?? []
    } catch (e) {
      console.log(e)
    }
  }
  async getTableList (visible) {
    if (!visible || !this.ruleForm.database) {
      return
    }
    const datasource_type = this.ruleForm.datasource_type === 'hive' ? 'hive' : 'delta'
    let params = {
      db_type: datasource_type,
      database: this.ruleForm.database
    }
    try {
      const res = await this.getTables(params)
      this.tableList = res.data?.list ?? []
    } catch (e) {
      console.log(e)
    }
  }
  onCopy () {
    this.$message.success(this.$t('copySuccess'))
  }
}
</script>
<style lang="scss">

.node-container.load {
  .parameter-part {
    padding: 8px;
  }
  .form-form {
    margin-top: 15px;
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
}
</style>

