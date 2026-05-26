import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableSortLabel from '@mui/material/TableSortLabel';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Chip from '@mui/material/Chip';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
    apiListAllBrands,
    apiListPendingBrands,
    apiListApprovedBrands,
    apiListRejectedBrands,
    type ApiBrand,
    type ApiBrandListParams,
    type ApiBrandApprovalStatus,
    type ApiBrandAccountStatus,
} from '@/lib/api';

export type BrandListMode = 'all' | 'pending' | 'approved' | 'rejected';

type SortableField = NonNullable<ApiBrandListParams['sortBy']>;

const PAGE_CONFIG: Record<BrandListMode, { title: string; showStatusFilter: boolean }> = {
    all: { title: 'All Brands', showStatusFilter: true },
    pending: { title: 'Pending Brands', showStatusFilter: false },
    approved: { title: 'Approved Brands', showStatusFilter: false },
    rejected: { title: 'Rejected Brands', showStatusFilter: false },
};

const APPROVAL_FILTER_OPTIONS: { value: string; label: string }[] = [
    { value: '', label: 'All Approvals' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];

const SORT_OPTIONS: { value: SortableField; label: string }[] = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'companyName', label: 'Company' },
    { value: 'status', label: 'Status' },
    { value: 'approvedAt', label: 'Approved Date' },
    { value: 'rejectedAt', label: 'Rejected Date' },
];

const APPROVAL_COLOR: Record<ApiBrandApprovalStatus, 'warning' | 'success' | 'error'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
};

const ACCOUNT_COLOR: Record<ApiBrandAccountStatus, 'success' | 'default' | 'error'> = {
    active: 'success',
    inactive: 'default',
    delete: 'error',
};

const fetchByMode = {
    all: apiListAllBrands,
    pending: apiListPendingBrands,
    approved: apiListApprovedBrands,
    rejected: apiListRejectedBrands,
};

type BrandsListPageProps = {
    mode: BrandListMode;
};

