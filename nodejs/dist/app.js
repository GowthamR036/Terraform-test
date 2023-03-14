"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const terraform_1 = require("./terraform");
const tf = new terraform_1.Terraform('../node/resource_group');
const initOuput = tf.init();
console.log(initOuput);
//# sourceMappingURL=app.js.map