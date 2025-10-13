import { Helmet } from 'react-helmet-async';

export const VideoSchema = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'KleverConnect Tutorial - Build Web3 Apps with Klever',
    description:
      'Learn how to build decentralized applications with Klever blockchain using KleverConnect starter kit. Step-by-step guide for Web3 development.',
    thumbnailUrl: 'https://i.ytimg.com/vi/QBPAhv8-RVM/maxresdefault.jpg',
    uploadDate: '2025-06-06T08:00:00+00:00',
    duration: 'PT10M', // Update this with actual video duration
    contentUrl: 'https://www.youtube.com/watch?v=QBPAhv8-RVM',
    embedUrl: 'https://www.youtube.com/embed/QBPAhv8-RVM',
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: { '@type': 'WatchAction' },
      userInteractionCount: 1000,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Klever Hub',
      logo: {
        '@type': 'ImageObject',
        url: 'https://kleverconnect-starter.kleverhub.io/kleverhub_logo_only.png',
      },
    },
    educationalLevel: 'Beginner',
    learningResourceType: 'Tutorial',
    teaches: 'Web3 Development with Klever',
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
};
