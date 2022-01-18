<template>
  <el-dialog
    width="400px"
    append-to-body
    :title="$t('workspace.uploadFile')"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible="isShow"
    @close="isShow && closeModal()">
    <el-form ref="$form" :model="form" :rules="rules">
      <el-form-item prop="file" ref="file">
        <el-upload
          class="upload-file"
          drag
          :headers="headers"
          action="/api/upload_file"
          :auto-upload="false"
          :multiple="true"
          :on-change="changeFile"
          :on-remove="handleRemove"
          :fileList="fileList">
          <div class="el-upload__text">{{$t('uploadFileText1')}}<em>{{$t('uploadFileText2')}}</em></div>
        </el-upload>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer-btns">
      <el-button @click="closeModal" size="medium">{{$t('cancel')}}</el-button>
      <el-button type="primary" :loading="loadingSubmit" size="medium" @click="handleSubmit">{{$t('submit')}}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapState, mapMutations, mapActions } from 'vuex'
import { uniqBy } from 'lodash'

import vuex from '../../store/index'
import store from './store'

vuex.registerModule(['modals', 'FileUploadModal'], store)

@Component({
  computed: {
    ...mapState('FileUploadModal', {
      isShow: state => state.isShow,
      form: state => state.form,
      callback: state => state.callback,
      type: state => state.type
    }),
    ...mapState({
      isTrial: state => state.global.is_trial
    })
  },
  methods: {
    ...mapMutations('FileUploadModal', {
      hideModal: 'HIDE_MODAL',
      setModalForm: 'SET_MODAL_FORM',
      resetModal: 'RESET_MODAL_FORM'
    }),
    ...mapActions({
      uploadFile: 'UPLOAD_SYSTEM_FILE',
      uploadNotebook: 'IMPORT_NOTEBOOK'
    })
  }
})

export default class FileUploadModal extends Vue {
  loadingSubmit = false
  fileList = []
  headers = {
    'Content-Type': 'multipart/form-data'
  }

  get rules () {
    return {
      file: [{ required: true, validator: this.validateFile, trigger: 'change' }]
    }
  }

  @Watch('isShow')
  async onDialogShow (newVal, oldVal) {
    // 关闭弹窗时，重置弹窗信息
    if (!newVal && oldVal) {
      this.resetModal()
      this.fileList = []
      this.$refs.$form.clearValidate()
    }
  }
  checkFileSize () {
    return this.fileList.some(v => v.raw.size > 200 * 1024 * 1024)
  }
  checkTotalSize () {
    const sizeList = this.fileList.map(v => v.raw.size)
    let sum = 0
    sizeList.forEach(v => {
      sum += v
    })
    return sum > 500 * 1024 * 1024
  }

  // 校验参数名称
  async validateFile (rule, value, callback) {
    if (!value) {
      return callback(new Error(this.$t('workspace.fileRequired')))
    } else {
      const newList = uniqBy(this.fileList, 'name')
      const isDuplicate = this.fileList.length !== newList.length
      if (isDuplicate) {
        return callback(new Error(this.$t('workspace.validDupFile')))
      } else if (this.isTrial) {
        if (this.checkFileSize()) {
          return callback(new Error(this.$t('workspace.validSingleSize')))
        } else if (this.checkTotalSize()) {
          return callback(new Error(this.$t('workspace.validTotalSize')))
        }
        return callback()
      } else {
        return callback()
      }
    }
  }

  // 关闭弹窗
  closeModal () {
    this.hideModal()
  }

  changeFile (file, fileList) {
    this.fileList = fileList
    this.handleInput('file', this.fileList.map(v => v.raw))
    this.$refs.$form.validateField('file')
  }

  async handleRemove (file) {
    this.fileList = this.fileList.filter(v => v.raw.uid !== file.raw.uid)
    const result = this.fileList.map(v => v.raw)
    this.handleInput('file', result.length ? result : '')
  }

  handleInput (key, value) {
    this.setModalForm({ [key]: value })
  }

  async handleSubmit () {
    try {
      await this.$refs.$form.validate()
      const formData = new FormData()
      this.fileList.forEach(v => {
        formData.append('file', v.raw)
      })
      this.loadingSubmit = true
      await this.uploadFile(formData)
      this.callback({ isSubmit: true })
      this.loadingSubmit = false
      this.closeModal()
    } catch (e) {
      console.log(e)
      this.loadingSubmit = false
    }
  }
}
</script>
<style lang="scss">
.upload-file {
  .el-upload {
    display: block;
    .el-upload-dragger {
      width: 100%;
      height: 100px;
      line-height: 100px;
    }
  }
}
</style>
