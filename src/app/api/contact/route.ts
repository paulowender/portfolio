import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import axios from 'axios';
import * as React from 'react';
import ContactFormEmailTemplate, {
  ContactFormConfirmationEmailTemplate,
} from '@/components/email/ContactFormEmailTemplate';

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

    // Get the first user in the database
    // This allows the contact form to work on the public landing page
    const userData = await prisma.user.findFirst({
      include: {
        company: true,
      },
    });

    if (!userData) {
      return NextResponse.json({ error: 'No user found' }, { status: 404 });
    }

    // Get the messaging configuration
    const messagingConfig = await prisma.messagingConfig.findUnique({
      where: { userId: userData.id },
    });

    if (!messagingConfig || !messagingConfig.resendApiKey || !messagingConfig.resendEnabled) {
      return NextResponse.json({ error: 'Email service is not configured' }, { status: 500 });
    }

    // Initialize Resend client
    const resend = new Resend(messagingConfig.resendApiKey);

    // Company information
    const companyName = userData.company?.name || 'Wender Tech';
    const fromEmail = messagingConfig.resendFromEmail || '';
    const fromName = messagingConfig.resendFromName || companyName;
    const adminEmail = userData.email || fromEmail;

    // Check if Evolution API is configured and enabled
    const evolutionEnabled = messagingConfig.evolutionEnabled || false;
    const evolutionApiKey = messagingConfig.evolutionApiKey || '';
    const evolutionBaseUrl = messagingConfig.evolutionBaseUrl || '';
    const evolutionInstance = messagingConfig.evolutionInstance || '';

    // Send email to admin
    let adminEmailData;
    try {
      const result = await resend.emails.send({
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

      adminEmailData = result.data;
      const adminEmailError = result.error;

      if (adminEmailError) {
        console.error('Error sending admin email:', adminEmailError);
        return NextResponse.json({ error: 'Failed to send email to admin' }, { status: 500 });
      }
    } catch (emailError) {
      console.error('Exception sending admin email:', emailError);
      return NextResponse.json({ error: 'Exception sending email to admin' }, { status: 500 });
    }

    // Send confirmation email to the user
    let userEmailData;
    try {
      const result = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: [email],
        subject: `Recebemos sua mensagem - ${companyName}`,
        react: ContactFormConfirmationEmailTemplate({
          name,
          companyName,
          companyEmail: userData.company?.email,
          companyPhone: userData.company?.phone,
        }) as React.ReactElement,
      });

      userEmailData = result.data;
      const userEmailError = result.error;

      if (userEmailError) {
        console.error('Error sending confirmation email:', userEmailError);
        // We don't return an error here because the admin email was sent successfully
      }
    } catch (emailError) {
      console.error('Exception sending confirmation email:', emailError);
      // We don't return an error here because the admin email was sent successfully
    }

    // Send WhatsApp message if Evolution API is configured and enabled
    let whatsappMessageId = null;
    if (evolutionEnabled && evolutionApiKey && evolutionBaseUrl && evolutionInstance) {
      try {
        // Format the message for WhatsApp
        const whatsappMessage = `*Novo Contato via Site*\n\n*Nome:* ${name}\n*Email:* ${email}\n*Assunto:* ${subject}\n\n*Mensagem:*\n${message}`;

        // Get the admin phone number (remove any non-numeric characters)
        const adminPhone = userData.phone || userData.company?.phone || '';
        const cleanAdminPhone = adminPhone.replace(/\D/g, '');

        if (cleanAdminPhone) {
          // Send message via Evolution API
          const response = await axios.post(
            `${evolutionBaseUrl}/message/sendText/${evolutionInstance}`,
            {
              number: cleanAdminPhone,
              delay: 1200,
              text: whatsappMessage,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                apikey: evolutionApiKey,
              },
            },
          );

          if (response.status === 201 || response.status === 200) {
            whatsappMessageId = response.data?.key?.id || 'sent';
          }
        } else {
          console.warn('No admin phone number found for WhatsApp notification');
        }
      } catch (whatsappError) {
        console.error('Error sending WhatsApp message:', whatsappError);
        // We don't return an error here because the emails were sent successfully
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
      adminEmailId: adminEmailData?.id,
      userEmailId: userEmailData?.id,
      whatsappMessageId: whatsappMessageId,
    });
  } catch (error: any) {
    console.error('Exception in POST /api/contact:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 },
    );
  }
}
