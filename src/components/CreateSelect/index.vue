
<template>
  <el-dialog
    width="400px"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible="isShow"
    @close="isShow && closeModal()"
    custom-class="select-modal"
    >
    <div slot="title" class="select-modal-title">
      <span class="text">Select</span>
      <el-tooltip placement="top" :content="$t('workflow.selectTip')">
        <i class="el-ksd-icon-info_border_16 header-icon"></i>
      </el-tooltip>
    </div>
    <div class="create-select-form">
      <Form v-if="isShow" ref="ruleForm" :initRuleForm="initForm" />
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
vuex.registerModule(['modals', 'CreateSelectModal'], store)
import Form from '@/page/Workspace/Workflow/components/SelectNode'

@Component({
  computed: {
    ...mapState('CreateSelectModal', {
      isShow: state => state.isShow,
      form: state => state.form,
      callback: state => state.callback,
      nodeInfo: state => state.nodeInfo
    })
  },
  components: {
    Form
  },
  methods: {
    ...mapMutations('CreateSelectModal', {
      hideModal: 'HIDE_MODAL',
      setModalForm: 'SET_MODAL_FORM',
      resetModal: 'RESET_MODAL_FORM'
    }),
    ...mapActions({
      createWorkflowNode: 'CREATE_WORKFLOW_NODE'
    })
  }
})

export default class CreateSelectModal extends Vue {
  isSubmiting = false
  isValidating = false
  initForm = {
    sql: ''
  }

  @Watch('isShow')
  async onDialogShow (newVal, oldVal) {
    // 关闭弹窗时，重置弹窗信息
    if (!newVal && oldVal) {
      this.resetModal()
    }
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
      this.isSubmiting = true
      const { left, top } = this.nodeInfo
      const params = {
        type: 'select',
        content: { ...this.$refs.ruleForm.ruleForm },
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
.select-modal {
  &-title {
    .text {
      vertical-align: middle;
    }
    .header-icon {
      margin-left: 5px;
      font-size: 16px;
    }
  }
  .create-select-form {
    max-height: 600px;
  }
}
</style>
