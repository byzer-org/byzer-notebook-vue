
<template>
  <div ref="notebookListRef" class="notebook-list">
    <div class="header">
      <span class="title">{{$t('menu.workspace')}}</span>
      <el-dropdown class="notebook-drop" @command="command => handleWorkspace(command)">
        <span class="el-dropdown-link">
          <i class="el-ksd-icon-add_22 font-22 hasEvent"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="handleCreateFolder">{{$t('folder')}}</el-dropdown-item>
          <el-dropdown-item command="handleCreateNoteBook">{{$t('workspace.notebook')}}</el-dropdown-item>
          <el-dropdown-item command="handleCreateWorkflow">{{$t('workspace.workflow')}}</el-dropdown-item>
          <el-dropdown-item command="handleImport">{{$t('import')}}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="notebook-list-tree" @scroll="scrollTree">
      <el-tree
        ref="notebookTree"
        :data="renderList"
        show-overflow-tooltip
        :props="defaultProps"
        @node-drag-enter="handleDragEnter"
        @node-drop="handleDrop"
        highlight-current
        node-key="uniq"
        @node-click="handleNodeClick"
        draggable
        :allow-drop="allowDrop"
        :allow-drag="allowDrag"
        :default-expanded-keys="expandNotebooks"
        >
        <div class="custom-tree-node has-actions" slot-scope="{ node, data }">
          <span class="node-label">
            <i class="node-label-icon el-ksd-icon-folder_16" v-if="data.children"></i>
            <svg-icon class="node-label-icon" :icon-class="`file_${data.type}_16`" v-else></svg-icon>
              {{ node.label }}{{getEnding(node)}}
          </span>
          <el-dropdown class="node-more node-actions" :style="{'left': treeOffsetWidth + 'px'}" @command="(command) => handleWorkspace(command, node)">
            <span class="el-dropdown-link" @click.stop>
              <el-button class="icon-bg" icon="el-ksd-icon-more_22" type="text" size="small"></el-button>
            </span>
            <el-dropdown-menu slot="dropdown">
              <template v-if="data.id">
                <el-dropdown-item command="changeActiveTab">{{$t('open')}}</el-dropdown-item>
                <el-dropdown-item command="handleRename">{{$t('rename')}}</el-dropdown-item>
                <el-dropdown-item command="handleClone">{{$t('clone')}}</el-dropdown-item>
                <el-dropdown-item command="handleMove">{{$t('move')}}</el-dropdown-item>
                <el-dropdown-item command="handleExport">{{$t('export')}}</el-dropdown-item>
                <el-dropdown-item command="handleDelete">
                  <span class="txt-danger">{{$t('delete')}}</span>
                </el-dropdown-item>
              </template>
              <template v-else>
                <el-dropdown-item command="handleCreateFolder">{{$t('workspace.folderCreate')}}</el-dropdown-item>
                <el-dropdown-item command="handleCreateNoteBook">{{$t('workspace.notebookCreate')}}</el-dropdown-item>
                <el-dropdown-item command="handleCreateWorkflow">{{$t('workspace.workflowCreate')}}</el-dropdown-item>
                <el-dropdown-item command="handleMove">{{$t('move')}}</el-dropdown-item>
                <el-dropdown-item command="handleRename">{{$t('rename')}}</el-dropdown-item>
                <el-dropdown-item command="handleClone">{{$t('clone')}}</el-dropdown-item>
                <el-dropdown-item command="handleDelete" v-if="showDeleteFolderBtn(node)">
                  <span class="txt-danger">{{$t('delete')}}</span>
                </el-dropdown-item>
              </template>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-tree>
    </div>
  </div>
</template>
<script>
import { mapActions, mapState } from 'vuex'
import { Watch, Component, Vue } from 'vue-property-decorator'
import _ from 'lodash'

