const {execSync} = require('child_process');
const process = require("process");

import {Terraform} from './terraform';

const repoUrl = 'https://gitlab.com/rahulma/infra-poc-repo.git';
const REPO_PATH = '/tmp/infra-poc-repo';
const tf = new Terraform(REPO_PATH);


const cloneRepo = () => {
    process.stdout.write(execSync(`git clone ${repoUrl} ${REPO_PATH}`).toString())
};


const tfInAction = () => {
    const initOutput = tf.init();
    if (!initOutput) {
        console.log("Init Failed")
    }

    // const planOutput = tf.plan({});
    // if (!planOutput) {
    //     console.log('Plan failed');
    // }

    const applyOutput = tf.apply({});
    if (!applyOutput) {
        console.log('Apply failed');
    }

    console.log('Resource created successfuly.');
}


module.exports = async function (context, req) {
    context.log('Starting request');

    const action = req.body.action;
    if (action === "provision") {
        context.log('Starting cloning');
        cloneRepo();
        context.log('cloning done');
        tfInAction();

        context.res = {
            body: "Infra provisioned successfully"
        }
    } else if (action === "status") {
        context.res = {
            body: "everything is up and running"
        }
    } else {
        const responseMessage = "Kindly specify correct action"
        context.res = {
            body: responseMessage
        };

    }
}

/*

    /provision
    /status
    /update


*/