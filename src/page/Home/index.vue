<template>
  <div class="home-page">
    <div class="home-page-container">
      <div class="home-page-container-item">
        <div class="home-page-container-item-title">{{$t('home.quick_start')}}</div>
        <div class="home-page-container-item-text">{{$t('home.quick_start_desc')}}</div>
        <el-button class="mt-15" type="primary" @click="gotoNotebook">{{$t('home.explore')}}</el-button>
      </div>
      <div class="home-page-container-item">
        <div class="home-page-container-item-title">{{$t('home.upload_data')}}</div>
        <div class="home-page-container-item-text">{{$t('home.upload_data_desc')}}</div>
        <el-button class="mt-15" type="primary" @click="handleUploadFile">{{$t('home.upload')}}</el-button>
      </div>
      <div class="home-page-container-item">
        <div class="home-page-container-item-title">{{$t('home.create_notebook')}}</div>
        <div class="home-page-container-item-text">{{$t('home.create_notebook_desc')}}</div>
        <el-button class="mt-15" type="primary" @click="handleCreateNotebook">{{$t('home.create')}}</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { mapActions, mapState } from 'vuex'
import { cloneDeep } from 'lodash'
import { getAllList } from '../../util'

@Component({
  computed: {
    ...mapState({ notebookList: state => state.notebookList })
  },
  methods: {
    ...mapActions('CreateNoteBookModal', {
      callCreateNoteBookModal: 'CALL_MODAL'
    }),
    ...mapActions('FileUploadModal', {
      callFileUploadModal: 'CALL_MODAL'
    }),
    ...mapActions({
      saveOpenedNotebook: 'SAVE_OPEND_NOTEBOOK',
      getOpenedNotebook: 'GET_OPENED_NOTEBOOK',
      getDefaultNotebook: 'GET_DEFAULT_NOTEBOOK'
    })
  }
})
export default class HomePage extends Vue {
  defaultNotebook = null
  openedList = []

  created () {
    this.fetchNotebookList()
  }

  getTargetNotebook (arr) {
    let targetItem = arr.find(v => v.name === 'baize_quickstart' && v.id)
    if (!targetItem) {
      arr.forEach(v => {
        if (v.list) {
          let newTarget = this.getTargetNotebook(v.list)
          if (newTarget) {
            targetItem = newTarget
          }
        }
      })
    }
    return targetItem
  }
  async fetchNotebookList () {
    try {
      const res = await this.getOpenedNotebook()

      const list = getAllList(this.notebookList || [])
      this.openedList = (res.data?.list || []).map(v => {
        if (v.commit_id) {
          return { ...list.find(l => l.id === v.id && l.type === v.type && l.commit_id), active: v.active }
        } else {
          return { ...list.find(l => l.id === v.id && l.type === v.type && !l.commit_id), active: v.active }
        }
      }).filter(i => i.id)
    } catch (e) {
      console.log(e)
    }
  }

  getToSavedList (newFile) {
    const temp = cloneDeep(this.openedList)
    temp.unshift(newFile)
    const temp1 = []
    temp.forEach(v => {
      if (!temp1.find(item => (item.name === v.name) && (item.id === v.id) && (item.type === v.type))) {
        temp1.push(v)
      }
    })
    const toSaveList = temp1.map(v => {
      return {
        ...v,
        active: String((v.id === newFile.id) && (v.type === newFile.type))
      }
    })
    return toSaveList
  }
  // 先获取当前系统中打开的文件列表, explore 时获取默认文件， 创建是拿到新创建的 notebook  然后再进行存储
  async gotoNotebook () {
    try {
      const defaultNotebook = await this.getDefaultNotebook()
      this.defaultNotebook = defaultNotebook.data
      if (this.defaultNotebook) {
        const { type, id, commit_id } = this.defaultNotebook
        const uniq = type + '_' + id
        this.defaultNotebook = {
          ...this.defaultNotebook,
          uniq: commit_id ? uniq + '_' + commit_id : uniq
        }
        const newList = this.getToSavedList(this.defaultNotebook)
        await this.saveOpenedNotebook({list: newList})
      }
      this.$router.push({name: 'notebook'})
    } catch (e) {
      console.log(e)
    }

  }

  async handleCreateNotebook () {
    const { isSubmit, newNotobookInfo } = await this.callCreateNoteBookModal({ folderId: '', type: 'notebook'})
    if (isSubmit) {
      const newList = this.getToSavedList(newNotobookInfo)
      await this.saveOpenedNotebook({list: newList})
      this.$router.push({name: 'notebook'})
    }
  }
  async handleUploadFile () {
    const { isSubmit } = await this.callFileUploadModal()
    if (isSubmit) {
      this.$router.push({name: 'notebook'})
    }
  }
}
</script>
<style lang="scss">

.home-page {
  width: 100%;
  height: calc(100vh - $page-header-height);
  display: flex;
  justify-content: center;
  align-items: center;
  &-container {
    width: 1000px;
    height: 300px;
    display: flex;
    justify-content: space-around;
    &-item {
      flex: 1;
      padding: 0 20px;
      height: 200px;
      text-align: center;
      &-title {
        height: 66px;
        font-size: 24px;
        font-weight: 400;
      }
      &-text {
        line-height: 18px;
        height: 36px;
        font-size: 12px;
      }
    }
  }
}
</style>
