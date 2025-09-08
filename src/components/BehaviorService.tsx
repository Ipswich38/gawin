'use client';

import { useEffect, useState } from 'react';
import { behaviorAnalyticsService } from '@/lib/services/behaviorAnalyticsService';
import { behaviorPrivacyService } from '@/lib/services/behaviorPrivacyService';
import { behaviorEnhancedAI } from '@/lib/services/behaviorEnhancedAI';
import { backgroundBehaviorService } from '@/lib/services/backgroundBehaviorService';

/**
 * Background Behavior Service Component
 * Manages consent flow and service initialization without disrupting UI
 */

interface BehaviorServiceProps {
  children?: React.ReactNode;
}

const BehaviorService: React.FC<BehaviorServiceProps> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  useEffect(() => {
    const initializeBehaviorServices = async () => {
      try {
        // Only check consent after user has been active for a bit
        const initDelay = setTimeout(async () => {
          // Check if we should prompt for consent
          if (behaviorPrivacyService.shouldPromptForConsent()) {
            // Wait a bit more before showing consent (non-intrusive)
            const consentDelay = setTimeout(async () => {
              try {
                const consent = await behaviorPrivacyService.requestConsent();
                if (consent) {
                  await behaviorAnalyticsService.enableService();
                  console.log('✅ Behavior analytics enabled with user consent');
                }
              } catch (error) {
                console.warn('Consent request failed:', error);
              } finally {
                behaviorPrivacyService.recordConsentPrompt();
                setConsentChecked(true);
              }
            }, 10000); // Wait 10 seconds after app load

            return () => clearTimeout(consentDelay);
          } else {
            setConsentChecked(true);
            
            // If consent already exists, enable services
            if (behaviorPrivacyService.hasValidConsent()) {
              if (!behaviorAnalyticsService.isServiceEnabled()) {
                await behaviorAnalyticsService.enableService();
                console.log('✅ Behavior analytics re-enabled from stored consent');
              }
            }
          }
        }, 5000); // Wait 5 seconds after mount

        return () => clearTimeout(initDelay);
      } catch (error) {
        console.warn('Behavior service initialization failed:', error);
        setConsentChecked(true);
      } finally {
        setInitialized(true);
      }
    };

    initializeBehaviorServices();
  }, []);

  // Add privacy controls to global window object for debugging/manual control
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).gawinBehavior = {
        showPrivacySettings: () => behaviorPrivacyService.showPrivacySettings(),
        getSummary: () => behaviorEnhancedAI.getBehaviorSummary(),
        getPrivacyDashboard: () => behaviorPrivacyService.getPrivacyDashboard(),
        clearData: () => behaviorPrivacyService.withdrawConsent(),
        enable: () => behaviorAnalyticsService.enableService(),
        disable: () => behaviorAnalyticsService.disableService(),
        // Enhanced background features
        enableBackground: () => backgroundBehaviorService.requestBackgroundPermissions(),
        disableBackground: () => backgroundBehaviorService.disableBackgroundCollection(),
        getEnhancedSummary: () => backgroundBehaviorService.getEnhancedSummary(),
        isBackgroundEnabled: () => backgroundBehaviorService.isBackgroundEnabled()
      };
    }
  }, []);

  // This component renders nothing - it's purely for background services
  return null;
};

export default BehaviorService;