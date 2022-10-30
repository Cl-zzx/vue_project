<template>
    <el-card class="box-card" style="margin: 10px 0;">
        <div slot="header" class="clearfix">
            <!-- v-model="activeName" @tab-click="handleClick" -->
            <!-- 头部左侧内容 -->
            <el-tabs class="tab" v-model="activeName">
                <el-tab-pane label="销售额" name="销售额"></el-tab-pane>
                <el-tab-pane label="访问量" name="访问量"></el-tab-pane>
            </el-tabs>
            <!-- 头部右侧内容 -->
            <div class="right">
                <span @click="setDay">今日</span>
                <span @click="setWeek">本周</span>
                <span @click="setMonth">本月</span>
                <span @click="setYear">本年</span>
                <!-- v-model="value1" -->
                <el-date-picker class="date" v-model="date" size="mini" type="daterange" range-separator="-"
                    start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd">
                </el-date-picker>
            </div>
        </div>
        <div>
            <el-row :gutter="10">
                <el-col :span="18">
                    <!-- 准备一个容器 -->
                    <div class="charts" ref="charts"></div>
                </el-col>
                <el-col :span="6">
                    <h4>门店{{ activeName }}排名</h4>
                    <ul>
                        <li>
                            <span class="rindex">1</span>
                            <span class="rtitle">肯德基</span>
                            <span class="rvalue">43522</span>
                        </li>
                        <li>
                            <span class="rindex">2</span>
                            <span class="rtitle">麦当劳</span>
                            <span class="rvalue">43122</span>
                        </li>
                        <li>
                            <span class="rindex">3</span>
                            <span class="rtitle">炭火蛙</span>
                            <span class="rvalue">34882</span>
                        </li>
                        <li>
                            <span>4</span>
                            <span class="rtitle">黄牛肉</span>
                            <span class="rvalue">32822</span>
                        </li>
                        <li>
                            <span>5</span>
                            <span class="rtitle">炒菜馆</span>
                            <span class="rvalue">23732</span>
                        </li>
                        <li>
                            <span>6</span>
                            <span class="rtitle">黄焖鸡</span>
                            <span class="rvalue">23894</span>
                        </li>
                        <li>
                            <span>7</span>
                            <span class="rtitle">炸酱面</span>
                            <span class="rvalue">18181</span>
                        </li>
                    </ul>
                </el-col>
            </el-row>
        </div>
    </el-card>
</template>

<script>
// 引入echarts
import dayjs from 'dayjs'
import echarts from 'echarts'
import { mapState } from 'vuex'
export default {
    data() {
        return {
            activeName: '销售额',
            myCharts: null,
            // 收集日历的数据
            date: []
        }
    },
    mounted() {
        this.myCharts = echarts.init(this.$refs.charts)
        this.myCharts.setOption({
            title: {
                text: this.activeName + '趋势'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: this.listState.orderFullYearAxis,
                    axisTick: {
                        alignWithLabel: true
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: [
                {
                    name: 'Direct',
                    type: 'bar',
                    barWidth: '60%',
                    color: 'yellowgreen',
                    data: this.listState.orderFullYear
                }
            ]
        })
    },
    // 上方是mounted，为什么第一次没有数据？因为没有数据因此不显示
    computed: {
        ...mapState({
            listState: state => state.home.list
        })
    },
    // 监听属性
    watch: {
        activeName() {
            // 图表的配置数据可以再次修改，如果有新的值，则使用新的值，如果没有则使用原来的值
            this.myCharts.setOption({
                title: {
                    text: this.activeName + '趋势'
                },
                xAxis: {
                    data: this.activeName == '销售额' ? this.listState.orderFullYearAxis : this.listState.userFullYearAxis
                },
                series: [
                    {
                        data: this.activeName == '销售额' ? this.listState.orderFullYear : this.listState.userFullYear
                    }
                ]

            })
        },
        // 监听服务器传回来的数据
        listState() {
            this.myCharts.setOption({
                title: {
                    text: this.activeName + '趋势'
                },
                xAxis: {
                    data: this.activeName == '销售额' ? this.listState.orderFullYearAxis : this.listState.userFullYearAxis
                },
                series: [
                    {
                        data: this.activeName == '销售额' ? this.listState.orderFullYear : this.listState.userFullYear
                    }
                ]

            })
        }
    },


    methods: {
        // 本天
        setDay() {
            const day = dayjs().format('YYYY-MM-DD')
            this.date = [day, day]
        },
        // 本周
        setWeek() {
            const start = dayjs().day(1).format('YYYY-MM-DD')
            const end = dayjs().day(7).format('YYYY-MM-DD')
            // console.log(start, end);
            this.date = [start, end]
        },
        // 本月
        setMonth() {
            const start = dayjs().startOf('month').format('YYYY-MM-DD')
            const end = dayjs().endOf('month').format('YYYY-MM-DD')
            // console.log(start, end);
            this.date = [start, end]
        },
        // 本年
        setYear() {
            const start = dayjs().startOf('year').format('YYYY-MM-DD')
            const end = dayjs().endOf('year').format('YYYY-MM-DD')
            // console.log(start, end);
            this.date = [start, end]
        }
    },
}
</script>

<style scoped>
.clearfix {
    position: relative;
    display: flex;
    justify-content: space-between;
}

.tab {
    width: 100%;
}

.right {
    position: absolute;
    right: 0px
}

.date {
    margin: 0 20px;
    width: 220px;
}

.right span {
    margin: 0 10px;
}

.charts {
    width: 100%;
    height: 300px;
}

ul {
    list-style: none;
    height: 300px;
    width: 100%;
    padding: 0;
}

ul li {
    height: 8%;
    margin-bottom: 10px;
}

ul li:nth-child(n+4) {
    margin-left: 4px;
}

ul li:nth-child(n+4) .rtitle {
    margin-left: 35px;
}

.rindex {
    float: left;
    height: 17px;
    width: 17px;
    border-radius: 50%;
    background-color: black;
    color: white;
    text-align: center;
}

.rtitle {
    margin-left: 30px;
}

.rvalue {
    float: right;
}
</style>