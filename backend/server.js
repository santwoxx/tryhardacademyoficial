import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { MercadoPagoConfig, Preference } from 'mercadopago';

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

// Mercado Pago Checkout Endpoint
app.post('/api/checkout', async (req, res) => {
  const { uid, email } = req.body;
  
  if (!process.env.MP_ACCESS_TOKEN && !process.env.MP_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Mercado Pago keys are not configured on the backend.' });
  }

  try {
    // In production, you would use MP_ACCESS_TOKEN. 
    // Here we initialize the client (assuming MP_ACCESS_TOKEN is provided in Render envs)
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MP_ACCESS_TOKEN || process.env.MP_CLIENT_SECRET,
      options: { timeout: 5000 }
    });
    
    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            id: 'tryhard-vip',
            title: 'Tryhard VIP - Acesso Ilimitado',
            quantity: 1,
            unit_price: 14.90,
            currency_id: 'BRL',
          }
        ],
        payer: {
          email: email || 'usuario@tryhard.com'
        },
        external_reference: uid,
        back_urls: {
          success: 'https://tryhardacademyoficial.vercel.app',
          failure: 'https://tryhardacademyoficial.vercel.app',
          pending: 'https://tryhardacademyoficial.vercel.app'
        },
        auto_return: 'approved'
      }
    });

    res.json({ checkoutUrl: response.init_point });
  } catch (error) {
    console.error('Error generating checkout from Mercado Pago:', error);
    res.status(500).json({ error: 'Failed to generate checkout link.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
