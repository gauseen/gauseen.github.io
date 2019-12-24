const App = function () {
  let context = {}
  let middlewares  = []
  return {
    // 将中间件放入队列中
    use (fn) {
      middlewares.push(fn)
    },
    // 调用中间件
    callback () {
      // compose(middleware)
      // 初始调用第 1 个中间件
      return dispatch(0)
      function dispatch(i) {
        let fn = middlewares[i]
        // 执行中间件，回调参数是：公共数据、调用下一个中间件函数
        // 返回一个 Promise 实例
        return Promise.resolve(
          fn(context, function next () { dispatch(i + 1) })
        )
      }
    },
  }
}

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

app.callback()
