
<template>
  <el-dialog
    :width="nodeType === 'select' ? '800px' : '600px'"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible="isShow"
    :custom-class="'create-node-modal ' + nodeType"
    @close="isShow && closeModal()">
    <div slot="title" class="node-modal-title">
      <span class="text">{{nodeInfo ? nodeInfo.name : ''}}</span>
      <el-tooltip placement="top" :content="$t('workflow.selectTip')" v-if="nodeType==='select'">
        <i class="el-ksd-icon-info_border_16 header-icon"></i>
      </el-tooltip>
    </div>
    <div class="node-form" v-if="nodeType">
      <component :is="`${nodeType}Form`" v-if="isShow" ref="ruleForm" type="add" :nodeInfo="nodeInfo" :nodeTypeId="nodeInfo.id" :initRuleForm="form" />
    </div>
    <div slot="footer" class="dialog-footer-btns">
      <el-button @click="closeModal" size="medium">{{$t('cancel')}}</el-button>
      <el-button type="primary" :loading="isSubmiting" size="medium" @click="handleSubmit">{{$t('ok')}}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapState, mapMutations, mapActions } from 'vuex'

import vuex from '../../store'
import store from './store'
vuex.registerModule(['modals', 'CreateNodeModal'], store)
import selectForm from '@/page/Workspace/Workflow/components/SelectNode'
import loadForm from '@/page/Workspace/Workflow/components/LoadNode'
import saveForm from '@/page/Workspace/Workflow/components/SaveNode'
import trainForm from '@/page/Workspace/Workflow/components/TrainNode'
import predictForm from '@/page/Workspace/Workflow/components/PredictNode'
import registerForm from '@/page/Workspace/Workflow/components/RegisterNode'
import etForm from '@/page/Workspace/Workflow/components/ETNode'

@Component({
  computed: {
    ...mapState('CreateNodeModal', {
      isShow: state => state.isShow,
      form: state => state.form,
      callback: state => state.callback,
      nodeInfo: state => state.nodeInfo
    })
  },
  components: {
    selectForm,
    loadForm,
    saveForm,
    trainForm,
    predictForm,
    registerForm,
    etForm
  },
  methods: {
    ...mapMutations('CreateNodeModal', {
      hideModal: 'HIDE_MODAL',
      setModalForm: 'SET_MODAL_FORM',
      resetModal: 'RESET_MODAL_FORM'
    }),
    ...mapActions({
      createWorkflowNode: 'CREATE_WORKFLOW_NODE'
    })
  }
})

export default class CreateNodeModal extends Vue {
  isSubmiting = false
  isValidating = false

  @Watch('isShow')
  async onDialogShow (newVal, oldVal) {
    // 关闭弹窗时，重置弹窗信息
    if (!newVal && oldVal) {
      // this.resetModal()
      this.$refs.ruleForm.clearResult()
    }
  }

  get nodeType () {
    return this.nodeInfo?.type ?? ''
  }

  get title () {
    if (!this.nodeType) {
      return ''
    }
    const arr = this.nodeType.split('')
    arr[0] = arr[0].toUpperCase()
    return arr.join('')
  }

  // 关闭弹窗
  closeModal () {
    this.hideModal()
  }

  handleInput (key, value) {
    this.setModalForm({ [key]: value })
  }

  async handleSubmit () {
    try {
      const { left, top, type } = this.nodeInfo
      await this.$refs.ruleForm.checkForm()
      this.isSubmiting = true
      let formParams = null
      if (type === 'et') {
        formParams = this.$refs.ruleForm.getCreateEditParams()
      } else {
        formParams = this.$refs.ruleForm.ruleForm
      }
      const params = {
        type,
        content: { ...formParams },
        position: {
          left,
          top
        }
      }
      const res = await this.createWorkflowNode(params)
      this.callback({ isSubmit: true, nodeInfo: { id: res.data.id } })
      this.hideModal()
    } catch (e) {
      console.log(e)
    } finally {
      this.isSubmiting = false
    }
  }
}
</script>
<style lang="scss">
.create-node-modal {
  .node-form {
    max-height: 600px;
    overflow-y: auto;
  }
  .node-modal-title {
    .text {
      vertical-align: middle;
    }
    .header-icon {
      margin-left: 5px;
      font-size: 16px;
    }
  }
}
</style>
