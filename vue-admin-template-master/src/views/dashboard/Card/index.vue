<template>
    <div>
        <el-row :gutter="10">

            <el-col :span="6">
                <el-card>
                    <!-- 第一个Card -->
                    <Detail title="总销售额" count="￥12306">
                        <template slot="charts">
                            <span>周同比 56.17%</span>&nbsp;
                            <svg t="1666855001482" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="3717" width="16" height="16">
                                <path d="M65.582671 735.208665l446.417329-446.41733 446.417329 446.41733z" p-id="3718"
                                    fill="#d81e06"></path>
                            </svg>

                            <span>日同比 13.35%</span>&nbsp;
                            <svg t="1666855068526" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="4770" width="16" height="16">
                                <path d="M65.582671 288.791335l446.417329 446.41733 446.417329-446.41733z" p-id="4771"
                                    fill="#1afa29"></path>
                            </svg>
                        </template>

                        <template slot="footer">
                            <span>日销售额￥12421</span>
                        </template>
                    </Detail>
                </el-card>
            </el-col>

            <el-col :span="6">
                <el-card>
                    <!-- 第二个Card -->
                    <Detail title="访问量" count="88460">
                        <template slot="charts">
                            <lineChart></lineChart>
                        </template>
                        <template slot="footer">
                            <span>日访问量1234</span>
                        </template>
                    </Detail>
                </el-card>
            </el-col>

            <el-col :span="6">
                <el-card>
                    <!-- 第三个Card -->
                    <Detail title="支付笔数" count="55423">
                        <template slot="charts">
                            <barChart></barChart>
                        </template>
                        <template slot="footer">
                            <span>转化率65%</span>
                        </template>
                    </Detail>
                </el-card>
            </el-col>

            <el-col :span="6">
                <el-card>
                    <!-- 第四个Card -->
                    <Detail title="运营活动效果" count="78%">
                        <template slot="charts">
                            <processCharts></processCharts>
                        </template>
                        <template slot="footer">
                            <span>周同比 12%</span>&nbsp;
                            <svg t="1666855001482" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="3717" width="16" height="16">
                                <path d="M65.582671 735.208665l446.417329-446.41733 446.417329 446.41733z" p-id="3718"
                                    fill="#d81e06"></path>
                            </svg>

                            <span>日同比 11%</span>&nbsp;
                            <svg t="1666855068526" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="4770" width="16" height="16">
                                <path d="M65.582671 288.791335l446.417329 446.41733 446.417329-446.41733z" p-id="4771"
                                    fill="#1afa29"></path>
                            </svg>
                        </template>
                    </Detail>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import Detail from './Detail'
import lineChart from './lineChart'
import barChart from './barChart'
import processCharts from './progressCharts'
export default {
    components: {
        Detail,
        lineChart,
        barChart,
        processCharts
    }
}
</script>

<style>

</style>