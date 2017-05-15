# fie-toolkit-wangpumod


## 说明

这里对你的套件进行简单描述, 比如适用哪些场景,使用了什么技术, 有什么特点

## 用法

### 初始化

```
fie init wangpumod
```
### 开启本地服务器

```
fie start 
```
### 添加模块

```
fie add p xxx # 添加名为 xxx 的页面
fie add c yyy # 添加名为 xxx 组件
fie add data zzz # 添加名为 zzz 本地数据接口  
```
### 单元测试

```
fie test 
```
### 代码打包

```
fie build 
```

### 代码发布

```
fie publish d # 发布到日常
fie publish p # 发布到线上
```


## fie.config.js 配置

```
{
    toolkitName: "wangpumod",
    toolkitConfig: {
        port: 9000, //本地服务器端口号
        open: true,  //是否自动打开浏览器
        log: true,  //是否打印本地服务器访问日志
        openTarget: "src/index.html",   //打开浏览器后自动打开目标页面
        liveload: false //是否自动刷新
    }    
}
```



