/**
 * PC店铺模块
 */
'use strict';

//work on IE8
//require('es5-shim');
//require('es5-shim/es5-sham');
//require('console-polyfill');
//require('es6-promise');
//require('fetch-ie8');

/**
 * CANNOT use `import` to import `react`,
 * because `import` will run `react` before `require('es5-shim')`.
 */
//const classNames = require('classnames/bind');
//const React = require('react');
//const ReactDOM = require('react-dom');

/**
 * your component code
 */
const style = require('./index.scss');

const cx = classNames.bind(style);

//如果`developingClassName`被修改成别的，请将下面的`developingClassName`也对应修改
class developingClassName extends React.Component {
  state = {};

  static propTypes = {
    moduleData: React.PropTypes.object.isRequired
  };

  constructor() {
    super();
  }

  componentWillMount() {
    var moduleData = this.props.moduleData;
    //如果是从API上取数据
    if(moduleData.type == 'api'){
      var url = moduleData.data.asynData.url;
      var param = moduleData.data.asynData.param;
      if(param){ //构造url参数
        var tmp = [];
        for(var i in param){
          tmp.push(i+'='+encodeURIComponent(param[i]));
        }
        url += '?' + tmp.join('&');
      }
      fetch(url)
        .then((res) => res.json())
        .then((res) => {
          console.log(res);
          this.setState(res);
        });
    }
  }

  render() {
    return (
      <div className={cx('title', 'big-title')}>{JSON.stringify(this.state)} </div>
    );
  }
};


/*
 * 如下部分不要修改，（除非你前面的`developingClassName`被修改了，那就修改下面的`developingClassName`为你的最终值）否则模块加载不出来！
 */
window.ShopRender.developingClassName = function(container, data){
  var moduleData = JSON.parse(data);
  ReactDOM.render(
    <class-name moduleData={moduleData} />, container
  );
};
