import * as echarts from "echarts";

const yList = [
  {
    name: '鄂州市',
    value: 1391
  }, {
    name: '恩施土家族苗族自治州',
    value: 2520
  }, {
    name: '黄冈市',
    value: 2905
  }, {
    name: '黄石市',
    value: 1014
  }, {
    name: '荆门市',
    value: 925
  }, {
    name: '荆州市',
    value: 1579
  }, {
    name: '潜江市',
    value: 198
  }, {
    name: '神农架林区',
    value: 11
  }, {
    name: '十堰市',
    value: 672
  }, {
    name: '随州市',
    value: 1307
  }, {
    name: '天门市',
    value: 496
  }, {
    name: '武汉市',
    value: 9122
  }, {
    name: '仙桃市',
    value: 575
  }, {
    name: '咸宁市',
    value: 836
  }, {
    name: '襄阳市',
    value: 1175
  }, {
    name: '孝感市',
    value: 3518
  }, {
    name: '宜昌市',
    value: 931
  }

]
const geoCoordMap = {
  "恩施土家族苗族自治州": [109.48699,30.283114],
  "神农架林区": [110.671525,31.744449],
  "武汉市": [114.298572, 30.584355],
  "黄石市": [115.029859, 29.925149],
  "十堰市": [110.787916, 32.646907],
  "宜昌市": [111.290843, 30.702636],
  "襄阳市": [112.144146, 32.042426],
  "鄂州市": [114.890593, 30.396536],
  "荆门市": [112.204251, 31.03542],
  "孝感市": [113.926655, 30.926423],
  "荆州市": [112.23813, 30.326857],
  "黄冈市": [114.879365, 30.447711],
  "咸宁市": [114.328963, 29.832798],
  "随州市": [113.37377, 31.717497],
  "仙桃市": [113.453974, 30.364953],
  "潜江市": [112.896866, 30.421215],
  "天门市": [113.165862, 30.653061],
}

function lineMaxHeight () {
  const maxValue = Math.max(...yList.map(item => item.value))
  return 0.9/maxValue
}

function lineData() {
  return yList.map((item) => {
    return {
      coords: [geoCoordMap[item.name], [geoCoordMap[item.name][0], geoCoordMap[item.name][1] + item.value * lineMaxHeight()]]
    }
  })
}

// 柱状体的顶部
function scatterData () {
  return yList.map((item) => {
    return [geoCoordMap[item.name][0], geoCoordMap[item.name][1] + item.value * lineMaxHeight()]
  })
}
// 柱状体的底部
function scatterData2 () {
  return yList.map((item) => {
    return {
      name: item.name,
      value: geoCoordMap[item.name]
    }
  })
}

