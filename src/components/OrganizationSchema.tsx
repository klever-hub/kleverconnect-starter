import { Helmet } from 'react-helmet-async';

export const OrganizationSchema = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Klever Labs',
    alternateName: 'Klever',
    url: 'https://klever.io',
    logo: 'https://kleverconnect-starter.kleverlabs.dev/kleverlabs_logo_centered.png',
    sameAs: [
      'https://github.com/klever-io',
      'https://twitter.com/klever_io',
      'https://www.linkedin.com/company/klever-blockchain'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'technical support',
      availableLanguage: ['English'],
      url: 'https://support.klever.io'
    },
    foundingDate: '2020',
    founders: [{
      '@type': 'Person',
      name: 'Dio Ianakiara'
    }],
    areaServed: 'Worldwide',
    knowsAbout: [
      'Blockchain Technology',
      'Cryptocurrency',
      'Smart Contracts',
      'DeFi',
      'Web3 Development'
    ],
    offers: {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: 'Blockchain Development Tools',
        description: 'Open-source tools and SDKs for building on Klever blockchain'
      }
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};