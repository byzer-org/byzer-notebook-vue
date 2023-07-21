<template>
  <div class="cell-result-page">
    <section
      class="page-container"
      v-for="(detail, index) in detailContent"
      :key="index"
    >
      <iframe
        class="result-html"
        sandbox="allow-scripts"
        style="width: 100%; height: 100%;"
        v-if="detailType === 'html'"
        :srcDoc="detail"
        frameBorder="0"
        scrolling="yes"
      />
      <img
        class="html"
        v-else-if="detailType === 'image'"
        :src="`data:image/png;base64,${detail}`"
        alt=""
      />
      <Markdown :source="detail"/>
    </section>
  </div>
</template>
<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { mapActions } from 'vuex'
import { hasOwnProperty } from '../../util'
import Markdown from '@/components/Markdown/index.vue'

@Component({
  components: { Markdown },
  methods: {
    ...mapActions({
      getJobStatus: 'GET_JOB_STATUS'
    })
  }
})
export default class IframePage extends Vue {
  excuteResult = ''
  detailType = 'html'
  detailContent = []

  created () {
    this.getStatus(this.$route.params.id)
  }
  
  async getStatus (id) {
    if (!id) {
      return
    }
    try {
      const res = await this.getJobStatus(id)
      const { status, result } = res.data
      if (status === '1') {
        let parsedResult =result && result ? JSON.parse(result) : ''
        const schema = (parsedResult.schema?.fields || [])
        const dataList = (parsedResult.data || []).map(item => {
          schema.forEach(s => {
            if (!Object.prototype.hasOwnProperty.call(item, s.name)) {
              item[s.name] = ''
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
      }
    } catch (err) {
      console.log(err)
    }
  }
}
</script>
<style lang="scss">

.cell-result-page {
  width: 100%;
  height: calc(100vh - $page-header-height);
  .page-container {
    width: 100%;
    height: 100%;
    padding: 20px;
  }
  .result-html {
    margin: 0 auto;
  }
  img {
    max-width: 100%;
  }
}
</style>