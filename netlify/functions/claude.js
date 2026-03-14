// ═══════════════════════════════════════════════════════
//  Flashdoc – Proxy Netlify vers l'API Anthropic Claude
//  La clé API est stockée dans les variables d'env Netlify
//  Elle n'est JAMAIS exposée dans le code front-end
// ═══════════════════════════════════════════════════════

exports.handler = async (event) => {

  // Autoriser uniquement les requêtes POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // Récupérer la clé API depuis les variables d'environnement Netlify
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Clé API non configurée. Ajoutez ANTHROPIC_API_KEY dans les variables d\'environnement Netlify.'
      }),
    };
  }

  try {
    // Parser le body de la requête envoyée par l'app
    const body = JSON.parse(event.body);

    // Appel à l'API Anthropic depuis le serveur (la clé est sécurisée ici)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      body.model      || 'claude-opus-4-5',
        max_tokens: body.max_tokens || 2048,
        messages:   body.messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: data.error?.message || 'Erreur API Anthropic' }),
      };
    }

    // Renvoyer la réponse au front-end
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // CORS : autoriser l'app à appeler cette fonction
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(data),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur serveur : ' + err.message }),
    };
  }
};
