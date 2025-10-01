import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Brain,
  TrendingUp,
  MessageSquare,
  Code,
  Users,
  Download,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Target,
  Lightbulb,
  FileText,
} from "lucide-react"

interface AIAnalysisDialogProps {
  isOpen: boolean
  onClose: () => void
  interview: {
    id: string
    title: string
    candidate: {
      id: string
      full_name: string
      email: string
    }
    interview_type: {
      id: string
      name: string
      color: string
    }
    scheduled_date: string
    duration_minutes: number
    ai_analysis_status: string
    confidence_score?: number
    communication_score?: number
    technical_score?: number
    engagement_score?: number
    ai_summary?: string
    ai_sentiment?: string
    ai_keywords?: string[]
    ai_recommendations?: string[]
    transcript?: string
  }
}

// Mock detailed analysis data
const detailedAnalysis = {
  summary: "Sarah demonstrated excellent technical knowledge throughout the interview, showcasing strong problem-solving abilities and clear communication skills. Her responses were well-structured and showed deep understanding of frontend development concepts.",
  
  keyStrengths: [
    "Strong technical foundation in React and TypeScript",
    "Clear and articulate communication style",
    "Excellent problem-solving approach",
    "Good understanding of software architecture",
    "Demonstrated leadership experience"
  ],
  
  areasForImprovement: [
    "Could elaborate more on testing strategies",
    "More specific examples of handling technical debt",
    "Discussion of performance optimization techniques"
  ],
  
  recommendations: [
    "Consider for senior role based on technical competency",
    "Strong candidate for team lead positions",
    "Excellent cultural fit for the organization",
    "Recommend proceeding to final round"
  ],
  
  keywords: [
    "React", "TypeScript", "Node.js", "API Design", "Team Leadership", 
    "Problem Solving", "Code Review", "Agile", "Testing", "Architecture"
  ],
  
  sentiment: "positive",
  
  transcript: `Interviewer: Good morning Sarah, thank you for joining us today. Let's start with you telling me about your experience with React and modern frontend development.

Sarah: Good morning! Thank you for having me. I've been working with React for about 4 years now, starting with class components and transitioning to hooks. I'm particularly passionate about creating scalable component architectures and have experience with TypeScript, which I find invaluable for maintaining large codebases.

Interviewer: That's great. Can you walk me through how you would approach optimizing a React application's performance?

Sarah: Absolutely. I'd start by identifying bottlenecks using React DevTools Profiler. Common optimizations include implementing React.memo for preventing unnecessary re-renders, using useMemo and useCallback for expensive calculations, and code splitting with lazy loading for better initial load times. I also focus on optimizing bundle size and implementing proper state management patterns.

Interviewer: Excellent. Tell me about a challenging project you've worked on recently.

Sarah: I recently led the migration of a legacy jQuery application to React. The challenge was maintaining functionality while improving performance and user experience. I implemented a gradual migration strategy, created a component library for consistency, and established testing patterns. The project resulted in a 40% improvement in load times and significantly better maintainability.

Interviewer: How do you handle code reviews and mentoring junior developers?

Sarah: I believe in constructive feedback that focuses on learning opportunities. I always explain the 'why' behind suggestions and provide resources for further learning. I've mentored three junior developers in my current role, focusing on code quality, best practices, and problem-solving approaches. I also organize regular knowledge-sharing sessions within the team.

Interviewer: That's impressive. Do you have any questions for us about the role or the team?

Sarah: Yes, I'm curious about the current tech stack and any upcoming technical challenges the team is facing. Also, what does the code review process look like here, and how does the team approach technical decision-making?`,

  processingTime: "2m 34s",
  confidence: 0.94
}

