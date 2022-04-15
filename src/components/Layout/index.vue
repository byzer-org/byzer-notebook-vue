
<template>
  <div class="layout">
    <page-header></page-header>
    <div class="router-view">
      <div class="container">
        <router-view />
      </div>
    </div>
  </div>
</template>
<script>
import PageHeader from '../Header'
export default {
  data () {
    return {

    }
  },
  components: {
    PageHeader
  }
}
</script>
<style lang="scss" scoped>

.layout {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  .router-view {
    height: calc(100vh - $page-header-height);
    overflow-y: auto;
  }
}
</style>