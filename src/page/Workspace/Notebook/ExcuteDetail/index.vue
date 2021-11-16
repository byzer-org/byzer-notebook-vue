
<template>
  <div class="excute-detail font-12">
    <div class="duration">Job Id: {{jobId}}
      <el-tooltip placement="top" :content="$t('common.copy')">
        <i class="hasEvent copy-btn el-ksd-icon-dup_16 font-16" type="text" v-clipboard:success="onCopy" v-clipboard:copy="jobId"></i>
      </el-tooltip>
    </div>
    <div class="duration">Total Duration: {{formatTime(totalDuration)}}</div>
    <ul class="progress-jobs" v-show="inprogressJobs.length || failedJobs.length">
      <li v-for="item in inprogressJobs" :key="item.spark_job_id">
        <div class="job-row">
          <i class="loading el-ksd-icon-loading_22 font-16 mr-5"></i>
          <span class="label">Spark Job ID: {{item.spark_job_id}} ({{item.completed_task_count}}/{{item.total_task_count}})</span>
          <el-tooltip trigger="hover" placement="top" :value="showCode">
            <div slot="content">
              <div>Running {{currentScriptCount}}/{{totalScriptCount}}</div>
              <div>
                {{currentScript}}
              </div>
            </div>
            <i class="view hasEvent el-ksd-icon-view_22 font-22" @mouseenter="showCurrentScript"></i>
          </el-tooltip>
        </div>
        <el-progress :stroke-width="4" :percentage="getPercentage(item.completed_task_count,item.total_task_count)"></el-progress>
      </li>
      <li v-for="item in failedJobs" :key="item.spark_job_id">
        <div class="job-row">
          <i class="el-icon-error txt-danger"></i>
          <span class="label">Spark Job ID: {{item.spark_job_id}} ({{item.completed_task_count}}/{{item.total_task_count}})</span>
        </div>
        <el-progress :stroke-width="4" :percentage="getPercentage(item.completed_task_count,item.total_task_count)"></el-progress>
      </li>
    </ul>
    <div class="view-complete-btn">
      <el-button type="text" size="mini" @click="showDetails = !showDetails">
        View Completed Spark Jobs({{completeJobs.length}})
        <i :class="showDetails ? 'el-ksd-icon-arrow_up_22' : 'el-ksd-icon-arrow_down_22'"></i>
      </el-button>
    </div>
    <ul class="complete-jobs" v-show="showDetails && completeJobs.length">
      <li v-for="item in completeJobs" :key="item.spark_job_id">
        <div class="job-row">
          <span class="label">Spark Job ID: {{item.spark_job_id}} ({{item.completed_task_count}}/{{item.total_task_count}})</span>
        </div>
        <div class="value">{{formatTime(item.duration)}}</div>
      </li>
    </ul>
  </div>
</template>
<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { timeToStr } from '@/util'
import { mapActions } from 'vuex'

@Component({
  props: ['result', 'jobId'],
  methods: {
    ...mapActions('CodeModal', {
      callCodeModal: 'CALL_MODAL'
    }),
    ...mapActions({
      getCurrentScript: 'GET_CURRENT_SCRIPT'
    })
  }
})

export default class ExcuteDetail extends Vue {
  showDetails = false
  currentScript = ''
  showCode = false
  totalScriptCount = 0
  currentScriptCount = 0

  completeJobs = []
  inprogressJobs = []
  totalDuration = '0'
  failedJobs = []

  @Watch('result')
  onResultChange (newVal) {
    this.getExcuteDetails(newVal)
  }

  mounted () {
    this.getExcuteDetails(this.result)
  }

  getExcuteDetails (data) {
    this.completeJobs = data?.completed_jobs ?? []
    this.inprogressJobs = data?.in_progress_jobs ?? []
    this.totalDuration = data?.duration ?? '0'
    this.failedJobs = data?.failed_jobs ?? []
  }

  formatTime (time) {
    const { day, hour, minutes, seconds, ms } = timeToStr(time)
    const { getUnit } = this
    return getUnit(day, 'd') + getUnit(hour, 'h') + getUnit(minutes, 'm') + getUnit(seconds, 's') + getUnit(ms, 'ms')
  }
  getUnit (count, unit) {
    return count > 0 ? count + unit : ''
  }
  getPercentage (completeCount, total) {
    return Number((completeCount / total * 100).toFixed(0))
  }

  showCurrentScript () {
    this.showCode = true
    this.getScript()
  }

  async getScript () {
    try {
      const res = await this.getCurrentScript(this.jobId)
      const { content, current_job_index, total_job_count } = res.data
      this.currentScript = content
      this.currentScriptCount = current_job_index
      this.totalScriptCount = total_job_count
    } catch (e) {
      console.log(e)
    }
  }

  onCopy () {
    this.$message.success('Successfully Copied')
  }
}
</script>
<style lang="scss">
@import '../../../../assets/css/config.scss';
.excute-detail {
  width: 340px;
  .duration {
    color: $--color-text-secondary;
    line-height: 22px;
    padding-left: 8px;
    margin-bottom: 15px;
  }
  .progress-jobs {
    width: 240px;
    padding-left: 8px;
    > li {
      margin-top: 4px;
      .job-row {
        line-height: 22px;
        margin-bottom: 7px;
        display: flex;
        align-items: center;
        .label {
          font-weight: 500;
        }
        .loading {
          color: $--color-primary;
          margin-right: 7px;
        }
        .view {
          margin-left: 15px;
        }
      }
    }
  }
  .view-complete-btn {
    margin-top: 16px;
  }
  .complete-jobs {
    margin-top: 10px;
    padding-left: 8px;
    background: $--background-color-secondary;
    border-radius: 6px;
    padding: 8px;
    > li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      line-height: 22px;
      margin-bottom: 4px;
      &:last-child {
        margin-bottom: 0px;
      }
    }
  }
}
</style>
