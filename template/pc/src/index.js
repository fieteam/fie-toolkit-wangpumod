/**
 * PC店铺模块
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from '@alife/next';
import IntlModuleLib from '@alife/intl-module-lib';
import './index.scss';

// `<{%= className %}>` class类名初始化生成，不允许修改
class <{%= className %}> extends React.Component {

  static propTypes = {
  };

  constructor(props) {
    super(props);
    this.state = {
      hasData: false
    }
  }

  componentWillMount() {
    const moduleData = this.props.moduleData;
    const mds = moduleData.mds;
    //如果是从API上取数据
    if(mds.moduleData.asynData){
      let url = mds.moduleData.asynData.url;
      let param = mds.moduleData.asynData.param;
      if(param){ //构造url参数
        let tmp = [];
        for(let i in param){
          tmp.push(i+'='+encodeURIComponent(param[i]));
        }
        url += '?' + tmp.join('&');
      }
      fetch(url)
        .then((res) => res.json())
        .then((res) => {
          console.log(res);
          res.hasData = true;
          res.moduleTitle = '<{%= fileName %}>';
          this.setState(res);
        });
    }
  }

  render() {
    const {hasData, moduleTitle} = this.state;
    const {mds} = this.props.moduleData;
    return (
      <div className={'<{%= fileName %}>'}>
        <div className={'big-title'}>模块：{moduleTitle}</div>
        <div className={'title'}>{mds.moduleName}</div>
        <div className={'title'}> {JSON.stringify(this.state)} <Button>Submit</Button></div>
      </div>
    );
  }
};

export default <{%= className %}>;
