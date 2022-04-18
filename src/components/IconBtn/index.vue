<template>
  <el-tooltip placement="top" :content="text" :disabled="!text">
    <i class="icon-btn" :class="[icon, hasbg && 'has-bg', disabled ? 'is-disabled' : 'hasEvent']" @click="handleAction"></i>
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
  handleAction () {
    if (!this.disabled) {
      this.handler()
    }
  }
}
</script>
<style lang="scss">

.icon-btn {
  font-size: 22px;
  &.has-bg {
    display: inline-block;
    text-align: center;
    background-color: $--background-color-hover;
    border-radius: 6px;
  }
  &.is-disabled {
    color: $--font-color-disabled-base;
  }
}
</style>
