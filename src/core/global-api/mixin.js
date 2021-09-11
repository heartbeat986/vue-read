/* @flow */

import { mergeOptions } from "../util/index";

export function initMixin(Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    // 将当前的配置和存入的配置合并
    this.options = mergeOptions(this.options, mixin);
    return this;
  };
}
