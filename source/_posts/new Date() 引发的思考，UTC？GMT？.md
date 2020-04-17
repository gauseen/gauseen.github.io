---
title: new Date() 引发的思考，UTC？GMT？
date: 2020-04-17 11:35:10
tags: [js,time,UTC,GMT,Date 兼容,时区]
author: gauseen
---

### new Date()

获取当前日期相信大家都知道，如下：

```js
// 如果没有输入任何参数，则 Date 的构造器会依据系统设置的当前时间来创建一个 Date 对象
new Date()

Thu Apr 16 2020 13:55:25 GMT+0800 (中国标准时间)
```

是否注意到 `GMT+0800` 标识是什么意思？又是如何计算的呢？

### GMT 和 UTC 概念

**格林尼治平均时间（GMT）**

**格林尼治平均时间**（英语：Greenwich Mean Time，**GMT**）是指位于**英国伦敦**郊区的皇家**格林尼治天文台**当地的平太阳时

格林尼治标准时间的正午是指当平太阳横穿格林尼治子午线时（也就是在格林尼治上空最高点时）的时间。由于地球每天的自转是有些不规则的，而且正在缓慢减速，因此格林尼治平时基于天文观测本身的缺陷，已经被原子钟报时的协调世界时（UTC）所取代

自 1924 年 2 月 5 日开始，格林尼治天文台负责每隔一小时向全世界发放调时信息

**协调世界时（UTC）**

**协调世界时**（英语：Coordinated Universal Time，法语：Temps Universel Coordonné，简称 **UTC**）又被称为：又称世界统一时间、世界标准时间，它是最主要的世界时间标准，其以原子时秒长为基础，在时刻上尽量接近于**格林威治标准时间**。

**UTC、GMT 二者关系**

对于大多数用途来说，**UTC** 与 **GMT** 时间可以互换，**GMT** 代表一个时区的当地时间（英国伦敦），**UTC** 代表时间标准。

### 时区

英国伦敦为 0 时区，世界各地时间以 0 时区为标准，加减相应的时差来计算本地时区时间。

地球是“自西向东”自转的，东区的时间比西区的时间要早几个小时。

英国伦敦时间分为夏令时和冬令时，英国实行夏令时，与中国相差 7 小时时差；英国实行冬令时，与中国相差 8 小时。

![时区图](https://raw.githubusercontent.com/gauseen/images-bed/master/blog/%E6%97%B6%E5%8C%BA%E5%9B%BE.jpg)

### 北京时间（中国标准时间）

`GMT+0800` 代表中国标准时间，就是英国 0 时区（UTC/GMT）加上 8 小时

### js new Date() 兼容问题

Chrome 浏览器下演示一个很有意思的现象：

```js
new Date('2020-4-20')
Mon Apr 20 2020 00:00:00 GMT+0800 (中国标准时间)

new Date('2020-04-20')
Mon Apr 20 2020 08:00:00 GMT+0800 (中国标准时间) // 多 8 小时

--------------------------------------------------

new Date('2020/4/20')
Mon Apr 20 2020 00:00:00 GMT+0800 (中国标准时间)

new Date('2020/04/20')
Mon Apr 20 2020 00:00:00 GMT+0800 (中国标准时间)
```

[MDN 中提到](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date "MDN 中提到")，由于浏览器之间的差异与不一致性，强烈不推荐使用 `Date` 构造函数来解析日期字符串 (或使用与其等价的 `Date.parse`)。对 ISO 8601 格式的支持中，仅有日期的串 (例如 "1970-01-01") 会被处理为 UTC 而不是本地时间。

也就是说：

- 有前导零时 `new Date('2020-04-20')` 被认为是 **UTC（零时区）** 时间, 转换成中国标准时间为 `Mon Apr 20 2020 08:00:00 GMT+0800` 与传入值不同多了 **8** 小时。
- 无前导零时 `new Date('2020-4-20')` 被认为是 **本地时间（中国北京为东八区）** ，已经是本地时间所以中国标准时间为 `Mon Apr 20 2020 00:00:00 GMT+0800` ，与传入值相同没有多时间。

Firefox 浏览器下面都将解析成 UTC（零时区）时间：

```js
new Date('2020-4-20')
Date 2020-04-20T00:00:00.000Z

new Date('2020-04-20')
Date 2020-04-20T00:00:00.000Z

--------------------------------------------------

new Date('2020/4/20')
Date 2020-04-19T16:00:00.000Z // 少 8 小时

new Date('2020/04/20')
Date 2020-04-19T16:00:00.000Z // 少 8 小时
```

**注**：通过 `date.getHours()` 等 api，可以获取到本地时间

`2020-04-19T16:00:00.000Z` 为 [ISO 8601 规范](http://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15 "ISO 8601 规范")，时间格式为：`YYYY-MM-DDTHH:mm:ss.sssZ`，

- **T**：一个标识符，将日期和具体时间隔开，标识时间元素的开始
- **Z**：代表时区偏移量，Z 表示 UTC（零时区）时间

##### 解决兼容问题

`'2020-4-20'` 格式在各个浏览器都有不同的解析方式，所以可以转换成 `'2020/4/20'` 格式来解决解析不一致问题，如下：

```js
function getDate (dateStr) {
  dateStr = dateStr.replace(/-/g, '/')
  return new Date(dateStr)
}
```

---------------------------------------------
欢迎关注**无广告文章**公众号：**学前端**

![](https://mmbiz.qpic.cn/mmbiz_jpg/jpMAO8eFhorGjVHAfdgNsFQgo5TVO1qA5KwSy4xa6Pwocicn0M0XwMgmM6b2Zytqh5WHKMkcicRev3QQjonQ41BQ/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)


### 参考

- [格林尼治标准时间](https://zh.wikipedia.org/wiki/%E6%A0%BC%E6%9E%97%E5%B0%BC%E6%B2%BB%E6%A8%99%E6%BA%96%E6%99%82%E9%96%93 "格林尼治标准时间")
- [UTC 和 GMT 什么关系？](https://www.zhihu.com/question/27052407 "UTC 和 GMT 什么关系？")
- [UTC 和时区](https://blog.csdn.net/shenhuxi_yu/article/details/60570853 "UTC 和时区")
- [英国夏令时和冬令时是什么？](https://zhuanlan.zhihu.com/p/63842885 "英国夏令时和冬令时是什么？")
- [关于“时间”的一次探索](https://segmentfault.com/a/1190000004292140 "关于“时间”的一次探索")

