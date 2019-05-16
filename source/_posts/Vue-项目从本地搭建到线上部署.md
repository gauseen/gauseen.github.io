---
title: Vue-项目从本地搭建到线上部署
date: 2019-05-15 18:58:11
tags: [vue,deploy,guide,开发,部署]
author: gauseen
---

> #### 0. 关于 `Vuejs`

- 简介：`Vue` (读音 `/vjuː/`，类似于 `view`) 是一套用于构建用户界面的渐进式框架，易用、灵活、高效。
- 生态系统

| 项目 | 介绍 |
| ---------- | -----------|
| [awesome-vue][awesome-vue] | `Vue.js` 相关很棒的工具集 |
| [vue-router][vue-router] | `Vue.js` 官方的路由管理器 |
| [vuex][vuex] | `Vue.js` 应用的状态管理工具 |
| [vue-cli][vue-cli] | 一键式快速构建 `Vue.js` 应用开发环境 |
| [vue-loader][vue-loader] | `webpack` 的 `loader`，解析 `.vue` 文件，它允许你以一种名为单文件组件 (SFCs)的格式撰写 `Vue` 组件 |
| [vue-server-renderer][vue-server-renderer] | 服务端渲染(`ssr`) |
| [vue-rx][vue-rx] | 集成 [RxJS][rxjs] (处理事件的工具) |
| [vue-devtools][vue-devtools] | `Vue.js` 开发调试工具浏览器插件 |

> #### 1. 开发规范

- [JavaScript Standard][0_2]
- [Vue 编码风格规范][0_3]
- [项目目录规范][0_4]

> #### 2. 创建项目

```
# 安装 vue cli
yarn global add @vue/cli

# 初始化项目
vue create hello-world-3x

cd hello-world-3x

# 本地运行项目
yarn serve
```

> #### 3. 静态资源

静态资源可以通过两种方式进行处理：
- 在 `JavaScript` 被导入或在 `template/CSS` 中通过相对路径被引用。这类引用会被 `webpack` 处理。
- 放置在 `public` 目录下或通过绝对路径被引用。这类资源将会直接被拷贝，而不会经过 `webpack` 的处理。
- `URL` 转换规则
  - 如果 `URL` 是一个绝对路径 (例如 /images/foo.png)，它将会被保留不变。
  - 如果 `URL` 以 `.` 开头，它会作为一个相对模块请求被解释且基于你的文件系统中的目录结构进行解析。
  - 如果 `URL` 以 `~` 开头，其后的任何内容都会作为一个模块请求被解析。这意味着你甚至可以引用 Node 模块中的资源：
  - 如果 `URL` 以 `@` 开头，它也会作为一个模块请求被解析。它的用处在于 `Vue CLI` 默认会设置一个指向 `<projectRoot>/src` 的别名 `@`


> #### 4. `public` 文件夹

  - 任何放置在 `public` 文件夹的静态资源都会被复制到 `outputDir` 对应值的目录下（默认 `'dist'`）。  
  - 如果用绝对路径来引用，不会被 `webpack` 处理(**资源只存在 1 份**)；  
  - 如果用相对路径来引用，会被 `webpack` 处理，将图片重新打包到 `<outputDir>/<assetsDir>/img/` 目录下，并给图片加 `hash` 值，以便更好的控制缓存。**资源会存在 2 份**(还有第一条复制的 1 份)
  - 所以引用 `public` 文件夹的静态资源建议使用绝对路径，注意配置路径 `publicPath` 前缀

```html
<img :src="`${publicPath}logo.png`">
```
```js
data () {
  return {
    publicPath: process.env.BASE_URL,
  }
},
```

> #### 5. vue.config.js

<font style="color: #ff9966;">
注：有些 webpack 选项是基于 vue.config.js 中的值设置的，所以不能直接修改。如：你应该修改 vue.config.js 中的 publicPath 选项而不是修改 output.publicPath
</font>  

- **publicPath(同 baseUrl, vue cli 3.3 弃用)**

  作用：设置所有经过 webpack 处理的静态资源路径前缀（不包括用绝对路径引用的资源）

  默认：`'/'`

  默认情况下，Vue CLI 会假设你的应用是被部署在一个域名的根路径上，如：`https://domain.com，publicPath` 不需要刻意设置。  
  如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径，如：`https://domain.com/my-app/`，那么 `publicPath` 为 `/my-app/`。  


- **webpack 配置**
  vue cli 内部配置，是通过 [webpack-chain][0_0] 维护的，使 webpack 的配置在后期修改起来更方便、简单。  

  对于 CSS 相关 loader 来说，我们推荐使用 css.loaderOptions 而不是直接链式指定 loader。这是因为每种 CSS 文件类型都有多个规则，而 css.loaderOptions 可以确保你通过一个地方影响所有的规则

