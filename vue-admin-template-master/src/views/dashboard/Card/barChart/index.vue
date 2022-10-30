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
                type: 'category',
            },
            yAxis: {
                // 隐藏Y轴
                show: false
            },
            series: [

                {
                    type: 'bar',
                    data: [40, 67, 53, 82, 148, 59, 39, 110, 44, 65, 33, 91],
                    // 柱子的样式
                    color: 'blue',
                }
            ],
            // 提示信息
            tooltip: {}
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