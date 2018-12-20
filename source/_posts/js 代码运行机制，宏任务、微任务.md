---
title: js 代码运行机制，宏任务、微任务
date: 2018-12-08 18:28:10
tags: [js,setTimeout,html]
author: gauseen
---

### 0. 关于 JavaScript
JavaScript 是**单线程**语言，其他所谓的“多线程”都是模拟出来的。

### 1. JavaScript 事件循环
- 为了解决 js 单线程在执行大量耗时代码时的问题，程序员将 js 的任务分为两大类：
  - 同步任务
    - 进入主线程执行
  - 异步任务
    - 进入`Event Table`执行
    - 当指定的事件完成时，`Event Table`会将这个回调函数移入`Event Queue`
    - 主线程内的任务执行完毕为空，会去`Event Queue`读取对应的函数，进入主线程执行
    - 上述过程会不断重复，也就是常说的Event Loop(事件循环)

### 2 macro-task(宏任务)、micro-task(微任务)
- 除了广义的同步任务和异步任务，其实对任务还有更细致的划分
  - macro-task(宏任务)：包括整体代码 `script`，`setTimeout`，`setInterval`
  - micro-task(微任务)：`Promise`，`process.nextTick`

`js` 事件循环机制，决定了代码执行顺序。

**第一步**：`js` 解释器识别所有 `js` 代码，将同步的代码放到主线程执行；异步的代码放到`Event Table`执行。这也是第一次宏任务执行完毕！

**第二步**：接下来执行所有的微任务。  

之后一直循环一、二步骤

### 3. 举个栗子 :chestnut:
```js
setTimeout(() => console.log('setTimeout-1'), 0)

async function todo1 (params) {
	console.log('todo1-await-above')
	await Promise.resolve(99)
	console.log('todo1-await-under')
}

todo1()

new Promise((resolve, reject) => {
	console.log('promise-1')
	resolve()
}).then(data => {
	console.log('promise-then-1')
})

console.log('end')
```
- 这段代码作为**宏任务**，进入主线程
- 先遇到 `setTimeout` ， 等待 `0 ms` 后，将其回调函数注入到**宏任务**`Event Queue`
- 接下来遇到 `todo1` 函数，没调用，就当看不到 :bowtie:
- 调用 `todo1` 函数
- 遇到 `console.log('todo1-await-above')` 立即执行并输出
- 遇到 `await promise` 将等待 `promise` 执行结束后再继续执行，这里将执行权交给`todo1`函数外部继续执行
- 遇到 `new Promise` 立即执行 `console.log('promise-1')` 并输出，之后执行 `resolve()`，将`then` 的回调函数注入到**微任务**`Event Queue`
- 遇到 `console.log('end')` ，立即执行并输出
- **注意**代码还有`console.log('todo1-await-under')`没有执行，在这里执行并放到**微任务**`Event Queue`【作者译：因为`await`后面跟着状态不确定的`promise`】
- 好了，整体代码`<script>`作为第一轮的宏任务执行结束，接下来按照先进先出原则，执行**微任务队列**事件。
- 执行并输出`promise-then-1`
- 执行并输出`todo1-await-under`
- 检查宏任务队列，这时还有`setTimeout`回调函数需要执行
- 执行并输出`setTimeout-1`
- 最后再次检查微任务队列，没有啦。再检查宏任务队列，也没啦。
- 到此结束！

```js
// 输出：
// todo1-await-above
// promise-1
// end

// promise-then-1
// todo1-await-under

// setTimeout-1
```

-----------------------------------------

接下来我们稍微改变一下：
```js
setTimeout(() => console.log('setTimeout-1'))

async function todo1 (params) {
	console.log('todo1-await-above')
	// await Promise.resolve(99)
	await 123  // 改变啦
	console.log('todo1-await-under')
}

todo1()

new Promise((resolve, reject) => {
	console.log('promise-1')
	resolve()
}).then(data => {
	console.log('promise-then-1')
})

console.log('end')
```
上面这段代码做了稍微的改动，将`todo1`函数中的`await Promise.resolve(99)`更改为`await 123`

- 老规矩，这段代码作为**宏任务**，进入主线程
- 先遇到 `setTimeout` ， 等待 `0 ms` 后，将其回调函数注入到**宏任务**`Event Queue`
- 接下来遇到 `todo1` 函数，没调用，就当看不到 :bowtie:
- 调用 `todo1` 函数
- 遇到 `console.log('todo1-await-above')` 立即执行并输出
- 遇到 `await 123` 因为这里await一个具体值，状态是明确的，所以继续向下执行，将`console.log('todo1-await-under')`放到**微任务队列**
- 遇到 `new Promise` 立即执行 `console.log('promise-1')` 并输出，之后执行 `resolve()`，将 `then` 的回调函数注入到**微任务**`Event Queue`
- 遇到 `console.log('end')` ，立即执行并输出
- 好了，整体代码`<script>`作为第一轮的宏任务执行结束，接下来按照先进先出原则，先执行**微任务队列**事件。
- 执行并输出`todo1-await-under`
- 执行并输出`promise-then-1`
- 检查宏任务队列，这时还有`setTimeout`回调函数需要执行
- 执行并输出`setTimeout-1`
- 最后再次检查微任务队列，没有啦。再检查宏任务队列，也没啦。
- 到此结束！

```js
// 输出：
// todo1-await-above
// promise-1
// end

// todo1-await-under
// promise-then-1

// setTimeout-1
```

**声明：以上结果在 Google Chrome, 70.0.3538.110 版本 中运行得出**

##### 我的眼界有限，有什么不对的地方欢迎指正，谢谢！

#### 参考
[这一次，彻底弄懂 JavaScript 执行机制](https://juejin.im/post/59e85eebf265da430d571f89)  

[理解 JavaScript 的 async/await](https://segmentfault.com/a/1190000007535316)
