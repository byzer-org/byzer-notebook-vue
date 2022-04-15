<template>
  <el-dialog
    width="600px"
    append-to-body
    :title="
      $t('schedules.editTaskConfirmTitle', { action: $t(formatParams.type) })
    "
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible="isShow"
    @close="isShow && closeModal()"
  >
    <div class="alert-wrap">
      <div>
        {{
          $t('schedules.editTaskConfirmInfo', {
            action: this.$t(formatParams.type).toLowerCase()
          })
        }}
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
          v-if="['update', 'save'].includes(formatParams.type)"
          type="primary"
          size="medium"
          :loading="isSubmiting"
          @click="update"
        >
          {{ $t(formatParams.type) }}
        </el-button>
        <el-button
          v-if="formatParams.type === 'remove'"
          type="primary"
          size="medium"
          :loading="isSubmiting"
          @click="remove"
        >
          {{ $t('remove') }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapState, mapMutations, mapActions } from 'vuex'
import vuex, { actionsTypes } from '../../store/index'
import store from './store'
vuex.registerModule(['modals', 'CheckActionModal'], store)

@Component({
  name: 'CheckAction',
  computed: {
    ...mapState('CheckActionModal', {
      isShow: state => state.isShow,
      formatParams: state => state.formatParams,
      callback: state => state.callback
    })
  },
  methods: {
    ...mapMutations('CheckActionModal', {
      hideModal: actionsTypes.HIDE_MODAL
    }),
    ...mapActions({
      updateSchedule: actionsTypes.UPDATE_SCHEDULE,
      toggleSchedule: actionsTypes.TOGGLE_SCHEDULE
    })
  }
})
export default class CheckAction extends Vue {
  isSubmiting = false
  checked = false

  @Watch('isShow')
  isShowChanged (newVal) {
    if (newVal) {
      this.checked = false
    }
  }

  // 关闭弹窗
  closeModal () {
    this.hideModal()
  }

  async checkOnline () {
    await this.toggleSchedule({
      id: this.formatParams.id,
      release_state: 'online'
    })
  }

  async update () {
    this.isSubmiting = true
    const { id, params } = this.formatParams
    try {
      const res = await this.updateSchedule({ id, params })
      if (res?.msg === 'success') {
        this.$message.success(
          this.$t('schedules.updateSuccessMsg')
        )
      }
      if (this.checked) {
        await this.checkOnline()
      }
      this.callback({ type: 'update' })
    } catch (err) {
      console.log(err)
    } finally {
      this.isSubmiting = false
      this.closeModal()
    }
  }

  async remove () {
    this.isSubmiting = true
    const { id, params } = this.formatParams
    try {
      const res = await this.updateSchedule({ id, params })
      if (res?.msg === 'success') {
        this.$message.success(
          this.$t('schedules.actionSuccessMsg', { action: this.$t(this.formatParams.type) })
        )
      }
      if (this.checked) {
        await this.checkOnline()
      }
      this.callback({ type: 'remove' })
    } catch (err) {
      console.log(err)
    } finally {
      this.isSubmiting = false
      this.closeModal()
    }
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
