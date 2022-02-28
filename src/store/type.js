

// global
export const HIDE_ALL_MODALS = 'HIDE_ALL_MODALS'
export const CHANGE_LANG = 'CHANGE_LANG'

// cell actions
export const CHANGE_CELL_LIST = 'CHANGE_CELL_LIST'
export const HANDLE_ADD_CELL = 'HANDLE_ADD_CELL'
export const HADNLE_DELETE_CELL = 'HADNLE_DELETE_CELL'
export const HANDLE_EXCUTE_CELL = 'HANDLE_EXCUTE_CELL'
export const GET_JOB_STATUS = 'GET_JOB_STATUS'
export const CREATE_CELL = 'CREATE_CELL'
export const DELETE_CELL = 'DELETE_CELL'

// notebook list
export const GET_NOTEBOOK_LIST = 'GET_NOTEBOOK_LIST'
export const CREATE_NOTEBOOK_LIST = 'CREATE_NOTEBOOK_LIST'
export const RENAME_NOTEBOOK = 'RENAME_NOTEBOOK'
export const CLONE_NOTEBOOK = 'CLONE_NOTEBOOK'
export const DEL_NOTEBOOK = 'DEL_NOTEBOOK'
export const SAVE_NOTEBOOK = 'SAVE_NOTEBOOK'
export const GET_NOTEBOOK_BY_ID = 'GET_NOTEBOOK_BY_ID'
export const CANCEL_EXCUTE_CELL = 'CANCEL_EXCUTE_CELL'
export const GET_JOB_PROCESS = 'GET_JOB_PROCESS'
export const GET_CURRENT_SCRIPT = 'GET_CURRENT_SCRIPT'
export const SAVE_OPEND_NOTEBOOK = 'SAVE_OPEND_NOTEBOOK'
export const GET_OPENED_NOTEBOOK = 'GET_OPENED_NOTEBOOK'
export const SET_NOTEBOOK_LIST = 'SET_NOTEBOOK_LIST'
export const SET_OPENED_NOTEBOOK = 'SET_OPENED_NOTEBOOK'
export const SET_ACTIVE_NOTEBOOK = 'SET_ACTIVE_NOTEBOOK'
export const SET_DEMO_LIST = 'SET_DEMO_LIST'
export const SET_LOG_MESSAGE_LIST = 'SET_LOG_MESSAGE_LIST'
export const SET_RESULT_LIST = 'SET_RESULT_LIST'
export const CREATE_FOLDER = 'CREATE_FOLDER'
export const MOVE_NOTEBOOK = 'MOVE_NOTEBOOK'
export const MOVE_FOLDER = 'MOVE_FOLDER'
export const DELETE_FOLDER = 'DELETE_FOLDER'
export const RENAME_FOLDER = 'RENAME_FOLDER'
export const CLONE_FOLDER = 'CLONE_FOLDER'
export const IMPORT_NOTEBOOK = 'IMPORT_NOTEBOOK'
export const EXPORT_NOTEBOOK = 'EXPORT_NOTEBOOK'
export const GET_DEFAULT_NOTEBOOK = 'GET_DEFAULT_NOTEBOOK'
export const CLEAR_RESULT = 'CLEAR_RESULT'
export const CHANGE_SIDE_BAR_VISIBLE = 'CHANGE_SIDE_BAR_VISIBLE'
export const CHANGE_NOTEBOOK_MODE = 'CHANGE_NOTEBOOK_MODE'
export const AUTO_COMPLETE = 'AUTO_COMPLETE'
export const SET_DEMO = 'SET_DEMO'
export const OFFLINE_DEMO = 'OFFLINE_DEMO'

// workflow
export const CHANGE_ACTIVE_SIDEBAR = 'CHANGE_ACTIVE_SIDEBAR'
export const CREATE_WORKFLOW = 'CREATE_WORKFLOW'
export const CREATE_WORKFLOW_NODE = 'CREATE_WORKFLOW_NODE'
export const GET_NODE_LIST = 'GET_NODE_LIST'
export const GET_WORKFLOW_PREVIEW = 'GET_WORKFLOW_PREVIEW'
export const SAVE_WORKFLOW_AS_NOTEBOOK = 'SAVE_WORKFLOW_AS_NOTEBOOK'
export const CHECK_MLSQL = 'CHECK_MLSQL'
export const GET_NODE_INFO = 'GET_NODE_INFO'
export const UPDATE_FLOW_NODE = 'UPDATE_FLOW_NODE'
export const SET_CURRENT_DRAG_NODE = 'SET_CURRENT_DRAG_NODE'
export const GET_EXISTING_TABLE = 'GET_EXISTING_TABLE'
export const UPDATE_NODE_POSITION = 'UPDATE_NODE_POSITION'
export const DELETE_WORKFLOW_NODE = 'DELETE_WORKFLOW_NODE'
export const GET_EXISTING_MODEL = 'GET_EXISTING_MODEL'
export const GET_LOAD_PARAMS = 'GET_LOAD_PARAMS'
// et 节点相关
export const GET_ET_LIST = 'GET_ET_LIST'
export const GET_ET_PARAMS = 'GET_ET_PARAMS'
export const GET_ET_DEPENENCY = 'GET_ET_DEPENENCY'
export const SET_NODE_LIST = 'SET_NODE_LIST'

