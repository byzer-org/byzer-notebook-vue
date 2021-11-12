<!--

-->
<template>
  <div class="home-page">
    <div class="home-page-container">
      <div class="home-page-container-item">
        <div class="home-page-container-item-title">Quick Start</div>
        <div class="home-page-container-item-text">Get started with a sample notebook</div>
        <el-button type="primary" @click="gotoNotebook">Explore</el-button>
      </div>
      <div class="home-page-container-item">
        <div class="home-page-container-item-title">Import & Connect Data</div>
        <div class="home-page-container-item-text">Quickly import and connect data</div>
        <el-button type="primary" @click="handleUploadFile">Upload</el-button>
      </div>
      <div class="home-page-container-item">
        <div class="home-page-container-item-title">Create a New Notebook</div>
        <div class="home-page-container-item-text">Create a notebook to start cleaning, processing, visualizing, and modeling your data.</div>
        <el-button type="primary" @click="handleCreateNotebook">Create</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { mapActions } from 'vuex'

@Component({
  methods: {
    ...mapActions('CreateNoteBookModal', {
      callCreateNoteBookModal: 'CALL_MODAL'
    }),
    ...mapActions('FileUploadModal', {
      callFileUploadModal: 'CALL_MODAL'
    }),
    ...mapActions({
      getNotebookList: 'GET_NOTEBOOK_LIST',
      saveOpenedNotebook: 'SAVE_OPEND_NOTEBOOK',
      getOpenedNotebook: 'GET_OPENED_NOTEBOOK',
      getDefaultNotebook: 'GET_DEFAULT_NOTEBOOK'
    }),
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
      this.openedList = res.data?.list ?? []
    } catch (e) {
      console.log(e)
    }
  }

  getToSavedList (newFile) {
    const temp = _.cloneDeep(this.openedList)
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
        active: String((v.id === newFile.id) && (v.type === newFile.type)),
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
@import '../../assets/css/config.scss';
.home-page {
  width: 100%;
  height: calc(100vh - $page-header-height);
  position: relative;
  &-container {
    width: 1000px;
    margin: 0 auto;
    height: 300px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: space-around;
    &-item {
      width: 270px;
      height: 300px;
      text-align: center;
      &:nth-child(2) {
        margin: 0px 50px;
      }
      img {
        display: block;
        width: 100px;
        height: 100px;
        margin: 0 auto;
      }
      &-title {
        line-height: 66px;
        font-size: 24px;
        font-weight: 400;
      }
      &-text {
        line-height: 18px;
        height: 36px;
        font-size: 12px;
        margin-bottom: 15px;
      }
    }
  }
}
</style>