```js
// vue.config.js

// CSS loader 相关配置
css: {
  loaderOptions: {
    stylus: {},
  },
},

// webpack 其它配置
chainWebpack: config => {
    // 配置别名
    config.resolve.alias
      .set('rootDir', path.join(__dirname))
    config.module
    // 添加一个具名规则 方便后期修改
      .rule('compile')
        .test(/\.js$/)
        .include
          .add('src')
          .end()
        // 甚至可以创建具名 loader，方便后期修改
        .use('babel')
        .loader('babel-loader')
        .options({
          presets: [
            ['@babel/preset-env', { modules: false }]
          ]
        })

    // 修改具名 loader
    config.module
      .rule('compile')
        .use('babel')
          .tap(options => newOptions)
```

> #### 6. webpack 配置检查

```
vue inspect > output.js # 输出开发模式下 webpack 配置信息
vue inspect --mode production > output.js # 输出生产模式下 webpack 配置信息
```

> #### 7. 支持多环境模式打包

场景：有 `development、test、preview、production` 多种线上环境，每个环境用到的变量值都不同，该怎么用程序解决？

`vue-cli 3.x` 支持多种环境模式变量配置

```
.env                # 在所有的环境中被载入
.env.local          # 在所有的环境中被载入，但会被 git 忽略
.env.[mode]         # 只在指定的模式中被载入
.env.[mode].local   # 只在指定的模式中被载入，但会被 git 忽略
```
环境变量优先级：环境变量的文件名 `.` 越多优先级越高。如：`.env.production > .env`

默认情况下 `vue-cli 3.x` 只支持 `3` 种模式，分别为:   
- `development 模式用于 vue-cli-service serve`
- `production 模式用于 vue-cli-service build`  
- `test 模式用于 vue-cli-service test:unit 和 vue-cli-service test:e2e`

那如何新加模式呢？  

可以通过传递 `--mode` 选项参数为命令行 `vue-cli-service` 指定具体环境模式。如：新加 `preview` 模式  
- 项目根目录新增 `.env.preview` 文件，因为每个模式默认都会将 `NODE_ENV` 的值设置为模式的名称，所以要添加 `NODE_ENV=production` 变量(`preview` 模式也是需要打包上传服务器的)。
- `package.json scripts` 文件新增脚本命令
  ```json
  "build:preview": "vue-cli-service build --mode preview"
  ```
- 运行 `yarn build:preview` 打包编译即可

> #### 8. mock 数据之 api 接口管理工具

前后端分离式开发已经很常见了，为了前后端并行开发，`mock` 数据(造假数据) 已经是个不可避免的问题。 对前端来说 `mock` 数据的方式有很多种：

- [Mock.js][0_7] 模拟数据生成器
  - 需要前端手动去写 `mock` 数据代码，比较麻烦
  - 每个项目都要有一套 `mock` 代码，复用率底
  - 没有 `GUI` 可视化界面，不方便后端开发查看接口、字段等 `api` 信息

- [easy-mock][0_8] 是一个可视化，并且能快速生成模拟数据的持久化服务
  - 支持可视化界面
  - 支持协同编辑
  - 支持 `swagger`，可基于 `swagger` 快速创建项目接口
  - 支持 `Mock.js` 语法
  - 支持接口预览，等等
  - 免费开源，私有化部署简单

- [RAP][0_10] 和 [RAP2][0_11] 阿里妈妈出品，开源接口管理工具 `RAP` 第一代和二代
  - 支持可视化界面
  - 支持协同编辑
  - 支持 `Mock.js` 语法
  - 不支持 `swagger` 数据导入，但支持 `JSON` 格式数据的导入导出
  - 免费开源，但私有化部署相对繁琐

- [YApi][0_9] 是一个可本地部署的、打通前后端及 QA 的、可视化的接口管理平台
  - 支持可视化界面
  - 支持协同编辑
  - 支持自动化测试, 对 `Response` 断言 :star:
  - 基于 `Json5` 和 `Mockjs` 定义接口返回数据的结构和文档
  - 支持 `swagger、postman、json、har` 数据导入
  - 免费开源，私有化部署简单

> #### 9. vue 项目中使用 api 接口管理平台

```js
// vue.config.js

// 基础地址
const baseApi = '/api'
// YApi 项目 ID (YApi 创建项目所得)
const mockProjectId = '66666'

module.exports = {
  // 代理
  devServer: {
    proxy: {
      // 开发环境代理
      [`${baseApi}/(?!mock)`]: {
        target: process.env.VUE_APP_DOMAIN || 'http://test.domain.com', // 测试环境
        changeOrigin: true,
      },
      // mock 数据代理
      [`${baseApi}/mock`]: {
        target: 'http://yapi.demo.qunar.com',
        changeOrigin: true,
        pathRewrite: {
          [`${baseApi}/mock`]: `/mock/${mockProjectId}${baseApi}`,
        },
      },
    },
  },
}
```
> #### 10. 本地预览打包代码

