export const siteConfig = {
  name: 'CloudWise',
  description:
    'AI-powered cloud cost and resource optimization platform. Analyze usage, reduce waste, and make smarter infrastructure decisions.',
  author: {
    name: '', // Configurable author name
    role: 'Cloud Engineering & AI Platform',
    bio: 'Dedicated to helping engineering teams monitor cloud costs, eliminate infrastructure waste, and make data-driven architecture choices.',
  },
  links: {
    github: 'https://github.com',
    docs: '/docs',
  },
  providers: [
    { id: 'aws', name: 'Amazon Web Services', status: 'available' as const },
    { id: 'azure', name: 'Microsoft Azure', status: 'coming-soon' as const },
    { id: 'gcp', name: 'Google Cloud Platform', status: 'coming-soon' as const },
  ],
};
