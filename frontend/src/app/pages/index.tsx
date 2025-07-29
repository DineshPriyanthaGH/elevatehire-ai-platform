import Header from "@/components/ui/header";
import HeroCarousel from "@/components/ui/hero-carousel";
import FeaturesSection from "@/components/ui/features-section";
import HowItWorks from "@/components/ui/how-it-works";
import Testimonials from "@/components/ui/testimonials";
import PricingPreview from "@/components/ui/pricing-preview";
import Footer from "@/components/ui/footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroCarousel />
      <FeaturesSection />
      <HowItWorks />
      <Testimonials />
      <PricingPreview />
      <Footer />
    </div>
  );
};

export default Index;
