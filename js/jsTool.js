
class ChartManager {
  constructor() {
    this.charts = [];
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  addChart(chart) {
    this.charts.push(chart);
    chart.resize(); // 确保添加图表时立即调整大小
  }

  handleResize() {
    this.charts.forEach(chart => chart.resize());
  }

  getChart(chartId) {
    return this.charts.find(chart => chart.id === chartId);
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize);
  }
}

// 导出 ChartManager 类
// export default ChartManager; 


const chartManager = new ChartManager();
// const urlTitle = 'http://localhost:5000/api';//接口地址
const urlTitle = 'https://magicyuan.me/api';//接口地址
var currentLoadingDiv = null; // 当前正在显示的 loading div
var loadingCounter = 0;  // 计数器，用于追踪当前正在进行的请求数量


function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// 编写一个guid函数
const get_guid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }).toUpperCase();
}


/**
 * 使用 setTimeout 进行防抖处理。
 * 防抖处理：在 delay 时间内，如果函数被频繁调用，则会延迟 delay 时间后执行最后一次调用的函数。
 * 优点：在 delay 时间内，如果函数被频繁调用，则只执行一次函数。
 * @param {function} fn 要进行防抖处理的函数
 * @param {number} delay 防抖时间，单位为 ms，默认值为 1000ms
 * @returns {function} 防抖处理后的函数
 */
const debounce = (fn, delay = 1000) => {
  let timer = null; // 定时器变量，用于存储 setTimeout 返回的计时器 ID

  return function (...args) {
    if (timer !== null) { // 如果计时器已经存在，则清除之前的计时器
      clearTimeout(timer); // 清除之前的计时器
      timer = null; // 将计时器变量设置为 null
    }

    timer = setTimeout(() => { // 创建新的计时器，延迟执行传入的函数
      fn.call(this, ...args); // 调用传入的函数，并传入参数
    }, delay); // 设置延迟时间为 delay 毫秒
  };
}

/**
 * 使用 setTimeout 进行节流处理，首次执行会立即执行函数。
 * 节流处理：在一定时间间隔内，最多只会执行一次函数。
 * 优点：可以控制函数在一定时间内最多执行的次数。
 * @param {function} fn 要进行节流处理的函数
 * @param {number} delay 节流时间，单位为毫秒 ，默认值为 1000ms
 * @param {boolean} lasting 是否只执行小于 delay 时间的最后一次调用，默认为 false
 * @returns {function} 节流处理后的函数
 */
const throttle = (fn, delay = 1000, lasting = false) => {
  let timer = null; // 计时器变量，用于存储 setTimeout 返回的计时器 ID
  let startTime = Date.now(); // 记录函数最后一次执行的时间点

  return function () {
    let curTime = Date.now(); // 当前时间
    let remaining = delay - (curTime - startTime); // 计算距离上次执行的剩余时间
    let context = this; // 保存函数调用时的上下文
    let args = arguments; // 保存函数调用时的参数

    clearTimeout(timer); // 清除之前的计时器

    if (remaining <= 0) {
      // 如果剩余时间小于等于0，则立即执行函数
      fn.apply(context, args); // 调用函数，并传入参数和上下文
      startTime = Date.now(); // 更新最后一次执行的时间点
    } else if (lasting) {
      // 如果剩余时间大于0，则延迟执行函数
      timer = setTimeout(() => {
        fn.apply(context, args); // 延迟执行函数
        startTime = Date.now(); // 更新最后一次执行的时间点
      }, remaining);
    }
  };
}


const createFullScreenDiv = () => {
  let fullScreenDiv = document.createElement('div');
  fullScreenDiv.id = 'fullscreen';  // 设置 div 的 id 为 'fullscreen'
  fullScreenDiv.style.position = 'fixed';
  fullScreenDiv.style.top = '0';
  fullScreenDiv.style.left = '0';
  fullScreenDiv.style.width = '100%';
  fullScreenDiv.style.height = '100%';
  fullScreenDiv.style.background = 'rgba(0, 0, 0, 0.7)';
  fullScreenDiv.style.zIndex = '9997';
  document.body.appendChild(fullScreenDiv);

  // 创建叉的元素
  let closeButton = document.createElement('div');
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.style.color = '#fff';
  closeButton.style.fontWeight = 'bold';
  closeButton.style.fontSize = '28px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.zIndex = '9999';
  closeButton.innerHTML = '&times;';  // 叉的 HTML 实体编码

  // 添加关闭事件
  closeButton.addEventListener('click', removeLoading);

  // 将叉的元素添加到 fullScreenDiv 中
  fullScreenDiv.appendChild(closeButton);

  document.body.appendChild(fullScreenDiv);
  return fullScreenDiv;
}

