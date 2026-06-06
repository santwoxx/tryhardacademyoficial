import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Allow CORS requests from the Vercel frontend
app.use(cors({
  origin: '*', // In production, we can lock this to the Vercel deployment URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Initialize GoogleGenAI SDK securely on the backend
let ai = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('GoogleGenAI SDK initialized successfully on backend.');
  } catch (error) {
    console.error('Failed to initialize GoogleGenAI SDK:', error);
  }
} else {
  console.warn('GEMINI_API_KEY is not defined in the environment variables.');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    aiInitialized: !!ai
  });
});

// Secure endpoint to interact with Gemini AI, hiding API keys from the frontend client
app.post('/api/gemini', async (req, res) => {
  if (!ai) {
    return res.status(500).json({ error: 'Gemini AI client is not initialized on the backend. Please check GEMINI_API_KEY.' });
  }

  const { prompt, model = 'gemini-2.5-flash' } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    // Generate content using Google GenAI SDK
    const response = await ai.models.generateContent({
      model,
      contents: prompt
    });

    res.json({
      success: true,
      text: response.text
    });
  } catch (error) {
    console.error('Error generating content from Gemini API:', error);
    res.status(500).json({ error: error.message || 'Internal server error while calling Gemini AI.' });
  }
});

// Cakto API Checkout Endpoint
app.post('/api/checkout', async (req, res) => {
  const { uid, email } = req.body;
  
  const clientId = process.env.CAKTO_CLIENT_ID;
  const clientSecret = process.env.CAKTO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Cakto keys are not configured on the backend.' });
  }

  try {
    // 1. Obter Access Token via OAuth2 da Cakto
    const tokenResponse = await fetch('https://api.cakto.com.br/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('Falha ao autenticar na Cakto:', tokenData);
      return res.status(401).json({ error: 'Falha na autenticação com a Cakto.' });
    }

    const accessToken = tokenData.access_token;

    // 2. Gerar/Obter o link de checkout (Requer configurar Oferta/Produto na Cakto)
    // OBS: Como a Cakto trabalha com links estáticos de ofertas, você geralmente
    // não precisa gerar um checkout dinâmico, apenas redirecionar para a oferta com os parâmetros.
    // Exemplo de link da oferta: https://pay.cakto.com.br/SUA_OFERTA
    
    // Como a integração exata depende do ID do seu produto criado lá no painel,
    // aqui nós retornamos a URL simulada ou você pode preencher o ID da sua oferta abaixo.
    const checkoutBaseUrl = 'https://pay.cakto.com.br/COLOQUE_AQUI_O_ID_DA_SUA_OFERTA';
    
    // Adicionamos o e-mail e UID na URL para rastrear quem comprou via Webhook depois!
    const checkoutUrl = `${checkoutBaseUrl}?email=${encodeURIComponent(email || '')}&src=${uid}`;

    res.json({ checkoutUrl });
  } catch (error) {
    console.error('Error generating checkout from Cakto:', error);
    res.status(500).json({ error: 'Failed to generate checkout link.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
