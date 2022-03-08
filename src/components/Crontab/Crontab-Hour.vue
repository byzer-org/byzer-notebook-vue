<template>
  <el-form size="small">
    <el-form-item>
      <el-radio v-model="radioValue" :label="1">
        {{ $t('crontab.hour.every') }}
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="2">
        {{ $t('crontab.hour.cycle')[0] }}
        <el-input-number
          v-model="cycle01"
          :min="0"
          :max="23"
          @change="radioChange"
        />
        {{ $t('crontab.hour.cycle')[1] }}
        <el-input-number
          v-model="cycle02"
          :min="0"
          :max="23"
          @change="radioChange"
        />
        {{ $t('crontab.hour.cycle')[2] }}
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="3">
        {{ $t('crontab.hour.step')[0] }}
        <el-input-number
          v-model="average02"
          :min="0"
          :max="23"
          @change="radioChange"
        />
        {{ $t('crontab.hour.step')[1] }}
        <el-input-number
          v-model="average01"
          :min="0"
          :max="23"
          @change="radioChange"
        />
        {{ $t('crontab.hour.step')[2] }}
      </el-radio>
    </el-form-item>

    <el-form-item>
      <div class="crontab-select-wrap" @keyup="handleDelete">
        <el-radio v-model="radioValue" :label="4">
          {{ $t('crontab.hour.specific') }}
          <el-select
            clearable
            v-model="checkboxList"
            multiple
            style="width: 100%"
            :placeholder="$t('crontab.hour.placeholder')"
            @change="radioChange"
          >
            <el-option v-for="item in 24" :key="item" :value="item - 1">
              {{ item - 1 }}
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
      cycle01: 0,
      cycle02: 1,
      average01: 0,
      average02: 1,
      checkboxList: [],
      checkNum: this.$options.propsData.check
    }
  },
  name: 'crontab-hour',
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
          this.$emit('update', 'hour', '*', 'hour')
          break
        case 2:
          this.$emit('update', 'hour', this.cycle01 + '-' + this.cycle02)
          break
        case 3:
          this.$emit('update', 'hour', this.average01 + '/' + this.average02)
          break
        case 4:
          this.$emit('update', 'hour', this.checkboxString)
          break
      }
    },
    // 周期两个值变化时
    cycleChange () {
      if (this.radioValue === '2') {
        this.$emit('update', 'hour', this.cycleTotal)
      }
    },
    // 平均两个值变化时
    averageChange () {
      if (this.radioValue === '3') {
        this.$emit('update', 'hour', this.averageTotal)
      }
    },
    // checkbox值变化时
    checkboxChange () {
      if (this.radioValue === '4') {
        this.$emit('update', 'hour', this.checkboxString)
      }
    },
    modifyCycle () {
      this.cycle01 = this.checkNum(this.cycle01, 0, 23)
      this.cycle02 = this.checkNum(this.cycle02, 0, 23)
    },
    modifyAverageTotal () {
      this.average01 = this.checkNum(this.average01, 0, 23)
      this.average02 = this.checkNum(this.average02, 1, 23)
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
