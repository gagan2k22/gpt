import React from 'react';
import { Box, Container, Grid } from '@mui/material';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import StatsCards from './components/StatsCards';
import ChartCard from './components/ChartCard';
import ProjectTable from './components/ProjectTable';
import RightPanel from './components/RightPanel';

export default function App() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 2 }}>
          <HeroBanner />
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={8}>
              <StatsCards />
              <ChartCard sx={{ mt: 2 }} />
              <ProjectTable sx={{ mt: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <RightPanel />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
