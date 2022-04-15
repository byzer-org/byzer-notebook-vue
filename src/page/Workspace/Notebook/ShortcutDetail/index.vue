
<template>
  <div class="shortcut-detail">
    <div class="shortcut-sub-title">{{ title }}</div>
    <div v-for="(item, index) in list" :key="index">
      <ShortcutItem :item="item" :platform="platform" />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import ShortcutItem from '../ShortcutItem'
import ShortcutPromptList from './shortcutDetail'
import { cloneDeep } from 'lodash'

@Component({
  props: ['mode', 'type'],
  components: {
    ShortcutItem
  }
})
export default class ShortcutDetail extends Vue {
  title = ''

  list = []

  platform = 'win'

  mounted () {
    this.checkDetail()
  }

  checkDetail () {
    this.platform = this.checkUserAgent()
    this.title = this.type === 'global' ? 'Global' : 'Markdown'
    this.list = cloneDeep(ShortcutPromptList)[this.mode][this.type].map(i => {
      i.shortcut = this.chooseBtn(i.shortcut)
      i.subShortcut = this.chooseBtn(i.subShortcut)
      return i
    })
  }

  /**
   * @description: 根据mac/windows返回快捷键
   * @Date: 2021-09-03 13:35:22
   */
  chooseBtn (shortcut) {
    let result = shortcut
      .split(',')
      .filter(i => i)
      .map(i => i.trim())
    if (this.platform === 'mac' && result.length === 2) {
      return result[1]
    } else {
      return result[0] || ''
    }
  }

  /**
   * @description: windows || mac
   * @Date: 2021-09-03 10:58:20
   */
  checkUserAgent () {
    /** * 判断mac系统(含iphone手机) ***/
    if (/macintosh|mac os x/i.test(navigator.userAgent)) {
      return 'mac'
    }
    /** * 判断windows系统 ***/
    if (/windows|win32/i.test(navigator.userAgent)) {
      return 'win'
    }
  }
}
</script>

<style lang="scss" scoped>

.shortcut-detail {
  .shortcut-sub-title {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    margin-bottom: 5px;
    padding-bottom: 8px;
    width: 100%;
    height: 40px;
    font-weight: 500;
    font-size: 14px;
    color: $--color-text-primary;
    border-bottom: 1px solid $--border-color-base;
  }
}
</style>
