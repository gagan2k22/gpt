import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BudgetList from './pages/BudgetList';
import POList from './pages/POList';
import POCreate from './pages/POCreate';
import POEdit from './pages/POEdit';
import ActualsList from './pages/ActualsList';
import MasterData from './pages/MasterData';
import UserManagement from './pages/UserManagement';

const ProtectedRoute = ({ children }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
};

import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

function App() {
    return (
        <AuthProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Dashboard />} />
                            <Route path="budgets" element={<BudgetList />} />
                            <Route path="pos" element={<POList />} />
                            <Route path="pos/new" element={<POCreate />} />
                            <Route path="pos/:id/edit" element={<POEdit />} />
                            <Route path="actuals" element={<ActualsList />} />
                            <Route path="master-data" element={<MasterData />} />
                            <Route path="users" element={<UserManagement />} />
                        </Route>
                    </Routes>
                </Router>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
