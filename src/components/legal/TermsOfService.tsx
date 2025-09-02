import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowLeftIcon } from '../ui/Icons';

interface TermsOfServiceProps {
  onBack?: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  return (
    <div 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)',
        padding: '20px'
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              leftIcon={<ArrowLeftIcon size={16} />}
            >
              Back
            </Button>
          )}
          <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
            Terms of Service
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gawin AI Terms of Service</CardTitle>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '8px 0 0 0' }}>
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>

          <CardContent>
            <div style={{ lineHeight: '1.7', color: '#374151' }}>
              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  1. Acceptance of Terms
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  By accessing and using Gawin AI ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  2. Description of Service
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  Gawin AI provides artificial intelligence-powered services including but not limited to:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>AI-powered conversations and assistance</li>
                  <li>Educational tutoring and learning tools</li>
                  <li>Image generation and processing</li>
                  <li>Text analysis and OCR capabilities</li>
                  <li>Code assistance and programming support</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  3. User Accounts
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  To access certain features of the Service, you must register for an account. You agree to:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept all risks of unauthorized access to your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  4. Acceptable Use Policy
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  You agree not to use the Service to:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>Generate harmful, offensive, or illegal content</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon intellectual property rights</li>
                  <li>Attempt to reverse engineer or exploit the service</li>
                  <li>Share false, misleading, or deceptive information</li>
                  <li>Use the service for spam or unsolicited communications</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  5. AI-Generated Content
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  You acknowledge that:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>AI-generated content may not always be accurate or reliable</li>
                  <li>You are responsible for verifying information before relying on it</li>
                  <li>We do not guarantee the accuracy, completeness, or reliability of AI outputs</li>
                  <li>Educational content is for learning purposes and should not replace professional advice</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  6. Privacy and Data Collection
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  7. Intellectual Property
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  The Service and its original content, features, and functionality are owned by Gawin AI and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  8. Limitation of Liability
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  In no event shall Gawin AI be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  9. Termination
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  10. Changes to Terms
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  11. Contact Information
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  If you have any questions about these Terms, please contact us at:
                </p>
                <div style={{ 
                  background: 'rgba(255, 107, 53, 0.1)', 
                  padding: '16px', 
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 107, 53, 0.2)'
                }}>
                  <p style={{ margin: 0, fontWeight: '500' }}>Gawin AI Support</p>
                  <p style={{ margin: '4px 0 0 0' }}>Email: legal@kreativloops.ai</p>
                </div>
              </section>

              <section>
                <div style={{
                  background: '#F3F4F6',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '14px',
                  color: '#6B7280'
                }}>
                  <p style={{ margin: 0, fontWeight: '500', color: '#374151' }}>
                    Agreement Acknowledgment
                  </p>
                  <p style={{ margin: '8px 0 0 0' }}>
                    By using Gawin AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                  </p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;