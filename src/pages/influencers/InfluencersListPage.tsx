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
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
    apiListPlatformInfluencers,
    apiListPlatformInfluencersInReview,
    apiListVerifiedPlatformInfluencers,
    apiListRejectedPlatformInfluencers,
    apiListSuspendedPlatformInfluencers,
    type ApiPlatformInfluencerListItem,
    type ApiPlatformInfluencerListParams,
    type ApiPlatformInfluencerSortField,
    type ApiPlatformInfluencerStatus,
} from '@/lib/api';
import {
    formatFollowers,
    formatInfluencerStatus,
    INFLUENCER_STATUS_LABELS,
} from '@/src/utils/influencerFormat';

export type InfluencerListMode = 'all' | 'review' | 'verified' | 'rejected' | 'suspended';

const PAGE_CONFIG: Record<InfluencerListMode, { title: string; showStatusFilter: boolean }> = {
    all: { title: 'All Influencers', showStatusFilter: true },
    review: { title: 'Influencers In Review', showStatusFilter: false },
    verified: { title: 'Verified Influencers', showStatusFilter: false },
    rejected: { title: 'Rejected Influencers', showStatusFilter: false },
    suspended: { title: 'Suspended Influencers', showStatusFilter: false },
};

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
    { value: '', label: 'All Statuses' },
    ...(Object.entries(INFLUENCER_STATUS_LABELS) as [ApiPlatformInfluencerStatus, string][]).map(
        ([value, label]) => ({ value, label })
    ),
];

const STATUS_COLOR: Record<
    ApiPlatformInfluencerStatus,
    'default' | 'info' | 'warning' | 'success' | 'error'
> = {
    PROFILE_PENDING: 'default',
    INSTAGRAM_CONNECTED: 'info',
    ADMIN_REVIEW_PENDING: 'warning',
    VERIFIED: 'success',
    REJECTED: 'error',
    SUSPENDED: 'error',
};

type SortableField = ApiPlatformInfluencerSortField;

const SORT_OPTIONS: { value: SortableField; label: string }[] = [
    { value: 'createdAt', label: 'Joined Date' },
    { value: 'fullName', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'status', label: 'Status' },
    { value: 'followers', label: 'Followers' },
    { value: 'verifiedAt', label: 'Verified Date' },
];

const fetchByMode = {
    all: apiListPlatformInfluencers,
    review: apiListPlatformInfluencersInReview,
    verified: apiListVerifiedPlatformInfluencers,
    rejected: apiListRejectedPlatformInfluencers,
    suspended: apiListSuspendedPlatformInfluencers,
};

type InfluencersListPageProps = {
    mode: InfluencerListMode;
};

