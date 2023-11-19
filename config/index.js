const Confidence = require("confidence");
const dotenv = require('dotenv');
dotenv.config({ silent: true });

const criteria = {
  env: process.env.NODE_ENV,
};
const config = {
  $meta: "This file configures the Note taking application.",
  project_name: "note_taking_app",
  app: {
    routesDirectory: "routes",
    modelsDirectory: "models",
    dbURL: process.env.MONGO_SRV,
    jwtSecret:process.env.JWT_SECRET
  },
  email: {
    fromEmail: process.env.FROM_EMAIL,
    emailPassword: process.env.EMAIL_PASSWORD
  },
  aws: {
    accessKey: process.env.AWS_ACCESS_KEY,
    accessSecret: process.env.AWS_SECRET,
    region: process.env.AWS_REGION,
  },
  vonage: {
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET,
    fromNumber: process.env.FROM_NUMBER,
    toNumber: process.env.TO_NUMBER,

  },
};

const store = new Confidence.Store(config);

module.exports = config

