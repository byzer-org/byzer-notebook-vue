<!--

-->

<template>
  <div class="workflow-preview" v-loading="isLoading">
    <el-alert
      type="info"
      show-icon>
      <div slot="title">
        Read Only. To edit it further, click <a href="javascript:;" :class="!this.cellList.length && 'disabled-style is-disabled'" @click="saveAsNotebook">Save As Notebook</a>
      </div>
    </el-alert>
    <ul class="workflow-preview-cell-list">
      <li 
        v-for="(cell, index) in cellList"
        @click="selectIndex = index"
        :key="index">
        <div class="cell-order"><div class="cell-order-text">Cell {{index + 1}}</div></div>
        <div class="box" :class="selectIndex === index && 'active'">
          <CodeEditor 
            :readOnly="true"
            :value="cell.content"
            />
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import CodeEditor from '@/components/CodeEditor'
import { mapState, mapActions } from 'vuex'
import { Vue, Component } from 'vue-property-decorator'
@Component({
  components: {
    CodeEditor
  },
  computed: {
    ...mapState({
      activeNotebook: state => state.notebook.activeNotebook
    })
  },
  methods: {
    ...mapActions({
      getWorkflowPreview: 'GET_WORKFLOW_PREVIEW'
    })
  }
})
export default class WorkflowPreview extends Vue {
  
  cellList = []
  selectIndex = -1
  isLoading = false

  mounted () {
    this.loadCellList()
  }
    
  async loadCellList () {
    try {
      const res = await this.getWorkflowPreview(this.activeNotebook.id)
      this.loadingList = false
      this.cellList = res.data.cell_list || []
    } catch (e) {
      this.loadingList = false
      console.log(e)
    }
  }
  saveAsNotebook () {
    if (this.cellList.length) {
      this.$emit('saveAsNotebook')
    }
  }
}
</script>
<style lang="scss">
@import '../../../../../assets/css/config.scss';
.workflow-preview {
  width: 100%;
  background-color: $--color-white;
  &-cell-list {
    height: calc(100vh - 48px - 110px);
    padding-bottom: 50vh;
    overflow-y: auto;
    li {
      margin-top: 12px;
      background-color: $--color-white;
      position: relative;
      padding-left: 48px;
      padding-right: 72px;
      .cell-order {
        width: 100%;
        color: $--color-info-secondary;
        padding-bottom: 4px;
        &-text {
          display: inline-block;
          font-size: 12px;
          transform: scale(0.75);
        }
      }
      .box {
        position: relative;
        border-radius: 4px;
        min-height: 60px;
        padding: 8px;
        padding-left: 16px;
        border: 1px solid $--border-secondary;
        &:hover {
          box-shadow: 0px 1px 4px rgba(63, 89, 128, 0.16);
        }
        &.active {
          padding-left: 8px;
          border: 1px solid $--color-primary;
          border-left: 8px solid $--color-primary;
          &:hover {
            box-shadow: 0px 1px 4px rgba(63, 89, 128, 0.16);
          }
        }
      }
    }
  }
}
</style>