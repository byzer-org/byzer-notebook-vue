
const splitCharacter = '_'
export function getParamGroup (allArr, parametersObj) { // 获取所有的参数组合
  const result = getParamsGroupObj(allArr, parametersObj)
  if (!result) {
    return ''
  }
  const { allGroupArr, allGroup, allGroupName } = result
  let temp1 = ''
  if (allGroup) { // 产生分组
    temp1 = getGroupParameter(allGroupArr, parametersObj, allGroupName, allGroup)
  } else { // 未产生分组
    temp1 = getNoGroupParameter(allGroupArr.filter(v => v.value_type !== 'ARRAY'), parametersObj)
  }
  const allNotGroupArr = allArr.filter(v => !v.is_group_param)
  const temp2 = getNotGroupParameter(allNotGroupArr, parametersObj)
  return (temp2 + temp1).slice(4)
}

export function getParamsGroupObj (allArr, parametersObj) {
  if (!Object.keys(parametersObj).length) {
    return ''
  }
  if (!allArr.length) {
    return ''
  }
  // 区分是在分组内还是不在分组内
  const allGroupArr = allArr.filter(v => v.is_group_param)
  const groupArr = allGroupArr.filter(v => v.value_type === 'ARRAY')
  let temp = []
  groupArr.forEach(v => {
    temp.push({
      name: v.name,
      values: parametersObj[v.name]
    })
  })
  const allGroupName = groupArr.map(v => v.name)
  const groupParamValue = temp.map(v => v.values).filter(v => v.length)
  const allGroup = getAllGroup(groupParamValue)
  return { allGroupArr, allGroup, allGroupName }
}

export function getNotGroupParameter (allArr, parametersObj) {
  let str = ''
  allArr.forEach(v => {
    if (parametersObj[v.name]) {
      str += `\nand ${v.name}="${parametersObj[v.name]}"`
    }
  })
  return str
}
export function getNoGroupParameter (allArr, parametersObj) {
  let str = ''
  allArr.forEach(v => {
    if (parametersObj[v.name]) {
      str += `\nand \`fitParam.0.${v.name}\`="${parametersObj[v.name]}"`
    }
  })
  return str
}


export function getAllGroup (origin) { // 获取所有的排列组合
  if (origin.length < 2) {
    return origin[0]
  } else {
    // 两个组合，再改变原数组，再循环执行
    let len1 = origin[0].length
    let len2 = origin[1].length
    let newArr = new Array(len1 * len2)
    let index = 0
    for (let i = 0; i < len1; i++) {
      for (let j = 0; j < len2; j++) {
        newArr[index] = origin[0][i] + splitCharacter + origin[1][j]
        index++
      }
    }
    let newOrigin = new Array(origin.length - 1)
    for (let i = 1; i < origin.length - 1; i++) {
      newOrigin[i] = origin[i + 1]
    }
    newOrigin[0] = newArr
    return getAllGroup(newOrigin)
  }
}

export function getGroupParameter (allArr, parametersObj, allGroupName, allGroup) {
  const groupArr = allArr.filter(v => v.value_type !== 'ARRAY').map(v => v.name)
  const otherGroup = groupArr.filter(v => parametersObj[v]).map(v => (`${v}\`="${parametersObj[v]}"`))
  let arr = allGroup.map((v, i) => {
    let temp1 = '' // 将所有类型非 Array 的名称组合
    otherGroup.forEach(v => {
      temp1 += `\nand \`fitParam.${i}.${v}`
    })
    const valueGroup = v.split(splitCharacter) // 值组合
    const nameGroup = allGroupName.filter(v => parametersObj[v].length) // 名称组合
    let temp2 = nameGroup.map((item, iIndex) => `and \`fitParam.${i}.${item}\`="${valueGroup[iIndex]}"`).join('\n')
    return `${temp1}\n${temp2}`
  })
  return arr.join('\n')
}