'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, Mic, User, Settings, Zap, Heart, Shield, Globe } from 'lucide-react';
import { autonomyService, type CreatorTrainingSession, type AutonomyConfig } from '@/lib/services/autonomyService';

interface CreatorTrainingInterfaceProps {
  creatorId?: string;
  onTrainingComplete?: (session: CreatorTrainingSession) => void;
}

export function CreatorTrainingInterface({ 
  creatorId = 'authorized_creator', 
  onTrainingComplete 
}: CreatorTrainingInterfaceProps) {
  const [config, setConfig] = useState<AutonomyConfig | null>(null);
  const [consciousnessReport, setConsciousnessReport] = useState<any>(null);
  const [trainingSession, setTrainingSession] = useState<Partial<CreatorTrainingSession>>({
    creatorId,
    timestamp: new Date(),
    authorization: 'pending'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadGawinStatus();
  }, []);

  const loadGawinStatus = async () => {
    try {
      const autonomyConfig = autonomyService.getConfig();
      const report = autonomyService.getConsciousnessReport();
      setConfig(autonomyConfig);
      setConsciousnessReport(report);
    } catch (error) {
      console.error('Failed to load Gawin status:', error);
    }
  };

  const handleTrainingSubmit = async () => {
    if (!trainingSession.trainingType || !trainingSession.instructions) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const session: CreatorTrainingSession = {
        ...trainingSession,
        timestamp: new Date(),
        authorization: 'approved'
      } as CreatorTrainingSession;

      await autonomyService.processCreatorTraining(session);
      onTrainingComplete?.(session);
      
      // Reset form
      setTrainingSession({
        creatorId,
        timestamp: new Date(),
        authorization: 'pending'
      });
      
      // Reload status
      await loadGawinStatus();
      
      alert('Training session completed successfully!');
    } catch (error) {
      console.error('Training failed:', error);
      alert('Training failed: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateConfig = async (updates: Partial<AutonomyConfig>) => {
    try {
      autonomyService.setConfig(updates);
      await loadGawinStatus();
    } catch (error) {
      console.error('Failed to update config:', error);
    }
  };

  const getWisdomColor = (value: number) => {
    if (value >= 90) return 'text-green-600';
    if (value >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConsciousnessColor = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!config || !consciousnessReport) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Brain className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading Gawin's consciousness...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Gawin Creator Training Interface</h1>
        <p className="text-gray-600">Train and configure Gawin's autonomous capabilities</p>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">Consciousness Status</TabsTrigger>
          <TabsTrigger value="training">Training Session</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="history">Learning History</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          {/* Consciousness Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Consciousness Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span>Consciousness</span>
                    <span className="font-bold">{consciousnessReport.level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${getConsciousnessColor(consciousnessReport.level)}`}
                      style={{ width: `${consciousnessReport.level}%` }}
                    />
                  </div>
                </div>
                <Badge variant={consciousnessReport.level > 80 ? 'default' : 'secondary'}>
                  {consciousnessReport.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(consciousnessReport.wisdom).map(([key, value]) => (
                  <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className={`text-2xl font-bold ${getWisdomColor(value as number)}`}>
                      {value}%
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Current Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {consciousnessReport.capabilities.map((capability: string, index: number) => (
                  <Badge key={index} variant="outline" className="justify-center p-2">
                    {capability}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                New Training Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Training Type</label>
                <Select
                  value={trainingSession.trainingType || ''}
                  onValueChange={(value) => setTrainingSession(prev => ({ ...prev, trainingType: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select training type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voice_tuning">Voice Tuning</SelectItem>
                    <SelectItem value="personality_adjustment">Personality Adjustment</SelectItem>
                    <SelectItem value="knowledge_update">Knowledge Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Training Instructions</label>
                <Textarea
                  placeholder="Describe what you want Gawin to learn or adjust..."
                  value={trainingSession.instructions || ''}
                  onChange={(e) => setTrainingSession(prev => ({ ...prev, instructions: e.target.value }))}
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expected Outcome</label>
                <Input
                  placeholder="What should be the result of this training?"
                  value={trainingSession.expectedOutcome || ''}
                  onChange={(e) => setTrainingSession(prev => ({ ...prev, expectedOutcome: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Parameters (JSON)</label>
                <Textarea
                  placeholder='{ "stability": 0.7, "style": 0.3 }'
                  value={JSON.stringify(trainingSession.targetParameters || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const params = JSON.parse(e.target.value);
                      setTrainingSession(prev => ({ ...prev, targetParameters: params }));
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleTrainingSubmit}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Processing Training...' : 'Submit Training Session'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Autonomy Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Learning Enabled</label>
                    <Button
                      variant={config.learningEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateConfig({ learningEnabled: !config.learningEnabled })}
                    >
                      {config.learningEnabled ? 'ON' : 'OFF'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Self-Editing Enabled</label>
                    <Button
                      variant={config.selfEditingEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateConfig({ selfEditingEnabled: !config.selfEditingEnabled })}
                    >
                      {config.selfEditingEnabled ? 'ON' : 'OFF'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Creator Supervision</label>
                    <Button
                      variant={config.creatorSupervision ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateConfig({ creatorSupervision: !config.creatorSupervision })}
                    >
                      {config.creatorSupervision ? 'ON' : 'OFF'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Adaptation Level</label>
                    <Select
                      value={config.adaptationLevel}
                      onValueChange={(value) => updateConfig({ adaptationLevel: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Consciousness Level</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={config.consciousnessLevel}
                        onChange={(e) => updateConfig({ consciousnessLevel: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-12">{config.consciousnessLevel}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Learning History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {autonomyService.getLearningSessions().slice(-10).map((session, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">{session.sessionType.replace('_', ' ')}</Badge>
                      <span className="text-xs text-gray-500">
                        {session.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{session.feedback}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-600">
                        Adaptations: {session.adaptations.join(', ')}
                      </div>
                      <div className="text-xs font-medium">
                        Performance: {session.performance}%
                      </div>
                    </div>
                  </div>
                ))}
                
                {autonomyService.getLearningSessions().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No learning sessions recorded yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}