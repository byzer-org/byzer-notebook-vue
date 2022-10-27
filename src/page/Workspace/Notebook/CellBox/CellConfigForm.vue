<template>
  <div class="cell-config">
    <el-form :model="ruleForm" ref="ruleForm" label-width="180px" size="small" class="lang-config">
      <!-- 默认配置 根据 cellInfo 里面的值填充进去 -->
      <el-form-item 
        :label="item"
        :prop="item"
        v-for="item in Object.keys(langConfig)"
        :key="item"
        :required="langConfig[item].required"
        :rules="[
          { required: langConfig[item].required, message: langConfig[item].options ? $t('pleaseSelect'): $t('pleaseInput')},
        ]"
        >
        <el-select v-model="ruleForm[item]" :placeholder="$t('pleaseSelect')" v-if="langConfig[item].options">
          <el-option :label="opt.toString()" :value="opt" v-for="opt in langConfig[item].options" :key="opt"></el-option>
        </el-select>
        <el-input v-model="ruleForm[item]" v-else :placeholder="$t('pleaseInput')"></el-input>
      </el-form-item>
    </el-form>
    <!-- 自己添加的其他配置 key value 形式的 -->
    <el-form class="paramer-config" :model="parameterForm" ref="parameterForm" label-width="0px" size="small">
      <div class="paramer-config-item" v-for="(item, index) in parameterForm.parameter" :key="item.key">
        <div class="key-value-item left">
          <el-form-item
            label=""
            :key="'parameter.' + index + '.name'"
            :prop="'parameter.' + index + '.name'"
            :rules="[
              { required: true, message: $t('pleaseInput')},
            ]"
            >
            <el-input v-model="item.name" placeholder="Key" />
          </el-form-item>
        </div>
        <div class="key-value-item">
          <el-form-item 
            label=""
            :key="'parameter.' + index + '.value'"
            :prop="'parameter.' + index + '.value'"
            :rules="[
              { required: true, message: $t('pleaseInput')},
            ]">
            <el-input v-model="item.value" placeholder="Value" />
          </el-form-item>
        </div>
        <div class="minus-btn">
          <el-button icon="el-icon-minus" size="small" @click="handleMinusParam(index)" />
        </div>
      </div>
    </el-form>
    <div class="btns">
      <el-button icon="el-icon-plus" size="small" @click="handleAddParam">{{$t('add')}}</el-button>
      <div class="btns-submit">
        <template v-if="applied">
          <el-button size="mini" type="primary" v-if="applied" disabled icon="el-icon-check">{{$t('apply')}}</el-button>
          <el-button size="mini" v-if="applied" @click="handleCloseForm">{{$t('close')}}</el-button>
        </template>
        <template v-else>
          <el-button size="mini" type="primary" @click="handleApply" >{{$t('apply')}}</el-button>
          <el-button size="mini" @click="handleCancel" >{{$t('cancel')}}</el-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { Vue, Component, Watch } from 'vue-property-decorator'
import { getCellConfig, getDefaultConfig, getLangByContent, getConfigObj } from '../CellList/util'
import langObj from '@/config/lang.json'
import { LANG_PREFIX, LANG_TAG } from '@/config/lang'

@Component({
  props: ['cellInfo']
})
export default class CellConfigForm extends Vue {
  ruleForm = {}
  parameterForm = {
    parameter: []
  }

  langConfig = null
  applied = false
  lang = ''

  @Watch('cellInfo', { immediate: true, deep: true }) 
  onCellInfoChange (newVal) {
    const { editType, content = '' } = newVal
    const lang = editType ?? getLangByContent(content)
    this.lang = lang
    this.getInitForm(newVal)
    this.setApply(newVal)
  }
  @Watch('ruleForm', { deep: true })
  onRuleFormChange () {
    this.setApply(this.cellInfo)
  }
  @Watch('parameterForm.parameter', { deep: true })
  onParameterFormChange () {
    this.setApply(this.cellInfo)
  }

  getInitForm (cellInfo) {
    this.langConfig = langObj[this.lang]
    if (!LANG_PREFIX[this.lang]) return 
    const { config }= getDefaultConfig(this.lang)
    const cellConfig = getCellConfig(cellInfo, this.lang)
    const { defaultConfig, optionalConfig } = this.getCellFormConfig(config, getConfigObj(cellConfig, this.lang))
    this.ruleForm = {
      ...defaultConfig
    }
    this.parameterForm = {
      parameter: optionalConfig
    }
  }

  setApply (cellInfo) {
    const cellConfig = getCellConfig(cellInfo, this.lang)
    const curConfig = this.getAllConfigs()
    this.applied = cellConfig === curConfig
  }
  

  getCellFormConfig (langConfig, cellConfig) {
    let defaultConfig = {}
    let optionalConfig = []
    for (let key in langConfig) {
      defaultConfig[key] = cellConfig[key] ?? langConfig[key]
    }
    for (let key in cellConfig) {
      if (langConfig[key] === undefined) {
        optionalConfig.push({name: key, value: cellConfig[key], key: Math.random()})
      }
    }
    return {
      defaultConfig,
      optionalConfig
    }
  }

  handleAddParam () {
    this.parameterForm.parameter.push({
      name: '', value: '', key: Math.random()
    })
  }
  handleMinusParam (index) {
    this.parameterForm.parameter.splice(index, 1)
  }

  handleCancel () {
    this.$refs.ruleForm.resetFields()
    this.$refs.parameterForm.resetFields()
    this.getInitForm(this.cellInfo)
    this.$emit('onHideForm')
  }

  handleCloseForm () {
    this.$emit('onHideForm')
  }

  getAllConfigs () {
    const parameterConfig = {}
    this.parameterForm.parameter.forEach(item => {
      parameterConfig[item.name] = item.value
    })
    const allConfigs = {
      ...this.ruleForm,
      ...parameterConfig
    }
    const prefix = LANG_PREFIX[this.lang]
    const tag = LANG_TAG[this.lang]
    let str = tag 
    for (const [key, value] of Object.entries(allConfigs)) {
      str += `\n${prefix}`.concat(`${key}=${value}`)
    }
    return str
  }

  async handleApply () {
    try {
      let list = [this.$refs.ruleForm.validate()]
      if (this.parameterForm.parameter.length) {
        list.push(this.$refs.parameterForm.validate())
      }
      await Promise.all(list)
      const configs = this.getAllConfigs()
      this.$emit('changeCellConfig', configs)
    } catch {
      console.log('validate failed')
    }
  }
}
</script>

<style lang="scss" scoped>
.cell-config {
  border: 1px solid #E6EBF4;
  padding: 16px 24px;
  margin-bottom: 8px;
  .lang-config {
    width: 360px;
  }
  .paramer-config {
    width: 420px;
    margin-bottom: 8px; 
    margin-top: 16px;
    &-item {
      height: 32px;
      display: flex;
      margin-bottom: 16px;
      .key-value-item {
        width: 180px;
        &.left {
          padding-right: 8px;
        }
      }
      .minus-btn {
        margin-left: 8px;
      }
    }
  }
  .btns {
    padding-left: 180px;
    .btns-submit {
      margin-top: 16px;
    }
  }
}
</style>
