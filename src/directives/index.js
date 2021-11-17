
import Vue from 'vue'
import ElementUI from 'element-ui'


// 自定义增加tooltip指令，判断宽度（加偏移量）是否超过父盒子从而插入或移出tooltip
let parentList = {}
Vue.directive('custom-tooltip', {
  bind: el => {
    el.className += ' custom-tooltip-text'
    // el.style.cssText = 'white-space: nowrap'
  },
  inserted: (el, binding) => {
    if (!el || !el.parentElement) return
    let id = 'tooltip-' + new Date().getTime().toString(32)
    el.setAttribute('data-id', id)
    const nextElement = el.nextSibling
    const currentElWidth = getTextWidth(el, el.innerText)

    parentList[id] = {
      parent: el.parentElement,
      nextElement,
      textWidth: currentElWidth,
      binding,
      timer: null,
      [`resizeFn-${id}`]: function () {
        const { parent } = parentList[id]
        if (!parent) return
        let textNode = parent.querySelector('.custom-tooltip-text')
        setTimeout(() => {
          // 此方法的调用需要等待 dom 被更新完成
          appendTipDom(textNode, getTextWidth(textNode, textNode.innerText), 'value' in binding && typeof binding.value.w === 'number' ? binding.value.w : 0)
        }, 100)
      }
    }

    appendTipDom(el, currentElWidth, 'value' in binding && typeof binding.value.w === 'number' ? binding.value.w : 0)

    setTimeout(() => {
      licenseDom(id)
    }, 500)
  },
  update: (el, binding) => {
    const content = binding.value.content || binding.value.text
    if ('content' in binding.value) {
      if (binding.value.content === binding.oldValue.content && binding.value.text === binding.oldValue.text && binding.value.w === binding.oldValue.w) return
    } else {
      if (binding.value.text === binding.oldValue.text && binding.value.w === binding.oldValue.w) return
    }
    let id = el.getAttribute('data-id')
    if (!id || !(id in parentList)) return
    let parent = parentList[id].parent
    let textNode = parent.querySelector('.custom-tooltip-text')
    parentList[id].binding = binding
    let currentWidth = parentList[id].textWidth = getTextWidth(textNode, content)
    textNode.textContent = content
    appendTipDom(textNode, currentWidth, 'value' in binding && typeof binding.value.w === 'number' ? binding.value.w : 0)
  },
  unbind: el => {
    let id = el.getAttribute('data-id')
    if (!id || !(id in parentList)) return
    !('observer' in parentList[id]) && `resizeFn-${id}` in parentList[id] && window.removeEventListener('resize', parentList[id][`resizeFn-${id}`])
    // 使用 MutationObserver 方法监听dom，需要用 disconnect 解绑
    'observer' in parentList[id] && parentList[id].observer.disconnect()
    delete parentList[id]
  }
})

// MutationObserver 方式监听 dom attrs 的改变
function licenseDom (id) {
  const { binding } = parentList[id]
  // 当元素在table中，使用 MutationObserver 方法监听 table 宽度 style 的改变（这里监听的是 el-table__body dom 的宽度）
  if (binding.value.tableClassName) {
    let element = document.querySelector(`.${binding.value.tableClassName}`) && document.querySelector(`.${binding.value.tableClassName}`).querySelector('.el-table__body')
    let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
    if (parentList[id]) {
      let observer = new MutationObserver(
        parentList[id][`resizeFn-${id}`]
      )
      parentList[id].observer = observer
      observer.observe(element, {
        attributes: true,  // 监听 table 的 attributes 的改变
        attributeFilter: ['drag-count']
      })
    }
  } else {
    parentList[id] && parentList[id][`resizeFn-${id}`] && window.addEventListener('resize', parentList[id][`resizeFn-${id}`])
  }
}

// 自定义创建common-tip组件并挂载
function createToolTipDom (el, binding, parentWidth) {
  const customLayout = document.createElement('span')
  const renderer = Vue.compile(createTextDom(el))
  let createCommonTip = propsData => {
    let Dom = Vue.extend(ElementUI.Tooltip)
    // let Dom = Vue.extend(commonTip)
    return new Dom({
      propsData
    })
  }
  let t = createCommonTip({placement: 'top', effect: 'dark', content: binding.value.text})
  t.$slots.default = [t.$createElement(renderer)]
  t.$mount()
  customLayout.appendChild(t.$el)
  customLayout.className = `${customLayout.className} tip_box custom-tooltip-layout ${binding.value.className || ''}`
  parentWidth && (customLayout.style.cssText = `width: ${parentWidth - binding.value.w || 0}px;`)
  return customLayout
}

// 组装 text dom 结构
function createTextDom (el) {
  const textLayout = document.createElement('span')
  textLayout.className = 'content'
  textLayout.appendChild(el)
  return textLayout.outerHTML
}

// 窗口resize以及更新数据时重新插入tooltip或去除tooltip
function appendTipDom (el, currentW, w) {
  let id = el.getAttribute('data-id')
  if (!id || !(id in parentList)) return
  const { parent, nextElement, binding } = parentList[id]
  const parentW = parent && parent.offsetWidth

  // 当前el超过父节点的宽度时插入tooltip否者移出
  if (currentW + w >= parentW) {
    let comp = createToolTipDom(el, binding, parentW)
    if (!parent.querySelector('.tip_box')) {
      let _El = parent.querySelector('.custom-tooltip-text')
      nextElement ? parent.insertBefore(comp, nextElement) : parent.appendChild(comp)
      _El && parent.removeChild(_El)
    } else {
      nextElement ? parent.insertBefore(comp, nextElement) : parent.appendChild(comp)
      parent.removeChild(parent.querySelector('.tip_box'))
    }
  } else {
    if (parent.querySelector('.tip_box')) {
      nextElement ? parent.insertBefore(el, nextElement) : parent.appendChild(el)
      parent.removeChild(parent.querySelector('.tip_box'))
    }
  }
}

// 获取文本的长度
function getTextWidth (el, text) {
  const dom = document.createElement('div')
  const fontSize = window.getComputedStyle(el).fontSize || '14px'
  dom.innerText = text
  dom.style.cssText = `font-size: ${fontSize}; display: inline-block;`
  document.body.appendChild(dom)
  const width = dom.offsetWidth
  document.body.removeChild(dom)
  return width
}
