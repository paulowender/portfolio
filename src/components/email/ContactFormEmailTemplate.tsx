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
  <div style={{
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
  }}>
    <h1 style={{ color: '#333', fontSize: '24px', borderBottom: '1px solid #e0e0e0', paddingBottom: '10px' }}>
      Nova Mensagem de Contato
    </h1>
    
    <div style={{ marginBottom: '20px' }}>
      <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5', margin: '5px 0' }}>
        <strong>Nome:</strong> {name}
      </p>
      <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5', margin: '5px 0' }}>
        <strong>Email:</strong> {email}
      </p>
      <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5', margin: '5px 0' }}>
        <strong>Assunto:</strong> {subject}
      </p>
    </div>
    
    <div style={{ 
      backgroundColor: '#fff', 
      padding: '15px', 
      borderRadius: '5px',
      border: '1px solid #e0e0e0',
      marginBottom: '20px'
    }}>
      <h2 style={{ color: '#333', fontSize: '18px', marginTop: '0' }}>Mensagem:</h2>
      <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
        {message}
      </p>
    </div>
    
    <div style={{
      marginTop: '30px',
      paddingTop: '20px',
      borderTop: '1px solid #e0e0e0',
      fontSize: '14px',
      color: '#999',
      textAlign: 'center' as const,
    }}>
      <p>Esta mensagem foi enviada através do formulário de contato do site {companyName}.</p>
    </div>
  </div>
);

export const ContactFormConfirmationEmailTemplate: React.FC<Readonly<{
  name: string;
  companyName: string;
  companyEmail?: string;
  companyPhone?: string;
}>> = ({
  name,
  companyName,
  companyEmail,
  companyPhone,
}) => (
  <div style={{
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
  }}>
    <h1 style={{ color: '#333', fontSize: '24px', borderBottom: '1px solid #e0e0e0', paddingBottom: '10px' }}>
      Recebemos sua mensagem!
    </h1>
    
    <div style={{ marginBottom: '20px' }}>
      <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5' }}>
        Olá {name},
      </p>
      <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5' }}>
        Obrigado por entrar em contato com a {companyName}. Recebemos sua mensagem e responderemos o mais breve possível.
      </p>
      
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '15px', 
        borderRadius: '5px',
        border: '1px solid #e0e0e0',
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#333', fontSize: '18px', marginTop: '0' }}>Informações de Contato:</h2>
        {companyEmail && (
          <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5', margin: '5px 0' }}>
            <strong>Email:</strong> {companyEmail}
          </p>
        )}
        {companyPhone && (
          <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5', margin: '5px 0' }}>
            <strong>Telefone:</strong> {companyPhone}
          </p>
        )}
      </div>
      
      <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5' }}>
        Atenciosamente,<br />
        Equipe {companyName}
      </p>
    </div>
    
    <div style={{
      marginTop: '30px',
      paddingTop: '20px',
      borderTop: '1px solid #e0e0e0',
      fontSize: '14px',
      color: '#999',
      textAlign: 'center' as const,
    }}>
      <p>Este é um email automático, por favor não responda diretamente a esta mensagem.</p>
    </div>
  </div>
);

export default ContactFormEmailTemplate;
