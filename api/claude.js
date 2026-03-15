// api/claude.js - Route API Vercel pour appeler Claude
export default async function handler(req, res) {
  // Activer CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Gérer la pré-requête OPTIONS (CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Vérifier que c'est bien une requête POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Récupérer la clé API depuis les variables d'environnement Vercel
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    
    if (!ANTHROPIC_API_KEY) {
      console.error('Clé API Anthropic manquante dans les variables d\'environnement');
      return res.status(500).json({ error: 'Configuration serveur incomplète' });
    }

    const { model, max_tokens, messages } = req.body;

    // Appeler l'API Anthropic
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-3-sonnet-20241022',
        max_tokens: max_tokens || 2048,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erreur Anthropic:', data);
      return res.status(response.status).json({ error: data.error?.message || 'Erreur API Anthropic' });
    }

    // Renvoyer la réponse au client
    return res.status(200).json(data);

  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ error: error.message || 'Erreur interne du serveur' });
  }
}
