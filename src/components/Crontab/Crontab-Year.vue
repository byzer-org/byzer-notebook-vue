<template>
  <el-form size="small">
    <el-form-item>
      <el-radio :label="2" v-model="radioValue">
        {{ $t('crontab.year.every') }}
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio :label="3" v-model="radioValue">
        {{ $t('crontab.year.cycle')[0] }}
        <el-input-number
          v-model="cycle01"
          :min="fullYear"
          :max="2099"
          @change="radioChange"
        />
        {{ $t('crontab.year.cycle')[1] }}
        <el-input-number
          v-model="cycle02"
          :min="fullYear"
          :max="2099"
          @change="radioChange"
        />
        {{ $t('crontab.year.cycle')[2] }}
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio :label="4" v-model="radioValue">
        {{ $t('crontab.year.step')[0] }}
        <el-input-number
          v-model="average02"
          :min="1"
          :max="100"
          @change="radioChange"
        />
        {{ $t('crontab.year.step')[1] }}
        <el-input-number
          v-model="average01"
          :min="fullYear"
          :max="2099"
          @change="radioChange"
        />
        {{ $t('crontab.year.step')[2] }}
      </el-radio>
    </el-form-item>

    <el-form-item>
      <div class="crontab-select-wrap" @keyup="handleDelete">
        <el-radio :label="5" v-model="radioValue">
          {{ $t('crontab.year.specific') }}
          <el-select
            clearable
            v-model="checkboxList"
            multiple
            style="width: 100%"
            :placeholder="$t('crontab.year.placeholder')"
            @change="radioChange"
          >
            <el-option
              v-for="item in 15"
              :key="item"
              :value="item - 1 + fullYear"
              :label="item - 1 + fullYear"
            />
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
      fullYear: 0,
      radioValue: 2,
      cycle01: 0,
      cycle02: 0,
      average01: 0,
      average02: 1,
      checkboxList: [],
      checkNum: this.$options.propsData.check
    }
  },
  name: 'crontab-year',
  props: ['check', 'month', 'cron'],
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
          this.$emit('update', 'year', '')
          break
        case 2:
          this.$emit('update', 'year', '*')
          break
        case 3:
          this.$emit('update', 'year', this.cycle01 + '-' + this.cycle02)
          break
        case 4:
          this.$emit('update', 'year', this.average01 + '/' + this.average02)
          break
        case 5:
          this.$emit('update', 'year', this.checkboxString)
          break
      }
    },
    // 周期两个值变化时
    cycleChange () {
      if (this.radioValue === '3') {
        this.$emit('update', 'year', this.cycleTotal)
      }
    },
    // 平均两个值变化时
    averageChange () {
      if (this.radioValue === '4') {
        this.$emit('update', 'year', this.averageTotal)
      }
    },
    // checkbox值变化时
    checkboxChange () {
      if (this.radioValue === '5') {
        this.$emit('update', 'year', this.checkboxString)
      }
    },
    modifyCycle () {
      this.cycle01 = this.checkNum(
        this.cycle01,
        this.fullYear,
        this.fullYear + 100
      )
      this.cycle02 = this.checkNum(
        this.cycle02,
        this.fullYear + 1,
        this.fullYear + 101
      )
    },
    modifyAverageTotal () {
      this.average01 = this.checkNum(
        this.average01,
        this.fullYear,
        this.fullYear + 100
      )
      this.average02 = this.checkNum(this.average02, 1, 2099)
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
      return str
    }
  },
  mounted () {
    // 仅获取当前年份
    this.fullYear = Number(new Date().getFullYear())
  }
}
</script>
