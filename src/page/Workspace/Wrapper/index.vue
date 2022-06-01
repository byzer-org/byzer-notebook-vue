
<template>
  <div class="notebookPage">
    <div ref="$layout-left" v-show="sideBarVisible" class="layout-left clearfix" :style="layoutLeftStyle">
      <div class="collapse-btn" @click="toggleSideBarVisible">
        <i class="el-icon-arrow-left arrow-icon"></i>
      </div>
      <div class="container-l">
        <div ref="$resize-handler" class="resize-handler" @mousedown="handleStartResize" @mouseup="handleStopResize"></div>
        <WorkspaceList
          :defaultWidth="defaultLeftWidth"
          :leftWidth="layoutStyle.leftWidth"
          :isCollapse="isCollapse"
          @changeActiveTab="changeActiveTab"
          @handleCreate="handleCreateNoteBook"
          @handleRename="handleRename"
          @handleClone="handleClone"
          @handleDelete="handleDelete"
          @handleExport="handleExport"
          @handleImport="handleImport"
          @fetchNotebookList="fetchNotebookList"
          @moveComplete="moveComplete"
          v-show="activeSidebar === 'notebook'"
          />
        <DataCatalog
          :leftWidth="layoutStyle.leftWidth"
          :defaultWidth="defaultLeftWidth"
          v-show="activeSidebar === 'catalog'"
          />
        <WorkflowSide v-if="activeSidebar === 'workflow'" />
      </div>
    </div>
    <div ref="$layout-right" :class="notebookTab.length ? '' : 'nodata'" class="layout-right" :style="layoutRightStyle">
      <div class="container-r" v-loading="loadingList">
        <!-- tab 区 begin -->
        <el-tabs
          v-if="notebookTab.length"
          v-model="curNotebookTab"
          type="card"
          closable
          @tab-remove="confirmCloseTab"
          :before-leave="handleBeforeLeave"
        >
          <!-- :before-leave="handleBeforeLeave" -->
          <!-- @tab-click="handleClickTab" -->
          <el-tab-pane
            :label="tab.name + (tab.type === 'workflow' ? '.bzwf' : '.bznb')"
            :name="tab.uniq"
            v-for="tab in notebookTab"
            :key="'tab_' + (tab.uniq || tab.id) + tab.type">
            <div class="tab-content">
              <CellList
                v-show="tab.type==='notebook'"
                :activeNotebookId="curNotebookTab.split('_')[1]"
                :key="'cellList' + tab.uniq"
                class="tab-content-cells"
                :ref="'cellList' + tab.uniq"
                :currentNotebook="tab"
                :removeTabId="removeTabId"
                @changeTabList="changeTabList"
                @handleRename="handleRename"
                @handleClone="handleClone"
                @handleDelete="handleDelete"
                @handleCreate="handleCreateNoteBook"
                @handleRefresh="handleRefresh"
                @handleOfflineTab="handleOfflineTab"
              />
              <WorkFlow
                v-if="tab.type==='workflow'"
                :key="'workflow_' + tab.uniq"
                :activeNotebookId="curNotebookTab.split('_')[1]"
                :currentNotebook="tab"
                @changeTabList="changeTabList"
                @handleCreate="handleCreateNoteBook"
                @handleRename="handleRename"
                @handleClone="handleClone"
                @handleDelete="handleDelete"
                @handleRefresh="handleRefresh"
                @handleOfflineTab="handleOfflineTab"
                />
            </div>
          </el-tab-pane>
        </el-tabs>
        <!-- tab 区 end -->
        <div class="container-r-nodata" v-else>
          <div class="container-r-nodata-text">{{$t('workspace.createTip')}}</div>
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              <el-button type="default" plain icon="el-ksd-icon-add_22">{{$t('create')}}</el-button>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="'notebook'">{{$t('workspace.notebook')}}</el-dropdown-item>
              <el-dropdown-item :command="'workflow'">{{$t('workspace.workflow')}}</el-dropdown-item>
              <el-dropdown-item :command="'import'">{{$t('import')}}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import WorkspaceList from './WorkspaceList'
import WorkFlow from '../Workflow'
import DataCatalog from '../DataCatalog'
import CellList from '../Notebook/CellList'
import WorkflowSide from '../Workflow/components/SideBar'
import { getDemoList, getCasAndTree } from '@/util'
import _ from 'lodash'
import Sortable from 'sortablejs'
import { getAllList } from '../../../util'
import { FileSuffixMap } from '@/config'

