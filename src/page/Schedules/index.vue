<template>
  <router-view :key="new Date().getTime()"></router-view>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'

@Component({})
export default class Index extends Vue {}
</script>

<style lang="scss"></style>
