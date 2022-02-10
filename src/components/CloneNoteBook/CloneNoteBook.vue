
<template>
  <el-dialog
    width="400px"
    append-to-body
    :title="this.$t(`workspace.${this.form.type}Clone`)"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible="isShow"
    @close="isShow && closeModal()">
    <div>
      <el-form
        :model="form"
        :rules="rules"
        ref="$form">
        <el-form-item prop="name" :label="$t(`workspace.${form.type}Name`)">
          <el-input
            v-model="form.name"
            :placeholder="$t('workspace.nameHolder')"
            @change="value => handleInput('name', value)"
          />
        </el-form-item>
        <el-form-item class="dialog-btns">
          <el-button @click="closeModal" size="medium">{{$t('cancel')}}</el-button>
          <el-button type="primary" :loading="isSubmiting" size="medium" native-type="submit" @click.prevent="handleSubmit">{{$t('clone')}}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapState, mapMutations, mapActions } from 'vuex'

import vuex, { actionsTypes } from '../../store/index'
import store from './store'
import { notebookNameReg } from '@/config'

vuex.registerModule(['modals', 'CloneNoteBookModal'], store)

@Component({
  computed: {
    ...mapState('CloneNoteBookModal', {
      isShow: state => state.isShow,
      form: state => state.form,
      callback: state => state.callback
    })
  },
  methods: {
    ...mapMutations('CloneNoteBookModal', {
      hideModal: actionsTypes.HIDE_MODAL,
      setModalForm: actionsTypes.SET_MODAL_FORM,
      resetModal: actionsTypes.RESET_MODAL_FORM
    }),
    ...mapActions({
      cloneNotebook: 'CLONE_NOTEBOOK',
      cloneFolder: 'CLONE_FOLDER'
    })
  }
})

export default class CloneNoteBookModal extends Vue {
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
    this.setModalForm({ [key]: value })
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
            name: this.form.name.trim(),
            id: this.form.id,
            type: this.form.type,
            commit_id: this.form.commit_id
          }
          let result = null
          if (this.form.type === 'folder') {
            result = await this.cloneFolder(params)
          } else {
            result = await this.cloneNotebook(params)
          }
          const newNotobookInfo = {
            name: params.name,
            id: result.data.id,
            type: params.type
          }
          this.callback({ isSubmit: true, newNotobookInfo })

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
