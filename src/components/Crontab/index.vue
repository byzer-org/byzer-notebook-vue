<template>
  <div class="crontab-wrap">
    <el-tabs
      type="border-card"
      v-model="tabActive"
    >
      <el-tab-pane
        v-if="shouldHide('second')"
        :name="'second'"
        :label="$t('crontab.tabTitles.second')"
      >
        <CrontabSecond
          @update="updateContabValue"
          :check="checkNumber"
          ref="cronsecond"
        />
      </el-tab-pane>

      <el-tab-pane
        v-if="shouldHide('min')"
        :name="'min'"
        :label="$t('crontab.tabTitles.minute')"
      >
        <CrontabMin
          @update="updateContabValue"
          :check="checkNumber"
          :cron="contabValueObj"
          ref="cronmin"
        />
      </el-tab-pane>

      <el-tab-pane
        v-if="shouldHide('hour')"
        :name="'hour'"
        :label="$t('crontab.tabTitles.hour')"
      >
        <CrontabHour
          @update="updateContabValue"
          :check="checkNumber"
          :cron="contabValueObj"
          ref="cronhour"
        />
      </el-tab-pane>

      <el-tab-pane
        v-if="shouldHide('day')"
        :name="'day'"
        :label="$t('crontab.tabTitles.day')"
      >
        <CrontabDay
          @update="updateContabValue"
          :check="checkNumber"
          :cron="contabValueObj"
          ref="cronday"
        />
      </el-tab-pane>

      <el-tab-pane
        v-if="shouldHide('month')"
        :name="'month'"
        :label="$t('crontab.tabTitles.month')"
      >
        <CrontabMonth
          @update="updateContabValue"
          :check="checkNumber"
          :cron="contabValueObj"
          ref="cronmonth"
        />
      </el-tab-pane>


      <el-tab-pane
        v-if="shouldHide('year')"
        :name="'year'"
        :label="$t('crontab.tabTitles.year')"
      >
        <CrontabYear
          @update="updateContabValue"
          :check="checkNumber"
          :cron="contabValueObj"
          ref="cronyear"
        />
      </el-tab-pane>
    </el-tabs>

    <div class="popup-main">

      <div class="pop_btn">
        <el-button type="primary" @click="submitFill">
          {{ $t('ok') }}
        </el-button>
        <el-button type="warning" @click="clearCron">
          {{ $t('reset') }}
        </el-button>
        <el-button @click="hidePopup">{{ $t('cancel') }}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import CrontabSecond from './Crontab-Second.vue'
import CrontabMin from './Crontab-Min.vue'
import CrontabHour from './Crontab-Hour.vue'
import CrontabDay from './Crontab-Day.vue'
import CrontabMonth from './Crontab-Month.vue'
import CrontabYear from './Crontab-Year.vue'

