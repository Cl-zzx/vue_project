<template>
    <!-- 容器 -->
    <div class="charts" ref="charts"></div>
</template>

<script>
import echarts from 'echarts';
export default {
    mounted() {
        // console.log(echarts);
        // 初始化echarts实例
        let lineCharts = echarts.init(this.$refs.charts)
        // 配置数据
        lineCharts.setOption({
            xAxis: {
                // 隐藏X轴
                show: false,
                type: 'category'
            },
            yAxis: {
                // 隐藏Y轴
                show: false
            },
            series: [
                
                {
                    smooth: true,
                    type: 'line',
                    data: [10, 7, 33, 12, 48, 9, 29, 10, 44],
                    // 拐点样式的设置
                    itemStyle: {
                        opacity: 0
                    },
                    // 线条的样式
                    color: 'purple',
                    // 填充颜色设置
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: 'purple' // 0% 处的颜色
                            }, {
                                offset: 1, color: 'white' // 100% 处的颜色
                            }],
                            global: false // 缺省为 false
                        }
                    }
                }
            ],
            // 布局调试
            grid: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
            }
        })
    },
}
</script>

<style scoped>
.charts {
    width: 100%;
    height: 100%;
}
</style>