const showLoading = () => {
  removeLoading();
  currentLoadingDiv = createFullScreenDiv();
  loaddom = document.createElement('div');
  loaddom.style.position = 'fixed';
  loaddom.style.width = '100%';
  loaddom.style.height = '100%';
  // loaddom.style.zIndex = '9998';
  currentLoadingDiv.appendChild(loaddom);
  let loadChart = echarts.init(loaddom);

  let option = loading_option()
  option && loadChart.setOption(option);
  // 获取Canvas元素并设置鼠标悬停样式
  let canvasElement = loadChart.getDom().getElementsByTagName('canvas')[0];
  canvasElement.style.cursor = 'pointer';
  // 添加关闭事件
  canvasElement.addEventListener('click', removeLoading);

  loadingCounter++;
}

const removeLoading = () => {
  if (loadingCounter !== 0)
    loadingCounter--;
  if (loadingCounter === 0 && currentLoadingDiv)
    currentLoadingDiv?.parentNode?.removeChild(currentLoadingDiv);
}

const loading_option = () => {
  return {
    graphic: {
      elements: [
        {
          type: 'group',
          left: 'center',
          top: 'center',
          children: new Array(7).fill(0).map((val, i) => ({
            type: 'rect',
            x: i * 20,
            shape: {
              x: 0,
              y: -40,
              width: 10,
              height: 80
            },
            style: {
              fill: '#5470c6'
            },
            keyframeAnimation: {
              duration: 1000,
              delay: i * 200,
              loop: true,
              keyframes: [
                {
                  percent: 0.5,
                  scaleY: 0.3,
                  easing: 'cubicIn'
                },
                {
                  percent: 1,
                  scaleY: 1,
                  easing: 'cubicOut'
                }
              ]
            }
          }))
        }
      ]
    }
  };
}

const createLoadingOverlay = (targetDivId, isBackground = true) => {
  // 创建加载覆盖层
  let loadingOverlay = document.createElement('div');
  loadingOverlay.id = get_guid();  // 为加载层设置动态ID
  loadingOverlay.style.position = 'absolute';
  loadingOverlay.style.width = '100%';
  loadingOverlay.style.height = '100%';
  if (isBackground)
    loadingOverlay.style.background = 'rgba(0, 0, 0, 0.3)';
  loadingOverlay.style.zIndex = '9997';
  loadingOverlay.style.borderRadius = '10px'
  // targetDivId 的父节点 xpanel 的位置
  let targetDiv = document.getElementById(targetDivId).closest('.xpanel'); // 选择最近的 class 为 xpanel 的祖先元素
  if (targetDiv) {
    // 设置加载层覆盖指定的目标层
    loadingOverlay.style.top = targetDiv.offsetTop + 'px';
    loadingOverlay.style.left = targetDiv.offsetLeft + 'px';
    loadingOverlay.style.width = targetDiv.offsetWidth + 'px';
    loadingOverlay.style.height = targetDiv.offsetHeight + 'px';

    targetDiv.appendChild(loadingOverlay);
    // chartManager
    // 使用ECharts创建加载动画
    let loadingChart = echarts.init(loadingOverlay);

    let option = loading_option()

    option && loadingChart.setOption(option);
    const resizeHandler = () => {
      loadingOverlay.style.top = targetDiv.offsetTop + 'px';
      loadingOverlay.style.left = targetDiv.offsetLeft + 'px';
      loadingOverlay.style.width = targetDiv.offsetWidth + 'px';
      loadingOverlay.style.height = targetDiv.offsetHeight + 'px';
      loadingChart.resize();
      option && loadingChart.setOption(option);
    };
    //如果视口大小发生变化，重新设置加载层的位置和大小 并且重新绘制加载动画
    window.addEventListener('resize', resizeHandler);
    let tmp = [loadingOverlay, resizeHandler]
    return tmp;
  } else {
    console.error('未找到目标层！', resizeHandler);
    return null;
  }
}

