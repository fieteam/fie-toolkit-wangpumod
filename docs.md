# 旺铺开发工具使用指南

### 安装

- 前提是必须安装了node.js
- 安装本工具的依赖fie, 命令：npm install fie -g --registry=https://registry.npm.taobao.org
- 检查是否安装成功：fie -v 详细安装说明：https://github.com/fieteam/fie
- 安装本工具：fie install toolkit-wangpumod

### 新建一个模块

- 本地创建一个文件夹，文件夹名称由三部分组成：**业务域+模块类型+模块名**
	- 例如： fliggy-wl-testMod、fliggy-pc-testMod
- **wl表示为无线模块，pc表示为PC模块**
- 当前支持的业务域
	- fliggy 飞猪
	- taobao 淘系
	- icbu ICBU
- 在文件夹根目录执行 fie init wangpumod
	- **不符合规则的文件夹无法执行init操作**
- 执行 `fie start` 开始开发，可以看到该模块可以跑起来

### 注意点

- 模块编写采用的是es6，可以学习下js的es6: http://es6.ruanyifeng.com/
- 模块的样式编写是采用的flex-box布局：可以学习下flexbox布局：http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html?utm_source=tuicool
- 如果模块有访问淘系的接口，先配置一个host,如：127.0.0.1 local.m.taobao.com
- 执行 fie start 之后，将浏览器打开的模块的地址由localhost，改成 local.m.taobao.com，这样本地可以访问接口；
- 目前模块能允许使用的rax标签有：View, Picture, Touchable, Text, ScrollView，其他后续开放;
- 因为最后的代码是通过复制到阿里这边的一个设计师后台，所以每个模块的样式文件不要单独出来，在模块的js代码中，这样定义：

```javascript
import {createElement, Component, PropTypes} from 'rax';
import View from 'rax-view';
import Picture from 'rax-picture';
import Touchable from 'rax-touchable';

const styles = {
  wrapper: {
    width: 750,
    backgroundColor: '#ffffff'
  },
  defaultImage: {
    width: 750,
    height: 400
  }
  pic: {
    width: 750,
    height: 470
  }
};

/* 其他代码 */
```

### 示例模块代码讲解

```javascript
// 以下4行代码是引入rax和可用的rax组件
import {createElement, Component, PropTypes} from 'rax';
import View from 'rax-view';
import Picture from 'rax-picture';
import Touchable from 'rax-touchable';

// 这一行是定义模块上的各种样式
const styles = {
  wrapper: {
    width: 750,
    backgroundColor: '#ffffff'
  },
  defaultImage: {
    width: 750,
    height: 400
  }
  pic: {
    width: 750,
    height: 470
  }
};

// 定义一个模块的class
class developingClassNameApp extends Component {

  // 这里的state是定义该模块下需要用到的状态变量，可以先了解下react的state
  state = {
    showDataStatus: false,    //有数据
    showNoDataStatus: false,  //无数据（商家装修的时候无数据需要展示默认图，消费者访问的时候不展示任何东西）
    h5Url: '',
    mtopDone: false
  };

  /**
   * 构建函数，处理传入的mds和gdc
   */
  constructor (props) {
    super(props);

    //从页面上获取各种可以用的工具，如 Mtop, Windvane, goTargetUrl
    this.pageUtils = props.pageUtils;

    // 模块被初始化后从模块属性中获取模块要用到的数据和全局数据
    this.state = {
      mds: this.props.mds || {},
      gdc: this.props.gdc || {}
    };
  }

  /**
   * 获取数据，这个函数会发起MTOP请求，从接口获取数据
   */
  getData = (cb) => {
    let {mds, gdc} = this.state;

    this.pageUtils.Mtop.request({
      api: 'mtop.taobao.shop.ugo.geth5url',
      v: '1.0',
      data: {
        'sellerId': gdc.userId
      },
      ecode: 0,   // 必须
      type: 'GET',
      timeout: 3000 // 非必须。接口超时设置，默认为20000ms
    }, (ret) => {
      let msg = (ret && ret.ret ? ret.ret[0] : '').split('::');
      let h5Url = '';

      if(msg[0] === 'SUCCESS'){
        let data = ret.data || {};
        h5Url = (data.hasUgo == 'true' || data.hasUgo == true) ? (data.url || '') : '';
      }

      this.setState({
        h5Url: h5Url,
        mtopDone: true
      });
      cb && cb();
    }, (err) => {
      this.setState({
        h5Url: '',
        mtopDone: true
      });
      cb && cb();
    });
  }

  /**
   * 根据获取的数据设置显示状态，里面的mds和gdc可用在data目录下weex-mock.json中定义和修改
   */
  updateShowData = () => {
    let {mds, gdc, mtopDone, h5Url} = this.state;
    let md = mds.moduleData || {};
    this.setState({
      showDataStatus: mtopDone && h5Url && md.single_image_url,
      showNoDataStatus: (gdc.preView == true || gdc.preView == 'true') && mtopDone && (!h5Url || !md.single_image_url)
    });
  }

  /**
   * 模块渲染完成后立刻执行的函数，这里是通用的，如果没有接口请求，直接调用this.updateShowData();即可
   */
  componentDidMount () {
    if(this.state.mds.widgetId){ //同步构建，数据直接在标签上传入的时候
      this.getData(() => {
        this.updateShowData();
      });
    }
  }

  /**
   * 定义模块中链接处理函数，这里除了URL，其他的埋点参数在这里定义和传入
   */
  goTargetUrl = (url, nid) => {
    let {mds, gdc} = this.state;
    let params = {
      url: url,
      nid: nid || 0,
      widgetId: mds.widgetId,
      moduleName: mds.moduleName
    };

    this.pageUtils.goTargetUrl && this.pageUtils.goTargetUrl(params);
  }

  /**
   * 渲染模块函数
   * 1、在showDataStatus=true的时候的根标签下需要定义标签的属性：data-role={mds.moduleName} data-spmc={mds.moduleName + 下划线 + mds.widgetId}
   * 2、在Touchable标签上需要定义一个属性：data-spmd={mds.moduleName + 下划线 + mds.widgetId + 模块内的链接索引}
   * 3、在showNoDataStatus=true的时候一定要定义有默认图输出，否则装修端无数据的时候将看不到
   */
  render() {
    let {showDataStatus, showNoDataStatus, h5Url, mds, gdc} = this.state;

    let moduleContainerStyle = styles.wrapper;
    moduleContainerStyle.marginBottom = gdc.spaceInBetween || 8;

    // 有数据
    if(showDataStatus){
      //是否装修端预览态
      const isPreview = (gdc.preView == true || gdc.preView == 'true') ? true : false;
      //根据是否预览态确定图片是否要懒加载
      const lazyload = isPreview ? false : true;
      return (
        <Touchable style={styles.wrapper} onPress={()=>{this.goTargetUrl(h5Url, 0);}} data-role={mds.moduleName} data-spmc={mds.moduleName + '_' + mds.widgetId} data-spmd={mds.moduleName + '_' + mds.widgetId + '_0'}>
          <Picture style={styles.pic} source={{uri: mds.moduleData.single_image_url}} lazyload={lazyload} />
        </Touchable>
      );
    }
    // 预览态无数据
    else if(showNoDataStatus) {
      return (
        <Picture
          style={{...styles.defaultImage, width: mds.defaultImageWidth || 750, height: mds.defaultImageHeight || 400}}
          source={{uri: mds.defaultImage}} lazyload={false} />
      );
    }
    return null;

  }
}

export default developingClassNameApp;
```
