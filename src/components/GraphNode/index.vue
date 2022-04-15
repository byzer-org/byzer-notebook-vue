<template>
  <el-tooltip placement="top" :content="taskEntity.name">
    <div class="node-circle">
      <div class="node-task-name">{{ taskEntity.name }}</div>
    </div>
  </el-tooltip>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'

@Component({
  name: 'GraphNode',
  inject: ['getGraph', 'getNode']
})
export default class GraphNode extends Vue {
  taskEntity = this.getNode().data.taskEntity
}
</script>

<style lang="scss" scoped>

.node-circle {
  position: relative;
  width: 32px;
  height: 32px;
  background: $pattern-blue-100;
  border: 2px solid $--color-primary;
  border-radius: 16px;

  .node-task-name {
    position: absolute;
    top: 40px;
    left: -46px;
    width: 120px;
    color: $--color-text-primary;
    text-align: center;
    font-weight: bold;
    display:-webkit-box;
    -webkit-line-clamp:3;
    -webkit-box-orient:vertical;
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-all;
  }
}
</style>
