
<template>
  <div class="log-message" :style="{'max-height': innerMaxHeight}">
    <ul class="log-message-list" v-if="logList.length">
      <li v-for="(item, index) in logList" :key="index">
        {{item}}
      </li>
    </ul>
    <div class="log-message-nodata" v-else>{{$t('notebook.nologs')}}</div>
  </div>
</template>
<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapState, mapMutations, mapActions } from 'vuex'

@Component({
  props: ['cellId', 'currentNotebook', 'result', 'jobId', 'status', 'innerMaxHeight'],
  computed: {
    ...mapState({
      logMessageList: state => state.notebook.logMessageList
    })
  },
  methods: {
    ...mapActions({
      getJobLogs: 'GET_JOB_LOGS'
    }),
    ...mapMutations({
      addLogMessage: 'SET_LOG_MESSAGE_LIST'
    })
  }
})

export default class LogMessage extends Vue {
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
  onJobIdChange () {
    this.getLogs()
  }

  @Watch('currentNotebook', { immediate: true, deep: true })
  onCurrentNotebookChange (newVal) {
    if (newVal && newVal.active === 'true' && !this.logMessageList.includes(this.cellId)) {
      this.initLog()
    }
  }

  beforeDestroy () {
    window.clearTimeout(this.timer)
  }

  initLog () {
    this.addLogMessage(this.cellId)
    this.getLogs()
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
    }
  }
}
</script>
<style lang="scss">
@import '../../../../assets/css/variable.scss';
.log-message {
  overflow: auto;
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
