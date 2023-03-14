import { Set } from 'typescript';
import { execSync } from 'child_process';
import { Context } from '@azure/functions';

interface KeyValuePair {
  [index: string]: string;
}

export class Terraform {
  context: Context;
  workingDir: string;
  terraformBinPath: string;
  targets: Set<string> | undefined;
  state: string | undefined;
  variables: KeyValuePair | undefined;
  var_file: string | undefined;
  isEnvVarsIncluded: boolean | undefined;
  parallelism: string | undefined;

  constructor(
    context: Context,
    workingDir: string,
    terraformBinPath?: string,
    var_file?: string,
    targets?: Set<string>,
    state?: string,
    variables?: KeyValuePair,
    parallelism?: string,
    isEnvVarsIncluded?: boolean
  ) {
    this.context = context;
    this.workingDir = workingDir;
    this.state = state;
    this.targets = targets;
    this.variables = variables;
    this.parallelism = parallelism;
    this.var_file = var_file;
    this.isEnvVarsIncluded = isEnvVarsIncluded;
    this.terraformBinPath = terraformBinPath ? terraformBinPath : 'terraform';
  }

  init(backend?: Boolean, backendConfig?: string, reconfigure?: Boolean) {
    let cmd: string = `${this.terraformBinPath} init -input=false`;
    cmd += backend ? ` -backend=${backend}` : '';
    cmd += backendConfig ? ` -backend-config=${backendConfig}` : '';
    cmd += reconfigure ? ` -reconfigure` : '';

    try {
      const output = execSync(cmd, { cwd: this.workingDir });
      this.context.log('Output:', output.toString());
    } catch (err) {
      this.context.log('Error:', err);
      return false;
    }

    return true;
  }

  plan(variables: KeyValuePair) {
    let cmd: string = `${this.terraformBinPath} plan -input=false`;
    cmd += this.var_file ? ` -var-file=${this.var_file}` : '';

    let planVariables = Object.entries(variables).reduce(
      (str, [key, value]) => (str += ` -var ${key}=${value}`),
      ''
    );
    cmd += planVariables;

    try {
      const output = execSync(cmd, { cwd: this.workingDir });
      this.context.log('Output:', output.toString());
    } catch (err) {
      this.context.log('Error:', err);
      return false;
    }

    return true;
  }

  apply(variables: KeyValuePair, autoApprove: boolean = true) {
    let cmd: string = `${this.terraformBinPath} apply -input=false`;
    cmd += this.var_file ? ` -var-file=${this.var_file}` : '';
    cmd += autoApprove ? ` -auto-approve` : '';

    let planVariables = Object.entries(variables).reduce(
      (str, [key, value]) => (str += ` -var ${key}=${value}`),
      ''
    );

    cmd += planVariables;

    try {
      const output = execSync(cmd, { cwd: this.workingDir });
      this.context.log('Output:', output.toString());
    } catch (err) {
      this.context.log('Error:', err);
      return false;
    }

    return true;
  }

  destroy(variables: KeyValuePair, autoApprove: boolean = true) {
    let cmd: string = `${this.terraformBinPath} destroy -input=false`;
    cmd += this.var_file ? ` -var-file=${this.var_file}` : '';
    cmd += autoApprove ? ` -auto-approve` : '';

    let planVariables = Object.entries(variables).reduce(
      (str, [key, value]) => (str += ` -var ${key}=${value}`),
      ''
    );

    cmd += planVariables;

    try {
      const output = execSync(cmd, { cwd: this.workingDir });
      this.context.log('Output:', output.toString());
    } catch (err) {
      this.context.log('Error:', err);
      return false;
    }

    return true;
  }
}
