<template>
  <div class="pop-wrap">
    <el-popover v-if="userInfo" :trigger="'hover'" :placement="'bottom'">
      <div class="engine-detail">
        <div class="detail-item">
          <div class="item-label">{{ $t('menu.engine_status') }}</div>
          <div class="item-value">{{ $t('menu.state.' + getEngineStatus()) }}</div>
        </div>
        <div class="detail-item">
          <div class="item-label">{{ $t('menu.heart_beat') }}</div>
          <div class="item-value">
            <span>{{ $t('menu.step') }}</span>
            <i class="el-ksd-icon-refresh_22" @click="refreshEngineInfo"></i>
          </div>
        </div>
        <div class="detail-item">
          <div class="item-label">{{ $t('menu.usage') }}</div>
          <div class="item-value">
            <el-progress :percentage="engineUsage" :format="format" :color="customColor"></el-progress>
          </div>
        </div>
      </div>
      <section slot="reference" v-if="userInfo" class="engine-info-wrap">
        <span class="engine-status" :class="getEngineStatus()"></span>
        <span class="engine-label">{{ engineName || '' }}</span>
      </section>
    </el-popover>
  </div>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { mapActions, mapState } from 'vuex';
import { ENGINE_STATUS } from '../../config';
import { actionsTypes } from '../../store';
@Component({
  computed: {
    ...mapState({
      userInfo: state => state.user.userInfo,
      engineInfo: state => state.settings.engineInfo
    })
  },
  methods: {
    ...mapActions({
      getEngineInfo: actionsTypes.GET_ENGINE_INFO
    })
  }
})
export default class EngineInfo extends Vue {
  timer = null
  customColor = '#0875DA'
  get engineStatus () {
    return this.engineInfo?.status
  }
  get engineName () {
    return this.engineInfo?.name
  }
  get engineUsage () {
    if (this.engineInfo && this.engineInfo.usage) {
      return Math.round(this.engineInfo.usage * 100)
    } else {
      return 0
    }
  }
  @Watch('userInfo', { immediate: true })
  handlerUserInfoChanged (newVal) {
    if (newVal) {
      this.getEngineInfo()
      this.initInterval()
    } else {
      this.clear()
    }
  }
  format (percentage) {
    let label = ''
    if (this.engineStatus === 0) {
      label = this.$t('menu.percentage.unavailable')
      this.customColor = '#E03B3B'
    }
    if (percentage > 80) {
      label = this.$t('menu.percentage.crowded')
      this.customColor = '#E03B3B'
    } else {
      label = this.$t('menu.percentage.available')
      this.customColor = '#0875DA'
    }
    return label
  }
  async refreshEngineInfo () {
    this.clear()
    try {
      const res = await this.getEngineInfo('?refresh=true')
      if (res && res.code === '') {
        this.$message.success(this.$t('menu.refresh_success'))
      }
    } catch (err) {
      console.log(err)
    } finally {
      this.initInterval()
    }
  }
  getEngineStatus () {
    return ENGINE_STATUS[this.engineStatus]
  }
  initInterval () {
    this.timer = setInterval(() => {
      this.getEngineInfo()
    }, 10000)
  }
  clear () {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
  beforeDestroy () {
    this.clear()
  }
}
</script>
<style lang="scss" scoped>
.pop-wrap {
  display: flex;
  align-items: center;
  .engine-info-wrap {
    margin-right: 10px;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    .engine-status {
      margin-right: 10px;
      width: 10px;
      height: 10px;
      border-radius: 5px;
      &.available {
        background: $pattern-green-500;
      }
      &.unavailable {
        background: $pattern-grey-100;
      }
    }
    .engine-label {
      color: $--color-white;
    }
  }
}
.engine-detail {
  display: flex;
  flex-direction: column;
  .detail-item {
    display: flex;
    align-items: center;
    margin: 8px;
    .item-label {
      color: $findAndReplaceTitleColor;
      font-weight: bold;
      white-space: pre;
    }
    .item-value {
      display: inline-flex;
      align-items: center;
      width: 100%;
      min-width: 280px;
      white-space: nowrap;
      .el-progress {
        width: 100%;
      }
      i {
        margin-left: 6px;
        cursor: pointer;
      }
    }
  }
}
</style>