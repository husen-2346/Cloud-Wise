import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Cloud, ArrowRight } from 'lucide-react';

export function CtaBandSection() {
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
      aria-label="Call to Action"
      className="py-16 px-4 sm:px-6 max-w-6xl mx-auto"
    >
      <div className="relative rounded-[28px] overflow-hidden shadow-card border border-white/80 p-8 sm:p-14 text-center">
        {/* Background Image with Fallback Gradient */}
        <picture className="absolute inset-0 w-full h-full pointer-events-none select-none">
          <source srcSet="/images/cta-band.webp" type="image/webp" />
          <img
            src="/images/cta-band.png"
            alt=""
            className="w-full h-full object-cover object-center opacity-85"
          />
        </picture>

        {/* Ambient Overlay for High Text Legibility */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-tint/90 via-surface/80 to-tint/90 backdrop-blur-[2px] pointer-events-none"
          aria-hidden="true"
        />

        {/* Content Container */}
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-5xl text-ink font-normal tracking-tight leading-tight">
            Start optimizing your cloud today
          </h2>

          <p className="mt-4 text-base sm:text-lg text-body leading-relaxed">
            Connect your AWS account in under three minutes with a secure,
            read-only IAM role. See exactly where your budget goes.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleCtaClick}
              leftIcon={<Cloud size={20} className="stroke-[2.2]" />}
              rightIcon={<ArrowRight size={20} className="stroke-[2.2]" />}
              className="shadow-[0_10px_28px_-8px_rgba(10,139,255,0.55)] px-8 font-medium text-base"
            >
              Connect your cloud account
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