@Component({
  props: ['isCollapse', 'leftWidth', 'defaultWidth'],
  methods: {
    ...mapActions({
      getNotebookList: 'GET_NOTEBOOK_LIST',
      deleteNotebook: 'DEL_NOTEBOOK',
      getNotebookById: 'GET_NOTEBOOK_BY_ID',
      saveOpenedNotebook: 'SAVE_OPEND_NOTEBOOK',
      getOpenedNotebook: 'GET_OPENED_NOTEBOOK',
      moveNotebook: 'MOVE_NOTEBOOK',
      moveFolder: 'MOVE_FOLDER'
    }),
    ...mapActions('CreateNoteBookModal', {
      callCreateNoteBookModal: 'CALL_MODAL'
    }),
    ...mapActions('CreateFolderModal', {
      callCreateFolderModal: 'CALL_MODAL'
    }),
    ...mapActions('MoveNotebookModal', {
      callMoveNotebookModal: 'CALL_MODAL'
    })
  },
  computed: {
    ...mapState({
      notebookList: state => state.notebook.notebookList,
      openedNotebooks: state => state.notebook.openedNotebooks,
      activeNotebook: state => state.notebook.activeNotebook
    })
  }
})

export default class WorkspaceList extends Vue {
  defaultProps = {
    children: 'children',
    label: 'label',
    id: 'uniq'
  }
  renderList = []
  originalList = []
  nodeScrollWidth = 0
  originalWidth = this.defaultWidth
  @Watch('leftWidth')
  onLeftWidthChange (newVal) {
    this.originalWidth = newVal || this.defaultWidth
  }

  @Watch('activeNotebook', { deep: true })
  onActiveNotebookChange (newVal) {
    if (newVal && newVal.id) {
      const { type, id } = this.activeNotebook
      const uniq = `${type}_${id}`
      this.$refs.notebookTree && this.$refs.notebookTree.setCurrentKey(uniq)
    }
  }
  @Watch('notebookList', { deep: true })
  onNotebookListChange (newVal) {
    this.renderList = _.cloneDeep(newVal)
  }

  get expandNotebooks () {
    if (this.activeNotebook && this.activeNotebook.id) {
      const { type, id } = this.activeNotebook
      const uniq = `${type}_${id}`
      return [uniq]
    }
    return []
  }

  get treeOffsetWidth () {
    return this.originalWidth + this.nodeScrollWidth - 65
  }

  getEnding (node) {
    const { type } = node.data
    if (type === 'notebook') {
      return '.bznb'
    } else if (type === 'workflow') {
      return '.bzwf'
    } else {
      return ''
    }
  }

  showDeleteFolderBtn (node) {
    return !this.hasNotebook(node.data)
  }

  scrollTree (e) {
    const scrollLeft = e.target.scrollLeft
    this.nodeScrollWidth = scrollLeft
  }

  hasNotebook (data) {
    let flag = false
    if (data.children) {
      let hasNotebook = data.children.some(v => v.id)
      if (hasNotebook) {
        flag = hasNotebook
      } else {
        data.children.forEach(v => {
          const has = this.hasNotebook(v)
          if (has) {
            flag = has
          }
        })
      }
    }
    return flag
  }
  handleNodeClick (node) {
    const item = {
      data: node
    }
    this.changeActiveTab(item)
  }
  changeActiveTab (item) {
    if (item.data.id) {
      this.$emit('changeActiveTab', this.getNotebookItem(item))
    }
  }

