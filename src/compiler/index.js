/* @flow */

import { parse } from "./parser/index";
import { optimize } from "./optimizer";
import { generate } from "./codegen/index";
import { createCompilerCreator } from "./create-compiler";

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
export const createCompiler = createCompilerCreator(function baseCompile(
  template: string,
  options: CompilerOptions
): CompiledResult {
  // 将html模板解析成ast，最后生成的是一棵AST树
  const ast = parse(template.trim(), options);
  if (options.optimize !== false) {
    // 优化ast
    // 标记静态节点
    optimize(ast, options);
  }
  // {
  //   render: `with(this){return ${code}}`,
  //   staticRenderFns: state.staticRenderFns
  // }
  debugger;
  const code = generate(ast, options);
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns,
  };
});
