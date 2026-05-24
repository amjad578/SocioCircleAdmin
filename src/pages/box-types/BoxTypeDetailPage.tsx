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
import { apiGetBoxType, type ApiBoxType } from '@/lib/api';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return 'success';
        case 'inactive': return 'default';
        case 'delete': return 'error';
        default: return 'default';
    }
};

const BoxTypeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [boxType, setBoxType] = React.useState<ApiBoxType | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const load = async () => {
            try {
                const data = await apiGetBoxType(id!);
                if (!data) { navigate('/box-types'); return; }
                setBoxType(data);
            } catch (err: any) {
                setError(err?.message ?? 'Failed to load box type');
            }
        };
        void load();
    }, [id, navigate]);

    if (error) return <ProtectedRoute requiredPermissions={['boxes:edit']}><Alert severity="error">{error}</Alert></ProtectedRoute>;
    if (!boxType) return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        </ProtectedRoute>
    );

    return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate('/box-types')} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
                    <Typography variant="h5">Box Type Details</Typography>
                </Box>
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5">{boxType.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip label={boxType.status.charAt(0).toUpperCase() + boxType.status.slice(1)} color={getStatusColor(boxType.status) as any} />
                            <Button variant="outlined" startIcon={<EditIcon />} size="small" onClick={() => navigate(`/box-types/${boxType._id}/edit`)}>
                                Edit
                            </Button>
                        </Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">Description</Typography>
                    <Typography>{boxType.description || '—'}</Typography>
                    {boxType.image && (
                        <Box sx={{ mb: 2 }}>
                            <img src={boxType.image} alt={boxType.name}
                                style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 8, marginTop: 10 }} />
                        </Box>
                    )}
                </Paper>
            </Box>
        </ProtectedRoute>
    );
};

export default BoxTypeDetailPage;
