import * as React from 'react';

interface TestEmailTemplateProps {
  userName: string;
  companyName: string;
}

export const TestEmailTemplate: React.FC<Readonly<TestEmailTemplateProps>> = ({
  userName,
  companyName,
}) => (
  <div style={{
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '5px',
  }}>
    <h1 style={{ color: '#333', fontSize: '24px' }}>Test Email</h1>
    <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5' }}>
      Hello {userName},
    </p>
    <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5' }}>
      This is a test email from {companyName} to verify your Resend integration.
    </p>
    <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5' }}>
      If you received this email, your Resend configuration is working correctly!
    </p>
    <div style={{
      marginTop: '30px',
      paddingTop: '20px',
      borderTop: '1px solid #e0e0e0',
    }}>
      <p style={{ color: '#999', fontSize: '14px' }}>
        Sent from {companyName}
      </p>
    </div>
  </div>
);

export default TestEmailTemplate;
