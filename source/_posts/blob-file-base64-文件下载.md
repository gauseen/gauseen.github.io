---
title: Blob、File 、Base64 之间的闭环，你确定都知道？
date: 2020-01-13 16:50:23
tags: [blob,file,base64,文件下载,图片压缩]
author: gauseen
---

> 作者：[gauseen](https://github.com/gauseen "gauseen")
> 原文: https://github.com/gauseen/blog

### 说一说本篇文章讲哪些点

相信在工作中经常遇到，文件上传、图片压缩、文件下载、大文件断点续传，等等关于 js 来操作文件的需求。那么你真的了解文件类型之间的转换关系吗？如下：

- `Blob` --> `File`
- `File` --> `DataURL（base64）`
- `File` --> `BlobURL`
- `HTTPURL| DataURL | BlobURL` --> `Blob`

![文件类型转换闭环](https://raw.githubusercontent.com/gauseen/images-bed/master/blog/file-c.png)

**提示：** 公众号回复 “file” 可得高清原图

### [Blob 类型][Blob]

`Blob` 类型是 `File` 文件类型的父类，它表示一个不可变、原始数据的类文件对象

#### 如何得到 `blob` 对象？

**1. new Blob(array, options)**

```js
let hiBlob = new Blob([`<h1>Hi gauseen!<h1>`], { type: 'text/html' })
```

如上代码，就创建了一个 `blob` 对象，并声明了 `text/html` 类型 ，就像是创建一个 `.html` 文件。只不过它存在于浏览器的内存里。

**2. fetch(url)**

js 为我们提供了很多获取资源的 api，如：`<img> 和 <script>`，
`Fetch API` 提供了一个获取资源的统一接口（包括跨域请求）

关于 `fetch(url, options)`, `url` 参数支持格式有：

> 截止到 2020-01-13

- `http、https`
- `blobURL`: 比如通过 `URL.createObjectURL()` 获得
  ```
  // blobURL 示例：
  blob:null/7025638d-c05f-4c75-87d6-470a427e9aa3
  ```
- `dataURL`: 如图片的 base64 格式，比如通过 `convasElement.toDataURL()` 获得
  ```
  // dataURL(base64) 黑色 1 像素示例：
  data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=
  ```

`fetch(url, options)` 响应数据可被解析成：

- `res.arrayBuffer()`: 通用、固定长度的原始二进制数据缓冲区
- `res.blob()`: `Blob` 类型
- `res.formData()`: 表单数据类型
- `res.json()`: `JSON` 格式
- `res.text()`: 文本格式

本文主要关心 `blob` 类型转换，如下代码，用 fetch api 获取图片资源的 blob 对象，
当然也可以获取其它类型的资源。如：`.txt` `.html` 等

```js
// 获取图片的 blob 对象
// 通过 http、https 获取
fetch('http://eg.com/to/path/someImg.png')
  .then(res => res.blob())
  .then(blob => {
    console.log('blob: ', blob)
  })
```

**3. canvasElement.toBlob(callback)**

canvas 具有图像操作能力，支持将一个已有的图片作为图片源，来操作图像。

如下，通过 canvas 将图片资源转成 `blob` 对象

```html
<body>
  <canvas width="100" height="100"></canvas>
</body>

<script>
  const $ = arg => document.querySelector(arg)
  let convas = $('canvas')
  // async 自执行函数
  (async () => {
    let imgUrl = 'http://eg.com/to/path/someImg.png'
    let ctx = convas.getContext('2d')
    let img = await fetchImg(imgUrl)
    // 向 canvas 画布上下文绘制图片
    ctx.drawImage(img, 0, 0)

    // 获取图片 blob 对象
    convas.toBlob((blob) => {
      console.log('blob: ', blob)
    })

    // 获取图片 dataURL，也是 base64 格式
    let dataURL = convas.toDataURL()
    console.log('dataURL: ', dataURL)
  })()

  // 获取图片资源，封装成 promise
  function fetchImg (url) {
    return new Promise((resolve, reject) => {
      let img = new Image()
      // 跨域图片处理
      img.crossOrigin = 'anonymous'
      img.src = url
      // 图片资源加载完成回调
      img.onload = () => {
        resolve(img)
      }
    })
  }
</script>
```

**注：**
- 如果图片没加载完，就调用 `drawImage`，canvas 绘制将失败，所以我们简单封装了 `fetchImg` 方法，确保图片资源加载完成后再开始绘制图片。
- 由于 canvas 中的图片可能来自一些第三方网站。在不做处理的情况下，使用跨域的图片绘制时会**污染画布**，这是出于安全考虑。在“被污染”的画布中调用 `toBlob()` `toDataURL()` `getImageData()` 会抛出安全警告。

  解决方法：

  ```js
  let img = new Image()
  // 1. 增加 crossOrigin 属性，值为 anonymous
  // 含义：执行一个跨域请求，在请求头里加 origin 字段
  // 2. 后端要返回 Access-Control-Allow-Origin 响应头来允许跨域
  img.crossOrigin = 'anonymous'
  img.src = 'to/path'
  ```

  本质就是解决跨域问题，也可以使用 `nginx` 做个代理来解决
- `blob` 有 `slice(startIndex, endIndex)` 方法，复制 blob 对象某片段，与 js 数组的 `slice` 方法类似，文件的断点续传功能就是利用了改特性。

### [File 类型][File]

`File` 包含文件的相关信息，可以通过 js 来访问其内容

#### 如何获取 `file` 对象？

**1. new File(bits, name[, options])**

```js
// 1. 参数是字符串组成的数组
let hiFile = new File([`<h1>Hi gauseen!<h1>`], 'fileName', { type: 'text/html' })

// 2. blob 转 file 类型
let hiBlob = new Blob([`<h1>Hi gauseen!<h1>`], { type: 'text/html' })
let hiFile = new File([ hiBlob ], 'fileName', { type: 'text/html' })
```

如上代码，通过 `File` 构造函数，创建一个 `file` 对象，与上面的提到的 `blob` 类似。可以将 blob 转成 file 类型，这意味着上面获取的 blob，可以转成 file 类型。

**2. inputElement.files**

通过 `<input type="file">` 标签获取 `file` 对象

```js
// input 上传文件时触发 change 事件
$('input').addEventListener('change', e => {
  let file = e.target.files[0]
  console.log('file: ', file)
})
```

**3. DragEvent.dataTransfer.files**

通过拖、放获取 `file` 对象

```html
<body>
  <div id="output">
     将文件拖放到这里~
  </div>
</body>

<script>
  const $ = arg => document.querySelector(arg)
  let outputEle = $('#output')
  // ondragover 事件规定在何处放置被拖动的数据
  outputEle.addEventListener('dragover', dragEvent => {
    dragEvent.preventDefault()
  })
  // ondrop 事件放置文件时触发
  outputEle.addEventListener('drop', dragEvent => {
    dragEvent.preventDefault()
    // DataEvent.dataTransfer 属性保存着拖拽操作中的数据
    let files = dragEvent.dataTransfer.files
    console.log('drag files: ', files)
  })
</script>
```

**4. canvasElement.mozGetAsFile()**

**注：** 截止 `2020-01-13`，该方法仅支持火狐浏览器

```js
let file = canvasElement.mozGetAsFile('imgName')
```


### DataURL（base64）

DataURL，前缀为 `data:` 协议的 URL，可以存储一些小型数据

语法：`data:[<mediatype>][;base64],<data>`

如下，黑色 1 像素示例：

```
data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=
```

上面提到的 `Blob` `File` 类型，如何“消费”它们呢？接着向下看

**1. FileReader**

允许 Web 应用程序异步读取存储在用户计算机上的文件（`blob` 或 `file`）。

```js
// 将 blob 或 file 转成 DataURL（base64） 形式
fileReader(someFile).then(base64 => {
  console.log('base64: ', base64)
})

function fileReader (blob) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target.result)
    }
    reader.readAsDataURL(blob)
  })
}
```

**2. convasElement.toDataURL()**

可以通过 canvas 图像处理能力，将图片转成 dataURL 形式。在上面 Blob 部分讲解中，代码已实现。

### BlobURL(ObjectURL)

`BlobURL` 也叫 `ObjectURL`，它可以让只支持 URL 协议的 Api（如：`<a> <link> <img> <script>`） 访问 `file` 或 `blob` 对象。
[dynamic-import-polyfill](https://github.com/GoogleChromeLabs/dynamic-import-polyfill) 库也用到了其特性。

如下，生成 `blobURL`，`createObjectURL` 方法创建从 URL 到 Blob 的映射关系。
如：`blob:http://eg.com/550e8400-e29b-41d4-a716-446655440000`

```js
// object 创建 URL 的 File 对象、Blob 对象或者 MediaSource 对象
let blobURL = URL.createObjectURL(object)
```

如下，`revokeObjectURL` 方法撤消 blobURL 与 Blob 的映射关系，有助于浏览器垃圾回收，提示性能。

```js
URL.revokeObjectURL(blobURL)
```

### 形成闭环

通过上面的一系列转换关系，可以知道：

```
blob --> file --> dataURL(base64) | blobURL --> blob
```

这样就形成了一个闭环，文章开头的思维导图很好的说明了之间的转换关系。

### 应用举例

#### 文件下载

通过 a 标签实现下载，blob 或 file 对象。至于如何获取 blob 和 file 上面已经说得很清楚了。

```js
function downloadFile1 (blob, fileName = 'fileName') {
  let blobURL = URL.createObjectURL(blob)
  let link = document.createElement('a')
  link.download = fileName
  link.href = blobURL
  link.click()
  // 释放 blobURL
  URL.revokeObjectURL(blobURL)
}

// 当然也可以通过 window.location.href 下载文件
function downloadFile2 (blob, fileName = 'fileName') {
  let blobURL = URL.createObjectURL(blob)
  window.location.href = blobURL
  // 释放 blobURL
  URL.revokeObjectURL(blobURL)
}
```

#### 压缩图片

```js
// 压缩图片，图片质量为 0.6
compressImage('to/path/someImg.png', 0.6).then(base64 => {
  console.log('compressImage: ', base64)
})

// imgUrl 图片地址
// quality 图片质量 0 ~ 1 之间
// type 压缩图片只支持，image/jpeg 或 image/webp 类型
// 返回 base64 数据
async function compressImage (imgUrl, quality = 1, type = 'image/jpeg') {
  let imgEle = await fetchImg(imgUrl)
  let canvas = document.createElement('canvas')
  let cxt = canvas.getContext('2d')
  // 设置 canvas 宽高
  let { width, height } = imgEle
  canvas.setAttribute('width', width || 100)
  canvas.setAttribute('height', height || 100)

  cxt.drawImage(imgEle, 0, 0)
  return canvas.toDataURL(type, quality)
}

// 通过 url 获取图片
function fetchImg (url) {
  return new Promise((resolve, reject) => {
    let img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = url
    img.onload = () => {
      resolve(img)
    }
  })
}
```

### 总结

相信读完这篇文章以后，你会对文件类型之间的转换有更全方位的了解，其实还有很多像 `ArrayBuffer` 存储二进制数据相关的 Api 没有写到，因为平时用到的场景比较少，感兴趣的可以结合本文，去更深一步的探索。


欢迎关注**无广告文章**公众号：**学前端**

> PS: 只搞技术不搞广告文都不关注？没天理啦！
> 你的关注是我更文最大动力！

![无广告公众号学前端](https://raw.githubusercontent.com/gauseen/images-bed/master/learn-fe.jpg)





### 参考
- [blob-url W3C](https://w3c.github.io/FileAPI/#blob-url)
- [Download File Using Javascript](https://stackoverflow.com/questions/3749231/download-file-using-javascript-jquery)


<!-- 链接 -->
[Blob]: https://developer.mozilla.org/zh-CN/docs/Web/API/Blob/Blob
[File]: https://developer.mozilla.org/zh-CN/docs/Web/API/File
