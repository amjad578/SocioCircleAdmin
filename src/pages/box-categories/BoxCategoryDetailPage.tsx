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
import { apiGetBoxCategory, type ApiBoxCategory } from '@/lib/api';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return 'success';
        case 'inactive': return 'default';
        case 'delete': return 'error';
        default: return 'default';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'active': return 'Active';
        case 'inactive': return 'Inactive';
        case 'delete': return 'Deleted';
        default: return status;
    }
};

const BoxCategoryDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [boxCategory, setBoxCategory] = React.useState<ApiBoxCategory | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const load = async () => {
            try {
                const data = await apiGetBoxCategory(id!);
                if (!data) { navigate('/box-categories'); return; }
                setBoxCategory(data);
            } catch (err: any) {
                setError(err?.message ?? 'Failed to load box category');
            }
        };
        void load();
    }, [id, navigate]);

    if (error) return <ProtectedRoute requiredPermissions={['boxes:edit']}><Alert severity="error">{error}</Alert></ProtectedRoute>;
    if (!boxCategory) return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        </ProtectedRoute>
    );

    return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate('/box-categories')} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
                    <Typography variant="h5">Box Category Details</Typography>
                </Box>
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5">{boxCategory.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip label={getStatusLabel(boxCategory.status)} color={getStatusColor(boxCategory.status) as any} />
                            <Button variant="outlined" startIcon={<EditIcon />} size="small" onClick={() => navigate(`/box-categories/${boxCategory._id}/edit`)}>
                                Edit
                            </Button>
                        </Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">Description</Typography>
                    <Typography>{boxCategory.description || '—'}</Typography>
                </Paper>
            </Box>
        </ProtectedRoute>
    );
};

export default BoxCategoryDetailPage;
