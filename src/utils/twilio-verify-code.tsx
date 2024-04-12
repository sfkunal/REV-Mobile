


fetch('https://your-twilio-function-url/send-verification-code', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        to: '+1234567890', // The phone number to verify
    }),
})
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error('Error:', error));