
<template>
  <div class="workflow-side">
    <div class="workflow-side-title">{{$t('workspace.workflow')}}</div>
    <div class="workflow-side-wrapper" :class="disabledDrag && 'disable-drag'">
      <div v-for="(node, index) in allNodeList" :key="node.type" class="workflow-side-wrapper-node">
        <div class="workflow-side-wrapper-node-header">
          <div class="workflow-side-wrapper-node-header-title">{{node.type}} Node</div>
          <div class="workflow-side-wrapper-node-header-btn" @click="handleToggleShow(index)">
            <icon-btn icon="el-ksd-icon-arrow_down_22" v-if="node.showNode"/>
            <icon-btn icon="el-ksd-icon-arrow_up_22" v-else />
          </div>
        </div>
        <div class="workflow-side-wrapper-node-content" v-if="node.showNode">
          <div v-for="item in node.nodeList" :key="item.name" class="workflow-side-wrapper-node-content-item" >
            <el-tooltip placement="top" effect="light" popper-class="node-tooltip">
              <div>
                <div class="workflow-side-wrapper-node-content-item-icon node-icon-item"
                  :draggable="!disabledDrag"
                  @dragstart="drag($event, item)"
                  :class="getNodeClass(node, item)" >
                  <svg-icon :icon-class="`node_${item.name.toLowerCase()}_24`" class-name="node-style"></svg-icon>
                </div>
                <div class="workflow-side-wrapper-node-content-item-name">
                  <span class="name">{{item.name}}</span>
                </div>
              </div>
              <div slot="content">
                <div class="title">{{item.name}}</div>
                <div class="desc" v-html="item.description"></div>
              </div>
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  methods: {
    ...mapMutations({
      setCurrentDragNode: 'SET_CURRENT_DRAG_NODE',
      setNodeList: 'SET_NODE_LIST'
    }),
    ...mapActions({
      getETNodeList: 'GET_ET_LIST'
    })
  },
  computed: {
    ...mapState({
      activeNotebook: state => state.notebook.activeNotebook,
      demoList: state => state.notebook.demoList
    }),
    ...mapGetters(['isDemo']),
    disabledDrag () {
      const { isPreviewMode } = this.activeNotebook
      return this.isDemo || isPreviewMode
    }
  }
})

export default class WorkflowSide extends Vue {
  allNodeList = [
    {
      type: 'Basic',
      showNode: true,
      nodeList: [
        { type: 'load', name: 'Load', id: 'load' },
        { type: 'select', name: 'Select', id: 'select' },
        { type: 'save', name: 'Save', id: 'save' },
        { type: 'train', name: 'Train', id: 'train' },
        { type: 'predict', name: 'Predict', id: 'predict' },
        { type: 'register', name: 'Register', id: 'register' }
      ]
    }
  ]
  created () {
    this.getNodeList()
  }
  handleToggleShow (index) {
    const isShow = this.allNodeList[index].showNode
    this.allNodeList[index].showNode = !isShow
  }
  getNodeClass (node, nodeItem) {
    const nodeType = node.type.toLowerCase()
    const nodeClass = nodeType.includes(' ') ? nodeType.split(' ')[0] : nodeType
    return nodeType.toLowerCase() === 'basic' ? nodeItem.type : nodeClass
  }
  drag (ele, item) {
    this.setCurrentDragNode(item)
  }

  getName (type) {
    const arr = type.split('')
    arr[0] = arr[0].toUpperCase()
    return arr.join('')
  }

  getAllNodeList (list) {
    const algorithm = list.filter(v => v.category === 'Algorithm')
    const feature = list.filter(v => v.category === 'Feature Engineering')
    const processing = list.filter(v => v.category === 'Data Processing')
    const tool = list.filter(v => v.category === 'Tool')
    const allNode = [
      { type: 'Algorithm', showNode: true, nodeList: algorithm },
      { type: 'Feature Engineering', showNode: true, nodeList: feature },
      { type: 'Data Processing', showNode: true, nodeList: processing },
      { type: 'Tool', showNode: true, nodeList: tool }
    ]
    this.allNodeList = this.allNodeList.concat(allNode)
  }

  async getNodeList () {
    try {
      const res = await this.getETNodeList()
      const list = res.data.map(v => {
        return {...v, type: 'et'}
      })
      this.setNodeList(list)
      this.getAllNodeList(list)
    } catch (e) {
      console.log(e)
    }
  }
} 
</script>
<style lang="scss">
@import '../../../../../assets/css/variable.scss';
.node-tooltip.el-tooltip__popper {
  .title {
    font-size: 12px;
    font-weight: 600;
    line-height: 24px;
  }
  .desc {
    font-size: 12px;
    line-height: 18px;
  }
}
.workflow-side {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  .node-style {
    font-size: 16px;
    color: #fff;
  }
  &-title{
    padding: 16px;
    padding-right: 0;
    line-height: 26px;
    font-size: 20px;
    font-weight: 600;
    color: $--color-black;
  }
  &-wrapper {
    &.disable-drag {
      opacity: 0.4;
    }
    &-node {
      &-header {
        width: 100%;
        padding: 0px 16px;
        padding-right: 8px;
        background-color: #fff;
        display: flex;
        justify-content: space-between;
        &-title {
          line-height: 40px;
          font-weight: 500;
          font-size: 12px;
        }
        &-btn {
          padding-top: 2px;
          width: 40px;
          height: 40px;
          padding: 9px 6px;
          text-align: center;
          .el-button {
            .icon {
              font-size: 22px;
            }
          }
        }
      }
      &-content {
        display: flex;
        flex-wrap: wrap;
        padding: 8px 10px;
        cursor: move;
        &-item {
          text-align: center;
          padding-top: 16px;
          padding-bottom: 12px;
          width: 62px;
          &-icon {
            margin: 0 auto;
            width: 34px;
            height: 28px;
            display: flex;
            justify-content: center;
            padding-top: 6px;
            border-radius: 4px;
            font-size: 16px;
          }
          &-name {
            width: 100%;
            .name {
              display: block;
              width: 120%;
              font-size: 12px;
              transform: scale(0.83) translateX(-10%);
              overflow: hidden;
              white-space: wrap;
              word-break: break-all;
              text-overflow: ellipsis;
              line-clamp: 2;
            }
            text-align: center;
            color: $--color-text-regular;
            padding: 0 3px;
            padding-top: 2px;
            line-height: 14px;
            height: 28px;
            overflow: hidden;
          }
        }
      }
    }
  }
}
</style>
