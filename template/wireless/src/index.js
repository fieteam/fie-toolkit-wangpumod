import {createElement, Component, PropTypes} from 'rax';
import View from 'rax-view';
import Text from 'rax-text';
import Picture from 'rax-picture';
import Touchable from 'rax-touchable';

import styles from './index.css';

class <{%= className %}>App extends Component {

  /**
   * 构建函数，处理传入的mds和gdc
   */
  constructor (props) {
    super(props);
    this.pageUtils = props.pageUtils;

    this.state = {
      showDataStatus: false,
      showNoDataStatus: true,
      mds: this.props.mds || {},
      gdc: this.props.gdc || {}
    };
  }

  /**
   * 获取数据
   */
  getData = (cb) => {
    const {mds, gdc} = this.state;
    fetch(mds.moduleData.asynData.url).then((data) => {
      if(data.status === 404) return;
      cb && cb(data);
    }).catch(()=>{

    })
  }

  /**
   * 根据获取的数据设置显示状态
   */
  updateShowData = () => {
    const {mds, gdc} = this.state;
    const md = mds.moduleData || {};
    this.setState({
      showDataStatus: md.h5Url && md.single_image_url,
      showNoDataStatus: (gdc.preView == true || gdc.preView == 'true') && (!md.h5Url || !md.single_image_url)
    });
  }

  componentWillMount () {
    if(this.state.mds.widgetId){ //同步构建，数据直接在标签上传入的时候
      this.getData(() => {
        this.updateShowData();
      });
    }
  }

  goTargetUrl = (url, nid) => {
    const {mds, gdc} = this.state;
    const params = {
      url: url,
      nid: nid || 0,
      widgetId: mds.widgetId,
      moduleName: mds.moduleName
    };

    this.pageUtils.goTargetUrl && this.pageUtils.goTargetUrl(params);
  }

  render() {
    const {showDataStatus, showNoDataStatus, mds, gdc} = this.state;

    //有数据
    if(showDataStatus){
      const isPreview = (gdc.preView == true || gdc.preView == 'true') ? true : false;
      const lazyload = isPreview ? false : true;
      return (
        <View style={styles.wrapper}>
          <Text style={styles.title}>{mds.moduleData.title}</Text>
          <Touchable onPress={()=>{this.goTargetUrl(mds.moduleData.h5Url, 0);}} data-role={mds.moduleName} data-spmc={mds.moduleName + '_' + mds.widgetId} data-spmd={mds.moduleName + '_' + mds.widgetId + '_0'}>
            <Picture style={styles.pic} source={{uri: mds.moduleData.single_image_url}} lazyload={lazyload} />
          </Touchable>
        </View>
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

export default <{%= className %}>App;
