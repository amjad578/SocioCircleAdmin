import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';

const ForgotPasswordPage: React.FC = () => {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setLoading(true);
        try {
            await forgotPassword(email);
            setMessage('If this email exists, a reset link has been sent.');
        } catch (err: any) {
            setError(err?.message ?? 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <Paper sx={{ p: 4, width: '100%' }} elevation={3}>
                <Typography variant="h5" gutterBottom>
                    Forgot Password
                </Typography>
                {message && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {message}
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 3 }}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send reset link'}
                    </Button>
                    <Button
                        component={Link}
                        to="/login"
                        fullWidth
                        sx={{ mt: 1, textTransform: 'none' }}
                    >
                        Back to login
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ForgotPasswordPage;
