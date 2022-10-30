<template>
  <div>
    <el-card style="margin: 20px 0">
      <CategorySelector @getCategoryId="getCategoryId" :show="!isShowTable"></CategorySelector>
    </el-card>

    <el-card>
      <div v-show="isShowTable">
        <el-button type="primary" icon="el-icon-plus" :disabled="!category3Id" @click="addAttr">添加属性
        </el-button>

        <!-- 表格:展示平台属性 -->
        <el-table :data="attrList" border width="100%">
          <el-table-column type="index" align="center" width="80" label="序号"></el-table-column>

          <el-table-column label="属性名称" prop="attrName" width="150"></el-table-column>

          <el-table-column label="属性值列表">
            <template slot-scope="{ row }">
              <el-tag type="success" v-for="attrValue in row.attrValueList" :key="attrValue.id" style="margin: 0 10px">
                {{ attrValue.valueName }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="150">
            <template slot-scope="{row }">
              <el-button type="warning" icon="el-icon-edit" size="mini" @click="updateAttr(row)">
              </el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 添加|修改属性的结构 -->
      <div v-show="!isShowTable">
        <el-form :inline="true" ref="form" label-width="80px" :model="attrInfo">
          <el-form-item label="属性名">
            <el-input placeholder="请输入属性名" v-model="attrInfo.attrName"></el-input>
          </el-form-item>
        </el-form>

        <el-button type="primary" icon="el-icon-plus" @click="addAttrValue" :disabled="!attrInfo.attrName">添加属性值
        </el-button>
        <el-button @click="isShowTable = true">取消</el-button>

        <el-table border style="width: 100%; margin: 20px 0" :data="attrInfo.attrValueList">
          <el-table-column label="序号" align="center" type="index" width="80"></el-table-column>

          <el-table-column label="属性值名称" width="width" prop="prop">
            <template slot-scope="{ row, $index }">
              <!-- 这里的结构需要span和input进行来回的切换 -->
              <el-input v-model="row.valueName" placeholder="请输入属性值名称" size="mini" v-if="row.flag" @blur="toLook(row)"
                @keyup.native.enter="toLook(row)" :ref="$index"></el-input>
              <span v-else style="display: block" @click="toEdit(row, $index)">{{ row.valueName }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="width" prop="prop">
            <template slot-scope="{ row, $index }">
              <!-- 气泡确认框 -->
              <el-popconfirm :title="`确认删除${row.valueName}吗？`" @onConfirm="deleteAttrValue($index)">
                <el-button type="danger" size="mini" icon="el-icon-delete" slot="reference"></el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <el-button type="primary" icon="el-icon-plus" @click="addOrUpdateAttr"
          :disabled="attrInfo.attrValueList.length < 1">保存</el-button>
        <el-button @click="isShowTable = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
// 按需引入lodash中的深拷贝
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "Attr",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      // 存储平台属性的字段
      attrList: [],
      // 这个属性控制table表格显示与隐藏
      isShowTable: true,
      // 收集新增属性或者修改属性使用
      attrInfo: {
        attrName: "", //属性名
        attrValueList: [
          //属性值，因为属性值可以有很多因此使用数组，每一个属性值都是一个对象，需要attrId,attrValue
          // 起始没有数据，当点击添加属性值按钮的时候才有数据
        ],
        categoryId: 0, //三级分类的id
        categoryLevel: 3, //因为服务器也需要区分几级id
      },
    };
  },
  methods: {
    // 自定义事件的回调
    getCategoryId({ categoryId, level }) {
      // 区分三级分类相应的id,以及父组件进行存储
      if (level == 1) {
        this.category1Id = categoryId;
        this.category2Id = "";
        this.category3Id = "";
        // 当切换一级分类的时候要把之前展示的数据清空
        this.attrList = [];
      } else if (level == 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
        //同理， 当切换二级分类的时候也要把之前展示的数据清空
        this.attrList = [];
      } else {
        // 代表三级分类的id有了
        this.category3Id = categoryId;
        // 发请求获取品牌属性
        this.getAtttrList();
      }
    },
    // 发请求获取平台属性信息
    async getAtttrList() {
      // console.log('发送请求');
      const { category1Id, category2Id, category3Id } = this;
      let result = await this.$API.attr.reqAttrList(
        category1Id,
        category2Id,
        category3Id
      );
      // console.log(result);
      if (result.code == 200) {
        this.attrList = result.data;
      }
    },
    // 点击添加属性值按钮的回调函数
    addAttrValue() {
      // 向属性值的数组里面添加元素
      // attrId:是相应的属性名的id,目前而言是添加操作,还没有相应的id,带给服务器的为undefined
      // valueName:相应的属性值的名称,
      this.attrInfo.attrValueList.push({
        attrId: this.attrInfo.id, //对于修改某一个属性的时候，可以在已有的属性值基础上新增新的属性值（新增属性值的时候，需要把已有的属性的id带上）
        valueName: "",
        // 控制input和span来回切换的标志
        // 给每一个属性值添加一个flag标志，用于切换查看模式和编辑模式，好处：每一个属性都可以控制自己的模式切换
        // 当前flag属性是一个响应式数据（数据变化视图跟着变化）
        flag: true,
      });
      this.$nextTick(() => {
        this.$refs[this.attrInfo.attrValueList.length - 1].focus();
      });
    },
    // 添加属性按钮的回调
    addAttr() {
      // 切换table的显示与隐藏
      this.isShowTable = false;
      // 清除数据
      this.attrInfo = {
        attrName: "",
        attrValueList: [],
        categoryId: this.category3Id,
        categoryLevel: 3,
      };
    },
    // 修改属性按钮的回调
    updateAttr(row) {
      this.isShowTable = false;
      // 将选中的属性赋值给attrInfo
      // 由于数据结构中存在对象里面套数组，数组里面又套有对象，因此需要使用深拷贝解决这类问题
      // 深拷贝、浅拷贝在面试的时候出现的频率很高，切记，要达到手写深拷贝与浅拷贝
      this.attrInfo = cloneDeep(row);
      // 在修改某一个属性的时候，将相应的属性值元素添加上flag这个标记
      this.attrInfo.attrValueList.forEach((item) => {
        // 下面的书写方式虽然可以给属性值添加上flag，但是会发现试图不会跟着变化（因为flag不是响应式数据）
        // 因为Vue无法探测普通的新增property，这样书写的属性并非响应式的属性（数据变化试图无法跟着变）
        // item.flag = false
        // 所以需要使用Vue.$set()方法设置响应式属性
        // 第一个参数：要添加属性的对象，第二个参数：添加的响应式属性 第三个参数：新的属性的属性值
        this.$set(item, "flag", false);
      });
    },
    // 切换为查看模式的函数
    toLook(row) {
      // 如果属性值为空不能作为新的属性值，需要给用户提示，让他输入一个正确的属性值
      if (row.valueName.trim() == "") {
        this.$message({
          message: "请正确输入属性值",
          type: "warning",
        });
        return;
      }
      // 新增的属性值不能与已有的属性值重复
      let isRepeat = this.attrInfo.attrValueList.some((item) => {
        // 进行判断的时候，需要将row从数组里面去除
        // row是最新添加的属性值【数组中的最后一项元素】
        if (row != item) {
          return item.valueName == row.valueName;
        }
      });

      // 如果重复了，给用户提示信息
      if (isRepeat) {
        this.$message({
          message: "属性值不能重复",
          type: "warning",
        });
        return;
      }

      // row：这个形参是当前用户添加的最新的属性值
      // 当前编辑模式变为查看模式【让input消失，显示span】
      row.flag = false;
    },
    // 切换为编辑模式
    toEdit(row, index) {
      row.flag = true;
      // 需要注意：点击span的时候，切换为input变为编辑模式，但是需要注意的是，对于浏览器而言，页面的重绘与重排是需要时间的
      // 点击span的时候，重绘重排一个input是需要时间的，因此我们不可能一点击span立马获取到input
      // $nextTick,当节点渲染完毕了会执行一次
      this.$nextTick(() => {
        // console.log(index);
        // console.log(this.$refs[index]);
        // 获取相应的input表单元素并实现聚焦
        this.$refs[index].focus();
      });
    },
    // 气泡确认框确定按钮的回调
    // 注意：最新版本的elementUI是2.15.10，目前模板中的版本号是2.13.x
    deleteAttrValue(index) {
      // 当前删除属性值的操作不需要发请求
      this.attrInfo.attrValueList.splice(index, 1);
      this.$message({
        type: "success",
        message: "删除成功",
      });
    },
    // 保存按钮：进行添加属性或者修改属性的操作
    async addOrUpdateAttr() {
      // 整理参数：1.如果用户添加很多属性值，且属性值为空的不应该提交给服务器
      // 提交给服务器的数据中不应该出现flag字段
      this.attrInfo.attrValueList = this.attrInfo.attrValueList.filter(
        (item) => {
          if (item.valueName != "") {
            // 删除flag属性
            delete item.flag;
            return true;
          }
        }
      );

      // 发请求
      try {
        await this.$API.attr.reqAddOrUpdateAttr(this.attrInfo);
        this.$message({
          type: "success",
          message: "保存成功",
        });
        this.getAtttrList();
        // 展示平台属性的信号量进行切换
        this.isShowTable = true;
      } catch (error) {
        this.$message.error("保存失败");
      }
    },
  },
};
</script>

<style>

</style>
