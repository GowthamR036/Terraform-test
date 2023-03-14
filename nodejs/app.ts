import { Terraform } from './terraform';

const tf = new Terraform('../node/resource_group');

const initOuput = tf.init();
console.log(initOuput);
