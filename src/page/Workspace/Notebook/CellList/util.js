import langConfig from '@/config/lang.json'
import { LANG_PREFIX, LANG_TAG, LANG } from '@/config/lang'

export function getDefaultConfig (lang) {
  const config = langConfig[lang]
  const prefix = LANG_PREFIX[lang]
  const tag = LANG_TAG[lang]
  let str = ''
  let obj = {}
  if (tag) {
    str = `${tag}`
    const keys = Object.keys(config)
    keys.forEach(key => {
      obj[key] = config[key].default
      str += `\n${prefix}${key}=${config[key].default}`
    })
  }
  return { configStr: tag ? str + '\n' : str, config: obj}
}

// 获取 cell 的配置， 根据前缀截取 前面几个
export function getCellConfig (cell) {
  const { editType } = cell
  const prefix = LANG_PREFIX[editType]
  if (!prefix) return ''
  const tag = LANG_TAG[editType]
  const content = cell.content.split('\n')
  const newContent = content.filter((item, index) => {
    const prevItem = content[index - 1]
    return item.startsWith(prefix) && (prevItem?.startsWith(prefix) || prevItem === tag )
  }).filter(item => item)
  tag && newContent.unshift(tag)
  return newContent.join('\n')
}

export function getConfigObj (config, lang) {
  const configList = config.split('\n')
  const prefix = LANG_PREFIX[lang]
  if (!prefix) return {}
  const obj = {}
  configList.forEach(item => {
    const arr = item.split('=')
    if (Object.values(LANG_TAG).includes(arr[0])) return
    const key = arr[0].split(prefix)[1]
    if (key?.trim()) {
      obj[key] = arr[1]
    }
  })
  return obj
}

export function getLangByTag (value = '', tag) {
  return value.split('\n').map(i => i.trim()).indexOf(tag) > -1
}

export function getLangByContent (value = '') {
  if (value.startsWith(LANG_TAG[LANG.MARKDOWN])) {
    return LANG.MARKDOWN
  } else if (getLangByTag(value, LANG_TAG[LANG.PYTHON])) {
    return LANG.PYTHON
  } else if (getLangByTag(value, LANG_TAG[LANG.OPENMLDB])) {
    return LANG.OPENMLDB
  } else if (getLangByTag(value, LANG_TAG[LANG.KYLIN])) {
    return LANG.KYLIN
  } else {
    return LANG.BYZER
  }
}