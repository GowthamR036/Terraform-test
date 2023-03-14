import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Terraform } from '../dependencies/terraform';
const path = require('path');

type ResourceGroup = {
  name: string;
  location: string;
};

const response = (context, message, status) => {
  context.res = { message, status };
  return;
};

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const absPathToTf = path.resolve('./dependencies/terraform');
    const tf = new Terraform(context, '/tfcode', absPathToTf);

    const clientId = req.query.client_id;
    const clientSecret = req.query.client_secret;
    const subscriptionId = req.query.subscription_id;
    const tenantId = req.query.tenant_id;

    if (!(clientId && clientSecret && subscriptionId && tenantId)) {
      // return res.status(405).send('Query params missing.');
      return response(context, 'Query params missing.', 405);
    }

    process.env['ARM_CLIENT_ID'] = clientId;
    process.env['ARM_CLIENT_SECRET'] = clientSecret;
    process.env['ARM_SUBSCRIPTION_ID'] = subscriptionId;
    process.env['ARM_TENANT_ID'] = tenantId;

    const rg: ResourceGroup = req.body as ResourceGroup;
    if (!(req.body && rg.name && rg.location)) {
      return response(context, 'Request body is missing.', 405);
    }

    // init
    const initOutput = tf.init();

    if (!initOutput) {
      return response(context, 'Init failed.', 405);
    }
    context.log(req.method);
    if (req.method === 'POST') {
      const planOutput = tf.plan(rg);
      if (!planOutput) {
        return response(context, 'Plan failed.', 500);
      }
      const applyOutput = tf.apply(rg);
      if (!applyOutput) {
        return response(context, 'Apply failed.', 500);
      }

      return response(context, 'Resource created successfully.', 200);
    } else if (req.method === 'DELETE') {
      const destroyOutput = tf.destroy(rg);
      if (!destroyOutput) {
        return response(context, 'Destroy failed.', 500);
      }

      return response(context, 'Resource destroyed successfully.', 200);
    }

    return response(context, 'Method not available.', 405);
  } catch (err) {
    context.log(err);
  }
};

export default httpTrigger;
