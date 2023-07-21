<template>
  <div
    class="copy-btn code-data-copy"
    @click="copy"
    data-clipboard-action="copy"
    :data-clipboard-text="code"
  >
    <i class="el-icon-document-copy copy-icon"></i>
  </div>
</template>

<script>
import clipboard from 'clipboard'

export default {
  name: 'CodeCopy',
  props: {
   code: {
      type: String,
      default: ''
   }
  },
  methods: {
    copy () {
      const clip = new clipboard('.code-data-copy')
      clip.on('success', () => {
        this.$message.success(this.$t('copySuccess'))
        clip.destroy()
      })
      clip.on('error', () => {
        this.$message.error(this.$t('copyFailed'))
        clip.destroy()
      })
    }
  }

}
</script>

<style scoped lang="scss">
.copy-icon {
  font-size: 16px;
  color: $pattern-grey-100;

  &:hover {
    color: $pattern-blue-400;
  }
}

.copy-btn {
  user-select: none;
  opacity: 1;
  position: absolute;
  right: 15px;
  top: 10px;
  cursor: pointer;
  border-radius: 3px;
  transition: 0.3s;
  background: rgba(255, 255, 255, 0.2);

  &:active {
    background: rgba(253, 253, 253, 0.575);
  }
}
</style>