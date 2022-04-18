<template>
  <div class="node-wrapper">
    <div class="node-wrapper-header">
      {{getName(nodeInfo)}}
      <el-tooltip placement="top" :content="$t('workflow.selectTip')" v-if="nodeType === 'select'">
        <i class="el-ksd-icon-info_border_16 node-wrapper-header-icon"></i>
      </el-tooltip>
    </div>
    <div class="node-wrapper-container">
      <SelectNode ref="selectNode" v-if="nodeType==='select'" type="edit" :nodeInfo="nodeInfo" :originSql="originSql" :initRuleForm="nodeDetail" @cancelEdit="cancelEdit" @confirmSubmit="confirmSubmit" />
      <LoadNode ref="loadNode" v-else-if="nodeType==='load'" type="edit" :nodeInfo="nodeInfo" :originSql="originSql" :initRuleForm="nodeDetail" @cancelEdit="cancelEdit" @confirmSubmit="confirmSubmit"  />
      <SaveNode ref="saveNode" v-else-if="nodeType==='save'" type="edit" :nodeInfo="nodeInfo" :originSql="originSql" :initRuleForm="nodeDetail" @cancelEdit="cancelEdit" @confirmSubmit="confirmSubmit"  />
      <TrainNode ref="trainNode" v-else-if="nodeType==='train'" type="edit" :nodeInfo="nodeInfo" :originSql="originSql" :initRuleForm="nodeDetail" @cancelEdit="cancelEdit" @confirmSubmit="confirmSubmit"  />
      <RegisterNode ref="registerNode" v-else-if="nodeType==='register'" :nodeInfo="nodeInfo" type="edit" :originSql="originSql" :initRuleForm="nodeDetail" @cancelEdit="cancelEdit" @confirmSubmit="confirmSubmit"  />
      <PredictNode ref="predictNode" v-else-if="nodeType==='predict'" :nodeInfo="nodeInfo" type="edit" :originSql="originSql" :initRuleForm="nodeDetail" @cancelEdit="cancelEdit" @confirmSubmit="confirmSubmit"  />
      <ETNode ref="etNode" v-else-if="nodeType==='et'" type="edit" :nodeInfo="nodeInfo" :originSql="originSql" :initRuleForm="nodeDetail" @cancelEdit="cancelEdit" @confirmSubmit="confirmSubmit"  />
    </div>
    <div class="node-wrapper-submit-btns">
      <el-button size="small" @click="cancelEdit">{{$t('cancel')}}</el-button>
      <el-button size="small" type="primary" @click="submitForm">{{$t('save')}}</el-button>
    </div>
  </div>
</template>

<script>
import SelectNode from '../SelectNode'
import LoadNode from '../LoadNode'
import SaveNode from '../SaveNode'
import TrainNode from '../TrainNode'
import RegisterNode from '../RegisterNode'
import PredictNode from '../PredictNode'
import ETNode from '../ETNode'
import { mapState, mapActions } from 'vuex'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { basicNodeType } from '../ETNode/config'

@Component({
  props: ['nodeInfo'],
  components: {
    SelectNode,
    LoadNode,
    SaveNode,
    TrainNode,
    RegisterNode,
    PredictNode,
    ETNode
  },
  computed: {
    ...mapState({
      activeNotebook: state => state.notebook.activeNotebook
    })
  },
  methods: {
    ...mapActions({
      getNodeInfo: 'GET_NODE_INFO',
      updateNode: 'UPDATE_FLOW_NODE'
    })  
  }
})
export default class NodeEditor extends Vue {
  nodeType = ''
  nodeDetail = null
  originSql = ''
  
  @Watch('nodeInfo')
  onNodeInfoChange (newVal) {
    this.initData(newVal)
  }
  getName (node) {
    if (!node) {
      return ''
    }
    if (basicNodeType.includes(node.type)) {
      const arr = node.type.split('')
      arr[0] = arr[0].toUpperCase()
      return arr.join('')
    } else {
      return node.content.et_name
    }
    
  }
  mounted () {
    this.initData()
  }
  initData () {
    this.nodeType = this.nodeInfo.type
    this.getNodeDetail(this.nodeInfo.id)
  }
  async getNodeDetail (node_id) {
    const params = {
      node_id
    }
    try {
      this.nodeDetail = null
      this.originSql = ''
      const res = await this.getNodeInfo(params)
      this.nodeDetail = res.data.content
      this.originSql = res.data.sql || ''
      this.$nextTick(() => {
        this.$refs[`${this.nodeType}Node`] && this.$refs[`${this.nodeType}Node`].clearResult()
      })
    } catch (e) {
      console.log(e)
    }
  }
  async submitForm () {
    try {
      const { type } = this.nodeInfo
      const isSubmit = await this.$refs[`${type}Node`].checkForm()
      if (isSubmit) {
        let formParams = null
        if (type === 'et') {
          formParams = this.$refs[`${type}Node`].getCreateEditParams()
        } else {
          formParams = this.$refs[`${type}Node`].ruleForm
        }
        const params = {
          type,
          content: formParams
        }
        this.confirmSubmit(params)
      }
    } catch (e) {
      console.log(e)
    }
  }
  async confirmSubmit (params) {
    try {
      const data = {
        node_id: this.nodeInfo.id,
        data: params
      }
      await this.updateNode(data)
      this.cancelEdit(true)
      
    } catch (e) {
      console.log(e)
    }
  }
  cancelEdit (refresh) {
    this.$emit('cancelEdit', refresh)
  }
}
</script>

<style lang="scss">

.node-wrapper {
  width: 100%;
  height: 100%;
  padding-top: 48px;
  padding-bottom: 45px;
  position: relative;
  &-header {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 48px;
    line-height: 48px;
    padding-left: 16px;
    font-size: 14px;
    font-weight: 500;
    border-bottom: 1px solid $--border-color-light;
    &-icon {
      font-size: 16px;
    }
  }
  &-container {
    height: 100%;
    overflow-y: auto;
    
  }
  &-submit-btns {
    border-top: 1px solid $--border-color-light;
    position: absolute;
    left: 0;
    bottom: 0px;
    width: 100%;
    text-align: right;
    padding: 8px 16px;
    background-color: $--color-white;
  }
}
.node-container {
  .node-container-form {
    &-wrapper {
      padding-top: 10px;
      .form-custom {
        line-height: 34px;
        font-weight: 500;
        .start {
          margin-right: 5px;
        }
      }
    }
  }
  &.extra-style {
    .node-container-form {
      padding: 0;
    }
    .view-sql {
      margin-top: 16px;
      padding: 0;
      padding-top: 16px;
    }
  }
  &-form {
    padding: 16px;
    .el-form-item {
      .el-checkbox__label {
        font-weight: 500;
      }
      &.indent {
        margin-top: -24px;
        width: 100%;
        display: flex;
        align-items: center;
        .el-form-item__label {
          padding-left: 20px;
          padding-right: 16px;
          width: 132px;
          line-height: 34px !important;
        }
        .el-form-item__content {
          flex: 1;
          padding-bottom: 8px;
        }
        &.predict {
          margin-top: -12px;
          .el-form-item__label {
            width: 170px;
          }
        }
      }
    }
  }
  .view-sql {
    border-top: 1px solid $--background-color-secondary;
    padding: 16px;
    background-color: $--color-white;
    &-label {
      color: $--color-text-primary;
      font-weight: 500;
      font-size: 12px;
      position: relative;
      .copy-icon {
        font-size: 16px;
        position: absolute;
        right: 0;
        top: 0;
      }
    }
    &-content {
      padding-top: 16px;
    }
  }
}
</style>

