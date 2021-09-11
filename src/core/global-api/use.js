/* @flow */

import { toArray } from "../util/index";

export function initUse(Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    const installedPlugins =
      this._installedPlugins || (this._installedPlugins = []);
    // 判断是否存在，如果存在直接返回,防止重复加载
    if (installedPlugins.indexOf(plugin) > -1) {
      return this;
    }

    // additional parameters
    // 取出Vue对象的构造函数，并将其传入plugin.install方法，或者plugin方法
    const args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === "function") {
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === "function") {
      plugin.apply(null, args);
    }
    // 添加插件
    installedPlugins.push(plugin);
    return this;
  };
}
