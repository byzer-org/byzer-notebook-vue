
<template>
  <el-dialog
    width="400px"
    append-to-body
    :title="$t('move')"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible="isShow"
    @close="isShow && closeModal()">
    <div>
      <el-form
        @submit.native.prevent
        :model="form"
        :rules="rules"
        ref="$form">
        <el-form-item prop="folder" :label="$t('notebook.targetFolder')">
          <el-cascader
            style="width: 100%;"
            :props="defaultProps"
            :options="folderList"
            :value="form.folder"
            change-on-select
            :separator="'/'"
            clearable
            @change="value => handleInput('folder', value)">
          </el-cascader>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer-btns">
      <el-button @click="closeModal">{{$t('cancel')}}</el-button>
      <el-button type="primary" :loading="isSubmiting" @click="handleSubmit">{{$t('move')}}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapState, mapMutations, mapActions } from 'vuex'
import _ from 'lodash'

import vuex from '../../store'
import store from './store'

vuex.registerModule(['modals', 'MoveNotebookModal'], store)

@Component({
  computed: {
    ...mapState('MoveNotebookModal', {
      isShow: state => state.isShow,
      form: state => state.form,
      callback: state => state.callback,
      fileInfo: state => state.fileInfo, // 被移动的文件或者文件夹的信息
      currentNodeParentInfo: state => state.currentNodeParentInfo,
      isMoveFolder: state => state.isMoveFolder
    }),
    ...mapState({
      notebookList: state => state.notebook.notebookList
    })
  },
  methods: {
    ...mapMutations('MoveNotebookModal', {
      hideModal: 'HIDE_MODAL',
      setModalForm: 'SET_MODAL_FORM',
      resetModal: 'RESET_MODAL_FORM'
    }),
    ...mapActions({
      moveNotebook: 'MOVE_NOTEBOOK',
      moveFolder: 'MOVE_FOLDER'
    })
  }
})

export default class MoveNotebookModal extends Vue {
  isSubmiting = false
  isValidating = false
  folderList = [{label: 'root', value: ''}]
  defaultProps = {
    value: 'value',
    children: 'children'
  }

  get rules () {
    return {
      folder: [
        { required: true, validator: this.validateName, trigger: 'blur' }
      ]
    }
  }

  @Watch('isShow')
  async onDialogShow (newVal, oldVal) {
    if (!newVal && oldVal) {
      setTimeout(() => {
        this.resetModal()
        this.$refs.$form.clearValidate()
      }, 500)
    }
  }
  @Watch('notebookList', { deep: true })
  onNotebookListChange (newVal) {
    this.$set(this.folderList[0], 'children', this.getFolderList(_.cloneDeep(newVal)))
  }

  getChildrenById (id, list) {
    let value = null
    let ret = recurision(id, list)
    function recurision (id, list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].folder_id === id) {
          value = list[i]
          break
        }
        if (list[i].children) {
          recurision(id, list[i].children)
        }
      }
      return value
    }
    return ret
  }

  getFolderList (list) {
    const temp = list.filter(v => v.children && !v.is_demo)
    temp.forEach(v => {
      if (v.children && !v.is_demo) {
        const list = this.getFolderList(v.children)
        if (list.length === 0) {
          delete v.children
        } else {
          v.children = list
        }
      }
    })
    return temp
  }

  // 校验参数名称
  async validateName (rule, value, callback) {
    if (!value.length) {
      return callback(new Error(this.$t('notebook.selectFolder')))
    } else if (value[value.length - 1] === this.currentNodeParentInfo.folder_id || (this.isMoveFolder && value.includes(this.fileInfo.folder_id))) {
      return callback(new Error(this.$t('notebook.reselectFolder')))
    } else {
      return callback()
    }
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
          const tartget_folder_id = this.form.folder[this.form.folder.length - 1]
          // 目标文件夹中是否含有与被移入文件夹同名的文件
          // 在列表中找到目标文件夹的子级
          // 被移动的是文件夹 ？ 子集中是否含有被移动的文件夹同名的文件夹 ： 子集中是否含有被移动的 notebook 同名的 notebook
          const originList = [{ name: 'root', label: '', folder_id: '', children: this.notebookList }]
          const targetFolderInfo = this.getChildrenById(tartget_folder_id, originList)
          const targetChildren = targetFolderInfo?.children
          const target_folder_name = targetFolderInfo.label
          const name = this.fileInfo.name
          const type = this.fileInfo.type
          let index = -1
          if (this.isMoveFolder) {
            index = targetChildren.findIndex(v => (v.name === name && v.folder_id))
          } else {
            index = targetChildren.findIndex(v => ((v.name === name) && (v.type === type) && v.id))
          }
          if (index !== -1) {
            // 弹出提示框
            await this.getMoveTip(target_folder_name, this.fileInfo.name, this.fileInfo.type)
          }
          let params = null
          if (this.isMoveFolder && index === -1) {
            // 目标文件夹中是否含有与被移入文件夹同名的文件夹
            params = {
              current_folder_id: this.fileInfo.folder_id,
              target_folder_id: tartget_folder_id
            }
            await this.moveFolder(params)
          } else if (this.isMoveFolder && index !== -1) {
            // 移动的是文件夹 并且有重名的 do nothing
            return
          } else {
            params = {
              folder_id: tartget_folder_id,
              id: this.fileInfo.id,
              type: this.fileInfo.type
            }
            await this.moveNotebook(params)
          }
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
  getMoveTip (target_folder_name, move_name, type) {
    const fileType = this.isMoveFolder ? 'folder' : type
    const titleType = this.$t(`workspace.${fileType}`).toLowerCase()
    const notebookText = target_folder_name === '' ? this.$t('notebook.moveTipText2', { type: titleType }) : this.$t('notebook.moveTipText1', { type: titleType, folderName: target_folder_name })
    const folderText = target_folder_name === '' ? this.$t('notebook.moveFolderTipText2', { type: titleType }) : this.$t('notebook.moveFolderTipText1', { type: titleType, folderName: target_folder_name })
    const isMoveFolder = type === 'folder'
    const title = this.$t('notebook.moveTipTitle', { name: move_name })
    const text = isMoveFolder ? folderText : notebookText
    return this.$confirm(text, title, {
      confirmButtonText: isMoveFolder ? this.$t('ok') : this.$t('replace'),
      cancelButtonText: this.$t('cancel'),
      confirmButtonClass: isMoveFolder ? '' : 'el-button--danger',
      showClose: false,
      showCancelButton: !isMoveFolder,
      type: 'warning',
      customClass: 'centerButton'
    })
  }

}
</script>
<style lang="scss">
</style>
