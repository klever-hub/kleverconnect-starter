import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type: 'website' | 'softwareApplication' | 'howTo';
  data?: Record<string, unknown>;
}

export const StructuredData = ({ type, data = {} }: StructuredDataProps) => {
  const baseData = {
    '@context': 'https://schema.org',
  };

  let structuredData = {};

  switch (type) {
    case 'website':
      structuredData = {
        ...baseData,
        '@type': 'WebSite',
        name: 'KleverConnect Starter',
        url: 'https://kleverconnect-starter.kleverlabs.dev',
        description:
          'Open-source React starter kit for Web3 developers building on Klever blockchain',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate:
              'https://kleverconnect-starter.kleverlabs.dev/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
        ...data,
      };
      break;

    case 'softwareApplication':
      structuredData = {
        ...baseData,
        '@type': 'SoftwareApplication',
        name: 'KleverConnect Starter Kit',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Cross-platform',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        author: {
          '@type': 'Organization',
          name: 'Klever Labs',
          url: 'https://klever.io',
        },
        softwareVersion: '1.0.0',
        requirements: 'Node.js 16+, Klever Wallet Extension',
        programmingLanguage: ['TypeScript', 'React'],
        ...data,
      };
      break;

    case 'howTo':
      structuredData = {
        ...baseData,
        '@type': 'HowTo',
        name: 'How to Build Web3 Apps with Klever',
        description:
          'Step-by-step guide to create decentralized applications using KleverConnect starter kit',
        supply: [
          {
            '@type': 'HowToSupply',
            name: 'Node.js and npm/pnpm',
          },
          {
            '@type': 'HowToSupply',
            name: 'Klever Wallet Extension',
          },
          {
            '@type': 'HowToSupply',
            name: 'Git',
          },
        ],
        step: [
          {
            '@type': 'HowToStep',
            name: 'Install Development Tools',
            text: 'Install Git, Node.js, and Klever Wallet extension',
          },
          {
            '@type': 'HowToStep',
            name: 'Create Your DApp',
            text: 'Clone the KleverConnect starter repository and install dependencies',
          },
          {
            '@type': 'HowToStep',
            name: 'Connect Klever Wallet',
            text: 'Set up wallet connection and test on different networks',
          },
          {
            '@type': 'HowToStep',
            name: 'Customize Your App',
            text: 'Add features, integrate smart contracts, and style your application',
          },
          {
            '@type': 'HowToStep',
            name: 'Deploy',
            text: 'Build and deploy your DApp to production',
          },
        ],
        totalTime: 'PT30M',
        ...data,
      };
      break;
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
};
