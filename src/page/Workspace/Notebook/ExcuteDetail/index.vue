
<template>
  <div class="excute-detail font-12" :style="{'max-height': innerMaxHeight}">
    <div class="duration">{{$t('notebook.jobId')}}: {{jobId}}
      <el-tooltip placement="top" :content="$t('copy')">
        <i class="hasEvent copy-btn el-ksd-icon-dup_16 font-16" type="text" v-clipboard:success="onCopy" v-clipboard:copy="jobId"></i>
      </el-tooltip>
    </div>
    <div class="duration">{{$t('notebook.totalDuration')}}: {{formatTime(totalDuration)}}</div>
    <ul v-if="result && result.status === '0'" class="progress-jobs">
      <li>
        <i v-if="result && result.failed_jobs" class="el-icon-error txt-danger failed-icon"></i>
        <div class="progress-wrap">
          <el-progress :stroke-width="4" :percentage="percentage"></el-progress>
        </div>
        <span class="label">{{ percentage + '%' }}</span>
        <span class="label">{{ progresFormat }}</span>
        <el-tooltip ref="codeRef" trigger="hover" placement="top" :value="showCode">
          <div slot="content">
            <div>Running {{ currentScriptCount }}/{{ totalScriptCount }}</div>
            <div>
              {{ currentScript }}
            </div>
          </div>
          <i class="view hasEvent el-ksd-icon-view_22 font-22" @mouseenter="showCurrentScript"></i>
        </el-tooltip>
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
  props: ['result', 'jobId', 'innerMaxHeight'],
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

  totalDuration = '0'

  get progresFormat () {
    const { completed_jobs = 0, failed_jobs = 0, in_progress_jobs = 0 } = this.result
    return `${ completed_jobs }/${ completed_jobs + failed_jobs + in_progress_jobs }`
  }

  get percentage () {
    const { completed_jobs = 0, failed_jobs = 0, in_progress_jobs = 0 } = this.result
    const result = completed_jobs / (completed_jobs + failed_jobs + in_progress_jobs)
    return result || result === 0 ? Number((result * 100).toFixed(0)) : 0
  }

  @Watch('result')
  onResultChange (newVal) {
    this.getExcuteDetails(newVal)
  }

  mounted () {
    this.getExcuteDetails(this.result)
  }

  getExcuteDetails (data) {
    this.totalDuration = data?.duration ?? '0'
  }

  formatTime (time) {
    const { day, hour, minutes, seconds, ms } = timeToStr(time)
    const { getUnit } = this
    return getUnit(day, 'd') + getUnit(hour, 'h') + getUnit(minutes, 'm') + getUnit(seconds, 's') + getUnit(ms, 'ms')
  }
  getUnit (count, unit) {
    return count > 0 ? count + unit : ''
  }

  showCurrentScript () {
    this.showCode = true
    this.getScript()
  }

  async getScript () {
    try {
      const res = await this.getCurrentScript(this.jobId)
      const { content = '', current_job_index, total_job_count } = res.data || {}
      this.currentScript = content
      this.currentScriptCount = current_job_index
      this.totalScriptCount = total_job_count
      this.$nextTick(() => {
        // 修正 tooltip 偏移
        this.$refs['codeRef'].updatePopper()
      });
    } catch (e) {
      console.log(e)
    }
  }

  onCopy () {
    this.$message.success(this.$t('copySuccess'))
  }
}
</script>
<style lang="scss">

.excute-detail {
  overflow: auto;
  .duration {
    color: $--color-text-secondary;
    line-height: 22px;
    padding-left: 8px;
    margin-bottom: 15px;
  }
  .progress-jobs {
    padding-left: 8px;
    > li {
      margin-top: 4px;
      display: inline-flex;
      align-items: center;
      .failed-icon {
        margin-right: 10px;
      }
      .progress-wrap {
        width: 240px;
        .el-progress-bar {
          padding-right: 15px;
        }
        .el-progress__text {
          display: none;
        }
      }
      .label {
        margin-right: 10px;
        font-weight: 500;
      }
      .loading {
        color: $--color-primary;
        margin-right: 7px;
      }
    }
  }
  .view-complete-btn {
    margin-top: 16px;
  }
  .complete-jobs {
    margin-top: 10px;
    padding-left: 8px;
    width: 500px;
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
