/**
 * Vercel Serverless Function: /api/parking?city=[sf|la]
 * Supports both Vercel Node runtime (handler) and Edge runtime (GET).
 */

import { handleParkingApi } from '../src/api/parkingHandler';

export default async function handler(req: any, res?: any) {
  return handleParkingApi(req, res);
}

export async function GET(request: Request) {
  return handleParkingApi(request);
}

export async function OPTIONS(request: Request) {
  return handleParkingApi(request);
}
