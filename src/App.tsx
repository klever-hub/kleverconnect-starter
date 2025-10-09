import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/pages/LandingPage';
import { StartBuilding } from './components/pages/StartBuilding';
import { TransactionTriggers } from './components/pages/TransactionTriggers';
import { ToastContainer } from './components/ui/ToastContainer';
import { ScrollToTop } from './components/layout/ScrollToTop';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/start-building" element={<StartBuilding />} />
        <Route path="/transactions" element={<TransactionTriggers />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
