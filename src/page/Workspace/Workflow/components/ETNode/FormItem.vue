<template>
  <div class="form-item-com">
    <el-select :multiple="formItem['value_type'] === 'MULTI_ENUM'" v-if="formItem['value_type'].includes('ENUM')" v-model="ruleForm[formItem.name]" style="width: 100%;" :placeholder="formItem.default_value">
      <el-option :label="item" :value="item" v-for="(item, index) in formItem['enum_values']" :key="index"></el-option>
    </el-select>
    <el-select v-else-if="['INPUT/TABLE', 'INPUT/MODEL'].includes(formItem['value_type'])" v-model="ruleForm[formItem.name]" style="width: 100%;" :placeholder="formItem.default_value">
      <el-option :label="item" :value="item" v-for="(item, index) in inputList" :key="index"></el-option>
    </el-select>
    <el-select
      style="width: 100%;"
      v-else-if="formItem['value_type'] === 'ARRAY'"
      v-model="ruleForm[formItem.name]"
      multiple
      filterable
      allow-create
      :placeholder="formItem.default_value"
      default-first-option>
    </el-select>
    <!-- :duplicate-remove="true" -->
    <el-cascader
      v-else-if="formItem['value_type'] === 'INPUT/HDFS'"
      style="width: 100%;"
      :props="casProps"
      v-model="ruleForm[formItem.name]"
      filterable
      :separator="'/'"
      clearable
    ></el-cascader>
    <div class="form-code-editor" v-else-if="formItem['value_type'] === 'TEXT'" >
      <CodeEditor height="200" v-model="ruleForm[formItem.name]" :isSelected="true" @changeContent="changeContent"/>
    </div>
    <!-- <el-input v-else-if="formItem['value_type'] === 'TEXT'" type="textarea" v-model.trim="ruleForm[formItem.name]" :placeholder="formItem.default_value"></el-input> -->
    <el-input v-else v-model.trim="ruleForm[formItem.name]" style="width: 100%;" :placeholder="formItem.default_value" />
  </div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'
import { mapActions } from 'vuex'
import CodeEditor from '../CodeEditor'

@Component({
  props: ['formItem', 'ruleForm', 'inputList'],
  methods: {
    ...mapActions({
      getFileList: 'GET_FILE_LIST'
    })
  },
  components: {
    CodeEditor
  }
})
export default class FormItem extends Vue {
  tempOption = []
  casProps = {
    lazy: true,
    checkStrictly: true,
    lazyLoad: (node, resolve) => {
      this.getFileListByFolder(node, resolve)
    }
  }
  async getFileListByFolder (node, resolve) {
    const path = node.level === 0 ? '' : node.data.path
    try {
      const res = await this.getFileList(path)
      const list = res.data?.list ?? []
      const fileList = list.map(v => {
        return {
          label: v.name,
          value: v.path,
          path: v.path,
          leaf: v.type === 'file',
          children: []
        }
      })
      resolve(fileList)
    } catch (e) {
      console.log(e)
    }
  }

  changeContent (value) {
    this.$emit('changeSqlEdtorValue', value)
  }
}
</script>

<style lang="scss">

.form-code-editor {
  border: 1px solid #eee;
  border-radius: 4px;
}
</style>

