<template>
  <div class="markdown-body" :style='{padding: "0 10px"}'>
    <VueMarkdown :source="getSource" v-highlight v-copy />
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown'
import 'highlight.js/styles/vs.css';
import 'github-markdown-css/github-markdown-light.css'

export default {
  name: 'Markdown',
  components: {
    VueMarkdown
  },
  props: {
    source: {
      type: String,
      required: true
    }
  },
  computed: {
    getSource () {
      return this.source.replace(/\. /g, '.')
    }
  }
}
</script>

<style lang="scss">
.markdown-body {
  pre {
    padding: 0;
  }
}
.code-copy-added {
  position: relative;
}

pre code.hljs {
  display: block;
  overflow-x: auto;
  padding: 1rem;
}
</style>