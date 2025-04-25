import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import * as React from 'react';
import TestEmailTemplate from '@/components/email/TestEmailTemplate';
import { getAuthenticatedClient } from '@/lib/auth-helper';

export async function POST(request: Request) {
  try {
    // Authenticate the request
    const { user, error, status } = await getAuthenticatedClient(request);

    if (error) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const { apiKey, fromEmail, fromName, toEmail } = body;

    if (!apiKey || !fromEmail || !fromName || !toEmail) {
      return NextResponse.json(
        { error: 'API Key, From Email, From Name, and To Email are required' },
        { status: 400 },
      );
    }

    // Send test email using Resend API
    try {
      // Inicializar o cliente Resend com a API key
      const resend = new Resend(apiKey);

      // Enviar o email usando o cliente Resend
      const { data, error: resendError } = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: [toEmail],
        subject: 'Test Email from Wender Tech',
        react: TestEmailTemplate({
          userName: user.user_metadata?.name || 'User',
          companyName: 'Wender Tech',
        }) as React.ReactElement,
      });

      if (resendError) {
        console.error('Error sending test email with Resend:', resendError);
        return NextResponse.json(
          { error: resendError.message || 'Failed to send test email' },
          { status: 400 },
        );
      }

      return NextResponse.json({ success: true, id: data?.id });
    } catch (err: any) {
      console.error('Error sending test email with Resend:', err);
      return NextResponse.json(
        { error: err.message || 'Failed to send test email' },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error('Exception in POST /api/resend/test:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
