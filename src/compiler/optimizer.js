/* @flow */

import { makeMap, isBuiltInTag, cached, no } from "shared/util";

let isStaticKey;
let isPlatformReservedTag;
// genStaticKeys = function (val) {return map[val]}
// cached: function(genStaticKeys){
//  判断是否有缓存，如果没有缓存则调用genStaticKeys,在缓存中保存key,同时返回genStaticKeys的结果
// }
//
//
//
const genStaticKeysCached = cached(genStaticKeys);

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */
export function optimize(root: ?ASTElement, options: CompilerOptions) {
  if (!root) return;
  // 返回了一个函数，作用是判断传入的值是不是存在。
  //options.staickeys:staticClass,staticStyle;
  isStaticKey = genStaticKeysCached(options.staticKeys || "");
  // 平台保留标签
  isPlatformReservedTag = options.isReservedTag || no;
  // first pass: mark all non-static nodes.
  markStatic(root);
  // second pass: mark static roots.
  markStaticRoots(root, false);
}

function genStaticKeys(keys: string): Function {
  return makeMap(
    "type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap" +
      (keys ? "," + keys : "")
  );
}

// 标记每个节点是否为静态节点
function markStatic(node: ASTNode) {
  node.static = isStatic(node);
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== "slot" &&
      node.attrsMap["inline-template"] == null
    ) {
      return;
    }
    // 标记子节点
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i];
      markStatic(child);
      // 如果子节点中有动态的，则根也为动态
      if (!child.static) {
        node.static = false;
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block;
        markStatic(block);
        // 如果条件节点中有动态的，则根也为动态
        if (!block.static) {
          node.static = false;
        }
      }
    }
  }
}

// 判断整个树是不是静态的
function markStaticRoots(node: ASTNode, isInFor: boolean) {
  if (node.type === 1) {
    if (node.static || node.once) {
      node.staticInFor = isInFor;
    }
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    // 当前根为静态，有子节点，子节点不只有一个文本节点的，则成为一个静态根节点
    if (
      node.static &&
      node.children.length &&
      !(node.children.length === 1 && node.children[0].type === 3)
    ) {
      node.staticRoot = true;
      return;
    } else {
      node.staticRoot = false;
    }
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for);
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        markStaticRoots(node.ifConditions[i].block, isInFor);
      }
    }
  }
}
// 判断是不是静态的节点
function isStatic(node: ASTNode): boolean {
  // 如果是表达式就不是静态
  if (node.type === 2) {
    // expression
    return false;
  }
  // 如果是纯文本表示是静态节点
  if (node.type === 3) {
    // text
    return true;
  }
  // TODO node.pre是什么意思
  // built-in const isBuiltInTag = function (val) {return map[val.toLowerCase()]},map={slot:true,component:true}
  // Object.keys(node).every(isStaticKey))：如果存在属性就返回true
  return !!(
    (
      node.pre ||
      (!node.hasBindings && // no dynamic bindings
        !node.if &&
        !node.for && // not v-if or v-for or v-else
        !isBuiltInTag(node.tag) && // not a built-in，是不是slot和component标签
        isPlatformReservedTag(node.tag) && // not a component
        !isDirectChildOfTemplateFor(node) && // 不是template中子节点
        Object.keys(node).every(isStaticKey))
    ) // 如果存在type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap等属性就返回true
  );
}
// 判断是否是template的子元素
function isDirectChildOfTemplateFor(node: ASTElement): boolean {
  while (node.parent) {
    node = node.parent;
    if (node.tag !== "template") {
      return false;
    }
    if (node.for) {
      return true;
    }
  }
  return false;
}
