import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiGetQuery, apiUpdateQuery, type ApiQuery, type ApiQueryStatus } from '@/lib/api';

const INLINE_STATUS_OPTIONS: { value: ApiQueryStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
];

const STATUS_COLOR_MAP: Record<ApiQueryStatus, string> = {
    under_review: '#ed6c02',
    pending: '#0288d1',
    resolved: '#2e7d32',
    closed: '#757575',
    delete: '#d32f2f',
};


const DetailRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
    <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography>{value || '—'}</Typography>
    </Box>
);

const QueryDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [query, setQuery] = React.useState<ApiQuery | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const [statusUpdating, setStatusUpdating] = React.useState(false);

    React.useEffect(() => {
        const load = async () => {
            try {
                const data = await apiGetQuery(id!);
                if (!data) { navigate('/queries'); return; }
                setQuery(data);
            } catch (err: any) {
                setError(err?.message ?? 'Failed to load query');
            }
        };
        void load();
    }, [id, navigate]);

    const handleStatusUpdate = async (newStatus: ApiQueryStatus) => {
        if (!query) return;
        setStatusUpdating(true);
        try {
            await apiUpdateQuery(query._id, { status: newStatus });
            setQuery((q) => q ? { ...q, status: newStatus } : q);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to update status');
        } finally {
            setStatusUpdating(false);
        }
    };

    if (error) return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Alert severity="error">{error}</Alert>
        </ProtectedRoute>
    );

    if (!query) return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        </ProtectedRoute>
    );



    return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate('/queries')} sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5">Query Details</Typography>
                </Box>

                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="h6">{query.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            {/* Inline status update */}
                            <Select
                                size="small"
                                value={query.status}
                                disabled={statusUpdating}
                                onChange={(e) => handleStatusUpdate(e.target.value as ApiQueryStatus)}
                                sx={{
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: STATUS_COLOR_MAP[query.status] ?? 'inherit',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: STATUS_COLOR_MAP[query.status] ?? 'inherit',
                                    },
                                    minWidth: 140,
                                }}
                            >
                                {INLINE_STATUS_OPTIONS.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </Select>
                        </Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow label="Name" value={query.name} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow label="Email" value={query.email} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow label="Phone" value={query.phone} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow
                                label="Submitted On"
                                value={query.createdAt ? new Date(query.createdAt).toLocaleString() : undefined}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <DetailRow label="Description" value={query.description} />
                        </Grid>
                        {/* <Grid size={{ xs: 12 }}>
                            <DetailRow label="Remarks" value={query.remarks} />
                        </Grid> */}
                    </Grid>


                </Paper>
            </Box>


        </ProtectedRoute>
    );
};

export default QueryDetailPage;
