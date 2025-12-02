import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const sample = [
    { name: '1', project: 3000, task: 1200 },
    { name: '2', project: 2000, task: 900 },
    { name: '3', project: 3500, task: 1800 },
    { name: '4', project: 1500, task: 700 },
    { name: '5', project: 2500, task: 1100 },
    { name: '6', project: 1800, task: 900 },
    { name: '7', project: 3200, task: 1400 },
    { name: '8', project: 900, task: 400 },
    { name: '9', project: 3600, task: 1700 },
    { name: '10', project: 2700, task: 1200 },
];

export default function ChartCard() {
    return (
        <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1">Weekly Report</Typography>
                <Typography variant="caption" color="text.secondary">Project vs Task</Typography>
            </Box>

            <Box sx={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sample}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="project" name="Project" fill="#8884d8" />
                        <Bar dataKey="task" name="Task" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
}
