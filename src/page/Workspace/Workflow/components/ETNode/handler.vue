<template>
  <div></div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'

@Component({
})
export default class ParameterValid extends Vue {
  getDefaultValue (item, editParams) {
    const editParamsNames = editParams && Object.keys(editParams)
    if (editParams && (editParamsNames.findIndex(v => v === item.name) !== -1)) {
      return editParams[item.name]
    } else {
      return item.default_value || ''
    }
  }
  checkMinValue (value, value_type, min) {
    if (['INT', 'FLOAT'].includes(value_type)) {
      return (min || min === 0) ? value >= min : true
    }
    return true
  }
  checkMaxValue (value, value_type, max) {
    if (['INT', 'FLOAT'].includes(value_type)) {
      let isInRange = (max || max === 0) ? value <= max : true
      return isInRange
    }
    return true
  }

  checkValueRange (value, value_type, max, min) { // 目前只在校验
    if (['INT', 'FLOAT'].includes(value_type)) {
      const exccedMax = this.checkMaxValue(value, value_type, max)
      const exccedMin = this.checkMaxValue(value, value_type, min)
      return exccedMax && exccedMin
    }
    return true
  }

  checkValueType (value, type) {
    if (type === 'INT') {
      if (value.toString().includes('.')) { // 不能是小数
        return false
      }
      return !isNaN(Number(value)) && value >= 0
    } else if (type === 'FLOAT') {
      return Math.floor(value) <= value && value >= 0
    } else if (type === 'BOOLEAN') {
      return ['true', 'false'].includes(value)
    } else { // STRING, ENUM 不需要校验
      return true
    }
  }

  checkFloatCount (value, type) { // 检测小数位数 最多两位
    if (type === 'FLOAT') {
      if (value.includes('.')) {
        let arr = value.split('.')
        return arr[1].length <= 2
      }
      return true
    }
    return true
  }
  // table 校验
  validateTable (value, callback, item) {
    const initModel = this.type === 'edit' ? this.allInitForm[item.name] : ''
    // 和初始的相同可以保存 和初始值不同并且在已有 model 列表中不能找到同名的
    const duplicateModelsCount = this.tableList.filter(v => v === value).length
    if (duplicateModelsCount > 0 && initModel !== value) {
      return callback(new Error(this.$t('workflow.outputDuplicate')))
    } else {
      return callback()
    }
  }

  // model 校验开始
  validateModel (value, callback) { // 校验model
    return this.checkPathIsDuplicate(value, callback)
  }

  validatePath (value, callback) {
    if (!value) {
      return callback(new Error(this.$t('workflow.pleaseInput')))
    } else if (!value.startsWith('/')) {
      return callback(new Error(this.$t('workflow.pathValid')))
    } else {
      return this.checkPathIsDuplicate(value, callback)
    }
  }

  getCompleteModel (form) {
    const modelNameItem = this.allParamsList.find(v => v.value_type === 'OUTPUT/MODEL_NAME')
    const modelPathItem = this.allParamsList.find(v => v.value_type === 'OUTPUT/MODEL_PATH')
    return `${form[modelPathItem.name]}/${form[modelNameItem.name]}`
  }

  checkPathIsDuplicate (value, callback) {
    const model = this.getCompleteModel(this.allNotGroupForm)
    const initModel = this.type === 'edit' ? this.getCompleteModel(this.allInitForm) : ''
    // 和初始的相同可以保存 和初始值不同并且在已有 model 列表中不能找到同名的
    const duplicateModelsCount = this.allModelList.filter(v => v.path === model).length
    if (duplicateModelsCount > 0 && initModel !== model) {
      return callback(new Error(this.$t('workflow.modelExist')))
    } else {
      return callback()
    }
  }
  // model 校验结束

