import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import * as React from 'react';
import ContactFormEmailTemplate, { ContactFormConfirmationEmailTemplate } from '@/components/email/ContactFormEmailTemplate';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 },
      );
    }

    // Get the first user (assuming there's only one user in the system for now)
    const user = await prisma.user.findFirst({
      include: {
        company: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 404 });
    }

    // Get the messaging configuration
    const messagingConfig = await prisma.messagingConfig.findUnique({
      where: { userId: user.id },
    });

    if (!messagingConfig || !messagingConfig.resendApiKey || !messagingConfig.resendEnabled) {
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 },
      );
    }

    // Initialize Resend client
    const resend = new Resend(messagingConfig.resendApiKey);

    // Company information
    const companyName = user.company?.name || 'Wender Tech';
    const fromEmail = messagingConfig.resendFromEmail || '';
    const fromName = messagingConfig.resendFromName || companyName;
    const adminEmail = user.email || fromEmail;

    // Send email to admin
    const { data: adminEmailData, error: adminEmailError } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [adminEmail],
      subject: `Novo contato: ${subject}`,
      react: ContactFormEmailTemplate({
        name,
        email,
        subject,
        message,
        companyName,
      }) as React.ReactElement,
    });

    if (adminEmailError) {
      console.error('Error sending admin email:', adminEmailError);
      return NextResponse.json(
        { error: 'Failed to send email to admin' },
        { status: 500 },
      );
    }

    // Send confirmation email to the user
    const { data: userEmailData, error: userEmailError } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `Recebemos sua mensagem - ${companyName}`,
      react: ContactFormConfirmationEmailTemplate({
        name,
        companyName,
        companyEmail: user.company?.email,
        companyPhone: user.company?.phone,
      }) as React.ReactElement,
    });

    if (userEmailError) {
      console.error('Error sending confirmation email:', userEmailError);
      // We don't return an error here because the admin email was sent successfully
    }

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
      adminEmailId: adminEmailData?.id,
      userEmailId: userEmailData?.id,
    });
  } catch (error: any) {
    console.error('Exception in POST /api/contact:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 },
    );
  }
}
