const strokeWidth = 1
const color = '#546174'
export const jsplumbSetting = {
  grid: [10, 10],
  // 动态锚点、位置自适应
  Anchors: [
    'TopCenter',
    'RightMiddle',
    'BottomCenter',
    'LeftMiddle'
  ],
  // Container: 'flow',
  // 连线的样式 StateMachine、Flowchart,有四种默认类型：Bezier（贝塞尔曲线），Straight（直线），Flowchart（流程图），State machine（状态机）
  Connector: ['Flowchart', { cornerRadius: 5, alwaysRespectStubs: true, stub: 5 }],
  // 鼠标不能拖动删除线
  ConnectionsDetachable: false,
  // 删除线的时候节点不删除
  DeleteEndpointsOnDetach: false,
  // 连线的端点
  Endpoints: [ [ 'Dot', { radius: 5 } ], ['Rectangle', { width: 5, height: 5 } ]],
  // 线端点的样式
  EndpointStyle: [{ fill: color }],
  // 绘制线
  PaintStyle: {
    stroke: color,
    strokeWidth: strokeWidth
  },
  // 绘制箭头
  Overlays: [
    [
      'Arrow',
      {
        width: 6,
        length: 6,
        location: 1
      }
    ],
    [
      'Diamond',
      {
        width: 6,
        length: 6,
        location: 0
      }
    ]
  ],
  RenderMode: 'svg'
}

// jsplumb连接参数
export const jsplumbConnectOptions = {
  isSource: true,
  isTarget: true,
  // 动态锚点、提供了4个方向 Continuous、AutoDefault
  anchor: [
    'TopCenter',
    'RightMiddle',
    'BottomCenter',
    'LeftMiddle'
  ]
}

export const jsplumbSourceOptions = {
  filter: '.node-anchor', // 触发连线的区域
  /* 'span'表示标签，'.className'表示类，'#id'表示元素id*/
  filterExclude: false,
  anchor: [
    'TopCenter',
    'RightMiddle',
    'BottomCenter',
    'LeftMiddle'
  ],
  allowLoopback: false
}

export const jsplumbTargetOptions = {
  filter: '.node-anchor',
  /* 'span'表示标签，'.className'表示类，'#id'表示元素id*/
  filterExclude: false,
  anchor: [
    'TopCenter',
    'RightMiddle',
    'BottomCenter',
    'LeftMiddle'
  ],
  allowLoopback: false
}