<!--

-->
<template>
  <div class="dataCatalog">
    <div class="header">Data Catalog</div>
    <div class="catalog-wrapper" ref="catalogWrapper" @scroll="scrollTree">
      <el-tree
        class="catalog-tree"
        ref="tableTree"
        :data="dataList"
        node-key="id"
        :highlight-current="true"
        :props="defaultProps"
        :default-expanded-keys="defaultExpandedKeys"
        :load="loadNodeLazy"
        lazy>
        <div class="custom-tree-node" slot-scope="{ node, data }">
          <div class="node-content">
            <i v-if="!node.data.isLeaf" class="font-16 btn-gray" :class="node.data.icon"></i>
            <span :title="node.label">{{ node.label }}</span>
          </div>
          <div class="node-actions" :style="{'left': (treeOffsetWidth - (node.data.upload ? 40 : 0)) + 'px'}">
            <el-tooltip placement="top" :content="$t('common.copy')" v-if="data.id && data.id.includes('Table')">
              <el-button icon="el-ksd-icon-dup_16" size="small" v-clipboard:success="onCopy" v-clipboard:copy="node.label"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" v-else-if="data.id === 'file'" :content="$t('common.upload')" placement="top">
              <el-button icon="el-ksd-icon-add_16" size="mini" @click.stop="uploadFile"></el-button>
            </el-tooltip>
            <span v-else-if="node.data.isLeaf && node.data.id.startsWith('file')">
              <el-tooltip effect="dark" v-if="node.data.upload" :content="$t('common.delete')" placement="top">
                <el-button icon="el-ksd-icon-delete_16" size="mini" @click.stop="deleteFile(node.data)"></el-button>
              </el-tooltip>
              <el-tooltip placement="top" :content="$t('catalog.copyPath')" >
                <el-button icon="el-ksd-icon-dup_16" size="mini" v-clipboard:success="onCopy" v-clipboard:copy="data.path"></el-button>
              </el-tooltip>
            </span>
          </div>
        </div>
      </el-tree>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { mapState, mapActions } from 'vuex'

@Component({
  computed: {
    ...mapState({
      isTrial: state => state.global.is_trial
    })
  },
  methods: {
    ...mapActions({
      getDBList: 'GET_DB_LIST',
      getTables: 'GET_TABLE_LIST',
      getList: 'GET_FILE_LIST',
      deleteUploadFile: 'DELETE_UPLOAD_FILE'
    }),
    ...mapActions('FileUploadModal', {
      callFileUploadModal: 'CALL_MODAL'
    })
  },
  props: ['leftWidth', 'defaultWidth']
})

export default class DataCataLog extends Vue {
  showTree = false
  type = 'hive'
  defaultProps = {
    children: 'children',
    label: 'label',
    isLeaf: 'isLeaf',
    icon: ''
  }
  allDataList = [
    {
      label: 'Hive',
      id: 'hive',
      children: [],
      icon: 'el-ksd-icon-kyligence_16',
      showExpandIcon: true
    },
    {
      label: 'Deltalake',
      id: 'delta',
      children: [],
      icon: 'el-ksd-icon-deltalake_16',
      showExpandIcon: true
    },
    {
      label: 'File System',
      id: 'file',
      children: [],
      icon: 'el-ksd-icon-document_16',
      path: '',
      showExpandIcon: true
    }
  ]
  get dataList () {
    if (this.isTrial) {
      return this.allDataList.filter(v => v.id !== 'hive')
    } else {
      return this.allDataList
    }
  }
  defaultExpandedKeys = []
  nodeScrollWidth = 0
  originalWidth = this.defaultWidth
  nodeHad = []
  resolveHad = null
  @Watch('leftWidth')
  onLeftWidthChange (newVal) {
    this.originalWidth = newVal || this.defaultWidth
  }

  scrollTree (e) {
    this.nodeScrollWidth = e.target.scrollLeft
  }

  get treeOffsetWidth () {
    return this.originalWidth + this.nodeScrollWidth - 55
  }

  getTextWidth (str, fontSize) {
    let result = 10
    let ele = document.createElement('span')
    ele.innerText = str
    ele.style.fontSize = fontSize
    document.documentElement.append(ele)
    result = ele.offsetWidth
    document.documentElement.removeChild(ele)
    return result
  }

