<template>
  <el-dialog
    width="600px"
    append-to-body
    :title="$t('schedules.setSchedule')"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible="isShow"
    @close="isShow && closeModal()"
  >
    <ScheduleForm
      ref="scheduleForm"
      :scheduleType="scheduleType"
      :scheduleForm="scheduleForm"
      @changeScheduleValue="changeScheduleValue"
    />
    <div slot="footer">
      <el-button @click="closeModal" size="medium">
        {{ $t('cancel') }}
      </el-button>
      <el-button
        type="primary"
        :loading="isSubmiting"
        size="medium"
        @click="handleSubmit"
      >
        {{ $t('ok') }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapState, mapMutations, mapActions } from 'vuex'

import vuex, { actionsTypes } from '../../store/index'
import store from './store'
import ScheduleForm from '../AddSchedule/ScheduleForm.vue'
import moment from 'moment'

vuex.registerModule(['modals', 'SetScheduleModal'], store)

@Component({
  name: 'addschedule',
  components: {
    ScheduleForm
  },
  computed: {
    ...mapState({
      lang: state => state.global.lang
    }),
    ...mapState('SetScheduleModal', {
      isShow: state => state.isShow,
      scheduleForm: state => state.form,
      callback: state => state.callback,
      scheduleInfo: state => state.scheduleInfo
    })
  },
  methods: {
    ...mapMutations('SetScheduleModal', {
      hideModal: actionsTypes.HIDE_MODAL,
      setModalForm: actionsTypes.SET_MODAL_FORM,
      resetModal: actionsTypes.RESET_MODAL_FORM
    }),
    ...mapActions({
      updateSchedule: 'UPDATE_SCHEDULE'
    })
  }
})
export default class SetSchedule extends Vue {
  isSubmiting = false
  scheduleType = 'new'

  @Watch('isShow')
  async onDialogShow (newVal, oldVal) {
    // 关闭弹窗时，重置弹窗信息
    if (!newVal && oldVal) {
      setTimeout(() => {
        this.resetModal()
        this.clearValidate()
        this.showScheduleForm = false
      }, 500)
    }
  }
  changeScheduleValue (key, value) {
    this.scheduleForm[key] = value
  }

  // 关闭弹窗
  closeModal () {
    this.hideModal()
  }

  clearValidate () {
    this.$refs.scheduleForm.$refs.$form.clearValidate()
  }

  async checkForm () {
    try {
      // 需要校验当前表单和 schechuleForm
      return await this.$refs.scheduleForm.checkForm()
    } catch (e) {
      console.log(e)
    }
  }

  async handleSubmit () {
    this.isSubmiting = true
    try {
      await this.checkForm()
      const id = this.scheduleInfo.id
      const params = {
        name: this.scheduleForm.schedule_name,
        description: this.scheduleForm.schedule_desc,
        schedule: {
          start_time: moment(new Date(this.scheduleForm.date[0])).format('YYYY-MM-DD') + ' 00:00:00',
          end_time: moment(new Date(this.scheduleForm.date[1])).format('YYYY-MM-DD') + ' 23:59:59',
          crontab: this.scheduleForm.cron
        }
      }
      await this.updateSchedule({ id, params })
      this.callback({ isSubmit: true })
      this.hideModal()
    } finally {
      this.isSubmiting = false
    }
  }
}
</script>
<style lang="scss">


.schedule-form {
  &-label {
    line-height: 34px;
    font-weight: 500;
    .start {
      margin-right: 5px;
    }
  }
  &-content {
    background: $--background-color-secondary;
    border: 1px solid $--border-update-schedule;
    box-sizing: border-box;
    border-radius: 6px;
    padding: 16px 24px;
    .type-select {
      margin-bottom: 22px !important;
    }
  }
}
#changeContab {
  .el-button.language {
    display: none;
  }
  .bottom {
    .value {
      display: none;
    }
  }
}
</style>
