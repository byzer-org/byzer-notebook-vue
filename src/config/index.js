
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
  'workflow': '.bzwf',
  'folder': ''
}

export const GRAPH_NODE_ATTRS = {
  width: 32,
  height: 32,
  zIndex: 10,
  shape: 'vue-shape',
  component: 'graph-node'
}

export const GRAPH_EDGE_ATTRS = {
  zIndex: 9,
  line: {
    stroke: '#A5B2C5',
    strokeWidth: 2
  }
}

export const Darge_Layout_ATTRS = {
  type: 'dagre',
  rankdir: 'LR',
  align: 'UL',
  ranksep: 50,
  nodesep: 15,
  controlPoints: true
}

// dolphin 给的状态
export const INSTANCE_STATE = {
  '0': 'RUNNING_EXECUTION',
  '1': 'READY_PAUSE',
  '2': 'PAUSE',
  '3': 'READY_STOP',
  '4': 'STOP',
  '5': 'FAILURE',
  '6': 'SUCCESS',
  '7': 'KILL',
  '8': 'WAITING_THREAD',
  '9': 'WAITING_DEPEND',
  '10': 'NEED_FAULT_TOLERANCE'
}

// dolphin 给的状态对应的国际化的 key
export const INSTANCE_STATE_MAP = {
  [INSTANCE_STATE['0']]: 'running',
  [INSTANCE_STATE['1']]: 'ready_pause',
  [INSTANCE_STATE['2']]: 'pause',
  [INSTANCE_STATE['3']]: 'ready_stop',
  [INSTANCE_STATE['4']]: 'stop',
  [INSTANCE_STATE['5']]: 'failure',
  [INSTANCE_STATE['6']]: 'success',
  [INSTANCE_STATE['7']]: 'stop',
  [INSTANCE_STATE['8']]: 'waiting',
  [INSTANCE_STATE['9']]: 'waiting',
  [INSTANCE_STATE['10']]: 'waiting'
}

// 不同状态对应的操作
// 
// 接口参数的映射对应操作类型
// 1: RECOVER_SUSPENDED_PROCESS       继续运行暂停的任务
// 2: START_FAILURE_TASK_PROCESS      运行失败的任务
// 3: REPEAT_RUNNING                  重新运行
// 4: PAUSE                           暂停
// 5: STOP                            停止
// 
// ACTION_OF_STATE 格式
// key    [暂停操作，继续操作，停止操作，重新运行操作]   对应操作栏 4 个 icon 的顺序
// state: [pause, resume, stop, repeat running]
export const ACTION_OF_STATE = {
  [INSTANCE_STATE['0']]: [4, 0, 5, 0],
  [INSTANCE_STATE['1']]: [0, 0, 0, 0],
  [INSTANCE_STATE['2']]: [0, 1, 0, 3],
  [INSTANCE_STATE['3']]: [0, 0, 0, 0],
  [INSTANCE_STATE['4']]: [0, 0, 0, 0],
  [INSTANCE_STATE['5']]: [0, 2, 0, 3],
  [INSTANCE_STATE['6']]: [0, 0, 0, 0],
  [INSTANCE_STATE['7']]: [0, 0, 0, 0],
  [INSTANCE_STATE['8']]: [0, 0, 5, 0],
  [INSTANCE_STATE['9']]: [0, 0, 5, 0],
  [INSTANCE_STATE['10']]: [0, 0, 5, 0]
}

export const ENGINE_STATUS = {
  0: 'unavailable',
  2: 'available'
}