/**
 * Vercel Serverless Function: /api/env
 * Sirve el archivo env.js generado dinámicamente desde las variables de entorno de Vercel.
 *
 * Variables que debes configurar en Vercel Dashboard → Settings → Environment Variables:
 *   API_URL  →  https://calima-online-server-production.up.railway.app/api
 *   WS_URL   →  https://calima-online-server-production.up.railway.app
 */
export default function handler(req, res) {
    const apiUrl = process.env.API_URL || 'http://localhost:3000/api';
    const wsUrl  = process.env.WS_URL  || 'http://localhost:3000';

    const script = `window.ENV = ${JSON.stringify({ API_URL: apiUrl, WS_URL: wsUrl })};`;

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-store'); // No cachear: si cambias vars en Vercel, se reflejan al instante
    res.status(200).send(script);
}
