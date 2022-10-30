<template>
  <div>
    <el-form ref="form" label-width="80px" :model="spu">
      <el-form-item label="SPU名称">
        <el-input placeholder="spu名称" v-model="spu.spuName"></el-input>
      </el-form-item>

      <el-form-item label="品牌">
        <el-select placeholder="选择品牌" v-model="spu.tmId">
          <el-option :label="tm.tmName" :value="tm.id" v-for="tm in tradeMarkList" :key="tm.id"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="描述">
        <el-input placeholder="spu描述" rows="4" type="textarea" v-model="spu.description"></el-input>
      </el-form-item>

      <el-form-item label="spu图片">
        <!-- 上传图片：action：图片上传地址 list-type：文件列表类型 on-preview：图片预览的时候会触发 on-remove：当删除图片的时候触发
            file-list:照片墙需要展示的数据【数组：数组里面的元素务必要有name、url属性】
            :on-preview -- 图片的预览功能
            :on-remove --照片墙删除某一个图片的时候会触发
         -->
        <el-upload action="/dev-api/admin/product/fileUpload" list-type="picture-card"
          :on-preview="handlePictureCardPreview" :on-remove="handleRemove" :on-success="handleSuccess"
          :file-list="spuImageList">
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-select :placeholder="`还有${unselectSaleAttr.length}未选择`" v-model="attrIdAndName">
          <el-option :label="unselect.name" :value="`${unselect.id}:${unselect.name}`"
            v-for="unselect in unselectSaleAttr" :key="unselect.id"></el-option>
        </el-select>
        <el-button type="primary" icon="el-icon-plus" @click="addSaleAttr" :disabled="!attrIdAndName">添加销售属性</el-button>
        <!-- 展示的是当前spu属于自己的销售属性 -->
        <el-table style="width: 100%" border :data="spu.spuSaleAttrList">
          <el-table-column type="index" label="序号" align="center" width="80px">
          </el-table-column>

          <el-table-column prop="saleAttrName" label="属性名"></el-table-column>

          <el-table-column prop="spuSaleAttrValueList" label="属性值名称列表">
            <template slot-scope="{ row, $index }">
              <!-- @close="handleClose(tag)" -->
              <!-- el-tag：用于展示已有属性值列表的数据 -->
              <el-tag :key="tag.id" v-for="(tag, index) in row.spuSaleAttrValueList" closable
                :disable-transitions="false" @close="handleClose(row, index, tag)">
                {{ tag.saleAttrValueName }}
              </el-tag>
              <!-- 底下的结构可以当作当年的span和input的切换 -->
              <!-- @keyup.enter.native="handleInputConfirm"
                @blur="handleInputConfirm" -->
              <el-input class="input-new-tag" v-if="row.inputVisible" v-model="row.inputValue" :ref="$index"
                size="small" @blur="handleInputConfirm(row)">
              </el-input>

              <!-- @click="showInput" -->
              <el-button v-else class="button-new-tag" size="small" @click="addSaleAttrValue(row, $index)">+ 添加
              </el-button>
            </template>
          </el-table-column>

          <el-table-column prop="prop" label="操作">
            <template slot-scope="{ $index }">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteSaleAttr($index)"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="addOrUpdateSpu">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SpuForm",
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      //spu属性初始化的时候是一个空的对象,在修改SPU的时候，会想服务器发请求，返回SPU信息（对象），在修改的时候可以利用服务器返回的这个对象收集最新的数据提交给服务器
      //添加SPU，如果是添加SPU的时候并没有向服务器发请求，数据收集到哪里呀[SPU]，收集数据的时候有哪些字段呀，看文档
      spu: {
        //三级分类的id
        category3Id: 0,
        //描述
        description: "",
        //spu名称
        spuName: "",
        //平台的id
        tmId: "",
        //收集SPU图片的信息
        spuImageList: [
          // {
          //   id: 0,
          //   imgName: "string",
          //   imgUrl: "string",
          //   spuId: 0,
          // },
        ],
        //平台属性与属性值收集
        spuSaleAttrList: [
          // {
          //   baseSaleAttrId: 0,
          //   id: 0,
          //   saleAttrName: "string",
          //   spuId: 0,
          //   spuSaleAttrValueList: [
          //     {
          //       baseSaleAttrId: 0,
          //       id: 0,
          //       isChecked: "string",
          //       saleAttrName: "string",
          //       saleAttrValueName: "string",
          //       spuId: 0,
          //     },
          //   ],
          // },
        ],
      },
      tradeMarkList: [], //存储品牌信息
      spuImageList: [], //存储SPU图片的数据
      saleAttrList: [], //销售属性的数据（项目全部的销售属性）
      attrIdAndName: "", //收集未选择的销售属性id和名称
    };
  },
  computed: {
    unselectSaleAttr() {
      // 整个平台的销售属性一共三个：尺寸、颜色、版本---saleAttrList
      // 当前spu拥有的属于自己的销售属性spu.spuSaleAttrList
      // 数组的过滤方法，可以从已有的数组中过滤出用户需要的元素，并返回一个新的数组
      return this.saleAttrList.filter((item) => {
        // every，数组的方法，会返回一个布尔值
        return this.spu.spuSaleAttrList.every((item1) => {
          return item.name != item1.saleAttrName;
        });
      });
    },
  },

  methods: {
    cancel() {
      this.$emit("changeScene", { scene: 0, flag: "" });
      // 清空表单数据
      // Object.assign:es6中新增的方法，可以用来合并对象
      // 组件实例:this._data,可以操作data当中的响应式数据
      // this.$options可以获取配置对象，配置对象中的data()函数执行，返回的响应式数据为空
      Object.assign(this._data, this.$options.data());
    },
    // 点击添加spu按钮的时候，发请求的函数
    async addSpuData(category3Id) {
      // 添加spu的时候收集三级分类的id
      this.spu.category3Id = category3Id;
      //获取品牌的信息
      let tradeMarkResult = await this.$API.spu.reqTradeMarkList();
      if (tradeMarkResult.code == 200) {
        this.tradeMarkList = tradeMarkResult.data;
      }
      //获取平台全部的销售属性
      let saleResult = await this.$API.spu.reqBaseSaleAttrList();
      if (saleResult.code == 200) {
        this.saleAttrList = saleResult.data;
      }
    },
    //保存按钮的回调函数
    async addOrUpdateSpu() {
      // 整理参数：需要整理照片墙的数据
      // 携带参数：对于图片，需要携带imgName和imgUrl字段
      this.spu.spuImageList = this.spuImageList.map((item) => {
        return {
          imgName: item.name,
          imgUrl: (item.response && item.response.data) || item.url,
        };
      });
      let result = await this.$API.spu.reqAddOrUpdateSpu(this.spu);
      // console.log(result);
      if (result.code == 200) {
        this.$message({
          type: "success",
          message: "保存成功",
        });
        // 通知父组件回到场景0,父组件需要再次获取spu列表再次进行展示
        this.$emit("changeScene", {
          scene: 0,
          flag: this.spu.id ? "修改" : "添加",
        });
      }
      Object.assign(this._data, this.$options.data());
    },
    // 删除某一个销售属性
    deleteSaleAttr($index) {
      this.spu.spuSaleAttrList.splice($index, 1);
    },
    // 删除某个销售属性值
    handleClose(row, index) {
      row.spuSaleAttrValueList.splice(index, 1);
    },
    // 输入框失去焦点的回调函数
    handleInputConfirm(row) {
      // 解构出销售属性中收集到的数据
      const { baseSaleAttrId, inputValue } = row;
      if (inputValue.trim() == "") {
        this.$message({
          type: "warning",
          message: "属性值不能为空",
        });
        return;
      }
      let result = row.spuSaleAttrValueList.every(
        (item) => item.saleAttrValueName != inputValue
      );
      if (!result) {
        this.$message({
          type: "warning",
          message: "属性值不能重复",
        });
        return;
      }
      // 新增的销售属性值
      let newSaleAttrValue = { baseSaleAttrId, saleAttrValueName: inputValue };
      row.spuSaleAttrValueList.push(newSaleAttrValue);
      row.inputVisible = false;
    },
    // 添加属性值列表
    addSaleAttrValue(row, index) {
      // 点击销售属性值当中添加按钮的时候，需要由button变为input，通过当前销售属性的inputVisible控制
      // 挂载在销售属性身上的响应式数据inputVisible，控制button与input的切换
      this.$set(row, "inputVisible", true);
      // 通过响应式数据inputValue字段收集新增的销售属性值
      this.$set(row, "inputValue", "");
      this.$nextTick(() => {
        // console.log(index);
        // console.log(this.$refs[index]);
        // 获取相应的input表单元素并实现聚焦
        this.$refs[index].focus();
      });
    },
    // 添加新的销售属性
    addSaleAttr() {
      // 已经收集到需要添加的销售属性的信息
      // 把收集到的销售属性进行分割
      const [baseSaleAttrId, saleAttrName] = this.attrIdAndName.split(":");
      // 向spu对象的spuSaleAttrList数组中添加新的销售属性
      let newSaleAttr = {
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: [],
      };
      this.spu.spuSaleAttrList.push(newSaleAttr);
      this.attrIdAndName = "";
    },
    // 照片墙删除某一个图片的回调函数
    handleRemove(file, fileList) {
      // file参数：代表的是删除的那张图片
      // fileList：照片墙删除图片以后剩余的那些图片
      // console.log(file, fileList);
      this.spuImageList = fileList;
    },
    // 照片墙图片预览的回调
    handlePictureCardPreview(file) {
      // 将图片地址赋值给这个属性
      this.dialogImageUrl = file.url;
      // 对话框显示
      this.dialogVisible = true;
    },
    // 照片墙上传成功的回调函数
    handleSuccess(response, file, fileList) {
      // 收集图片数据
      this.spuImageList = fileList;
    },
    //初始化SpuForm数据
    async initSpuData(spu) {
      //获取SPU信息的数据
      let spuResult = await this.$API.spu.reqSpu(spu.id);
      if (spuResult.code == 200) {
        //在修改spu的时候,需要向服务器发请求的，把服务器返回的数据（对象），赋值给spu属性
        this.spu = spuResult.data;
      }
      //获取品牌的信息
      let tradeMarkResult = await this.$API.spu.reqTradeMarkList();
      if (tradeMarkResult.code == 200) {
        this.tradeMarkList = tradeMarkResult.data;
      }
      //获取spu图片的数据
      let spuImageResult = await this.$API.spu.reqSpuImageList(spu.id);
      if (spuImageResult.code == 200) {
        let listArr = spuImageResult.data;
        //由于照片墙显示图片的数据需要数组，数组里面的元素需要有name与url字段
        //需要把服务器返回的数据进行修改
        listArr.forEach((item) => {
          item.name = item.imgName;
          item.url = item.imgUrl;
        });
        //把整理好的数据赋值给
        this.spuImageList = listArr;
      }
      //获取平台全部的销售属性
      let saleResult = await this.$API.spu.reqBaseSaleAttrList();
      if (saleResult.code == 200) {
        this.saleAttrList = saleResult.data;
      }
    },
  },
};
</script>

<style>
.el-tag+.el-tag {
  margin-left: 10px;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
