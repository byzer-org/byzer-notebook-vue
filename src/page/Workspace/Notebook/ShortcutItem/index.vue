
<template>
  <div class="shortcut-item">
    <div class="description">{{ $t(`notebook.${content}`) }}</div>
    <div class="key-logo">
      <span v-if="shortcutList.length > 0" class="btn-wrapper">
        <span
          class="btn-logo"
          :class="{ 'first-key': index === 0 }"
          :style="{ width: shortcut.length > 1 ? '40px' : '24px' }"
          v-for="(shortcut, index) in shortcutList"
          :key="index"
        >
          <span class="text">{{ shortcut }}</span>
        </span>
      </span>
      <span v-if="subShortcutList.length > 0" class="btn-wrapper">
        <span class="subshortcut-separator">/</span>
        <span
          class="btn-logo"
          :class="{ 'first-key': index === 0 }"
          :style="{ width: subShortcut.length > 1 ? '40px' : '24px' }"
          v-for="(subShortcut, index) in subShortcutList"
          :key="index"
        >
          <span class="text">{{ subShortcut }}</span>
        </span>
      </span>
      <span v-if="frequency > 1">
        {{ ' * ' + frequency }}
      </span>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'

@Component({
  props: ['item', 'platform']
})
export default class ShortcutItem extends Vue {
  /* 快捷键描述 */
  content = ''

  /* 快捷键功能键 */
  shortcutList = []

  /* 快捷键其他功能键 */
  subShortcutList = []

  /* 按键次数 */
  frequency = 1

  mounted () {
    this.checkParams()
  }

  /**
   * @description: 解析参数
   * @Date: 2021-09-03 10:58:00
   */
  checkParams () {
    this.content = this.item?.content
    this.shortcutList = this.item?.shortcut.split('-')
    this.subShortcutList = this.item?.subShortcut.split('-').filter(i => i)
    this.frequency = this.item?.frequency || 1
  }
}
</script>

<style lang="scss" scoped>

.shortcut-item {
  margin: 9px 10px 9px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 244px;
  .description {
    max-width: 220px;
    font-weight: 500;
    font-size: 12px;
    color: $--color-text-primary;
  }
  .key-logo {
    display: inline-block;
    white-space: nowrap;
    .btn-wrapper {
      .btn-logo {
        display: inline-block;
        margin-left: 8px;
        height: 24px;
        line-height: 24px;
        font-size: 0;
        text-align: center;
        color: $--color-text-primary;
        border: 1px solid $--color-text-secondary;
        border-radius: 2px;
        .text {
          display: inline-block;
          font-size: 12px;
        }
        &.first-key {
          margin-left: 0;
        }
      }
    }
    .subshortcut-separator {
      display: inline-block;
      width: 24px;
      text-align: center;
    }
  }
}
</style>