export function AIAnalysisDialog({ isOpen, onClose, interview }: AIAnalysisDialogProps) {
  const [isReprocessing, setIsReprocessing] = useState(false)

  const calculateOverallScore = (): number | null => {
    const { confidence_score, communication_score, technical_score, engagement_score } = interview
    if (confidence_score && communication_score && technical_score && engagement_score) {
      return Math.round((confidence_score + communication_score + technical_score + engagement_score) / 4)
    }
    return null
  }

  const handleReprocess = async () => {
    setIsReprocessing(true)
    // Simulate reprocessing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsReprocessing(false)
  }

  const handleDownloadTranscript = () => {
    const element = document.createElement("a")
    const file = new Blob([interview.transcript || detailedAnalysis.transcript], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `interview_transcript_${interview.candidate.full_name.replace(' ', '_')}_${interview.scheduled_date}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Badge className="bg-green-100 text-green-700">Positive</Badge>
      case 'neutral':
        return <Badge className="bg-gray-100 text-gray-700">Neutral</Badge>
      case 'negative':
        return <Badge className="bg-red-100 text-red-700">Negative</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">Unknown</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">AI Analysis Results</DialogTitle>
              <DialogDescription>
                Detailed analysis for {interview.candidate.full_name} - {interview.title}
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReprocess}
                disabled={isReprocessing}
              >
                {isReprocessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                <span className="ml-2">{isReprocessing ? 'Processing...' : 'Reprocess'}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadTranscript}>
                <Download className="w-4 h-4 mr-2" />
                Download Transcript
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>Overall Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold">
                      <span className={getScoreColor(calculateOverallScore() || 0)}>
                        {calculateOverallScore() || 0}
                      </span>
                      <span className="text-lg text-gray-500">/100</span>
                    </div>
                    <p className="text-sm text-gray-600">AI Confidence: {Math.round(detailedAnalysis.confidence * 100)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Sentiment</p>
                    {getSentimentBadge(interview.ai_sentiment || detailedAnalysis.sentiment)}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Performance Breakdown</p>
                  {(interview.confidence_score && interview.communication_score && 
                    interview.technical_score && interview.engagement_score) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>Confidence</span>
                          </span>
                          <span>{Math.round(interview.confidence_score)}%</span>
                        </div>
                        <Progress value={interview.confidence_score} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>Communication</span>
                          </span>
                          <span>{Math.round(interview.communication_score)}%</span>
                        </div>
                        <Progress value={interview.communication_score} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center space-x-1">
                            <Code className="w-3 h-3" />
                            <span>Technical</span>
                          </span>
                          <span>{Math.round(interview.technical_score)}%</span>
                        </div>
                        <Progress value={interview.technical_score} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>Engagement</span>
                          </span>
                          <span>{Math.round(interview.engagement_score)}%</span>
                        </div>
                        <Progress value={interview.engagement_score} className="h-2" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Analysis Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {interview.ai_summary || detailedAnalysis.summary}
                </p>
              </CardContent>
            </Card>

            {/* Key Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span>Key Topics Discussed</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(interview.ai_keywords || detailedAnalysis.keywords).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>Key Strengths</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {detailedAnalysis.keyStrengths.map((strength, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Areas for Improvement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-orange-600">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Areas for Improvement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {detailedAnalysis.areasForImprovement.map((area, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{area}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transcript" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Interview Transcript</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Processing time: {detailedAnalysis.processingTime}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full rounded border p-4">
                  <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {detailedAnalysis.transcript}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-600">
                  <Lightbulb className="w-5 h-5" />
                  <span>AI Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(interview.ai_recommendations || detailedAnalysis.recommendations).map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Suggested Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-green-600 mb-2">✓ Proceed to Final Round</h4>
                    <p className="text-sm text-gray-600">Strong candidate showing excellent technical and communication skills.</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-blue-600 mb-2">→ Technical Deep Dive</h4>
                    <p className="text-sm text-gray-600">Consider additional technical assessment in specialized areas.</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-purple-600 mb-2">📋 Reference Check</h4>
                    <p className="text-sm text-gray-600">Validate leadership experience and team collaboration skills.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}