  handleWorkspace (command, node) {
    this[command](node)
  }
  async handleCreateFolder (node) {
    const folderId = node ? node.data.folder_id : ''
    const { isSubmit } = await this.callCreateFolderModal({targetfolderId: folderId})
    if (isSubmit) {
      this.$message({
        type: 'success',
        message: this.$t('workspace.createSuccess')
      })
      this.$emit('fetchNotebookList')
    }
  }
  handleCreateNoteBook (node) {
    this.$emit('handleCreate', { folder_id: node ? node.data.folder_id : '', type: 'notebook'})
  }
  handleCreateWorkflow (node) {
    this.$emit('handleCreate', { folder_id: node ? node.data.folder_id : '', type: 'workflow'})
  }
  getNotebookItem (node) {
    return {
      name: node.data.label,
      id: node.data.folder_id ? node.data.folder_id : node.data.id,
      type: node.data.type
    }
  }
  handleRename (node) {
    this.$emit('handleRename', this.getNotebookItem(node))
  }
  handleClone (node) {
    this.$emit('handleClone', this.getNotebookItem(node))
  }
  handleDelete (node) {
    this.$emit('handleDelete', this.getNotebookItem(node))
  }
  handleExport (node) {
    this.$emit('handleExport', this.getNotebookItem(node))
  }
  handleImport () {
    this.$emit('handleImport')
  }
  async handleMove (node) {
    const isRoot = Array.isArray(node.parent.data)
    const isMoveFolder = Boolean(node.data.folder_id)
    const params = {
      fileInfo: node.data,
      currentNodeParentInfo: isRoot ? { folder_id: '' } : node.parent.data,
      isMoveFolder
    }
    const { isSubmit } = await this.callMoveNotebookModal(params)
    if (isSubmit) {
      this.$emit('moveComplete')
    }
  }
  handleDragEnter () {
    this.originalList = _.cloneDeep(this.renderList)
  }
  getPath (node) {
    if (node.parent && !Array.isArray(node.parent.data)) {
      return this.getPath(node.parent) + node.parent.data.label + '.' + node.data.label
    } else {
      return node.data.label
    }
  }
  getMoveTip (target_folder_name, move_name, type) {
    const titleType = type === 'notebook' ? this.$t('workspace.notebook') : this.$t('workspace.folder')
    const titleText = titleType.toLowerCase()
    const notebookText = target_folder_name === '' ? this.$t('notebook.moveTipText2', { type: titleText }) : this.$t('notebook.moveTipText1', { type: titleText, folderName: target_folder_name })
    const folderText = target_folder_name === '' ? this.$t('notebook.moveFolderTipText2', { type: titleText }) : this.$t('notebook.moveFolderTipText1', { type: titleText, folderName: target_folder_name })
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
  async handleDrop (draggingNode, dropNode, dropType, event) {
    if (event.x > this.$refs['notebookListRef'].offsetWidth + 30) {
      this.renderList = _.cloneDeep(this.originalList)
      return
    }
    // 移动的目标文件夹中有同名的
    try {
      let moveInfo = null
      let type = draggingNode.data.id ? draggingNode.data.type : 'folder'
      moveInfo = type === 'folder' ? this.moveFolderToFolder(draggingNode, dropNode, dropType) : this.moveNotebookToFolder(draggingNode, dropNode, dropType)
      const { hasExsited, params, target_folder_name } = moveInfo
      if (hasExsited) {
        await this.getMoveTip(target_folder_name, draggingNode.data.label, type)
      }
      if (type === 'folder' && hasExsited) {
        this.renderList = _.cloneDeep(this.originalList)
        return
      }
      type === 'folder' ? await this.moveFolder(params) : await this.moveNotebook(params)
      this.$emit('moveComplete')
    } catch (e) {
      this.renderList = _.cloneDeep(this.originalList)
    }
  }

  moveNotebookToFolder (draggingNode, dropNode, dropType) {
    let targetFolder = ''
    let targetFolderChildren = []
    if (dropType === 'inner') {
      targetFolder = dropNode.data.type === 'folder' ? dropNode.data : dropNode.parent.data
      targetFolderChildren = dropNode.data.children
    } else {
      targetFolder = dropNode.parent.data
      targetFolderChildren = Array.isArray(dropNode.parent.data) ? dropNode.parent.data : dropNode.parent.data.children
    }
    targetFolder = Array.isArray(targetFolder) ? '' : targetFolder
    const { name, type } = draggingNode.data
    let hasExsited = targetFolderChildren.filter(v => v.id && (v.name === name && v.type === type)).length > 1
    const notebookId = draggingNode.data.id
    const currentParentFolder = this.findParentFolder(notebookId, this.originalList, draggingNode.data.type)
    const moveToId = currentParentFolder?.folder_id ?? ''
    if (moveToId === (targetFolder && targetFolder.folder_id)) {
      return
    }
    return {
      hasExsited,
      target_folder_name: targetFolder?.name ?? '',
      params: {
        folder_id: targetFolder?.folder_id ?? '',
        id: notebookId,
        type: draggingNode.data.type
      }
    }
  }

  moveFolderToFolder (draggingNode, dropNode, dropType) {
    let targetFolder = ''
    let targetFolderChildren = []
    if (dropType === 'inner') {
      targetFolder = dropNode.data.type === 'folder' ? dropNode.data : dropNode.parent.data
      targetFolderChildren = dropNode.data.children
    } else {
      targetFolder = dropNode.parent.data
      targetFolderChildren = Array.isArray(dropNode.parent.data) ? dropNode.parent.data : dropNode.parent.data.children
    }
    targetFolder = Array.isArray(targetFolder) ? '' : targetFolder
    let hasExsited = targetFolderChildren.filter(v => v.folder_id && (v.name === draggingNode.data.name)).length > 1
    const currentFolderId = draggingNode.data.folder_id
    const currentParentFolder = this.findParentFolder(currentFolderId, this.originalList, 'folder')
    const moveToId = currentParentFolder?.folder_id ?? ''
    if (moveToId === (targetFolder && targetFolder.folder_id)) {
      return
    }
    return {
      hasExsited,
      target_folder_name: targetFolder?.name ?? '',
      params: {
        target_folder_id: targetFolder?.folder_id ?? '',
        current_folder_id: currentFolderId
      }
    }
  }
  findParentFolder (id, list, type) { // 找到 id 所在的父节点的 folder_id, 如果为空则是根目录下的 id
    if (list && !list.length) {
      return null
    }
    let targetItem = null
    // 先找到节点元素
    if (type !== 'folder') {
      targetItem = list.find(v => (v.children && (v.children.findIndex(child => child.id === id && child.type === type) !== -1)))
    } else {
      targetItem = list.find(v => (v.children && (v.children.findIndex(child => child.folder_id === id) !== -1)))
    }
    if (!targetItem){
      list.find(v => {
        let newItem = v.children && v.children.length && this.findParentFolder(id, v.children)
        if (newItem) {
          targetItem = newItem
        }
      })
    }
    return targetItem
  }
  allowDrop () {
    return true
  }
  allowDrag () {
    return true
  }
}
</script>
<style lang="scss">
@import '../../../assets/css/variable.scss';
.notebook-list {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding-right: 10px;
  .header{
    padding: 16px;
    padding-right: 0;
    line-height: 26px;
    height: 58px;
    display: flex;
    justify-content: space-between;
    .arrow-icon {
      font-size: 24px;
      color: $--color-white;
    }
    .title {
      font-size: 20px;
      font-weight: 600;
      color: $--color-black;
    }
    .icon {
      cursor: pointer;
    }
  }
  &-tree {
    width: 100%;
    position: relative;
    height: calc(100% - 58px);
    overflow: auto;
    .el-tree {
      min-width: 100%;
      position: absolute;
      left: 0;
      top: 0;
      padding-left: 10px;
      padding-bottom: 12px;
      background-color: $--background-color-secondary;
      .el-tree-node__content {
        position: relative;
        &:hover {
          .custom-tree-node {
            .node-actions {
              display: block;
            }
          }
        }
        .custom-tree-node {
          padding-right: 20px;
          .node-label {
            &-icon {
              font-size: 16px;
            }
          }
          .node-actions {
            display: none;
            position: absolute;
            top: 6px;
          }
        }
      }
    }
  }
}
</style>
