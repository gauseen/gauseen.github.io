---
title: 探索前端路由模式 hash、 history
date: 2018-12-20 22:22:31
tags: [js,route,hash,history,html]
author: gauseen
---

### 一、概念
当前单页面应用路由模式有`2`种，`hash` 和 `history` 模式
- `hash` 模式
  - 样式比较丑，不太符合人的 “审美”
  - 浏览器地址栏 `URL` 有 `#` (如：`http://localhost:3000/#/a`)
  - `#` 后面的内容不会传给服务端
  - 改变浏览器地址栏 `URL # ` 后面的值，**不会**网页重载

- `history` 模式
  - `HTML5` 新特性，样式比较优雅
  - 浏览器地址没有 `#` (如：`http://localhost:3000/a`)
  - 没有 `#` ，所有 `domain` 后面的内容都会传给服务端
  - 改变浏览器地址栏 `URL` **会**网页重载，再次请求服务器，并向 `history` 栈中插入一条记录

### 二、事件监听
- [`hash` 模式][1_1]

  - 当浏览器 `hash` （`URL` 中 `#` 后面的部分）改变时就会触发 `hashchange` 事件

  ```js
  window.addEventListener('hashchange', (e) => {
    // hash 改变会调用此回调
  }, false)
  ```

  - `hash` 模式下，改变浏览器 `URL` 方式
  ```js
  window.location.hash = '#/b'
  window.location = 'http://localhost:3000/#/b'
  window.location.href = 'http://localhost:3000/#/b'
  ```

- [`history` 模式][1_2]
  - 每当历史记录发生变化时，`popstate` 事件就会被触发
  调用 `history.pushState()` 或者 `history.replaceState()` 不会触发`popstate` 事件. `popstate` 事件只会在浏览器某些行为下触发, 比如点击后退、前进按钮(或者在 `JavaScript` 中调用 `history.back()、history.forward()、history.go()`方法).

  ```js
  window.addEventListener('popstate', (e) => {
    // 历史记录发生改变会调用此回调
  }, false)

  // 添加历史记录栈
  let stateObj = { foo: "bar" }
  window.history.pushState(stateObj, 'title', 'url')

  window.history.replaceState() 的使用与 window.history.pushState() 非常相似，
  区别在于 replaceState() 是修改了当前的历史记录项而不是新建一个
  ```

### 三、论据
- `node koa` 创建静态服务 `index.js`，并启动该服务 `node index.js`
```js
// index.js

const Koa = require('koa')
const koaStatic = require('koa-static')
const app = new Koa()
const path = require('path')

// 项目根路径
const root = path.join(__dirname, './')

// 记录客户端访问该服务的次数
let count = 0

// 中间件，记录请求
app.use(async (ctx, next) => {
  console.log('ctx: ', ctx.href, ++count)
  await next()
})

// 在文件夹根目录，创建静态服务
app.use(koaStatic(root))

app.listen(3000)

console.log('listening on port 3000')
```
- 新建静态 `index.html` 文件，内容如下
```html
<!-- index.html -->

<!-- hash 模式 -->
<a href="/#/a">a</a>
<a href="/#/b">b</a>
<a href="/#/c/d">c/d</a>

<br />

<!-- history 模式 -->
<a href="/a">a</a>
<a href="/b">b</a>
<a href="/c/d">c/d</a>
```

- 浏览器访问 `http://localhost:3000`

此时终端有一条访问记录
```sh
ctx:  http://localhost:3000/ 1
```

**情景一**：分别点击 `hash` 模式下的 `a, b, c/d` 文字，可以看到浏览器地址栏改变，但是终端访问记录依然不变。

**说明**：浏览器地址栏 `hash` 改变，**并不会**向后端发起请求

-------------------------------------------------------------------

**情景二**：点击 `history` 模式下的 `a` 文字，可以看到浏览器地址栏改变，同时终端访问记录也会增加 `1` 条
如下所示：
```sh
ctx:  http://localhost:3000/ 1
ctx:  http://localhost:3000/a 2
```

但是浏览器报 `404` 错误，这是因为浏览器地址改变时，它会向服务器发送一条 `GET` 请求，默认寻找 `http://localhost:3000 服务下 a 文件夹下的 index.html 、 index.htm、index.jsp 文件`

**说明**：`history` 模式下，浏览器地址栏改变，**会**向后端发起请求

### 四、理论结合实践 :chestnut:
我们以 `Vue 2.x` 框架为例，其他框架也是同样的道理，详细代码请看[这里][2_1]，`git clone` 下来之后
```sh
# 安装依赖

yarn install
# OR
npm run install

# 启动本地服务
yarn dev

# 产出代码（可放在生产环境）
yarn build
```

这里默认 `vue router` 路由模式为 `history`，`hash` 模式无此问题，不再赘述

```js
// src/router/index.js

export default new Router({
  mode: 'history', // 路由模式设置
  base: process.env.BASE_URL,
  routes,
})
```
yarn build 操作后，将 dist 文件夹拷贝到上面建的 index.js 同级目录下。

启动服务： `node index.js`

浏览器访问：`http://localhost:3000/admin-vb/`
**注**：`/admin-vb/` 以 `vue.config.js 文件下的 baseUrl 字段对应的值为准`

此时一切显示正常，也可以尝试切换路由。但是刷新浏览器会 `404` 错误。
这是因为，在刷新浏览器之前，访问的路由受前端 `vue router` 代码控制。当我们刷新浏览器后，浏览器就会尝试访问当前路径下的 `index.html、index.htm、index.jsp` 文件，很遗憾，当前路径下没有该文件，所以就会报错 `404` 找不到该文件。


**解决 `history` 模式，刷新浏览器 `404` 问题**

- :heart: [官宣方案][1_3] :heart:

- 我们刚刚自己创建的 `node` 服务如何解决呢？
具体思路，当前端向后端请求页面时，找不到页面则返回 `index.html` 页面。直接上代码，如下：
```js
const Koa = require('koa')
const koaStatic = require('koa-static')
const app = new Koa()
// 解决刷新 404 问题
const historyApiFallback = require('koa2-connect-history-api-fallback')
const path = require('path')

const root = path.join(__dirname, './')

// 记录访问服务次数
let count = 0

// 中间件，记录请求
app.use(async (ctx, next) => {
  console.log('ctx: ', ctx.href, ++count)
  await next()
})

// 解决刷新 404 问题
app.use(historyApiFallback({
  index: '/admin-vb/index.html'
}))

// 在文件夹根目录，创建静态服务
app.use(koaStatic(root))

app.listen(3000)

console.log('listening on port 3000')
```


欢迎关注**无广告文章**公众号：**学前端**

![](https://raw.githubusercontent.com/gauseen/images-bed/master/learn-fe.jpg)





[1_1]: https://developer.mozilla.org/zh-CN/docs/Web/API/Window/onhashchange
[1_2]: https://developer.mozilla.org/zh-CN/docs/Web/API/History_API
[1_3]: https://router.vuejs.org/zh/guide/essentials/history-mode.html#%E5%90%8E%E7%AB%AF%E9%85%8D%E7%BD%AE%E4%BE%8B%E5%AD%90

[2_1]: https://github.com/feseed/admin-vb
