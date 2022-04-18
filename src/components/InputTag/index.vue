
<template>
  <div class="input-to-tag">
    <div class="input-to-tag-item" v-for="(item, index) in tagList" :key="index">
      <el-tag v-if="!item.isEdit && item.name" size="small" @close="handleDelete(item, index)" closable >
        <span @dblclick="handleDbClick(item, index)" @click.stop>{{item.name}}</span>
      </el-tag>
      <el-input
        :clearable="false"
        v-if="item.isEdit"
        :ref="`tagInput${index}`"
        v-model.trim="curValue"
        @keyup.enter.native="handleEnter(index)"
        @blur="handleBlur(index)"
      />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { uniqBy } from 'lodash'

@Component({
  props: ['value']
})

export default class InputToTag extends Vue {
  tagList = []
  curValue = ''

  @Watch('value')
  onValueChange () {
    this.initList()
  }

  mounted () {
    this.initList()
  }

  initList () {
    this.tagList = this.value.map(v => {
      return {
        isEdit: false,
        name: v
      }
    })
    this.addLast()
  }
  addLast () {
    this.tagList.push({
      name: '',
      isEdit: true
    })
  }
  handleEnter (index) {
    if (!this.curValue) {
      return
    }
    this.tagList[index].name = this.curValue
    this.tagList[index].isEdit = false
    this.curValue = ''
    this.addLast()
    this.changeList()
    this.$nextTick(() => {
      this.$refs[`tagInput${index + 1}`] && this.$refs[`tagInput${index + 1}`][0]?.$refs?.input.focus()
    })
  }

  changeList () {
    const temp = uniqBy(this.tagList, 'name')
    const arr = temp.filter(v => v.name).map(v => v.name)
    this.$emit('input', arr)
  }

  handleBlur (index) {
    this.handleEnter(index)
  }

  handleDelete (item, index) {
    this.tagList.splice(index, 1)
    this.changeList()
  }

  handleDbClick (item, index) { // 编辑当前tag
    this.tagList[index].isEdit = true
    this.curValue = item.name
    this.$nextTick(() => {
      this.$refs[`tagInput${index}`]?.$refs?.input.focus()
    })

  }
}
</script>
<style lang="scss">

.input-to-tag {
  width: 100%;
  border: 1px solid $--border-update-schedule;
  border-radius: 4px;
  padding-left: 10px;
  padding-right: 20px;
  display: flex;
  flex-wrap:wrap;
  &-item {
    margin-right: 5px;
    width: auto;
    height: 34px;
    line-height: 34px;
    position: relative;
    .el-input {
      width: 100%;
      position: absolute;
      left: 0;
      top: 0;
      .el-input__inner {
        position: absolute;
        display: inline-block;
        padding: 0;
        position: absolute;
        width: 100%;
        min-width: 40px;
        border: none;
        box-shadow: none;
        &:focus{
          box-shadow: none !important;
        }
      }
    }
  }
}
.el-form-item.is-error .input-to-tag {
  border-color: $--color-danger;
  .el-input__inner {
    border: none;
    box-shadow: none;
  }
}
</style>