  loadNodeLazy (node, resolve) {
    if (node.level === 0) {
      this.nodeHad = node
      this.resolveHad = resolve
      return resolve(this.dataList)
    } else if (node.level === 1) {
      this.type = node.data.id
      this.type !== 'file' ? this.getDatabaseList(resolve) : this.getFileListByFolder(node.data, resolve)
    } else {
      if (node.data.id.startsWith('file')) {
        this.getFileListByFolder(node.data, resolve)
      } else {
        this.getTableList(node.data, resolve)
      }
    }
  }
  requestNewData () {
    this.nodeHad.childNodes = []
    this.loadNodeLazy(this.nodeHad, this.resolveHad)
  }
  async deleteFile (data) {
    try {
      await this.$confirm(this.$t('deleteText'), this.$t('deleteTitle'), {
        confirmButtonText: this.$t('common.ok'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning',
        centerButton: true
      })
      await this.deleteUploadFile(data.label)
      this.requestNewData()
    } catch (e) {
      console.log(e)
    }
  }
  async getFileListByFolder (data, resolve) {
    try {
      const res = await this.getList(data.path)
      const list = res.data?.list ?? []
      const fileList = list.map((v, i) => {
        return {
          label: v.name,
          path: v.path,
          id: 'file' + v.name + i,
          isLeaf: v.type === 'file',
          showExpandIcon: v.type !== 'file',
          upload: v.upload,
          children: [],
          icon: ''
        }
      })
      resolve(fileList)
    } catch (e) {
      resolve([])
      console.log(e)
    }
  }
  async getDatabaseList (resolve) {
    try {
      let res = await this.getDBList(this.type)
      const list = res.data?.list ?? []
      const databaseList = list.map((v, i) => {
        return {
          label: v,
          id: this.type + i,
          children: [],
          icon: 'el-ksd-icon-data_base_16',
          showExpandIcon: true
        }
      })
      resolve(databaseList)
    } catch (e) {
      resolve([])
    }
  }

  async uploadFile () {
    const { isSubmit } = await this.callFileUploadModal({})
    if (isSubmit) {
      // this.defaultExpandedKeys = ['file']
      this.requestNewData()
    }
  }
  async getTableList (data, resolve) {
    let params = {
      db_type: this.type,
      database: data.label
    }
    try {
      const res = await this.getTables(params)
      const list = res.data?.list ?? []
      const tableList = list.map((v, i) => {
        return {
          label: v,
          id: data.label + '_Table' + i,
          isLeaf: true,
          children: []
        }
      })
      resolve(tableList)
      // this.$refs.tableTree && this.$refs.tableTree.setCurrentKey(`${data.label}_Table0`)
    } catch (e) {
      resolve([])
    }
  }

  onCopy () {
    this.$message.success(`Successfully Copied`)
  }
}
</script>
<i18n>
{
  "zh":{},
  "en":{
    "deleteTitle": "Delete File",
    "deleteText": "Are you sure you want to delete this file? Please note this action can’t be reverted."
  }
}
</i18n>
<style lang="scss">
@import '../../../assets/css/config.scss';
.dataCatalog {
  width: 100%;
  height: 100%;
  padding-right: 10px;
  .header {
    padding: 0 16px;
    padding-right: 0;
    line-height: 58px;
    height: 58px;
    overflow: hidden;
    font-size: 20px;
    font-weight: 600;
    color: $--color-black;
  }
  .catalog-wrapper {
    width: 100%;
    height: calc(100% - 58px);
    padding-right: 10px;
    overflow: auto;
    background-color: $--background-color-secondary;
    position: relative;
    .btn-gray {
      color: $--color-text-disabled;
      margin-right: 2px;
    }
    .el-tree {
      min-width: 100%;
      padding-bottom: 10px;
      position: absolute;
      left: 0;
      top: 0;
      padding-left: 10px;
      background-color: $--background-color-secondary;
      overflow-x: auto;
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
          .node-actions {
            display: none;
            position: absolute;
            top: 7px;
          }
        }
      }
    }
  }
}
</style>