const removeLoadingOverlay = (loadingOverlay, resizeHandler) => {
  // 移除窗口大小变化事件监听
  window.removeEventListener('resize', resizeHandler);
  // 移除加载覆盖层 loadingOverlay
  $('#' + loadingOverlay?.id).remove();
}


// 封装ajax
const ajaxPromise = (url, data, type, header) => {
  // showLoading();
  return new Promise((resolve, reject) => {
    $.ajax({
      type: type,
      url: urlTitle + url,
      contentType: 'application/json', // 设置请求头
      dataType: 'json',
      data: JSON.stringify(data),
      headers: header,
      success: (res) => {
        // removeLoading();
        resolve(res);
      },
      error: (err) => {
        // removeLoading();
        reject(err);
      }
    });
  });
}



//绘制词云图
const draw_wordCloud = (title, elementStr, datas, maskImage) => {
  let wordCloudCharts = echarts.init(document.getElementById(elementStr));
  chartManager.addChart(wordCloudCharts);
  let option = {
    title: {
      text: title,
      // subtext: '词云图示例',
      left: 'center',
      textStyle: {
        color: 'white' // 设置标题颜色为白色
      },
    },
    tooltip: {
      show: true
    },
    grid: {
      left: '0%',  // 调整图表位置
      right: '0%',
      bottom: '0%',
      top: '9%',
      containLabel: true
    },
    series: [{
      type: 'wordCloud',
      // shape这个属性虽然可配置，但是在词的数量不太多的时候，效果不明显，它会趋向于画一个椭圆
      shape: maskImage ? 'circle' : null,
      // 这个功能还没用过
      keepAspect: false,
      // 这个是可以自定义背景图片的，词云会按照图片的形状排布，所以有形状限制的时候，最好用背景图来实现，而且，这个背景图一定要放base64的，不然词云画不出来
      // maskImage: maskImage,
      // ...(maskImage ? { maskImage: maskImage } : {}),
      // 下面就是位置的配置
      left: 'center',
      top: '7%',
      width: '100%',
      height: '100%',
      right: null,
      bottom: null,
      //添加背景色
      backgroundColor: 'rgba(255, 255, 255, 0.8)', // 背景颜色，可以根据需要调整颜色和透明度
      // 词的大小，最小12px，最大60px，可以在这个范围调整词的大小
      sizeRange: [12, 60],
      // 每个词旋转的角度范围和旋转的步进
      rotationRange: [-90, 90],
      rotationStep: 45,
      // 词间距，数值越小，间距越小，这里间距太小的话，会出现大词把小词套住的情况，比如一个大的口字，中间会有比较大的空隙，这时候他会把一些很小的字放在口字里面，这样的话，鼠标就无法选中里面的那个小字，这里可以用函数根据词云的数量动态返回间距
      gridSize: 8,
      // 允许词太大的时候，超出画布的范围
      drawOutOfBound: false,
      // 布局的时候是否有动画
      layoutAnimation: true,
      // 这是全局的文字样式，相对应的还可以对每个词设置字体样式
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        // 颜色可以用一个函数来返回字符串，这里是随机色
        color: function () {
          // Random color
          return 'rgb(' + [
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160)
          ].join(',') + ')';
        },
        // 设置文字背景色
        // backgroundColor: 'rgba(255, 255, 255, 0.5)',
      },
      emphasis: {
        focus: 'self',
        textStyle: {
          textShadowBlur: 20,
          textShadowColor: '#333'
        }
      },
      data: datas
    }]
  };
  wordCloudCharts.setOption(option);
  let title_charts = wordCloudCharts.getZr().storage.getDisplayList()[1];
  // console.log(title_charts);
  title_charts.setStyle({
    fill: 'rgba(255, 255, 255, 1)' // 设置背景颜色
  });
}

const getRandomShape = () => {
  const shapes = ['circle', 'triangle', 'square', 'star', 'pentagon', 'hexagon', 'diamond', 'heart', 'ellipse', 'roundedRect'];    // 可以添加其他形状
  const randomIndex = Math.floor(Math.random() * shapes.length);
  return shapes[randomIndex];
};

