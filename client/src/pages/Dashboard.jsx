import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Paper, CircularProgress } from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalance, ShoppingCart } from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalBudget: 0,
        totalActual: 0,
        variance: 0,
        utilizationPercent: 0
    });

    const [towerData, setTowerData] = useState([]);
    const [entityData, setEntityData] = useState([]);
    const [budgetHeadData, setBudgetHeadData] = useState([]);
    const [monthlyTrend, setMonthlyTrend] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Fetch budget tracker data
            const trackerRes = await axios.get('/api/budgets/tracker', config);
            const trackerData = trackerRes.data;

            // Calculate overall stats (FY26 as primary)
            const totalBudget = trackerData.reduce((sum, item) => sum + (item.fy26_budget || 0), 0);
            const totalActual = trackerData.reduce((sum, item) => sum + (item.fy26_actuals || 0), 0);
            const variance = totalBudget - totalActual;
            const utilizationPercent = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

            setStats({
                totalBudget,
                totalActual,
                variance,
                utilizationPercent
            });

            // Process Tower-wise data
            const towerMap = {};
            trackerData.forEach(item => {
                const tower = item.tower_name || 'Unknown';
                if (!towerMap[tower]) {
                    towerMap[tower] = { budget: 0, actual: 0 };
                }
                towerMap[tower].budget += (item.fy26_budget || 0);
                towerMap[tower].actual += (item.fy26_actuals || 0);
            });

            const processedTowerData = Object.keys(towerMap).map(name => ({
                name,
                budget: towerMap[name].budget,
                actual: towerMap[name].actual,
                variance: towerMap[name].budget - towerMap[name].actual
            }));
            setTowerData(processedTowerData);

            // Process Entity-wise data
            const entityMap = {};
            trackerData.forEach(item => {
                const entity = item.po_entity_name || 'Unassigned';
                if (!entityMap[entity]) {
                    entityMap[entity] = { budget: 0, actual: 0 };
                }
                entityMap[entity].budget += (item.fy26_budget || 0);
                entityMap[entity].actual += (item.fy26_actuals || 0);
            });

            const processedEntityData = Object.keys(entityMap).map(name => ({
                name,
                budget: entityMap[name].budget,
                actual: entityMap[name].actual,
                variance: entityMap[name].budget - entityMap[name].actual
            }));
            setEntityData(processedEntityData);

            // Process Budget Head-wise data
            const budgetHeadMap = {};
            trackerData.forEach(item => {
                const head = item.budget_head_name || 'Unknown';
                if (!budgetHeadMap[head]) {
                    budgetHeadMap[head] = { budget: 0, actual: 0 };
                }
                budgetHeadMap[head].budget += (item.fy26_budget || 0);
                budgetHeadMap[head].actual += (item.fy26_actuals || 0);
            });

            const processedBudgetHeadData = Object.keys(budgetHeadMap).map(name => ({
                name,
                budget: budgetHeadMap[name].budget,
                actual: budgetHeadMap[name].actual,
                variance: budgetHeadMap[name].budget - budgetHeadMap[name].actual
            }));
            setBudgetHeadData(processedBudgetHeadData);

            // Create monthly trend (simulated - you can enhance this with actual monthly data)
            const monthNames = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
            const monthlyData = monthNames.map((month, index) => ({
                month,
                budget: totalBudget / 12,
                actual: (totalActual / 12) * (index + 1) / 12 // Simulated cumulative
            }));
            setMonthlyTrend(monthlyData);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

    const formatCurrency = (value) => {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
        return `₹${(value / 1000).toFixed(0)}K`;
    };

    const StatCard = ({ title, value, icon, trend, color = 'primary' }) => (
        <Card elevation={2} sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography color="text.secondary" gutterBottom variant="body2">
                            {title}
                        </Typography>
                        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                            {formatCurrency(value)}
                        </Typography>
                        {trend !== undefined && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                {trend > 0 ? <TrendingUp color="success" fontSize="small" /> : <TrendingDown color="error" fontSize="small" />}
                                <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'} sx={{ ml: 0.5 }}>
                                    {Math.abs(trend).toFixed(1)}%
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Box sx={{
                        backgroundColor: `${color}.main`,
                        borderRadius: 2,
                        p: 1.5,
                        color: 'white',
                        opacity: 0.9
                    }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Dashboard Overview - FY26
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Budget FY26"
                        value={stats.totalBudget}
                        icon={<AccountBalance />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Actual FY26"
                        value={stats.totalActual}
                        icon={<TrendingUp />}
                        trend={stats.utilizationPercent - 100}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Variance"
                        value={stats.variance}
                        icon={<TrendingDown />}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom variant="body2">
                                Budget Utilization
                            </Typography>
                            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                                {stats.utilizationPercent.toFixed(1)}%
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                                <ShoppingCart color="primary" />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
                {/* Tower-wise Budget vs Actual */}
                <Grid item xs={12} lg={6}>
                    <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Tower-wise Budget vs Actual
                        </Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={towerData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                <YAxis tickFormatter={formatCurrency} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="budget" fill="#8884d8" name="Budget" />
                                <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Entity-wise Budget vs Actual */}
                <Grid item xs={12} lg={6}>
                    <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Entity-wise Budget vs Actual
                        </Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={entityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                <YAxis tickFormatter={formatCurrency} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="budget" fill="#0088FE" name="Budget" />
                                <Bar dataKey="actual" fill="#00C49F" name="Actual" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Budget Head-wise Budget vs Actual */}
                <Grid item xs={12} lg={8}>
                    <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Budget Head-wise Budget vs Actual
                        </Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={budgetHeadData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                <YAxis tickFormatter={formatCurrency} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="budget" fill="#FFBB28" name="Budget" />
                                <Bar dataKey="actual" fill="#FF8042" name="Actual" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Tower Distribution Pie Chart */}
                <Grid item xs={12} lg={4}>
                    <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Tower Budget Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={towerData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="budget"
                                >
                                    {towerData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Monthly Trend */}
                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Budget vs Actual Trend (FY26)
                        </Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <LineChart data={monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis tickFormatter={formatCurrency} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Line type="monotone" dataKey="budget" stroke="#8884d8" strokeWidth={2} name="Budget" />
                                <Line type="monotone" dataKey="actual" stroke="#82ca9d" strokeWidth={2} name="Actual" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
