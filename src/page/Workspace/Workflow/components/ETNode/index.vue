<template>
  <div class="node-container et" :class="type === 'add' && 'extra-style'">
    <div class="node-container-form">
      <el-form ref="ruleForm" label-position="top" :model="ruleForm" v-if="Object.keys(ruleForm).length">
        <el-form-item
          v-show="formItem.enabled !== 'false'"
          v-for="formItem in notGroupParamsList"
          :key="formItem.name"
          :prop="formItem.name"
          :ref="`${formItem.name}`"
          :rules="[
            { required: formItem.required === 'true',
              validator: (rule, value, callback) => validateParameter(rule, value, callback, formItem),
              trigger: changeTriggerValueType.includes(formItem.value_type) ? 'change' : 'blur'
            }
          ]">
          <span slot="label">
            <el-tooltip placement="top" :content="formItem.description" :disabled="!formItem.description" >
              <span>{{formItem.label || formItem.name}}</span>
            </el-tooltip>
          </span>
          <FormItem :ruleForm="ruleForm" :formItem="formItem" :inputList="inputList(formItem['value_type'])" @changeSqlEdtorValue="(value) => changeSqlEdtorValue(formItem, 'rule', value)"/>
        </el-form-item>
      </el-form>
      <div class="node-container-form-wrapper" v-if="groupParamsList.length">
        <div class="form-custom">
          <span class="txt-danger">* </span>
          <span class="label">{{$t('workflow.parameterGroups')}}</span>
        </div>
        <el-form ref="groupForm" label-position="left" size="medium" label-width="170px" :model="groupRuleForm">
          <div class="form-group-list" v-for="(group, index) in groupRuleForm.groupList" :key="index">
            <div class="form-group-list-item">
              <div class="form-group-list-item-label">
                <div class="label">
                  Group {{index}}
                  <span @click="handleGroupVisible(index)" >
                    <el-button type="text" size="medium" v-if="groupVisibleList[index].isShow"><span class="icon el-ksd-icon-arrow_down_22"></span></el-button>
                    <el-button type="text" size="medium" icon="el-ksd-icon-arrow_up_22" v-else></el-button>
                  </span>
                </div>
                <div class="form-group-list-item-label-btn">
                  <el-button icon="el-ksd-icon-add_22" size="mini" @click="handleAddGroupParams(index)"></el-button>
                  <el-button icon="el-ksd-icon-minus_22" :disabled="groupRuleForm.groupList.length <= 1" size="mini" @click="handleMinusGroupParams(index)"></el-button>
                </div>
              </div>
              <el-form-item
                v-show="formItem.enabled !== 'false' && groupVisibleList[index].isShow"
                v-for="formItem in groupParamsList"
                :key="formItem.name + index"
                :prop="`groupList[${index}][${formItem.name}]`"
                :rules="[
                  { required: formItem.required === 'true',
                    validator: (rule, value, callback) => validateParameter(rule, value, callback, formItem),
                    trigger: changeTriggerValueType.includes(formItem.value_type) ? 'change' : 'blur'
                  }
                ]">
                <span slot="label">
                  <el-tooltip placement="top" :content="formItem.description" :disabled="!formItem.description" >
                    <span>{{formItem.label || formItem.name}}</span>
                  </el-tooltip>
                </span>
                <FormItem :ruleForm="group" :formItem="formItem" :inputList="inputList(formItem['value_type'])" />
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>
      <div class="node-container-form-wrapper output-form">
        <el-form ref="outputForm" :model="outputForm" v-if="Object.keys(outputForm).length">
          <el-form-item
            v-for="formItem in outputParamsList"
            :key="formItem.name"
            :prop="formItem.name"
            :ref="`${formItem.name}Item`"
            :rules="[{
              required: formItem.required === 'true',
              validator: (rule, value, callback) => validateParameter(rule, value, callback, formItem),
              trigger: changeTriggerValueType.includes(formItem.value_type) ? 'change' : 'blur'
            }]">
            <span slot="label">
              <el-tooltip placement="top" :content="formItem.description" :disabled="!formItem.description" >
                <span>{{formItem.label || formItem.name}}</span>
              </el-tooltip>
            </span>
            <FormItem :ruleForm="outputForm" :formItem="formItem" :inputList="inputList(formItem['value_type'])"  @changeSqlEdtorValue="(value) => changeSqlEdtorValue(formItem, 'output', value)"/>
          </el-form-item>
        </el-form>
      </div>
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
import ParameterValid from './handler.vue'
import { cloneDeep, flattenDepth } from 'lodash'
import FormItem from './FormItem.vue'
import { outputValueTypeList, paramType, changeTriggerValueType } from './config'