// 绘制多列柱状图
const draw_bar = (title, elementStr, dimensions, sources) => {
  let barCharts = echarts.init(document.getElementById(elementStr));
  chartManager.addChart(barCharts);
  // 获取sources的 可key 排除掉score_name
  const scoreNameIndex = Object.keys(sources[0]).indexOf('score_name');
  const keys = Object.keys(sources[0]).slice(0, scoreNameIndex).concat(Object.keys(sources[0]).slice(scoreNameIndex + 1));

  // console.log(keys);
  // 提取数据
  const data = sources.map(source => ({
    name: source['score_name'],
    data: [
      source['1'],
      source['2'],
      source['3'],
      source['4'],
      source['5']
    ]
  }));

  // 设置图表配置项
  const option = {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        color: 'white' // 设置标题颜色为白色
      }
    },
    legend: {
      data: dimensions.slice(1),  // 排除第一个维度（score_name）
      top: '10%',
      textStyle: {
        color: 'white' // 设置图例颜色为白色
      }
    },
    grid: {
      left: '0%',  // 调整图表位置
      right: '0%',
      bottom: '0%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      // 设置x轴数据
      data: keys,
      axisLine: {
        lineStyle: {
          color: 'white'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: 'white'
        }
      },
    },
    series: data.map(item => ({
      name: item.name,
      type: 'bar',
      data: item.data,
      itemStyle: {
        normal: {
          borderRadius: [20, 20, 0, 0],
        }
      }
    })),
    tooltip: {
      trigger: 'axis', // 启用 tooltip
      axisPointer: {
        type: 'shadow' // 鼠标悬停时显示阴影
      }
    }
  };

  // 使用刚指定的配置项和数据显示图表。
  barCharts.setOption(option);
};


// 绘制饼图
const draw_pie = (title, elementStr, data) => {
  const pieCharts = echarts.init(document.getElementById(elementStr));
  chartManager.addChart(pieCharts);
  // 设置图表配置项
  const option = {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        color: 'white' // 设置标题颜色为白色
      }
    },
    legend: {
      top: 'bottom',
      textStyle: {
        color: 'white' // 设置图例颜色为白色
      }
    },
    toolbox: {
      show: true,
      feature: {
        // mark: { show: true },
        // dataView: { show: true, readOnly: false },
        // restore: { show: true },
        // saveAsImage: { show: true }
      }
    },
    series: [
      {
        // name: 'Nightingale Chart',
        type: 'pie',
        // radius: [20, 133],
        radius: '70%',
        center: ['50%', '50%'],
        // roseType: 'area',
        itemStyle: {
          borderRadius: 8
        },
        data: data,
        label: {
          show: true,
          // formatter: '{b} : {c}', // 显示别名和数值
          // formatter: '{c} : {d}%', // 显示别名和百分比
          textStyle: {
            color: 'white' // 设置别名颜色为白色
          }
        }
      }
    ],
    tooltip: {
      // trigger: 'axis', // 启用 tooltip
      axisPointer: {
        type: 'shadow' // 鼠标悬停时显示阴影
      },
      trigger: 'item', // 触发类型设置为 'item'
      formatter: function () {
        // console.log(arguments)
        data = arguments[0];
        marker = data['marker'];
        percent = data['percent'];
        return marker + percent + "%";
      },
    }
  };

  option && pieCharts.setOption(option);


  // 使用刚指定的配置项和数据显示图表。
  pieCharts.setOption(option);
};

