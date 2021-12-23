
<template>
  <el-dialog
    width="400px"
    append-to-body
    :title="$t('workspace.folderCreate')"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible="isShow"
    @close="isShow && closeModal()">
    <div>
      <el-form
        :model="form"
        :rules="rules"
        ref="$form">
        <el-form-item prop="name" :label="$t('workspace.folderName')">
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

vuex.registerModule(['modals', 'CreateFolderModal'], store)
import { notebookNameReg } from '@/config'

@Component({
  computed: {
    ...mapState('CreateFolderModal', {
      isShow: state => state.isShow,
      form: state => state.form,
      callback: state => state.callback,
      targetfolderId: state => state.targetfolderId
    })
  },
  methods: {
    ...mapMutations('CreateFolderModal', {
      hideModal: actionsTypes.HIDE_MODAL,
      setModalForm: actionsTypes.SET_MODAL_FORM,
      resetModal: actionsTypes.RESET_MODAL_FORM
    }),
    ...mapActions({
      createFolder: 'CREATE_FOLDER'
    })
  }
})

export default class CreateFolderModal extends Vue {
  isSubmiting = false
  isValidating = false

  get rules () {
    return {
      name: [
        { required: true, validator: this.validateName, trigger: 'blur' }
      ]
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
    if (!this.isShow) { // 按 enter 提交后再次打开会出现校验失败信息（isShow 为 false后会进入该校验方法）
      return
    }
    if (!value || value.trim() === '') {
      return callback(new Error(this.$t('workspace.nameHolder')))
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

  handleSubmit () {
    if (this.isSubmiting) {
      return false
    }
    this.$refs.$form.validate(async valid => {
      if (valid) {
        this.isSubmiting = true
        try {
          const params = {
            name: this.form.name,
            target_folder_id: this.targetfolderId
          }
          await this.createFolder(params)
          this.callback({ isSubmit: true })

          this.hideModal()
        } catch (e) {
          console.log(e)
        } finally {
          this.isSubmiting = false
        }
      }
    })
  }
}
</script>
<style lang="scss">
</style>
