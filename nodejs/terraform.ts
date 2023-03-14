import { Set } from 'typescript';
import { execSync } from 'child_process';

interface KeyValuePair {
  [index: string]: string;
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
    targets?: Set<string>,
    state?: string,
    variables?: KeyValuePair,
    parallelism?: string,
    var_file?: string,
    isEnvVarsIncluded?: boolean,
    terraformBinPath?: string
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
}
