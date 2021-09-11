/* @flow */

import { baseOptions } from "./options";
import { createCompiler } from "compiler/index";
// 返回了一个对象，传入了baseOptions
const { compile, compileToFunctions } = createCompiler(baseOptions);

export { compile, compileToFunctions };
