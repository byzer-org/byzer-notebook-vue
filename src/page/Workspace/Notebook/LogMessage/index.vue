<!--

-->

<template>
  <div class="log-message">
    <ul class="log-message-list" v-if="logList.length">
      <li v-for="(item, index) in logList" :key="index">
        {{item}}
      </li>
    </ul>
    <div class="log-message-nodata" v-else>No logs available</div>
  </div>
</template>
<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapActions } from 'vuex'

@Component({
  props: ['result', 'jobId', 'status'],
  methods: {
    ...mapActions({
      getJobLogs: 'GET_JOB_LOGS'
    })
  }
})

export default class ExcuteDetail extends Vue {
  logList = []
  timer = null

  @Watch('status')
  onResultChange (newVal, oldVal) {
    if (oldVal === 'RUNNING') {
      this.getLogs()
    } else {
      window.clearTimeout(this.timer)
    }
  }
  @Watch('jobId')
  onJobIdChange (newVal) {
    this.getLogs()
  }

  mounted () {
    this.getLogs()
  }
  beforeDestroy () {
    window.clearTimeout(this.timer)
  }

  pollingData () {
    window.clearTimeout(this.timer)
    if (this._isDestroyed) {
      return false
    }
    this.timer = setTimeout(() => {
      this.getLogs()
    }, 3000)
  }

  async getLogs () {
    try {
      const res = await this.getJobLogs(this.jobId)
      if (this._isDestroyed) {
        return false
      }
      this.logList = res.data?.logs ?? []
      if (this.status === 'RUNNING') {
        this.pollingData()
      } else {
        window.clearTimeout(this.timer)
      }
    } catch (e) {
      if (this._isDestroyed) {
        return false
      }
      console.log(e)
    }
  }
}
</script>
<style lang="scss">
@import '../../../../assets/css/config.scss';
.log-message {
  &-list {
    padding: 10px;
    li {
      line-height: 22px;
      color: $--color-text-secondary;
    }
  }
  &-nodata {
    line-height: 40px;
    text-align: center;
    color: $--color-text-placeholder;
  }
}
</style>