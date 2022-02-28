<template>
  <el-tooltip placement="top" :content="taskEntity.description">
    <el-tag>{{ taskEntity.name }}</el-tag>
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
@import '../../assets/css/variable.scss';
.el-tag {
  width: 100px;
  text-overflow: ellipsis;
  overflow: hidden;
  text-align: center;
  border-color: $--border-color-tag;
}
</style>
