<template>
  <el-dialog
    width="600px"
    append-to-body
    :title="$t('schedules.failureDetail')"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible="isShow"
    @close="isShow && closeModal()"
  >
    <div class="log-wrap">
      <div class="node-item node-item-flex">
        <div class="label">{{ $t('schedules.failureNode') }}</div>
        <div class="value" v-if="failureDetail && failureDetail.notebook">{{ failureDetail.notebook.name || '' }}</div>
      </div>
      <div class="node-item">
        <div class="label">{{ $t('schedules.failureLog') }}</div>
        <div class="log" style="white-space: pre-wrap" v-html="getFailureDetail()">
        </div>
      </div>
    </div>
    <div slot="footer">
      <el-button type="primary" size="medium" @click="closeModal">
        {{ $t('ok') }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapState, mapMutations } from 'vuex'

import vuex, { actionsTypes } from '../../store/index'
import store from './store'
vuex.registerModule(['modals', 'FailureDetailModal'], store)

@Component({
  name: 'failureDetail',
  computed: {
    ...mapState('FailureDetailModal', {
      isShow: state => state.isShow,
      failureDetail: state => state.failureDetail
    })
  },
  methods: {
    ...mapMutations('FailureDetailModal', {
      hideModal: actionsTypes.HIDE_MODAL,
      resetModal: actionsTypes.RESET_MODAL
    })
  }
})
export default class SetSchedule extends Vue {
  isSubmiting = false

  @Watch('isShow')
  async onDialogShow (newVal, oldVal) {
    // 关闭弹窗时，重置弹窗信息
    if (!newVal && oldVal) {
      setTimeout(() => {
        this.resetModal()
      }, 500)
    }
  }

  getFailureDetail () {
    return this.failureDetail.log?.replace(/\\n/g, '<br />')
  }

  // 关闭弹窗
  closeModal () {
    this.hideModal()
  }
}
</script>
<style lang="scss">

.log-wrap {
  .node-item-flex {
    display: flex;
  }
  .node-item {
    margin: 8px 0;
    .label {
      margin-bottom: 8px;
      white-space: pre;
      font-size: 14px;
      font-weight: bold;
      color: $--color-text-primary;
    }
    .log {
      padding: 10px;
      max-height: 50vh;
      line-height: 16px;
      overflow-y: auto;
      white-space: pre-wrap;
      border: 1px solid $--border-color-base;
      border-radius: 4px;
    }
  }
}
</style>
