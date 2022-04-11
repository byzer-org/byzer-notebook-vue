
<template>
  <el-dialog
    width="400px"
    append-to-body
    :title="$t(`settings.${type}Title`)"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible="isShow"
    @close="isShow && closeModal()">
    <div class="connect-node-form">
      <Form ref="ruleForm" />
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
import { encryptData } from '@/util'

import vuex from '../../store'
import store from './store'
vuex.registerModule(['modals', 'CreateConnectionModal'], store)
import Form from './Form.vue'

@Component({
  computed: {
    ...mapState({
      userInfo: state => state.user.userInfo
    }),
    ...mapState('CreateConnectionModal', {
      isShow: state => state.isShow,
      form: state => state.form,
      type: state => state.type,
      id: state => state.id,
      callback: state => state.callback
    })
  },
  components: {
    Form
  },
  methods: {
    ...mapMutations('CreateConnectionModal', {
      hideModal: 'HIDE_MODAL',
      setModalForm: 'SET_MODAL_FORM',
      resetModal: 'RESET_MODAL_FORM'
    }),
    ...mapActions({
      createConnection: 'CREATE_CONNECTION',
      updateConnection: 'UPDATE_CONNECTION'
    })
  }
})

export default class CreateConnectionModal extends Vue {
  isSubmiting = false
  isValidating = false

  @Watch('isShow')
  async onDialogShow (newVal, oldVal) {
    // 关闭弹窗时，重置弹窗信息
    if (!newVal && oldVal) {
      this.resetModal()
      this.$refs.ruleForm.$refs.form.clearValidate()
      this.$refs.ruleForm.connectionResult = ''
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
      await this.$refs.ruleForm.checkForm()
      this.isSubmiting = true
      const params = {
        name: this.userInfo.username + '_' + this.form.name,
        content: { ...this.form }
      }
      if (params.content.password) {
        params.content.password = await encryptData(params.content.password)
      }
      if (this.type === 'add') {
        await this.createConnection(params)
      } else {
        await this.updateConnection({ connectionId: this.id, data: params })
      }
      
      this.callback({ isSubmit: true })
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
</style>
