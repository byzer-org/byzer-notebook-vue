
import axios from '../service/handleService'
import CryptoJS from 'crypto-js'

export function getBrowserLang () {
  const lang = navigator.language || navigator.browserLanguage
  return lang.toLowerCase().includes('zh') ? 'en' : 'zh'
}
export function getGlobalLang () {
  let localLang = localStorage.getItem('lang')
  let browerserLang = getBrowserLang()
  return localLang || browerserLang
}

export function formatGetParams (params) {
  let str = ''
  const keys = Object.keys(params)
  keys.map(v => str += `&${v}=${params[v]}`)
  return str
}

export function timeToStr (time) {
  const ms = time % 1000 // 毫秒数
  let totalSecond = (time - ms) / 1000 // 总秒数
  const seconds = totalSecond % 60 // 秒数
  let totalMin = (totalSecond - seconds) / 60 // 总分钟数
  const minutes = totalMin % 60 // 分钟数
  let totalHour = (totalMin - minutes) / 60 // 总小时数
  const hour = totalHour % 24 // 小时数
  const day = Math.floor(totalHour / 24) // 天数
  return {
    day,
    hour,
    minutes,
    seconds,
    ms
  }
}
export function getChildren (arr, parentPath) {
  // 每一项做比较
  // 第一项不相同，则组成{label: 第一项， children: 第一项以后的数据组成的数组}
  // 第一项相同 则第一项以后的合并成一个一个数组 组成{label: 第一项， children: 第一项以后的数据组成的数组}
  // 每一项的 children 都以此类推组成节点
  let nodeArr = []
  arr.forEach(v => {
    const index = nodeArr.findIndex(node => node.label === v[0])
    if (index === -1) {
      nodeArr.push({
        label: v[0],
        children: v.length > 1 ? [v.slice(1)] : [],
        path: parentPath + v[0]
      })
    } else {
      nodeArr[index].children.push(v.slice(1))
    }
  })
  nodeArr.forEach(v => {
    const index = v.children.findIndex(item => item.length > 1)
    if (index !== -1) {
      v.children = getChildren(v.children, v.path + '/')
    } else {
      v.children = v.children.map(child => ({ label: child[0], children: [], path: v.path + '/' + child[0] }))
    }
  })
  return nodeArr
}

export function getDirTree (dirArr) {
  const arr = dirArr.map(v => v.split('/').slice(1))
  const treeArr = getChildren(arr, '/')
  return treeArr
}

export function setIdinTreeArr (treeArr, pathIdArr) {
  // 根据 id 和路径塞进最后一层
  treeArr.map(v => {
    const index = pathIdArr.findIndex(item => item.path === v.path)
    if (index === -1 && v.children.length) {
      setIdinTreeArr(v.children, pathIdArr)
    } else {
      v.id = pathIdArr[index]
    }
  })
}

export function getDemoList (list) {
  const demoList = []
  list.forEach(v => {
    if (v.id && v.is_demo) {
      demoList.push(v.id)
    }

    if (v.folder_id) {
      demoList.push(...getDemoList(v.list))
    }
  })
  return demoList
}

export function getAllList (list) {
  const result = []

  list.forEach(v => {
    if (v.folder_id) {
      result.push(...getAllList(v.list))
    } else {
      result.push(v)
    }
  })

  return result
}

export function getCasAndTree (list) { // 对于指定结构转化成 tree 和 cascader都可以用的结构
  return list.map(v => {
    if (v.name) {
      v.label = v.name
      v.type = v.type || 'workflow'

      const uniq = v.type + '_' + (v.id || v.folder_id)
      v.uniq = v.commit_id ? uniq + '_' + v.commit_id : uniq
    }

    if (v.folder_id) {
      v.value = v.folder_id
      v.type = 'folder'

      const uniq = v.type + '_' + (v.id || v.folder_id)
      v.uniq = v.commit_id ? uniq + '_' + v.commit_id : uniq

      v.showExpandIcon = true
    }

    if (v.list) {
      v.children = getCasAndTree(v.list)
    }
    return {
      ...v
    }
  })
}
// 生成指定长度的唯一ID
export function GenNonDuplicateID (randomLength) {
  return Number(
    Math.random()
      .toString()
      .substr(3, randomLength) + Date.now()
  ).toString(36);
}

export function stringtoHex (str) {
  var val = '';
  for (var i = 0; i < str.length; i++) {
    if (val === '')
      val = str.charCodeAt(i).toString(16);
    else
      val += str.charCodeAt(i).toString(16);
  }
  val += '0a'
  return val
}

export async function encryptData (word) { // hext string 需要再 Hex.parse 一下
  let res = await axios.get('/api/settings/key')
  let key = CryptoJS.enc.Hex.parse(res.data)
  var encrypted = ''
  encrypted = CryptoJS.AES.encrypt(word, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.ciphertext.toString();
}

export function cryptoDecrypt (word) {
  var key = CryptoJS.enc.Utf8.parse('1fb511361580867f62c71b08f9db72f3')
  var encryptedHexStr = CryptoJS.enc.Hex.parse(word)
  var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr)
  var decrypt = CryptoJS.AES.decrypt(srcs, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString()
}

/**
 * @description: 递归获取当前所有的查找与替换的弹框组件
 * @param {list} VueComponent List
 * @param {refName} 需要找的ref的值
 * @return {result} 找到的FindAndReplace组件
 * @Date: 2021-09-06 17:59:50
 */
export function findChildren (list = {}, refName = '') {
  let result = [];
  if (!list.$children) {
    return result;
  }
  for (let item of list.$children) {
    if (item.$refs[refName]) {
      result.push(item.$refs[refName])
    } else {
      result.push(...findChildren(item, refName))
    }
  }
  return result
}

export function hasOwnProperty (obj, key) {
  if (!obj || !key) {
    return false
  }
  if (Object.prototype.toString.call(obj).slice(8, -1) === 'Object') {
    return Object.prototype.hasOwnProperty.call(obj, key)
  } else {
    return false
  }
}