import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/brand/Logo';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center p-6 text-center">
      <Logo size="lg" className="mb-8" />
      <h1 className="font-serif text-5xl font-medium text-ink mb-3 tracking-tight">404</h1>
      <h2 className="text-xl font-semibold text-ink mb-2">Page not found</h2>
      <p className="text-sm text-muted max-w-md mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary" size="md">
          Return to Home
        </Button>
      </Link>
    </div>
  );
}
