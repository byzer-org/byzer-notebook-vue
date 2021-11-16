

<template>
  <div class="dialogs">
    <CloneNoteBook />
    <RenameNoteBook />
    <CreateNoteBook />
    <FileSystem />
    <ImportNotebook />
    <CodeDialog />
    <CreateFolder />
    <MoveNotebook />
    <CreateConnection />
    <CreateNode />
  </div>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import CloneNoteBook from '../../components/CloneNoteBook/CloneNoteBook'
import CreateNoteBook from '../../components/CreateNoteBook/CreateNoteBook'
import RenameNoteBook from '../../components/RenameNoteBook/RenameNoteBook'
import FileSystem from '../../components/UploadSystemFile'
import ImportNotebook from '../../components/ImportNotebook'
import CodeDialog from '../../components/CodeDialog'
import CreateFolder from '../../components/CreateFolder'
import MoveNotebook from '../../components/MoveNotebook'
import CreateConnection from '../../components/CreateConnection'
import CreateNode from '../../components/CreateNode'

@Component({
  components: {
    CloneNoteBook,
    RenameNoteBook,
    CreateNoteBook,
    FileSystem,
    CodeDialog,
    CreateFolder,
    MoveNotebook,
    ImportNotebook,
    CreateConnection,
    CreateNode
  }
})
export default class Dialogs extends Vue {
}
</script>

<style>
</style>
