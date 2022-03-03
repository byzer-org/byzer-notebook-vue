

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
    <section v-if="is_scheduler_enabled">
      <AddSchedule />
      <SetSchedule />
      <FailureDetail />
      <DAGView />
      <EditTask />
      <CheckAction />
      <CheckSubmit />
    </section>
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
import AddSchedule from '../../components/AddSchedule'
import SetSchedule from '../../components/SetSchedule'
import FailureDetail from '../../components/FailureDetail'
import DAGView from '../../components/DAGView'
import EditTask from '../../components/EditTask'
import CheckAction from '../../components/CheckAction'
import CheckSubmit from '../../components/CheckSubmit'
import { mapState } from 'vuex'

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
    CreateNode,
    AddSchedule,
    SetSchedule,
    FailureDetail,
    DAGView,
    EditTask,
    CheckAction,
    CheckSubmit
  },
  computed: {
    ...mapState({
      is_scheduler_enabled: state => state.global.is_scheduler_enabled
    })
    }
})
export default class Dialogs extends Vue {
}
</script>

<style>
</style>