// 绘制关系图
const draw_relation = (title, elementStr, data, number) => {
  const relationCharts = echarts.init(document.getElementById(elementStr));
  chartManager.addChart(relationCharts);
  for (let i = 0; i < data.links.length; i++) {
    // data.links[i].source  或者 data.links[i].target 为节点的索引值 小于 number 的节点就去除
    if (data.links[i].source >= number || data.links[i].target >= number) {
      data.links.splice(i, 1);
      i--;
    }
  }
  // 设置图表配置项
  const option = {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        color: 'white' // 设置标题颜色为白色
      }
    },
    roam: true, // 允许漂浮
    tooltip: {
      trigger: 'item', // 触发类型设置为 'item'
      // formatter: function () {
      //     // console.log(arguments)
      //     data = arguments[0];
      //     marker = data['marker'];
      //     tname = data['name'];
      //     return marker + tname;
      // },
    },
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        // name: '关系图',
        type: 'graph',
        layout: 'force',
        symbolSize: 50,
        roam: true,
        // edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [4, 10],
        edgeLabel: {
          fontSize: 20
        },
        force: {
          repulsion: 400,
          edgeLength: 200,
          layoutAnimation: true,
          gravity: 1
        },
        data: data.nodes,
        links: data.links,
        // categories: data.categories,
        label: {
          show: true,
        },
        lineStyle: {
          color: '#8adeff',
          curveness: 0.3,
          opacity: 0.9,
          width: 1
        },
        // color: [ '#85d0ff', '#20639b', '#ed553b', '#173f5f'],
      }
    ]
  };

  option && relationCharts.setOption(option);



  let autoScrollTimer;
  const startAutoScroll = () => {
    autoScrollTimer = setInterval(() => {
      // 每5秒刷新一次
      relationCharts.setOption(option);
    }, 5000);
  };

  const stopAutoScroll = () => {
    clearInterval(autoScrollTimer);
  };

  const onMouseMoveHandler = () => {
    stopAutoScroll(); // 鼠标移入时停止自动滑动
  };

  const onMouseOutHandler = () => {
    startAutoScroll(); // 鼠标移出时重新启动自动滑动
  };

  // 移除之前可能存在的相同类型的事件监听器
  relationCharts.getZr().off('mousemove', onMouseMoveHandler);
  relationCharts.getZr().off('mouseout', onMouseOutHandler);

  // 监听鼠标移入事件
  relationCharts.getZr().on('mousemove', onMouseMoveHandler);

  // 监听鼠标移出事件
  relationCharts.getZr().on('mouseout', onMouseOutHandler);

  // 初始化自动滑动
  startAutoScroll();
};


