const AT_BASE_URL = 'https://api.sandbox.africastalking.com/version1/messaging';

async function sendSms(to, message) {
  const params = new URLSearchParams();
  params.append('username', 'sandbox');
  params.append('to', Array.isArray(to) ? to.join(',') : to);
  params.append('message', message);

  const response = await fetch(AT_BASE_URL, {
    method: 'POST',
    headers: {
      apiKey: process.env.SMS_API,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: params,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Africa's Talking API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

module.exports = { sendSms };