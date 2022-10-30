<template>
    <div>
        <!-- 表格 -->
        <el-table style="width: 100%;" border :data="records">
            <el-table-column label="序号" width="80" type="index" align="centr"></el-table-column>
            <el-table-column label="名称" width="width" prop="skuName"></el-table-column>
            <el-table-column label="描述" width="width" prop="skuDesc"></el-table-column>
            <el-table-column label="默认图片" width="110">
                <template slot-scope="{row}">
                    <img :src="row.skuDefaultImg" alt="" style="width: 80px; height: 80px;">
                </template>
            </el-table-column>
            <el-table-column label="重量" width="80" prop="weight"></el-table-column>
            <el-table-column label="价格" width="80" prop="price"></el-table-column>
            <el-table-column label="操作" width="width">
                <template slot-scope="{row}">
                    <el-button type="info" icon="el-icon-bottom" size="mini" title="下架" v-if="row.isSale == 1"
                        @click="cancel(row)">
                    </el-button>
                    <el-button type="success" icon="el-icon-top" size="mini" title="上架" v-else @click="sale(row)">
                    </el-button>
                    <el-button type="primary" icon="el-icon-edit" size="mini" title="修改" @click="showMessage">
                    </el-button>
                    <el-button type="info" icon="el-icon-info" size="mini" title="信息" @click="getSkuInfo(row)">
                    </el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" title="删除"></el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页器 -->
        <!-- 
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
         -->
        <el-pagination style="text-align:center;" :total="total" :current-page="page" :page-size="limit"
            :page-sizes="[3, 5, 10]" layout="prev,pager,next,jumper,->,sizes,total" @current-change="getSkuList"
            @size-change="handleSizeChange">
        </el-pagination>

        <!-- 抽屉效果 -->
        <el-drawer :visible.sync="show" size="40%" :show-close="false">
            <el-row>
                <el-col :span="5">

                    <h3>名称</h3>
                </el-col>
                <el-col :span="16">
                    {{ skuInfo.skuName }}
                </el-col>
            </el-row>

            <el-row>
                <el-col :span="5">
                    <h3>描述</h3>
                </el-col>
                <el-col :span="16">
                    {{ skuInfo.skuDesc }}
                </el-col>
            </el-row>

            <el-row>
                <el-col :span="5">
                    <h3>价格</h3>
                </el-col>
                <el-col :span="16">
                    {{ skuInfo.price }}元
                </el-col>
            </el-row>

            <el-row>
                <el-col :span="5">
                    <h3>平台属性</h3>
                </el-col>
                <el-col :span="16">
                    <el-tag type="success" v-for="attr in skuInfo.skuAttrValueList" :key="attr.id"
                        style="margin: 5px 10px;">{{ attr.attrName }}</el-tag>
                </el-col>
            </el-row>

            <el-row>
                <el-col :span="5">
                    <h3>商品图片</h3>
                </el-col>
                <el-col :span="16">
                    <el-carousel>
                        <el-carousel-item v-for="item in skuInfo.skuImageList" :key="item.id">
                            <img :src="item.imgUrl" alt="" height="460px">
                        </el-carousel-item>
                    </el-carousel>
                </el-col>
            </el-row>
        </el-drawer>
    </div>
</template>

<script>
export default {
    name: 'Sku',
    data() {
        return {
            page: 1,//代表当前第几页
            limit: 10,//代表当前页面有几条数据
            total: 0,//存储分页器总数居条数的数据
            records: [],//存储sku列表的数据
            skuInfo: {},//存储skuInfo的数据
            show: false//控制抽屉显示与隐藏的字段

        }
    },
    mounted() {
        this.getSkuList()
    },
    methods: {
        // 获取sku列表数据的方法
        async getSkuList(pages = 1) {
            this.page = pages
            const { page, limit } = this
            let result = await this.$API.sku.reqSkuList(page, limit)
            // console.log(result);
            if (result.code == 200) {
                this.total = result.data.total
                this.records = result.data.records
            }

        },
        handleSizeChange(limit) {
            this.limit = limit
            this.getSkuList()
        },
        // 上架的操作
        async sale(row) {
            let result = await this.$API.sku.reqSale(row.id)
            if (result.code == 200) {
                row.isSale = 1
                this.$message({
                    type: 'success',
                    message: '上架成功'
                })
                this.getSkuList(this.page)
            }
        },
        // 下架的操作
        async cancel(row) {
            let result = await this.$API.sku.reqCancel(row.id)
            if (result.code == 200) {
                row.isSale = 0
                this.$message({
                    type: 'warning',
                    message: '下架成功'
                })
                this.getSkuList(this.page)
            }
        },
        showMessage() {
            this.$message({
                type: 'info',
                message: '正在开发中...敬请期待'
            })
        },
        // 获取sku详情的方法
        async getSkuInfo(sku) {
            // 打开抽屉
            this.show = true
            // 获取数据
            let result = await this.$API.sku.reqSkuById(sku.id)
            // console.log(result);
            if (result.code == 200) {
                this.skuInfo = result.data
            }
        }

    },
}
</script>

<style>
.el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 150px;
    margin: 0;
}

.el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
}
</style>
<style scoped>
.el-row .el-col-5 {
    font-size: 20px;
    text-align: right;
    margin-top: -20px;
    margin-right: 20px;
}

.el-row .el-col-16 {
    margin-top: 5px;
    margin-left: 10px;
}

>>>.el-carousel__button {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background-color: red;
}
</style>