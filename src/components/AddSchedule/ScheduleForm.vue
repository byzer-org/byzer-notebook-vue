<template>
  <el-form
    :model="scheduleForm"
    :rules="rules"
    :validate-on-rule-change="false"
    ref="$form"
    label-position="top"
  >
    <el-form-item
      v-if="scheduleType === 'new'"
      prop="schedule_name"
      :label="$t(`schedules.scheduleName`)"
    >
      <el-input
        v-model="scheduleForm.schedule_name"
        :maxlength="50"
        :placeholder="$t('pleaseInput')"
        @change="(value) => handleInput('schedule_name', value)"
      />
    </el-form-item>
    <el-form-item
      v-else
      prop="schedule_name"
      :label="$t(`schedules.scheduleName`)"
    >
      <el-select
        style="width: 100%"
        v-model="scheduleForm.schedule_name"
        filterable
        :loading="loadingScheduleList"
        :placeholder="$t('pleaseSelect')"
        @change="handleScheduleNameChange"
      >
        <el-option
          v-for="(item, index) in scheduleList"
          :key="index"
          :label="item.name"
          :value="item.name"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item
      v-if="scheduleType === 'old' && scheduleForm.schedule_name"
      prop="previous_task"
    >
      <span slot="label">
        {{ $t(`schedules.previousTask`) }}
        <el-tooltip effect="dark" placement="top" :content="$t('schedules.previousInfo')">
          <i class="el-ksd-icon-more_info_16 hasEvent"></i>
        </el-tooltip>
      </span>
      <el-select
        style="width: 100%"
        v-model="scheduleForm.previous_task"
        filterable
        :loading="loadingScheduleList"
        :placeholder="$t('pleaseSelect')"
        :clearable="true"
        @change="(value) => handleInput('previous_task', value)"
      >
        <el-option
          v-for="item in taskList"
          :key="item.entity_id"
          :label="item.name"
          :value="item.name"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item prop="date">
      <span
        slot="label"
        :class="{ 'schedule-form-item-disabled': scheduleType === 'old' }"
      >{{ $t(`schedules.dateSelect`) }}
      </span>
      <el-date-picker
        style="width: 100%"
        v-model="scheduleForm.date"
        type="daterange"
        range-separator="-"
        :unlink-panels="true"
        :disabled="scheduleType === 'old'"
        :start-placeholder="$t('schedules.startDate')"
        :end-placeholder="$t('schedules.endDate')"
        value-format="yyyy-MM-dd"
        @change="handleDateRangeChange"
      ></el-date-picker>
    </el-form-item>
    <el-form-item prop="cron">
      <span
        slot="label"
        :class="{ 'schedule-form-item-disabled': scheduleType === 'old' }"
      >{{ $t(`schedules.timing`) }}
      </span>
      <div class="schedule-form-crontab-wrap">
        <el-popover v-model="showCron" v-if="scheduleType === 'new'">
          <Crontab
            @hide="showCron = false"
            @fill="crontabFill"
            :expression="scheduleForm.cron"
          ></Crontab>
          <el-input
            slot="reference"
            style="width: 100%"
            v-model="scheduleForm.cron"
            :placeholder="$t('schedules.cronPlaceholder')"
          ></el-input>
        </el-popover>
        <el-input
          v-if="scheduleType === 'old'"
          style="width: 100%"
          v-model="scheduleForm.cron"
          disabled
          :placeholder="$t('schedules.cronPlaceholder')"
        ></el-input>
        <el-button
          size="mini"
          :disabled="!scheduleForm.cron || scheduleType === 'old'"
          @click="expressionChange"
        >
          {{ $t('schedules.executionTime') }}
        </el-button>
      </div>
    </el-form-item>
    <el-form-item>
      <span
        slot="label"
        :class="{ 'schedule-form-item-disabled': scheduleType === 'old' }"
      >{{ $t(`schedules.futureExcuteTime`) }}
      </span>
      <el-input
        v-model="executionTimeResult"
        type="textarea"
        :resize="'none'"
        readonly
        :autosize="{ minRows: 5, maxRows: 5 }"
        :placeholder="$t('schedules.toBeCalculated')"
      ></el-input>
    </el-form-item>
    <el-form-item prop="schedule_desc">
      <span
        slot="label"
        :class="{ 'schedule-form-item-disabled': scheduleType !== 'new' }"
      >{{ $t(`schedules.scheduleDesc`) }}
      </span>
      <el-input
        v-model="scheduleForm.schedule_desc"
        :maxlength="50"
        :placeholder="$t('pleaseInput')"
        :disabled="scheduleType !== 'new'"
        @change="(value) => handleInput('schedule_desc', value)"
      />
    </el-form-item>
  </el-form>
