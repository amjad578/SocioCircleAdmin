import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiListBanners, apiDeleteBanner, type ApiBanner } from '@/lib/api';

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'delete', label: 'Deleted' },
];

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

const BannersListPage: React.FC = () => {
    const [items, setItems] = React.useState<ApiBanner[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [total, setTotal] = React.useState(0);
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

    // ── delete confirmation state ─────────────────────────────────────────────
    const [deleteTarget, setDeleteTarget] = React.useState<ApiBanner | null>(null);
    const [deleteLoading, setDeleteLoading] = React.useState(false);
    const [deleteError, setDeleteError] = React.useState<string | null>(null);

    const navigate = useNavigate();

    const load = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiListBanners({
                search: search || undefined,
                status: statusFilter || undefined,
                page: page + 1,
                limit: rowsPerPage,
            });
            setItems(result.data);
            setTotal(result.total);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load banners');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, page, rowsPerPage]);

    React.useEffect(() => {
        void load();
    }, [load]);

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        setDeleteError(null);
        try {
            await apiDeleteBanner(deleteTarget._id);
            setDeleteTarget(null);
            void load();
        } catch (err: any) {
            setDeleteError(err?.message ?? 'Failed to delete banner');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">Banners</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/banners/new">
                        Add Banner
                    </Button>
                </Box>

                {/* Search + Filter */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Search by title…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                            }
                        }}
                        sx={{ minWidth: 260 }}
                    />
                    <TextField
                        select size="small" label="Status" value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                        sx={{ minWidth: 160 }}
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                    </TextField>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
                ) : (
                    <>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Image</TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Redirect Type</TableCell>
                                    <TableCell>Position</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.map((banner) => (
                                    <TableRow key={banner._id} hover>
                                        <TableCell>
                                            <Avatar src={banner.image} alt={banner.title} variant="rounded"
                                                sx={{ cursor: banner.image ? 'pointer' : 'default' }}
                                                onClick={() => banner.image && setSelectedImage(banner.image)} />
                                        </TableCell>
                                        <TableCell>{banner.title}</TableCell>
                                        <TableCell>
                                            <Chip label={REDIRECT_LABELS[banner.redirectType] ?? banner.redirectType} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>{banner.position}</TableCell>
                                        <TableCell>
                                            <Chip label={banner.status.charAt(0).toUpperCase() + banner.status.slice(1)}
                                                color={getStatusColor(banner.status) as any} size="small" />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="View">
                                                <IconButton size="small" onClick={() => navigate(`/banners/${banner._id}`)}>
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => navigate(`/banners/${banner._id}/edit`)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => { setDeleteError(null); setDeleteTarget(banner); }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {items.length === 0 && (
                                    <TableRow><TableCell colSpan={6} align="center">No banners found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination
                            component="div"
                            count={total}
                            page={page}
                            onPageChange={(_, p) => setPage(p)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                        />
                    </>
                )}

                {/* ── Image preview dialog ─────────────────────────────────── */}
                <Dialog open={Boolean(selectedImage)} onClose={() => setSelectedImage(null)} maxWidth="md">
                    <Box sx={{ position: 'relative' }}>
                        <IconButton onClick={() => setSelectedImage(null)}
                            sx={{ position: 'absolute', right: 8, top: 8, color: 'white', bgcolor: 'rgba(0,0,0,0.4)', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}>
                            <CloseIcon />
                        </IconButton>
                        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 300, minHeight: 300, bgcolor: 'background.paper' }}>
                            {selectedImage && <img src={selectedImage} alt="Banner" style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block' }} />}
                        </DialogContent>
                    </Box>
                </Dialog>

                {/* ── Delete confirmation dialog ───────────────────────────── */}
                <Dialog
                    open={Boolean(deleteTarget)}
                    onClose={() => !deleteLoading && setDeleteTarget(null)}
                    maxWidth="xs"
                    fullWidth
                >
                    <DialogTitle>Delete Banner</DialogTitle>
                    <DialogContent>
                        {deleteError && <Alert severity="error" sx={{ mb: 1.5 }}>{deleteError}</Alert>}
                        <Typography>
                            Are you sure you want to delete{' '}
                            <strong>"{deleteTarget?.title}"</strong>?
                            <br />
                            <Typography component="span" variant="body2" color="text.secondary">
                                This is a soft delete — the record will be marked as deleted.
                            </Typography>
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button
                            variant="outlined"
                            color="inherit"
                            disabled={deleteLoading}
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            disabled={deleteLoading}
                            onClick={handleDeleteConfirm}
                            startIcon={deleteLoading ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                        >
                            {deleteLoading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </ProtectedRoute>
    );
};

export default BannersListPage;
