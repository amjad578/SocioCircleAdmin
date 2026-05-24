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
import AddIcon from '@mui/icons-material/Add';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiListBoxMaterials, type ApiBoxMaterial } from '@/lib/api';

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'delete', label: 'Deleted' },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return 'success';
        case 'inactive': return 'default';
        case 'delete': return 'error';
        default: return 'default';
    }
};

const MaterialsListPage: React.FC = () => {
    const [items, setItems] = React.useState<ApiBoxMaterial[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [total, setTotal] = React.useState(0);
    const navigate = useNavigate();

    const load = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiListBoxMaterials({
                search: search || undefined,
                status: statusFilter || undefined,
                page: page + 1,
                limit: rowsPerPage,
            });
            setItems(result.data);
            setTotal(result.total);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load materials');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, page, rowsPerPage]);

    React.useEffect(() => {
        void load();
    }, [load]);

    return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">Box Materials</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/materials/new">
                        Add Material
                    </Button>
                </Box>

                {/* Search + Filter */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Search by name…"
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
                                    <TableCell>Name</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.map((mat) => (
                                    <TableRow key={mat._id} hover>
                                        <TableCell>{mat.name}</TableCell>
                                        <TableCell>{mat.description}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={mat.status.charAt(0).toUpperCase() + mat.status.slice(1)}
                                                color={getStatusColor(mat.status) as any}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => navigate(`/materials/${mat._id}`)}>
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => navigate(`/materials/${mat._id}/edit`)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {items.length === 0 && (
                                    <TableRow><TableCell colSpan={4} align="center">No materials found.</TableCell></TableRow>
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
            </Box>
        </ProtectedRoute>
    );
};

export default MaterialsListPage;
