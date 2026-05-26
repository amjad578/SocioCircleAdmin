import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthContext';
import {
    apiGetBrandDetails,
    apiApproveBrand,
    apiRejectBrand,
    apiUpdateBrandAccountStatus,
    type ApiBrandDetails,
    type ApiBrandApprovalStatus,
    type ApiBrandAccountStatus,
} from '@/lib/api';

const APPROVAL_STATUS_COLOR: Record<ApiBrandApprovalStatus, 'warning' | 'success' | 'error'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
};

const ACCOUNT_STATUS_COLOR: Record<ApiBrandAccountStatus, 'success' | 'default' | 'error'> = {
    active: 'success',
    inactive: 'default',
    delete: 'error',
};

const ACCOUNT_STATUS_OPTIONS: { value: ApiBrandAccountStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'delete', label: 'Delete' },
];

const DetailRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <Box sx={{ mb: 2, minWidth: 0, overflow: 'hidden' }}>
        <Typography variant="body2" color="text.secondary">
            {label}
        </Typography>
        <Typography component="div" sx={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {value ?? '—'}
        </Typography>
    </Box>
);

type ApprovalActionType = 'approve' | 'reject';

const BrandDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { permissions } = useAuth();
    const canEdit = permissions.includes('brands:edit');

    const [details, setDetails] = React.useState<ApiBrandDetails | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [approvalAction, setApprovalAction] = React.useState<ApprovalActionType | null>(null);
    const [accountAction, setAccountAction] = React.useState<ApiBrandAccountStatus | null>(null);
    const [actionRemarks, setActionRemarks] = React.useState('');
    const [actionLoading, setActionLoading] = React.useState(false);

    const load = React.useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await apiGetBrandDetails(id);
            setDetails(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load brand';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    React.useEffect(() => {
        void load();
    }, [load]);

    const handleOpenApproval = (type: ApprovalActionType) => {
        setApprovalAction(type);
        setAccountAction(null);
        setActionRemarks('');
    };

    const handleOpenAccountStatus = (status: ApiBrandAccountStatus) => {
        setAccountAction(status);
        setApprovalAction(null);
        setActionRemarks('');
    };

    const handleCloseDialog = () => {
        if (!actionLoading) {
            setApprovalAction(null);
            setAccountAction(null);
            setActionRemarks('');
        }
    };

    const handleConfirmApproval = async () => {
        if (!id || !approvalAction) return;
        setActionLoading(true);
        setError(null);
        try {
            await (approvalAction === 'approve'
                ? apiApproveBrand(id, actionRemarks)
                : apiRejectBrand(id, actionRemarks));
            const refreshed = await apiGetBrandDetails(id);
            setDetails(refreshed);
            handleCloseDialog();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmAccountStatus = async () => {
        if (!id || !accountAction) return;
        setActionLoading(true);
        setError(null);
        try {
            await apiUpdateBrandAccountStatus(id, accountAction, actionRemarks);
            if (accountAction === 'delete') {
                navigate('/brands');
                return;
            }
            const refreshed = await apiGetBrandDetails(id);
            setDetails(refreshed);
            handleCloseDialog();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update account status');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute requiredPermissions={['brands:view']}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            </ProtectedRoute>
        );
    }

    if (!details) {
        return (
            <ProtectedRoute requiredPermissions={['brands:view']}>
                <Alert severity="error">{error ?? 'Brand not found'}</Alert>
            </ProtectedRoute>
        );
    }

    const { brand, profile, remarks: adminRemarks } = details;
    const canApprove = brand.status === 'pending';
    const canReject = brand.status === 'pending';
    const location = [brand.city, brand.state, brand.country].filter(Boolean).join(', ');
    const accountStatus = brand.accountStatus ?? 'active';

    const dialogOpen = Boolean(approvalAction || accountAction);
    const dialogTitle = approvalAction
        ? approvalAction === 'approve'
            ? 'Approve Brand'
            : 'Reject Brand'
        : accountAction
          ? `Set Account ${ACCOUNT_STATUS_OPTIONS.find((o) => o.value === accountAction)?.label ?? accountAction}`
          : '';

    const dialogMessage = approvalAction
        ? approvalAction === 'approve'
            ? `Are you sure you want to approve "${brand.companyName}"?`
            : `Are you sure you want to reject "${brand.companyName}"?`
        : accountAction === 'delete'
          ? `Delete "${brand.companyName}"? It will be removed from all brand lists.`
          : `Change account status of "${brand.companyName}" to ${accountAction}?`;

    return (
        <ProtectedRoute requiredPermissions={['brands:view']}>
            <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate('/brands')} sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5">Brand Details</Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <Paper sx={{ p: 3, mb: 3, overflow: 'hidden' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Avatar
                                src={profile?.companyLogo || undefined}
                                alt={brand.companyName}
                                variant="rounded"
                                sx={{ width: 72, height: 72 }}
                            >
                                {brand.companyName?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="h6">{brand.companyName}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {brand.ownerName} · {brand.email}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                                label={`Approval: ${brand.status}`}
                                color={APPROVAL_STATUS_COLOR[brand.status]}
                                sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                            />
                            <Chip
                                label={`Account: ${accountStatus}`}
                                color={ACCOUNT_STATUS_COLOR[accountStatus]}
                                sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                            />
                        </Box>
                    </Box>

                    {canEdit && (
                        <>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Approval Actions
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                {canApprove && (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<CheckCircleIcon />}
                                        onClick={() => handleOpenApproval('approve')}
                                    >
                                        Approve Brand
                                    </Button>
                                )}
                                {canReject && (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<CancelIcon />}
                                        onClick={() => handleOpenApproval('reject')}
                                    >
                                        Reject Brand
                                    </Button>
                                )}
                                {!canApprove && !canReject && (
                                    <Typography variant="body2" color="text.secondary">
                                        Approval is final — use account status below to manage access.
                                    </Typography>
                                )}
                            </Box>

                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Account Status
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                {ACCOUNT_STATUS_OPTIONS.map((opt) => (
                                    <Button
                                        key={opt.value}
                                        variant={accountStatus === opt.value ? 'contained' : 'outlined'}
                                        color={
                                            opt.value === 'delete'
                                                ? 'error'
                                                : opt.value === 'active'
                                                  ? 'success'
                                                  : 'inherit'
                                        }
                                        size="small"
                                        disabled={accountStatus === opt.value}
                                        onClick={() => handleOpenAccountStatus(opt.value)}
                                    >
                                        {opt.label}
                                    </Button>
                                ))}
                            </Box>
                        </>
                    )}

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <DetailRow
                                label="Company Description"
                                value={profile?.companyDescription || '—'}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow
                                label="Website"
                                value={
                                    profile?.websiteUrl ? (
                                        <Link href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
                                            {profile.websiteUrl}
                                        </Link>
                                    ) : (
                                        '—'
                                    )
                                }
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow label="GST Number" value={profile?.gstNumber || '—'} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow label="Address" value={profile?.address || location || '—'} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow label="Company Size" value="—" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow
                                label="Established Year"
                                value={profile?.establishedYear ? String(profile.establishedYear) : '—'}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow label="Mobile" value={brand.mobile} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <DetailRow
                                label="Social Media Links"
                                value={
                                    profile?.socialLinks?.instagram ? (
                                        <Link
                                            href={
                                                profile.socialLinks.instagram.startsWith('http')
                                                    ? profile.socialLinks.instagram
                                                    : `https://instagram.com/${profile.socialLinks.instagram.replace('@', '')}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Instagram: {profile.socialLinks.instagram}
                                        </Link>
                                    ) : (
                                        '—'
                                    )
                                }
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow
                                label="Approval Status"
                                value={
                                    <Chip
                                        label={brand.status}
                                        size="small"
                                        color={APPROVAL_STATUS_COLOR[brand.status]}
                                        sx={{ textTransform: 'capitalize' }}
                                    />
                                }
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow
                                label="Account Status"
                                value={
                                    <Chip
                                        label={accountStatus}
                                        size="small"
                                        color={ACCOUNT_STATUS_COLOR[accountStatus]}
                                        sx={{ textTransform: 'capitalize' }}
                                    />
                                }
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow
                                label="Registered On"
                                value={
                                    brand.createdAt
                                        ? new Date(brand.createdAt).toLocaleString()
                                        : '—'
                                }
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Paper sx={{ p: 3, overflow: 'hidden' }}>
                    <Typography variant="h6" gutterBottom>
                        Admin Remarks
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {adminRemarks.length === 0 ? (
                        <Typography color="text.secondary">No remarks yet.</Typography>
                    ) : (
                        <List disablePadding>
                            {adminRemarks.map((r) => (
                                <ListItem
                                    key={r._id}
                                    disableGutters
                                    sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1 }}
                                >
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                                        <Chip
                                            label={r.status}
                                            size="small"
                                            color={APPROVAL_STATUS_COLOR[r.status]}
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                                        </Typography>
                                    </Box>
                                    <ListItemText primary={r.remark} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Paper>

                <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2 }}>{dialogMessage}</DialogContentText>
                        <TextField
                            label="Remarks"
                            placeholder="Add optional remarks for this action…"
                            multiline
                            minRows={3}
                            fullWidth
                            value={actionRemarks}
                            onChange={(e) => setActionRemarks(e.target.value)}
                            disabled={actionLoading}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} disabled={actionLoading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={
                                approvalAction ? handleConfirmApproval : handleConfirmAccountStatus
                            }
                            variant="contained"
                            color={
                                approvalAction === 'reject' || accountAction === 'delete'
                                    ? 'error'
                                    : 'success'
                            }
                            disabled={actionLoading}
                        >
                            {actionLoading ? 'Processing…' : 'Confirm'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </ProtectedRoute>
    );
};

export default BrandDetailPage;
