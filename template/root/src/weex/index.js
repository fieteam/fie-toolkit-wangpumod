import {createElement, Component, PropTypes} from 'rax';
import View from 'rax-view';
import Image from 'rax-image';
import Link from 'rax-link';

import styles from './index.css';

class developingClassNameApp extends Component {
  static contextTypes = {
    goTargetUrl: PropTypes.func,
    Mtop: PropTypes.object,
    User: PropTypes.object,
    Windvane: PropTypes.object
  };

  state = {
    showDataStatus: false,
    showNoDataStatus: false,
    h5Url: '',
    mtopDone: false
  };

  /**
   * 构建函数，处理传入的mds和gdc
   */
  constructor (props) {
    super(props);

    this.state = {
      mds: this.props.mds || {},
      gdc: this.props.gdc || {}
    };
  }

  /**
   * 获取数据
   */
  getData = (cb) => {
    let {mds, gdc} = this.state;

    this.context.Mtop.request({
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
        mtopDone: true
      });
      cb && cb();
    });
  }

  /**
   * 根据获取的数据设置显示状态
   */
  updateShowData = () => {
    let {mds, gdc, mtopDone, h5Url} = this.state;
    let md = mds.moduleData || {};
    this.setState({
      showDataStatus: mtopDone && h5Url && md.single_image_url,
      showNoDataStatus: (gdc.preView == true || gdc.preView == 'true') && mtopDone && (!h5Url || !md.single_image_url)
    });
  }

  componentDidMount () {
    if(this.state.mds.widgetId){ //同步构建，数据直接在标签上传入的时候
      this.getData(() => {
        this.updateShowData();
      });
    }
  }

  goTargetUrl = (url, nid) => {
    let {mds, gdc} = this.state;
    let params = {
      url: url,
      nid: nid || 0,
      widgetId: mds.widgetId,
      moduleName: mds.moduleName
    };

    this.context.goTargetUrl && this.context.goTargetUrl(params);
  }

  render() {
    let {showDataStatus, showNoDataStatus, h5Url, mds, gdc} = this.state;

    let moduleContainerStyle = styles.wrapper;
    moduleContainerStyle.marginBottom = gdc.spaceInBetween || 8;

    // 有数据
    if(showDataStatus){
      return (
        <Link style={moduleContainerStyle} href={h5Url} onPress={()=>{this.goTargetUrl(h5Url, 0);}}>
          <Image style={styles.pic} source={{uri: mds.moduleData.single_image_url}} />
        </Link>
      );
    }
    // 预览态无数据
    else if(showNoDataStatus) {
      return (
        <View style={moduleContainerStyle}>
          <Image style={styles.defaultImage} source={{uri: mds.defaultImage}} />
        </View>
      );
    }
    return null;

  }
}

export default developingClassNameApp;
