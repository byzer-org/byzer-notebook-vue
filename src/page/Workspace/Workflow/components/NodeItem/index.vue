<template>
  <el-button 
    class="node-item node-icon-item"
    ref="node"
    :class="`node${node.id} ` + getNodeClass(node) + (isActive ? ' active' : '')"
    :style="flowNodeContainer"
    @click.native="handleClick"
    :disabled="isDemo"
    >
    <input ref="inputRef" @keyup.delete="$emit('deleteNode')" type="text" class="click_ele" style="opacity: 0; z-index: -1;position: absolute;">
    <svg-icon :icon-class="`node_${getNodeName(node)}_24`" class-name="node-style">{{node.name}}</svg-icon>
  </el-button>
</template>

<script>
import ClickOutside from 'vue-click-outside'
import { Component, Vue } from 'vue-property-decorator'
import { mapState, mapGetters } from 'vuex'
import { basicNodeType } from '../ETNode/config'
@Component({
  props: ['node', 'isActive'],
  directives: {
    ClickOutside
  },
  computed: {
    ...mapState({
      allNodeList: state => state.workflow.nodeList
    }),
    ...mapGetters(['isDemo'])
  }
})
export default class NodeItem extends Vue {
  normalNodeList = basicNodeType
  // 节点容器样式
  get flowNodeContainer () {
    return {
      top: this.node.top,
      left: this.node.left
    }
  }
  getNodeClass (node) {
    if (this.normalNodeList.includes(node.type)) {
      return node.type
    } else {
      const nodeInfo = this.allNodeList.find(v => v.id === node.content.et_id)
      let nodeClass = ''
      if (nodeInfo) {
        const nodeType = nodeInfo.category.toLowerCase()
        nodeClass = nodeType.includes(' ') ? nodeType.split(' ')[0] : nodeType
      }
      return nodeClass
    }
  }

  getNodeName (node) {
    if (this.normalNodeList.includes(node.type)) {
      return node.type
    } else {
      const nodeInfo = this.allNodeList.find(v => v.id === node.content.et_id)
      const nodeName = nodeInfo ? nodeInfo.name.toLowerCase() : ''
      return nodeName
    }
  }

  handleClick () {
    this.$refs.inputRef && this.$refs.inputRef.focus()
    this.$emit('editNode')
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../../assets/css/variable.scss';
.node-item {
  position: absolute;
  display: flex;
  margin-left: 0;
  width: 48px;
  height: 40px;
  justify-content: center;
  align-items: center;
  border: 1px solid $--color-white;
  box-shadow: 0px 1px 4px rgba(63, 89, 128, 0.08);
  border-radius: 4px;
  font-size: 24px;
  cursor: pointer;
  .node-style {
    font-size: 24px;
  }
  .click_ele {
    width: 48px;
    height: 40px;
    opacity: 0;
    z-index: -1;
    position: absolute;
    left: 0;
    top: 0;
  }
  &.active {
    box-shadow: 0px 0px 0px 2px #FFFFFF, 0px 0px 0px 5px $pattern-blue-400;
  }
}
</style>