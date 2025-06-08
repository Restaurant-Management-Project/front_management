import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ManagerPage from './ManagerPage';
import ManagerAuthPage from "./ManagerAuthPage.tsx";
import Settings from './Settings.tsx';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/requests" element={<ManagerPage />} />
                <Route path="/auth" element={<ManagerAuthPage />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </Router>
    );
}

export default App;
