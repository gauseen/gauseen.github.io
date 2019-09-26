---
title: 用 git 钩子，检测代码规范性（eslint、standard）
date: 2018-03-13 13:54:07
tags: [git,github,eslint,standard]
author: gauseen
---
**最终实现效果说明：**
用 git commit 提交代码之前，利用 [pre-commit git 钩子](https://git-scm.com/book/zh/v2/%E8%87%AA%E5%AE%9A%E4%B9%89-Git-Git-%E9%92%A9%E5%AD%90)，实现代码规范检测（eslint、standard 规范），符合规范之后才可以提交到 git 仓库。这样在团队合作开发时，可以统一代码风格，如果某些同志代码不符合规范，是无法进行提交代码的。

**我的demo地址：**
[demo地址](https://github.com/gauseen/pre-commit)

**规范doc：**
[standard规范](https://github.com/standard/standard/blob/master/docs/README-zhcn.md)
[eslint规范](https://github.com/eslint/eslint)

**git 钩子**
[git 钩子](https://github.com/typicode/husky)

#####**那么问题来了，这种验证是如何实现的呢？！**

请确保已经安装了： node | npm | git
安装传送门：[node](http://www.runoob.com/nodejs/nodejs-install-setup.html) | [npm](http://www.runoob.com/nodejs/nodejs-npm.html) | [git](https://git-scm.com/book/zh/v1/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git)

先说一下我的目录结构：
```
               |——node_modules            # 项目资源依赖（npm install 之后出现改文件夹）
               |
pre-commit ——— |——src —— test.js          # 项目代码（项目业务逻辑）
               |
               |——package.json            # 本地安装 npm 包 （npm init 之后出现该文件）
```

####**一、步骤如下（下面是 standard 规范验证）：**
 - 先按照鄙人的目录先创建目录，然后先后执行如下命令：
 ```
    git init                                    // 将本地项目设置为 git 项目
    git remote add origin url                   // url 为自己的 git 仓库地址
    npm init                                    // 将 pre-commit 项目设置为 npm 项目
    npm install --save-dev standard             // 安装 standard 规范
    npm install --save-dev husky@next           // 安装 husky git 钩子
    npm install --save-dev snazzy               // 安装 snazzy ，美化 standard 报错提示，eslint 规范不需要安装
 ```
 - 安装好依赖资源后，更改 package.json 文件
 ```
 // package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "standard \"src/**/*.{js,vue,wpy}\" | snazzy",
    }
  }
}
注：检测 src 目录下的所有文件后缀为 .js || .vue || .wpy 的文件编码，是否符合规范。
若不符合，git 钩子将会阻止 git 继续 commit, 并且会报出错误信息；
若符合代码规范，git commit 就会成功提交到本地仓库。
```
 **当然你可以绕过代码检测强制提交:**
```
git add . && git commit --no-verify -m "代码规范强制提交测试"
 ```

 **standard 规范错误提示如下：**
```
// standard 规范默认错误提示：
D:\pre-commit\src\test.js:2:19: Extra semicolon.
------------------------------------------------
// 利用 snazzy 美化后的错误提示：
2:19  error  Extra semicolon
✖ 1 problem
```

####**二、步骤如下（下面是 eslint 规范验证）：**
 - 先按照鄙人的目录先创建目录，然后先后执行如下命令：
 ```
    git init                                    // 将本地项目设置为 git 项目
    git remote add origin url                   // url 为自己的 git 仓库地址
    npm init                                    // 将 pre-commit 项目设置为 npm 项目
    npm install --save-dev eslint               // 安装 eslint 规范
    npm install --save-dev husky@next           // 安装 husky git 钩子

    注意，执行命令：
    $ ./node_modules/.bin/eslint --init         // 生成 .eslintrc.js 文件，可自定义代码风格
 ```
    注：eslint 自定义代码规范详情 [传送门](https://segmentfault.com/a/1190000011451121)；.eslintrc.js配置详解[传送门](https://juejin.im/entry/59a43c86f265da246c4a28c0)


 - 安装好依赖资源后，更改 package.json 文件
 ```
 // package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "eslint \"src/**/*.{js,vue,wpy}\"",
    }
  }
}
```
 **当然你可以绕过代码检测强制提交:**
```
git add . && git commit --no-verify -m "代码规范强制提交测试"

```
 **eslint 规范错误提示如下：**
```
// eslint 规范错误提示

D:\fe\pre-commit\src\test.js
  1:13  error  Strings must use doublequote                     quotes
  1:28  error  Expected linebreaks to be 'LF' but found 'CRLF'  linebreak-style
  1:28  error  Missing semicolon                                semi
  2:1   error  Unexpected console statement                     no-console
  2:20  error  Expected linebreaks to be 'LF' but found 'CRLF'  linebreak-style

✖ 5 problems (5 errors, 0 warnings)
✖ 1 problem
```

按照相应的错提示，更改代码，符合规范后，即可提交到 git 仓库。

声明：有任何问题欢迎留言！未经作者同意禁止转载！谢谢！


欢迎关注**无广告文章**公众号：**学前端**

![](https://raw.githubusercontent.com/gauseen/images-bed/master/learn-fe.jpg)



  [1]: https://github.com/gauseen
