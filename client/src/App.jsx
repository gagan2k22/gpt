import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BudgetList from './pages/BudgetList';
import BudgetMonthlyView from './pages/BudgetMonthlyView';
import BudgetDetail from './pages/BudgetDetail';
import POList from './pages/POList';
import POForm from './pages/POForm';
import ActualsList from './pages/ActualsList';
import ImportHistory from './pages/ImportHistory';
import MasterData from './pages/MasterData';
import UserManagement from './pages/UserManagement';
import ActualBOA from './pages/ActualBOA';
import BudgetBOA from './pages/BudgetBOA';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

const ProtectedRoute = ({ children }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
};

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
                            <Route path="budgets/monthly" element={<BudgetMonthlyView />} />
                            <Route path="budgets/:uid" element={<BudgetDetail />} />
                            <Route path="pos" element={<POList />} />
                            <Route path="pos/new" element={<POForm />} />
                            <Route path="pos/:id/edit" element={<POForm />} />
                            <Route path="actuals" element={<ActualsList />} />
                            <Route path="imports" element={<ImportHistory />} />
                            <Route path="master-data" element={<MasterData />} />
                            <Route path="users" element={<UserManagement />} />
                            <Route path="actual-boa" element={<ActualBOA />} />
                            <Route path="budget-boa" element={<BudgetBOA />} />
                        </Route>
                    </Routes>
                </Router>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
