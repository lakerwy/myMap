<template>
  <div class="echarts" v-if="reloadVal">
    <div style="width:100%;height:100%" ref="sctterMap"></div>
    <!--    <div class="statisMap" id="statisMap"></div>-->
    <div class="mapChoose">
      <span v-for="(item,index) in parentInfo" :key="item.code" class="titleBox">
        <span class="title" @click="chooseArea(item,index)">{{ item.cityName == '全国' ? '湖北' : item.cityName }}</span>
        <span class="icon" v-show="index+1!=parentInfo.length">></span>
      </span>
    </div>
    <div class="box" v-show="showBox" ref="showBox">
      <div class="title">{{ city }}{{ title }}数量统计
        <div class="close-container"><img src="@/assets/images/one-picture-close.png" @click="close"></div>
      </div>
      <div id="histogChart" class="histogChart">
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import resize from "./mixins/resize";
import {throttle} from "../../util/debounce";
import {initEcharts} from "../../util/chart";
import echartOption from "./js/echartOption";
import {getAreaMachine, getGroupData, getStatGroupData} from "../../api/agridata";
import {lineData, scatterData, scatterData2} from "./js/utils"
import {valueTofixed} from "../../util/util";
import { mapState, mapMutations } from "vuex";

export default {
  name: "sctterMap",
  mixins: [resize],
  props: {
    title: {
      type: String,
      default: '农机'
    }
  },
  data() {
    return {
      reloadVal: true,
      workData: [
        {name: '耕整作业', value: '', prop: 'tillageAndLandPreparation'},
        {name: '种植作业', value: '', prop: 'plantingOperation'},
        {name: '深松整地', value: '', prop: 'jobTypeSubsoiling'},
        {name: '植保作业', value: '', prop: 'plantProtectionOperation'},
        {name: '油菜轮作', value: '', prop: 'jobTypeYoucai'},
        {name: '收获作业', value: '', prop: 'harvestingOperation'},
        {name: '收货后处理', value: '', prop: 'afterTreatment'},
        {name: '秸秆处理', value: '', prop: 'strawTreatment'}
      ],
      city: '武汉市',
      showBox: false,
      myCharts: null,
      geoJson: {
        features: []
      },
      parentInfo: [{
        cityName: "湖北",
        code: 420000
      }],
      adress: {
        city: "",
        county: "",
        nation: "",
        province: "湖北省",
        town: ""
      }
    };
  },
  mounted() {
    this.getGeoJson(420000);
    // initEcharts('statisMap', echartOption.statisMapOption);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.domClick)
  },
  watch: {
    "parentInfo": {
      handler(newName, oldName) {
        let obj= Object.assign({},this.adress)
        switch (newName.length) {
          case 1:
            this.setCityAdress(obj);
            break;
          case 2:
            obj.city= this.parentInfo[1].cityName;
            this.setCityAdress(obj);
            break;
          case 3:
            obj.city = this.parentInfo[1].cityName;
            obj.county = this.parentInfo[2].cityName;
            this.setCityAdress(obj);
            break;
          default:
            break;
        }
      },
    }
  },
  computed: {
    ...mapState(["cityAdress"]),
  },
  methods: {
    ...mapMutations(["setCityAdress"]),
    reload() {
      this.reloadVal = false;
      this.$nextTick(() => {
        this.reloadVal = true;
      })
    },
    //获取地图Json数据
    getGeoJson(adcode) {
      let that = this;
      AMapUI.loadUI(["geo/DistrictExplorer"], DistrictExplorer => {
        var districtExplorer = new DistrictExplorer();
        districtExplorer.loadAreaNode(adcode, function (error, areaNode) {
          if (error) {
            console.error(error);
            return;
          }
          let Json = areaNode.getSubFeatures();
          if (Json.length > 0) {
            that.geoJson.features = Json;
          } else if (Json.length === 0) {
            that.geoJson.features = that.geoJson.features.filter(
                item => item.properties.adcode == adcode
            );
            if (that.geoJson.features.length === 0) return;
          }
          that.getMapData();
        });
      });
    },
    //农机统计
    async getAreaMachine(){
      let res = await getAreaMachine(Object.assign({},this.cityAdress));
      let obj={};
      if (res.success) {
        res.groupNames.forEach((item,index)=>{
          obj[item] = res.datas[index];
        })
        return obj;
      }
    },
    //获取数据
    async getMapData() {
      let obj = {}
      if(this.title == '农机'){
        //农机统计
        obj = await this.$parent.$children[1].getAreaMachine();
      } else {
        //作业统计
        obj = await this.$parent.$children[1].getAreaWork();
      }
      //农机统计
      let mapData = this.geoJson.features.map(item => {
        let value = 0;
        if(obj[item.properties.name]){
          value = obj[item.properties.name]
        }
        return {
          name: item.properties.name,
          value: value,
          cityCode: item.properties.adcode
        };
      });
      mapData = mapData.sort(function (a, b) {
        return b.value - a.value;
      });
      this.initEcharts(mapData);
    },
    initEcharts(mapData) {
      var min = mapData[mapData.length - 1].value;
      var max = mapData[0].value;
      this.myChart = echarts.init(this.$refs.sctterMap);
      echarts.registerMap("Map", this.geoJson); //注册
      let mapJson = echarts.getMap('Map').geoJSON;
      let geoCoordMap = {};
      mapJson.features.forEach(item => {
        geoCoordMap[item.properties.name] = item.properties.centroid;
      })
      this.myChart.setOption({
            geo: {
              map: 'Map',
              roam: false,
              zoom: 1.2, //缩放比例
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
                  borderColor: '#caf0f8',
                  shadowColor: 'rgba(25,164,243,1)',//外发光
                  shadowBlur: 20,
                  borderWidth: 2,
                },
                emphasis: {
                  areaColor: '#13CCD4',
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
            visualMap: {
              min: min,
              max: max,
              left: "2%",
              top: "8%",
              calculable: true,
              seriesIndex: [0],
              inRange: {
                color: ["#b5caf7","#5988ee","#154fcb",]
              },
              textStyle: {
                color: "#24CFF4"
              }
            },
            series: [
              {
                geoIndex: 0,
                name: "地图",
                type: "map",
                map: "Map",
                roam: true, //是否可缩放
                zoom: 1.2, //缩放比例
                data: mapData,
                label: {
                  normal: {
                    show: true,
                    color: "rgb(249, 249, 249)", //省份标签字体颜色
                    formatter: p => {
                      return p.name;
                    }
                  },
                  emphasis: {
                    show: true,
                    color: "rgb(249, 249, 249)", //省份标签字体颜色
                  }
                },
                itemStyle: {
                  normal: {
                    areaColor: 'rgba(6,46,96,0.2)',
                    borderColor: '#',
                    shadowColor: 'rgba(25,164,243,1)',//外发光
                    shadowBlur: 20,
                    borderWidth: 2,
                  },
                  emphasis: {
                    areaColor: '#066e6e',
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
              },
              //柱子部分
              // {
              //   type: 'lines',
              //   zlevel: 4,
              //   effect: {
              //     show: false,
              //     symbolSize: 5 // 图标大小
              //   },
              //   lineStyle: {
              //     width: 20, // 尾迹线条宽度
              //     // color: 'rgb(22,255,255, .6)',
              //     color: {
              //       type: 'linear',
              //       x: 0,
              //       y: 0,
              //       x2: 1,
              //       y2: 0,
              //       colorStops: [
              //         {
              //           offset: 0,
              //           color: 'rgba(17,166,106,.9)' // 最左边
              //         }, {
              //           offset: 0.5,
              //           color: 'rgba(17,166,106,.9)' // 左边的右边 颜色
              //         }, {
              //           offset: 0.5,
              //           color: 'rgba(12,134,135,.9)' // 右边的左边 颜色
              //         }, {
              //           offset: 1,
              //           color: 'rgba(12,134,135,.9)'
              //         }],
              //       global: false, // 缺省为 false
              //     },
              //     opacity: 1, // 尾迹线条透明度
              //     curveness: 0 // 尾迹线条曲直度
              //   },
              //   label: {
              //     show: 0,
              //     position: 'end',
              //     formatter: '245'
              //   },
              //   silent: true,
              //   data: lineData(mapData,geoCoordMap)
              // },
              // // 柱状体的顶部
              // {
              //   type: 'scatter',
              //   symbol: 'diamond',
              //   symbolOffset: [0, 0],
              //   symbolSize: [20, 10],
              //   itemStyle: {
              //     normal: {
              //       color: 'rgba(17,166,106,1)',
              //     }
              //   },
              //   coordinateSystem: 'geo',
              //   geoIndex: 0,
              //   zlevel: 5,
              //   silent: true,
              //   data: scatterData(mapData,geoCoordMap)
              // },
              // // 柱状体的底部
              // {
              //
              //   symbol: 'diamond',
              //   symbolOffset: [0, '0'],
              //   symbolSize: [20, 10],
              //   type: 'scatter',
              //   coordinateSystem: 'geo',
              //   geoIndex: 0,
              //   zlevel: 3,
              //   itemStyle: {
              //     // color: '#F7AF21',
              //     color: {
              //       type: 'linear',
              //       x: 0,
              //       y: 0,
              //       x2: 1,
              //       y2: 0,
              //       colorStops: [
              //         {
              //           offset: 0,
              //           color: 'rgba(17,166,106,1)' // 最左边
              //         }, {
              //           offset: 0.5,
              //           color: 'rgba(17,166,106,1)' // 左边的右边 颜色
              //         }, {
              //           offset: 0.5,
              //           color: 'rgba(12,134,135,1)' // 右边的左边 颜色
              //         }, {
              //           offset: 1,
              //           color: 'rgba(12,134,135,1)'
              //         }],
              //       global: false, // 缺省为 false
              //     },
              //     opacity: 1
              //   },
              //   silent: true,
              //   data: scatterData2(mapData,geoCoordMap)
              // },
            ]
          },
          true
      );
      let that = this;
      this.myChart.off("click");
      this.myChart.on("click", params => {
        if (
            that.parentInfo[that.parentInfo.length - 1].code ==
            params.data.cityCode
        ) {
          return;
        }
        let data = params.data;
        that.parentInfo.push({
          cityName: data.name,
          code: data.cityCode
        });
        that.getGeoJson(data.cityCode);
      });
      this.myChart.off('mousemove');
      this.myChart.on("mousemove", throttle(function (params) {
        params.event.event ? params.event.event.stopPropagation() : event.cancelBubble = true
        if (params.name) {
          that.showBox = true
          if (that.city != params.name) {
            if (that.title == '农机') {
              that.getMachineDataGroup(params.name);
            } else {
              that.getWorkGroup(params.name);
            }
          }
          that.city = params.name;
          if (that.showBox) that.fixingPositon()
        } else {
          that.showBox = false
        }
      }, 100));
      this.myChart.getZr().on("mousemove", params=> {
        let pointInPixel= [params.offsetX, params.offsetY];
        if (!this.myChart.containPixel({geoIndex: 0},pointInPixel)) {
          this.showBox = false;
        }
      })
      document.addEventListener('click', this.domClick)
    },
    domClick(e) {
      if (!document.querySelector('.box').contains(e.target)) {
        this.showBox = false
      }
    },
    fixingPositon() {
      const e = event || window.event,
          top = e.offsetY, left = e.offsetX + 30,
          boxDom = document.querySelector('.box');
      this.$nextTick(function () {
        boxDom.style.cssText = `top: ${top}px; left: ${left}px`;
      })
    },

    //选择切换市县
    chooseArea(val, index) {
      if (this.parentInfo.length === index + 1) {
        return
      }
      this.parentInfo.splice(index + 1)
      this.getGeoJson(this.parentInfo[this.parentInfo.length - 1].code);

    },

    //农机数量统计
    async getMachineDataGroup(name) {
      let city = '', county = '';
      if (this.parentInfo.length > 1) {
        city = this.parentInfo[1].cityName;
        county = name;
      } else {
        city = name;
      }
      let res = await getGroupData({
        city: city,
        county: county,
        province: "湖北省",
      })
      if (res.success) {
        let name = [], value = [];
        res.data.forEach(item => {
          name.push(item.key);
          value.push(item.data);
        })
        this.$set(echartOption.machToolOption.yAxis[0], 'data', name);
        this.$set(echartOption.machToolOption.series[0], 'data', value);
        initEcharts('histogChart', echartOption.machToolOption);
      }
    },
    //作业数量统计
    async getWorkGroup(name) {
      let city = '', county = '';
      if (this.parentInfo.length > 1) {
        city = this.parentInfo[1].cityName;
        county = name;
      } else {
        city = name;
      }
      let res = await getStatGroupData({
        city: city,
        county: county,
        province: "湖北省",
      })
      if (res.success) {
        let name = [], value = [];
        this.workData.forEach(item => {
          name.push(item.name);
          value.push(valueTofixed(res.data[item.prop]))
        })
        this.$set(echartOption.workOption.yAxis[0], 'data', name);
        this.$set(echartOption.workOption.series[0], 'data', value);
        initEcharts('histogChart', echartOption.workOption);
      }
    },
    close() {
      this.showBox = false
    }
  }
};
</script>
<style lang="scss" scoped>
.echarts {
  width: 100%;
  height: 100%;
  position: absolute;

  .statisMap {
    position: absolute;
    top: 0;
    right: 0;
    width: 30%;
    height: 100%;
  }
}

.mapChoose {
  position: absolute;
  left: 20px;
  top: 10px;
  color: #eee;


  .titleBox {
    position: relative;
    margin-right: 30px;
  }

  .title {
    padding: 5px;
    //border-top: 1px solid rgba(147, 235, 248, .8);
    //border-bottom: 1px solid rgba(147, 235, 248, .8);
    cursor: pointer;
  }

  .icon {
    position: absolute;
    top: -5px;
    font-family: "simsun";
    font-size: 22px;
    margin: 0 11px;
  }
}

.box {
  position: absolute;
  top: 0px;
  width: 320px;
  height: 294px;
  border: 1px solid #64bfff;
  background: rgba(6, 27, 58, 0.8);
  z-index: 99;

  .title {
    width: 320px;
    height: 41px;
    padding-left: 10px;
    font-family: SourceHanSansCN-Medium;
    //background: url("../../assets/images/mapChartBg.png");
    background-size: 100% 100%;
    font-size: 16px;
    font-weight: normal;
    color: #ffffff;
    position: relative;
    line-height: 41px;

    .close-container {
      position: absolute;
      top: 0px;
      right: 20px;
      cursor: pointer;
    }
  }

  .histogChart {
    width: 320px;
    height: 253px;
    z-index: 999;
  }
}
</style>