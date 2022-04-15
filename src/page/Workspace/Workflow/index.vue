<template>
  <div class="notebook-workflow">
    <div class="notebook-workflow-actions">
      <el-dropdown v-if="!isDemo" @command="handleNotebook">
        <span class="el-dropdown-link">
          <i class="el-ksd-icon-document_22 font-22"></i><i class="el-ksd-icon-arrow_down_22 font-22"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command='add'>{{$t('workflow.createWorkflow')}}</el-dropdown-item>
          <el-dropdown-item command='rename'>{{$t('rename')}}</el-dropdown-item>
          <el-dropdown-item command='clone'>{{$t('clone')}}</el-dropdown-item>
          <el-dropdown-item command='delete'>
            <span class="txt-danger">{{$t('workflow.deleteCurrentWorkflow')}}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <span class="ml-15" v-if="!isDemo">
        <icon-btn icon="el-ksd-icon-save_22" :text="$t('workflow.saveAsNotebook')" :handler="saveAsNotebook" />
      </span>
      <SetDemo
        class="set-demo-wrap"
        v-if="userInfo.is_admin && !isDemo"
        :userInfo="userInfo"
        :activeNotebook="activeNotebook"
        @offlineTab="handleOfflineTab"
        @operateDemoSuccess="handleOperateDemoSuccess"
      />
    </div>
    <el-tabs v-model="activeName" class="tabs_button" @tab-click="handleClick">
      <el-tab-pane :label="$t('workspace.notebook')" name="notebook">
        <WorkflowPreview @saveAsNotebook="saveAsNotebook" @cloneWorkflow="cloneWorkflow" v-if="activeName === 'notebook'" />
      </el-tab-pane>
      <el-tab-pane :label="$t('workspace.workflow')" name="workflow">
        <div class="notebook-workflow-container" :class="showNodeEditor && 'right-bar'">
          <div class="notebook-workflow-container-l">
            <el-alert
              v-if="isDemo"
              type="info"
              show-icon>
              <div slot="title">
                {{$t('workflow.readOnlyTip')}}<a href="javascript:;" @click="cloneWorkflow">{{$t('workflow.clone')}}</a>
              </div>
            </el-alert>
            <Workflow
              ref="workflowWrapper"
              :selectNodeId="selectNodeId"
              :needTranformToLeft="needTranformToLeft"
              :showNodeEditor="showNodeEditor"
              :currentNotebook="currentNotebook"
              :activeNotebookId="activeNotebookId"
              @openNodeEditor="openNodeEditor"
              @changeNodeList="changeNodeList"
              :workflowActiveTab="activeName"
            />
          </div>
          <transition name="fade">
            <div class="notebook-workflow-container-r" v-if="showNodeEditor">
              <NodeEditor ref="nodeEditor" :nodeInfo="nodeInfo" @cancelEdit="cancelEdit" />
            </div>
          </transition>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Workflow from './workflow'
import NodeEditor from './components/NodeEditor'
import WorkflowPreview from './components/WorkflowPreview'
import SetDemo from '@/components/SetDemo'
import { Vue, Component } from 'vue-property-decorator'
import { mapActions, mapMutations, mapState, mapGetters } from 'vuex'

@Component({
  props: ['currentNotebook', 'activeNotebookId'],
  components: {
    Workflow,
    NodeEditor,
    WorkflowPreview,
    SetDemo
  },
  computed: {
    ...mapState({
      userInfo: state => state.user.userInfo,
      activeNotebook: state => state.notebook.activeNotebook,
      openedNotebooks: state => state.notebook.openedNotebooks
    }),
    ...mapGetters(['isDemo'])
  },
  methods: {
    ...mapActions('CreateNoteBookModal', {
      callCreateNoteBookModal: 'CALL_MODAL'
    }),
    ...mapMutations({
      setOpenedNotebook: 'SET_OPENED_NOTEBOOK',
      changeActiveNotebook: 'SET_ACTIVE_NOTEBOOK'
    })
  }
})

export default class WorkflowWrapper extends Vue {

  hideDetail = false
  activeName = 'workflow'
  showNodeEditor = false
  nodeInfo = null
  needTranformToLeft = false
  selectNodeId = null
  show = true
  disableSaveToNotebook = false

  changeNodeList (list) {
    this.disableSaveToNotebook = !list.length
  }

