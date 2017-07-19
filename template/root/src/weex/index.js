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
  },
  pic: {
    width: 750,
    height: 470
  }
};

class developingClassNameApp extends Component {

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

    this.pageUtils = props.pageUtils;

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

    this.pageUtils.goTargetUrl && this.pageUtils.goTargetUrl(params);
  }

  render() {
    let {showDataStatus, showNoDataStatus, h5Url, mds, gdc} = this.state;

    // 有数据
    if(showDataStatus){
      const isPreview = (gdc.preView == true || gdc.preView == 'true') ? true : false;
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