export default {
  data () {
    return {
      notebookList: [],
      notebookTab: [],
      curNotebookTab: '',
      layoutStyle: {
        leftWidth: 0,
        rightWidth: 0
      },
      resizeData: {
        isStartResize: false,
        resizeStartX: 0,
        leftStartWidth: 0,
        rightStartWidth: 0
      },
      isCollapse: false,
      loadingList: false,
      defaultLeftWidth: 268,
      removeTabId: ''
    }
  },
  components: {
    CellList,
    WorkspaceList,
    DataCatalog,
    WorkFlow,
    WorkflowSide
  },
  computed: {
    ...mapState({
      activeSidebar: state => state.notebook.activeSidebar,
      sideBarVisible: state => state.notebook.showSideBar,
      isRunningAll: state => state.notebook.isRunningAll,
      activeNotebook: state => state.notebook.activeNotebook
    }),
    layoutLeftStyle () {
      const { layoutStyle } = this
      return {
        width: layoutStyle.leftWidth ? `${layoutStyle.leftWidth}px` : null
      }
    },
    layoutRightStyle () {
      const { layoutStyle } = this
      return {
        width: layoutStyle.rightWidth ? `${layoutStyle.rightWidth}px` : null
      }
    },
    showLeftList () {
      const width = this.$refs['$layout-left'] && this.$refs['$layout-left'].clientWidth
      return !this.isCollapse || width === 0
    }
  },
  // 路由上携带参数的需要先获取当前 opened list, 再做对比
  // 1 进入页面获取 list 和 tab（tab list 中需要标记哪个是激活的（active））
  // 2 点击 list，tab 中有 修改 active, 没有则 push
  // 3 点击 tab 修改 active
  // 4 获取 保存 获取 tab
  mounted () {
    this.fetchNotebookList()
    addEventListener('mousemove', this.handleResize)
    addEventListener('mouseup', this.handleStopResize)
  },
  methods: {
    ...mapMutations({
      setNotebookList: 'SET_NOTEBOOK_LIST',
      setOpenedNotebook: 'SET_OPENED_NOTEBOOK',
      setActiveNotebook: 'SET_ACTIVE_NOTEBOOK',
      setDemoList: 'SET_DEMO_LIST',
      changeSideBarVisible: 'CHANGE_SIDE_BAR_VISIBLE',
      changeRunningAll: 'CHANGE_RUN_ALL',
      changeShowProgress: 'CHANGE_SHOW_PROGRESS'
    }),
    ...mapActions({
      getNotebookList: 'GET_NOTEBOOK_LIST',
      deleteNotebook: 'DEL_NOTEBOOK',
      deleteFolder: 'DELETE_FOLDER',
      saveOpenedNotebook: 'SAVE_OPEND_NOTEBOOK',
      getOpenedNotebook: 'GET_OPENED_NOTEBOOK',
      exportNotebook: 'EXPORT_NOTEBOOK'
    }),
    ...mapActions('RenameNoteBookModal', {
      callRenameNoteBookModal: 'CALL_MODAL'
    }),
    ...mapActions('CreateNoteBookModal', {
      callCreateNoteBookModal: 'CALL_MODAL'
    }),
    ...mapActions('CloneNoteBookModal', {
      callCloneNoteBookModal: 'CALL_MODAL'
    }),
     ...mapActions('ImportNotebookModal', {
      callImportNotebookModal: 'CALL_MODAL'
    }),
    toggleSideBarVisible () {
      this.changeSideBarVisible(!this.sideBarVisible)
      this.isCollapse = !this.isCollapse
      this.layoutStyle.leftWidth = this.sideBarVisible ? 0 : 268
    },
    handleClickTab (tab) {
      const uniq = tab.name
      const item = this.notebookTab.find(v => v.uniq === uniq)
      this.changeTabList(item, true, true)
    },
    handleBeforeLeave (activeName) {
      return new Promise((resolve, reject) => {
        if (this.isRunningAll) {
          this.$confirm(this.$t('notebook.leaveRunAll'), this.$t('tip'), {
            // confirmButtonText: title,
            cancelButtonText: this.$t('cancel'),
            type: 'warning',
            customClass: 'centerButton'
          }).then(() => {
            this.changeRunningAll(false)
            this.changeShowProgress(false)
            this.handleClickTab({ name: activeName })
            resolve()
          }).catch (() => {
            reject()
          })
        } else {
          resolve()
          this.handleClickTab({ name: activeName })
        }
      })
    },
    changeActiveTab (item) {
      this.changeTabList(item, true)
    },
    arrayIsEqual (arr1, arr2) {
      const temp1 = arr1.map(v => v.content)
      const temp2 = arr2.map(v => v.content)
      if (temp1.length !== temp2.length) {
        return false
      } else {
        for (let i = 0; i < temp1.length; i++) {
          if (temp1[i] !== temp2[i]) {
            return false
          }
        }
        return true;
      }
    },
    confirmCloseTab (tabTypeId) {
      this.removeTabId = tabTypeId
      const list = this.notebookTab.filter(v => v.uniq !== tabTypeId)
      list.length && (list[0].active = true)
      this.minusTabList(list)
    },
    handleCommand (type) {
      if (['notebook', 'workflow'].includes(type)) {
        this.handleCreateNoteBook({type})
      } else {
        this.handleImport()
      }
    },
    async handleCreateNoteBook (data) {
      const { isSubmit, newNotobookInfo } = await this.callCreateNoteBookModal({ folderId: data ? data.folder_id : '', type: data.type})
      if (isSubmit) {
        this.$message({
          type: 'success',
          message: this.$t('workspace.createSuccess')
        })
        this.changeTabList(newNotobookInfo)
      }
    },
    async handleRename (item) {
      const { isSubmit, newNotobookInfo } = await this.callRenameNoteBookModal({ ...item })
      if (isSubmit) {
        this.$message({
          type: 'success',
          message: this.$t('workspace.renameSuccess')
        })
        if (item.type === 'folder') {
          this.fetchNotebookList()
        } else {
          this.changeTabList(newNotobookInfo)
        }
      }
    },
    async handleClone (item) {
      // call clone 弹窗
      const params = {
        ...item,
        name: item.name + '_clone'
      }
      const { isSubmit, newNotobookInfo } = await this.callCloneNoteBookModal(params)
      if (isSubmit) {
        this.$message({
          type: 'success',
          message: this.$t('workspace.cloneSuccess')
        })
        if (item.type === 'folder') {
          this.fetchNotebookList()
        } else {
          this.changeTabList(newNotobookInfo)
        }
      }
    },
   async handleImport (folderId = '') {
      const { isSubmit, newNotobookInfo } = await this.callImportNotebookModal({ folderId })
      if (isSubmit) {
        this.$message.success(this.$t('workspace.importSuccess'))
        this.changeTabList(newNotobookInfo)
      }
    },
    handleExport (params) {
      this.exportNotebook(params).then(res => {
        const disposition = res.headers['content-disposition']
        const fileNameArr = disposition && disposition.split('filename=')
        const filename = fileNameArr.length > 1 && JSON.parse(fileNameArr[1])
        const blob = new Blob([res.data])
        const link = document.createElement('a')
        const url = window.URL.createObjectURL(blob)
        link.href = url
        link.style.display = 'none'
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }).catch(e => {
        console.log(e)
      })
    },
    handleDelete (item) {
      const title = this.$t(`workspace.${item.type}DeleteTitle`)
      const text = this.$t('workspace.confirmDelete', {name: `<strong>${item.name}${FileSuffixMap[item.type]}</strong>`})
      this.$confirm(text, title, {
        confirmButtonText: this.$t('delete'),
        cancelButtonText: this.$t('cancel'),
        confirmButtonClass: 'el-button--danger',
        type: 'warning',
        customClass: 'centerButton',
        dangerouslyUseHTMLString: true
      }).then(() => {
        this.confirmDelete(item)
      }).catch(() => {
      })
      this.$forceUpdate()
    },
    async confirmDelete (item) {
      try {
          let res = null
          if (item.type === 'folder') {
            res = await this.deleteFolder(item.id)
          } else {
            res = await this.deleteNotebook(item)
          }
          if (res) {
            this.$message({
              type: 'success',
              message: this.$t('workspace.deleteSuccess')
            })
            if (item.type === 'folder') {
              this.fetchNotebookList()
            } else {
              if (item.uniq === this.activeNotebook?.uniq) {
                this.changeRunningAll(false)
                this.changeShowProgress(false)
              }
              // 删除成功后，要刷新列表 删除左侧，同时要同步删除右侧的 tab
              let newTabList = this.notebookTab.filter(v => v.uniq !== item.uniq)
              if (newTabList.length && !newTabList.find(v => v.active === 'true')) {
                newTabList[0].active = 'true'
              }
              this.minusTabList(newTabList)
            }
          }
        } catch (e) {
          console.log(e)
        }
    },
    async minusTabList (newTabList) {
      try {
        await this.saveOpenedNotebook({list: newTabList})
        this.fetchNotebookList()
      } catch (e) {
        console.log(e)
      }
    },
    handleOfflineTab (tabId) {
      this.notebookTab = this.notebookTab.filter(tab => tab.id !== tabId  || (tab.id === tabId && !tab.commit_id))

      let activeTab = null
      if (this.notebookTab.length) {
        activeTab = this.notebookTab.find(v => v.id === tabId) || this.notebookTab[0]
      }
      if (activeTab) {
        this.changeRouteParams(activeTab)
      }
    },
    async getNotebookTab () {
      try {
        const res = await this.getOpenedNotebook()
        const list = getAllList(this.notebookList)
        this.notebookTab = (res.data?.list || []).map(v => {
          if (v.commit_id) {
            return { ...list.find(l => l.id  === v.id && l.type === v.type && l.commit_id), active: v.active }
          } else {
            return { ...list.find(l => l.id === v.id && l.type === v.type && !l.commit_id), active: v.active }
          }
        }).filter(i => i.id)
        this.notebookTab = this.notebookTab.map(v => ({ ...v, isPreviewMode: v.isPreviewMode || false, mode: v.isPreviewMode || 'edit'}))
        this.setOpenedNotebook(this.notebookTab)
        let activeTab = null
        if (this.notebookTab.length) {
          activeTab = this.notebookTab.find(v => v.active === 'true' && v.id) || this.notebookTab[0]
        }
        if (activeTab) {
          this.changeRouteParams(activeTab)
        }
        this.setActiveNotebook(activeTab)
        // 获取到tab之后挂载拖拽
        this.$nextTick(() => {
          this.rowDrop()
        })
      } catch (e) {
        console.log(e)
      }
    },
    /**
     * @description 给el-tab增加拖拽功能
     */
    rowDrop () {
      // 拖拽元素的父级dom
      const el = document.querySelector('.el-tabs__nav')
      if (!el) {
        return
      }
      Sortable.create(el, {
        onEnd: ({ newIndex, oldIndex }) => {
          // oldIIndex拖放前的位置， newIndex拖放后的位置
          const currRow = this.notebookTab.splice(oldIndex, 1)[0]; // 鼠标拖拽当前的el-tabs-pane
          this.notebookTab.splice(newIndex, 0, currRow); // notebookTab 是存放所以el-tabs-pane的数组
          // 拖拽完成后保存当前顺序
          this.saveOpenedNotebook({ list: this.setOpenedList() });
        }
      })
    },
    changeRouteParams (item) {
      this.curNotebookTab = item ? `${item.uniq}` : ''
      const params = item ? { uniq: item.uniq, type: item.type } : {}
      this.$router.push({name: 'notebook', params})
    },
    changeTabList (activeNotebook, notNeedGet, tabClicked) {
      activeNotebook['uniq'] = activeNotebook.type + '_' + activeNotebook.id
      if (this.isRunningAll && activeNotebook.uniq !== this.activeNotebook?.uniq) {
        this.$confirm(this.$t('notebook.leaveRunAll'), this.$t('tip'), {
          cancelButtonText: this.$t('cancel'),
          type: 'warning',
          customClass: 'centerButton'
        }).then(() => {
          this.changeRunningAll(false)
          this.changeShowProgress(false)
          this.confirmChangeTabList(activeNotebook, notNeedGet, tabClicked)
        }).catch (() => {})
      } else {
        this.confirmChangeTabList(activeNotebook, notNeedGet, tabClicked)
      }
    },
    /**
     * @param tabClickd 是否为tab项的点击事件，true为真，不需要将当前项移动至数组首位
     */
    async confirmChangeTabList (activeNotebook, notNeedGet, tabClicked) { // 向当前打开的notebook 中新增一个notebook 或者重新打开
      try {
        const temp = _.cloneDeep(this.notebookTab)
        if (!tabClicked) {
          const { id, type, commit_id = ''} = activeNotebook
          activeNotebook['uniq'] = `${type}_${id}${commit_id && `_${commit_id}`}`
          const newNotebook = {
            ...activeNotebook
          }
          temp.unshift(newNotebook)
        }
        const openedList = []
        temp.forEach(v => { // 需要去除掉重复的项（id, type 完全相同才是相同的）
          if (!openedList.find(item => (item.uniq === v.uniq) && (item.type === v.type))) {
            openedList.push(v)
          }
        })
        const toSaveList = openedList.map(v => ({
          ...v,
          active: v.uniq === activeNotebook.uniq
        }))
        await this.saveOpenedNotebook({list: toSaveList})
        notNeedGet ? this.getNotebookTab() : this.fetchNotebookList()
      } catch (e){
        console.log(e)
      }
    },
    getFilteredList (originList) {
      let list = []
      getNewList(originList)
      function getNewList (newList) {
        if (newList.length) {
          newList.forEach(v => {
            if (v.id) {
              list.push(v)
            } else if (v.children) {
              getNewList(v.children)
            }
          })
        }
      }
      return list
    },
    setOpenedList () {
      const list = this.getFilteredList(this.notebookList)
      const temp = this.notebookTab.filter(v => list.findIndex(item => item.uniq === v.uniq) !== -1)
      const hasActive = temp.find(v => v.active === 'true')
      if (!hasActive) {
        temp[0].active = 'true'
      }
      this.notebookTab = temp
      return temp
    },
    moveComplete () { // 先加载 notebookList -> saveOpened -> getOpened
      this.fetchNotebookList(true)
    },
    handleRefresh () {
      this.fetchNotebookList(true)
    },
    async fetchNotebookList (needSaveNewList) {
      try {
        const res = await this.getNotebookList()
        if (res) {
          const list = res.data?.list ?? []
          this.setDemoList(getDemoList(list.filter(l => l.folder_id === '0')))
          this.notebookList = getCasAndTree(list)
          this.setNotebookList(this.notebookList)
          if (needSaveNewList) {
            const needSaveNewList = this.setOpenedList()
            await this.saveOpenedNotebook({ list: needSaveNewList })
          }
          this.getNotebookTab()
        }
      } catch (e) {
        console.log(e)
      }
    },
    handleStartResize (e) {
      const { resizeData } = this
      resizeData.isStartResize = true
      resizeData.resizeStartX = e.pageX
      resizeData.leftStartWidth = this.$refs['$layout-left'].clientWidth
      resizeData.rightStartWidth = this.$refs['$layout-right'].clientWidth
    },
    handleStopResize () {
      const { resizeData } = this

      if (resizeData.isStartResize) {
        resizeData.isStartResize = false
        resizeData.resizeStartX = 0
        resizeData.leftStartWidth = 0
        resizeData.rightStartWidth = 0
      }
    },
    handleResize (e) {
      const { resizeData } = this
      if (resizeData.isStartResize) {
        const offsetX = e.pageX - resizeData.resizeStartX
        const nextLeftWidth = resizeData.leftStartWidth + offsetX
        this.isCollapse = nextLeftWidth <= 0
        if (nextLeftWidth === 0) {
          this.changeSideBarVisible(false)
        }
        if (nextLeftWidth >= 0 && nextLeftWidth <= 400) {
          this.layoutStyle.leftWidth = resizeData.leftStartWidth + offsetX
          this.layoutStyle.rightWidth = resizeData.rightStartWidth - offsetX
        }
      }
    }
  }
}
</script>

