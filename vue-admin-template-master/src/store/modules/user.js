import { getInfo, login, logout } from "@/api/user";
import router, {
  anyRoutes,
  asyncRoutes,
  constantRoutes,
  resetRouter,
} from "@/router";
import { getToken, removeToken, setToken } from "@/utils/auth";

const getDefaultState = () => {
  return {
    // 获取token
    token: getToken(),
    // 存储用户名
    name: "",
    // 存储用户头像
    avatar: "",
    // 服务器返回的菜单信息[根据不同角色:返回标记信息,数组里面的元素是字符串]
    routes: [],
    // 按钮权限信息
    buttons: [],
    // 角色信息
    roles: [],
    // 对比之后[项目中已有的异步路由,与服务器返回的标记信息进行对比最终需要展示的路由]
    resultAsyncRoutes: [],
    // 用户最终展示的全部路由
    resultAllRoutes: [],
  };
};

const state = getDefaultState();

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState());
  },
  SET_TOKEN: (state, token) => {
    state.token = token;
  },
  /* SET_NAME: (state, name) => {
    state.name = name;
  }, */
  /* SET_AVATAR: (state, avatar) => {
    state.avatar = avatar;
  }, */
  // 存储用户信息
  SET_USERINFO: (state, userInfo) => {
    state.name = userInfo.name;
    state.avatar = userInfo.avatar;
    state.routes = userInfo.routes;
    state.buttons = userInfo.buttons;
    state.roles = userInfo.roles;
  },
  // 最终计算出的异步路由
  SET_RESULTASYNCROUTES: (state, asyncRoutes) => {
    // vuex保存当前用户的异步路由，注意：一个用户需要展示完整路由：常量、异步、任意路由
    state.resultAsyncRoutes = asyncRoutes;
    // 计算出当前用户需要展示的全部路由
    state.resultAllRoutes = constantRoutes.concat(
      state.resultAsyncRoutes,
      anyRoutes
    );
    router.addRoutes(state.resultAllRoutes);
  },
};

// 定义一个函数：两个数组进行对比，对比出当前用户到底要展示哪些异步路由
const computedAsyncRoutes = (asyncRoutes, routes) => {
  // 过滤出当前用户需要展示的异步路由
  return asyncRoutes.filter((item) => {
    if (routes.indexOf(item.name) != -1) {
      // 递归：别忘记还有2、3、4级子路由
      if (item.children && item.children.length) {
        computedAsyncRoutes(item.children, routes);
      }
      return true;
    }
  });
};

const actions = {
  // 这里在处理登录业务
  async login({ commit }, userInfo) {
    const { username, password } = userInfo;
    let result = await login({ username: username.trim(), password: password });
    // console.log(result);
    // 注意：当前登录请求使用的是mock数据，mock数据的code是20000
    if (result.code === 20000) {
      commit("SET_TOKEN", result.data.token);
      setToken(result.data.token);
      return "ok";
    } else {
      return Promise.reject(new Error("failed"));
    }
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token)
        .then((response) => {
          // 获取用户信息:返回的数据包含:用户名name,用户头像avatar,routes[返回的标志:不同的用户应该展示哪些菜单],用户角色roles
          const { data } = response;

          /* if (!data) {
            return reject("Verification failed, please Login again.");
          } */

          // const { name, avatar } = data;

          // commit("SET_NAME", name);
          // commit("SET_AVATAR", avatar);
          commit("SET_USERINFO", data);
          commit(
            "SET_RESULTASYNCROUTES",
            computedAsyncRoutes(asyncRoutes, data.routes)
          );
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token)
        .then(() => {
          removeToken(); // must remove  token  first
          resetRouter();
          commit("RESET_STATE");
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  // remove token
  resetToken({ commit }) {
    return new Promise((resolve) => {
      removeToken(); // must remove  token  first
      commit("RESET_STATE");
      resolve();
    });
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
