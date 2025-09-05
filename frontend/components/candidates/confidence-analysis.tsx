import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Target, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { api } from '@/lib/api';

interface ConfidenceMetric {
  score: number;
  weight: number;
  weighted_score: number;
  details: Record<string, any>;
}

interface ConfidenceBreakdown {
  overall_confidence: number;
  metrics: Record<string, ConfidenceMetric>;
  penalties_applied: Record<string, number>;
  recommendations: string[];
}

interface ConfidenceAnalysisProps {
  candidateId: string;
  candidateName: string;
  initialConfidence?: number;
}

export function ConfidenceAnalysis({ candidateId, candidateName, initialConfidence }: ConfidenceAnalysisProps) {
  const [breakdown, setBreakdown] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchConfidenceBreakdown = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/candidates/${candidateId}/confidence_breakdown/`);
      setBreakdown(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch confidence breakdown');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    if (confidence >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getConfidenceBadgeVariant = (confidence: number): "default" | "secondary" | "destructive" | "outline" => {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.6) return 'secondary';
    if (confidence >= 0.4) return 'outline';
    return 'destructive';
  };

  const getMetricIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 0.6) return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    if (score >= 0.4) return <Info className="h-4 w-4 text-orange-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  const formatMetricName = (name: string) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            CV Extraction Confidence
          </div>
          {initialConfidence !== undefined && (
            <Badge variant={getConfidenceBadgeVariant(initialConfidence)}>
              {(initialConfidence * 100).toFixed(1)}%
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Overview */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Extraction quality for {candidateName}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchConfidenceBreakdown}
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze Confidence'}
            </Button>
          </div>

          {/* Initial Confidence Display */}
          {initialConfidence !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Confidence</span>
                <span className={getConfidenceColor(initialConfidence)}>
                  {(initialConfidence * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={initialConfidence * 100} className="h-2" />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Detailed Breakdown */}
          {breakdown && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0">
                  <span className="text-sm font-medium">Detailed Analysis</span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-4 mt-4">
                {/* Overall Summary */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Overall Assessment</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Confidence Score:</span>
                      <div className={`font-medium ${getConfidenceColor(breakdown.extraction_summary.overall_confidence)}`}>
                        {(breakdown.extraction_summary.overall_confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quality Level:</span>
                      <div className="font-medium">
                        {breakdown.extraction_summary.confidence_level}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Metrics */}
                <div className="space-y-3">
                  <h4 className="font-medium">Detailed Metrics</h4>
                  {Object.entries(breakdown.confidence_breakdown.metrics).map(([key, metric]: [string, any]) => (
                    <div key={key} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getMetricIcon(metric.score)}
                          <span className="font-medium text-sm">{formatMetricName(key)}</span>
                        </div>
                        <div className="text-sm">
                          <span className={getConfidenceColor(metric.score)}>
                            {(metric.score * 100).toFixed(0)}%
                          </span>
                          <span className="text-muted-foreground ml-1">
                            (weight: {(metric.weight * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                      <Progress value={metric.score * 100} className="h-1 mb-2" />
                      
                      {/* Metric Details */}
                      {metric.details && Object.keys(metric.details).length > 0 && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          {Object.entries(metric.details).map(([detailKey, detailValue]: [string, any]) => (
                            <div key={detailKey} className="flex justify-between">
                              <span>{formatMetricName(detailKey)}:</span>
                              <span>{typeof detailValue === 'boolean' ? (detailValue ? '✓' : '✗') : detailValue}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Key Strengths */}
                {breakdown.extraction_summary.key_strengths?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-700">Key Strengths</h4>
                    <div className="space-y-1">
                      {breakdown.extraction_summary.key_strengths.map((strength: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvement Recommendations */}
                {breakdown.extraction_summary.improvement_areas?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-orange-700">Improvement Areas</h4>
                    <div className="space-y-1">
                      {breakdown.extraction_summary.improvement_areas.map((recommendation: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span>{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Penalties */}
                {breakdown.confidence_breakdown.penalties_applied && 
                 Object.keys(breakdown.confidence_breakdown.penalties_applied).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-700">Penalties Applied</h4>
                    <div className="space-y-1">
                      {Object.entries(breakdown.confidence_breakdown.penalties_applied).map(([penalty, value]: [string, any]) => (
                        <div key={penalty} className="flex justify-between items-center text-sm">
                          <span className="text-red-600">{formatMetricName(penalty)}</span>
                          <span className="text-red-600 font-medium">-{(value * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
