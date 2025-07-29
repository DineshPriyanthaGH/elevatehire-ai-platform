"use client";

import { Check, Star } from "lucide-react";
import { Button } from "../ui/button";

const plans = [
  {
    name: "Starter",
    price: 99,
    target: "Small teams (1-10 employees)",
    features: [
      "25 interviews/month",
      "Basic transcription",
      "Sentiment analysis",
      "PDF reports",
      "Email support",
      "Basic integrations",
      "Mobile app access",
    ],
    cta: "Start 14-Day Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: 299,
    target: "Growing companies (11-100 employees)",
    features: [
      "100 interviews/month",
      "Advanced analytics",
      "Custom scoring",
      "Bias detection",
      "Priority support",
      "API access",
      "Team collaboration",
      "Advanced reporting",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: null,
    target: "Large organizations (100+ employees)",
    features: [
      "Unlimited interviews",
      "White-label options",
      "Custom integrations",
      "Dedicated support",
      "Implementation support",
      "Training included",
      "SLA guarantee",
      "Custom features",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const PricingPreview = () => {
  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Simple, Transparent Pricing That Scales With You
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the perfect plan for your hiring needs. All plans include our core AI features with no hidden fees.
          </p>
          
          {/* Annual/Monthly Toggle */}
          <div className="mt-8 inline-flex items-center bg-secondary rounded-lg p-1">
            <button className="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">
              Monthly
            </button>
            <button className="px-6 py-2 text-sm font-medium text-muted-foreground">
              Annual (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 transition-all duration-300 hover-scale ${
                plan.popular
                  ? "glass-card bg-gradient-primary text-white ring-2 ring-primary/50"
                  : "bg-card border border-border hover:border-primary/20"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-accent text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${
                  plan.popular ? "text-white" : "text-foreground"
                }`}>
                  {plan.name}
                </h3>
                
                <div className="mb-4">
                  {plan.price ? (
                    <div className="flex items-baseline justify-center">
                      <span className={`text-4xl font-bold ${
                        plan.popular ? "text-white" : "text-foreground"
                      }`}>
                        ${plan.price}
                      </span>
                      <span className={`text-lg ml-1 ${
                        plan.popular ? "text-white/80" : "text-muted-foreground"
                      }`}>
                        /month
                      </span>
                    </div>
                  ) : (
                    <span className={`text-4xl font-bold ${
                      plan.popular ? "text-white" : "text-foreground"
                    }`}>
                      Custom
                    </span>
                  )}
                </div>
                
                <p className={`text-sm ${
                  plan.popular ? "text-white/80" : "text-muted-foreground"
                }`}>
                  {plan.target}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <Check className={`h-5 w-5 ${
                      plan.popular ? "text-white" : "text-primary"
                    }`} />
                    <span className={`text-sm ${
                      plan.popular ? "text-white/90" : "text-muted-foreground"
                    }`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button
                className={`w-full ${
                  plan.popular
                    ? "bg-white text-primary hover:bg-white/90"
                    : "btn-gradient"
                }`}
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-12">
          <div className="glass-card p-6 max-w-2xl mx-auto">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">14-day free trial</span> • 
              No credit card required • Cancel anytime • 
              <span className="font-semibold text-foreground">30-day money-back guarantee</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingPreview;