
<template>
  <div class="cell-excute-result">
    <div class="cell-excute-result-wrapper" ref="resultContainer">
      <div class="container" v-if="status === 'RUNNING'">
        <div class="empty-table">{{$t('nodata')}}</div>
      </div>
      <div class="container" v-else-if="excuteSuccess">
        <div
          class="wrapper not-table"
          v-if="detailType === 'html' || detailType === 'image'"
        >
          <section
            v-for="(detail, index) in detailContent"
            :key="index"
          >
            <iframe
              class="html"
              scrolling="yes"
              v-if="detailType === 'html'"
              :srcDoc="detail"
              onload='javascript:(function(o){o.style.height=o.contentWindow.document.body.scrollHeight + 20 + "px";}(this));'
              style="height:200px;border:none;overflow:hidden;">
            </iframe>
            <img
              class="html"
              v-else
              :src="`data:image/png;base64,${detail}`"
              alt=""
            >
          </section>
        </div>
        <div class="table wrapper" v-else-if="detailType === 'table'">
          <template v-if="tableList.length">
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
            :max-height="innerMaxHeight"
            style="min-width: 100%;">
            <el-table-column
              min-width="200px"
              v-for="col in headerList"
              :key="col.label"
              :formatter="formatterValue"
              :label="col.label"
              :cell-class-name="'cell-test'">
              <template slot-scope="scope">
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
          </template>
          <div class="empty-table" v-else>{{$t('nodata')}}</div>
        </div>
      </div>
      <div class="container failed" :style="{'max-height': innerMaxHeight}" v-else>
        <div class="mb-16">
          <el-tag type="danger" v-if="status==='ERROR'">
            <i class="el-ksd-icon-wrong_fill_16 font16 txt-danger"></i>
            Error
          </el-tag>
        </div>
        <div class="txt-danger">{{root_cause}}</div>
        <div class="failed-btns">
          <el-button type="text" size="small" :icon="showDetail ? 'el-ksd-icon-arrow_up_22' : 'el-ksd-icon-arrow_down_22'" @click="showDetail = !showDetail">
          {{showDetail ? $t('hideDetails') : $t('viewAll')}}
          </el-button>
        </div>
        <div class="failed-details" v-if="showDetail">
          <ul>
            <li class="log-item" v-for="(item, index) in failedMessage" :key="index">{{item}}</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="download-btn" v-if="excuteSuccess && (detailType === 'html' || tableList.length)">
      <el-button v-if="detailType !== 'table'" type="text" icon="el-ksd-icon-view_22" text @click="drawPng">{{$t('notebook.viewLargerImage')}}</el-button>
      <el-tooltip v-if="detailType === 'table'" placement="top" :content="$t('download')">
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
import { hasOwnProperty } from '../../../../util'

@Component({
  props: ['result', 'status', 'innerMaxHeight']
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
  showDetail = false
  root_cause = ''
  detailType = 'table'
  detailContent = []

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

  initData () {
    if (this.status === 'ERROR' || this.status === 'DISCARDED') {
      this.root_cause = this.result.root_cause
      this.failedMessage = this.result.msg && this.result.msg.split('\n') || []
      this.excuteSuccess = false
    } else {
      this.excuteSuccess = this.result.status === '1'
      if (this.result.status !== '0') {
        let parsedResult = this.result && this.result.result ? JSON.parse(this.result.result) : ''
        const schema = (parsedResult.schema?.fields || [])
        const dataList = (parsedResult.data || []).map(item => {
          schema.forEach(s => {
            if (!Object.prototype.hasOwnProperty.call(item, s.name)) {
              item[s.name] = null
            }
          })
          return item
        })
        this.detailType = 'table'
        const isIframeOrImage = dataList.some(i => hasOwnProperty(i, 'mime') && hasOwnProperty(i,'content'))
        if (isIframeOrImage) {
          this.detailType = dataList[0].mime
          this.detailContent = []
          dataList.forEach(item => {
            this.detailContent.push(item.content)
          })
        }
        this.tableList = dataList
        this.pageInfo.page = 1
        this.getRenderList()
      }
    }
  }

  drawPng () {
    const location = this.$router.resolve({ name: 'result', params: { id: this.result.job_id }})
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

.cell-excute-result {
  &-wrapper {
    position: relative;
    &.hide-detail {
      max-height: 200px;
      overflow: hidden;
    }
  }
  .container {
    width: 100%;
    .wrapper {
      .render-list-cell {
        padding-right: 10px;
        max-height: 72px;
        overflow-y: auto;
      }
    }
    &.failed {
      word-wrap: break-word;
      overflow: auto;
      .log-item {
        line-height: 22px;
        color: $--color-text-secondary;
      }
    }
    .not-table {
      padding-top: 20px;
      .html {
        display: block;
        width: 90%;
        margin: 10px auto;
        height: auto;
        box-shadow: 1px 1px 4px rgba(63, 89, 128, 0.16);
        border-top: 1px solid $--border-color-light;
      }
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
    border-top: 1px solid $--border-color-light;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 8.21%, rgba(255, 255, 255, 0.96) 51.88%, #FFFFFF 91.78%);
    &.hide-detail {
      height: 48px;
      padding-top: 15px;
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
