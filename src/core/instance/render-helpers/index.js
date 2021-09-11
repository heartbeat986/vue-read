/* @flow */

import { toNumber, toString, looseEqual, looseIndexOf } from "shared/util";
import { createTextVNode, createEmptyVNode } from "core/vdom/vnode";
import { renderList } from "./render-list";
import { renderSlot } from "./render-slot";
import { resolveFilter } from "./resolve-filter";
import { checkKeyCodes } from "./check-keycodes";
import { bindObjectProps } from "./bind-object-props";
import { renderStatic, markOnce } from "./render-static";
import { bindObjectListeners } from "./bind-object-listeners";
import { resolveScopedSlots } from "./resolve-scoped-slots";
import { bindDynamicKeys, prependModifier } from "./bind-dynamic-keys";
// 简写与真实函数的对应
export function installRenderHelpers(target: any) {
  target._o = markOnce;
  target._n = toNumber;
  // 变字符串
  target._s = toString;
  // 渲染列表
  target._l = renderList;
  // 渲染slot
  target._t = renderSlot;
  target._q = looseEqual;
  target._i = looseIndexOf;
  target._m = renderStatic;
  target._f = resolveFilter;
  target._k = checkKeyCodes;
  target._b = bindObjectProps;
  // 创建一个文本节点
  target._v = createTextVNode;
  // 创建一个空节点
  target._e = createEmptyVNode;
  target._u = resolveScopedSlots;
  target._g = bindObjectListeners;
  target._d = bindDynamicKeys;
  target._p = prependModifier;
}
