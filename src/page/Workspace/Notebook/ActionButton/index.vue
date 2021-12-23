<template>
  <div class="action-button">
    <div class="action-element" v-for="(item, index) in iconActions" :key="index">
      <span @click="handleAction(item)">
        <icon-btn class="opr-btn" :disabled="item.disabled" :icon="item.iconClass" :text="item.label" />
      </span>
    </div>
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
      default: 4
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
      if (!action.disabled) {
        action.handler()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.action-button {
  display: flex;
  align-items: center;
  height: 17px;
  .action-element {
    margin-left: 10px;
    height: 22px;
    line-height: 22px;
    .action-disabled {
      cursor: no-drop;
    }
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
