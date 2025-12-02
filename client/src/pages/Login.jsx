import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const success = await login(email, password);
        if (success) {
            navigate('/');
        } else {
            setError('Invalid email or password');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
        >
            <Container maxWidth="sm">
                <Card elevation={8} sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 600, mb: 3 }}>
                            OPEX Management System
                        </Typography>
                        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
                            Sign in to manage your operational expenses
                        </Typography>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                margin="normal"
                                required
                                autoFocus
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                margin="normal"
                                required
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 600 }}
                            >
                                Sign In
                            </Button>
                        </form>

                        <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 2 }}>
                            Demo: admin@example.com / password123
                        </Typography>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default Login;
