---
title: 常见 Web 安全攻防
date: 2019-08-13 21:08:21
tags: [web,js,安全]
author: gauseen
---

### 一、XSS 攻击

`XSS (Cross Site Script)`，跨站脚本攻击，因为缩写和 `CSS (Cascading Style Sheets)` 重叠，所以叫 `XSS`  

#### 非持久型 XSS（反射型 XSS ）

**什么是非持久型 XSS 攻击？**  

非持久型 `XSS` 攻击，一般是 **URL 参数上带有恶意脚本代码**，当用户点击该 `URL` 时，**恶意代码参数**被脚本解析、执行

**XSS 攻击代码演示**  

如下代码：
```
<script>
    const searchParams = new URLSearchParams(location.search)
    const queryVal = searchParams.get('query') // 获取 url query 参数值
    eval(queryVal)
</script>
```
当用户访问 `http://xxx.com/xx?query=alert('xss')` 时，`query` 参数值 `alert('xss')` 就会被浏览器解析并执行，这就是所谓的 `XSS` 攻击  

**预防非持久型 XSS 攻击**  
- `Web` 页面渲染的数据源尽量来自服务器端
- 尽量不要使用可执行字符串的方法，如： `eval()、new Function()、document.write()、window.setInterval()、window.setTimeout()、innerHTML、document.createElement()`
- 如果上述方法无法避免，有关 `dom` 渲染的方法传入的字符串参数做 `escape` 转义处理
- 前端渲染的时候对任何的字段都需要做 `escape` 转义处理

#### 持久型 XSS（存储型 XSS）

**什么是持久型 XSS 攻击？**  

持久型 `XSS` 攻击，一般存在于 `form` 表单提交功能，如评论、留言等更改服务器端资源功能的地方。**将带有恶意脚本代码**提交到服务器并长期存储。当前端页面渲染获取到的后端数据时，恶意脚本代码恰好被解析、执行。  

**预防持久型 XSS 攻击**  
- 后端在入库前应该将所有的字段统一进行转义处理
- 后端在输出给前端数据统一进行转义处理
- 前端在渲染 `DOM` 之前，应该将所有字符做转义处理

这里持久型攻击，跟非持久型攻击很类似，都是利用编写代码时的缺陷，解析并执行了本不该执行的**带有恶意脚本代码**。只不过持久型 `XSS` 攻击将恶意代码片段存储在了服务器上。


### 二、CSRF 攻击

`CSRF(Cross Site Request Forgery)`，是跨站点请求伪造攻击，它利用用户登录的身份信息（如：`cookie`），以用户的身份完成非法操作  

**CSRF 攻击原理**  

![](https://raw.githubusercontent.com/gauseen/images-bed/master/blog/CSRF.png)

**CSRF 攻击代码演示**  

`web A` 网站伪代码：  

```js
const express = require('express')
const app = express()

// cors 允许跨域
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3001')
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  next()
})

app.get('/login', (req, res) => {
  res.cookie('sessionId', 'cookie-web-A') // 设置 cookie 值

  res.send(`登录成功`)
})

// 转账接口 伪逻辑
app.get('/transfer', (req, res) => {
  console.log(req.headers.cookie)
  // 验证 cookie 是否有效
  if (req.headers.cookie === 'sessionId=cookie-web-A') {
    res.send(`cookie 有效, 转账成功`)
  } else {
    res.send(`无效 cookie, 转账失败`)
  }
})

app.listen(3000, () => {
  console.log('done A')
})
```

`web B` **恶意网站**伪代码：  

```js
<script>
  let xhr = new XMLHttpRequest()
  xhr.withCredentials = true // cors 跨域携带 cookie

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      alert(xhr.responseText)
    }
  }
  // 请求 A 网站的转账接口，进行 CSRF 恶意攻击
  xhr.open('GET', 'http://localhost:3000/transfer', true)
  xhr.send(null)
</script>
```

**完成 CSRF 攻击必须要条件：**  

- 用户登录了 `A` 网站，并在本地存储了 `cookie`
- 在用户没有退出 `A` 网站的情况下，即 `A` 网站 `cookie` 生效条件下，打开了 `B` 恶意网站
- `A` 网站没有做任何 `CSRF` 防御措施（如：允许了跨域请求）

**预防 CSRF 攻击**  

- 不让第三方网站访问到用户 `cookie`
- 阻止第三方网站请求接口（禁止跨域请求）
- 禁止 `GET` 请求对数据进行修改

### 三、SQL 注入攻击

`SQL` 注入攻击，就是通过 `form` 表单输入恶意的 `SQL` 语句，来修改后台 `SQL`，服务端又解析、执行了修改后的 `SQL` 语句，从而达到攻击的目的  

**SQL 注入攻击代码演示**  

后端的 `SQL` 语句可能是如下这样的：
```sql
let querySQL = `
    SELECT *
    FROM user
    WHERE username='${username}'
    AND psw='${password}'
`;
```

这段 `SQL` 目的就是根据用户输入的 `username` 和 `password` 字段值来查询具体用户。正常使用没什么问题，但是当用户输入恶意 `SQL` 语句时就会有问题  
如：`username = 'gauseen' --'`，`password=任意字符`  

```sql
-- 我们预想的 SQL:

SELECT * FROM user WHERE username='gauseen' AND psw='xxx'
```

```sql
-- 注入攻击后的 SQL 语句为:

SELECT * FROM user WHERE username='gauseen' -- AND psw='xxxx'
```

在 `SQL` 中 `--` 是注释的意思，所以 `SQL` 语句实际为:
```sql
SELECT * FROM user WHERE username='gauseen'
```

这样就可以在不需要知道密码的情况下，登录任何你想登录的账户。  

**预防 SQL 注入攻击**  

- 后端代码检查输入的数据是否合法
- 对进入数据库的特殊字符 `'，"，\，<，>，&，*，;` 等进行转义处理
- 所有的查询语句建议使用数据库提供的参数化查询接口

### 四、DDOS 攻击：

`DDoS(Distributed Denial of Service)`，是分布式拒绝服务攻击，指攻击者利用“肉鸡”对目标网站在较短的时间内发起大量请求，大规模消耗目标网站的主机资源，使服务器超负荷，让它无法正常服务  

**预防 DDOS 攻击**  

- 黑名单，对有嫌疑的流量限制访问，但有阻挡正常流量的风险
- `DDoS` 清洗，对用户请求数据进行实时监控，及时发现 `DOS` 攻击等异常流量，并清洗掉这些异常流量



参考资料  

[常见 Web 安全攻防总结](https://zoumiaojiang.com/article/common-web-security/)  
[什么是 DDoS 攻击？](https://www.zhihu.com/question/22259175)