[http-server][0_1] 是一个基于 `node`，零配置命令行 `http` 服务器。

```sh
# 安装
yarn add -D http-server

# 配置 package.json scripts
"scripts": {
  "preview": "http-server ./ -P",
},

# 打包产出
yarn build

# 修改文件名 dist/ ===> my-app/(与 publicPath 保持一致)
mv -rf dist/ my-app/

# 本地预览(http://ip:port 可选, 为代理服务)
yarn preview <http://ip:port>

# 浏览器打开连接访问即可
```

> #### 11. 线上部署

这里主要讲述前后端分离式线上部署  

当前应用路由模式分`2`种，`hash` 和 `history` 模式
- `hash` 模式
  - 样式比较丑，不太符合人的 “审美”
  - 浏览器地址栏 `URL` 有 `#` (如：`http://localhost:3000/#/a`)
  - `#` 后面的内容不会传给服务端
  - 改变浏览器地址栏 `URL # ` 后面的值，**不会引起**网页重载

- `history` 模式
  - `HTML5` 新特性，样式比较优雅
  - 浏览器地址没有 `#` (如：`http://localhost:3000/a`)
  - 没有 `#` ，所有 `domain` 后面的内容都会传给服务端
  - 改变浏览器地址栏 `URL` **会**网页重载，再次请求服务器，并向 `history` 栈中插入一条记录  

[具体区别看这里][0_5]

- `web` 服务器

前端页面需要跑在 `web` 服务器里面，主要包括 `Nginx，Apache，IIS` 等，主要处理一些静态资源。我们公司使用 `Nginx`，下面介绍前端应用部署时 `Nginx` 的一些配置：

- `hash` 模式配置

```nginx
location ^~ /pos2/
{
  root /data/www/webproject;
  index  index.html index.htm;
}
```

- `history` 模式配置
```nginx
location ^~ /crmwap/
{
  root /data/www/webproject;
  try_files $uri $uri/ /crmwap/index.html =404;

  # 已知: $document_root = root = /data/www/webproject

  # 若: try_files $uri $uri/ /crmwap/index.html =404; fall back 如下:
  # $document_root$uri --> $document_root$uri/ -->  $document_root/crmwap/index.html --> nginx 404

  # 若：try_files $uri $uri/ /crmwap/index.html; fall back 如下:
  # $document_root$uri --> $document_root$uri/ --> http://domain.com/crmwap/index.html
}
```

`Nginx` 常用命令

```
# 启动
start nginx

# 重启
nginx -s reload

# 关闭
nginx -s stop
```

**注：**[try_files][0_6] 的最后一个位置（fall back）是特殊的（仅限 `root`），它会发出一个内部 “子请求” 而非直接在文件系统里查找这个文件。  
在不更改 `Nginx` 配置文件的情况下，前端页面迭代发布，不需要重启 `Nginx` 服务。

> #### 12. 自动化构建工具

- [Jenkins][jenkins]






<!-- 引用链接 -->
[0_0]: https://github.com/neutrinojs/webpack-chain
[0_1]: https://github.com/indexzero/http-server

<!-- vuejs -->
[awesome-vue]: https://github.com/vuejs/awesome-vue
[vue-router]: https://github.com/vuejs/vue-router
[vuex]: vue-loaderhttps://github.com/vuejs/vuex
[vue-cli]: https://github.com/vuejs/vue-cli
[vue-loader]: https://github.com/vuejs/vue-loader
[vue-server-renderer]: https://github.com/vuejs/vue/tree/dev/packages/vue-server-renderer
[vue-class-component]: https://github.com/vuejs/vue-class-component
[vue-rx]: https://github.com/vuejs/vue-rx
[vue-devtools]: https://github.com/vuejs/vue-devtools
[rxjs]: https://cn.rx.js.org/manual/overview.html

<!-- javascript standard -->
[0_2]: https://github.com/gauseen/standard/blob/master/README.md
[0_3]: https://github.com/gauseen/code-style-guide/blob/master/docs/vue-code-style.md
[0_4]: https://github.com/gauseen/code-style-guide/blob/master/docs/vue-project-directory-style.md
<!-- [0_3]: http://10.211.62.41:82/18110026/code-style-guide/blob/master/docs/vue-code-style.md -->
[0_5]: https://github.com/gauseen/blog/issues/7
[0_6]: http://www.nginx.cn/279.html

[jenkins]: https://jenkins.io/zh/

<!-- mock -->
[0_7]: https://github.com/nuysoft/Mock
[0_8]: https://github.com/easy-mock/easy-mock
[0_9]: https://github.com/YMFE/yapi
[0_10]: https://github.com/thx/RAP
[0_11]: https://github.com/thx/rap2-delos