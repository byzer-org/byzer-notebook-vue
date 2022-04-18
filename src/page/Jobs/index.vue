<template>
  <div class="jobs-page page-outer-padding">
    <div class="page-inner-header">{{$t('jobs.jobHistory')}}</div>
    <el-tabs class="tab-wrap" v-model="activeName">
      <el-tab-pane :label="$t('jobs.latest')" name="latest">
        <JobsTable :dataType="'latest'"></JobsTable>
      </el-tab-pane>
      <el-tab-pane :label="$t('jobs.archived')" name="archived">
        <JobsTable :dataType="'archived'"></JobsTable>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import JobsTable from './JobsTable'

@Component({
  components: {
    JobsTable
  }
})
export default class JobPage extends Vue {
  activeName = 'latest'
}
</script>
<style lang="scss">

.jobs-page {
  .tab-wrap {
    margin-top: 10px;
  }
}
</style>
