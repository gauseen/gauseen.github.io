---
title: 从 Chrome 的开发者工具调试 Android 微信 Web 网页
date: 2018-12-08 18:28:10
tags: [js,debug,chrome,Android]
author: gauseen
---

#### 具体步骤：
0. 在手机微信内，打开网址 http://debugx5.qq.com
1. 信息`Tab`下 --> `TBS settings` -->　勾选【打开 `TBS` 内核 `Inspector` 调试功能】（根据自己需求选择其它）
2. 微信提示需要重启，点击重启
3. 完成上述步骤后，打开`Android`手机`USB`调试功能
4. 用 `USB` 数据线连接手机与电脑
5.  选择手机`USB`连接方式为：传输文件，等待驱动安装完毕
6. 用 `Chrome` 浏览器打开 [chrome://inspect/#devices](chrome://inspect/#devices)
7. 这样就可以在`Chrome`浏览器里，调试移动端微信内的`Web`页面了

#### 注： 该功能需要翻墙才可使用