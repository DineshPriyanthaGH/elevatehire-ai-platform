"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "HR Director",
    company: "TechCorp Inc.",
    content: "ElevateHire AI has transformed our hiring process. The AI analysis provides insights we never had before, making our decisions more objective and data-driven.",
    rating: 5,
    avatar: "👩‍💼"
  },
  {
    name: "Michael Chen",
    role: "Talent Acquisition Manager",
    company: "StartupXYZ",
    content: "The real-time transcription and sentiment analysis have saved us hours of manual work. Our hiring quality has improved significantly since implementing this tool.",
    rating: 5,
    avatar: "👨‍💻"
  },
  {
    name: "Emily Rodriguez",
    role: "VP of People",
    company: "GrowthCo",
    content: "The bias detection feature is game-changing. It helps us ensure fair evaluation and promotes diversity in our hiring process. Highly recommended!",
    rating: 5,
    avatar: "👩‍🔬"
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Trusted by HR Professionals Worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how leading companies are revolutionizing their hiring process with AI-powered insights.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass-card p-8 rounded-2xl hover-scale transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-4">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-sm text-primary">{testimonial.company}</p>
                </div>
              </div>

              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <blockquote className="text-muted-foreground leading-relaxed">
                <Quote className="h-6 w-6 text-primary/30 mb-2" />
                {testimonial.content}
              </blockquote>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="glass-card p-6 max-w-2xl mx-auto">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">4.9/5 average rating</span> • 
              <span className="font-semibold text-foreground"> 500+ companies</span> • 
              <span className="font-semibold text-foreground"> 10,000+ interviews analyzed</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 