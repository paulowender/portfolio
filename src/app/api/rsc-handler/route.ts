import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Responder com um objeto JSON vazio para evitar erros 404
  return NextResponse.json({});
}

export async function POST(request: Request) {
  // Responder com um objeto JSON vazio para evitar erros 404
  return NextResponse.json({});
}
