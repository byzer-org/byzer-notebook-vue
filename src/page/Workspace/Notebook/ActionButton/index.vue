<!--

-->

<template>
  <div class="action-button">
    <span class="action-element" v-for="(item, index) in iconActions" :key="index">
      <el-tooltip effect="dark" placement="top" :content="item.label" popper-class="action-item">
        <el-button size="medium" :icon="item.iconClass" :disabled="item.disabled" @click="handleAction(item)"></el-button>
      </el-tooltip>
    </span>
  </div>
</template>

<script>

export default {
  props: {
    actions: {
      type: Array,
      default () {
        return []
      }
    },
    maxIconCount: {
      type: Number,
      default: 3
    }
  },
  computed: {
    displayActions () {
      return this.actions.filter(action => action.isShow)
    },
    // 是否显示更多按钮
    isShowMoreDropdown () {
      return this.displayActions.length > this.maxIconCount
    },
    iconActions () {
      return this.isShowMoreDropdown ? this.displayActions.slice(0, this.maxIconCount - 1) : this.displayActions.slice(0, this.maxIconCount)
    },
    moreActions () {
      return this.displayActions.slice(this.maxIconCount - 1)
    }
  },
  methods: {
    getTooltipContent (item) {
      return item.label
    },
    handleAction (action) {
      action.handler()
    }
  }
}
</script>

<style lang="scss" scoped>
.action-button {
  .action-element {
    margin-left: 10px;
    &:first-child {
      margin-left: 0px;
    }
  }
  .action-item {
    white-space: nowrap;
  }
  .action-icon {
    cursor: pointer;
    font-size: 22px;
    &.disabled {
      cursor: not-allowed;
      color: #989898;
    }
  }
}
</style>
