<template>
  <section class="dag-wrap page-outer-padding">
    <div class="page-inner-header">
      <i
        class="el-ksd-icon-arrow_left_L_22 hasEvent"
        @click="back"
      ></i>
      <span>{{ scheduleInfo ? scheduleInfo.name : '' }}</span>
    </div>
    <div class="graph-wrap">
      <div ref="dagRef"></div>
    </div>
  </section>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { Graph } from '@antv/x6'
import GraphNode from '../../../components/GraphNode'
import '@antv/x6-vue-shape'
import { DagreLayout } from '@antv/layout'
import { mapActions, mapState } from 'vuex'
import { Darge_Layout_ATTRS, GRAPH_EDGE_ATTRS, GRAPH_NODE_ATTRS } from '../../../config'

@Component({
  computed: {
    ...mapState({
      is_scheduler_enabled: state => state.global.is_scheduler_enabled
    })
  },
  methods: {
    ...mapActions({
      getSchedulesList: 'GET_SCHEDULE_LIST'
    })
  }
})
export default class DAG extends Vue {
  graphIns = undefined

  scheduleInfo = ''

  async initDag () {
    await this.queryData()
    if (!this.$refs['dagRef']) {
      return
    }

    this.initGraph()

    const dagreLayout = new DagreLayout(Darge_Layout_ATTRS)

    const newModel = dagreLayout.layout(this.formatData())

    this.graphIns.fromJSON(newModel)

    this.graphIns.centerContent()
  }

  formatData () {
    const { entities, connects } = this.scheduleInfo
    return {
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
  }

  back () {
    this.$router.push({ name: 'schedulesHome' })
  }

  async queryData () {
    if (!this.is_scheduler_enabled) {
      return
    }
    try {
      const res = await this.getSchedulesList()
      if (res && res.data) {
        this.scheduleInfo = res.data.find(
          i => i.id === Number(this.$route.params.id)
        )
      }
    } catch (err) {
      this.scheduleInfo = { name: '', entities: [], connects: [] }
    }
  }

  initGraph () {
    if (!this.graphIns) {
      this.graphIns = new Graph({
        container: this.$refs['dagRef'],
        height: this.$refs['dagRef'].parentNode.getBoundingClientRect().height,
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
  }

  mounted () {
    this.initDag()
  }

  beforeDestroy () {
    if (this.graphIns) {
      this.graphIns.dispose()
    }
  }
}
</script>

<style lang="scss" scoped>


.dag-wrap {
  padding: 36px 54px;
  width: 100%;
  height: calc(100vh - $page-header-height);

  .page-inner-header {
    display: flex;
    align-items: center;
    & > span {
      margin-left: 10px;
    }
  }

  .graph-wrap {
    margin-top: 16px;
    height: calc(100vh - $page-header-height - 16px - 72px - 42px);
  }
}
</style>
