import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
    apiGetBoxAdminDetails,
    ApiBoxAdminDetails
} from '@/lib/api';

const BoxDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [details, setDetails] = React.useState<ApiBoxAdminDetails | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const load = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await apiGetBoxAdminDetails(id);
                setDetails(data);
            } catch (err: any) {
                setError(err?.message ?? 'Failed to load box details');
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [id]);

    if (loading) {
        return (
            <ProtectedRoute requiredPermissions={['boxes:view']}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                    <CircularProgress />
                </Box>
            </ProtectedRoute>
        );
    }

    if (error || !details) {
        return (
            <ProtectedRoute requiredPermissions={['boxes:view']}>
                <Alert severity="error">{error ?? 'Box not found'}</Alert>
            </ProtectedRoute>
        );
    }

    const { box, images, variants, accordions } = details;
    const categoryName = typeof box.categoryId === 'string' ? box.categoryId : box.categoryId?.name;
    const typeName = typeof box.typeId === 'string' ? box.typeId : box.typeId?.name;
    const materialName = typeof box.materialId === 'string' ? box.materialId : box.materialId?.name;

    return (
        <ProtectedRoute requiredPermissions={['boxes:view']}>
            <Box>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={() => navigate('/boxes')} sx={{ mr: 1 }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h5">{box.name}</Typography>
                    </Box>
                    <ProtectedRoute requiredPermissions={['boxes:edit']}>
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={() => navigate(`/boxes/${id}/edit`)}
                        >
                            Edit Box
                        </Button>
                    </ProtectedRoute>
                </Box>

                <Grid container spacing={3}>
                    {/* Left: Core Details */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
                                Core Details
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" color="text.secondary">Name</Typography>
                                    <Typography sx={{ mb: 1 }}>{box.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">Slug</Typography>
                                    <Typography sx={{ mb: 1 }}>{box.slug}</Typography>
                                    <Typography variant="body2" color="text.secondary">Category</Typography>
                                    <Typography sx={{ mb: 1 }}>{categoryName ?? '—'}</Typography>
                                    <Typography variant="body2" color="text.secondary">Box Type</Typography>
                                    <Typography sx={{ mb: 1 }}>{typeName ?? '—'}</Typography>
                                    <Typography variant="body2" color="text.secondary">Material</Typography>
                                    <Typography sx={{ mb: 1 }}>{materialName ?? '—'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" color="text.secondary">Short Description</Typography>
                                    <Typography sx={{ mb: 1 }}>{box.shortDescription}</Typography>
                                    <Typography variant="body2" color="text.secondary">Long Description</Typography>
                                    <Typography sx={{ mb: 1 }}>{box.longDescription || '—'}</Typography>
                                    <Typography variant="body2" color="text.secondary">Status</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, mb: 1, flexWrap: 'wrap' }}>
                                        <Chip
                                            label={box.isActive ? 'Active' : 'Inactive'}
                                            color={box.isActive ? 'success' : 'default'}
                                            size="small"
                                        />
                                        {box.ecoFriendly && <Chip label="Eco Friendly" size="small" color="success" variant="outlined" />}
                                        {box.minimalWastage && <Chip label="Minimal Wastage" size="small" color="info" variant="outlined" />}
                                    </Box>
                                </Grid>
                            </Grid>
                            {box.sheetOptimization && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="body2" color="text.secondary">Sheet Optimization</Typography>
                                    <Typography variant="body2">
                                        Size: {box.sheetOptimization.sheetSize} &nbsp;|&nbsp;
                                        Boxes/sheet: {box.sheetOptimization.boxesPerSheet} &nbsp;|&nbsp;
                                        Wastage: {box.sheetOptimization.wastagePercent}%
                                    </Typography>
                                </>
                            )}
                        </Paper>

                        {/* Variants */}
                        {variants.length > 0 && (
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
                                    Variants ({variants.length})
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>SKU</TableCell>
                                            <TableCell>Label</TableCell>
                                            <TableCell>GSM</TableCell>
                                            <TableCell>Base Price</TableCell>
                                            <TableCell>MOQ</TableCell>
                                            <TableCell>Active</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {variants.map((v) => (
                                            <TableRow key={v._id}>
                                                <TableCell>{v.sku}</TableCell>
                                                <TableCell>{v.dimension?.label} ({v.dimension?.length}×{v.dimension?.width}×{v.dimension?.height})</TableCell>
                                                <TableCell>{v.gsm}</TableCell>
                                                <TableCell>₹{v.basePrice}</TableCell>
                                                <TableCell>{v.moq}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={v.isActive ? 'Yes' : 'No'}
                                                        color={v.isActive ? 'success' : 'default'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Paper>
                        )}

                        {/* Accordions */}
                        {accordions.length > 0 && (
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
                                    Accordions ({accordions.length})
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                {accordions.map((acc) => (
                                    <Box key={acc._id} sx={{ mb: 2 }}>
                                        <Typography sx={{ fontWeight: 500 }}>{acc.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">{acc.description}</Typography>
                                    </Box>
                                ))}
                            </Paper>
                        )}
                    </Grid>

                    {/* Right: Media */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
                                Box Media ({images.length})
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            {images.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No media uploaded.
                                </Typography>
                            ) : (
                                <Grid container spacing={1}>
                                    {images.map((img) => (
                                        <Grid size={{ xs: 6 }} key={img._id}>
                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    paddingTop: '75%',
                                                    borderRadius: 1,
                                                    overflow: 'hidden',
                                                    border: 1,
                                                    borderColor: 'divider',
                                                    bgcolor: '#000'
                                                }}
                                            >
                                                {img.mediaType === 'video' ? (
                                                    <video
                                                        src={img.imageUrl}
                                                        controls
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'contain'
                                                        }}
                                                    />
                                                ) : (
                                                    <img
                                                        src={img.imageUrl}
                                                        alt={`Box media`}
                                                        style={{
                                                            objectFit: 'cover',
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%'
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </ProtectedRoute>
    );
};

export default BoxDetailPage;

