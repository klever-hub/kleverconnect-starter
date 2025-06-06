import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { StartBuilding } from './components/StartBuilding';
import { TransactionTriggers } from './components/TransactionTriggers';
import { ToastContainer } from './components/ToastContainer';
import { ScrollToTop } from './components/ScrollToTop';

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
