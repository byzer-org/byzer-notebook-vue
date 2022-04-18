<template>
  <el-dialog
    width="1200px"
    append-to-body
    :title="$t('schedules.DAGViewTitle')"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible="isShow"
    @close="isShow && closeModal()"
  >
    <div class="des_wrap">
      <div class="des_item">
        <span class="des_label">{{ $t('schedules.dag_task_name') }}</span>
        <span class="des_value">{{ taskName || '' }}</span>
      </div>
      <div class="des_item">
        <span class="des_label">{{ $t('schedules.dag_task_description') }}</span>
        <span class="des_value">{{ taskDescription || '' }}</span>
      </div>
      <div class="des_item">
        <span class="des_label">{{ $t('schedules.dag_schedule_name') }}</span>
        <span class="des_value">{{ scheduleName || '' }}</span>
      </div>
    </div>
    <div class="dag-wrap" ref="dagRef"></div>
    <div slot="footer">
      <el-button size="medium" @click="closeModal">
        {{ $t('close') }}
      </el-button>
      <el-button type="primary" size="medium" @click="editTask">
        {{ $t('schedules.editTaskTitle') }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapState, mapMutations, mapActions } from 'vuex'
import { cloneDeep } from 'lodash'
import { Graph } from '@antv/x6'
import GraphNode from '../GraphNode'
import '@antv/x6-vue-shape'
import { DagreLayout } from '@antv/layout'
import vuex, { actionsTypes } from '../../store/index'
import store from './store'
import { Darge_Layout_ATTRS, GRAPH_EDGE_ATTRS, GRAPH_NODE_ATTRS } from '../../config'
vuex.registerModule(['modals', 'DAGViewModal'], store)

@Component({
  name: 'DAGView',
  computed: {
    ...mapState('DAGViewModal', {
      isShow: state => state.isShow,
      taskInfo: state => state.taskInfo,
      callback: state => state.callback
    })
  },
  methods: {
    ...mapMutations('DAGViewModal', {
      hideModal: actionsTypes.HIDE_MODAL,
      resetModal: actionsTypes.RESET_MODAL
    }),
    ...mapActions('EditTaskModal', {
      callEditTaskModal: 'CALL_MODAL'
    })
  }
})
export default class DAGView extends Vue {
  isSubmiting = false

  taskName = ''
  taskDescription = ''
  scheduleName = ''
  previousTask = ''

  graphIns = undefined

  @Watch('taskInfo')
  onTaskInfochanged (newVal) {
    if (newVal && newVal.scheduleInfo) {
      const {
        scheduleInfo: { entities, name, connects },
        currentNotebook: { id }
      } = newVal
      const entity = entities.find(e => e.entity_id === Number(id))
      this.taskName = entity?.name
      this.taskDescription = entity?.description
      this.scheduleName = name
      /**
       * c
       * { endPointSourceId: "notebook-xxxx", endPointTargetId: "notebook-xxxx" }
       * endPointSourceId 上一个
       * endPointTargetId 下一个
       */
      const previousTaskId = connects.find(
        c =>
          c.endPointTargetId === entity.entity_type + '-' + entity.entity_id
      )?.endPointSourceId
      this.previousTask = entities.find(
        e => e.entity_type + '-' + e.entity_id === previousTaskId
      )?.name
      this.renderDAG(newVal)
    } else {
      this.taskName = ''
      this.taskDescription = ''
      this.scheduleName = ''
      this.previousTask = ''
      this.renderDAG({
        scheduleInfo: {
          entities: [],
          connects: []
        },
        currentNotebook: newVal.currentNotebook
      })
    }
  }

  // 关闭弹窗
  closeModal () {
    this.hideModal()
  }

  async editTask () {
    const { type } = await this.callEditTaskModal(
      cloneDeep({
        taskInfo: this.taskInfo,
        form: {
          taskName: this.taskName,
          taskDescription: this.taskDescription,
          scheduleName: this.scheduleName,
          previousTask: this.previousTask
        }
      })
    )
    this.closeModal()
    this.callback({ type })
  }

  renderDAG (taskInfo) {
    this.$nextTick(() => {
      if (!this.$refs['dagRef']) {
        return
      }
      if (!this.graphIns) {
        this.graphIns = new Graph({
          container: this.$refs['dagRef'],
          width: 1152,
          height: 458,
          grid: {
            size: 10, // 网格大小 10px
            visible: true // 渲染网格背景
          }
        })

        Graph.registerVueComponent(
          'graph-node',
          {
            // GraphNode不要大写。。。
            template: '<graph-node />',
            components: {
              GraphNode
            }
          },
          true
        )
      }
      const {
        scheduleInfo: { entities, connects }
      } = taskInfo
      const model = {
        nodes: entities.map(e => ({
          id: e.entity_type + '-' + e.entity_id,
          data: {
            taskEntity: e
          },
          ...GRAPH_NODE_ATTRS
        })),
        edges: connects.map(c => ({
          source: c.endPointSourceId,
          target: c.endPointTargetId,
          attrs: GRAPH_EDGE_ATTRS
        }))
      }
      const dagreLayout = new DagreLayout(Darge_Layout_ATTRS)
      const newModel = dagreLayout.layout(model)

      this.graphIns.fromJSON(newModel)
      this.graphIns.centerContent()
    })
  }

  beforeDestroy () {
    if (this.graphIns) {
      this.graphIns.dispose()
    }
  }
}
</script>
<style lang="scss">

.des_wrap {
  .des_item {
    margin: 8px 0;
    display: flex;
    font-size: 14px;
    .des_label {
      font-weight: bold;
      white-space: pre;
    }
  }
}
.dag-wrap {
  height: 458px;
  border: 1px solid $--background-color-secondary;
  border-radius: 6px;
}
</style>
