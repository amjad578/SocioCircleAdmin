import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiListQueries, apiDeleteQuery, apiUpdateQuery, type ApiQuery, type ApiQueryStatus } from '@/lib/api';

const FILTER_STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
];

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


// ─── Main list page ───────────────────────────────────────────────────────────
const QueriesListPage: React.FC = () => {
    const navigate = useNavigate();
    const [items, setItems] = React.useState<ApiQuery[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [total, setTotal] = React.useState(0);
    const [deleteId, setDeleteId] = React.useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = React.useState(false);
    const [updatingId, setUpdatingId] = React.useState<string | null>(null);


    const load = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiListQueries({
                search: search || undefined,
                status: statusFilter || undefined,
                page: page + 1,
                limit: rowsPerPage,
            });
            setItems(result.data);
            setTotal(result.total);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load queries');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, page, rowsPerPage]);

    React.useEffect(() => {
        void load();
    }, [load]);

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await apiDeleteQuery(deleteId);
            setDeleteId(null);
            void load();
        } catch (err: any) {
            setError(err?.message ?? 'Failed to delete query');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: ApiQueryStatus) => {
        setUpdatingId(id);
        setError(null);
        try {
            await apiUpdateQuery(id, { status: newStatus });
            setItems((prev) => prev.map((q) => q._id === id ? { ...q, status: newStatus } : q));
        } catch (err: any) {
            setError(err?.message ?? 'Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5">Query Management</Typography>
                </Box>

                {/* Filters */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Search by name, email, phone…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                            }
                        }}
                        sx={{ minWidth: 300 }}
                    />
                    <TextField
                        select
                        size="small"
                        label="Status"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                        sx={{ minWidth: 160 }}
                    >
                        {FILTER_STATUS_OPTIONS.map((opt) => (
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
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Phone</TableCell>

                                    <TableCell>Status</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.map((q) => {
                                    return (
                                        <TableRow key={q._id} hover>
                                            <TableCell>{q.name}</TableCell>
                                            <TableCell>{q.email}</TableCell>
                                            <TableCell>{q.phone}</TableCell>


                                            <TableCell sx={{ minWidth: 150 }}>
                                                <Select
                                                    size="small"
                                                    value={q.status}
                                                    disabled={updatingId === q._id}
                                                    onChange={(e) => handleStatusUpdate(q._id, e.target.value as ApiQueryStatus)}
                                                    sx={{
                                                        fontSize: '0.8rem',
                                                        color: STATUS_COLOR_MAP[q.status] ?? 'inherit',
                                                        fontWeight: 600,
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: STATUS_COLOR_MAP[q.status] ?? 'inherit',
                                                        },
                                                        minWidth: 130,
                                                    }}
                                                >
                                                    {INLINE_STATUS_OPTIONS.map((opt) => (
                                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                    ))}
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '—'}
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => navigate(`/queries/${q._id}`)}>
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => setDeleteId(q._id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">No queries found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination
                            component="div"
                            count={total}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                        />
                    </>
                )}

                {/* Delete Confirmation Dialog */}
                <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
                    <DialogTitle>Delete Query</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this query? This action will mark it as deleted.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteId(null)} disabled={deleteLoading}>Cancel</Button>
                        <Button onClick={handleDelete} color="error" variant="contained" disabled={deleteLoading}>
                            {deleteLoading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogActions>
                </Dialog>


            </Box>
        </ProtectedRoute>
    );
};

export default QueriesListPage;
