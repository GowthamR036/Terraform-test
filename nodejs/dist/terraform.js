"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Terraform = void 0;
const child_process_1 = require("child_process");
class Terraform {
    constructor(workingDir, targets, state, variables, parallelism, var_file, isEnvVarsIncluded, terraformBinPath) {
        this.workingDir = workingDir;
        this.state = state;
        this.targets = targets;
        this.variables = variables;
        this.parallelism = parallelism;
        this.var_file = var_file;
        this.isEnvVarsIncluded = isEnvVarsIncluded;
        this.terraformBinPath = terraformBinPath ? terraformBinPath : 'terraform';
    }
    init(backend, backendConfig, reconfigure) {
        let cmd = `${this.terraformBinPath} init -input=false`;
        cmd += backend ? ` -backend=${backend}` : '';
        cmd += backendConfig ? ` -backend-config=${backendConfig}` : '';
        cmd += reconfigure ? ` -reconfigure` : '';
        try {
            const output = (0, child_process_1.execSync)(cmd, { cwd: this.workingDir });
            console.log('Output:', output.toString());
        }
        catch (err) {
            console.error('Error:', err);
            return false;
        }
        return true;
    }
}
exports.Terraform = Terraform;
//# sourceMappingURL=terraform.js.map