@Component({
  props: ['initRuleForm', 'originSql', 'type', 'nodeInfo', 'nodeTypeId'],
  components: {
    CodeEditor,
    FormItem
  },
  computed: {
    ...mapState({
      activeNotebook: state => state.notebook.activeNotebook
    })
  },
  methods: {
    ...mapActions({
      getExistingTable: 'GET_EXISTING_TABLE',
      getParamsById: 'GET_ET_PARAMS',
      getETDependency: 'GET_ET_DEPENENCY',
      getExistingModel: 'GET_EXISTING_MODEL'
    })
  },
  mixins: [ParameterValid]
})
export default class ETNodeForm extends Vue {
  ruleForm = {}
  groupRuleForm = {
    groupList: [{}]
  }
  outputForm = {}
  outputParamsList = []
  usage = ''
  notGroupParamsList = []
  groupParamsList = []
  originAllParamsList = []
  changeTriggerValueType = changeTriggerValueType
  allParamsList = []
  allModelList = []
  modelList = [] // 用于校验 model
  tableList = []
  allTables = []
  allInitForm = {} // 存储编辑节点时所有非 group 的字段值
  groupVisibleList = [{ isShow: true }]

  // 分组的参数里不会存在互相依赖的关系  分组可能会依赖不分组的 不分组的不会依赖分组的

  @Watch('initRuleForm', { deep: true })
  onInitRuleFormChange (newVal) {
    if (newVal && this.type === 'edit') {
      this.setOriginValue()
    }
  }

  @Watch('nodeInfo.id')
  onNodeInfoChange () {
    this.initData()
    this.getNodeParams(true)
  }

  @Watch('allNotGroupForm', { deep: true })
  onRuleFormChange () { // form 的是不分组的， 不分组的变化可能会引起分组和不分组的属性的变化
    this.allParamsList.forEach(v => {
      this.getIsShowParams(v, { ...this.ruleForm, ...this.outputForm })
    })
    // 如果有动态绑定的 则
    const hasDynamicBind = this.allParamsList.some(v => v.derived_type === 'DYNAMIC_BIND')
    if (hasDynamicBind) {
      this.overrideDynamicBind()
    }
  }
  get allNotGroupForm () {
    return { ...this.ruleForm, ...this.outputForm }
  }
  get ETId () {
    return this.type === 'edit' ? this.nodeInfo && this.nodeInfo.content.et_id : this.nodeTypeId
  }

  created () {
    this.getNodeParams(true)
  }

