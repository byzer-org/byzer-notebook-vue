
<template>
  <div class="find-and-replace">
    <el-dialog
      :visible.sync="showMsg"
      :modal-append-to-body="true"
      :is-dragable="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div slot="title" class="dialog-title">
        {{ $t('notebook.findAndReplaceTitle') }}
      </div>
      <!-- 查询文本 -->
      <div>
        <span class="find-and-replace-sub-title">{{ $t('notebook.findKey') }}</span>
        <div class="find-and-replace-input">
          <el-input
            ref="findAndReplaceInputRef"
            v-model="findKey"
            @input="handleFindKeyChanged"
            :placeholder="$t('notebook.inputPlaceholder')"
            auto-complete="off"
          ></el-input>
        </div>
      </div>
      <!-- 替换内容 -->
      <div>
        <span class="find-and-replace-sub-title">{{ $t('notebook.replaceKey') }}</span>
        <div class="find-and-replace-input">
          <el-input
            v-model="replaceKey"
            @input="handleReplaceKeyChanged"
            :placeholder="$t('notebook.inputPlaceholder')"
            auto-complete="off"
          ></el-input>
        </div>
      </div>
      <!-- 查找结果 -->
      <div v-if="results && results.length > 0">
        <div>
          <span class="find-and-replace-sub-title">{{ $t('notebook.findResult') }}</span>
          <el-button-group>
            <el-button @click="selectPrevious" plain size="mini" icon="el-ksd-icon-arrow_left_22" >{{ $t('notebook.previous') }}</el-button>
            <el-button @click="selectNext" plain size="mini" >{{ $t('notebook.next') }}<i class="el-ksd-icon-arrow_right_22"></i></el-button>
          </el-button-group>
        </div>
        <div class="find-result-list-container">
          <div
            class="find-result-list"
            v-for="cell in results"
            :key="cell.cellInfo.id + cell.cellIndex + cell.lineIndex"
          >
            <div class="find-result-list-index">{{ 'Cell ' + (cell.cellIndex + 1) }}</div>
            <div class="find-result-list-content" v-html="handleContent(cell)"></div>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="replaceCurrent">{{ $t('notebook.replace') }}</el-button>
        <el-button type="primary" @click="replaceAll">{{$t('notebook.replaceAll')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import CodeEditor from '../../../../components/CodeEditor'

@Component({
  props: {
    // 有查询结果的行
    results: {
      default: [],
      type: Array
    },
    replacedText: {
      default: '',
      type: String
    }
  },
  components: { CodeEditor },
  watch: {
    results: {
      handler () {
        // 有查询结果的行刷新后重新定位查询结果的文本的position
        this.locateFindKey()
      },
      deep: true
    },
    replacedText (newVal) {
      this.findKey = newVal
      this.$emit('handleFindKeyChanged', this.findKey)
    }
  }
})
export default class FindAndReplace extends Vue {
  /* 当前对话框的展示状态 */
  showMsg = false

  /* 查找内容 */
  findKey = ''

  /* 替换内容 */
  replaceKey = ''

  /* 当前选中结果 */
  currentResult = ''

  /* 每行查找到的结果的坐标的集合 */
  positions = []

  /**
   * @description: 定位所有符合查找条件的文本
   * @Date: 2021-09-08 11:10:52
   */
  locateFindKey () {
    if (!this.findKey) {
      return
    }
    this.positions = []
    this.results.forEach(item => {
      this.findPos(item, -1)
    })
    const { cellId = '', cellIndex = '', lineIndex = '', pos = '' } =
      this.positions[0] || {}
    this.currentResult = cellId + '-' + cellIndex + '-' + lineIndex + '-' + pos
  }

  /**
   * @description: 选中下一个
   * @Date: 2021-09-08 14:11:11
   */
  selectNext () {
    let index = this.positions.findIndex(
      ({ cellId = '', cellIndex = '', lineIndex = '', pos = '' }) =>
        this.currentResult ===
        cellId + '-' + cellIndex + '-' + lineIndex + '-' + pos
    )
    if (index >= this.positions.length - 1) {
      index = -1
    }
    const {
      cellId = '',
      cellIndex = '',
      lineIndex = '',
      pos = ''
    } = this.positions[index + 1]
    this.currentResult = cellId + '-' + cellIndex + '-' + lineIndex + '-' + pos
  }

  /**
   * @description: 选中上一个
   * @Date: 2021-09-08 14:10:58
   */
  selectPrevious () {
    let index = this.positions.findIndex(
      ({ cellId = '', cellIndex = '', lineIndex = '', pos = '' }) =>
        this.currentResult ===
        cellId + '-' + cellIndex + '-' + lineIndex + '-' + pos
    )
    if (index <= 0) {
      index = this.positions.length
    }
    const {
      cellId = '',
      cellIndex = '',
      lineIndex = '',
      pos = ''
    } = this.positions[index - 1]
    this.currentResult = cellId + '-' + cellIndex + '-' + lineIndex + '-' + pos
  }

  /**
   * @description: 根据当前位置查找
   * @param {cellIndex} cell在note中的位置
   * @param {lineIndex} 当前content的行在当前cell中的行号
   * @param {content} 当前行的文本
   * @param {id: cellId} 当前行所在cell的id
   * @param {pos} 当前查找的位置
   * @Date: 2021-09-08 11:08:03
   */
  findPos (
    { cellIndex, lineIndex, content = '', cellInfo: { id: cellId } },
    pos
  ) {
    pos = content.indexOf(this.findKey, pos)
    while (pos > -1) {
      this.positions.push({
        cellIndex,
        lineIndex,
        cellId,
        pos
      })
      pos = content.indexOf(this.findKey, pos + this.findKey.length)
    }
  }

  /**
   * @description:
   * @param {cellIndex} cell在note中的位置
   * @param {lineIndex} 当前content的行在当前cell中的行号
   * @param {content} 当前行的文本
   * @param {id: cellId} 当前行所在cell的id
   * @return {*} 添加背景颜色后的查找结果
   * @Date: 2021-09-08 10:04:55
   */
  handleContent ({
    cellIndex,
    lineIndex,
    content = '',
    cellInfo: { id: cellId }
  }) {
    // 没有找到查询的值或还没有开始定位，直接返回原文本
    if (!this.positions.length) {
      return content
    }
    // 定位完成后根据定位返回添加了背景颜色的文本
    const linePosList = []
    this.positions.forEach(
      ({
        cellId: posCellId = '',
        cellIndex: posCellIndex = '',
        lineIndex: posLineIndex = '',
        pos = ''
      }) => {
        if (
          posCellId === cellId &&
          posCellIndex === cellIndex &&
          posLineIndex === lineIndex
        ) {
          linePosList.unshift({
            pos,
            isActive:
              this.currentResult ===
              cellId + '-' + cellIndex + '-' + lineIndex + '-' + pos
          })
        }
      }
    )

    return this.replaceByIndex(content, linePosList)
  }

  /**
   * @description: 替换指定位置的字符串
   * @param {content} 给定文本
   * @param {linePosList} 每行所有的查找结果的位置集合
   * @return {*} 替换后的文本
   * @Date: 2021-09-08 11:43:57
   */
  replaceByIndex (content, linePosList = []) {
    linePosList.forEach(({ pos, isActive }) => {
      if (isActive) {
        content =
          content.slice(0, pos) +
          `<span class="find-result-content-bg active">${this.findKey}</span>` +
          content.slice(pos + this.findKey.length)
      } else {
        content =
          content.slice(0, pos) +
          `<span class="find-result-content-bg">${this.findKey}</span>` +
          content.slice(pos + this.findKey.length)
      }
    })
    return content
  }

  /**
   * @description: 替换当前选中
   * @Date: 2021-09-06 18:35:18
   */
  replaceCurrent () {
    let index = this.positions.findIndex(
      i =>
        this.currentResult ===
        i.cellId + '-' + i.cellIndex + '-' + i.lineIndex + '-' + i.pos
    )
    this.$emit('handleReplace', this.currentResult)
    this.$nextTick(() => {
      if (this.positions.length) {
        if (index > this.positions.length - 1) {
          index = this.positions.length
        }
        const {
          cellId = '',
          cellIndex = '',
          lineIndex = '',
          pos = ''
        } = this.positions[index]
        this.currentResult =
          cellId + '-' + cellIndex + '-' + lineIndex + '-' + pos
      } else {
        this.currentResult = ''
      }
    })
  }

  /**
   * @description: 替换所有
   * @Date: 2021-09-06 18:36:11
   */
  replaceAll () {
    this.$emit('handleReplace', this.positions)
  }

  /**
   * @description: 查找内容变化
   * @param {*} e 改变后的值
   * @Date: 2021-09-07 13:41:54
   */
  handleFindKeyChanged (e) {
    this.$emit('handleFindKeyChanged', e)
    this.$nextTick(() => {
      // 查找到结果，findResults不为空时再去获取每一个值
      this.locateFindKey()
    })
  }

  /**
   * @description: 替换内容变化
   * @param {*} 改变后的值
   * @Date: 2021-09-07 13:42:14
   */
  handleReplaceKeyChanged (e) {
    this.$emit('handleReplaceKeyChanged', e)
  }

  @Watch('showMsg')
  showMsgHandler (newValue) {
    this.$nextTick(() => {
      if (newValue) {
        // 打开对话框之后自动聚焦在查找文本中
        this.$refs['findAndReplaceInputRef'].focus()
      }
    })
  }
}
</script>

<style lang="scss">


.find-and-replace {
  .dialog-title {
    height: 24px;
    line-height: 24px;
    font-weight: 600;
    font-size: 16px;
    color: $findAndReplaceTitleColor;
  }
  .find-and-replace-sub-title {
    display: inline-block;
    margin-right: 10px;
    margin-bottom: 8px;
    height: 16px;
    line-height: 16px;
    font-weight: 500;
    font-size: 12px;
    color: $--color-text-primary;
  }
  .find-and-replace-input {
    margin-bottom: 16px;
  }
  .find-result-list-container {
    margin-top: 16px;
    width: 100%;
    max-height: 340px;
    overflow: auto;
  }
  .find-result-list {
    display: flex;
    margin-bottom: 10px;
    font-size: 14px;
    line-height: 24px;
    background: $--background-color-secondary;
    .find-result-list-index {
      min-width: 55px;
      text-align: center;
      font-size: 12px;
      transform: scale(0.75);
      color: $--color-info;
    }
    .find-result-list-content {
      flex: 1;
      color: $cellTextColor;
      .find-result-content-bg {
        display: inline-block;
        width: fit-content;
        background: $findAndReplaceItem;
        &.active {
          background: $findAndReplaceSelectedItem;
        }
      }
    }
  }
}
</style>