</template>

<script>
import Vue from 'vue'
import Crontab from '@/components/Crontab'
import { Component, Watch } from 'vue-property-decorator'
import { mapState, mapActions } from 'vuex'
import { notebookNameReg } from '@/config'
import { isValidCronExpression } from 'cron-expression-validator'
import ExecuteTime from './ExecuteTime.vue'

@Component({
  name: 'scheduleForm',
  props: ['scheduleType', 'scheduleForm'],
  components: {
    Crontab
  },
  mixins: [ExecuteTime],
  computed: {
    ...mapState({
      lang: state => state.global.lang,
      is_scheduler_enabled: state => state.global.is_scheduler_enabled
    })
  },
  methods: {
    ...mapActions({
      getSchedulesList: 'GET_SCHEDULE_LIST'
    })
  }
})
export default class Addschedule extends Vue {
  scheduleList = []
  taskList = []
  loadingScheduleList = false
  input = ''
  expression = ''
  showCron = false
  executionTimeResult = ''

  mounted () {
    if (this.scheduleType === 'old') {
      this.querySchedules()
    }
    this.clearValidate()
  }

  @Watch('scheduleType')
  onScheduleTypeChange (newVal) {
    if (newVal === 'old') {
      this.querySchedules()
    }
    this.clearValidate()
  }

  @Watch('scheduleForm.cron', { immediate: true })
  onCronChanged (newVal) {
    this.cronValidator({}, newVal, () => {})
  }

  get rules () {
    return {
      schedule_name: [
        { required: true, validator: this.validateName, trigger: 'change' }
      ],
      date: [
        {
          required: this.scheduleType === 'new',
          message: this.$t('schedules.dateRequired'),
          trigger: 'change'
        }
      ],
      cron: [
        {
          type: 'string',
          required: this.scheduleType === 'new',
          validator: this.cronValidator,
          trigger: 'change'
        }
      ]
    }
  }

  crontabFill (value) {
    this.handleInput('cron', value)
  }

  clearValidate () {
    this.$emit('clearValidate')
  }

  handleScheduleNameChange (value) {
    this.scheduleForm.previous_task = ''
    this.handleInput('schedule_name', value)
    const schedule = this.scheduleList.find(
      item => item.name === value
    )
    this.taskList = schedule?.entities
    this.handleInput('date', [schedule?.schedule.start_time, schedule?.schedule.end_time])
    this.handleInput('cron', schedule?.schedule.crontab)
    this.expressionChange()
    this.handleInput('schedule_desc', schedule?.description)
    this.$emit('onTaskListChange', {
      previousTaskList: this.taskList,
      scheduleList: this.scheduleList
    })
  }

  cronValidator (_, value, callback) {
    if (this.scheduleType === 'new') {
      if (!value || value.trim() === '') {
        return callback(new Error(this.$t('schedules.cronRequired')))
      } else if (!isValidCronExpression(value)) {
        return callback(new Error(this.$t('schedules.cronIsWrong')))
      }
      this.expressionChange()
    }
    return callback()
  }

  handleDateRangeChange (value) {
    this.cronValidator({}, this.scheduleForm.cron, () => {})
    this.handleInput('date', value)
  }

  async querySchedules () {
    if (!this.is_scheduler_enabled) {
      return
    }
    try {
      this.loadingScheduleList = true
      const res = await this.getSchedulesList()
      this.scheduleList = res.data
    } finally {
      this.loadingScheduleList = false
    }
  }

  // 校验参数名称
  async validateName (rule, value, callback) {
    if (!value || value.trim() === '') {
      return callback(new Error(this.$t('schedules.nameHolder')))
    } else if (!notebookNameReg.test(value)) {
      return callback(new Error(this.$t('workspace.nameFormatValidTip')))
    }
    return callback()
  }

  handleInput (key, value) {
    this.$emit('changeScheduleValue', key, value)
  }

  checkForm () {
    return this.$refs.$form.validate()
  }
}
</script>
<style lang="scss">

.schedule-form-crontab-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  & > span {
    flex: 1;
  }
  .el-button {
    margin-left: 20px;
  }
}
.schedule-form-item-disabled {
  color: $--color-text-placeholder;
}
</style>