  initData () {
    this.ruleForm = {}
    this.outputForm = {}
    this.groupRuleForm = { groupList: [{}] }
    this.allInitForm = {} // 存储编辑节点时所有非 group 的字段值
    this.usage = ''
    this.notGroupParamsList = []
    this.groupParamsList = []
    this.originAllParamsList = []
    this.allParamsList = []
    this.allModelList = []
    this.modelList = [] // 用于校验 model
    this.tableList = []
    this.groupVisibleList = [{ isShow: true }]
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

  setEditNodeSelectValue (item, form) {
    const { name, value_type, enum_values } = item
    if (['ENUM'].includes(value_type) && !enum_values.includes(form[name])) {
      form[name] = ''
    }
    if (['MULTI_ENUM'].includes(value_type)) {
      const value = form[name] ? (form[name].includes(',') ? form[name].split(',')  : [form[name]]) : []
      form[name] = value
    }
    if (value_type === 'INPUT/HDFS' && form[name]) {
      form[name] = this.getSourceFileValue(form[name])
    }
    if (value_type === 'ARRAY' && form[name]) {
      form[name] = form[name].includes(',') ? form[name].split(',') : [form[name]]
    }
  }

  getOutputFormAndNotGroupForm (allForm) {
    let outputForm = {}, notGroupForm = {}
    this.notGroupParamsList.forEach(v => {
      this.$set(notGroupForm, v.name, allForm[v.name])
    })
    this.outputParamsList.forEach(v => {
      this.$set(outputForm, v.name, allForm[v.name])
    })
    return { outputForm, notGroupForm }
  }

  setOriginValue () { // 编辑节点设置默认值
    if (Object.keys(this.ruleForm).length || Object.keys(this.outputForm).length && this.initRuleForm) {
      const { group, param_list, input_param, output_param } = this.initRuleForm
      if (!(group || param_list || input_param || output_param)) {
        return
      }
      // 如果类型是 array，需要将 逗号分隔的转化成 array
      // 拆分出输入，normal 和 output
      const inputForm = this.arrayToObject(input_param)
      const outputForm = this.arrayToObject(output_param)
      const paramForm = this.arrayToObject(param_list)
      const groupForm = group.map(v => this.arrayToObject(v))
      this.groupVisibleList = Array(group.length).fill({ isShow: true }) // 生成长度跟 group 个数一致的数组
      this.ruleForm = { ...this.ruleForm, ...paramForm, ...inputForm}
      Object.assign(this.outputForm, outputForm)
      this.allInitForm = { ...inputForm, ...paramForm, ...outputForm }
      // 如果是下拉选择，要判断现有列表中是否含有该值，如果没有则置空（group 和 not group 都需要判断)
      this.notGroupParamsList.forEach(v => {
        this.setEditNodeSelectValue(v, this.ruleForm)
      })
      this.outputParamsList.forEach(v => {
        this.setEditNodeSelectValue(v, this.outputForm)
      })
      // 如果是组，group > 1 按照接口给的组数赋值，<= 1 则组数按照原参数展示
      const singleGroupForm = this.groupRuleForm.groupList[0]
      if (groupForm.length === 1) {
        this.groupRuleForm.groupList = groupForm.map(v => ({ ...singleGroupForm, ...v }))
      } else {
        this.groupRuleForm.groupList = groupForm.map(v => {
          return { ...singleGroupForm, ...v }
        })
      }
    }
  }

  getDefaultValue (item) {
    const { value_type, default_value, required } = item
    let defaultValue = ''
    if (required === 'true') {
      if (['ARRAY', 'MULTI_ENUM'].includes(value_type)) {
        defaultValue = default_value && default_value.split(',')
      } else {
        defaultValue = (default_value || default_value === 0) ? default_value : ''
      }
    }
    return defaultValue
  }

  // 获取动态依赖参数的依赖的override, 然后覆盖原始的参数列表（allParamsList), 然后筛选出要展示的所有参数 再进行分组（group notGroup）
  // 分为三个form： 输入字段，
  getInitalForm () { // 创建时获取整个 form
    this.notGroupParamsList.forEach(v => {
      let defaultValue = this.getDefaultValue(v)
      this.$set(this.ruleForm, v.name, defaultValue)
    })
    this.groupParamsList.forEach(v => {
      let defaultValue = this.getDefaultValue(v)
      this.$set(this.groupRuleForm.groupList[0], v.name, defaultValue)
    })
    this.outputParamsList.forEach(v => {
      let defaultValue = this.getDefaultValue(v)
      this.$set(this.outputForm, v.name, defaultValue)
    })

    const shouldGetTables = this.allParamsList.some(v => v.value_type === 'INPUT/TABLE')
    const shouldGetModels = this.allParamsList.some(v => v.value_type === 'INPUT/MODEL')
    if (shouldGetTables) {
      this.getExistTables()
    }
    if (shouldGetModels) {
      this.getExistModels()
    }
    this.getAllModelList()
    if (this.initRuleForm && this.type === 'edit') {
      this.setOriginValue()
    }
  }

  async getNodeParams (isInit) {
    try {
      const res = await this.getParamsById(this.ETId)
      const result = res.data
      const { params, usage } = result
      this.allParamsList = params.filter(v => v.optional !== 'false')
      this.usage = usage
      this.getAllParamsList(isInit)
    } catch (e){
      console.log(e)
    }
  }

  getAllParamsList (isInit) { // 将原有参数分组，输入+normal/group/输出
    if (isInit) {
      this.allParamsList = this.allParamsList.map(v => ({...v, enabled: String(v.derived_type === 'NONE')}))
      this.originAllParamsList = cloneDeep(this.allParamsList)
    }
    const inputList = this.allParamsList.filter(v => v.type === paramType['KEY'] && !outputValueTypeList.includes(v.value_type))
    this.notGroupParamsList = inputList.concat(this.allParamsList.filter(v => v.type === paramType['NORMAL']))
    this.groupParamsList = this.allParamsList.filter(v => v.type.startsWith(paramType['GROUP']))
    this.outputParamsList = this.allParamsList.filter(v => v.type === paramType['KEY'] && outputValueTypeList.includes(v.value_type))
    if (isInit) {
      this.getInitalForm()
    }
  }


  inputList (completeType) { // 下拉选列表（table/model）
    if (completeType.includes(('/'))) {
      const type = completeType.split('/')[1].toLowerCase()
      return this[`${type}List`]
    } else {
      return []
    }
  }
  // 新增组
  // group 的隐藏显示
  handleGroupVisible (index) {
    const isShow = this.groupVisibleList[index].isShow
    this.groupVisibleList[index].isShow = !isShow
  }
  handleAddGroupParams (index) {
    let temp = cloneDeep(this.groupRuleForm.groupList[index])
    let param = {}
    for (let key in temp) {
      const para = this.allParamsList.find(v => v.name === key)
      if (para.type === paramType['GROUP_A']) {
        this.$set(param, key, temp[key])
      } if (para.type === paramType['GROUP_B']) {
        this.$set(param, key, '')
      } else if (para.type === paramType['GROUP_C']) {
        let val = temp[key]
        const value = isNaN(Number(val)) ? '' : (Number(val) + 1)
        this.$set(param, key, value)
      }
    }
    this.groupRuleForm.groupList.splice(index + 1, 0, param)
    this.groupVisibleList.splice(index + 1, 0, { isShow: true })
  }
  // 减少组
  handleMinusGroupParams (index) {
    this.groupRuleForm.groupList.splice(index, 1)
    this.groupVisibleList.splice(index, 1)
  }

  arrayToObject (arr) { // {name: 'a', value: 'b'}
    let obj = {}
    if (arr.length !== 0) {
      arr.forEach(v => {
        this.$set(obj, v.name, v.value)
      })
    }
    return obj
  }

  getIsShowParams (item, form) { // 是否显示依赖参数
    const { derived_type } = item
    if (derived_type === 'STATIC_BIND') { // 只有 1对1 依赖 的情况
      this.overrideStaticBind(item, form)
    }
  }

  overrideDynamicBind () {
    const allForm = { ...this.ruleForm, ...this.outputForm }
    const dynamicParamList = this.allParamsList.filter(v => v.derived_type === 'DYNAMIC_BIND')
    const scripts = dynamicParamList.map(v => ({ name: v.name, sql: v.dynamic_behave}))
    const arr = flattenDepth(dynamicParamList.map(v => v.depends))
    const dependence_values = arr.map(v => ({ name: v, value: allForm[v]}))
    const params = {
      scripts,
      dependence_values
    }
    this.getDynamicOverride(params)
  }


  async getDynamicOverride (params) {
    try {
      // 获取覆盖列表后处理
      const res = await this.getETDependency(params)
      const overrideList = res.data || []
      if (overrideList.length) {
        this.allParamsList = this.allParamsList.map(v => {
          const overrideItem = overrideList.find(item => item.name === v.name)
          const params = overrideItem ? this.arrayToObject(overrideItem.override) : {}
          return {
            ...v,
            ...params
          }
        })
      }
      this.getAllParamsList()
    } catch (e) {
      console.log(e)
    }
  }

  overrideStaticBind (item, form) { // 静态依赖参数覆盖
    const { name: currentName, behave } = item // 有依赖的参数
    const { name, denpendency_type, value: overrideValues } = behave[0]
    const value = form[name]
    if (form[name] === 'undefined') {
      return
    }
    let overrideItem = null
    if (denpendency_type === 'VALUE_BIND') {
      overrideItem = overrideValues.find(v => v.name === value) // 找出当前值对应需要覆盖的参数
    } else { // NOT_EMPTY_BIND  非空绑定值不为空再去找对应的参数 否则根据非空值的覆盖属性将这些属性改为原始列表（originAll）中的属性
      overrideItem = value ? overrideValues[0] : null
    }
    // 找到了覆盖属性 存 overrideProperty（字段一致有该属性则会覆盖）
    if (overrideItem && overrideItem.override.length) {
      const { override } = overrideItem
      const overrideProperty = this.arrayToObject(override) // 将覆盖属性转换为 obj
      const index = this.allParamsList.findIndex(v => v.name === currentName)
      let objectProperty = cloneDeep(this.allParamsList[index])
      objectProperty = { ...objectProperty, ...overrideProperty, overrideProperty}
      this.allParamsList[index] = objectProperty
    } else {
      // 无覆盖属性
      // 1 值绑定 overrideProperty 找回原属性值  无（不做修改）
      const index = this.allParamsList.findIndex(v => v.name === currentName)
      const originItem = this.originAllParamsList.find(v => v.name === currentName)
      const item = cloneDeep(this.allParamsList[index])
      if (item.overrideProperty) {
        let obj = {}
        let temp = cloneDeep(item.overrideProperty)
        for (let key in temp) {
          // item[k] 在原始的列表中找到对应的属性， 修改 allParams 的属性
          this.$set(obj, key, originItem[key])
        }
        this.allParamsList[index] = { ...item, ...obj, overrideProperty: obj }
      }
    }
    this.getAllParamsList()
  }

  get detailIsChanged () {
    const newSql = this.connectedMlsql
    return this.originSql !== newSql
  }

  get connectedMlsql () {
    return this.getConnectionMlsql()
  }

  async getAllModelList () {
    try {
      const res = await this.getExistingModel()
      this.allModelList = res.data?.models ?? []
    } catch (e) {
      console.log(e)
    }
  }

  async getExistModels () {
    try {
      const id = this.activeNotebook.id
      const res = await this.getExistingModel(id)
      const temp = res.data?.models ?? []
      this.modelList = temp.map(v => `${v.algorithm}.\`${v.path}\``)
    } catch (e) {
      console.log(e)
    }
  }
  async getExistTables () {
    try {
      const res = await this.getExistingTable()
      this.allTables = res.data?.output ?? []
      if (this.type === 'edit') {
        const outputParams = this.initRuleForm?.output_param ?? []
        const item = this.allParamsList.find(v => v.type === paramType['KEY'] && v.value_type === 'OUTPUT/TABLE')
        let filteredOutput = ''
        if (item) {
          const initTable = outputParams.find(v => v.name === item.name)
          filteredOutput = initTable ? initTable.value : ''
        }
        this.tableList = this.allTables.filter(v => v !== filteredOutput)
      } else {
        this.tableList = this.allTables
      }
    } catch (e) {
      console.log(e)
    }
  }
  changeSqlEdtorValue (formItem, formType, value) {
    const { name, value_type } = formItem
    if (value_type === 'TEXT') {
      this[`${formType}Form`][name] = value
      this.$refs[`${formType}Form`].validateField(`${formItem.name}`)
    }
  }

  getGroupParamsSql () {
    const list = this.groupRuleForm.groupList
    if (!list.length) {
      return ''
    }
    let arr = []
    const paramsList = this.groupParamsList
    list.forEach((v, i) => {
      paramsList.forEach(param => {
        const { name } = param
        const value = this.getCompleteValue(v, name)
        let formatValue = this.getQuote(value)
        if (value) {
          arr.push(`\`fitParam.${i}.${name}\`=${formatValue}`)
        }
      })
    })
    return arr.join('\nand ')
  }

  getQuote (value) {
    if (value.includes('"')) {
      return `'''${value}'''`
    } else {
      return `"${value}"`
    }
  }

  getNormalParamsSql () {
    const paramsList = this.notGroupParamsList.filter(v => v.type === 'Normal' && this.ruleForm[v.name])
    let arr = []
    paramsList.forEach(param => {
      const value = this.getCompleteValue(this.ruleForm, param.name)
      let formatValue = this.getQuote(value)
      if (value) {
        arr.push(`${param.name}=${formatValue}`)
      }
    })
    return arr.join('\nand ')
  }

  getKeyParamsSql (usage) {
    const inputKeys = Object.keys(this.ruleForm)
    const outputKeys = Object.keys(this.outputForm)
    let str = ''
    inputKeys.forEach(v => {
      const value = this.getCompleteValue(this.ruleForm, v)
      str = str ? str.replace(`$${v}`, value) : usage.replace(`$${v}`, value)
    })
    outputKeys.forEach(v => {
      const value = this.getCompleteValue(this.outputForm, v)
      str = str ? str.replace(`$${v}`, value) : usage.replace(`$${v}`, value)
    })
    return str
  }

  getCompleteValue (form, key) { // 路径需要数组的最后一个值，数组需要转化成逗号分割的字符串
    const item = this.allParamsList.find(v => v.name === key)
    if (item) {
      if (item.value_type === 'INPUT/HDFS') {
        const value = form[key]
        return value[value.length - 1]
      } else if (['ARRAY', 'MULTI_ENUM'].includes(item.value_type)) {
        return Array.isArray(form[key]) ? form[key].join(',') : form[key]
      } else {
        return form[key]
      }
    } else {
      return ''
    }
  }

  getConnectionMlsql () {
    const keySql = this.getKeyParamsSql(this.usage)
    const normalSql = this.getNormalParamsSql()
    const groupSql = this.getGroupParamsSql()
    let wherSql = ''
    if (normalSql) {
      wherSql = normalSql + (groupSql ? ('\n\nand ' + groupSql) : '')
    } else {
      wherSql = groupSql
    }
    let sql = wherSql ? keySql.replace('{{parameters}}', wherSql) : keySql.replace(' where {{parameters}}', '')
    return sql
  }

  async getParamters (parameters) {
    try {
      const res = await this.getParamsById()
      this.notGroupParamsList = res.data?.params ?? []
      this.getInitalForm(parameters)
    } catch (e){
      console.log(e)
    }
  }
  validateParameter (rule, value, callback, item) {
    this.validAllTypeParameters(rule, value, callback, item)
  }
  getPostParams (form, type) {
    const paramsList = []
    const formKeys = Object.keys(form)
    formKeys.forEach(v => {
      const item = this.allParamsList.find(para => para.name === v)
      let flag = false
      if (item) {
        if (type === 'INPUT') {
          flag = item.type === paramType['KEY'] && !outputValueTypeList.includes(item.value_type)
        } else if (type === item.type) {
          flag = type === item.type
        }
        if (type && flag || !type) {
          const value = this.getCompleteValue(form, v)
          value && paramsList.push({ name: v, value: value})
        }
      }
    })
    return paramsList
  }

  getCreateEditParams () {
    const notGroupParamsList = this.getPostParams(this.ruleForm, paramType['NORMAL'])
    const outputParamsList = this.getPostParams(this.outputForm)
    const inputParamsList = this.getPostParams(this.ruleForm, 'INPUT')
    const groupParamsList = this.groupRuleForm.groupList.map(v => this.getPostParams(v))
    const allParams = {
      et_id: this.ETId,
      input_param: inputParamsList,
      output_param: outputParamsList,
      param_list: notGroupParamsList,
      group: groupParamsList
    }
    return allParams
  }
  clearResult () {
    this.$refs.ruleForm && this.$refs.ruleForm.clearValidate()
    this.$refs.groupForm && this.$refs.groupForm .clearValidate()
    this.$refs.outputForm && this.$refs.outputForm.clearValidate()
  }
  checkForm () {
    let list = [this.$refs.ruleForm.validate()]
    if (this.groupParamsList.length) {
      list.push(this.$refs.groupForm.validate())
    }
    if (this.outputParamsList.length) {
      list.push(this.$refs.outputForm.validate())
    }
    return Promise.all(list)
  }
  onCopy () {
    this.$message.success(this.$t('copySuccess'))
  }

}
</script>

<style lang="scss">

.node-container.et {
  padding-right: 10px;
  .node-container-form {
    padding: 16px;
    .output-form {
      margin-top: 10px;
    }
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
    .form-group-list {
      line-height: 30px;
      &-item {
        background-color: #f5f5f5;
        padding: 10px;
        &-label {
          font-weight: 600;
          line-height: 30px;
          padding-bottom: 10px;
          display: flex;
          justify-content: space-between;
          .label {
            .icon {
              font-size: 22px;
            }
          }
          &-btn {
            margin-left: 30px;
          }
        }
      }
    }
  }
}
</style>

