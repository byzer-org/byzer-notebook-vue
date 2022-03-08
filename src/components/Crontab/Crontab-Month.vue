<template>
  <el-form size="small">
    <el-form-item>
      <el-radio v-model="radioValue" :label="1">
        {{ $t('crontab.month.every') }}
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="2">
        {{ $t('crontab.month.cycle')[0] }}
        <el-input-number
          v-model="cycle01"
          :min="1"
          :max="12"
          @change="radioChange"
        />
        {{ $t('crontab.month.cycle')[1] }}
        <el-input-number
          v-model="cycle02"
          :min="1"
          :max="12"
          @change="radioChange"
        />
        {{ $t('crontab.month.cycle')[2] }}
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="3">
        {{ $t('crontab.month.step')[0] }}
        <el-input-number
          v-model="average02"
          :min="1"
          :max="12"
          @change="radioChange"
        />
        {{ $t('crontab.month.step')[1] }}
        <el-input-number
          v-model="average01"
          :min="1"
          :max="12"
          @change="radioChange"
        />
        {{ $t('crontab.month.step')[2] }}
      </el-radio>
    </el-form-item>

    <el-form-item>
      <div class="crontab-select-wrap" @keyup="handleDelete">
        <el-radio v-model="radioValue" :label="4">
          {{ $t('crontab.month.specific') }}
          <el-select
            clearable
            v-model="checkboxList"
            multiple
            style="width: 100%"
            :placeholder="$t('crontab.month.placeholder')"
            @change="radioChange"
          >
            <el-option v-for="item in 12" :key="item" :value="item">
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
      cycle01: 1,
      cycle02: 2,
      average01: 1,
      average02: 1,
      checkboxList: [],
      checkNum: this.check
    }
  },
  name: 'crontab-month',
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
          this.$emit('update', 'month', '*')
          break
        case 2:
          this.$emit('update', 'month', this.cycle01 + '-' + this.cycle02)
          break
        case 3:
          this.$emit('update', 'month', this.average01 + '/' + this.average02)
          break
        case 4:
          this.$emit('update', 'month', this.checkboxString)
          break
      }
    },
    // 周期两个值变化时
    cycleChange () {
      if (this.radioValue === '2') {
        this.$emit('update', 'month', this.cycleTotal)
      }
    },
    // 平均两个值变化时
    averageChange () {
      if (this.radioValue === '3') {
        this.$emit('update', 'month', this.averageTotal)
      }
    },
    // checkbox值变化时
    checkboxChange () {
      if (this.radioValue === '4') {
        this.$emit('update', 'month', this.checkboxString)
      }
    },
    modifyCycle () {
      this.cycle01 = this.checkNum(this.cycle01, 1, 12)
      this.cycle02 = this.checkNum(this.cycle02, 1, 12)
    },
    modifyAverageTotal () {
      this.average01 = this.checkNum(this.average01, 1, 12)
      this.average02 = this.checkNum(this.average02, 1, 12)
    }
  },
  watch: {
    radioValue: 'radioChange',
    cycleTotal: 'cycleChange',
    averageTotal: 'averageChange',
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
    // 计算勾选的checkbox值合集
    checkboxString () {
      let str = this.checkboxList.join()
      return str === '' ? '*' : str
    }
  }
}
</script>
