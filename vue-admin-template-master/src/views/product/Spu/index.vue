<template>
  <div>
    <el-card style="margin: 20px 0">
      <!-- 三级联动是全局组件 -->
      <CategorySelector @getCategoryId="getCategoryId" :show="scene != 0">
      </CategorySelector>
    </el-card>
    <el-card>
      <!-- 底部这里将来是有三部分进行切换 -->
      <div v-show="scene == 0">
        <el-button type="primary" icon="el-icon-plus" :disabled="!category3Id" @click="addSpu">添加SPU</el-button>
        <el-table border :data="records">
          <el-table-column label="序号" type="index" width="80" align="center">
          </el-table-column>

          <el-table-column label="SPU名称" width="width" prop="spuName">
          </el-table-column>

          <el-table-column label="SPU描述" width="width" prop="description">
          </el-table-column>

          <el-table-column label="操作" width="width" prop="prop">
            <template slot-scope="{ row }">
              <!-- 这里的按钮将来用hintButton替换 -->
              <HintButton type="success" icon="el-icon-plus" size="mini" title="添加sku" @click="addSku(row)">
              </HintButton>
              <HintButton type="warning" icon="el-icon-edit" size="mini" title="修改spu" @click="updateSpu(row)">
              </HintButton>
              <HintButton type="info" icon="el-icon-info" size="mini" title="查看当前spu全部sku列表" @click="handler(row)">
              </HintButton>
              <el-popconfirm :title="`确定删除${row.spuName}吗？`" @onConfirm="deleteSpu(row)">
                <HintButton type="danger" icon="el-icon-delete" size="mini" title="删除spu" slot="reference">
                </HintButton>
              </el-popconfirm>

            </template>
          </el-table-column>
        </el-table>

        <!-- 
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
        -->
        <el-pagination style="text-align: center" :total="total" :current-page="page" :page-size="limit"
          :page-sizes="[3, 5, 10]" layout="prev, pager, next, jumper,->,sizes,total" @current-change="getSpuList"
          @size-change="handleSizeChange">
        </el-pagination>
      </div>
      <SpuForm v-show="scene == 1" @changeScene="changeScene" ref="spu">
      </SpuForm>
      <SkuForm v-show="scene == 2" ref="sku" @changeScenes="changeScenes"></SkuForm>
      <el-dialog :title="`${spu.spuName}的sku列表`" :visible.sync="dialogTableVisible" :before-close="close">
        <!-- 展示skuList的表格 -->
        <el-table :data="skuList" style="width: 100%;" border v-loading="loading">
          <el-table-column label="名称" prop="skuName" width="width"></el-table-column>
          <el-table-column label="价格" prop="price" width="width"></el-table-column>
          <el-table-column label="重量" prop="weight" width="width"></el-table-column>
          <el-table-column label="默认图片" width="width">
            <template slot-scope="{row}">
              <img :src="row.skuDefaultImg" style="width: 100px; height: 100px;" alt="">
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import HintButton from "@/components/HintButton/index.vue";
// 引入子组件
import SpuForm from "./SpuForm";
import SkuForm from "./SkuForm";
export default {
  name: "Spu",
  data() {
    return {
      // 分别是分类的id
      category1Id: "",
      category2Id: "",
      category3Id: "",
      page: 1,
      limit: 3,
      records: [],
      total: 0, //分页器一共需要展示的数据条数
      // scene控制下方的el-card显示哪一部分
      // 0：展示spu列表  1：添加|修改spu  2：添加sku
      scene: 0,
      //用于保存所点击的spu的信息
      spu: {},
      // 控制对话框显示与隐藏的属性
      dialogTableVisible: false,
      // sku列表的数据
      skuList: [],
      // 表格加载数据loading效果
      loading: true
    };
  },
  methods: {
    // 关闭对话框之前的回调函数
    close(done) {
      // loading属性再次变为真
      this.loading = true
      // 清除skuList的数据
      this.skuList = []
      // 关闭对话框
      done()
    },
    // 查看spu的sku列表的回调函数
    async handler(spu) {
      // 保存spu信息 
      this.spu = spu
      this.dialogTableVisible = true
      // 发送请求获取sku列表数据
      let result = await this.$API.spu.reqSkuList(spu.id)
      // console.log(result);
      if (result.code == 200) {
        this.loading = false
        this.skuList = result.data
      }
    },
    // 添加sku的回调函数
    addSku(row) {
      this.scene = 2
      this.$refs.sku.getData(this.category1Id, this.category2Id, row)
    },
    // 删除spu的回调函数
    async deleteSpu(row) {
      // console.log(row);
      let result = await this.$API.spu.reqDeleteSpu(row.id)
      // console.log(result);
      if (result.code == 200) {
        this.$message({
          type: 'success',
          message: '删除成功'
        })
        // 代表的是当前页spu个数大于1删除的时候停留在当前页，否则展示上一页
        this.getSpuList(this.records.length > 1 ? this.page : this.page - 1)
      }
    },
    // 三级联动自定义事件，可以把子组件的相应的id传递给父组件
    getCategoryId({ categoryId, level }) {
      if (level == 1) {
        this.category1Id = categoryId;
        this.category2Id = "";
        this.category3Id = "";
        this.records = [];
      } else if (level == 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
        this.records = [];
      } else {
        this.category3Id = categoryId;
        this.getSpuList();
      }
    },
    // 获取spu列表的方法
    async getSpuList(pages = 1) {
      this.page = pages;
      const { page, limit, category3Id } = this;
      let result = await this.$API.spu.reqSpuList(page, limit, category3Id);
      // console.log(result);
      if (result.code == 200) {
        this.records = result.data.records;
        this.total = result.data.total;
      }
    },
    // 当分页器每一页展示数据条数变化时的回调函数
    handleSizeChange(limit) {
      // 修改参数
      this.limit = limit;
      // 再次发起请求
      this.getSpuList();
    },
    // 添加spu按钮的回调函数
    addSpu() {
      this.scene = 1;
      // 通知子组件发请求
      this.$refs.spu.addSpuData(this.category3Id);
    },
    // 修改某一个spu的回调函数
    updateSpu(row) {
      this.scene = 1;
      // 调用子组件的方法
      // 在父组件中可以通过$ref或者$children获取子组件
      this.$refs.spu.initSpuData(row);
    },
    // 子组件spuForm的自定义事件的回调
    changeScene({ scene, flag }) {
      this.scene = scene;
      if (flag == "修改") {
        this.getSpuList(this.page);
      } else {
        this.getSpuList();
      }
    },
    // 子组件skuForm的自定义事件的回调
    changeScenes(scene) {
      this.scene = scene
    }
  },
  components: {
    HintButton,
    SpuForm,
    SkuForm,
  },
};
</script>

<style>

</style>
