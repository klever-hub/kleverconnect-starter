import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

export const BreadcrumbSchema = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://kleverconnect-starter.kleverlabs.dev',
    },
  ];

  pathSegments.forEach((segment, index) => {
    const url = `https://kleverconnect-starter.kleverlabs.dev/${pathSegments.slice(0, index + 1).join('/')}`;
    const name = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    breadcrumbItems.push({
      '@type': 'ListItem',
      position: index + 2,
      name,
      item: url,
    });
  });

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
};
