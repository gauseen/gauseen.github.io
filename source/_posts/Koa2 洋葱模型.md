---
title: 大白话讲解 Koa2 洋葱模型
date: 2019-12-25 12:28:11
tags: [js,node,Koa2,洋葱模型,原理,实现]
author: gauseen
---

> 作者：[gauseen](https://github.com/gauseen)
> 原文：[https://github.com/gauseen/blog](https://github.com/gauseen/blog)

### Koa.js

`Koa.js` 是一个极其精简的 Web 服务框架，主要提供以下功能：

- `HTTP` 服务：主要处理 `request` 和 `response`
- 中间件数据处理机制（洋葱模型）

### 什么是 AOP？

`AOP` 为 Aspect Oriented Programming 的缩写，中文意思为：**面向切面编程**，它是[**函数式编程**][functional_programming]的一种衍生范式

举个栗子 :chestnut: ：

假如我想把一个**苹果**（源数据）处理成**果盘**（最终数据）我该怎么做？

① 苹果（源数据） ---->
② 洗苹果 ---->
③ 切苹果 ---->
④ 放入盘子 ---->
⑤ 果盘（最终数据）

共有 5 个步骤，如果我想升级一下果盘，打算在切苹果之前先**削皮**，放入盘子后**摆成五角星形状**那么我的步骤应该如下：

① 苹果（源数据） ---->
② 洗苹果 ---->
③ 削皮 ---->
④ 切苹果 ---->
⑤ 放入盘子 ---->
⑥ 摆成五角星形状 ---->
⑦ 果盘（最终数据）

上面每个步骤都可以看成相应的方法，步骤 ③ 和 ⑥ 加入与否都不影响我制作出果盘这个结果，可以看出这样是非常灵活的

其实这就是生活中**面向切面编程**的例子，
换句话说，就是在现有程序中，加入或减去一些功能不影响原有的代码功能。

### 什么是 `Koa.js` 洋葱模型？

洋葱模型其实就是中间件处理的流程，中间件生命周期大致有：

- 前期处理
- 交给并等待其它中间件处理
- 后期处理

多个中间件处理，就形成了所谓的**洋葱模型**，它是 `AOP` 面向切面编程的一种应用。

结合一下上面的果盘例子可知，在 Koa.js 中，苹果（源数据）就是 请求数据 `request`，果盘（最终数据）就是 响应数据 `response`，中间处理的过程就是 Koa2.js 的中间件函数处理的过程

一张经典的洋葱切面图如下：

![][img_onion]

先回顾一下，Koa2.js 中下面代码打印输出顺序为：

```js
const Koa = require('koa')
const app = new Koa()

app.use(async (cxt, next) => {
  console.log('middleware_01 start')
  await next()
  console.log('middleware_01 end')
})

app.use(async (cxt, next) => {
  console.log('middleware_02 start')
  await next()
  console.log('middleware_02 end')
})

app.use(async (cxt, next) => {
  console.log('middleware_03 start')
  console.log('middleware_03 end')
})

app.listen(3000)
```

```js
// 浏览器访问：http://localhost:3000
// 输出顺序为：

middleware_01 start
middleware_02 start
middleware_03 start
middleware_03 end
middleware_02 end
middleware_01 end
```

### 如何实现洋葱模型（中间件机制）

想一想，怎样才能实现 Koa.js 中间件处理机制呢？

#### 最简单版，如下代码：

```js
// 函数处理的数据
let context = {}

function middleware_01 (cxt) {
  console.log('middleware_01 start')
  middleware_02(cxt)
  console.log('middleware_01 end')
}

function middleware_02 (cxt) {
  console.log('middleware_02 start')
  middleware_03(cxt)
  console.log('middleware_02 end')
}

function middleware_03 (cxt) {
  console.log('middleware_03 start')
  console.log('middleware_03 end')
}

// 调用中间件 compose 函数
function compose () {
  // 默认调用第一个中间件
  middleware_01(context)
}

compose()

// 输出结果如下，与上面中间件一致：

middleware_01 start
middleware_02 start
middleware_03 start
middleware_03 end
middleware_02 end
middleware_01 end
```

上面代码虽然实现了，但是有不足点，如：

- 要显示指明要调用的函数名称，不够灵活

#### 升级版：

```js
const App = function () {
  // 中间件公共的处理数据
  let context = {}
  // 中间件队列
  let middlewares = []
  return {
    // 将中间件放入队列中
    use (fn) {
      middlewares.push(fn)
    },
    // 调用中间件
    callback () {
      // 初始调用 middlewares 队列中的第 1 个中间件
      return dispatch(0)
      function dispatch (i) {
        // 获取要执行的中间件函数
        let fn = middlewares[i]
        // 执行中间件函数，回调参数是：公共数据、调用下一个中间件函数
        // 返回一个 Promise 实例
        return Promise.resolve(
          fn(context, function next () { dispatch(i + 1) })
        )
      }
    },
  }
}
```

上面代码，在不考虑特殊边界情况下，就完成了 Koa2.js 中简易版中间件的封装，让我们来测试一下

```js
// 测试代码

let app = App()

app.use(async (cxt, next) => {
  console.log('middleware_01 start')
  await next()
  console.log('middleware_01 end')
})

app.use(async (cxt, next) => {
  console.log('middleware_02 start')
  await next()
  console.log('middleware_02 end')
})

app.use(async (cxt, next) => {
  console.log('middleware_03 start')
  console.log('middleware_03 end')
})

// Koa2.js 源码中，放在 http.createServer(callback) 回调中调用
// 这里我们直接调用
app.callback()

// 输出如下：

middleware_01 start
middleware_02 start
middleware_03 start
middleware_03 end
middleware_02 end
middleware_01 end
```

想更深入的了解 Koa2.js 洋葱模型可在[这里看源码][koa2js]


---------------------------------------------
欢迎关注**无广告文章**公众号：**学前端**

![](https://raw.githubusercontent.com/gauseen/images-bed/master/learn-fe.jpg)




### 参考

- [Koa.js 设计模式-学习笔记](https://github.com/chenshenhai/koajs-design-note)
- [什么是面向切面编程 AOP？](https://www.zhihu.com/question/24863332)


<!-- 引用 -->
[koa2js]: https://github.com/koajs/koa
[img_onion]: https://raw.githubusercontent.com/gauseen/images-bed/master/blog/koa-middlewares-onion.jpg
[functional_programming]: https://www.zhihu.com/question/28292740

