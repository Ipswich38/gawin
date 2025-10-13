'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Shield, Crown } from 'lucide-react';
import { NotionCard, NotionButton, NotionTag } from './ui/NotionUI';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@/lib/stripe/config';

interface SubscriptionPlansProps {
  currentPlan?: SubscriptionTier;
  onUpgrade?: (planId: SubscriptionTier) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  currentPlan = 'free',
  onUpgrade
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: SubscriptionTier) => {
    if (planId === 'free') return;

    setLoading(planId);
    try {
      if (onUpgrade) {
        await onUpgrade(planId);
      }
    } finally {
      setLoading(null);
    }
  };

  const getPlanIcon = (planId: SubscriptionTier) => {
    switch (planId) {
      case 'free':
        return <Sparkles className="w-6 h-6 text-gray-500" />;
      case 'pro':
        return <Zap className="w-6 h-6 text-blue-500" />;
      case 'enterprise':
        return <Crown className="w-6 h-6 text-purple-500" />;
      default:
        return <Shield className="w-6 h-6 text-gray-500" />;
    }
  };

  const getPlanColor = (planId: SubscriptionTier) => {
    switch (planId) {
      case 'free':
        return 'gray';
      case 'pro':
        return 'blue';
      case 'enterprise':
        return 'purple';
      default:
        return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">
          Upgrade to unlock more features and higher limits
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => {
          const isCurrentPlan = currentPlan === planId;
          const isPro = planId === 'pro';

          return (
            <motion.div
              key={planId}
              whileHover={{ y: -4 }}
              className="relative"
            >
              {isPro && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <NotionTag color="blue" className="px-3 py-1">
                    Most Popular
                  </NotionTag>
                </div>
              )}

              <NotionCard
                className={`h-full ${
                  isPro ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                } ${isCurrentPlan ? 'bg-gray-50' : ''}`}
              >
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-3">
                      {getPlanIcon(planId as SubscriptionTier)}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="mb-3">
                      <span className="text-3xl font-bold text-gray-900">
                        ${plan.price}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-600 ml-1">/month</span>
                      )}
                    </div>
                    {isCurrentPlan && (
                      <NotionTag color={getPlanColor(planId as SubscriptionTier)}>
                        Current Plan
                      </NotionTag>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex-1 space-y-4 mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{plan.credits.toLocaleString()} credits/month</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>Up to {plan.maxAgents} agents</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>Up to {plan.maxWorkflows} workflows</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    {isCurrentPlan ? (
                      <NotionButton
                        variant="secondary"
                        className="w-full"
                        disabled
                      >
                        Current Plan
                      </NotionButton>
                    ) : planId === 'free' ? (
                      <NotionButton
                        variant="outline"
                        className="w-full"
                        disabled
                      >
                        Downgrade
                      </NotionButton>
                    ) : (
                      <NotionButton
                        variant={isPro ? 'primary' : 'outline'}
                        className="w-full"
                        onClick={() => handleUpgrade(planId as SubscriptionTier)}
                        disabled={loading !== null}
                      >
                        {loading === planId ? (
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            Processing...
                          </div>
                        ) : (
                          `Upgrade to ${plan.name}`
                        )}
                      </NotionButton>
                    )}
                  </div>
                </div>
              </NotionCard>
            </motion.div>
          );
        })}
      </div>

      {/* FAQ or Additional Info */}
      <div className="text-center text-sm text-gray-500">
        <p>All plans include our core features. Cancel anytime.</p>
        <p className="mt-1">
          Need a custom solution?{' '}
          <a href="/contact" className="text-blue-600 hover:underline">
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;