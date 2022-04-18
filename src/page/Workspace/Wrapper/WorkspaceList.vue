<template>
  <div ref="notebookListRef" class="notebook-list">
    <div class="header">
      <span class="title">{{$t('menu.workspace')}}</span>
      <el-dropdown class="notebook-drop" @command="command => handleWorkspace(command)">
        <span class="el-dropdown-link">
          <i class="el-ksd-icon-add_22 font-22 hasEvent"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-if="!isRunningAll" command="handleCreateFolder">{{$t('folder')}}</el-dropdown-item>
          <el-dropdown-item v-if="!isRunningAll" command="handleCreateNoteBook">{{$t('workspace.notebook')}}</el-dropdown-item>
          <el-dropdown-item v-if="!isRunningAll" command="handleCreateWorkflow">{{$t('workspace.workflow')}}</el-dropdown-item>
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
          <el-menu
            v-if="!(data.folder_id && data.is_demo)"
            class="node-more node-actions"
            :style="{'left': treeOffsetWidth + 'px'}"
            :mode="'horizontal'"
            @select="(command) => handleWorkspace(command, node)"
          >
            <template v-if="data.id">
              <el-submenu
                :popper-class="'node-more-submenu'"
                :index="'node-more'"
              >
                <template slot="title">
                  <el-button
                    class="icon-bg"
                    icon="el-ksd-icon-more_22"
                    type="text"
                    size="small"
                    @click.stop
                  ></el-button>
                </template>
                <el-menu-item
                  :index="'changeActiveTab'"
                >
                  {{ $t('open') }}
                </el-menu-item>
                <el-menu-item
                  v-if="!data.is_demo && !isRunningAll"
                  :index="'handleRename'"
                >
                  {{ $t('rename') }}
                </el-menu-item>
                <el-menu-item
                  v-if="!isRunningAll"
                  :index="'handleClone'"
                >
                  {{ $t('clone') }}
                </el-menu-item>
                <el-menu-item
                  v-if="!data.is_demo"
                  :index="'handleMove'"
                >
                  {{ $t('move') }}
                </el-menu-item>
                <el-submenu
                  :index="$t('export')"
                  :popper-class="'node-more-submenu-child'"
                >
                  <template slot="title">{{ $t('export') }}</template>
                  <el-menu-item
                    :index="'handleExport'"
                  >
                    {{ $t('export') + ' ' + getEnding(node) }}
                  </el-menu-item>
                  <el-menu-item
                    :index="'handleExportByzer'"
                  >
                    {{ $t('export') + ' .byzer' }}
                  </el-menu-item>
                </el-submenu>
                <el-menu-item
                  v-if="!data.is_demo && !isPublished(data)"
                  :index="'handleDelete'"
                >
                  <span class="txt-danger">{{ $t('delete') }}</span>
                </el-menu-item>
              </el-submenu>
            </template>
            <template v-else>
              <el-submenu
                :popper-class="'node-more-submenu'"
                :index="'node-more'"
              >
                <template slot="title">
                  <el-button
                    class="icon-bg"
                    icon="el-ksd-icon-more_22"
                    type="text"
                    size="small"
                    @click.stop
                  ></el-button>
                </template>
                <el-menu-item
                  v-if="!isRunningAll"
                  :index="'handleCreateFolder'"
                >
                  {{ $t('workspace.folderCreate') }}
                </el-menu-item>
                <el-menu-item
                  v-if="!isRunningAll"
                  :index="'handleCreateNoteBook'"
                >
                  {{ $t('workspace.notebookCreate') }}
                </el-menu-item>
                <el-menu-item
                  v-if="!isRunningAll"
                  :index="'handleCreateWorkflow'"
                >
                  {{ $t('workspace.workflowCreate') }}
                </el-menu-item>
                <el-menu-item
                  :index="'handleMove'"
                >
                  {{ $t('move') }}
                </el-menu-item>
                <el-menu-item
                  v-if="!isRunningAll"
                  :index="'handleRename'"
                >
                  {{ $t('rename') }}
                </el-menu-item>
                <el-menu-item
                  v-if="!isRunningAll"
                  :index="'handleClone'"
                >
                  {{ $t('clone') }}
                </el-menu-item>
                <el-menu-item
                  v-if="showDeleteFolderBtn(node)"
                  :index="'handleDelete'"
                >
                  <span class="txt-danger">{{ $t('delete') }}</span>
                </el-menu-item>
                <el-menu-item
                  :index="'handleImportInFolder'"
                >
                  {{ $t('import') }}
                </el-menu-item>
              </el-submenu>
            </template>
          </el-menu>
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
      deleteNotebook: 'DEL_NOTEBOOK',
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
      isRunningAll: state => state.notebook.isRunningAll,
      notebookList: state => state.notebook.notebookList,
      openedNotebooks: state => state.notebook.openedNotebooks,
      activeNotebook: state => state.notebook.activeNotebook,
      demoList: state => state.notebook.demoList
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
      const { uniq } = this.activeNotebook
      this.$refs.notebookTree && this.$refs.notebookTree.setCurrentKey(uniq)
    }
  }
  @Watch('notebookList', { deep: true })
  onNotebookListChange (newVal) {
    this.renderList = _.cloneDeep(newVal)
  }

  get expandNotebooks () {
    if (this.activeNotebook && this.activeNotebook.id) {
      const { uniq } = this.activeNotebook
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
    if (!command) {
      return
    }
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
      type: node.data.type,
      commit_id: node.data.commit_id || '',
      uniq: node.data.uniq
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
  handleExportByzer (node) {
    this.$emit('handleExport', {...this.getNotebookItem(node), output: 'byzer'})
  }
  handleImport () {
    this.$emit('handleImport')
  }
  handleImportInFolder (node) {
    const folderId = node ? node.data.folder_id : ''
    this.$emit('handleImport', folderId)
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
    const notebookUniqId = draggingNode.data.uniq
    const currentParentFolder = this.findParentFolder(notebookUniqId, this.originalList, draggingNode.data.type)
    const moveToId = currentParentFolder?.folder_id ?? ''
    if (moveToId === (targetFolder && targetFolder.folder_id)) {
      return
    }
    return {
      hasExsited,
      target_folder_name: targetFolder?.name ?? '',
      params: {
        folder_id: targetFolder?.folder_id ?? '',
        id: draggingNode.data.id,
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
  findParentFolder (uniq, list, type) { // 找到 uniq 所在的父节点的 folder_id, 如果为空则是根目录下的 uniq
    if (list && !list.length) {
      return null
    }
    let targetItem = null
    // 先找到节点元素
    if (type !== 'folder') {
      targetItem = list.find(v => (v.children && (v.children.findIndex(child => child.uniq === uniq && child.type === type) !== -1)))
    } else {
      targetItem = list.find(v => (v.children && (v.children.findIndex(child => child.uniq === uniq) !== -1)))
    }
    if (!targetItem){
      list.find(v => {
        let newItem = v.children && v.children.length && this.findParentFolder(uniq, v.children)
        if (newItem) {
          targetItem = newItem
        }
      })
    }
    return targetItem
  }
  allowDrop (draggingNode, dropNode) {
    // 如果目标是文件夹则 is_demo 禁止拖入， 否则判读目标文件的父级（文件夹）的 is_demo 属性
    if (dropNode.data.folder_id) {
      return !dropNode.data.is_demo
    } else {
      return !dropNode.parent.data.is_demo
    }
  }
  allowDrag (node) {
    const { commit_id = '', id = '' } = node.data
    const allowDrag = this.demoList.includes(id) ? !commit_id : true
    const isDemoDir = node.data.folder_id && node.data.is_demo
    return isDemoDir ? false : allowDrag
  }
  isPublished (data) {
    return this.demoList.includes(data.id)
  }
}
</script>
<style lang="scss">

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
              visibility: visible;
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
            visibility: hidden;
            position: absolute;
            top: 6px;
            &.el-menu {
              background: none;
            }
            &.el-menu--horizontal {
              border: none;
            }
            .el-menu-item, .el-submenu__title {
              padding: 0 !important;
              width: 26px;
              height: 23px;
              line-height: 23px;
              text-align: center;
              border: none;
              &:hover {
                background: none;
              }
              & > i {
                display: none;
              }
            }
          }
        }
      }
    }
  }
}
.node-more-submenu {
  .el-menu {
    width: fit-content;
    min-width: 72px;
  }
  .el-submenu,
  .el-menu-item {
    padding: 0 20px !important;
    &:hover {
      color: $pattern-blue-300 !important;
      background: $pattern-blue-200;
    }
    &.is-active {
      color: $--color-info !important;
    }
    .el-submenu__icon-arrow.el-icon-arrow-right {
      top: 55%;
      right: 10px;
    }
  }
  .el-submenu {
    padding: 0 !important;
    .el-submenu__title {
      padding: 0 20px;
      color: $--color-info !important;
      &:hover {
        color: $pattern-blue-300 !important;
        background: $pattern-blue-200;
      }
    }
    & > .el-submenu__title .el-submenu__icon-arrow,
    &.is-opened > .el-submenu__title .el-submenu__icon-arrow {
      transform: rotateZ(0);
      transition: 0s;
    }
    .node-more-submenu-child {
      .el-menu-item {
        width: 100%;
        min-width: 72px;
      }
    }
  }
}
</style>
