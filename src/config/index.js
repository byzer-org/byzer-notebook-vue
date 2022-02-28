
export const JOB_STATUS = {
  '-1': 'NEW',
  '0': 'RUNNING',
  '1': 'COMPLETED',
  '2': 'ERROR',
  '3': 'DISCARDED'
}

export const dataTypeList = ['text', 'json', 'csv', 'parquet']
export const saveDataTypeList = ['json', 'csv', 'parquet']
export const dataSourceList = [
  { label: 'JDBC', value: 'jdbc' },
  { label: 'Hive', value: 'hive' },
  { label: 'HDFS', value: 'hdfs' },
  { label: 'Deltalake', value: 'deltalake' }
]
export const notebookNameReg = /^[\u4e00-\u9fa9A-Za-z0-9_]+$/

export const MarkdownTag = '--%markdown'
export const PythonTag = '#%python'
export const SpecialCodeSuggestKey = ['.', '/', '`', '\'', '"']

/**
 * key: file type
 * value: suffix
 */
export const FileSuffixMap = {
  'notebook': '.bznb',
  'workflow': '.bzwf'
}

export const GRAPH_NODE_ATTRS = {
  width: 100,
  height: 26,
  shape: 'vue-shape',
  component: 'graph-node'
}

export const GRAPH_EDGE_ATTRS = {
  line: {
    stroke: '#8B99AE',
    strokeWidth: 2
  }
}
