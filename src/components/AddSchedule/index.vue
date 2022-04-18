<template>
  <el-dialog
    width="600px"
    append-to-body
    :title="$t('schedules.addSchedule')"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible="isShow"
    @close="isShow && closeModal()"
  >
    <div class="schedule-form-wrap">
      <el-form :model="form" :rules="rules" ref="$form" label-position="top">
        <el-form-item prop="task_name" :label="$t(`schedules.taskName`)">
          <el-input
            :placeholder="$t('pleaseInput')"
            v-model="form.task_name"
            @change="(value) => handleInput('name', value)"
          />
        </el-form-item>
        <el-form-item prop="task_desc" :label="$t(`schedules.taskDesc`)">
          <el-input
            v-model="form.task_desc"
            :maxlength="50"
            :placeholder="$t('pleaseInput')"
            @change="(value) => handleInput('task_desc', value)"
          />
        </el-form-item>
        <div class="schedule-form">
          <div class="schedule-form-label">
            <span class="txt-danger">*&nbsp;</span>
            <span class="label">{{ $t('schedules.addSchedule') }}</span>
          </div>
          <div class="schedule-form-content">
            <el-form-item class="type-select">
              <el-radio-group v-model="scheduleType" @change="handleScheduleChange">
                <el-radio label="new">
                  {{ $t('schedules.createSchedule') }}
                </el-radio>
                <el-radio label="old">
                  {{ $t('schedules.addToExistSchedule') }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <ScheduleForm
              ref="scheduleForm"
              :scheduleType="scheduleType"
              :scheduleForm="scheduleForm"
              @changeScheduleValue="changeScheduleValue"
              @onTaskListChange="handleTaskListChange"
              @clearValidate="handleClearValidate"
            />
          </div>
        </div>
      </el-form>
    </div>
    <div slot="footer">
      <el-button @click="closeModal" size="medium">
        {{ $t('cancel') }}
      </el-button>
      <el-button
        type="primary"
        :loading="isSubmiting"
        size="medium"
        @click="submitForm"
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
import { notebookNameReg } from '@/config'
import ScheduleForm from './ScheduleForm.vue'
import moment from 'moment'

vuex.registerModule(['modals', 'AddScheduleModal'], store)

@Component({
  name: 'addschedule',
  components: {
    ScheduleForm
  },
  computed: {
    ...mapState({
      lang: state => state.global.lang
    }),
    ...mapState('AddScheduleModal', {
      isShow: state => state.isShow,
      form: state => state.form,
      callback: state => state.callback,
      notebookInfo: state => state.notebookInfo
    })
  },
  methods: {
    ...mapMutations('AddScheduleModal', {
      hideModal: actionsTypes.HIDE_MODAL,
      setModalForm: actionsTypes.SET_MODAL_FORM,
      resetModal: actionsTypes.RESET_MODAL_FORM
    }),
    ...mapActions({
      setSchedule: actionsTypes.SET_SCHEDULE,
      updateSchedule: actionsTypes.UPDATE_SCHEDULE,
      toggleSchedule: actionsTypes.TOGGLE_SCHEDULE
    }),
    ...mapActions('CheckSubmitModal', {
      callCheckSubmitModal: actionsTypes.CALL_MODAL
    })
  }
})
export default class Addschedule extends Vue {
  isSubmiting = false
  scheduleType = 'new'
  scheduleList = []
  previousTaskList = []

  scheduleForm = {
    schedule_name: '',
    schedule_desc: '',
    previous_task: '',
    date: '',
    cron: ''
  }

  get rules () {
    return {
      task_name: [
        { required: true, validator: this.validateName, trigger: 'blur' }
      ],
      task_desc: [
        { required: true, validator: this.validateDesc, trigger: 'blur' }
      ]
    }
  }

  @Watch('isShow')
  onDialogShow (newVal, oldVal) {
    // 关闭弹窗时，重置弹窗信息
    if (!newVal && oldVal) {
      setTimeout(() => {
        this.resetModal()
        this.clearValidate()
      }, 500)
    }
    if (newVal) {
      this.$nextTick(() => {
        this.scheduleType = 'new'
        this.handleClearValidate()
        this.$refs['scheduleForm'].querySchedules()
      })
    }
  }

  handleScheduleChange () {
    this.clearValidate()
  }

  changeScheduleValue (key, value) {
    this.scheduleForm[key] = value
  }

  async validateName (rule, value, callback) {
    if (!value || value.trim() === '') {
      return callback(new Error(this.$t('schedules.taskNameRequired')))
    } else if (!notebookNameReg.test(value)) {
      return callback(new Error(this.$t('workspace.nameFormatValidTip')))
    }
    return callback()
  }

  async validateDesc (rule, value, callback) {
    if (!value || value.trim() === '') {
      return callback(new Error(this.$t('schedules.taskDescRequired')))
    }
    return callback()
  }

  // 关闭弹窗
  closeModal () {
    this.hideModal()
  }

  handleInput (key, value) {
    this.setModalForm({ [key]: value })
  }

  handleClearValidate () {
    this.$refs.$form.clearValidate()
    this.$refs.scheduleForm.$refs.$form.clearValidate()
  }

  clearValidate () {
    this.scheduleForm = {
      schedule_name: '',
      schedule_desc: '',
      previous_task: '',
      date: [],
      cron: ''
    }
    this.$refs.scheduleForm.executionTimeResult = ''
    this.$nextTick(() => {
      this.handleClearValidate()
    })
  }

  checkForm () {
    // 需要校验当前表单和 schechuleForm
    return Promise.all([
      this.$refs.$form.validate(),
      this.$refs.scheduleForm.checkForm()
    ])
  }

  async submitForm () {
    try {
      const checked = await this.checkForm()
      if (!checked) {
        this.isSubmiting = false
        return
      }
      const selectedSchedule = this.scheduleList.find(
        s => s.name === this.scheduleForm.schedule_name
      )
      if (this.scheduleType === 'new') {
        await this.createSchedule()
      } else if (
        this.scheduleType === 'old' &&
        selectedSchedule?.release_state === 'ONLINE'
      ) {
        const { submit, online } = await this.callCheckSubmitModal()
        if (submit) {
          await this.joinSchedule()
        }
        if (online) {
          const id = selectedSchedule.id
          await this.toggleSchedule({
            id,
            release_state: 'online'
          })
        }
      } else {
        await this.joinSchedule()
      }
    } catch (err) {
      console.log(err)
    } finally {
      this.callback({ finished: true })
    }
  }

  async createSchedule () {
    try {
      this.isSubmiting = true
      const params = {
        entity_type: this.notebookInfo.type,
        entity_id: this.notebookInfo.id,
        name: this.scheduleForm.schedule_name,
        schedule: {
          start_time: moment(new Date(this.scheduleForm.date[0])).format('YYYY-MM-DD') + ' 00:00:00',
          end_time: moment(new Date(this.scheduleForm.date[1])).format('YYYY-MM-DD') + ' 23:59:59',
          crontab: this.scheduleForm.cron
        },
        description: this.scheduleForm.schedule_desc,
        task_name: this.form.task_name,
        task_desc: this.form.task_desc
      }
      await this.setSchedule(params)
      this.showMessage()
      this.hideModal()
    } catch (e) {
      console.log(e)
    } finally {
      this.isSubmiting = false
    }
  }

  async joinSchedule () {
    try {
      this.isSubmiting = true
      const params = {
        name: this.scheduleForm.schedule_name,
        modification: {
          entity_type: this.notebookInfo.type,
          entity_id: this.notebookInfo.id,
          task_name: this.form.task_name,
          task_desc: this.form.task_desc,
          action: 'update'
        }
      }

      const attach_to = (this.previousTaskList || []).filter(
        item => item.name === this.scheduleForm.previous_task
      )
      attach_to.length > 0 ? params['modification']['attach_to'] = attach_to : null

      const scheduleId = this.scheduleList.find(
        item => item.name === this.scheduleForm.schedule_name
      )?.id
      await this.updateSchedule({ id: scheduleId, params })
      this.showMessage()
      this.hideModal()
    } catch (e) {
      console.log(e)
    } finally {
      this.isSubmiting = false
    }
  }

  handleTaskListChange ({ previousTaskList, scheduleList }) {
    this.previousTaskList = previousTaskList
    this.scheduleList = scheduleList
  }

  showMessage () {
    const h = this.$createElement
    this.$message.success({
      message: h('div', null, [
        h('span', null, this.$t('schedules.addScheduleSuccess')),
        h(
          'a',
          {
            on: {
              click: this.handleClickToView
            },
            style: {
              cursor: 'pointer'
            }
          },
          this.$t('schedules.clickToView')
        )
      ])
    })
  }
  handleClickToView () {
    this.$router.push({ name: 'schedules' })
  }
}
</script>
<style lang="scss">
.schedule-form-wrap {
  max-height: 60vh;
  overflow-y: auto;
  .schedule-form {
    &-label {
      line-height: 34px;
      font-weight: bold !important;
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
}
</style>
