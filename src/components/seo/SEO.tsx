import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO = ({
  title = 'KleverConnect Starter - Build Web3 Apps with Klever Wallet',
  description = 'Open-source React starter kit for Web3 developers. Seamlessly integrate Klever Wallet, manage transactions, and interact with smart contracts.',
  keywords = 'Klever, Web3, React, Blockchain, Wallet Integration, Smart Contracts, DApp Development',
  image = 'https://kleverconnect-starter.kleverhub.io/kleverhub_logo_centered.png',
  url = 'https://kleverconnect-starter.kleverhub.io',
  type = 'website',
}: SEOProps) => {
  const fullTitle = title.includes('KleverConnect') ? title : `${title} | KleverConnect Starter`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
};
