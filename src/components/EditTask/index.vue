<template>
  <el-dialog
    width="600px"
    append-to-body
    :title="$t('schedules.editTaskTitle')"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible="isShow"
    @close="isShow && closeModal()"
  >
    <div class="schedule-form-wrap">
      <el-form
        ref="$form"
        label-position="top"
        :model="form"
        :rules="rules"
        :validate-on-rule-change="false"
      >
        <el-form-item prop="taskName" :label="$t(`schedules.taskName`)">
          <el-input
            :placeholder="$t('pleaseInput')"
            v-model="form.taskName"
            @change="(value) => handleInput('taskName', value)"
          />
        </el-form-item>
        <el-form-item prop="taskDescription" :label="$t(`schedules.taskDesc`)">
          <el-input
            v-model="form.taskDescription"
            :maxlength="50"
            :placeholder="$t('pleaseInput')"
            @change="(value) => handleInput('taskDescription', value)"
          />
        </el-form-item>
        <div class="schedule-form">
          <div class="schedule-form-label">
            <span class="txt-danger">*</span>
            <span class="label">{{ $t('schedules.schedule') }}</span>
          </div>
          <div class="schedule-form-content">
            <el-form-item
              prop="scheduleName"
              :label="$t(`schedules.scheduleName`)"
            >
              <el-input
                :placeholder="$t('pleaseInput')"
                v-model="form.scheduleName"
                disabled
              />
            </el-form-item>
            <el-form-item prop="previousTask">
              <span slot="label">
                {{ $t(`schedules.previousTask`) }}
                <el-tooltip
                  placement="top"
                  :content="$t('schedules.previousInfo_edit')"
                >
                  <i class="el-ksd-icon-more_info_16 hasEvent"></i>
                </el-tooltip>
              </span>
              <el-select
                style="width: 100%"
                v-model="form.previousTask"
                filterable
                :loading="loadingScheduleList"
                :placeholder="$t('pleaseSelect')"
                :clearable="true"
                @change="(value) => handleInput('previousTask', value)"
              >
                <el-option
                  v-for="item in taskList"
                  :key="item.entity_id"
                  :label="item.name"
                  :value="item.name"
                ></el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>
      </el-form>
    </div>
    <div slot="footer">
      <el-button
        type="text"
        size="medium"
        class="schedule-form-footer-remove-btn"
        :loading="isRemoving"
        @click="checkAction('remove')"
      >
        {{ $t('schedules.remove_task') }}
      </el-button>
      <el-button size="medium" @click="closeModal">
        {{ $t('close') }}
      </el-button>
      <el-button
        type="primary"
        size="medium"
        :loading="isSubmiting"
        @click="checkAction('update')"
      >
        {{ $t('save') }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapState, mapMutations, mapActions } from 'vuex'
import { notebookNameReg } from '@/config'
import { cloneDeep } from 'lodash'
import vuex, { actionsTypes } from '../../store/index'
import store from './store'
vuex.registerModule(['modals', 'EditTaskModal'], store)

@Component({
  name: 'EditTask',
  computed: {
    ...mapState('EditTaskModal', {
      isShow: state => state.isShow,
      taskInfo: state => state.taskInfo,
      form: state => state.form,
      callback: state => state.callback
    }),
    ...mapState({
      is_scheduler_enabled: state => state.global.is_scheduler_enabled
    })
  },
  methods: {
    ...mapMutations('EditTaskModal', {
      hideModal: actionsTypes.HIDE_MODAL
    }),
    ...mapActions('CheckActionModal', {
      callCheckActionModal: 'CALL_MODAL'
    }),
    ...mapActions({
      updateSchedule: actionsTypes.UPDATE_SCHEDULE,
      getSchedulesList: actionsTypes.GET_SCHEDULE_LIST,
      deleteSchedule: actionsTypes.DELETE_SCHEDULE
    })
  }
})
export default class EditTask extends Vue {
  isRemoving = false
  isSubmiting = false

