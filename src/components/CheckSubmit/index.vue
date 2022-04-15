<template>
  <el-dialog
    width="600px"
    append-to-body
    :title="$t('schedules.confirmTitle')"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible="isShow"
    @close="isShow && closeModal()"
  >
    <div class="alert-wrap">
      <div>
        {{ $t('schedules.confirmInfo') }}
      </div>
    </div>
    <div slot="footer" class="alert-foot-wrap">
      <el-checkbox v-model="checked">
        {{ $t('schedules.onlineSchedule') }}
      </el-checkbox>
      <div>
        <el-button size="medium" @click="closeModal">
          {{ $t('cancel') }}
        </el-button>
        <el-button
          type="primary"
          size="medium"
          :loading="isSubmiting"
          @click="submit"
        >
          {{ $t('schedules.confirmTitle') }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { mapState, mapMutations } from 'vuex'
import vuex, { actionsTypes } from '../../store/index'
import store from './store'
vuex.registerModule(['modals', 'CheckSubmitModal'], store)

@Component({
  name: 'CheckSubmit',
  computed: {
    ...mapState('CheckSubmitModal', {
      isShow: state => state.isShow,
      callback: state => state.callback
    })
  },
  methods: {
    ...mapMutations('CheckSubmitModal', {
      hideModal: actionsTypes.HIDE_MODAL
    })
  }
})
export default class CheckSubmit extends Vue {
  isSubmiting = false
  checked = false

  // 关闭弹窗
  closeModal () {
    this.hideModal()
  }

  submit () {
    this.callback({ submit: true, online: this.checked })
    this.closeModal()
  }
}
</script>
<style lang="scss">

.alert-foot-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
