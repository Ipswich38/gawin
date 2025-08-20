import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowLeftIcon } from '../ui/Icons';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
            Privacy Policy
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>KreativLoops AI Privacy Policy</CardTitle>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '8px 0 0 0' }}>
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>

          <CardContent>
            <div style={{ lineHeight: '1.7', color: '#374151' }}>
              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  1. Information We Collect
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1F2937' }}>
                  Personal Information
                </h3>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>Name and email address</li>
                  <li>Account credentials</li>
                  <li>Profile preferences</li>
                  <li>Payment information (if applicable)</li>
                </ul>

                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1F2937' }}>
                  Usage Information
                </h3>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>Conversations and interactions with our AI</li>
                  <li>Files and images you upload</li>
                  <li>Usage patterns and preferences</li>
                  <li>Device information and IP address</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  2. How We Use Your Information
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  We use the information we collect to:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your requests and transactions</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Personalize your experience</li>
                  <li>Analyze usage patterns to improve our AI models</li>
                  <li>Detect and prevent fraud or abuse</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  3. Information Sharing and Disclosure
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy.
                </p>

                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1F2937' }}>
                  We may share information:
                </h3>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>With service providers who assist in our operations</li>
                  <li>When required by law or to protect our rights</li>
                  <li>In connection with a merger or acquisition</li>
                  <li>With your consent</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  4. Data Security
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  We implement appropriate security measures to protect your information:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and assessments</li>
                  <li>Access controls and authentication</li>
                  <li>Secure data centers and infrastructure</li>
                  <li>Employee training on data protection</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  5. AI Training and Data Processing
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  Important information about how we handle your data for AI improvements:
                </p>
                <div style={{
                  background: 'rgba(255, 107, 53, 0.1)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 107, 53, 0.2)',
                  marginBottom: '16px'
                }}>
                  <p style={{ margin: 0, fontWeight: '500', color: '#1F2937' }}>
                    Data Processing Notice
                  </p>
                  <ul style={{ marginLeft: '20px', marginTop: '8px', marginBottom: 0 }}>
                    <li>Your conversations may be analyzed to improve our AI models</li>
                    <li>Personal information is removed or anonymized before analysis</li>
                    <li>You can opt-out of data processing for AI improvement</li>
                    <li>We never share identifiable conversation data with third parties</li>
                  </ul>
                </div>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  6. Data Retention
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this policy:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>Account data: Retained while your account is active</li>
                  <li>Conversation history: Retained for 2 years or until deletion requested</li>
                  <li>Usage analytics: Retained for 1 year in anonymized form</li>
                  <li>Legal compliance data: Retained as required by law</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  7. Your Rights and Choices
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  You have the following rights regarding your personal information:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>Access and review your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data in a portable format</li>
                  <li>Opt-out of non-essential communications</li>
                  <li>Restrict processing for AI improvement</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  8. Cookies and Tracking
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  We use cookies and similar technologies to improve your experience:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>Essential cookies for website functionality</li>
                  <li>Analytics cookies to understand usage patterns</li>
                  <li>Preference cookies to remember your settings</li>
                  <li>No third-party advertising cookies</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  9. International Data Transfers
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  10. Children's Privacy
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we learn we have collected such information, we will delete it immediately.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  11. Changes to This Policy
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  12. Contact Us
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  If you have questions about this privacy policy or our data practices, please contact us:
                </p>
                <div style={{ 
                  background: 'rgba(255, 107, 53, 0.1)', 
                  padding: '16px', 
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 107, 53, 0.2)'
                }}>
                  <p style={{ margin: 0, fontWeight: '500' }}>KreativLoops AI Privacy Team</p>
                  <p style={{ margin: '4px 0' }}>Email: privacy@kreativloops.ai</p>
                  <p style={{ margin: '4px 0 0 0' }}>Data Protection Officer: dpo@kreativloops.ai</p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;