const draw_timeLine = (title, elementStr, datas, period) => {
  let timeLineCharts = echarts.init(document.getElementById(elementStr));
  chartManager.addChart(timeLineCharts);
  let defaultDataZoom_endValue = 25;
  stacks = {
    stack: 'Total',
    areaStyle: {},
    emphasis: {
      focus: 'series'
    },
  }
  series = [{
    name: '负面',
    type: 'line',
    ...stacks,
    smooth: true,
    data: datas['ngeCount'],
    color: '#f39393'
  },
  {
    name: '正面',
    type: 'line',
    smooth: true,
    ...stacks,
    data: datas['posCount'],
    color: "#b2db9e"
  },
  {
    name: '所有',
    type: 'line',
    ...stacks,
    smooth: true,
    data: datas['allCount'],
    color: '#9dd2e7'
  },]

  dataZoom = []
  if (period !== 'y') {
    // 为 series 所有添加
    dataZoom = [
      {
        type: 'inside',
        show: true,
        startValue: 0, // 从头开始。
        endValue: defaultDataZoom_endValue, // 一次性展示多少个。
      }, {
        show: true,
        startValue: 0,
        endValue: defaultDataZoom_endValue,
      }
    ]
  }
  let option = {
    title: {
      text: title,
      textStyle: {
        color: 'white' // 设置标题颜色为白色
      },
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['评论数'],
      textStyle: {
        color: 'white' // 设置图例颜色为白色
      }
    },
    dataZoom: dataZoom,
    legend: {
      // left: 'left',   // 将图例放置在左侧
      top: '23px',     // 将图例放置在顶部
      textStyle: {
        color: 'white' // 设置图例颜色为白色
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: datas['time'],
      axisPointer: {
        type: 'shadow'
      },
      axisLabel: {
        interval: (() => {
          let chartWidth = document.getElementById(elementStr).clientWidth;
          if (period === 'y')
            return 1;
          // 根据时间跨度和显示宽度动态调整间隔值
          if (chartWidth >= 800) {
            return 5; // 如果时间跨度小于等于一天并且显示宽度大于等于800像素，则每个标签显示一个
          } else if (chartWidth >= 400) {
            return 6; // 如果时间跨度小于等于三天并且显示宽度大于等于400像素，则每两个标签显示一个
          } else if (chartWidth >= 200) {
            return 7; // 如果时间跨度小于等于七天并且显示宽度大于等于200像素，则每三个标签显示一个
          } else {
            return Math.ceil(datas['time'].length / 20); // 否则默认每二十个标签显示一个
          }
        })(),
        rotate: 0  // 将 rotate 设置为 0，让标签水平显示
      },
      axisLine: {
        lineStyle: {
          color: 'white'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '评论数',
      axisLabel: {
        formatter: '{value}'
      },
      axisLine: {
        lineStyle: {
          color: 'white'
        }
      }
    },
    series: series
  };

  timeLineCharts.setOption(option);

  timeLineCharts.getZr().on('click', function (option) {
    // console.log(this);
    // console.log(option);
  });

  let num = datas['time'].length;
  // 如果dataZoom不为空，增加自动滑动 dataZoom
  if (dataZoom.length === 0) return;
  // 定义一个变量用于存储自动滑动的定时器
  let autoScrollTimer;

  const startAutoScroll = () => {
    autoScrollTimer = setInterval(() => {
      // 每次向后滚动一个，最后一个从头开始。
      //判断是否滑动到最后一条数据，若是，则重置柱状图
      if (option.dataZoom[0].endValue >= num / 2 - 1) {
        option.dataZoom[0].endValue = defaultDataZoom_endValue;
        option.dataZoom[0].startValue = 0;
      } else {
        // 步长 2
        let n = 2;
        if (period === 'd')
          n = 3;
        option.dataZoom[0].endValue = option.dataZoom[0].endValue + n;
        option.dataZoom[0].startValue = option.dataZoom[0].startValue + n;
      }
      timeLineCharts.setOption(option);
    }, 2000);
  };

  const stopAutoScroll = () => {
    clearInterval(autoScrollTimer);
  };

  const onMouseMoveHandler = () => {
    stopAutoScroll(); // 鼠标移入时停止自动滑动
  };

  const onMouseOutHandler = () => {
    startAutoScroll(); // 鼠标移出时重新启动自动滑动
  };

  // 移除之前可能存在的相同类型的事件监听器
  timeLineCharts.getZr().off('mousemove', onMouseMoveHandler);
  timeLineCharts.getZr().off('mouseout', onMouseOutHandler);

  // 监听鼠标移入事件
  timeLineCharts.getZr().on('mousemove', onMouseMoveHandler);

  // 监听鼠标移出事件
  timeLineCharts.getZr().on('mouseout', onMouseOutHandler);

  // 初始化自动滑动
  startAutoScroll();


}



const draw_barSentiment = (title, elementStr, datas) => {
  // 创建图表
  let barSentimentCharts = echarts.init(document.getElementById(elementStr));
  chartManager.addChart(barSentimentCharts);

  // 配置图表
  let option = {
    title: {
      text: title,
      textStyle: {
        color: 'white' // 设置标题颜色为白色
      },
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['正面', '负面'],
      top: 30,
      textStyle: {
        color: 'white' // 设置图例颜色为白色
      }
    },
    xAxis: {
      type: 'category',
      data: datas.map(item => item.season),
      axisLabel: {
        // rotate: 45,
        textStyle: {
          color: 'white' // 设置轴线颜色为白色
        }
      },
      axisLine: {
        lineStyle: {
          color: 'white' // 设置轴线颜色为白色
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        textStyle: {
          color: 'white' // 设置轴线颜色为白色
        }
      },
      axisLine: {
        lineStyle: {
          color: 'white' // 设置轴线颜色为白色
        }
      }
    },
    series: [
      {
        name: '正面',
        type: 'bar',
        // stack: '总量',
        data: datas.map(item => item.正面),
        itemStyle: {
          normal: {
            borderRadius: [20, 20, 0, 0],
            color: '#73C0DE'
          }
        },
      },
      {
        name: '负面',
        type: 'bar',
        // stack: '总量',
        data: datas.map(item => item.负面),
        itemStyle: {
          normal: {
            borderRadius: [20, 20, 0, 0],
            color: '#FAC858'
          }
        }
      }
    ]
  };

  // 使用刚指定的配置项和数据显示图表。
  barSentimentCharts.setOption(option);
}

const delete_params = (params) => {
  // 删除 params 里面的空值
  for (let key in params) {
    if (params[key] == null || params[key] == void 0 || params[key] == '') {
      delete params[key];
    }
  }
  return params;
}
// 如果小于10，在数字前加一个“0”
const addZero = (num) => num < 10 ? '0' + num : num;