export default {
  mapOption: {
    geo: {
      map: '湖北省',
      roam: true,
      label: {
        normal: {
          show: true,
          textStyle: {
            color: '#fff'
          }
        },
        emphasis: {
          show: true,
          textStyle: {
            color: '#fff'
          }
        }
      },
      itemStyle: {
        normal: {
          areaColor: 'rgba(6,46,96,0.2)',
          borderColor: '#2ab8ff',
          shadowColor: 'rgba(25,164,243,1)',//外发光
          shadowBlur: 20,
          borderWidth: 2,
        },
        emphasis: {
          areaColor: 'rgba(34,81,192,0.7)',
          borderWidth: 2,
        },
      },
      select: {
        label: {
          show: true,
          color: '#fff'
        },
        itemStyle: {
          areaColor: 'rgba(34,81,192,0.7)',
          borderColor: '#2ab8ff',
          shadowColor: 'rgba(25,164,243,1)',//外发光
          shadowBlur: 20,
          borderWidth: 2,
        }
      },
      zlevel: 1,
    },
    series: [
      //地图部分
      {
        geoIndex: 0,
        name: '地市',
        type: 'map',
        map: '湖北省',
        roam: true,
        label: {
          normal: {
            show: true,
            textStyle: {
              color: '#fff'
            }
          },
          emphasis: {
            show: true,
            textStyle: {
              color: '#fff'
            }
          }
        },
        itemStyle: {
          normal: {
            areaColor: 'rgba(6,46,96,0.2)',
            borderColor: '#2ab8ff',
            shadowColor: 'rgba(25,164,243,1)',//外发光
            shadowBlur: 20,
            borderWidth: 2,
          },
          emphasis: {
            areaColor: 'rgba(34,81,192,0.7)',
            borderWidth: 2,
          },
        },
        select: {
          label: {
            show: true,
            color: '#fff'
          },
          itemStyle: {
            areaColor: 'rgba(34,81,192,0.7)',
            borderColor: '#2ab8ff',
            shadowColor: 'rgba(25,164,243,1)',//外发光
            shadowBlur: 20,
            borderWidth: 2,
          }
        },
        data: yList

      },
      //柱子部分
      {
        type: 'lines',
        zlevel: 4,
        effect: {
          show: false,
          // period: 4, //箭头指向速度，值越小速度越快
          // trailLength: 0.02, //特效尾迹长度[0,1]值越大，尾迹越长重
          // symbol: 'arrow', //箭头图标
          // symbol: imgDatUrl,
          symbolSize: 5 // 图标大小
        },
        lineStyle: {
          width: 20, // 尾迹线条宽度
          // color: 'rgb(22,255,255, .6)',
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              {
                offset: 0,
                color: '#0d7cd0' // 最左边
              }, {
                offset: 0.5,
                color: '#0d7cd0' // 左边的右边 颜色
              }, {
                offset: 0.5,
                color: '#035db2' // 右边的左边 颜色
              }, {
                offset: 1,
                color: '#035db2'
              }],
            global: false, // 缺省为 false
          },
          opacity: 1, // 尾迹线条透明度
          curveness: 0 // 尾迹线条曲直度
        },
        label: {
          show: 0,
          position: 'end',
          formatter: '245'
        },
        silent: true,
        data: lineData()
      },
      // 柱状体的顶部
      {
        type: 'scatter',
        symbol: 'diamond',
        symbolOffset: [0, 0],
        symbolSize: [20, 10],
        itemStyle: {
          normal: {
            color: '#066abf',
          }
        },
        coordinateSystem: 'geo',
        geoIndex: 0,
        zlevel: 5,
        silent: true,
        data: scatterData()
      },
      // 柱状体的底部
      {

        symbol: 'diamond',
        symbolOffset: [0, '0'],
        symbolSize: [20, 10],
        type: 'scatter',
        coordinateSystem: 'geo',
        geoIndex: 0,
        zlevel: 3,
        itemStyle: {
          // color: '#F7AF21',
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              {
                offset: 0,
                color: '#0d7cd0' // 最左边
              }, {
                offset: 0.5,
                color: '#0d7cd0' // 左边的右边 颜色
              }, {
                offset: 0.5,
                color: '#035db2' // 右边的左边 颜色
              }, {
                offset: 1,
                color: '#035db2'
              }],
            global: false, // 缺省为 false
          },
          opacity: 1
        },
        silent: true,
        data: scatterData2()
      },

    ]
  },
  machToolOption: {
    tooltip: {
      showContent: true,
      trigger: 'axis',
      backgroundColor: 'rgba(8,36,68,.7)',
      color: '#fff',
      textStyle: {
        color: '#fff'
      },
    },
    legend: {
      show: false
    },
    grid: {
      left: '30%',
      right: '25%',
      top: '6%',
      bottom: "5%",
      width: 150,
    },
    xAxis: [{
      splitLine: {
        show: false
      },
      type: 'value',
      show: true,
      axisLine: {
        show: false,
        lineStyle: {
          color: '#80c5ff'
        }
      },
      splitNumber: 2,
      axisLabel: {
        show: false,
        interval: 5,
        color: '#fff',
        fontSize: 14,
      },
    }],
    yAxis: [{
      splitLine: {
        show: false
      },
      offset: 1,
      axisLine: { //y轴
        show: false,
        lineStyle: {
          color: '#80c5ff',
        }
      },
      type: 'category',
      axisTick: {
        show: false
      },
      inverse: true,
      axisLabel: {
        color: '#A7D6F4',
        fontSize: 14,
        margin: 10,
      },
      data: ['拖拉机机具', '松深机', '旋耕机', '灭茬机', '播种机', '耕地犁', '翻转犁', '打捆机'],
    }],
    series: [
      {
        name: '数量',
        type: 'bar',
        barWidth: 7, // 柱子宽度
        showBackground: true,
        MaxSize: 0,
        backgroundStyle: {
          color: "#025099"
        },
        label: {
          show: true,
          color: '#A7D6F4',
          fontSize: 14,
          distance: 20, // 距离
          formatter: '{c} ', // 这里是数据展示的时候显示的数据
          align: "center",
          // position:"right"
          position: [180, 0]
        }, // 柱子上方的数值
        itemStyle: {
          barBorderRadius: [0, 0, 0, 0], // 圆角（左上、右上、右下、左下）
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
            offset: 0,
            color: '#51C5FD'
          },  {
            offset: 1,
            color: '#005BB1'
          }

          ], false), // 渐变
        },
        data: [400, 380, 360, 340, 320, 300, 280, 260]
      },]
  },
  workOption: {
    tooltip: {
      showContent: true,
      trigger: 'axis',
      backgroundColor: 'rgba(8,36,68,.7)',
      color: '#fff',
      textStyle: {
        color: '#fff'
      },
    },
    legend: {
      show: false
    },
    grid: {
      left: '30%',
      right: '25%',
      top: '6%',
      bottom: "5%",
      width: 150,
    },
    xAxis: [{
      splitLine: {
        show: false
      },
      type: 'value',
      axisLine: {
        show: false,
        lineStyle: {
          color: '#80c5ff'
        }
      },
      splitNumber: 2,
      axisLabel: {
        show: false,
        interval: 5,
        color: '#fff',
        fontSize: 14,
      },
    }],
    yAxis: [{
      splitLine: {
        show: false
      },
      offset: 1,
      axisLine: { //y轴
        show: false,
        lineStyle: {
          color: '#80c5ff',
        }
      },
      type: 'category',
      axisTick: {
        show: false
      },
      inverse: true,
      axisLabel: {
        color: '#A7D6F4',
        fontSize: 14,
        margin: 10,
      },
      data: ['耕整作业', '种植作业', '深松整地', '植保作业', '油菜轮作', '收获作业', '收货后处理', '秸秆处理'],
    }],
    series: [
      {
        name: '数量(万亩)',
        type: 'bar',
        barWidth: 7, // 柱子宽度
        showBackground: true,
        MaxSize: 0,
        backgroundStyle: {
          color: "#025099"
        },
        label: {
          show: true,
          color: '#A7D6F4',
          fontSize: 14,
          distance: 20, // 距离
          formatter: '{c} ', // 这里是数据展示的时候显示的数据
          align: "center",
          position: [180, 0]
        }, // 柱子上方的数值
        itemStyle: {
          barBorderRadius: [0, 0, 0, 0], // 圆角（左上、右上、右下、左下）
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
            offset: 0,
            color: '#51C5FD'
          },  {
            offset: 1,
            color: '#005BB1'
          }

          ], false), // 渐变
        },
        data: [400, 380, 360, 340, 320, 300, 280, 260]
      },]
  },
  statisMapOption: {
    tooltip: {
      showContent: true,
      trigger: 'axis',
      backgroundColor: 'rgba(8,36,68,.7)',
      color: '#fff',
      textStyle: {
        color: '#fff'
      },
    },
    legend: {
      show: false
    },
    grid: {
      left: '40%',
      top: '6%',
      width: '50%',
    },
    xAxis: [{
      splitLine: {
        show: false
      },
      type: 'value',
      show: false,
    }],
    yAxis: [{
      splitLine: {
        show: false
      },
      axisLine: { //y轴
        show: false
      },

      type: 'category',
      axisTick: {
        show: false
      },
      inverse: true,
      data: ['拖拉机机具', '松深机', '旋耕机', '灭茬机', '播种机', '耕地犁', '翻转犁', '打捆机'],
      axisLabel: {
        color: '#A7D6F4',
        fontSize: 14,
        margin: 20,
      },

    }],
    series: [
      {
        name: '农机数量',
        type: 'bar',
        barWidth: 10, // 柱子宽度
        showBackground: true,
        MaxSize: 0,
        backgroundStyle: {
          color: "#0c3151"
        },
        label: {
          show: true,
          color: '#A7D6F4',
          fontSize: 14,
          distance: 20, // 距离
          formatter: '{c} ', // 这里是数据展示的时候显示的数据
          align: "center",
          // position:"right"
          position: ['100%', 0]
        }, // 柱子上方的数值
        itemStyle: {
          barBorderRadius: [0, 0, 0, 0], // 圆角（左上、右上、右下、左下）
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
            offset: 0,
            color: '#005BB1'
          }, {
            offset: 0.8,
            color: '#51C5FD'
          }, {
            offset: 1,
            color: '#51C5FD'
          }

          ], false), // 渐变
        },
        data: [400, 380, 360, 340, 320, 300, 280, 260]
      },]
  },
}