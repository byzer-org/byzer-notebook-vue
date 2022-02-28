
<template>
  <el-dialog
    width="400px"
    append-to-body
    :title="title"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible="isShow"
    @close="isShow && closeModal()">
    <div>
      <el-form
        :model="form"
        :rules="rules"
        ref="$form">
        <el-form-item prop="name" :label="labelName">
          <el-input
            v-model="form.name"
            :placeholder="$t('workspace.nameHolder')"
            @change="value => handleInput('name', value)"
          />
        </el-form-item>
        <el-form-item class="dialog-btns">
          <el-button @click="closeModal" size="medium">{{$t('cancel')}}</el-button>
          <el-button type="primary" :loading="isSubmiting" size="medium" native-type="submit" @click.prevent="handleSubmit">{{$t('create')}}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapState, mapMutations, mapActions } from 'vuex'

import vuex, { actionsTypes } from '../../store'
import store from './store'
import { notebookNameReg } from '@/config'
vuex.registerModule(['modals', 'CreateNoteBookModal'], store)

@Component({
  computed: {
    ...mapState('CreateNoteBookModal', {
      isShow: state => state.isShow,
      form: state => state.form,
      callback: state => state.callback
    })
  },
  methods: {
    ...mapMutations('CreateNoteBookModal', {
      hideModal: actionsTypes.HIDE_MODAL,
      setModalForm: actionsTypes.SET_MODAL_FORM,
      resetModal: actionsTypes.RESET_MODAL_FORM
    }),
    ...mapActions({
      createNotebook: actionsTypes.CREATE_NOTEBOOK_LIST,
      saveAsNotebook: 'SAVE_WORKFLOW_AS_NOTEBOOK'
    })
  }
})

export default class CreateNoteBookModal extends Vue {
  isSubmiting = false
  isValidating = false

  get labelName () {
    if (this.form.type === 'workflow') {
      return this.$t('workspace.workflowName')
    } else {
      return this.$t('workspace.notebookName')
    }
  }

  get rules () {
    return {
      name: [
        { required: true, validator: this.validateName, trigger: 'blur' }
      ]
    }
  }

  get title () {
    if (this.form.type === 'save-as-notebook') {
      return this.$t('workspace.saveAsNotebook')
    } else {
      return this.$t(`workspace.${this.form.type}Create`)
    }
  }

  @Watch('isShow')
  async onDialogShow (newVal, oldVal) {
    // 关闭弹窗时，重置弹窗信息
    if (!newVal && oldVal) {
      setTimeout(() => {
        this.resetModal()
        this.$refs.$form.clearValidate()
      }, 500)
    }
  }

  // 校验参数名称
  async validateName (rule, value, callback) {
    if (!this.isShow) {
      return
    }
    const type = this.form.type === 'workflow' ? 'workflow' : 'notebook'
    if (!value || value.trim() === '') {
      return callback(new Error(`Please input ${type} name`))
    } else if (!notebookNameReg.test(value)) {
      return callback(new Error(this.$t('workspace.nameFormatValidTip')))
    }
    return callback()
  }

  // 关闭弹窗
  closeModal () {
    this.hideModal()
  }

  handleInput (key, value) {
    this.setModalForm({ [key]: value.trim() })
  }

  async handleSubmit () {
    try {
      await this.$refs.$form.validate()
      let params = {
        name: this.form.name.trim(),
        folder_id: this.form.folderId,
        type: this.form.type
      }
      let res = null
      if (this.form.type === 'save-as-notebook') {
        params = {
          name: this.form.name.trim()
        }
        res = await this.saveAsNotebook(params)
      } else {
        res = await this.createNotebook(params)
      }
      const type = this.form.type.includes('notebook') ? 'notebook' : 'workflow'
      const id = res.data.id
      const newNotobookInfo = {
        id,
        name: this.form.name.trim(),
        type,
        uniq: type + '_' + id
      }
      this.callback({ isSubmit: true, newNotobookInfo })

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