  validSimpleParam (value, callback, item) {
    const { value_type, min, max, max_length, type } = item
    // 值类型 STRING BOOLEAN INT FLOAT
    const arrayLikeType = ['MULTI_ENUM', 'ENUM', 'INPUT/TABLE', 'INPUT/MODEL']
    if (type === 'Key' && value_type === 'OUTPUT/TABLE') {
      this.validateTable(value, callback, item)
    } else if (type === 'Key' && value_type === 'OUTPUT/MODEL_NAME') {
      this.validateModel(value, callback, item)
    } else if (type === 'Key' && value_type === 'OUTPUT/MODEL_PATH') {
      this.validatePath(value, callback, item)
    } else if (arrayLikeType.includes(value_type)) {
      if (value_type === 'MULTI_ENUM' && value.length > max_length) {
        return callback(new Error(this.$t('workflow.maxLength', { size: max_length })))
      }
      return callback()
    } else if (value_type === 'STRING' && max_length && (value.length > max_length)) {
      return callback(new Error(this.$t('workflow.maxLength', { size: max_length })))
    } else if (value_type === 'MULTI_ENUM' && max_length && (value.length > max_length)) {
      return callback(new Error(this.$t('workflow.maxSize', { size: max_length })))
    } else if (!this.checkValueType(value, value_type)) { // 校验值类型
      return callback(new Error(this.$t('workflow.valueType', { type: value_type.toLowerCase()})))
    } else if (!this.checkMinValue(value, value_type, min)) { // 校验值范围
      return callback(new Error(this.$t('workflow.minValue', { min })))
    } else if (!this.checkMaxValue(value, value_type, max)) { // 校验值范围
      return callback(new Error(this.$t('workflow.maxValue', { max })))
      // else if (!this.checkFloatCount(value, value_type)) { // 校验小数位数
      //   return callback(new Error(this.$t('workflow.floatValid')))
      // }
    } else {
      return callback()
    }
  }
  getArraySum (arr) {
    let sum = 0
    arr.forEach(v => {
      sum += Number(v)
    })
    return sum
  }
  validAllTypeParameters (rule, value, callback, item) {
    const { value_type, required, max_length, enabled, array_value_type } = item
    // 必填项的判断
    if (enabled === 'false') {
      return callback()
    } else {
      if (value_type === 'ARRAY') { // array
        if (!(required === 'true') && (value.length === 0)) {
          return callback()
        }
        const { value_type: valueType, max, min, max_length: value_max_length, sum } = array_value_type
        if (!value.length) {
          return callback(new Error(this.$t('workflow.pleaseInput')))
        } else if (!value.every(v => this.checkValueType(v, valueType))) { // 校验值类型
          return callback(new Error(this.$t('workflow.valueType', { type: valueType.toLowerCase()})))
        } else if (valueType === 'INT') { // 整数校验
          if (!value.every(v => this.checkMinValue(v, valueType, min))) { // 校验值范围
            return callback(new Error(this.$t('workflow.minValue', { min })))
          } else if (!value.every(v => this.checkMaxValue(v, valueType, max))) { // 校验值范围
            return callback(new Error(this.$t('workflow.maxValue', { max })))
          } else {
            return callback()
          }
        } else if (valueType === 'FLOAT') { // 校验小数
          if (!value.every(v => this.checkValueRange(v, valueType, max, min))) { // 校验值范围
            return callback(new Error(this.$t('workflow.valueRange', { max, min })))
          // } else if (!value.every(v => this.checkFloatCount(v, valueType))) { // 校验小数位数
          //   return callback(new Error(this.$t('workflow.floatValid')))
          } else if (sum && (this.getArraySum(value) !== sum)) {
            return callback(new Error(this.$t('workflow.sumValue')))
          } else {
            return callback()
          }
        } else if (valueType === 'STRING') {
          const isNormal = value.every(v => v.length <= value_max_length)
          if (!isNormal) {
            return callback(new Error(this.$t('workflow.maxLength')))
          } else {
            return callback()
          }
        } else if (value.length > max_length) { // 校验数组的最大长度
          return callback(new Error(this.$t('workflow.maxSize', {size: max_length})))
        } else {
          return callback()
        }
      } else if (required === 'false' && (!value || value_type === 'MULTI_ENUM' && value.length === 0 )) { // 非必填没有值
        return callback()
      } else if (required === 'true' && (!value || value.length === 0)) { // 必填 没有值
        const selectValueType = ['ENUM', 'MULTI_ENUM', 'INPUT/TABLE', 'INPUT/MODEL']
        const msg = selectValueType.includes(value_type) ? this.$t('pleaseSelect') : this.$t('pleaseInput')
        return callback(new Error(msg))
      }
      return this.validSimpleParam(value, callback, item)
    }
  }

}
</script>

<style lang="scss">
</style>

