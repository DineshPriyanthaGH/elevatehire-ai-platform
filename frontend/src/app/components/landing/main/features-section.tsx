"use client";

import { useState } from "react";
import { Mic, Brain, Target, Shield, Settings, FileText } from "lucide-react";

const features = [
  {
    id: "transcription",
    icon: Mic,
    title: "AI Interview Transcription",
    description: "99% accurate speech-to-text with speaker identification",
    details: "Multiple language support, custom vocabulary, export options",
    benefits: ["Real-time transcription", "Speaker identification", "Timestamp markers", "Custom vocabulary"],
  },
  {
    id: "sentiment",
    icon: Brain,
    title: "Advanced Sentiment Analysis",
    description: "Gauge candidate confidence, enthusiasm, and communication skills",
    details: "Confidence tracking, stress detection, communication assessment",
    benefits: ["Emotion detection", "Confidence tracking", "Stress indicators", "Communication patterns"],
  },
  {
    id: "matching",
    icon: Target,
    title: "Intelligent Skill Matching",
    description: "AI-powered keyword extraction and competency alignment",
    details: "Technical skill assessment, soft skill evaluation, culture fit analysis",
    benefits: ["Skill extraction", "Competency scoring", "Culture fit", "Experience mapping"],
  },
  {
    id: "bias",
    icon: Shield,
    title: "Bias Detection & Mitigation",
    description: "Promote objective evaluation and reduce unconscious bias",
    details: "EEOC compliance, diversity tracking, objective scoring",
    benefits: ["Bias alerts", "Fair evaluation", "Diversity metrics", "Compliance tracking"],
  },
  {
    id: "scoring",
    icon: Settings,
    title: "Custom Scoring Rubrics",
    description: "Tailored assessment frameworks for every role",
    details: "Role-specific evaluation, team collaboration, standardized scoring",
    benefits: ["Custom criteria", "Weight adjustments", "Team scoring", "Standardization"],
  },
  {
    id: "reports",
    icon: FileText,
    title: "Instant Professional Reports",
    description: "Comprehensive analysis reports ready to share with stakeholders",
    details: "Executive summaries, detailed analytics, collaborative sharing",
    benefits: ["PDF export", "Executive summaries", "Visual charts", "Team sharing"],
  },
];

const FeaturesSection = () => {
  const [activeFeature, setActiveFeature] = useState("transcription");

  const currentFeature = features.find(f => f.id === activeFeature) || features[0];

  return (
    <section id="features" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Powerful AI Features That Transform Hiring
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover how our advanced AI technology revolutionizes every aspect of your interview process
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Feature Tabs */}
          <div className="space-y-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isActive = activeFeature === feature.id;
              
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`w-full p-6 rounded-xl text-left transition-all duration-300 ${
                    isActive
                      ? "glass-card bg-gradient-primary text-white"
                      : "bg-card hover:bg-secondary border border-border"
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      isActive ? "bg-white/20" : "bg-primary/10"
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        isActive ? "text-white" : "text-primary"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-2 ${
                        isActive ? "text-white" : "text-foreground"
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm ${
                        isActive ? "text-white/80" : "text-muted-foreground"
                      }`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feature Details */}
          <div className="glass-card p-8 animate-fade-in-up">
            <div className="mb-6">
              <div className="p-4 bg-gradient-primary rounded-lg inline-block mb-4">
                <currentFeature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{currentFeature.title}</h3>
              <p className="text-lg text-muted-foreground mb-4">{currentFeature.description}</p>
              <p className="text-muted-foreground">{currentFeature.details}</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Key Benefits:</h4>
              {currentFeature.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;