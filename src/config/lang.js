export { default } from './lang.json'
export const SpecialCodeSuggestKey = ['.', '/', '`', '\'', '"']

export const PYTHON_PREFIX = '#%'
export const OPENMLDB_PREFIX = '--%'
export const KYLIN_PREFIX = '--%'

export const PythonTag = '#%python'
export const MarkdownTag = '--%markdown'
export const OpenMLDBTag = '--%openmldb'
export const KylinTag = '--%kylin'

export const LANG = {
  BYZER: 'byzer',
  PYTHON: 'python',
  OPENMLDB: 'openmldb',
  KYLIN: 'kylin',
  MARKDOWN: 'markdown'
}

export const LANG_PREFIX = {
  [LANG.PYTHON]: PYTHON_PREFIX,
  [LANG.OPENMLDB]: OPENMLDB_PREFIX,
  [LANG.KYLIN]: KYLIN_PREFIX,
  [LANG.MARKDOWN]: null,
  [LANG.BYZER]: null
}

export const LANG_TAG = {
  [LANG.PYTHON]: PythonTag,
  [LANG.OPENMLDB]: OpenMLDBTag,
  [LANG.KYLIN]: KylinTag,
  [LANG.MARKDOWN]: MarkdownTag,
  [LANG.BYZER]: null
}

export const langList = [
  {label: 'Byzer-lang', value: LANG.BYZER},
  {label: 'Python', value: LANG.PYTHON},
  {label: 'OpenMLDB', value: LANG.OPENMLDB},
  {label: 'Kylin', value: LANG.KYLIN},
  {label: 'Markdown', value: LANG.MARKDOWN }
]


