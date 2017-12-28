#### 0. master分支，博客对外显示分支，内容是hexo g 构建后的内容（不可用于博客开发）
#### 1. git-pages分支，可用于博客开发
#### 2. 使用步骤

##### 克隆代码库
``` bash
git clone https://github.com/gauseen/gauseen.github.io.git
```

##### 安装依赖资源
``` bash
npm install
```

##### 清空 hexo 构建文件
``` bash
hexo clean
```

##### hexo 构建项目
``` bash
hexo g
```

##### 本地运行代码
``` bash
hexo s
```

##### 部署到 github
``` bash
hexo d
```

##### 我的博客地址：
[https://gauseen.github.io](https://gauseen.github.io/)