  handleOperateDemoSuccess () {
    this.$emit('handleRefresh')
  }

  handleOfflineTab (tabId) {
    this.$emit('handleOfflineTab', tabId)
  }

  openNodeEditor (node) {
    if (node && this.nodeInfo && (node.id === this.nodeInfo.id)) {
      return
    }
    if (!node) {
      this.showNodeEditor = false
      this.nodeInfo = null
      return
    }
    // 需要判断信息是否被修改 如果被修改则提示
    this.$nextTick(() => {
      const type = this.nodeInfo?.type
      const detailIsChanged = this.nodeInfo && this.$refs.nodeEditor?.$refs[`${type}Node`]?.detailIsChanged
      if (detailIsChanged) {
        this.$confirm(this.$t('workflow.changeNodeTip'), this.$t('tip'), {
          confirmButtonText: this.$t('ok'),
          cancelButtonText: this.$t('cancel'),
          type: 'warning',
          customClass: 'centerButton'
        }).then(() => {
          this.confirmOpenNewNode(node)
        })
      } else {
        this.confirmOpenNewNode(node)
      }
    })
  }
  confirmOpenNewNode (node) {
    this.selectNodeId = node.id
    this.showNodeEditor = true
    this.nodeInfo = node
    this.$nextTick(() => { // 为了计算画布是否需要向左移动
      const allWidth = this.$refs.workflowWrapper?.$el.offsetWidth
      const left = Number(node.left.split('px')[0])
      this.needTranformToLeft = allWidth <= left
    })
  }
  handleClick (tab) {
    const { uniq, type } = this.currentNotebook
    const temp = [...this.openedNotebooks]
    const index = temp.findIndex(v => v.uniq === uniq && v.type === type)
    temp[index].isPreviewMode = tab.name === 'notebook'
    this.changeActiveNotebook(temp[index])
    this.setOpenedNotebook(temp)
  }
  changeTabList (newNotebook) {
    this.$emit('changeTabList', newNotebook)
  }
  cancelEdit (needRefresh) {
    this.selectNodeId = null
    this.showNodeEditor = false
    this.nodeInfo = null
    if (needRefresh) {
      // 重新获取 node 信息
      this.$refs.workflowWrapper?.getWorkflowNodeList()
    }
  }
  async saveAsNotebook () {
    const { isSubmit, newNotobookInfo } = await this.callCreateNoteBookModal({type: 'save-as-notebook'})
    const newInfo = {
      ...newNotobookInfo,
      uniq: 'notebook_' + newNotobookInfo.id
    }
    if (isSubmit) {
      this.$message({
        type: 'success',
        message: this.$t('workspace.createSuccess')
      })
      this.changeTabList(newInfo)
    }
  }
  cloneWorkflow () {
    this.handleNotebook('clone')
  }
  handleNotebook (type) {
    let handleName = ''
    switch (type) {
      case 'add':
        handleName = 'handleCreate'
        break
      case 'clone':
        handleName = 'handleClone'
        break
      case 'delete':
        handleName = 'handleDelete'
        break
      case 'rename':
        handleName = 'handleRename'
        break
      default:
        break
    }
    const node = {
      ...this.currentNotebook,
      type: 'workflow'
    }
    this.$emit(handleName, node)
  }
}
</script>

<style lang="scss">

.notebook-workflow {
  width: 100%;
  height: calc(100vh - 100px);
  padding-top: 10px;
  position: relative;
  > .el-tabs.tabs_button > .el-tabs__header {
    margin-left: calc(100% - 20px);
    transform: translateX(-100%);
  }
  &-actions {
    position: absolute;
    display: flex;
    height: 22px;
    left: 30px;
    top: 13px;
    .set-demo-wrap {
      margin-left: 15px;
    }
  }
  &-container {
    width: 100%;
    height: calc(100vh - 150px) ;
    overflow-y: auto;
    border-top: 1px solid $--border-color-light;
    position: relative;
    padding-right: 0px;
    transition: all .2s ease-in;
    &.right-bar {
      padding-right: 400px;
    }
    &-l {
      width: 100%;
      height: 100%;
      background-image: url('../../../assets/images/dot.svg');
    }
    &-r {
      position: absolute;
      right: 0px;
      top: 0;
      width: 400px;
      height: 100%;
      border-left: 1px solid $--border-color-light;
      background-color: $--color-white;
    }
  }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>

