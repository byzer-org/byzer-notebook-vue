
<template>
  <div class="notebookWrapper">
    <ul class="notebookWrapper-sidebar">
      <li class="font-16" v-for="tab in tabList" :key="tab.name" :class="sideBarVisible && (activeSidebar===tab.name) && 'active'" @click="changeActiveTab(tab)">
        <i :class="tab.icon" class="prefixIcon22"></i>
      </li>
    </ul>
    <div class="notebookWrapper-container">
      <NotebookContainer ref="notebookContainer" />
    </div>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import NotebookContainer from './Wrapper'
import { Vue, Component, Watch } from 'vue-property-decorator'
@Component({
  components: {
    NotebookContainer
  },
  computed: {
    ...mapState({
      activeNotebook: state => state.notebook.activeNotebook,
      activeSidebar: state => state.notebook.activeSidebar,
      sideBarVisible: state => state.notebook.showSideBar,
      isRunningAll: state => state.notebook.isRunningAll
    })
  },
  methods: {
    ...mapMutations({
      changeActiveSidebar: 'CHANGE_ACTIVE_SIDEBAR',
      changeSideBarVisible: 'CHANGE_SIDE_BAR_VISIBLE',
      changeRunningAll: 'CHANGE_RUN_ALL',
      changeShowProgress: 'CHANGE_SHOW_PROGRESS'
    })
  },
  beforeRouteLeave (to, from, next) {
    if (this.isRunningAll) {
      this.$confirm(this.$t('notebook.leaveRunAll'), this.$t('tip'), {
        // confirmButtonText: title,
        cancelButtonText: this.$t('cancel'),
        type: 'warning',
        customClass: 'centerButton'
      }).then(() => {
        this.changeRunningAll(false)
        this.changeShowProgress(false)
        next()
      })
    } else {
      next()
    }
  }
})

export default class Notebook extends Vue {
  activeName = 'notebook'
  @Watch('activeNotebook')
  onTypeChange (newVal) {
    this.changeActiveSidebar(newVal?.type ?? 'notebook')
  }
  
  mounted () {
    this.changeActiveSidebar(this.activeNotebook ? this.activeNotebook.type : 'notebook')
  }

  get tabList () {
    const list = [
      { name: 'notebook', icon: 'el-ksd-icon-hierarchy_16' },
      { name: 'catalog', icon: 'el-ksd-icon-data_base_16' },
      { name: 'workflow', icon: 'el-ksd-icon-workflow_16' }
    ]
    return list
  }

  changeActiveTab (tab) {
    if (!this.sideBarVisible) {
      this.changeSideBarVisible(true)
    }
    this.changeActiveSidebar(tab.name)
  }
}
</script>
<style lang="scss">

.notebookWrapper {
  width: 100%;
  height: calc(100vh - 48px);
  background-color: $--background-color-secondary;
  &-sidebar {
    width: 32px;
    height: 100%;
    border-right: 1px solid $--border-color-light;
    float: left;
    padding-top: 10px;
    padding-bottom: 10px;
    li {
      height: 48px;
      line-height: 48px;
      text-align: center;
      cursor: pointer;
      &.active {
        border: 1px solid $--border-color-light;
        border-right: 1px solid $--background-color-secondary;
        border-left: 2px solid $--color-primary;
        position: relative;
        &:after {
          content: '';
          display: block;
          width: 1px;
          height: 46px;
          background-color: $--background-color-secondary;
          position: absolute;
          right: -2px;
          top: 0;
        }
      }
    }
  }
  &-container {
    overflow: hidden;
  }
}

</style>