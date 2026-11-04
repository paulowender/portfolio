import * as React from 'react';

interface ContactFormEmailTemplateProps {
  name: string;
  email: string;
  subject: string;
  message: string;
  companyName: string;
}

export const ContactFormEmailTemplate: React.FC<Readonly<ContactFormEmailTemplateProps>> = ({
  name,
  email,
  subject,
  message,
  companyName,
}) => (
  <div
    style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      border: '1px solid #2A2932',
      borderRadius: '12px',
      backgroundColor: '#0C0D12',
    }}
  >
    <h1
      style={{
        color: '#F3F1F8',
        fontSize: '24px',
        borderBottom: '1px solid #2A2932',
        paddingBottom: '10px',
      }}
    >
      Nova Mensagem de Contato
    </h1>

    <div style={{ marginBottom: '20px' }}>
      <p style={{ color: '#AAA6B4', fontSize: '16px', lineHeight: '1.5', margin: '5px 0' }}>
        <strong>Nome:</strong> {name}
      </p>
      <p style={{ color: '#AAA6B4', fontSize: '16px', lineHeight: '1.5', margin: '5px 0' }}>
        <strong>Email:</strong> {email}
      </p>
      <p style={{ color: '#AAA6B4', fontSize: '16px', lineHeight: '1.5', margin: '5px 0' }}>
        <strong>Assunto:</strong> {subject}
      </p>
    </div>

    <div
      style={{
        backgroundColor: '#14151A',
        padding: '15px',
        borderRadius: '10px',
        border: '1px solid #2A2932',
        marginBottom: '20px',
      }}
    >
      <h2 style={{ color: '#F3F1F8', fontSize: '18px', marginTop: '0' }}>Mensagem:</h2>
      <p style={{ color: '#AAA6B4', fontSize: '16px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
        {message}
      </p>
    </div>

    <div
      style={{
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #2A2932',
        fontSize: '14px',
        color: '#77727F',
        textAlign: 'center' as const,
      }}
    >
      <p>Esta mensagem foi enviada através do formulário de contato do site {companyName}.</p>
    </div>
  </div>
);

export const ContactFormConfirmationEmailTemplate: React.FC<
  Readonly<{
    name: string;
    companyName: string;
    companyEmail?: string | null;
    companyPhone?: string | null;
  }>
> = ({ name, companyName, companyEmail, companyPhone }) => (
  <div
    style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      border: '1px solid #2A2932',
      borderRadius: '12px',
      backgroundColor: '#0C0D12',
    }}
  >
    <h1
      style={{
        color: '#F3F1F8',
        fontSize: '24px',
        borderBottom: '1px solid #2A2932',
        paddingBottom: '10px',
      }}
    >
      Recebemos sua mensagem!
    </h1>

    <div style={{ marginBottom: '20px' }}>
      <p style={{ color: '#AAA6B4', fontSize: '16px', lineHeight: '1.5' }}>Olá {name},</p>
      <p style={{ color: '#AAA6B4', fontSize: '16px', lineHeight: '1.5' }}>
        Obrigado por entrar em contato com a {companyName}. Recebemos sua mensagem e responderemos o
        mais breve possível.
      </p>

      <div
        style={{
          backgroundColor: '#14151A',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid #2A2932',
          marginTop: '20px',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ color: '#F3F1F8', fontSize: '18px', marginTop: '0' }}>Informações de Contato:</h2>
        {companyEmail && (
          <p style={{ color: '#AAA6B4', fontSize: '16px', lineHeight: '1.5', margin: '5px 0' }}>
            <strong>Email:</strong> {companyEmail}
          </p>
        )}
        {companyPhone && (
          <p style={{ color: '#AAA6B4', fontSize: '16px', lineHeight: '1.5', margin: '5px 0' }}>
            <strong>Telefone:</strong> {companyPhone}
          </p>
        )}
      </div>

      <p style={{ color: '#AAA6B4', fontSize: '16px', lineHeight: '1.5' }}>
        Atenciosamente,
        <br />
        Equipe {companyName}
      </p>
    </div>

    <div
      style={{
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #2A2932',
        fontSize: '14px',
        color: '#77727F',
        textAlign: 'center' as const,
      }}
    >
      <p>Este é um email automático, por favor não responda diretamente a esta mensagem.</p>
    </div>
  </div>
);

export default ContactFormEmailTemplate;
