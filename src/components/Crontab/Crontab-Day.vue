<template>
  <el-form size="small">
    <el-form-item>
      <el-radio v-model="radioValue" :label="1">
        {{ $t('crontab.day.every') }}
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="3">
        {{ $t('crontab.day.cycle')[0] }}
        <el-input-number
          v-model="cycle01"
          :min="1"
          :max="31"
          @change="radioChange"
        />
        {{ $t('crontab.day.cycle')[1] }}
        <el-input-number
          v-model="cycle02"
          :min="1"
          :max="31"
          @change="radioChange"
        />
        {{ $t('crontab.day.cycle')[2] }}
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="4">
        {{ $t('crontab.day.step')[0] }}
        <el-input-number
          v-model="average02"
          :min="1"
          :max="31"
          @change="radioChange"
        />
        {{ $t('crontab.day.step')[1] }}
        <el-input-number
          v-model="average01"
          :min="1"
          :max="31"
          @change="radioChange"
        />
        {{ $t('crontab.day.step')[2] }}
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="6">
        {{ $t('crontab.day.lastDay') }}
      </el-radio>
    </el-form-item>

    <el-form-item>
      <div class="crontab-select-wrap" @keyup="handleDelete">
        <el-radio v-model="radioValue" :label="7">
          {{ $t('crontab.day.specific') }}
          <el-select
            clearable
            v-model="checkboxList"
            multiple
            style="width: 100%;"
            :placeholder="$t('crontab.day.placeholder')"
            @change="radioChange"
          >
            <el-option v-for="item in 31" :key="item" :value="item">
              {{ item }}
            </el-option>
          </el-select>
        </el-radio>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  data () {
    return {
      radioValue: 1,
      workday: 1,
      cycle01: 1,
      cycle02: 2,
      average01: 1,
      average02: 1,
      checkboxList: [],
      checkNum: this.$options.propsData.check
    }
  },
  name: 'crontab-day',
  props: ['check', 'cron'],
  methods: {
    handleDelete (event) {
      if (event.keyCode === 8 && this.checkboxList.length > 0) {
        this.checkboxList.splice(this.checkboxList.length - 1, 1)
        this.radioChange()
      }
    },
    // 单选按钮值变化时
    radioChange () {
      switch (this.radioValue) {
        case 1:
          this.$emit('update', 'day', '*', 'day')
          break
        case 2:
          this.$emit('update', 'day', '?')
          break
        case 3:
          this.$emit('update', 'day', this.cycle01 + '-' + this.cycle02)
          break
        case 4:
          this.$emit('update', 'day', this.average01 + '/' + this.average02)
          break
        case 5:
          this.$emit('update', 'day', this.workday + 'W')
          break
        case 6:
          this.$emit('update', 'day', 'L')
          break
        case 7:
          this.$emit('update', 'day', this.checkboxString)
          break
      }
    },
    // 周期两个值变化时
    cycleChange () {
      if (this.radioValue === '3') {
        this.$emit('update', 'day', this.cycleTotal)
      }
    },
    // 平均两个值变化时
    averageChange () {
      if (this.radioValue === '4') {
        this.$emit('update', 'day', this.averageTotal)
      }
    },
    // 最近工作日值变化时
    workdayChange () {
      if (this.radioValue === '5') {
        this.$emit('update', 'day', this.workday + 'W')
      }
    },
    // checkbox值变化时
    checkboxChange () {
      if (this.radioValue === '7') {
        this.$emit('update', 'day', this.checkboxString)
      }
    },
    // 父组件传递的week发生变化触发
    weekChange () {
      // 判断week值与day不能同时为“?”
      if (this.cron.week === '?' && this.radioValue === '2') {
        this.radioValue = '1'
      } else if (this.cron.week !== '?' && this.radioValue !== '2') {
        this.radioValue = '2'
      }
    },
    modifyCycle () {
      this.cycle01 = this.checkNum(this.cycle01, 1, 31)
      this.cycle02 = this.checkNum(this.cycle02, 1, 31)
    },
    modifyAverageTotal () {
      this.average01 = this.checkNum(this.average01, 1, 31)
      this.average02 = this.checkNum(this.average02, 1, 31)
    },
    modifyWorkday () {
      this.workday = this.checkNum(this.workday, 1, 31)
    }
  },
  watch: {
    radioValue: 'radioChange',
    cycleTotal: 'cycleChange',
    averageTotal: 'averageChange',
    workdayCheck: 'workdayChange',
    checkboxString: 'checkboxChange'
  },
  computed: {
    // 计算两个周期值
    cycleTotal () {
      this.modifyCycle()
      return this.cycle01 + '-' + this.cycle02
    },
    // 计算平均用到的值
    averageTotal () {
      this.modifyAverageTotal()
      return this.average01 + '/' + this.average02
    },
    // 计算工作日格式
    workdayCheck () {
      this.modifyWorkday()
      return this.workday
    },
    // 计算勾选的checkbox值合集
    checkboxString () {
      let str = this.checkboxList.join()
      return str === '' ? '*' : str
    }
  }
}
</script>
