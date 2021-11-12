<!--

-->
<template>
  <el-dialog
    width="400px"
    append-to-body
    title="Import Notebook/Workflow"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible="isShow"
    @close="isShow && closeModal()">
    <el-form ref="$form" :model="form" :rules="rules">
      <el-form-item prop="file" ref="file">
        <el-upload
          class="upload-file"
          drag
          accept="*"
          :headers="headers"
          action="/api/file"
          :auto-upload="false"
          :multiple="true"
          :on-change="changeFile"
          :on-remove="handleRemove"
          :fileList="fileList">
          <div class="el-upload__text">{{$t('common.uploadFileText1')}}<em>{{$t('common.uploadFileText2')}}</em></div>
        </el-upload>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer-400">
      <el-button @click="closeModal" size="medium">{{$t('common.cancel')}}</el-button>
      <el-button type="primary" :loading="loadingSubmit" size="medium" @click="handleSubmit">{{$t('common.submit')}}</el-button>
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

vuex.registerModule(['modals', 'ImportNotebookModal'], store)

@Component({
  computed: {
    ...mapState('ImportNotebookModal', {
      isShow: state => state.isShow,
      form: state => state.form,
      callback: state => state.callback,
      type: state => state.type
    })
  },
  methods: {
    ...mapMutations('ImportNotebookModal', {
      hideModal: 'HIDE_MODAL',
      setModalForm: 'SET_MODAL_FORM',
      resetModal: 'RESET_MODAL_FORM'
    }),
    ...mapActions({
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

  // 校验参数名称
  async validateFile (rule, value, callback) {
    if (!value.length) {
      return callback(new Error(this.$t('fileRequired')))
    } else {
      const isValid = value.every(v => v.name.endsWith('.mlnb') || v.name.endsWith('.mlwf'))
      const newList = uniqBy(this.fileList, 'name')
      const isDuplicate = this.fileList.length !== newList.length
      if (!isValid) {
        return callback(new Error(this.$t('validFile')))
      } else if (isDuplicate) {
        return callback(new Error(this.$t('validDupFile')))
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
    this.$refs.$form.validateField('file')
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
      const res = await this.uploadNotebook(formData)
      const activeFile = res.data[0]
      this.callback({ isSubmit: true, newNotobookInfo: activeFile})
      this.loadingSubmit = false
      this.closeModal()
    } catch (e) {
      console.log(e)
      this.loadingSubmit = false
    }
  }
}
</script>
<i18n>
{
  "zh": {
    "fileRequired": "Please upload",
    "validFile": "File must ends with .mlnb or .mlwf",
    "validDupFile": "Please remove duplicate file."
  },
  "en": {
    "fileRequired": "Please upload",
    "validFile": "File must ends with .mlnb or .mlwf",
    "validDupFile": "Please remove duplicate file."
  }
}
</i18n>
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