<style lang="scss">

.notebookPage {
  width: 100%;
  display: flex;
  height: calc(100vh - $page-header-height);
  .layout-left {
    height: 100%;
    background-color: $--background-color-secondary;
    position: relative;
    width: 268px;
    &:hover {
      .collapse-btn {
       display: block;
      }
    }
    .collapse-btn {
      display: none;
      width: 22px;
      height: 22px;
      line-height: 22px;
      text-align: center;
      position: absolute;
      right: -12px;
      top: 75px;
      z-index: 5;
      border-radius: 50%;
      cursor: pointer;
      color: $--font-color-disabled-base;
      background-color: $--color-white;
      box-shadow: 0px 2px 8px rgba(50, 73, 107, 0.24);
      &:hover {
        color: $--color-white;
        background-color: $--color-primary-light-1;
      }
    }
    .container-l {
      width: 100%;
      height: 100%;
      position: relative;
      background-color: $--background-color-secondary;
    }
    .resize-handler {
      width: 1px;
      height: 100%;
      background-color: $--border-color-light;
      position: absolute;
      user-select: none;
      cursor: ew-resize;
      z-index: 4;
      top: 0px;
      right: 0px;
      &:hover {
        background-color: $--color-primary-light-1;
      }
    }

  }
  .layout-right {
    flex: 1;
    width: 0;
    height: 100%;
    position: relative;
    background-color: $--background-color-secondary;
    padding-top: 15px;
    &.nodata {
      background-color: $--color-white;
      .container-r  {
        margin-top: 0px;
        display: flex;
        justify-content: center;
        align-items: center;
        &-nodata {
          text-align: center;
          color: $--color-info;
          &-text {
            padding-bottom: 16px;
          }
        }
      }
    }
    .container-r {
      width: 100%;
      height: 100%;
      background-color: $--color-white;
      .tab-content {
        &-cells {
          flex: 1;
          height: 100%;
          overflow: hidden;
        }
      }
      & > .el-tabs--card > .el-tabs__header {
        padding: 0 20px;
        margin-bottom: 0px;
      }
    }
  }
}
</style>
