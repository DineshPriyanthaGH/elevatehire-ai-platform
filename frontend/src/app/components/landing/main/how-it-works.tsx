"use client";

import { Upload, Cpu, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Interview Content",
    description: "Drag and drop your video, audio, or text files with support for multiple formats",
    features: ["Video (MP4, MOV)", "Audio (MP3, WAV)", "Text transcripts", "Batch upload"],
    time: "30 seconds",
  },
  {
    icon: Cpu,
    title: "AI Processes & Analyzes",
    description: "Our neural network analyzes content through advanced AI modules",
    features: ["Transcription engine", "Sentiment analysis", "Skill extraction", "Bias detection"],
    time: "Under 2 minutes",
  },
  {
    icon: BarChart3,
    title: "Receive Actionable Insights",
    description: "Get comprehensive reports with scores, recommendations, and collaboration tools",
    features: ["Candidate scores", "Detailed reports", "Hiring recommendations", "Team collaboration"],
    time: "Instant results",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Transform Your Hiring Process in Three Simple Steps
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From upload to insights in minutes. Our streamlined process makes AI-powered hiring accessible to everyone.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-2 h-64 bg-gradient-primary rounded-full opacity-20" />
          
          <div className="space-y-16 lg:space-y-24">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div
                  key={index}
                  className={`flex flex-col lg:flex-row items-center gap-8 ${
                    isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className={`mb-6 ${isEven ? "lg:text-left" : "lg:text-right"}`}>
                      <span className="text-primary text-lg font-semibold">
                        Step {index + 1} • {step.time}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">
                      {step.title}
                    </h3>
                    
                    <p className="text-lg text-muted-foreground mb-6">
                      {step.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {step.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-center space-x-2 text-sm text-muted-foreground"
                        >
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse-glow">
                      <Icon className="h-16 w-16 text-white" />
                    </div>
                    
                    {/* Step number */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Hiring?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of companies already using AI to make better hiring decisions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-gradient px-8 py-3 rounded-lg font-semibold hover-scale">
                Start Free Trial
              </button>
              <button className="btn-outline-purple px-8 py-3 rounded-lg font-semibold">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;