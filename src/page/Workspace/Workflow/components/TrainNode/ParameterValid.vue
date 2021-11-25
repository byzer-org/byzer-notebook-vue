<template>
  <div></div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'

@Component({
})
export default class ParameterValid extends Vue {
  getDefaultValue (item, editParams) {
    // valueType: ['STRING', 'BOOL', 'ENUM', 'ARRAY']
    const editParamsNames = editParams && Object.keys(editParams)
    if (editParams && (editParamsNames.findIndex(v => v === item.name) !== -1)) {
      return editParams[item.name]
    } else {
      if (item.default_value) {
        return item.default_value
      }
      if (item.value_type === 'STRING') {
        return ''
      } else if (item.value_type === 'BOOL') {
        return ''
      } else if (item.value_type === 'ENUM') {
        return ''
      } else if (item.value_type === 'ARRAY') {
        return []
      }
    }
  }
  checkMinValue (value, value_type, value_interval) {
    if (['INT', 'FLOAT'].includes(value_type)) {
      let isInRange = true
      if (value_interval) {
        const { min } = value_interval
        isInRange = min ? value >= min : true
      }
      return isInRange
    }
    return true
  }
  checkMaxValue (value, value_type, value_interval) {
    if (['INT', 'FLOAT'].includes(value_type)) {
      let isInRange = true
      if (value_interval) {
        const { max } = value_interval
        isInRange = max ? value <= max : true
      }
      return isInRange
    }
    return true
  }
  checkValueRange (value, value_type, value_interval) { // 目前只在校验
    if (['INT', 'FLOAT'].includes(value_type)) {
      let isInRange = true
      if (value_interval) {
        const { max, min } = value_interval
        const exccedMax = max ? value <= max : true
        const exccedMin = min ? value >= min : true
       isInRange = exccedMax && exccedMin
      }
      return isInRange
    }
    return true
  }

  checkValueType (value, type) {
    if (type === 'INT') {
      if (value.includes('.')) { // 不能是小数
        return false
      }
      return Number(value) !== 'NA' && value >= 0
    } else if (type === 'FLOAT') {
      return Math.floor(value) <= value && value >= 0
    } else if (type === 'BOOL') {
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

  validSimpleParam (value, callback, item) {
    const { value_type, value_interval = null } = item
    // 值类型 STRING BOOL INT FLOAT
    if (!this.checkValueType(value, value_type)) { // 校验值类型
      return callback(new Error(this.$t('workflow.valueType', { type: value_type.toLowerCase()})))
    } else if (!this.checkMinValue(value, value_type, value_interval)) { // 校验值范围
      const { min } = value_interval
      return callback(new Error(this.$t('workflow.minValue', { min })))
    } else if (!this.checkMaxValue(value, value_type, value_interval)) { // 校验值范围
      const { max } = value_interval
      return callback(new Error(this.$t('workflow.maxValue', { max })))
    } else if (!this.checkFloatCount(value, value_type)) { // 校验小数位数
      return callback(new Error(this.$t('workflow.floatValid')))
    } else {
      return callback()
    }
  }
  validAllTypeParameters (rule, value, callback, item, length) {
    const { value_type, array_value_type, array_max_size, required } = item
    // 必填项的判断
    if (value_type === 'ARRAY') { // array
      if (!required && (value.length === 0)) {
        return callback()
      }
      const { value_type: valueType, value_interval: valueInterval } = array_value_type
      if (length > 9) {
        return callback(new Error(this.$t('workflow.maxGroup')))
      } else if (!value.length) {
        return callback(new Error(this.$t('pleaseInput')))
      } else if (value.length > array_max_size) {
        return callback(new Error(this.$t('workflow.maxSize', {size: array_max_size})))
      } else if (!value.every(v => this.checkValueType(v, valueType))) { // 校验值类型
        return callback(new Error(this.$t('workflow.valueType', { type: valueType.toLowerCase()})))
      } else if (valueType === 'INT') { // 整数校验
        if (!value.every(v => this.checkMinValue(v, valueType, valueInterval))) { // 校验值范围
          const { min } = valueInterval
          return callback(new Error(this.$t('workflow.minValue', { min })))
        } else if (!value.every(v => this.checkMaxValue(v, valueType, valueInterval))) { // 校验值范围
          const { max } = valueInterval
          return callback(new Error(this.$t('workflow.maxValue', { max })))
        } else {
          return callback()
        }
      } else if (valueType === 'FLOAT') { // 校验值范围
        if (!value.every(v => this.checkValueRange(v, valueType, valueInterval))) { // 校验值范围
          const { max, min } = valueInterval
          return callback(new Error(this.$t('workflow.valueRange', { max, min })))
        } else if (!value.every(v => this.checkFloatCount(v, valueType))) { // 校验小数位数
          return callback(new Error(this.$t('workflow.floatValid')))
        } else {
          return callback()
        }
      } else {
        return callback()
      }
    } else {
      if (!required && !value) { // 非必填没有值
        return callback()
      } else if (required && !value) { // 必填 没有值
        const msg = value_type === 'ENUM' ? this.$t('pleaseSelect') : this.$t('pleaseInput')
        return callback(new Error(msg))
      }
      return this.validSimpleParam(value, callback, item)
    }
  }

}
</script>
<style lang="scss">
</style>

