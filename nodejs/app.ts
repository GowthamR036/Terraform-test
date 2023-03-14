import { Terraform } from './terraform';
import express from 'express';

const app = express();

const tf = new Terraform('../node/resource_group');

type ResourceGroup = {
  name: string;
  location: string;
};

app.use(express.json());

app.use('/resource_group', (req, res, next) => {
  const clientId = req.query.client_id;
  const clientSecret = req.query.client_secret;
  const subscriptionId = req.query.subscription_id;
  const tenantId = req.query.tenant_id;

  if (!(clientId && clientSecret && subscriptionId && tenantId)) {
    return res.status(405).send('Query params missing.');
  }

  process.env['ARM_CLIENT_ID'] = clientId;
  process.env['ARM_CLIENT_SECRET'] = clientSecret;
  process.env['ARM_SUBSCRIPTION_ID'] = subscriptionId;
  process.env['ARM_TENANT_ID'] = tenantId;

  const rg: ResourceGroup = req.body as ResourceGroup;
  console.log(!(rg.name && rg.location));
  if (!(rg.name && rg.location)) {
    return res.status(405).send('Request body is missing.');
  }

  req.rg = rg;
  next();
});

app.use('/resource_group', (req, res, next) => {
  const initOutput = tf.init();

  if (!initOutput) {
    return res.status(500).send('Init failed');
  }

  next();
});

app.post('/resource_group', (req, res) => {
  const planOutput = tf.plan(req.rg);
  if (!planOutput) {
    return res.status(500).send('Plan failed');
  }
  const applyOutput = tf.apply(req.rg);
  if (!applyOutput) {
    return res.status(500).send('Apply failed');
  }

  res.status(200).send('Resource created successfuly.');
});

app.delete('/resource_group', (req, res) => {
  const destroyOutput = tf.destroy(req.rg);
  if (!destroyOutput) {
    return res.status(500).send('Destroy failed');
  }

  res.status(200).send('Resource destroyed successfuly.');
});

const PORT = 8080;
app.listen(PORT, () =>
  console.log(
    `Server started at port ${PORT}. http://localhost:${PORT}/resource_group`
  )
);
