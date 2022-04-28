export function lineMaxHeight (yList) {
  const maxValue = Math.max(...yList.map(item => item.value))
  return 0.5/maxValue
}
export function lineData(yList,geoCoordMap) {
  return yList.map((item) => {
    return {
      coords: [geoCoordMap[item.name], [geoCoordMap[item.name][0], geoCoordMap[item.name][1] + item.value * lineMaxHeight(yList)]]
    }
  })
}
// 柱状体的顶部
export function scatterData (yList,geoCoordMap) {
  return yList.map((item) => {
    return [geoCoordMap[item.name][0], geoCoordMap[item.name][1] + item.value * lineMaxHeight(yList)]
  })
}
// 柱状体的底部
export function scatterData2 (yList,geoCoordMap) {
  return yList.map((item) => {
    return {
      name: item.name,
      value: geoCoordMap[item.name]
    }
  })
}