<template>
  <div ref="flowWrap" class="flow-region" @drop="drop($event)" @dragover="allowDrop($event)">
    <div :id="`flow${currentNotebook.id}`" class="flow-region-flow" :class="showNodeEditor && needTranformToLeft && 'transform-left'" @drop="drop($event)" @dragover="allowDrop($event)">
      <FlowNode
        v-for="item in data.nodeList"
        :key="item.id"
        :node="item"
        :id="item.id"
        :isActive="selectNodeId === item.id"
        @editNode="editNode(item)"
        @deleteNode="confirmDelteNode(item)"
        />
    </div>
  </div>
</template>

<script>
import { jsPlumb } from 'jsplumb'
import { jsplumbSetting, jsplumbConnectOptions, jsplumbSourceOptions, jsplumbTargetOptions } from './config/commonConfig'
import methods from './config/methods'
import FlowNode from './components/NodeItem/index'
import { mapState, mapActions, mapMutations } from 'vuex'
import { GenNonDuplicateID } from '@/util'

export default {
  name: 'workflow',
  props: ['selectNodeId', 'workflowActiveTab', 'currentNotebook', 'activeNotebookId', 'showNodeEditor', 'needTranformToLeft'],
  components: {
    FlowNode
  },
  data () {
    return {
      jsPlumb: null,
      data: {
        nodeList: [],
        lineList: []
      },
      jsplumbSetting: jsplumbSetting,
      jsplumbConnectOptions: jsplumbConnectOptions,
      jsplumbSourceOptions: jsplumbSourceOptions,
      jsplumbTargetOptions: jsplumbTargetOptions,
      auxiliaryLine: { isShowXLine: true, isShowYLine: true},  // 对齐辅助线是否显示
      auxiliaryLinePos: { width: '100%', height: '100%', offsetX: 0, offsetY: 0, x: 20, y: 20 },
      commonGrid: [5, 5], // 节点移动最小距离
      nodeList: [],
      nodeInfo: null
    }
  },
  watch: {
    activeNotebookId (newVal) { // tab
      if (this.currentNotebook.id === newVal) {
        this.connectLine()
      }
    },
    workflowActiveTab (val) {
      if (val === 'workflow') {
        this.connectLine()
      }
    }
  },
  computed: {
    ...mapState({
      currentItem: state => state.workflow.currentDragNode
    })
  },
  mounted () {
    this.jsPlumbReady()
  },
  methods: {
    ...mapActions('CreateNodeModal', {
      callCreateNodeModal: 'CALL_MODAL'
    }),
    ...mapMutations({
      setCurrentDragNode: 'SET_CURRENT_DRAG_NODE'
    }),
    ...mapActions({
      getNodeList: 'GET_NODE_LIST',
      updateNodePosition: 'UPDATE_NODE_POSITION',
      deleteWorkflowNode: 'DELETE_WORKFLOW_NODE'
    }),
    ...methods,
    jsPlumbReady () {
      this.jsPlumb = jsPlumb.getInstance()
      this.jsPlumb.setContainer(`flow${this.currentNotebook.id}`)
      if (this.currentNotebook.type === 'workflow') {
        this.getWorkflowNodeList()
      }
    },
    async getWorkflowNodeList (notNeedReload) {
      try {
        const res = await this.getNodeList({ workflow_id: this.currentNotebook.id, commit_id: this.currentNotebook.commit_id })
        this.nodeList = res.data.node_list
        this.$emit('changeNodeList', this.nodeList)
        if (!notNeedReload) {
          this.initData()
        } else {
          this.initNode()
          this.connectLine()
        }
        } catch (e){
          console.log(e)
        }
    },
    async updateWorkflowNodePostion (node_id, pos) {
      try {
        const params = {
          workflow_id: this.currentNotebook.id,
          node_id,
          data: {
            position: {
              left: pos[0] + 'px',
              top: pos[1] + 'px'
            }
          }
        }
        await this.updateNodePosition(params)
        this.getWorkflowNodeList(true) // 避免缩放之后移动位置会重新初始化图标变大
      } catch (e){
        console.log(e)
      }
    },

    initData () {
      this.initNode()
      this.$nextTick(() => {
        this.init()
      })
    },
    editNode (node) {
      const originNodePosition = this.nodeList.find(v => v.id === node.id).position
      const { left, top } = originNodePosition
      if (node.left !== left || node.top !== top) { //  拖拽的时候阻止触发点击事件
        return
      }
      // 需要判断是否需要提示
      this.$emit('openNodeEditor', node)
    },
    async confirmDelteNode (node) {
      try {
        await this.$confirm(this.$t('workflow.deleteNodeTip'), this.$t('workflow.deleteNodeTitle'), {
          confirmButtonText: this.$t('delete'),
          cancelButtonText: this.$t('cancel'),
          type: 'warning',
          customClass: 'centerButton'
        })
        await this.deleteWorkflowNode(node.id)
        this.$emit('openNodeEditor', null)
        this.getWorkflowNodeList()
      } catch (e) {
        console.log(e)
      }
    },
    getAllLines () {
      let list = []
      this.nodeList.forEach(v => {
        list = list.concat(this.getLineList(v.id, v.to))
      })
      return list
    },
    getLineList (id, toList) {
      let list = []
      for (let i = 0; i < toList.length; i++) {
        const item = toList[i]
        list.push({
          from: id,
          to: item,
          id: GenNonDuplicateID(8),
          label: 'Conection Line Name',
          Remark: ''
        })
      }
      return list
    },
    initNode () {
      const lineList = this.getAllLines()
      const nodeList = this.nodeList.map(v => {
        return {
          ...v,
          left: v.position.left,
          top: v.position.top
        }
      })
      this.$set(this, 'data', {nodeList, lineList})
    }
  }
};
</script>

<style lang="scss" scoped>

.flow-region {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  &-actions {
    height: 48px;
    line-height: 48px;
    text-align: center;
    border-bottom: 1px solid $--background-color-secondary;
  }
  &-flow {
    position: absolute;
    left: 0px;
    top: 0;
    width: 100%;
    height: 100%;
    &.transform-left {
      left: -400px;
    }
  }
}
</style>
