"use client";

import { Brain, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

const Footer = () => {
  const sections = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Integrations", href: "#integrations" },
      { name: "API Documentation", href: "#api" },
      { name: "Mobile App", href: "#mobile" },
    ],
    company: [
      { name: "About Us", href: "#about" },
      { name: "Careers", href: "#careers" },
      { name: "Press Kit", href: "#press" },
      { name: "Contact", href: "#contact" },
    ],
    resources: [
      { name: "Blog", href: "#blog" },
      { name: "Help Center", href: "#help" },
      { name: "Webinars", href: "#webinars" },
      { name: "Case Studies", href: "#cases" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" },
      { name: "Security", href: "#security" },
      { name: "GDPR Compliance", href: "#gdpr" },
    ],
  };

  return (
    <footer className="bg-gradient-primary text-white">
      <div className="container mx-auto px-6 py-16">
        {/* Newsletter Section */}
        <div className="glass-card bg-white/10 backdrop-blur-md p-8 rounded-2xl mb-16">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Updated on AI Hiring Trends</h3>
            <p className="text-white/80 mb-6">
              Get our monthly hiring insights report + 20% off your first month
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type="email"
                  placeholder="Enter your work email"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
              <Button className="bg-white text-primary hover:bg-white/90 px-6">
                <span>Subscribe</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            
            <p className="text-white/60 text-sm mt-4">
              Join 15,000+ HR professionals
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-white/20 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">ElevateHire AI</span>
            </Link>
            <p className="text-white/80 text-sm leading-relaxed">
              Transform your hiring process with AI-powered interview analysis. 
              Fair, fast, and data-driven recruitment solutions.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {sections.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {sections.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {sections.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {sections.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-white/60 text-sm mb-4 md:mb-0">
              © 2024 ElevateHire AI. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-white/70">All systems operational</span>
              </div>
              <div className="text-white/60">SOC2 Type II Compliant</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;