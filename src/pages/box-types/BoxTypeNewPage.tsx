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
import { apiCreateBoxType, type ApiStatus } from '@/lib/api';

const NewBoxTypePage: React.FC = () => {
    const navigate = useNavigate();
    const [values, setValues] = React.useState({ name: '', description: '', status: 'active' as ApiStatus });
    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => { if (typeof reader.result === 'string') setImagePreview(reader.result); };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await apiCreateBoxType({ ...values, imageFile });
            navigate('/box-types');
        } catch (err: any) {
            setError(err?.message ?? 'Failed to create box type');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box>
                <Typography variant="h5" gutterBottom>Add Box Type</Typography>
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
                    <Box sx={{ mt: 2 }}>
                        <Button variant="outlined" component="label">
                            Upload Image
                            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                        </Button>
                        {imagePreview && (
                            <Box sx={{ mt: 2 }}>
                                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }} />
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                        <Button type="button" variant="outlined" color="inherit" onClick={() => navigate('/box-types')}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Saving...' : 'Create'}</Button>
                    </Box>
                </Paper>
            </Box>
        </ProtectedRoute>
    );
};

export default NewBoxTypePage;
