import { Helmet } from 'react-helmet-async';

export const CourseSchema = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Build Web3 Apps with Klever Blockchain',
    description:
      'Learn to create decentralized applications using React and Klever blockchain. From wallet integration to smart contract deployment.',
    provider: {
      '@type': 'Organization',
      name: 'Klever Labs',
      sameAs: 'https://kleverlabs.dev',
    },
    educationalLevel: 'Beginner',
    programmingLanguage: ['TypeScript', 'React', 'JavaScript'],
    teaches: [
      'Web3 Development',
      'Blockchain Integration',
      'Smart Contract Interaction',
      'Wallet Connection',
      'Transaction Management',
    ],
    timeRequired: 'PT2H',
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT2H',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      validFrom: '2024-01-01',
    },
    audience: {
      '@type': 'Audience',
      audienceType: ['Developers', 'Entrepreneurs', 'Students'],
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
};
