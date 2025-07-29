import Header from "../components/landing/main/header";
import HeroCarousel from "../components/landing/main/hero-carousel";
import FeaturesSection from "../components/landing/main/features-section";
import HowItWorks from "../components/landing/main/how-it-works";
import Testimonials from "../components/landing/main/testimonials";
import PricingPreview from "../components/landing/main/pricing-preview";
import Footer from "../components/landing/main/footer";

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
