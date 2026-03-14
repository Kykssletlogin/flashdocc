const https = require('https');
 
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
 
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Clé API non configurée.' }) };
  }
 
  try {
    const body = JSON.parse(event.body);
 
    const payload = JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      messages: body.messages,
    });
 
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(payload),
        },
      };
 
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body: data });
        });
      });
 
      req.on('error', (err) => reject(err));
      req.write(payload);
      req.end();
    });
 
    return {
      statusCode: result.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: result.body,
    };
 
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur serveur : ' + err.message }),
    };
  }
};
