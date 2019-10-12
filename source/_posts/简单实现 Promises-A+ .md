---
title: 简单实现 Promises/A+ 规范
date: 2019-10-12 13:05:17
tags: [js,promise/A+,原理,实现]
author: gauseen
---

`Promises/A+` 规范可在[这里](https://promisesaplus.com)查看

`promise` 有 `3` 个状态，分别为 `pending`, `fulfilled` 和 `rejected`

- promise 在 `pending` 状态
  - 可以切换到 `fulfilled` 或 `rejected` 状态
- promise 在 `fulfilled` 状态
  - 不可以切换到其它状态
  - 必须有个不可以更改的 value 值
- promise 在 `rejected` 状态
  - 不可以切换到其它状态
  - 必须有个不可以更改的 reason 值

```js
// promise 三种状态
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

// MyPromise 构造函数
function MyPromise (fn) {
  // 初始化状态
  this.state = PENDING
  this.result = void 0
  this.handlerQueue = []

  let resolve = (value) => {
    transitionState(this, FULFILLED, value)
  }

  let reject = (reason) => {
    transitionState(this, REJECTED, reason)
  }

  // 调用 Promise 构造函数回调
  try {
    fn(resolve, reject)
  } catch (error) {
    reject(error)
  }
}
```

状态迁移方法，即调用了 `fn(resolve, reject)` 中的 `resolve, reject` 方法后，需要改变 `promise` 状态：

`pending --> fulfilled`

`pending --> rejected`


```js
function transitionState (promise, state, result) {
  if (promise.state !== PENDING) return
  promise.state = state
  promise.result = result

  // 这里先占个坑位
}
```


`then` 方法返回的是一个新的 `Promise` 实例（注意：不是原来那个 `Promise` 实例），只有这样才能不断的链式调用，依次改变状态

```js
MyPromise.prototype.then = function (onFulfilled, onRejected) {
  return new MyPromise((resolve, reject) => {
    let handler = { onFulfilled, onRejected, resolve, reject }
    // 若当前状态为 pending 则将其放在 handlerQueue 队列中，等待 resolve 或 reject 方法改变其状态
    // 否则直接调用 then 方法中的 resolve 或 reject 回调函数
    if (this.state ==== PENDING) {
      this.handlerQueue.push(handler)
    } else {
      dispatchHandler(handler, this.state, this.result)
    }
  })
}
```

```js
const isFunction = arg => typeof arg === 'function'

function dispatchHandler (handler, state, result) {
  let { onFulfilled, onRejected, resolve, reject } = handler

  if (state === FULFILLED) {
    let finalValue = isFunction(onFulfilled) ? onFulfilled(result) : result
    resolve(finalValue)
  } else if (state === REJECTED) {
    let finalReason = isFunction(onRejected) ? onRejected(result) : result
    reject(finalReason)
  }
}
```

以上代码，只支持 Promise 回调函数参数 `resolve` 和 `reject` **同步调用**的情况，如下示例代码：

```js
// 支持

let myPromise = new MyPromise((resolve, reject) => {
  // resolve 同步调用
  resolve('同步调用 value')
})

myPromise.then((value) => {
  console.log('value: ', value)
}, (reason) => {
  console.log('reason: ', reason)
})
```

但是，使用异步调用**不支持**，如下示例代码：

```js
// 暂不支持

let myPromise = new MyPromise((resolve, reject) => {
  // resolve 异步调用
  setTimeout(() => {
    resolve('异步调用 value')
  })
})

myPromise.then((value) => {
  console.log('value: ', value)
}, (reason) => {
  console.log('reason: ', reason)
})
```

之所以不支持异步调用 `resolve 或 reject`，是因为 `then` 方法中如下代码片段：

```js
  // 当 resolve 为异步调用，then 方法执行时，promise 状态为 pending。
  // 所以 then 回调函数 onFulfilled 和 onRejected 在 handlerQueue 队列里，没有被调用
  if (this.state ==== PENDING) {
    this.handlerQueue.push(handler)
  } else {
    // ...
  }
```

为支持 `resolve`、`reject` 异步调用，状态迁移方法 `transitionState`，做如下修改：

```js
function transitionState (promise, state, result) {
  if (promise.state !== PENDING) return
  promise.state = state
  promise.result = result

  // 新增代码开始
  promise.handlerQueue.forEach(handler => {
    dispatchHandler(handler, state, result)
  })
  // 新增代码结束
}
```

因为 `catch` 方法是 `.then(null, onRejected)` 的别名，所以实现 `catch` 代码如下：

```js
MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected)
}
```

如上，简单实现了 `promise`，支持链式调用 `then 和 catch`



欢迎关注**无广告文章**公众号：**学前端**

![](https://raw.githubusercontent.com/gauseen/images-bed/master/learn-fe.jpg)









### 参考

[promise-aplus-impl](https://github.com/Lucifier129/promise-aplus-impl)