export default {
  name: 'vcrontab',
  props: ['expression', 'hideComponent'],
  data () {
    return {
      tabTitles: [
        this.$t('crontab.tabTitles.second'),
        this.$t('crontab.tabTitles.minute'),
        this.$t('crontab.tabTitles.hour'),
        this.$t('crontab.tabTitles.day'),
        this.$t('crontab.tabTitles.month'),
        this.$t('crontab.tabTitles.week'),
        this.$t('crontab.tabTitles.year')
      ],
      tabActive: 'second',
      myindex: 0,
      contabValueObj: {
        second: '0',
        min: '0',
        hour: '0',
        day: '*',
        month: '*',
        week: '?',
        year: '*'
      }
    }
  },
  components: {
    CrontabSecond,
    CrontabMin,
    CrontabHour,
    CrontabDay,
    CrontabMonth,
    CrontabYear
  },
  computed: {
    contabValueString: function () {
      let obj = this.contabValueObj
      let str =
        obj.second +
        ' ' +
        obj.min +
        ' ' +
        obj.hour +
        ' ' +
        obj.day +
        ' ' +
        obj.month +
        ' ' +
        obj.week +
        (obj.year === '' ? '' : ' ' + obj.year)
      return str
    }
  },
  watch: {
    expression: {
      handler () {
        this.$nextTick(() => {
          this.resolveExp()
        })
      },
      immediate: true
    }
  },
  methods: {
    shouldHide (key) {
      if (this.hideComponent && this.hideComponent.includes(key)) return false
      return true
    },
    // 反解析 表达式
    resolveExp () {
      if (this.expression) {
        let arr = this.expression.split(' ')
        if (arr.length >= 6) {
          // 6 位以上是合法表达式
          let obj = {
            second: arr[0],
            min: arr[1],
            hour: arr[2],
            day: arr[3],
            month: arr[4],
            week: arr[5],
            year: arr[6] ? arr[6] : '*'
          }
          this.contabValueObj = {
            ...obj
          }
          for (let i in obj) {
            if (obj[i]) this.changeRadio(i, obj[i])
          }
        }
      } else {
        // 没有传入的表达式 则还原
        this.clearCron()
      }
    },
    // 由子组件触发，更改表达式组成的字段值
    updateContabValue (name, value, from) {
      'updateContabValue', name, value, from
      this.contabValueObj[name] = value
      if (from && from !== name) {
        this.changeRadio(name, value)
      }
    },
    // 赋值到组件
    changeRadio (name, value) {
      let arr = ['second', 'min', 'hour', 'month'],
        refName = 'cron' + name,
        insVlaue

      if (!this.$refs[refName]) return

      if (arr.includes(name)) {
        if (value === '*') {
          insVlaue = 1
        } else if (value.indexOf('-') > -1) {
          let indexArr = value.split('-')
          isNaN(indexArr[0])
            ? (this.$refs[refName].cycle01 = 0)
            : (this.$refs[refName].cycle01 = indexArr[0])
          this.$refs[refName].cycle02 = indexArr[1]
          insVlaue = 2
        } else if (value.indexOf('/') > -1) {
          let indexArr = value.split('/')
          isNaN(indexArr[0])
            ? (this.$refs[refName].average01 = 0)
            : (this.$refs[refName].average01 = indexArr[0])
          this.$refs[refName].average02 = indexArr[1]
          insVlaue = 3
        } else {
          insVlaue = 4
          this.$refs[refName].checkboxList = value.split(',').map(i => i * 1)
        }
      } else if (name === 'day') {
        if (value === '*') {
          insVlaue = 1
        } else if (value === '?') {
          insVlaue = 2
        } else if (value.indexOf('-') > -1) {
          let indexArr = value.split('-')
          isNaN(indexArr[0])
            ? (this.$refs[refName].cycle01 = 0)
            : (this.$refs[refName].cycle01 = indexArr[0])
          this.$refs[refName].cycle02 = indexArr[1]
          insVlaue = 3
        } else if (value.indexOf('/') > -1) {
          let indexArr = value.split('/')
          isNaN(indexArr[0])
            ? (this.$refs[refName].average01 = 0)
            : (this.$refs[refName].average01 = indexArr[0])
          this.$refs[refName].average02 = indexArr[1]
          insVlaue = 4
        } else if (value.indexOf('W') > -1) {
          let indexArr = value.split('W')
          isNaN(indexArr[0])
            ? (this.$refs[refName].workday = 0)
            : (this.$refs[refName].workday = indexArr[0])
          insVlaue = 5
        } else if (value === 'L') {
          insVlaue = 6
        } else {
          this.$refs[refName].checkboxList = value.split(',').map(i => i * 1)
          insVlaue = 7
        }
      } else if (name === 'week') {
        if (value === '*') {
          insVlaue = 1
        } else if (value === '?') {
          insVlaue = 2
        } else if (value.indexOf('-') > -1) {
          let indexArr = value.split('-')
          isNaN(indexArr[0])
            ? (this.$refs[refName].cycle01 = 0)
            : (this.$refs[refName].cycle01 = indexArr[0])
          this.$refs[refName].cycle02 = indexArr[1]
          insVlaue = 3
        } else if (value.indexOf('#') > -1) {
          let indexArr = value.split('#')
          isNaN(indexArr[0])
            ? (this.$refs[refName].average01 = 1)
            : (this.$refs[refName].average01 = indexArr[0])
          this.$refs[refName].average02 = indexArr[1]
          insVlaue = 4
        } else if (value.indexOf('L') > -1) {
          let indexArr = value.split('L')
          isNaN(indexArr[0])
            ? (this.$refs[refName].weekday = 1)
            : (this.$refs[refName].weekday = indexArr[0])
          insVlaue = 5
        } else {
          this.$refs[refName].checkboxList = value.split(',').map(i => i * 1)
          insVlaue = 7
        }
      } else if (name === 'year') {
        if (value === '') {
          insVlaue = 1
        } else if (value === '*') {
          insVlaue = 2
        } else if (value.indexOf('-') > -1) {
          insVlaue = 3
        } else if (value.indexOf('/') > -1) {
          insVlaue = 4
        } else {
          this.$refs[refName].checkboxList = value.split(',').map(i => i * 1)
          insVlaue = 5
        }
      }
      this.$refs[refName].radioValue = insVlaue
    },
    // 表单选项的子组件校验数字格式（通过-props传递）
    checkNumber (value, minLimit, maxLimit) {
      // 检查必须为整数
      value = Math.floor(value)
      if (value < minLimit) {
        value = minLimit
      } else if (value > maxLimit) {
        value = maxLimit
      }
      return value
    },
    // 隐藏弹窗
    hidePopup () {
      this.$emit('hide')
    },
    // 填充表达式
    submitFill () {
      this.$emit('fill', this.contabValueString)
      this.hidePopup()
    },
    clearCron () {
      this.tabActive = 'second'
      // 还原选择项
      this.contabValueObj = {
        second: '0',
        min: '0',
        hour: '0',
        day: '*',
        month: '*',
        week: '?',
        year: '*'
      }
      for (let j in this.contabValueObj) {
        this.changeRadio(j, this.contabValueObj[j])
      }

      // reset form value
      this.$refs['cronsecond'].cycle01 = 1
      this.$refs['cronsecond'].cycle02 = 2
      this.$refs['cronsecond'].average01 = 0
      this.$refs['cronsecond'].average02 = 1
      this.$refs['cronsecond'].checkboxList = [0]

      this.$refs['cronmin'].cycle01 = 1
      this.$refs['cronmin'].cycle02 = 2
      this.$refs['cronmin'].average01 = 0
      this.$refs['cronmin'].average02 = 1
      this.$refs['cronmin'].checkboxList = [0]

      this.$refs['cronhour'].cycle01 = 0
      this.$refs['cronhour'].cycle02 = 1
      this.$refs['cronhour'].average01 = 0
      this.$refs['cronhour'].average02 = 1
      this.$refs['cronhour'].checkboxList = [0]

      this.$refs['cronday'].workday = 1
      this.$refs['cronday'].cycle01 = 1
      this.$refs['cronday'].cycle02 = 2
      this.$refs['cronday'].average01 = 1
      this.$refs['cronday'].average02 = 1
      this.$refs['cronday'].checkboxList = []

      this.$refs['cronmonth'].cycle01 = 1
      this.$refs['cronmonth'].cycle02 = 2
      this.$refs['cronmonth'].average01 = 1
      this.$refs['cronmonth'].average02 = 1
      this.$refs['cronmonth'].checkboxList = []

      this.$refs['cronyear'].fullYear = Number(new Date().getFullYear())
      this.$refs['cronyear'].cycle01 = 0
      this.$refs['cronyear'].cycle02 = 0
      this.$refs['cronyear'].average01 = 0
      this.$refs['cronyear'].average02 = 1
      this.$refs['cronyear'].checkboxList = []
    }
  }
}
</script>
<style scoped>
.crontab-wrap {
  width: 640px;
}
.pop_btn {
  text-align: center;
  margin-top: 20px;
}
.popup-main {
  position: relative;
  margin: 10px auto;
  background: #fff;
  border-radius: 5px;
  font-size: 12px;
  overflow: hidden;
}
.popup-title {
  overflow: hidden;
  line-height: 34px;
  padding-top: 6px;
  background: #f2f2f2;
}
.popup-result {
  box-sizing: border-box;
  line-height: 24px;
  margin: 25px auto;
  padding: 15px 10px 10px;
  border: 1px solid #ccc;
  position: relative;
}
.popup-result .title {
  position: absolute;
  top: -28px;
  left: 50%;
  width: 140px;
  font-size: 14px;
  margin-left: -70px;
  text-align: center;
  line-height: 30px;
  background: #fff;
}
.popup-result table {
  text-align: center;
  width: 100%;
  margin: 0 auto;
}
.popup-result table span {
  display: block;
  width: 100%;
  font-family: arial;
  line-height: 30px;
  height: 30px;
  white-space: nowrap;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}
.popup-result-scroll {
  font-size: 12px;
  line-height: 24px;
  height: 10em;
  overflow-y: auto;
}
</style>
