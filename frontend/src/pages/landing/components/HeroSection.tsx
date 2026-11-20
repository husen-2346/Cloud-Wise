import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Cloud, ArrowRight } from 'lucide-react';

export function HeroSection() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate('/app/connect');
    } else {
      navigate('/register');
    }
  };

  return (
    <section
      id="hero"
      aria-label="CloudWise Introduction"
      className="relative min-h-[100svh] w-full flex flex-col justify-center items-center overflow-hidden bg-app"
    >
      {/* Background with responsive artwork matching visual reference */}
      <picture className="absolute inset-0 w-full h-full pointer-events-none select-none">
        <source media="(max-width: 640px)" srcSet="/images/hero-mobile.webp" />
        <img
          src="/images/hero-bg.webp"
          alt=""
          className="w-full h-full object-cover object-top opacity-95"
        />
      </picture>

      {/* Soft atmospheric gradient blending overlay at bottom 22% */}
      <div
        className="absolute inset-x-0 bottom-0 h-44 sm:h-56 pointer-events-none bg-gradient-to-t from-app via-app/70 to-transparent"
        aria-hidden="true"
      />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-24 sm:pt-40 sm:pb-32 flex flex-col items-center text-center">
        {/* Two-Line Display Headline */}
        <h1 className="font-serif text-[42px] leading-[1.08] sm:text-6xl md:text-7xl lg:text-[76px] font-normal tracking-[-0.03em] max-w-3xl mx-auto">
          <span className="block text-ink">Optimize today.</span>
          <span className="block text-brand-500 font-normal">Scale tomorrow.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-body max-w-[700px] mx-auto leading-relaxed font-normal">
          An AI-powered cloud cost optimization platform. Analyze usage, reduce
          waste, and make smarter infrastructure decisions.
        </p>

        {/* Primary CTA Button */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={handleCtaClick}
            leftIcon={<Cloud size={20} className="stroke-[2.2]" />}
            rightIcon={<ArrowRight size={20} className="stroke-[2.2]" />}
            className="shadow-[0_10px_28px_-8px_rgba(10,139,255,0.55)] px-8 font-medium text-base hover:shadow-[0_14px_34px_-6px_rgba(10,139,255,0.65)] transition-all duration-200"
          >
            Connect your cloud account
          </Button>
        </div>
      </div>
    </section>
  );
}
