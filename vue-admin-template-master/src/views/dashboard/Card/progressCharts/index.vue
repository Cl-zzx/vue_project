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
                min: 0,
                max: 100
            },
            yAxis: {
                // 隐藏Y轴
                show: false,
                type: 'category',
            },
            series: [

                {
                    type: 'bar',
                    data: [78],
                    // 柱子的样式
                    color: 'yellowgreen',
                    // 设置显示背景颜色
                    showBackground: true,
                    // 设置柱状图柱子的宽度
                    barWidth: 10,
                    // 设置背景颜色
                    backgroungStyle: {
                        color: '#eee'
                    },
                    // 文本
                    label: {
                        show: true,
                        // 文本内容
                        formatter: '|',
                        // 文本标签位置调试
                        position: 'right'
                    }
                }
            ],
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