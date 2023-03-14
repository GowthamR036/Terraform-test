import { Set } from 'typescript';
import { execSync } from 'child_process';

interface KeyValuePair {
  [index: string]: string;
}

class TerraformCommand {
  options: [string, string, boolean][];
  variables: [string, string][];
  command: string;
  terraformBinPath: string;

  constructor(command: string, terraformBinPath?: string) {
    this.command = command;
    this.terraformBinPath = terraformBinPath || 'terraform';
    this.variables = [];
    this.options = [];
  }

  addOption({
    option,
    value,
    isFlagged,
  }: {
    option: string;
    value?: string;
    isFlagged?: boolean;
  }) {
    const optionArr: any = [option, value, isFlagged || false];
    this.options.push(optionArr);
  }

  addVariable(varName: string, value: string) {
    this.variables.push([varName, value]);
  }

  build() {
    let cmd = `${this.terraformBinPath} ${this.command} `;

    this.options.forEach(([option, value, isFlagged]) => {
      if (isFlagged) {
        cmd += ` -${option}`;
      }
      cmd += ` -${option}=${value}`;
    });

    this.variables.forEach(([option, value]) => {
      cmd += ` -var ${option}=${value}`;
    });
    console.log('command is ', cmd);

    return cmd;
  }
}

export class Terraform {
  workingDir: string;
  terraformBinPath: string;
  targets: Set<string> | undefined;
  state: string | undefined;
  variables: KeyValuePair | undefined;
  var_file: string | undefined;
  isEnvVarsIncluded: boolean | undefined;
  parallelism: string | undefined;

  constructor(
    workingDir: string,
    terraformBinPath?: string,
    var_file?: string,
    targets?: Set<string>,
    state?: string,
    variables?: KeyValuePair,
    parallelism?: string,
    isEnvVarsIncluded?: boolean
  ) {
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
      console.log('Output:', output.toString());
    } catch (err) {
      console.error('Error:', err);
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
      console.log('Output:', output.toString());
    } catch (err) {
      console.error('Error:', err);
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
      console.log('Output:', output.toString());
    } catch (err) {
      console.error('Error:', err);
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
      console.log('Output:', output.toString());
    } catch (err) {
      console.error('Error:', err);
      return false;
    }

    return true;
  }
}
