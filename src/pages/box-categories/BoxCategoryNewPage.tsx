import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiCreateBoxCategory, type ApiStatus } from '@/lib/api';

const NewBoxCategoryPage: React.FC = () => {
    const navigate = useNavigate();
    const [values, setValues] = React.useState({ name: '', description: '', status: 'active' as ApiStatus });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await apiCreateBoxCategory(values);
            navigate('/box-categories');
        } catch (err: any) {
            setError(err?.message ?? 'Failed to create Box Category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box>
                <Typography variant="h5" gutterBottom>Add Box Category</Typography>
                <Paper sx={{ p: 3, maxWidth: 480 }} component="form" onSubmit={handleSubmit}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField label="Name" fullWidth required margin="normal" value={values.name}
                        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} />
                    <TextField label="Description" fullWidth margin="normal" multiline rows={3} value={values.description}
                        onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))} />
                    <TextField label="Status" select fullWidth required margin="normal" value={values.status}
                        onChange={(e) => setValues((v) => ({ ...v, status: e.target.value as ApiStatus }))}>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="delete">Delete</MenuItem>
                    </TextField>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                        <Button type="button" variant="outlined" color="inherit" onClick={() => navigate('/box-categories')}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Saving...' : 'Create'}</Button>
                    </Box>
                </Paper>
            </Box>
        </ProtectedRoute>
    );
};

export default NewBoxCategoryPage;
