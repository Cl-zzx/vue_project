<template>
    <div>
        <!-- 按钮 -->
        <el-button type="primary" icon="el-icon-plus" style="margin: 10px 0px;" @click="showDialog">添加</el-button>
        <!-- 
            表格组件 
            data:表格组件将来需要展示的数据----数组类型
            border:是给表格添加纵向边框
            column属性：
                label：显示的标题
                widht：对应列的宽度
                align:标题的对齐方式
                prop:对应列内容的字段名

            注意1:elementUI当中的table组件,展示的数据是一列一列进行展示数据
        -->
        <el-table style="width:100%" border :data="list">
            <el-table-column label="序号" width="80px" align="center" type="index"></el-table-column>
            <el-table-column label="品牌名称" prop="tmName"></el-table-column>
            <el-table-column label="品牌LOGO">
                <template slot-scope="{row}">
                    <img :src="row.logoUrl" style="height:100px;width: 100px;">
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="{row}">
                    <el-button type="warning" icon="el-icon-edit" size="mini" @click="updateTradeMark(row)">修改
                    </el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteTradeMark(row)">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 
            分页器
            当前第几页，数据总条数，每一页展示的条数，连续页码数
            @size-change="handlerSizeChange"
            @current-change="handlerCurrentChange"

            current-page:代表的是当前第几页
            total：代表分页器一共需要展示的数据条数
            page-size：代表的是每一页需要展示多少条数据
            page-sizes：代表可以设置每一页展示多少条数据
            layout：可以实现分页器布局
            pager-count:按钮的数量，如果是9，则连续页码数是7

         -->
        <el-pagination style="margin-top: 20px; text-align: center;" :total="total" :page-size="limit"
            :current-page="page" :pager-count="7" :page-sizes="[3, 5, 10]"
            layout="prev,pager,next,jumper,->,sizes,total" @current-change="handlerCurrentChange"
            @size-change="handlerSizeChange">
        </el-pagination>
        <!-- 对话框 -->
        <!-- Form 组件提供了表单验证的功能，只需要通过 rules 属性传入约定的验证规则，并将 Form-Item 的 prop 属性设置为需校验的字段名即可。 -->
        <el-dialog :title="this.tmForm.id ? '修改品牌' : '添加品牌'" :visible.sync="dialogFormVisible">
            <el-form :model="tmForm" :rules="rules" ref="ruleForm">
                <el-form-item label="品牌名称" label-width="100px" prop="tmName">
                    <!-- form表单 :model属性，这个属性的作用是把表单的数据收集到哪个对象的身上，将来表单验证，也需要这个属性 -->
                    <el-input autocomplete="off" style="width: 80%;" v-model="tmForm.tmName"></el-input>
                </el-form-item>
                <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
                    <!-- 
                        这里收集数据不能使用v-model，因为不是表单元素
                        action：设置图片上传的地址
                        :on-success:可以检测到图片上传成功，当图片上传成功会执行一次
                        :before-upload：可以在图片上传之前，执行一次
                    -->
                    <el-upload class="avatar-uploader" action="/dev-api/admin/product/fileUpload"
                        :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                        <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="addOrUpdateTradeMark">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'tradeMark',
    data() {
        // 自定义校验规则
        var validateTmName = (rule, value, callback) => {
            if (value.length < 2 || value.length > 10) {
                callback(new Error('长度在2-10个字符'))
            } else {
                callback()
            }
        };
        return {
            // 代表的分页器的第几页
            page: 1,
            // 当前页数展示的数据条数
            limit: 3,
            // 总共数据的条数
            total: 0,
            // 列表展示的数据
            list: [],
            // 控制dialog是否显示
            dialogFormVisible: false,
            // 收集品牌的信息:对象身上的属性，不能瞎写，需要看文档
            tmForm: {
                tmName: '',
                logoUrl: ''
            },
            // 表单校验规则
            rules: {
                tmName: [
                    // require：必须要校验的字段（前面五角星有关系） trigger：用户行为设置（事件的设置：blur change）
                    { required: true, message: '请输入品牌名称', trigger: 'blur' },
                    // 品牌名称长度2-10
                    // { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'change' }
                    // 自定义校验规则
                    { validator: validateTmName, trigger: 'change' }
                ],
                // 品牌logo的验证规则
                logoUrl: [
                    { required: true, message: '请选择品牌图片' }
                ],
            }
        }
    },
    // 组件挂载完毕发送请求
    mounted() {
        // 获取列表数据的方法
        this.getPageList()
    },
    methods: {
        async getPageList() {
            // 解构出参数
            const { page, limit } = this
            // 获取品牌列表的接口
            // 当你向服务器发请求的时候,这个函数需要带参数,因此老师在data中初始化两个字段,代表给服务器传递的参数
            let result = await this.$API.trademark.reqTradeMarkList(page, limit)
            // console.log(result);
            if (result.code == 200) {
                // 分别是展示数据的总条数与列表展示的数据
                this.total = result.data.total
                this.list = result.data.records
            }
        },
        // 当点击进行切换页码的时候,触发该函数
        handlerCurrentChange(pager) {
            // 这个方法会讲点击的页码进行回传
            // console.log(pager);
            // 修改页码
            this.page = pager
            // 重新发送请求获取数据
            this.getPageList()
        },
        // 当修改每页显示数据条数的时候触发该函数
        handlerSizeChange(limit) {
            // 整理参数
            this.limit = limit
            this.getPageList()
        },
        // 点击添加品牌的按钮
        showDialog() {
            // 显示对话框
            this.dialogFormVisible = true
            this.tmForm = { tmName: '', logoUrl: '' }
        },
        updateTradeMark(row) {
            // row：当前用户选中的品牌的信息
            // console.log(row);
            // 显示对话框
            this.dialogFormVisible = true
            // 将已有的品牌信息赋值给tmForm进行展示
            // 也就是说tmForm存储的即为服务器返回的品牌信息
            // this.tmForm = row
            this.tmForm = { ...row }
        },
        // 上传图片相关的回调
        // 图片上传成功的回调
        handleAvatarSuccess(res, file) {
            // res:上传成功之后返回给前端的数据
            // file:上传成功之后服务器返回给前端的数据
            // 收集品牌图片的数据,将来带给服务器
            // console.log(res);
            this.tmForm.logoUrl = res.data
        },
        // 图片上传之前
        beforeAvatarUpload(file) {
            const isJPG = file.type === 'image/jpeg';
            const isLt2M = file.size / 1024 / 1024 < 2;

            if (!isJPG) {
                this.$message.error('上传头像图片只能是 JPG 格式!');
            }
            if (!isLt2M) {
                this.$message.error('上传头像图片大小不能超过 2MB!');
            }
            return isJPG && isLt2M;
        },
        // 添加按钮(添加品牌|修改品牌)
        addOrUpdateTradeMark() {
            // 当全部字段验证通过，再去书写业务逻辑
            this.$refs.ruleForm.validate(async (success) => {
                // 如果全部字段符合条件
                if (success) {
                    this.dialogFormVisible = false
                    // 发请求(添加品牌|修改品牌)
                    let result = await this.$API.trademark.reqAddOrUpdateTradeMark(this.tmForm)
                    // console.log(result);
                    if (result.code == 200) {
                        // 弹出信息:添加|修改品牌成功
                        this.$message({
                            type: 'success',
                            message: this.tmForm.id ? '修改品牌成功' : '添加品牌成功'
                        })
                        // 添加或者修改成功之后,需要再次获取品牌列表进行展示
                        // 如果是添加品牌：停留在第一页，如果是修改品牌，应该留在当前页
                        this.getPageList(this.tmForm.id ? this.page : 1)
                    }
                } else {
                    console.log('error submit!');
                    return false
                }
            })



        },
        // 删除品牌的回调函数
        deleteTradeMark(row) {
            this.$confirm(`确定删除${row.tmName}吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                // 当用户点击确定的时候触发
                let result = await this.$API.trademark.reqDeleteTradeMark(row.id)
                console.log(result);
                if (result.code === 200) {
                    // 弹出消息提示框
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    });
                    this.getPageList(this.list.length > 0 ? this.page : this.page - 1)
                }

            }).catch(() => {
                // 当用户点击取消的时候触发
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        }
    },
}
</script>

<style>
.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.avatar-uploader .el-upload:hover {
    border-color: #409EFF;
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
}

.avatar {
    width: 178px;
    height: 178px;
    display: block;
}
</style>