const InfluencersListPage: React.FC<InfluencersListPageProps> = ({ mode }) => {
    const navigate = useNavigate();
    const config = PAGE_CONFIG[mode];

    const [items, setItems] = React.useState<ApiPlatformInfluencerListItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('');
    const [sortBy, setSortBy] = React.useState<SortableField>('createdAt');
    const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [total, setTotal] = React.useState(0);

    const load = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params: ApiPlatformInfluencerListParams = {
                search: search || undefined,
                page: page + 1,
                limit: rowsPerPage,
                sortBy,
                sortOrder,
            };
            if (config.showStatusFilter && statusFilter) {
                params.status = statusFilter as ApiPlatformInfluencerStatus;
            }
            const result = await fetchByMode[mode](params);
            setItems(result.data);
            setTotal(result.total);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load influencers';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [mode, search, statusFilter, sortBy, sortOrder, page, rowsPerPage, config.showStatusFilter]);

    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            void load();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [load]);

    const formatDate = (value?: string) =>
        value ? new Date(value).toLocaleDateString() : '—';

    const tableCell = { px: 1.5, py: 1.25 } as const;
    const ellipsis = {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    } as const;

    const col = {
        avatar: { ...tableCell, width: 52, minWidth: 52, maxWidth: 52, px: 1 },
        name: { ...tableCell, ...ellipsis, minWidth: 130, width: '16%' },
        email: { ...tableCell, ...ellipsis, minWidth: 180, width: '24%' },
        instagram: { ...tableCell, ...ellipsis, minWidth: 100, width: '14%' },
        followers: { ...tableCell, minWidth: 72, width: '8%', whiteSpace: 'nowrap' as const },
        status: { ...tableCell, minWidth: 130, width: '14%' },
        joined: { ...tableCell, minWidth: 92, width: '10%', whiteSpace: 'nowrap' as const },
        action: { ...tableCell, width: 56, minWidth: 56, maxWidth: 56, px: 0.5 },
    };

    return (
        <ProtectedRoute requiredPermissions={['influencers:view']}>
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
                        placeholder="Search name, email, mobile…"
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
                            label="Status"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(0);
                            }}
                            sx={{ flex: '0 1 180px', minWidth: 0 }}
                        >
                            {STATUS_FILTER_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
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
                        <TableContainer
                            component={Paper}
                            variant="outlined"
                            sx={{ width: '100%', overflow: 'hidden' }}
                        >
                            <Table size="small" sx={{ tableLayout: 'auto', width: '100%' }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={col.avatar} />
                                        <TableCell sx={col.name}>Name</TableCell>
                                        <TableCell sx={col.email}>Email</TableCell>
                                        <TableCell sx={col.instagram}>Instagram</TableCell>
                                        <TableCell sx={col.followers} align="right">
                                            Followers
                                        </TableCell>
                                        <TableCell sx={col.status} align="center">
                                            Status
                                        </TableCell>
                                        <TableCell sx={col.joined}>Joined</TableCell>
                                        <TableCell sx={col.action} align="center">
                                            Action
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow key={item.influencerId} hover>
                                            <TableCell sx={col.avatar}>
                                                <Avatar
                                                    src={item.profileImage || undefined}
                                                    alt={item.fullName}
                                                    sx={{ width: 36, height: 36 }}
                                                >
                                                    {item.fullName?.charAt(0)?.toUpperCase()}
                                                </Avatar>
                                            </TableCell>
                                            <TableCell sx={col.name} title={item.fullName}>
                                                {item.fullName}
                                            </TableCell>
                                            <TableCell sx={col.email} title={item.email}>
                                                {item.email}
                                            </TableCell>
                                            <TableCell
                                                sx={col.instagram}
                                                title={
                                                    item.instagramHandle
                                                        ? `@${item.instagramHandle}`
                                                        : undefined
                                                }
                                            >
                                                {item.instagramHandle
                                                    ? `@${item.instagramHandle}`
                                                    : '—'}
                                            </TableCell>
                                            <TableCell align="right" sx={col.followers}>
                                                {item.followers > 0 ? (
                                                    <Tooltip
                                                        title={item.followers.toLocaleString()}
                                                    >
                                                        <span>{formatFollowers(item.followers)}</span>
                                                    </Tooltip>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>
                                            <TableCell align="center" sx={col.status}>
                                                <Chip
                                                    label={formatInfluencerStatus(item.status)}
                                                    size="small"
                                                    color={STATUS_COLOR[item.status]}
                                                    sx={{ maxWidth: '100%' }}
                                                />
                                            </TableCell>
                                            <TableCell sx={col.joined}>
                                                {formatDate(item.createdAt)}
                                            </TableCell>
                                            <TableCell align="center" sx={col.action}>
                                                <Tooltip title="View details">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() =>
                                                            navigate(
                                                                `/influencers/${item.influencerId}`
                                                            )
                                                        }
                                                        aria-label="View influencer details"
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
                                                No influencers found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            component="div"
                            count={total}
                            sx={{
                                overflow: 'hidden',
                                '.MuiTablePagination-toolbar': { flexWrap: 'wrap' },
                            }}
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

export default InfluencersListPage;
