import { REACT_APP_TWILIO_AUTH_TOKEN, REACT_APP_TWILIO_SECRET } from '@env'
const accountSid = 'AC72854ae284fd4cda74f8f25b6dc24919';
const authToken = '[AuthToken]';
const client = require('twilio')(accountSid, authToken);

client.verify.v2.services("VAcefe15d1348967cfc7b61e745fe63e69")
    .verifications
    .create({ to: '+14157475188', channel: 'sms' })
    .then(verification => console.log(verification.sid));

