// 将四个模块请求的接口函数统一暴露
import * as attr from "./product/attr";
import * as sku from "./product/sku";
import * as spu from "./product/spu";
import * as trademark from "./product/trademark";

// 引入权限相关的接口文件
import permission from "./acl/permission";
import role from "./acl/role";
import * as user from "./acl/user";

// 对外暴露
export default {
  trademark,
  attr,
  sku,
  spu,
  user,
  role,
  permission,
};
