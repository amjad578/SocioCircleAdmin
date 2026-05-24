import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    TextField,
    MenuItem,
    Chip,
    TablePagination,
    IconButton,
    Tooltip,
    Switch,
    Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ApiBox, apiListBoxes, apiUpdateBox } from '@/lib/api';

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];

const BoxesListPage: React.FC = () => {
    const [allItems, setAllItems] = React.useState<ApiBox[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [togglingId, setTogglingId] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [total, setTotal] = React.useState(0);
    const navigate = useNavigate();

    const loadData = React.useCallback(async () => {
        setLoading(true);
        try {
            const result = await apiListBoxes({
                search,
                status: statusFilter,
                page: page + 1,
                limit: rowsPerPage
            });
            setAllItems(result.data);
            setTotal(result.total);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, page, rowsPerPage]);

    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            void loadData();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [loadData]);

    const handleToggleActive = async (box: ApiBox) => {
        setTogglingId(box._id);
        try {
            const updated = await apiUpdateBox(box._id, { isActive: !box.isActive });
            setAllItems((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <ProtectedRoute requiredPermissions={['boxes:view']}>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">Shop Boxes</Typography>
                    <ProtectedRoute requiredPermissions={['boxes:create']}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/boxes/new')}
                        >
                            Add New Box
                        </Button>
                    </ProtectedRoute>
                </Box>

                <Paper sx={{ mb: 3, p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="Search boxes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                            }
                        }}
                        sx={{ minWidth: 300 }}
                    />
                    <TextField
                        select
                        size="small"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{ minWidth: 150 }}
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Paper>

                <Paper>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Slug</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Box Type</TableCell>
                                <TableCell>Material</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {!loading &&
                                allItems.map((box) => (
                                    <TableRow key={box._id} hover>
                                        <TableCell>{box.name}</TableCell>
                                        <TableCell>{box.slug}</TableCell>
                                        <TableCell>{typeof box.categoryId === 'string' ? box.categoryId : box.categoryId?.name}</TableCell>
                                        <TableCell>{typeof box.typeId === 'string' ? box.typeId : box.typeId?.name}</TableCell>
                                        <TableCell>{typeof box.materialId === 'string' ? box.materialId : box.materialId?.name}</TableCell>
                                        <TableCell>{box.shortDescription}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={box.isActive ? 'Active' : 'Inactive'}
                                                color={box.isActive ? 'success' : 'default'}
                                                size="small"
                                                sx={{ mr: 1 }}
                                            />
                                            <Tooltip title="Activate / Deactivate">
                                                <span>
                                                    <Switch
                                                        size="small"
                                                        checked={box.isActive}
                                                        onChange={() => handleToggleActive(box)}
                                                        disabled={togglingId === box._id}
                                                    />
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Edit box">
                                                <IconButton onClick={() => navigate(`/boxes/${box._id}/edit`)} size="small">
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {!loading && allItems.length === 0 && (
                                <TableRow><TableCell colSpan={8} align="center">No boxes found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={total}
                        page={page}
                        onPageChange={(_, p) => setPage(p)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </Paper>
            </Box>
        </ProtectedRoute>
    );
};

export default BoxesListPage;
