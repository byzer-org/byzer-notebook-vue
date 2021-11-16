
<template>
  <div id="app">
    <Layout />
    <Dialogs />
  </div>
</template>

<script>
import Vue from 'vue'
import Layout from './components/Layout'
import { Component } from 'vue-property-decorator'
import Dialogs from './page/Dialogs/Dialogs'
@Component({
  components: {
    Layout,
    Dialogs
  }
})
export default class App extends Vue {
}
</script>

<style>
</style>