const BrandsListPage: React.FC<BrandsListPageProps> = ({ mode }) => {
    const navigate = useNavigate();
    const config = PAGE_CONFIG[mode];

    const [items, setItems] = React.useState<ApiBrand[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('');
    const [accountFilter, setAccountFilter] = React.useState('');
    const [sortBy, setSortBy] = React.useState<SortableField>('createdAt');
    const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [total, setTotal] = React.useState(0);

    const load = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params: ApiBrandListParams = {
                search: search || undefined,
                page: page + 1,
                limit: rowsPerPage,
                sortBy,
                sortOrder,
            };
            if (config.showStatusFilter && statusFilter) {
                params.status = statusFilter as ApiBrandApprovalStatus;
            }
            if (accountFilter) {
                params.accountStatus = accountFilter as 'active' | 'inactive';
            }
            const result = await fetchByMode[mode](params);
            setItems(result.data);
            setTotal(result.total);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load brands';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [mode, search, statusFilter, accountFilter, sortBy, sortOrder, page, rowsPerPage, config.showStatusFilter]);

    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            void load();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [load]);

    const handleSort = (field: SortableField) => {
        if (sortBy === field) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        setPage(0);
    };

    const formatDate = (value?: string) =>
        value ? new Date(value).toLocaleDateString() : '—';

    const openWebsite = (url: string) => {
        const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
        window.open(href, '_blank', 'noopener,noreferrer');
    };

    const tableCell = { px: 2, py: 1.25 } as const;

    const cellEllipsis = {
        ...tableCell,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: 0,
    } as const;

    const statusCol = {
        ...tableCell,
        width: 108,
        minWidth: 108,
        maxWidth: 108,
    } as const;

    return (
        <ProtectedRoute requiredPermissions={['brands:view']}>
            <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden' }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5">{config.title}</Typography>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        gap: 2,
                        mb: 3,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: '100%',
                    }}
                >
                    <TextField
                        size="small"
                        placeholder="Search company, owner, email, mobile…"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(0);
                        }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{ flex: '1 1 180px', minWidth: 0, maxWidth: '100%' }}
                    />
                    {config.showStatusFilter && (
                        <TextField
                            select
                            size="small"
                            label="Approval"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(0);
                            }}
                            sx={{ flex: '0 1 140px', minWidth: 0 }}
                        >
                            {APPROVAL_FILTER_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                    <TextField
                        select
                        size="small"
                        label="Status"
                        value={accountFilter}
                        onChange={(e) => {
                            setAccountFilter(e.target.value);
                            setPage(0);
                        }}
                        sx={{ flex: '0 1 130px', minWidth: 0 }}
                    >
                        {STATUS_FILTER_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        size="small"
                        label="Sort by"
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value as SortableField);
                            setPage(0);
                        }}
                        sx={{ flex: '0 1 150px', minWidth: 0 }}
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        size="small"
                        label="Order"
                        value={sortOrder}
                        onChange={(e) => {
                            setSortOrder(e.target.value as 'asc' | 'desc');
                            setPage(0);
                        }}
                        sx={{ flex: '0 1 120px', minWidth: 0 }}
                    >
                        <MenuItem value="desc">Descending</MenuItem>
                        <MenuItem value="asc">Ascending</MenuItem>
                    </TextField>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TableContainer component={Paper} variant="outlined" sx={{ width: '100%', overflow: 'hidden' }}>
                        <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sortDirection={sortBy === 'companyName' ? sortOrder : false} sx={cellEllipsis}>
                                        <TableSortLabel
                                            active={sortBy === 'companyName'}
                                            direction={sortBy === 'companyName' ? sortOrder : 'asc'}
                                            onClick={() => handleSort('companyName')}
                                        >
                                            Company
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={cellEllipsis}>Email</TableCell>
                                    <TableCell sx={{ ...tableCell, width: 110 }}>Mobile</TableCell>
                                    <TableCell align="center" sx={{ ...tableCell, width: 72 }}>Website</TableCell>
                                    <TableCell align="center" sortDirection={sortBy === 'status' ? sortOrder : false} sx={statusCol}>
                                        <TableSortLabel
                                            active={sortBy === 'status'}
                                            direction={sortBy === 'status' ? sortOrder : 'asc'}
                                            onClick={() => handleSort('status')}
                                        >
                                            Approval
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell align="center" sx={statusCol}>
                                        Status
                                    </TableCell>
                                    <TableCell sortDirection={sortBy === 'createdAt' ? sortOrder : false} sx={{ ...tableCell, width: 110 }}>
                                        <TableSortLabel
                                            active={sortBy === 'createdAt'}
                                            direction={sortBy === 'createdAt' ? sortOrder : 'asc'}
                                            onClick={() => handleSort('createdAt')}
                                        >
                                            createdAt
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell align="center" sx={{ ...tableCell, width: 72 }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.map((brand) => (
                                    <TableRow key={brand._id} hover>
                                        <TableCell sx={cellEllipsis} title={brand.companyName}>
                                            {brand.companyName}
                                        </TableCell>
                                        <TableCell sx={cellEllipsis} title={brand.email}>
                                            {brand.email}
                                        </TableCell>
                                        <TableCell sx={{ ...tableCell, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {brand.mobile}
                                        </TableCell>
                                        <TableCell align="center" sx={{ ...tableCell, width: 72 }}>
                                            {brand.websiteUrl ? (
                                                <Tooltip title="Visit website">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openWebsite(brand.websiteUrl!);
                                                        }}
                                                        aria-label="Visit website"
                                                    >
                                                        <OpenInNewIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    —
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center" sx={statusCol}>
                                            <Chip
                                                label={brand.status}
                                                size="small"
                                                color={APPROVAL_COLOR[brand.status]}
                                                sx={{ textTransform: 'capitalize' }}
                                            />
                                        </TableCell>
                                        <TableCell align="center" sx={statusCol}>
                                            <Chip
                                                label={brand.accountStatus ?? 'active'}
                                                size="small"
                                                color={ACCOUNT_COLOR[brand.accountStatus ?? 'active']}
                                                sx={{ textTransform: 'capitalize' }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ ...tableCell, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {formatDate(brand.createdAt)}
                                        </TableCell>
                                        <TableCell align="center" sx={{ ...tableCell, width: 72 }}>
                                            <Tooltip title="View details">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => navigate(`/brands/${brand._id}`)}
                                                    aria-label="View brand details"
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            No brands found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        </TableContainer>
                        <TablePagination
                            component="div"
                            count={total}
                            sx={{ overflow: 'hidden', '.MuiTablePagination-toolbar': { flexWrap: 'wrap' } }}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                        />
                    </>
                )}
            </Box>
        </ProtectedRoute>
    );
};

export default BrandsListPage;
