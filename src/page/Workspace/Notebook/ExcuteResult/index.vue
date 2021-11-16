
<template>
  <div class="cell-excute-result">
    <div class="cell-excute-result-wrapper" :class="{ 'hide-detail': showBtn && !showDetail, 'pb-48': showBtn }" ref="resultContainer">
      <div class="container" v-if="status === 'RUNNING'">
        <div class="empty-table">No Data</div>
      </div>
      <div class="container" v-else-if="excuteSuccess">
        <div class="wrapper" v-if="detailType === 'html'">
          <iframe
            class="html"
            ref="htmlDom"
            sandbox="allow-scripts"
            :srcDoc="detailContent"
            frameBorder="0"
            scrolling="yes"
          />
        </div>
        <div class="wrapper" v-if="detailType === 'image'">
          <img ref="jobImage" id="jobImage" style="width: 800px;" :src="`data:image/png;base64,${detailContent}`" alt="">
        </div>
        <div class="table wrapper" v-else-if="detailType === 'table' && tableList.length">
          <el-table
            v-if="headerList.length === 1 && headerList[0].prop === 'fileSystem'"
            :data="renderTableList"
            style="width: 100%;">
            <el-table-column
              v-for="col in headerList"
              :key="col.label"
              :prop="col.prop"
              :formatter="formatterValue"
              :label="col.label">
              <template slot-scope="scope">
                <div v-html="scope.row.fileSystem.includes('\n') ? scope.row.fileSystem.replace(/\n/g, '<br />') : scope.row.fileSystem"></div>
              </template>
            </el-table-column>
          </el-table>
          <el-table
            class="render-list"
            v-else
            :data="renderTableList"
            style="width: 100%;">
            <el-table-column
              v-for="col in headerList"
              :key="col.label"
              :formatter="formatterValue"
              :label="col.label"
              :cell-class-name="'cell-test'">
              <template slot-scope="scope">
                <!-- <p class="text-one-ellipse" ><span v-custom-tooltip="{text: scope.row[col.prop], w: 0, tableClassName: 'render-list'}">{{scope.row[col.prop]}}</span></p> -->
                <div class="render-list-cell">
                  {{scope.row[col.prop]}}
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div class="page">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="pageInfo.page"
              :page-sizes="[10, 15, 20]"
              :page-size="15"
              layout="total, prev, pager, next, jumper"
              :total="totalCount">
            </el-pagination>
          </div>
        </div>
        <div class="empty-table" v-else>
          No Data
        </div>
      </div>
      <div class="container failed" v-else>
        <div class="log-item">{{root_cause}}</div>
        <div class="failed-btns">
          <el-button type="text" size="small" :icon="showDetail ? 'el-ksd-icon-arrow_up_22' : 'el-ksd-icon-arrow_down_22'" @click="showDetail = !showDetail">
          {{showDetail ? 'Hide Details' : 'View All'}}
          </el-button>
        </div>
        <div class="failed-details" v-if="showDetail">
          <ul>
            <li class="log-item" v-for="(item, index) in failedMessage" :key="index">{{item}}</li>
          </ul>
        </div>
      </div>
      <div class="btn" v-if="excuteSuccess && showBtn && detailType === 'table'" :class="showDetail ? '' : 'hide-detail'">
        <el-button type="text" size="small" :icon="showDetail ? 'el-ksd-icon-arrow_up_22' : 'el-ksd-icon-arrow_down_22'" @click="showDetail = !showDetail">
        {{showDetail ? 'Hide Details' : 'View All'}}
        </el-button>
      </div>
    </div>
    <div class="download-btn" v-if="excuteSuccess && (detailType === 'html' || tableList.length)">
      <el-button v-if="detailType !== 'table'" type="text" icon="el-ksd-icon-view_22" text @click="drawPng">View larger image</el-button>
      <el-tooltip v-if="detailType === 'table'" placement="top" :content="$t('common.download')">
        <el-button type="text" icon="el-ksd-icon-download_22" @click="exportCSV"></el-button>
      </el-tooltip>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import Vue from 'vue'
import { Watch, Component } from 'vue-property-decorator'
import { saveAs } from 'file-saver'
import { Parser } from 'json2csv'
import moment from 'moment'

@Component({
  props: ['result', 'status']
})

