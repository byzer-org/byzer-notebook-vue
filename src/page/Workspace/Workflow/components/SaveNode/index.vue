<template>
  <div class="node-container" :class="type === 'add' && 'extra-style'">
    <div class="node-container-form">
      <el-form ref="form" label-position="top" :model="ruleForm" :rules="rules">
        <el-form-item :label="$t('workflow.tableToSaved')" prop="source" key="source">
          <el-select filterable v-model="ruleForm.source" style="width: 100%;" :placeholder="$t('pleaseSelect')">
            <el-option :loading="loadingSource" :label="item" :value="item" v-for="item in existingTableList" :key="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('workflow.saveInto')" prop="datasource_type">
          <el-select v-model="ruleForm.datasource_type" @change="changeDatasourceType" style="width: 100%;" :placeholder="$t('pleaseSelect')">
            <el-option :label="item.label" :value="item.value" v-for="item in dataSourceList" :key="item.value"></el-option>
          </el-select>
        </el-form-item>
        <!-- jdbc -->
        <div class="form-save-part" v-if="ruleForm.datasource_type === 'jdbc'">
          <el-form-item :label="$t('workflow.JDBCConnection')" prop="connection">
            <el-select filterable :loading="loadingConnection" v-model="ruleForm.connection" @change="changeConnection" :disabled="!connectionList.length" style="width: 100%;" :placeholder="$t('pleaseSelect')">
              <el-option :label="item.name" :value="item.id" v-for="item in connectionList.filter(v => v.datasource.toLowerCase() === ruleForm.datasource_type)" :key="item.id"></el-option>
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
          <el-form-item :label="$t('workflow.mode')" prop="mode">
            <el-radio-group v-model="ruleForm.mode">
              <el-radio label="overwrite">{{$t('workflow.overwrite')}}</el-radio>
              <el-radio label="append">{{$t('workflow.append')}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <template class="select-create">
            <div class="select-create-label"><span class="star txt-danger">*</span> {{$t('workflow.outputTable')}}</div>
            <el-radio-group class="select-create-mode" v-model="targetMode" @change="changeTargetType">
              <el-radio label="select">{{$t('workflow.selectExistTable')}}</el-radio>
              <el-radio label="create">{{$t('workflow.createNewTable')}}</el-radio>
            </el-radio-group>
            <el-form-item prop="target" v-if="targetMode==='select'" key="jdbc-table-select">
              <el-select :loading="loadingTarget" v-model="ruleForm.target" @visible-change="getTableByConnection" style="width: 100%;" :placeholder="$t('pleaseSelect')">
                <el-option :label="item" :value="item" v-for="item in connectionTableList" :key="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="target" v-if="targetMode==='create'" key="jdbc-table-create">
              <el-input v-model.trim="ruleForm.target" :placeholder="$t('pleaseInput')" style="width: 100%;"></el-input>
            </el-form-item>
          </template>
        </div>
        <!-- 非 jdbc mode -->
        <el-form-item :label="$t('workflow.mode')" prop="mode" v-else>
          <el-radio-group v-model="ruleForm.mode">
            <el-radio label="overwrite">{{$t('workflow.overwrite')}}</el-radio>
            <el-radio label="append">{{$t('workflow.append')}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- hdfs -->
        <div class="form-save-part" v-if="ruleForm.datasource_type === 'hdfs'">
          <el-form-item :label="$t('workflow.format')" prop="data_type" key="hdfs-data_type">
            <el-select v-model="ruleForm.data_type" style="width: 100%;" :placeholder="$t('pleaseSelect')">
              <el-option :label="item" :value="item" v-for="item in dataTypeList" :key="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('workflow.savePath')" prop="target" key="hdfs-target">
            <el-input v-model.trim="ruleForm.target" style="width: 100%;" :placeholder="$t('pleaseInput')" />
          </el-form-item>
        </div>
        <!-- hive -->
        <div class="form-save-part" v-if="['hive'].includes(ruleForm.datasource_type)">
          <el-form-item :label="$t('workflow.outputDatabase')" prop="database" key="hive-database">
            <el-select filterable v-model="ruleForm.database" :loading="loadingDatabase" @visible-change="getDatabaseList" @change="changeDatabase" style="width: 100%;" :placeholder="$t('pleaseSelect')">
              <el-option :label="item" :value="item" v-for="item in outputDBList" :key="item"></el-option>
            </el-select>
          </el-form-item>
          <template class="select-create">
            <div class="select-create-label"><span class="star txt-danger">*</span> {{$t('workflow.outputTable')}}</div>
            <el-radio-group class="select-create-mode" v-model="targetMode" @change="changeTargetType">
              <el-radio label="select">{{$t('workflow.selectExistTable')}}</el-radio>
              <el-radio label="create">{{$t('workflow.createNewTable')}}</el-radio>
            </el-radio-group>
            <el-form-item prop="target" v-if="targetMode==='select'" key="hive-table-select">
              <el-select filterable v-model="ruleForm.target" :loading="loadingTarget" @visible-change="getTableList" style="width: 100%;" :placeholder="$t('pleaseSelect')">
                <el-option :label="item" :value="item" v-for="item in outputTabLleist" :key="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="target" v-if="targetMode==='create'" key="hive-table-create">
              <el-input v-model.trim="ruleForm.target" :placeholder="$t('pleaseInput')" style="width: 100%;"></el-input>
            </el-form-item>
          </template>
        </div>
        <!-- deltalake -->
        <div class="form-save-part" v-if="['deltalake'].includes(ruleForm.datasource_type)">
          <template class="select-create">
            <div class="select-create-label"><span class="star txt-danger">*</span> {{$t('workflow.outputDatabase')}}</div>
            <el-radio-group class="select-create-mode" v-model="databaseMode" @change="changeDatabaseType">
              <el-radio label="select">{{$t('workflow.selectExistDatabase')}}</el-radio>
              <el-radio label="create">{{$t('workflow.createNewDatabase')}}</el-radio>
            </el-radio-group>
            <el-form-item prop="database" v-if="databaseMode==='select'" key="deltalake-database-select">
              <el-select filterable v-model="ruleForm.database" :loading="loadingDatabase" @visible-change="getDatabaseList" @change="changeDatabase" style="width: 100%;" :placeholder="$t('pleaseSelect')">
                <el-option :label="item" :value="item" v-for="item in outputDBList" :key="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="database" v-if="databaseMode==='create'" key="deltalake-database-create">
              <el-input v-model.trim="ruleForm.database" :placeholder="$t('pleaseInput')" style="width: 100%;"></el-input>
            </el-form-item>
          </template>
          <template class="select-create">
            <div class="select-create-label"><span class="star txt-danger">*</span> {{$t('workflow.outputTable')}}</div>
            <el-radio-group v-if="databaseMode === 'select'" class="select-create-mode" v-model="targetMode" @change="changeTargetType">
              <el-radio label="select">{{$t('workflow.selectExistTable')}}</el-radio>
              <el-radio label="create">{{$t('workflow.createNewTable')}}</el-radio>
            </el-radio-group>
            <el-form-item prop="target" v-if="targetMode==='select'" key="deltalake-table-select">
              <el-select filterable v-model="ruleForm.target" :loading="loadingTarget" @visible-change="getTableList" style="width: 100%;" :placeholder="$t('pleaseSelect')">
                <el-option :label="item" :value="item" v-for="item in outputTabLleist" :key="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="target" v-if="targetMode==='create'" key="deltalake-table-create">
              <el-input v-model.trim="ruleForm.target" :placeholder="$t('pleaseInput')" style="width: 100%;"></el-input>
            </el-form-item>
          </template>
        </div>
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
import { saveDataTypeList as dataTypeList, dataSourceList } from '@/config'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { mapState, mapActions } from 'vuex'
import CodeEditor from '../CodeEditor'

@Component({
  props: ['initRuleForm', 'type'],
  computed: {
    ...mapState({
      isTrial: state => state.global.is_trial
    }),
    rules () {
      return {
        mode: [
          { required: true, trigger: 'change' }
        ],
        datasource_type: [
          { required: true, message: this.$t('pleaseSelect'), trigger: 'change' }
        ],
        data_type: [
          { required: true, message: this.$t('pleaseSelect'), trigger: 'change' }
        ],
        connection: [
          { required: true, message: this.$t('pleaseSelect'), trigger: 'change' }
        ],
        source: [
          { required: true, message: this.$t('pleaseSelect'), trigger: 'change' }
        ],
        database: [ // deltalake 的情况下需要校验
          { required: true, validator: this.validateDatabase, trigger: this.databaseMode === 'select' ? 'change' : 'blur' }
        ],
        target: [ // jdbc, hive, deltalake 的情况下需要校验
          { required: true, validator: this.validateTarget, trigger: this.ruleForm.datasource_type !== 'hdfs' && this.targetMode === 'select' ? 'change' : 'blur'  }
        ]
      }
    }

  },
  methods: {
    ...mapActions({
      getConnectionList: 'GET_CONNECTION_LIST',
      getExistingTable: 'GET_EXISTING_TABLE',
      getConnectionTable: 'GET_CONNECTION_TABLE',
      getDBList: 'GET_DB_LIST',
      getTables: 'GET_TABLE_LIST'
    })
  },
  components: {
    CodeEditor
  }
})
export default class SaveNodeForm extends Vue {
  ruleForm = {
    mode: 'overwrite',
    datasource_type: '',
    data_type: '',
    connection: '',
    source: '',
    database: '',
    target: ''
  }
  targetMode = 'select'
  databaseMode = 'select'
  allDataSourceList = dataSourceList
  dataTypeList = dataTypeList
  existingTableList = []
  connectionList = []
  outputDBList = []
  outputTabLleist = []
  connectionTableList = []
  activeName = 'first'
  loadingSource = false
  loadingTarget = false
  loadingConnection = false
  loadingDatabase = false

  @Watch('initRuleForm')
  onInitRuleFormChange () {
    this.initData()
  }

  get detailIsChanged () {
    const originSql = this.getConnectionMlsql(this.initRuleForm)
    const newSql = this.connectedMlsql
    return originSql !== newSql
  }

  get connectedMlsql () {
    return this.getConnectionMlsql(this.ruleForm)
  }

  get dataSourceList () {
    if (this.isTrial) {
      return this.allDataSourceList.filter(v => !['jdbc', 'hive'].includes(v.value))
    } else {
      return this.allDataSourceList
    }
  }

  mounted () {
    if (!this.isTrial) {
      this.getConnections()
    }
    this.getExistTables()
  }

  getConnectionMlsql (form) {
    if (!form) {
      return ''
    }
    const {
      mode = '',
      datasource_type = '',
      connection = '',
      data_type = '',
      source = '',
      database = '',
      target = ''
    } = form || {}
    const connectionName = this.connectionList.find(v => v.id === connection)?.name || ''
    switch (datasource_type) {
      case 'hdfs':
        return `save ${mode} ${source} as ${data_type}.\`${target} \`;`
      case 'jdbc':
        return `save ${mode} ${source} as jdbc.\`${connectionName}.${target}\`;`
      case 'hive':
        return `save ${mode} ${source} as hive.\`${database}.${target} \`;`
      case 'deltalake':
        return `save ${mode} ${source} as delta.\`${database}.${target}\`;`
    }
  }

  initData () {
    const form = this.initRuleForm || {}
    const { mode, datasource_type, connection, data_type, source, database, target } = form
    const connectionItem = this.connectionList.find(v => v.id === connection)
    this.ruleForm = {
      mode: mode || 'overwrite',
      datasource_type: datasource_type || '',
      connection: connectionItem ? connection : '',
      data_type: data_type || '',
      database: database || '',
      source: source || '',
      target: target || ''
    }
  }
  changeDatabaseType (value) { // 只有在 deltalake 才会触发
    if (value === 'create') {
      this.targetMode = 'create'
    }
    this.ruleForm.database = ''
  }
  changeTargetType () {
    this.ruleForm.target = ''
  }
  changeDatasourceType (value) {
    const { mode, source } = this.ruleForm
    this.ruleForm = {
      mode,
      source,
      datasource_type: value,
      database: '',
      connection: '',
      data_type: '',
      target: ''
    }
    this.databaseList = []
    this.tableList = []
    this.connectionTableList = []
  }
  async getConnections () {
    try {
      this.loadingConnection = true
      const res = await this.getConnectionList()
      this.connectionList = res.data?.connection_list ?? []
      this.initData()
    } catch (e) {
      console.log(e)
    } finally {
      this.loadingConnection = false
    }
  }
  async getExistTables () {
    try {
      this.loadingSource = true
      const res = await this.getExistingTable()
      this.existingTableList = res.data?.output ?? []
    } catch (e) {
      console.log(e)
    } finally {
      this.loadingSource = false
    }
  }
  changeDatabase () { // 'hive', 'deltalake'
    if (this.targetMode === 'select') {
      this.ruleForm.target = ''
    }
  }

  async getDatabaseList (visible) {
    if (!visible) {
      return
    }
    const datasource_type = this.ruleForm.datasource_type === 'hive' ? 'hive' : 'delta'
    try {
      this.loadingDatabase = true
      let res = await this.getDBList(datasource_type)
      this.outputDBList = res.data?.list ?? []
    }  catch (e) {
      console.log(e)
    } finally {
      this.loadingDatabase = false
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
      this.loadingTarget = true
      const res = await this.getTables(params)
      this.outputTabLleist = res.data?.list ?? []
    } catch (e) {
      console.log(e)
    } finally {
      this.loadingTarget = false
    }
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
    this.$refs.form.clearValidate()
  }

  checkForm () {
    const { datasource_type } = this.ruleForm
    if (datasource_type !== 'jdbc') {
      this.ruleForm.connection = ''
      if (datasource_type === 'hdfs') {
        this.ruleForm.database = ''
      } else {
        this.ruleForm.data_type = ''
      }
    } else {
      this.ruleForm.database = ''
    }
    return this.$refs.form.validate()
  }
  changeConnection () {
    if (this.targetMode === 'select') {
      this.ruleForm.target = ''
    }
  }
  async getTableByConnection (visible) {
    if (!visible || !this.ruleForm.connection) {
      return
    }
    try {
      this.loadingTarget = true
      const res = await this.getConnectionTable(this.ruleForm.connection)
      this.connectionTableList = res.data || []
    } catch (e) {
      console.log(e)
    } finally {
      this.loadingTarget = false
    }
  }
  onCopy () {
    this.$message.success(this.$t('copySuccess'))
  }

  async validateDatabase (rule, value, callback) {
    if (!value) {
      const message = this.databaseMode === 'select' ? this.$t('pleaseSelect') : this.$t('pleaseInput')
      return callback(new Error(message))
    } else if (this.databaseMode === 'create') {
      const res = await this.getDBList('delta')
      const list = res.data?.list ?? []
      if (list.map(v => v.toLowerCase()).includes(value.toLowerCase())) {
        return callback(new Error(this.$t('workflow.inputOtherName')))
      } else {
        return callback()
      }
    } else {
      return callback()
    }
  }
  isInclude (value, list, callback) {
    const isInclude = list.map(v => v.toLowerCase()).includes(value.toLowerCase())
    if (isInclude) {
      return callback(new Error(this.$t('workflow.inputOtherName')))
    } else {
      return callback()
    }
  }
  // deltalake 时 database 是 new 的情况下 table 无需校验
  async validateTarget (rule, value, callback) {
    if (!value) {
      let message = 'Please input'
      if (this.ruleForm.datasource_type !== 'hdfs') {
        message = this.targetMode === 'select' ? this.$t('pleaseSelect') : this.$t('pleaseInput')
      }
      return callback(new Error(message))
    } else {
      // 需要区分是 jdbc hive delta
      const { datasource_type } = this.ruleForm
      let res = null
      let newCb = null
      if (datasource_type === 'deltalake') {
        if (this.databaseMode === 'select') {
          let params = {
            db_type: 'delta',
            database: this.ruleForm.database
          }
          res = await this.getTables(params)
          newCb = this.isInclude(value, res.data?.list ?? [], callback)
          return newCb
        } else {
          return callback()
        }
      } else if (datasource_type === 'hive') {
        if (!this.ruleForm.database || this.targetMode === 'select') {
          return callback()
        } else {
          let params = {
            db_type: 'hive',
            database: this.ruleForm.database
          }
          res = await this.getTables(params)
          newCb = this.isInclude(value, res.data?.list ?? [], callback)
          return newCb
        }
      } else if (datasource_type === 'jdbc') {
        if (!this.ruleForm.connection || this.targetMode === 'select') {
          return callback()
        } else {
          res = await this.getConnectionTable(this.ruleForm.connection)
          newCb = this.isInclude(value, res.data, callback)
          return newCb
        }
      } else if (datasource_type === 'hdfs') {
        return callback()
      }
    }
  }
}
</script>

<style lang="scss">

.node-container {
  &.extra-style {
    .node-container-form {
      padding: 0;
    }
    .view-sql {
      margin-top: 16px;
      padding: 0;
      padding-top: 16px;
    }
  }
  &-form {
    padding: 16px;
    .form-part {
      margin-bottom: 15px;
    }
    .select-create {
      &-label {
        color: $--color-text-primary;
        font-weight: 700;
        padding-bottom: 8px;
      }
      &-mode {
        padding-bottom: 8px;
      }
    }
  }
  .view-sql {
    border-top: 1px solid $--background-color-secondary;
    padding: 16px;
    background-color: $--color-white;
    &-label {
      color: $--color-text-primary;
      font-weight: 500;
      font-size: 12px;
      position: relative;
      .copy-icon {
        font-size: 16px;
        position: absolute;
        right: 0;
        top: 0;
      }
    }
    &-content {
      padding-top: 16px;
    }
  }
}
</style>

