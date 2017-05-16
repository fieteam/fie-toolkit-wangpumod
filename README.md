# fie-toolkit-wangpumod


## 说明

旺铺模块开发套件，面向外部开发者的旺铺开发工具

## 用法

### 初始化

```
fie init wangpumod
```
### 开启本地服务器

```
fie start
```

### 代码打包

```
fie build
```

### 代码发布

暂未实现


## fie.config.js 配置

```
{
    toolkitName: "wangpumod",
    toolkitConfig: {
        port: 9000, //本地服务器端口号
        open: true,  //是否自动打开浏览器
        log: true,  //是否打印本地服务器访问日志
        openTarget: "index.html",   //打开浏览器后自动打开目标页面
        liveload: false //是否自动刷新
    }    
}
```
