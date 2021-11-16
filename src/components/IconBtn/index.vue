<template>
  <el-tooltip placement="top" :content="text" :disabled="!text">
    <i :class="[icon, hasbg && 'has-bg', disabled ? 'is-disabled' : 'hasEvent']" @click="handler"></i>
  </el-tooltip>
</template>
<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'

@Component({
  props: {
    icon: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    handler: {
      type: Function,
      default: () => {}
    },
    hasbg: {
      type: Boolean,
      default: false
    }
  }
})

export default class IconBtn extends Vue {
  
}
</script>
<style lang="scss">
@import '../../assets/css/config.scss';
.has-bg {
  display: inline-block;
  text-align: center;
  background-color: $--background-color-hover;
  border-radius: 6px;
}
</style>
