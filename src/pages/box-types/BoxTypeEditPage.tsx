import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiGetBoxType, apiUpdateBoxType, type ApiStatus } from '@/lib/api';

const EditBoxTypePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [values, setValues] = React.useState<{ name: string; description: string; status: ApiStatus; existingImage?: string } | null>(null);
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

    React.useEffect(() => {
        const load = async () => {
            try {
                const data = await apiGetBoxType(id!);
                if (!data) { navigate('/box-types'); return; }
                setValues({ name: data.name, description: data.description ?? '', status: data.status, existingImage: data.image });
            } catch (err: any) {
                setError(err?.message ?? 'Failed to load box type');
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
            await apiUpdateBoxType(id!, { name: values.name, description: values.description, status: values.status, imageFile });
            navigate('/box-types');
        } catch (err: any) {
            setError(err?.message ?? 'Failed to update box type');
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
                    <IconButton onClick={() => navigate('/box-types')} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
                    <Typography variant="h5">Edit Box Type</Typography>
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
                            <Box sx={{ mt: 2 }}>
                                <Button variant="outlined" component="label">
                                    {imageFile ? 'Change Image' : 'Upload New Image'}
                                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                                </Button>
                                {(imagePreview ?? values.existingImage) && (
                                    <Box sx={{ mt: 2 }}>
                                        <img src={imagePreview ?? values.existingImage} alt="Preview"
                                            style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }} />
                                    </Box>
                                )}
                            </Box>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                                <Button type="button" variant="outlined" color="inherit" onClick={() => navigate('/box-types')}>Cancel</Button>
                                <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Saving...' : 'Update'}</Button>
                            </Box>
                        </>
                    )}
                </Paper>
            </Box>
        </ProtectedRoute>
    );
};

export default EditBoxTypePage;
