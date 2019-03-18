---
title: 理解浏览器 HTTP 缓存
date: 2019-03-15 18:30:10
tags: [js,http,ajax,浏览器,缓存]
author: gauseen
---

浏览器缓存也包含很多内容： `HTTP` 缓存、`indexDB`、`cookie`、`localstorage` 等等。这里我们只讨论 `HTTP` 缓存。

- **`get` 请求被缓存，`post` 请求一般不会被缓存**


- **缓存主要分为 2 大类**
  - 强缓存
    - 优先级高于协商缓存
    - 浏览器一旦命中强缓存，直接使用缓存，不会和服务器发生交互
    - 响应头控制字段：`Expires`、`Cache-Control`
  - 协商缓存
    - 优先级底
    - 协商缓存不管是否命中都要和服务器端发生交互
    - 响应头控制字段：`Last-Modified && If-Modified-Since`、`ETag && If-None-Match`

- **强缓存**  
强缓存可以在响应头里设置 `Expires`、`Cache-Control` 字段来控制本次请求是否被强缓存。

  - `Expires`(`HTTP/1` 产物)  
  `Expires` 指缓存过期的时间，是服务器端的具体的时间，超过了这个时间就代表资源过期。`Expires` 有个缺点，保存时间以客户端本地时间为准，如果服务器跟本地时间不一致或者手动更改了本地时间，就是造成本地缓存失效问题。
  
  - `Cache-Control`(`HTTP/1.1` 产物)
  `Cache-Control` 优先级高于 `Expires` ，如果响应头中同时出现 `Cache-Control` 和 `Expires` 时，以 `Cache-Control` 为准 ，它有很多可选值来灵活控制缓存。
    - `max-age`(单位 `s`)：指定一个相对时间长度，是此刻时间的多少秒后缓存过期，在这个时间段内缓存是有效的。 
    - `s-maxage`(单位 `s`)：跟 `max-age` 作用一样，只在代理服务器中生效，`s-maxage` 的优先级高于 `max-age`
    - `public`：(共享)代理缓存，表明响应可以被任何中间代理、`CND` 缓存
    - `private`：(私有)浏览器缓存，表示该响应只能用于客户端缓存，中间代理、`CND` 不能缓存此响应，该响应只能应用于浏览器私有缓存中
    - `no-cache`：不直接使用缓存，而是在使用浏览器缓存之前，先通过协商缓存策略，跟服务器发个校验请求，检查资源是否被更改，再决定是否使用缓存
    - `no-store`：禁止缓存，每次请求都要向服务器重新获取数据

- **协商缓存**  
当浏览器没有命中强缓存时（缓存时间过期），这时就会启动协商缓存策略，也就是浏览器携带缓存标识向服务器发起请求，由服务器根据缓存标识决定是否使用缓存的过程。  
**注：客户端向后端发起请求，不一定重新拉取服务器资源**
  - 协商缓存生效，请求状态返回 `304 和 Not Modified`
  - 协商缓存失效，返回状态码 `200` 和请求结果

- **协商缓存标识有哪些呢？**
  - `Last-Modified && If-Modified-Since` 配合进行协商缓存 

    - 浏览器第一次请求资源时，服务器响应头带有 `Last-Modified`（资源最后修改时间） 标识，之后浏览器会记录这个资源对应的修改时间。  
    - 再次请求该资源时，请求头会携带 `If-Modified-Since` 标识，服务器收到请求后，会拿 `If-Modified-Since` 标识跟该资源最后修改时间对比。若时间相同，代表资源没有修改，响应 `304` 状态，让浏览器使用本地缓存数据；若时间不同，代表该资源已经被修改过，响应 `200`，返回最新资源。
  
  - `Etag && If-None-Match` 配合进行协商缓存（**优先级大于** `Last-Modified && If-Modified-Since`）  
    - 浏览器第一次请求资源时，服务器响应头带 `Etag` 标识，该标识由服务器根据资源内容计算得出。
    - 当再次请求时，请求头携带 `If-None-Match` 字段，服务器接收响应，发现有 `If-None-Match` 字段，则与请求的资源 `Etag` 对比。相同，代表资源没有修改，则响应 `304`，让浏览器使用本地缓存数据；不同，代表资源已经被修改过，响应 `200`，返回最新资源。


- **浏览器请求时序图**  

  ![HTTP 第一次请求时序图](https://raw.githubusercontent.com/gauseen/blog/master/images/http-first.png)

  ![HTTP 多次请求时序图](https://raw.githubusercontent.com/gauseen/blog/master/images/http-multiple.png)
    

#### 参考文章
- [深入理解浏览器的缓存机制][1_0]
- [HTTP 缓存][1_1]
- [HTTP 缓存机制一二三][1_2]

[0_0]: https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types

<!-- 参考 -->
[1_0]: https://github.com/sunyongjian/blog/issues/34
[1_1]: https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching?hl=zh-cn
[1_2]: https://zhuanlan.zhihu.com/p/29750583
