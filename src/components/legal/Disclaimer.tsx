import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowLeftIcon, AlertCircleIcon, InfoIcon } from '../ui/Icons';

interface DisclaimerProps {
  onBack?: () => void;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ onBack }) => {
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
            Disclaimer
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircleIcon size={24} color="#F59E0B" />
              Gawin AI Service Disclaimer
            </CardTitle>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '8px 0 0 0' }}>
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>

          <CardContent>
            <div style={{ lineHeight: '1.7', color: '#374151' }}>
              {/* Important Notice */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '32px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <AlertCircleIcon size={24} color="#EF4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#EF4444', margin: '0 0 8px 0' }}>
                      Important Notice
                    </h3>
                    <p style={{ margin: 0, color: '#7F1D1D' }}>
                      Gawin AI is an artificial intelligence service. While we strive for accuracy and helpfulness, 
                      AI-generated content may contain errors, inaccuracies, or biases. Always verify important information 
                      and use your judgment when relying on AI-generated content.
                    </p>
                  </div>
                </div>
              </div>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  1. AI Content Accuracy
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  Our AI models are trained on diverse datasets and designed to be helpful, but they are not infallible:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>AI responses may contain factual errors or outdated information</li>
                  <li>Generated content should be verified independently before important use</li>
                  <li>AI models may hallucinate or create plausible-sounding but incorrect information</li>
                  <li>Complex or specialized topics may require expert consultation</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  2. Educational Content Disclaimer
                </h2>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <InfoIcon size={20} color="#3B82F6" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <p style={{ margin: 0, color: '#1E40AF' }}>
                        <strong>Educational Purpose:</strong> Our tutoring and educational features are designed to assist 
                        learning and should not replace formal education, professional tutoring, or expert instruction.
                      </p>
                    </div>
                  </div>
                </div>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>Educational content is for learning assistance only</li>
                  <li>Not a substitute for qualified teachers or educational institutions</li>
                  <li>Academic integrity policies of your institution apply</li>
                  <li>Verify learning materials with authoritative sources</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  3. Professional Advice Disclaimer
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  Gawin AI does not provide professional advice and should not be used as a substitute for:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li><strong>Medical advice:</strong> Consult healthcare professionals for medical concerns</li>
                  <li><strong>Legal advice:</strong> Consult qualified attorneys for legal matters</li>
                  <li><strong>Financial advice:</strong> Consult financial advisors for investment decisions</li>
                  <li><strong>Mental health support:</strong> Seek professional help for mental health issues</li>
                  <li><strong>Safety-critical decisions:</strong> Consult experts for safety-related matters</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  4. Code and Technical Content
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  AI-generated code and technical content:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>Should be reviewed and tested before production use</li>
                  <li>May contain bugs, security vulnerabilities, or inefficiencies</li>
                  <li>Licensing and copyright considerations apply</li>
                  <li>Best practices and security standards should be followed</li>
                  <li>Professional code review is recommended for critical applications</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  5. Image and Media Content
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  Generated images and processed media content:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>May not accurately represent real people, places, or events</li>
                  <li>OCR text extraction may contain errors or omissions</li>
                  <li>Generated images are artificial and may contain artifacts</li>
                  <li>Respect copyright and usage rights for uploaded content</li>
                  <li>Verify accuracy of extracted text from important documents</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  6. Service Availability
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  We strive to provide reliable service, but cannot guarantee:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>100% uptime or uninterrupted service</li>
                  <li>Consistent response times or performance</li>
                  <li>Availability during maintenance or upgrades</li>
                  <li>Compatibility with all devices or browsers</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  7. User Responsibility
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  As a user of Gawin AI, you are responsible for:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>Using the service in accordance with our Terms of Service</li>
                  <li>Verifying AI-generated content before relying on it</li>
                  <li>Respecting intellectual property rights</li>
                  <li>Not using the service for harmful or illegal purposes</li>
                  <li>Understanding the limitations of AI technology</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  8. Data and Privacy Considerations
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  When using our service, please be aware:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>Conversations may be stored and analyzed for service improvement</li>
                  <li>Do not share sensitive personal or confidential information</li>
                  <li>Uploaded files are processed and may be temporarily stored</li>
                  <li>Review our Privacy Policy for detailed information</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  9. Third-Party Content and Services
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  Our service may include or reference third-party content:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li>Third-party content is not under our control</li>
                  <li>We do not endorse third-party services or content</li>
                  <li>Third-party terms and conditions apply</li>
                  <li>Links to external sites are for convenience only</li>
                </ul>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  10. Updates and Changes
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  This disclaimer may be updated periodically to reflect changes in our service or legal requirements. 
                  Continued use of the service after updates constitutes acceptance of the revised disclaimer.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1F2937' }}>
                  11. Contact Information
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  If you have questions about this disclaimer or need clarification about our service limitations:
                </p>
                <div style={{ 
                  background: 'rgba(255, 107, 53, 0.1)', 
                  padding: '16px', 
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 107, 53, 0.2)'
                }}>
                  <p style={{ margin: 0, fontWeight: '500' }}>Gawin AI Support</p>
                  <p style={{ margin: '4px 0 0 0' }}>Email: support@kreativloops.ai</p>
                </div>
              </section>

              {/* Final Notice */}
              <div style={{
                background: '#F3F4F6',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                padding: '20px',
                marginTop: '32px',
                textAlign: 'center'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: '0 0 12px 0' }}>
                  Acknowledgment of Understanding
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
                  By using Gawin AI, you acknowledge that you have read, understood, and accept this disclaimer 
                  and the limitations of our AI-powered service. Use your best judgment and verify important information 
                  independently.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Disclaimer;