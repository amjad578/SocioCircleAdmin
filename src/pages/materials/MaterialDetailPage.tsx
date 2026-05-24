import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiGetBoxMaterial, type ApiBoxMaterial } from '@/lib/api';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return 'success';
        case 'inactive': return 'default';
        case 'delete': return 'error';
        default: return 'default';
    }
};

const MaterialDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [material, setMaterial] = React.useState<ApiBoxMaterial | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const load = async () => {
            try {
                const data = await apiGetBoxMaterial(id!);
                if (!data) { navigate('/materials'); return; }
                setMaterial(data);
            } catch (err: any) {
                setError(err?.message ?? 'Failed to load material');
            }
        };
        void load();
    }, [id, navigate]);

    if (error) return <ProtectedRoute requiredPermissions={['boxes:edit']}><Alert severity="error">{error}</Alert></ProtectedRoute>;
    if (!material) return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        </ProtectedRoute>
    );

    return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate('/materials')} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
                    <Typography variant="h5">Material Details</Typography>
                </Box>
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5">{material.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip label={material.status.charAt(0).toUpperCase() + material.status.slice(1)} color={getStatusColor(material.status) as any} />
                            <Button variant="outlined" startIcon={<EditIcon />} size="small" onClick={() => navigate(`/materials/${material._id}/edit`)}>
                                Edit
                            </Button>
                        </Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">Description</Typography>
                    <Typography>{material.description || '—'}</Typography>
                </Paper>
            </Box>
        </ProtectedRoute>
    );
};

export default MaterialDetailPage;
