const { Vonage } = require("@vonage/server-sdk");
const config = require('../config')

const vonage = new Vonage({
    apiKey: config.vonage.apiKey,
    apiSecret: config.vonage.apiSecret
});
const to = config.vonage.toNumber;
const from = config.vonage.fromNumber;

async function sendSMS(text) {
    await vonage.sms.send({ to, from, text })
        .then(resp => { console.log('Message sent successfully'); console.log(resp); })
        .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
}

module.exports = sendSMS;