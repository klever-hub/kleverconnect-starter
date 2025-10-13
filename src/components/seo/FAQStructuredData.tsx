import { Helmet } from 'react-helmet-async';

const faqs = [
  {
    question: 'What is KleverConnect Starter?',
    answer:
      'KleverConnect Starter is an open-source React TypeScript template that helps developers quickly build Web3 applications with Klever blockchain integration.',
  },
  {
    question: 'How much does it cost to use KleverConnect?',
    answer:
      'KleverConnect Starter is completely free and open-source. You only pay for blockchain transaction fees when deploying to mainnet.',
  },
  {
    question: 'Do I need blockchain experience to use this?',
    answer:
      'Basic React knowledge is sufficient. Our step-by-step guide teaches you everything about Web3 integration as you build.',
  },
  {
    question: 'Can I use this for commercial projects?',
    answer:
      'Yes! KleverConnect is MIT licensed, allowing unlimited commercial use without restrictions.',
  },
  {
    question: 'How long does it take to build a DApp with KleverConnect?',
    answer:
      'You can have a working Web3 app with wallet integration in under 30 minutes following our tutorial.',
  },
  {
    question: "What's the difference between Klever and Ethereum?",
    answer:
      'Klever offers lower transaction fees, faster confirmations, and built-in features like multi-currency support, making it ideal for user-friendly DApps.',
  },
];

export const FAQStructuredData = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
};
