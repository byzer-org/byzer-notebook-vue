
<template>
  <el-dialog
    class="code-dialog"
    width="800px"
    append-to-body
    :title="$t('jobs.viewCode')"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible="isShow"
    @close="isShow && closeModal()">
    <div class="container">
      <el-tooltip placement="top" :content="$t('copy')">
        <i class="hasEvent copy-btn el-ksd-icon-dup_22" type="text" v-clipboard:success="onCopy" v-clipboard:copy="content"></i>
      </el-tooltip>
      <CodeEditor :value="content" :readOnly="true" />
    </div>
    <div slot="footer">
      <el-button type="primary" size="medium" @click="closeModal">{{$t('ok')}}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import { Watch, Component } from 'vue-property-decorator'
import { mapState, mapMutations, mapActions } from 'vuex'
import CodeEditor from '../CodeEditor'

import vuex from '../../store'
import store from './store'

vuex.registerModule(['modals', 'CodeModal'], store)

@Component({
  computed: {
    ...mapState('CodeModal', {
      isShow: state => state.isShow,
      id: state => state.id,
      type: state => state.type
    })
  },
  methods: {
    ...mapMutations('CodeModal', {
      hideModal: 'HIDE_MODAL'
    }),
    ...mapActions({
      getCodeById: 'GET_CODE_BY_ID'
    })
  },
  components: {
    CodeEditor
  }
})

export default class CodeModal extends Vue {
  content = ''
  
  @Watch('isShow') 
  onIsShowChange (newVal) {
    if (!newVal) {
      return
    }
    this.getCode()
  }

  async getCode () {
    try {
      const res = await this.getCodeById(this.id)
      this.content = res.data.content
    } catch (e) {
      console.log(e)
    }
  }

  closeModal () {
    this.hideModal()
  }

  onCopy () {
    this.$message.success(this.$t('copySuccess'))
  }
}
</script>
<style lang="scss">

.code-dialog {
  .progress {
    line-height: 20px;
    padding: 10px;
    padding-top: 0px;
  }
  .container {
    position: relative;
    min-height: 50px;
    max-height: 320px;
    overflow: auto;
    border: 1px solid $--border-color-light;
    box-sizing: border-box;
    border-radius: 6px;
    &:hover {
      .copy-btn {
        display: block;
      }
    }
    .copy-btn {
      display: none;
      font-size: 22px;
      position: absolute;
      right: 20px;
      top: 12px;
      z-index: 2;
    }
  }
}
</style>
