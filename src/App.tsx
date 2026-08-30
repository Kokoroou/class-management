import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SupportTreePage from './pages/SupportTreePage';
import SeatingPage from './pages/SeatingPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/support-tree" element={<SupportTreePage />} />
        <Route path="/seating" element={<SeatingPage />} />
      </Route>
    </Routes>
  );
}
