/* @flow */

import config from "core/config";
import { warn, cached } from "core/util/index";
import { mark, measure } from "core/util/perf";

import Vue from "./runtime/index";
import { query } from "./util/index";
import { compileToFunctions } from "./compiler/index";
import {
  shouldDecodeNewlines,
  shouldDecodeNewlinesForHref,
} from "./util/compat";

// 从缓存中查找模板。
const idToTemplate = cached((id) => {
  const el = query(id);
  return el && el.innerHTML;
});

// 挂载方法，得到渲染函数
const mount = Vue.prototype.$mount;
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el);

  /* istanbul ignore if */
  // 如果是body和html就提出警告
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== "production" &&
      warn(
        `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
      );
    return this;
  }
  const options = this.$options;
  // resolve template/el and convert to render function
  // 如果没有渲染函数
  if (!options.render) {
    // 取模板
    let template = options.template;
    if (template) {
      if (typeof template === "string") {
        if (template.charAt(0) === "#") {
          // 通过id获取模板
          template = idToTemplate(template);
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== "production" && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            );
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML;
      } else {
        if (process.env.NODE_ENV !== "production") {
          warn("invalid template option:" + template, this);
        }
        return this;
      }
    } else if (el) {
      // 如果没有模板就自己包装一层
      template = getOuterHTML(el);
    }
    if (template) {
      /* istanbul ignore if */
      //  mark方法的作用：为性能优化的准备，记录执行的时间点
      if (process.env.NODE_ENV !== "production" && config.performance && mark) {
        mark("compile");
      }
      // 获取render、staticRenderFns函数
      const { render, staticRenderFns } = compileToFunctions(
        template,
        {
          outputSourceRange: process.env.NODE_ENV !== "production",
          shouldDecodeNewlines,
          shouldDecodeNewlinesForHref,
          delimiters: options.delimiters,
          comments: options.comments,
        },
        this
      );
      options.render = render;
      options.staticRenderFns = staticRenderFns;

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== "production" && config.performance && mark) {
        mark("compile end");
        //也是用来做时间标记的
        measure(`vue ${this._name} compile`, "compile", "compile end");
      }
    }
  }
  // 真正挂载节点的方法
  return mount.call(this, el, hydrating);
};

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
// 获取HTML字符串，包装一层
function getOuterHTML(el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML;
  } else {
    const container = document.createElement("div");
    container.appendChild(el.cloneNode(true));
    return container.innerHTML;
  }
}

Vue.compile = compileToFunctions;

export default Vue;
