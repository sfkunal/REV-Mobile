import { REACT_APP_TWILIO_SERVICE_SID } from "@env";

// sends the code to the user\
export const sendCode = async (phoneNumber: string): Promise<boolean> => {
    try {
        const response = await fetch('https://verify-1163-soa6ej.twil.io/start-verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: '+12064711231', // The phone number to verify. Currently my phone number, but hardcoded
                channel: 'sms',
            }),
        });
        // console.log('response', response)
        // console.log(response)
        console.log(response);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        } else if (response.headers.get("content-type")?.includes("application/json") !== true) {
            throw new Error("Received non-JSON response");
        }

        const data = await response.json();
        console.log('SEND CODE DATA', data);
        console.log('response', response);
        // response.json().then(data => console.log(data)); // json formats the data
        return response.ok // returns that the message was delivered okay
    } catch (err) {
        console.log(err)
        return false; // not delivered okay
    }
}



//     fetch('https://your-twilio-function-url/send-verification-code', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             to: phoneNumber, // The phone number to verify
//         }),
//     });
//         .then((response) => response.json())
//     .then((data) => console.log(data))
//     .catch((error) => console.error('Error:', error));
// }


// verifies the code that was sent
// export const verifyCode = async (phoneNumber: string, code: string): Promise<boolean> => {
//     fetch('https://your-twilio-function-url/check-verification-code', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             to: phoneNumber, // The phone number to verify
//             code: code, // The code entered by the user
//         }),
//     })
//         .then((response) => response.json())
//         .then((data) => console.log(data))
//         .catch((error) => console.error('Error:', error));
// }

export const verifyCode = async (phoneNumber: string, code: string): Promise<boolean> => {
    try {

        const response = await fetch('https://verify-1163-soa6ej.twil.io/check-verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: phoneNumber, // The phone number to verify
                code: code, // The code entered by the user
            }),
        })

        const data = await response.json();
        console.log('VERIFY CODE DATA', data);
        return data.status === 'approved'; // basically if twilio sends back that they match send true
    } catch (e) {
        return false; // some other error
    }
}