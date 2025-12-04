import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

const MonthlyVarianceChart = ({ data }) => {
    // Transform data object to array for Recharts
    const chartData = Object.keys(data).map(month => ({
        month,
        Budget: data[month].budget,
        Actual: data[month].actual,
        Variance: data[month].variance
    }));

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color, margin: '3px 0' }}>
                            {entry.name}: {new Intl.NumberFormat('en-IN').format(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={0} stroke="#000" />
                <Bar dataKey="Budget" fill="#1976d2" name="Budget" />
                <Bar dataKey="Actual" fill="#ed6c02" name="Actuals" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default MonthlyVarianceChart;
