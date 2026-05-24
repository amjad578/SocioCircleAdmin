import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuItem from '@mui/material/MenuItem';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiGetBoxCategory, apiUpdateBoxCategory, type ApiStatus } from '@/lib/api';

const EditBoxCategoryPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [values, setValues] = React.useState<{ name: string; description: string; status: ApiStatus } | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const load = async () => {
            try {
                const data = await apiGetBoxCategory(id!);
                if (!data) { navigate('/box-categories'); return; }
                setValues({ name: data.name, description: data.description ?? '', status: data.status });
            } catch (err: any) {
                setError(err?.message ?? 'Failed to load box category');
            }
        };
        void load();
    }, [id, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!values) return;
        setError(null);
        setLoading(true);
        try {
            await apiUpdateBoxCategory(id!, values);
            navigate('/box-categories');
        } catch (err: any) {
            setError(err?.message ?? 'Failed to update Box Category');
        } finally {
            setLoading(false);
        }
    };

    if (!values && !error) return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        </ProtectedRoute>
    );

    return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate('/box-categories')} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
                    <Typography variant="h5">Edit Box Category</Typography>
                </Box>
                <Paper sx={{ p: 3, maxWidth: 480 }} component="form" onSubmit={handleSubmit}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {values && (
                        <>
                            <TextField label="Name" fullWidth required margin="normal" value={values.name}
                                onChange={(e) => setValues((v) => ({ ...v!, name: e.target.value }))} />
                            <TextField label="Description" fullWidth margin="normal" multiline rows={3} value={values.description}
                                onChange={(e) => setValues((v) => ({ ...v!, description: e.target.value }))} />
                            <TextField label="Status" select fullWidth required margin="normal" value={values.status}
                                onChange={(e) => setValues((v) => ({ ...v!, status: e.target.value as ApiStatus }))}>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                                <MenuItem value="delete">Delete</MenuItem>
                            </TextField>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                                <Button type="button" variant="outlined" color="inherit" onClick={() => navigate('/box-categories')}>Cancel</Button>
                                <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Saving...' : 'Update'}</Button>
                            </Box>
                        </>
                    )}
                </Paper>
            </Box>
        </ProtectedRoute>
    );
};

export default EditBoxCategoryPage;
