'use client';

import React from 'react';
import IntelligentResearchInterface from './IntelligentResearchInterface';

interface ResearchModeProps {
  onResearchComplete?: (result: any) => void;
}

const ResearchMode: React.FC<ResearchModeProps> = ({ onResearchComplete }) => {
  return (
    <IntelligentResearchInterface onResearchComplete={onResearchComplete} />
  );
};

export default ResearchMode;