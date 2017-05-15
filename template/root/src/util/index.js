'use strict';

import reqwest from 'reqwest';
import api from './apimap';

const noop = () => {
};

const tools = {
  /*
   * 调用改核心方法 统一接口处理
   * */
  fetchData(param, suc = noop, err = noop) {
    if (typeof param === 'string') {
      param = { api: param };
    }
    const arrApi = this._getApi(param.api);

    param.url = param.url || arrApi[0];
    param.method = param.method || arrApi[1];
    param.type = param.type || 'json';
    if (param.method === 'jsonp') {
      param.method = 'get';
      param.type = 'jsonp';
    }
    param.success = function (res = {}) {
      suc(res);
    };
    param.error = function (error) {
      err(error);
    };
    return reqwest(param);
  },
  getToken() {
    const $token = document.getElementsByName('_tb_token_');
    return $token.length ? $token[0].value : '';
  },
  isDaily() {
    const host = window.location.host;
    return host.indexOf('daily') > -1;
  },
  getUrlParam(name) {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
    const r = decodeURIComponent(window.location.search.substr(1)).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  },
  _getApi(type) {
    // Ajax.url not set
    if (!type) return ['', 'get'];

    let arr = api[type];
    if (!arr) {
      if (console && typeof console.warn === 'function') {
        console.warn('api:%s not found in apimap.js', type);
      }
      return ['', 'get'];
    } else if (typeof arr === 'string') {
      arr = [arr, 'get'];
    }
    //
    arr = arr.concat([]);

    const location = window.location;
    const hostname = location.hostname;

    // 本地 mock
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === 'local.place.daily.taobao.net') {
      // 使用本地代理
      if (location.href.indexOf('proxyurl') > -1) {
        arr = `/data/${type}.json?proxyUrl=http://place.daily.taobao.net${arr[0]}`;
      } else {
        arr = [`/data/${type}.json`];
      }
    } else if (!/^(http:\/\/|\/\/)/i.test(arr[0])) {
      const curPort = location.port && location.port !== 80 ? `:${location.port}` : '';
      arr[0] = `${location.protocol}//${hostname}${curPort}${arr[0]}`;
    }
    // 添加通用参数
    if (arr[0].indexOf('?') === -1) {
      arr[0] += '?';
    } else {
      arr[0] += '&';
    }
    arr[0] += `_tb_token_=${this.getToken()}`;
    arr[0] += '&_input_charset=utf-8';

    return arr;
  },
  extend(target, source) {
    target = target || {};
    source = source || {};
    for (const key in source) {
      target[key] = source[key];
    }
    return target;
  },
  namespace(name) {
    return function (v) {
      return `${name}-${v}`;
    };
  }
};

export const namespace = tools.namespace.bind(tools);
export const ajax = tools.fetchData.bind(tools);
export default tools;