// dialog mutations and actions
export const CALL_MODAL = 'CALL_MODAL'
export const CLOSE_MODAL = 'CLOSE_MODAL'
export const SET_MODAL = 'SET_MODAL'
export const SET_FAILURE_DETAIL = 'SET_FAILURE_DETAIL'
export const SET_TASK_INFO = 'SET_TASK_INFO'
export const SET_DATA = 'SET_DATA'
export const SET_MODAL_FORM = 'SET_MODAL_FORM'
export const SHOW_MODAL = 'SHOW_MODAL'
export const HIDE_MODAL = 'HIDE_MODAL'
export const RESET_MODAL = 'RESET_MODAL'
export const RESET_MODAL_FORM = 'RESET_MODAL_FORM'

// login actions
export const HANDLE_LOGIN = 'HANDLE_LOGIN'
export const HANDLE_SIGN_UP = 'HANDLE_SIGN_UP'
export const HANDLE_LOGOUT = 'HANDLE_LOGOUT'

export const GET_USER_INFO = 'GET_USER_INFO'
export const SET_USER_INFO = 'SET_USER_INFO'
export const CLEAR_USER_INFO = 'CLEAR_USER_INFO'

// global
export const GET_ENV = 'GET_ENV'
export const SET_CURRENT_ENV = 'SET_CURRENT_ENV'

// data catalog
export const GET_DB_LIST = 'GET_DB_LIST'
export const GET_TABLE_LIST = 'GET_TABLE_LIST'
export const UPLOAD_SYSTEM_FILE = 'UPLOAD_SYSTEM_FILE'
export const GET_FILE_LIST = 'GET_FILE_LIST'
export const DELETE_UPLOAD_FILE = 'DELETE_UPLOAD_FILE'

// jobs
export const GET_JOB_LIST = 'GET_JOB_LIST'
export const GET_CODE_BY_ID = 'GET_CODE_BY_ID'
export const DELETE_JOBS = 'DELETE_JOBS'
export const GET_JOB_LOGS = 'GET_JOB_LOGS'

// schedule
export const GET_SCHEDULE_LIST = 'GET_SCHEDULE_LIST'
export const GET_INSTANCE_BY_ID = 'GET_INSTANCE_BY_ID'
export const GET_NOTEBOOK_INFO = 'GET_NOTEBOOK_INFO'
export const GET_INSTANCE_LIST = 'GET_INSTANCE_LIST'
export const SET_SCHEDULE = 'SET_SCHEDULE'
export const UPDATE_SCHEDULE = 'UPDATE_SCHEDULE'
export const RUN_SCHEDULE = 'RUN_SCHEDULE'
export const DELETE_SCHEDULE = 'DELETE_SCHEDULE'
export const TOGGLE_SCHEDULE = 'TOGGLE_SCHEDULE'

// settings
export const GET_ENGINE_LIST = 'GET_ENGINE_LIST'
export const SAVE_CONFIG = 'SAVE_CONFIG'
export const GET_CONFIGS = 'GET_CONFIGS'
export const RESET_TIMEOUT = 'RESET_TIMEOUT'

export const CHECK_CONNECTION = 'CHECK_CONNECTION'
export const GET_CONNECTION_LIST = 'GET_CONNECTION_LIST'
export const CREATE_CONNECTION = 'CREATE_CONNECTION'
export const GET_CONNECTION_TABLE = 'GET_CONNECTION_TABLE'
export const UPDATE_CONNECTION = 'UPDATE_CONNECTION'
export const DELETE_CONNECTION = 'DELETE_CONNECTION'

export const GET_ALGORITHM_LIST = 'GET_ALGORITHM_LIST'
export const GET_PARAM_BY_ID = 'GET_PARAM_BY_ID'