  loadingScheduleList = false
  taskList = []

  get rules () {
    return {
      taskName: [
        { required: true, validator: this.validateName, trigger: 'blur' }
      ],
      taskDescription: [
        { required: true, validator: this.validateDesc, trigger: 'blur' }
      ]
    }
  }

  @Watch('isShow')
  onFormChanged (newVal) {
    if (newVal) {
      this.queryTasks()
      this.$nextTick(() => {
        this.$refs.$form.clearValidate()
      })
    }
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

  handleInput (name, value) {
    this.form[name] = value
  }

  async queryTasks () {
    try {
      this.loadingScheduleList = true
      const res = await this.getSchedulesList()
      this.taskList = (res.data || []).find(
        item => item.name === this.form.scheduleName
      )?.entities.filter(e => e.entity_id !== Number(this.taskInfo.currentNotebook.id))
    } catch (err) {
      this.taskList = []
    } finally {
      this.loadingScheduleList = false
    }

  }

  // 关闭弹窗
  closeModal () {
    this.hideModal()
  }

  async checkAction (actionType) {
    let checked = false
    try {
      checked = await this.$refs.$form.validate()
    } catch (err) {
      checked = false
    }
    if (!checked && actionType === 'update') {
      return
    }
    try {
      if (actionType === 'remove' && this.taskInfo?.scheduleInfo?.entities.length === 1) {
        // 只有一个节点时点击「Rmove」按钮直接删除调度
        const res = await this.deleteSchedule(this.taskInfo?.scheduleInfo.id)
        if (res?.msg === 'success') {
          this.showMessage('remove')
        }
        this.closeModal()
        this.callback({ actionType })
      } else if (this.taskInfo?.scheduleInfo?.release_state === 'ONLINE') {
        // 如果调度时上线状态，提示是否需要在「Update」或者「Remove」之后保持上线状态
        // save / remove
        const checkType = actionType === 'update' ? 'save' : actionType
        const { type } = await this.callCheckActionModal({
          type: checkType,
          ...cloneDeep(this.formatParams(actionType))
        })
        this.closeModal()
        this.callback({ type })
      } else {
        this[actionType]()
      }
    } catch (err) {
      console.log(err)
    }
  }

  showMessage (actionType) {
    this.$message.success(
      this.$t('schedules.actionSuccessMsg', { action: this.$t(actionType) })
    )
  }

  async update () {
    this.isSubmiting = true
    try {
      const res = await this.updateSchedule(this.formatParams('update'))
      if (res?.msg === 'success') {
        this.showMessage('update')
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
    this.isRemoving = true
    try {
      const res = await this.updateSchedule(this.formatParams('remove'))
      if (res?.msg === 'success') {
        this.showMessage('remove')
      }
      this.callback({ type: 'remove' })
    } catch (err) {
      console.log(err)
    } finally {
      this.isRemoving = false
      this.closeModal()
    }
  }

  /**
   * @param type update/remove 更新/删除
   */
  formatParams (type) {
    const {
      scheduleInfo: { entities, description },
      currentNotebook: { id }
    } = this.taskInfo
    const entity = entities.find(e => e.entity_id === Number(id))

    const params = {
      name: this.form.scheduleName,
      description: description,
      modification: {
        entity_type: entity.entity_type,
        entity_id: entity.entity_id,
        task_name: this.form.taskName,
        task_desc: this.form.taskDescription,
        action: type
      }
    }

    if (type === 'update') {
      const attach_to = (this.taskList || []).filter(
        item => item.name === this.form.previousTask
      )
      attach_to.length > 0 ? params['modification']['attach_to'] = attach_to : null
    }
    return { id: this.taskInfo.scheduleInfo.id, params }
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
.schedule-form-footer-remove-btn {
  color: $--color-danger !important;
}
</style>
