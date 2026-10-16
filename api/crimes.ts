/**
 * Vercel Serverless Function: /api/crimes?city=[sf|la]
 * Supports both Vercel Node runtime (handler) and Edge runtime (GET).
 */

import { handleCrimesApi } from '../src/api/crimesHandler';

export default async function handler(req: any, res?: any) {
  return handleCrimesApi(req, res);
}

export async function GET(request: Request) {
  return handleCrimesApi(request);
}

export async function OPTIONS(request: Request) {
  return handleCrimesApi(request);
}
