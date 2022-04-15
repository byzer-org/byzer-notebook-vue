<template>
  <div class="form-select" ref="selectForm">
    <div class="form-select-sql">
      <CodeEditor :height="editorHeight" :value="initRuleForm ? initRuleForm.sql : ''" :isSelected="true" @changeContent="changeContent" />
      <div class="form-select-sql-msg" ref="checkResult" v-show="checkResult==='error'">
        {{errorMsg}}
      </div>
     </div>
    <div class="form-select-btns">
      <div class="form-select-btns-l">
        <el-tag type="danger" v-if="checkResult==='error'">
          <i class="el-ksd-icon-wrong_fill_16 font16 txt-danger"></i>
          Error
        </el-tag>
        <el-tag type="success" v-else-if="checkResult==='success'">
          <i class="el-ksd-icon-right_fill_16 font16 txt-success"></i>
          All Good
        </el-tag>
      </div>
      <div class="form-select-btns-r">
        <el-button size="mini" type="text" icon="el-ksd-icon-clear_16" @click="clearResult" v-if="checkResult">{{$t('workflow.clear')}}</el-button>
        <el-button size="mini" type="text" icon="el-ksd-icon-confirm_16" @click="checkSql">{{$t('workflow.check')}}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import CodeEditor from '../CodeEditor'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { mapActions } from 'vuex'
@Component({
  props: ['initRuleForm'],
  components: {
    CodeEditor
  },
  methods: {
    ...mapActions({
      checkMlsql: 'CHECK_MLSQL'
    })
  }
})
export default class SelectNodeForm extends Vue {
  checkResult = ''
  editorHeight = '200'
  ruleForm = {
    sql: ''
  }
  errorMsg = ''
  
  get detailIsChanged () {
    const { sql: initSql } = this.initRuleForm
    const { sql: originSql } = this.ruleForm
    const initFormSql = initSql.endsWith(';') ? initSql : (initSql + ';')
    const originFormSql = originSql.endsWith(';') ? originSql : (originSql + ';')
    return initFormSql !== originFormSql
  }
  @Watch('initRuleForm')
  onInitRuleFormChange () {
    this.initData()
  }
  mounted () {
    this.initData()
    this.resetData()
  }
  initData () {
    this.ruleForm = { 
      sql: this.initRuleForm?.sql ?? ''
    }
    this.getEditorHeight()
  }

  resetData () {
    this.checkResult = ''
    this.ruleForm = {
      sql: ''
    }
    this.errorMsg = ''
  }
  getEditorHeight () {
    this.$nextTick(() => {
      const allHeight = this.$refs?.selectForm?.offsetHeight
      const resultHeight = this.$refs?.checkResult?.offsetHeight
      const btnHeight = 34
      this.editorHeight = String(allHeight - resultHeight - btnHeight)
    })
  }
  checkForm () {
    if (this.checkResult === 'error') {
      return this.$confirm(this.$t('tip'), this.$t('workflow.saveTipTitle'), {
        confirmButtonText: this.$t('save'),
        cancelButtonText: this.$t('cancel'),
        showClose: false,
        type: 'warning',
        customClass: 'centerButton'
      })
    } else {
      return new Promise(function (resolve) {
        resolve(true)
      })
    }
  }
  changeContent (value = '') {
    const reverseArr = value.split('\n').reverse()
    const index = reverseArr.findIndex(i => i)
    reverseArr[index] = (reverseArr[index] || '').endsWith(';') ? reverseArr[index] : reverseArr[index] + ';'
    this.ruleForm.sql = reverseArr.reverse().join('\n')
  }
  clearResult () {
    this.checkResult = ''
    this.errorMsg = ''
    this.getEditorHeight()
  }
  async checkSql () {
    try {
      const params = {
        content: this.ruleForm.sql || ''
      }
      const res = await this.checkMlsql(params)
      this.checkResult = res.data.result
      this.errorMsg = res.data.msg
      this.getEditorHeight()
    } catch (e) {
      this.getEditorHeight()
    }
  }
}
</script>

<style lang="scss">

.form-select {
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding-bottom: 34px;
  position: relative;
  &-sql {
    height: 100%;
    overflow: auto;
    &-msg {
      padding: 4px 10px;
      max-height: 132px;
      overflow-y: auto;
      color: $--color-danger;
      position: relative;
      font-size: 12px;
      line-height: 16px;
      word-break: break-all;
      &::after {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        height: 24px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 90.32%);
      }
    }
  }
  &-btns {
    width: 100%;
    background-color: $--color-white;
    position: absolute;
    left: 0;
    bottom: 0;
    height: 34px;
    display: flex;
    justify-content: space-between;
    &-l {
      padding: 4px;
      .error {
        color: $--color-danger-light;
      }
      .success {
        color: $--color-success-light;
      }
    }
    &-r {
      padding-right: 4px;
    }
  }
}
</style>

