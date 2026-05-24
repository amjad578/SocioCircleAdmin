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
import { apiGetBanner, type ApiBanner } from '@/lib/api';

const REDIRECT_LABELS: Record<string, string> = {
    box_list: 'Box List',
    box: 'Box',
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return 'success';
        case 'inactive': return 'default';
        case 'delete': return 'error';
        default: return 'default';
    }
};

const BannerDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [banner, setBanner] = React.useState<ApiBanner | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const load = async () => {
            try {
                const data = await apiGetBanner(id!);
                if (!data) { navigate('/banners'); return; }
                setBanner(data);
            } catch (err: any) {
                setError(err?.message ?? 'Failed to load banner');
            }
        };
        void load();
    }, [id, navigate]);

    if (error) return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Alert severity="error">{error}</Alert>
        </ProtectedRoute>
    );

    if (!banner) return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        </ProtectedRoute>
    );

    return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate('/banners')} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
                    <Typography variant="h5">Banner Details</Typography>
                </Box>
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5">{banner.title}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip label={banner.status.charAt(0).toUpperCase() + banner.status.slice(1)}
                                color={getStatusColor(banner.status) as any} />
                            <Button variant="outlined" startIcon={<EditIcon />} size="small"
                                onClick={() => navigate(`/banners/${banner._id}/edit`)}>
                                Edit
                            </Button>
                        </Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    {banner.image && (
                        <Box sx={{ mb: 3 }}>
                            <img src={banner.image} alt={banner.title}
                                style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 8 }} />
                        </Box>
                    )}

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <Box>
                            <Typography variant="body2" color="text.secondary">Redirect Type</Typography>
                            <Chip label={REDIRECT_LABELS[banner.redirectType] ?? banner.redirectType} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary">Position</Typography>
                            <Typography>{banner.position}</Typography>
                        </Box>
                        {banner.boxId && (
                            <Box>
                                <Typography variant="body2" color="text.secondary">Box ID</Typography>
                                <Typography sx={{ fontFamily: 'monospace', fontSize: 13 }}>{banner.boxId}</Typography>
                            </Box>
                        )}
                        {banner.boxTypeId && (
                            <Box>
                                <Typography variant="body2" color="text.secondary">Box Type ID</Typography>
                                <Typography sx={{ fontFamily: 'monospace', fontSize: 13 }}>{banner.boxTypeId}</Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Box>
        </ProtectedRoute>
    );
};

export default BannerDetailPage;