export default class ExcuteResult extends Vue {
  message = ''
  tableList = []
  excuteSuccess = false
  excuteResult = {}
  failedMessage = ''
  pageInfo = {
    size: 15,
    page: 1
  }
  renderTableList = []
  showBtn = false
  showDetail = false
  root_cause = ''
  detailType = 'table'
  detailContent = ''

  get headerList () {
    let keys = []
    this.tableList.forEach(v => {
      keys = keys.concat(Object.keys(v))
    })
    const list = _.uniq(keys)
    return list.map(v => ({prop: v, label: v}))
  }

  get totalCount () {
    return this.tableList.length
  }

  @Watch('result')
  onResultChange () {
    this.initData()
  }

  created () {
    this.initData()
  }
  mounted () {
    this.$nextTick(() => {
      this.getAllHeight()
    })
  }


  getAllHeight () {
    const allHeight = this.$refs.resultContainer && this.$refs.resultContainer.offsetHeight
    this.showBtn = allHeight && allHeight > 200
  }

  initData () {
    if (this.status === 'ERROR' || this.status === 'DISCARDED') {
      this.root_cause = this.result.root_cause
      this.failedMessage = this.result.msg && this.result.msg.split('\n') || []
      this.excuteSuccess = false
    } else {
      this.excuteSuccess = this.result.status === '1'
      if (this.result.status !== '0') {
        let parsedResult = this.result && this.result.result ? JSON.parse(this.result.result) : ''
        const length = parsedResult.length
        this.detailType = 'table'
        if (length === 1) {
          const details = parsedResult[0]
          if (Object.prototype.hasOwnProperty.call(details, 'mime') && Object.prototype.hasOwnProperty.call(details, 'content')) {
            this.detailType = details.mime
            this.detailContent = details.content
          }
        }
        this.tableList = parsedResult
        this.getRenderList()
      }
    }
  }

  drawPng () {
    const location = this.$router.resolve({ name: 'result' })
    window.filter = {
      id: this.result.job_id
    }
    window.open(location.href)
  }
  formatterValue (row, column, cellValue) {
    if (cellValue instanceof Object) {
      return JSON.stringify(cellValue)
    } else {
      return cellValue
    }
  }
  handleSizeChange (val) {
    this.pageInfo.size = val
    this.getRenderList()
  }
  handleCurrentChange (val) {
    this.pageInfo.page = val
    this.getRenderList()
  }
  getRenderList () {
    const { page, size } = this.pageInfo
    const startIndex = (page - 1) * size
    const endIndex = page * size
    this.renderTableList = this.tableList.slice(startIndex, endIndex)
  }

  exportCSV () {
    const filename = `result-${moment(Date.now()).format('yyyy-MM-DD HH:mm:ss')}.csv`
    const parser = new Parser()
    const csvData = parser.parse(this.tableList)
    const blob = new Blob(['\uFEFF' + csvData], {type: 'text/plain;charset=utf-8;'})
    saveAs(blob, filename)
  }

}
</script>
<style lang="scss">
@import '../../../../assets/css/config.scss';
.cell-excute-result {
  &-wrapper {
    position: relative;
    &.hide-detail {
      max-height: 200px;
      overflow: hidden;
    }
  }
  .container {
    height: 100%;
    .wrapper {
      .render-list-cell {
        padding-right: 10px;
        max-height: 72px;
        overflow-y: auto;
      }
    }
    &.failed {
      word-wrap: break-word;
      .log-item {
        line-height: 22px;
        color: $--color-text-secondary;
      }
      .failed-btns {
        padding: 8px 0;
      }
    }
    .html {
      width: 60%;
      height: 300px;
      overflow: auto;
    }
    .empty-table {
      line-height: 40px;
      text-align: center;
      color: $--font-color-disabled-base;
    }
    .download-btn {
      font-size: 22px;
    }
    .page {
      text-align: center;
      margin-top: 15px;
    }
  }
  .btn {
    position: absolute;
    left: 0px;
    bottom: 0px;
    z-index: 10;
    width: 100%;
    height: 32px;
    padding-top: 8px;
    padding-left: 12px;
    border-top: 1px solid $--border-secondary;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 8.21%, rgba(255, 255, 255, 0.96) 51.88%, #FFFFFF 91.78%);
    &.hide-detail {
      height: 48px;
      padding-top: 24px;
      border: none;
    }
  }
  .text-one-ellipse {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>
