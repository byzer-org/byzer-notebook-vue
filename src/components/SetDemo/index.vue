<template>
  <div v-if="userInfo && userInfo.is_admin && !activeNotebook.commit_id" class="set-demo">
    <div
      v-if="!demoList.includes(activeNotebook.id)"
      class="btn"
    >
      <span class="hasEvent" @click="handleOperateDemo('publish')">
        {{ $t('notebook.setDemo') }}
      </span>
    </div>
    <el-dropdown
      v-if="demoList.includes(activeNotebook.id)"
      class="btn"
      trigger="hover"
      @command="handleOperateDemo"
    >
      <span class="drop-text hasEvent">
        {{ $t('notebook.demoOn') }}
        <i class="el-ksd-icon-arrow_down_22 font-22"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="update">
          {{ $t('notebook.updateDemo') }}
        </el-dropdown-item>
        <el-dropdown-item command="offline">
          {{ $t('notebook.offlineDemo') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapActions, mapState } from 'vuex'
import { Component } from 'vue-property-decorator'
import { FileSuffixMap } from '@/config'

@Component({
  props: {
    userInfo: {
      default: () => ({}),
      type: Object
    },
    activeNotebook: {
      default: () => ({}),
      type: Object
    }
  },
  computed: {
    ...mapState({
      demoList: state => state.notebook.demoList
    })
  },
  methods: {
    ...mapActions({
      setDemo: 'SET_DEMO',
      offlineDemo: 'OFFLINE_DEMO'
    })
  }
})
export default class SetDemo extends Vue {
  /**
   * @param {*} command publish/update/offline
   * @Date: 2022-01-12 16:31:55
   */
  async handleOperateDemo (command) {
    const isOffline = command === 'offline'
    const text = this.$t('notebook.demoText', {
      type: this.$t('notebook.' + command + 'Demo').toLowerCase(),
      fileName:
        this.activeNotebook?.name + FileSuffixMap[this.activeNotebook?.type]
    })
    const title = this.$t('notebook.' + command + 'Demo')

    this.$confirm(text, title, {
      confirmButtonText: title,
      confirmButtonClass: isOffline ? 'el-button--danger' : '',
      cancelButtonText: this.$t('cancel'),
      type: isOffline ? 'error' : 'warning',
      customClass: 'centerButton'
    }).then(async () => {
      const params = {
        entity_id: this.activeNotebook?.id,
        entity_type: this.activeNotebook?.type
      }

      let res = {}
      if (isOffline) {
        res = await this.offlineDemo(params)
        this.$emit('offlineTab', this.activeNotebook?.id)
      } else {
        params.entity_type === 'notebook' ? this.$emit('runAll', { params, setDemo: this.setDemo, command }) : res = await this.setDemo(params)
      }

      if (res?.data === 'success') {
        this.$message.success(this.$t('notebook.' + command + 'Success'))
        this.$emit('operateDemoSuccess')
      }
    })
  }
}
</script>
<style lang="scss">
@import '@/assets/css/variable.scss';
.set-demo {
  display: inline-flex;
  .btn {
    height: 22px;
    margin-right: 15px;
    line-height: 22px;
    .drop-text {
      color: $--color-black;
      i {
        vertical-align: middle;
      }
    }
  }
}
</style>
