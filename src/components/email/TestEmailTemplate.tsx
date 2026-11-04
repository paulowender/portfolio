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
    border: '1px solid #2A2932',
    borderRadius: '12px',
    backgroundColor: '#0C0D12',
  }}>
    <h1 style={{ color: '#F3F1F8', fontSize: '24px' }}>Test Email</h1>
    <p style={{ color: '#AAA6B4', fontSize: '16px', lineHeight: '1.5' }}>
      Hello {userName},
    </p>
    <p style={{ color: '#AAA6B4', fontSize: '16px', lineHeight: '1.5' }}>
      This is a test email from {companyName} to verify your Resend integration.
    </p>
    <p style={{ color: '#AAA6B4', fontSize: '16px', lineHeight: '1.5' }}>
      If you received this email, your Resend configuration is working correctly!
    </p>
    <div style={{
      marginTop: '30px',
      paddingTop: '20px',
      borderTop: '1px solid #2A2932',
    }}>
      <p style={{ color: '#77727F', fontSize: '14px' }}>
        Sent from {companyName}
      </p>
    </div>
  </div>
);

export default TestEmailTemplate;
