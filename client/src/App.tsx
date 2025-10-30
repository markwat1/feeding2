
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { FeedingRecordForm } from './components/FeedingRecordForm';
import { FeedingHistory } from './components/FeedingHistory';
import { ScheduleManagement } from './components/ScheduleManagement';
import { CalendarView } from './components/CalendarView';
import { PetManagement } from './components/PetManagement';
import { MaintenanceRecord } from './components/MaintenanceRecord';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/feeding" replace />} />
            <Route path="/feeding" element={<FeedingRecordForm />} />
            <Route path="/feeding-history" element={<FeedingHistory />} />
            <Route path="/schedule" element={<ScheduleManagement />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/pets" element={<PetManagement />} />
            <Route path="/maintenance" element={<MaintenanceRecord />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;