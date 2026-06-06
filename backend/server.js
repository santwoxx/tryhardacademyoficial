import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import admin from 'firebase-admin';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize Firebase Admin SDK
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', error);
  }
} else {
  console.warn('FIREBASE_SERVICE_ACCOUNT is not defined. Webhook database updates will not work.');
}

const db = admin.apps.length ? admin.firestore() : null;

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
  
  try {
    // Retorna o link de checkout estático com os parâmetros do usuário para rastreio
    const checkoutBaseUrl = 'https://pay.cakto.com.br/u5h6im8_850195';
    const checkoutUrl = `${checkoutBaseUrl}?email=${encodeURIComponent(email || '')}&src=${uid}`;

    res.json({ checkoutUrl });
  } catch (error) {
    console.error('Error generating checkout:', error);
    res.status(500).json({ error: 'Failed to generate checkout link.' });
  }
});

// Cakto Webhook Endpoint (Processa compras e ativa o VIP)
app.post('/webhooks/cakto', async (req, res) => {
  const payload = req.body;
  console.log('Recebido webhook da Cakto:', JSON.stringify(payload, null, 2));

  // Validação de segurança com Chave Secreta do Webhook
  const webhookSecret = process.env.CAKTO_WEBHOOK_SECRET;
  if (webhookSecret) {
    const authHeader = req.headers['authorization'] || req.headers['x-webhook-secret'] || req.headers['webhook-secret'];
    if (authHeader !== webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      console.error('Webhook bloqueado: Chave secreta inválida.');
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  if (!db) {
    console.error('Firebase Admin não está inicializado!');
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    const eventType = payload.event || payload.type;
    const data = payload.data || payload;

    const approvedEvents = ['purchase_approved', 'subscription_created', 'subscription_renewed'];
    const canceledEvents = ['purchase_refused', 'subscription_canceled', 'subscription_expired', 'purchase_refunded', 'chargeback'];

    let isVIP = false;
    let shouldUpdate = false;

    if (approvedEvents.includes(eventType)) {
      isVIP = true;
      shouldUpdate = true;
    } else if (canceledEvents.includes(eventType)) {
      isVIP = false;
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      // A Cakto envia os parâmetros da URL no `src` ou `tracking.src`
      const src = data.src || (data.tracking && data.tracking.src) || (data.metadata && data.metadata.src);
      const email = data.customer?.email || data.client?.email || data.email;

      if (src) {
        // Atualiza o jogador no Firestore via UID
        await db.collection('players').doc(src).update({ isVIP });
        console.log(`[Cakto Webhook] Jogador ${src} teve VIP atualizado para: ${isVIP}`);
      } else if (email) {
        // Fallback: Busca o jogador pelo e-mail
        const snapshot = await db.collection('players').where('email', '==', email).get();
        if (!snapshot.empty) {
          snapshot.forEach(async (doc) => {
            await doc.ref.update({ isVIP });
            console.log(`[Cakto Webhook] Jogador ${doc.id} (E-mail: ${email}) teve VIP atualizado para: ${isVIP}`);
          });
        } else {
          console.warn(`[Cakto Webhook] E-mail ${email} não encontrado no banco de dados para ativar o VIP.`);
        }
      } else {
        console.warn('[Cakto Webhook] O payload não continha src (UID) nem e-mail.', data);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro ao processar o webhook da Cakto:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
