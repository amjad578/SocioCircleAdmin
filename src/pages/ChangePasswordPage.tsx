import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useAuth } from '@/components/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const ChangePasswordPage: React.FC = () => {
    const { user, changePassword } = useAuth();
    const [oldPassword, setOldPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match.');
            return;
        }

        setLoading(true);
        try {
            await changePassword(oldPassword, newPassword);
            setSuccess('Password updated successfully.');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err?.message ?? 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <Box>
                <Typography variant="h5" gutterBottom>
                    Change Password
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Update password for account: {user?.email}
                </Typography>
                <Paper sx={{ p: 3, maxWidth: 480 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            label="Current password"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                        <TextField
                            label="New password"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <TextField
                            label="Confirm new password"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ mt: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update password'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </ProtectedRoute>
    );
};

export default ChangePasswordPage;
