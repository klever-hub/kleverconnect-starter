import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from './components/ui/ToastContainer';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { PageLoader } from './components/ui/PageLoader';

// Lazy load page components for code splitting
const LandingPage = lazy(() =>
  import('./components/pages/LandingPage').then((module) => ({
    default: module.LandingPage,
  }))
);
const StartBuilding = lazy(() =>
  import('./components/pages/StartBuilding').then((module) => ({
    default: module.StartBuilding,
  }))
);
const TransactionTriggers = lazy(() =>
  import('./components/pages/TransactionTriggers').then((module) => ({
    default: module.TransactionTriggers,
  }))
);

function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/start-building" element={<StartBuilding />} />
          <Route path="/transactions" element={<TransactionTriggers />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </>
  );
}

export default App;
