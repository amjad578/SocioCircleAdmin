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
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthContext';
import {
    apiGetPlatformInfluencerDetails,
    apiApprovePlatformInfluencer,
    apiRejectPlatformInfluencer,
    apiSuspendPlatformInfluencer,
    type ApiPlatformInfluencerDetails,
    type ApiPlatformInfluencerStatus,
} from '@/lib/api';
import { formatCompactCount, formatInfluencerStatus } from '@/src/utils/influencerFormat';

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

type AdminActionType = 'approve' | 'reject' | 'suspend';

const InfluencerDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { permissions } = useAuth();
    const canEdit = permissions.includes('influencers:edit');

    const [details, setDetails] = React.useState<ApiPlatformInfluencerDetails | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [actionType, setActionType] = React.useState<AdminActionType | null>(null);
    const [actionReason, setActionReason] = React.useState('');
    const [actionLoading, setActionLoading] = React.useState(false);

    const load = React.useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await apiGetPlatformInfluencerDetails(id);
            setDetails(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load influencer';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    React.useEffect(() => {
        void load();
    }, [load]);

    const handleOpenAction = (type: AdminActionType) => {
        setActionType(type);
        setActionReason('');
    };

    const handleCloseDialog = () => {
        if (!actionLoading) {
            setActionType(null);
            setActionReason('');
        }
    };

    const handleConfirmAction = async () => {
        if (!id || !actionType) return;

        if ((actionType === 'reject' || actionType === 'suspend') && actionReason.trim().length < 3) {
            setError('Please provide a reason (at least 3 characters).');
            return;
        }

        setActionLoading(true);
        setError(null);
        try {
            const updated =
                actionType === 'approve'
                    ? await apiApprovePlatformInfluencer(id, actionReason)
                    : actionType === 'reject'
                      ? await apiRejectPlatformInfluencer(id, actionReason.trim())
                      : await apiSuspendPlatformInfluencer(id, actionReason.trim());
            setDetails(updated);
            handleCloseDialog();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute requiredPermissions={['influencers:view']}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            </ProtectedRoute>
        );
    }

    if (!details) {
        return (
            <ProtectedRoute requiredPermissions={['influencers:view']}>
                <Alert severity="error">{error ?? 'Influencer not found'}</Alert>
            </ProtectedRoute>
        );
    }

    const { profile, instagram, approvalReadiness, statusHistory, verificationLogs } = details;
    const location = [details.city, details.state, details.country].filter(Boolean).join(', ');
    const profileLocation = profile
        ? [profile.city, profile.state, profile.country].filter(Boolean).join(', ')
        : '';
    const avatarSrc =
        profile?.profilePhoto || instagram?.profilePicture || undefined;

    const canApprove = approvalReadiness.canApprove;
    const canReject = details.status === 'ADMIN_REVIEW_PENDING';
    const canSuspend = details.status === 'VERIFIED';

    const dialogOpen = Boolean(actionType);
    const dialogTitle =
        actionType === 'approve'
            ? 'Approve Influencer'
            : actionType === 'reject'
              ? 'Reject Influencer'
              : 'Suspend Influencer';

    const dialogMessage =
        actionType === 'approve'
            ? `Approve "${details.fullName}" and grant verified badge?`
            : actionType === 'reject'
              ? `Reject "${details.fullName}"? They can update their profile and reconnect Instagram to re-enter review.`
              : `Suspend "${details.fullName}"? They will lose marketplace visibility.`;

    const reasonRequired = actionType === 'reject' || actionType === 'suspend';

    return (
        <ProtectedRoute requiredPermissions={['influencers:view']}>
            <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate('/influencers')} sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5">Influencer Details</Typography>
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
                            <Avatar src={avatarSrc} alt={details.fullName} sx={{ width: 72, height: 72 }}>
                                {details.fullName?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="h6">{details.fullName}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {details.email} · {details.mobile}
                                </Typography>
                                {instagram?.instagramHandle && (
                                    <Link
                                        href={
                                            instagram.instagramProfileUrl ||
                                            `https://www.instagram.com/${instagram.instagramHandle}/`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="body2"
                                    >
                                        @{instagram.instagramHandle}
                                    </Link>
                                )}
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                                label={formatInfluencerStatus(details.status)}
                                color={STATUS_COLOR[details.status]}
                                sx={{ fontWeight: 600 }}
                            />
                            {details.verifiedBadge && (
                                <Chip label="Verified Badge" color="success" variant="outlined" />
                            )}
                        </Box>
                    </Box>

                    {approvalReadiness.missingRequirements.length > 0 && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Approval requirements
                            </Typography>
                            <List dense disablePadding>
                                {approvalReadiness.missingRequirements.map((req, idx) => (
                                    <ListItem key={idx} disableGutters sx={{ py: 0 }}>
                                        <ListItemText primary={`• ${req}`} />
                                    </ListItem>
                                ))}
                            </List>
                        </Alert>
                    )}

                    {canEdit && (
                        <>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Admin Actions
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                {canApprove && (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<CheckCircleIcon />}
                                        onClick={() => handleOpenAction('approve')}
                                    >
                                        Approve
                                    </Button>
                                )}
                                {canReject && (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<CancelIcon />}
                                        onClick={() => handleOpenAction('reject')}
                                    >
                                        Reject
                                    </Button>
                                )}
                                {canSuspend && (
                                    <Button
                                        variant="contained"
                                        color="warning"
                                        startIcon={<BlockIcon />}
                                        onClick={() => handleOpenAction('suspend')}
                                    >
                                        Suspend
                                    </Button>
                                )}
                                {!canApprove && !canReject && !canSuspend && (
                                    <Typography variant="body2" color="text.secondary">
                                        No actions available for the current status.
                                    </Typography>
                                )}
                            </Box>
                        </>
                    )}

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow label="Bio" value={profile?.bio || '—'} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow
                                label="Categories"
                                value={
                                    profile?.categories?.length
                                        ? profile.categories.join(', ')
                                        : '—'
                                }
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow
                                label="Collaboration Types"
                                value={
                                    profile?.collaborationTypes?.length
                                        ? profile.collaborationTypes.join(', ')
                                        : '—'
                                }
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow
                                label="Languages"
                                value={
                                    profile?.languages?.length ? profile.languages.join(', ') : '—'
                                }
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow label="Location" value={profileLocation || location || '—'} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow
                                label="Price Range"
                                value={
                                    profile?.priceRangeMin != null && profile?.priceRangeMax != null
                                        ? `${profile.priceRangeMin} – ${profile.priceRangeMax}`
                                        : '—'
                                }
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow
                                label="Instagram Followers"
                                value={
                                    instagram?.followersCount != null ? (
                                        <>
                                            {formatCompactCount(instagram.followersCount) ??
                                                instagram.followersCount.toLocaleString()}
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ ml: 1 }}
                                            >
                                                ({instagram.followersCount.toLocaleString()})
                                            </Typography>
                                        </>
                                    ) : (
                                        '—'
                                    )
                                }
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow
                                label="Engagement Rate"
                                value={
                                    instagram?.engagementRate != null
                                        ? `${instagram.engagementRate}%`
                                        : '—'
                                }
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow
                                label="Profile Completed"
                                value={approvalReadiness.profileCompleted ? 'Yes' : 'No'}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow
                                label="Instagram Connected"
                                value={approvalReadiness.instagramConnected ? 'Yes' : 'No'}
                            />
                        </Grid>
                        {details.rejectionReason && (
                            <Grid size={{ xs: 12 }}>
                                <DetailRow
                                    label="Rejection Reason"
                                    value={details.rejectionReason}
                                />
                            </Grid>
                        )}
                        {details.suspensionReason && (
                            <Grid size={{ xs: 12 }}>
                                <DetailRow
                                    label="Suspension Reason"
                                    value={details.suspensionReason}
                                />
                            </Grid>
                        )}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow
                                label="Registered On"
                                value={
                                    details.createdAt
                                        ? new Date(details.createdAt).toLocaleString()
                                        : '—'
                                }
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Paper sx={{ p: 3, mb: 3, overflow: 'hidden' }}>
                    <Typography variant="h6" gutterBottom>
                        Status History
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {statusHistory.length === 0 ? (
                        <Typography color="text.secondary">No status changes yet.</Typography>
                    ) : (
                        <List disablePadding>
                            {statusHistory.map((entry) => (
                                <ListItem
                                    key={entry._id}
                                    disableGutters
                                    sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1 }}
                                >
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                                        <Chip
                                            label={formatInfluencerStatus(entry.newStatus)}
                                            size="small"
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {entry.createdAt
                                                ? new Date(entry.createdAt).toLocaleString()
                                                : ''}
                                        </Typography>
                                    </Box>
                                    {entry.remarks && (
                                        <ListItemText primary={entry.remarks} secondary={entry.changedByRole} />
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Paper>

                <Paper sx={{ p: 3, overflow: 'hidden' }}>
                    <Typography variant="h6" gutterBottom>
                        Verification Log
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {verificationLogs.length === 0 ? (
                        <Typography color="text.secondary">No verification actions yet.</Typography>
                    ) : (
                        <List disablePadding>
                            {verificationLogs.map((log) => (
                                <ListItem
                                    key={log._id}
                                    disableGutters
                                    sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1 }}
                                >
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                                        <Chip label={log.action} size="small" color="primary" />
                                        <Typography variant="caption" color="text.secondary">
                                            {log.createdAt
                                                ? new Date(log.createdAt).toLocaleString()
                                                : ''}
                                        </Typography>
                                    </Box>
                                    {log.reason && <ListItemText primary={log.reason} />}
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
                            label={reasonRequired ? 'Reason (required)' : 'Remarks (optional)'}
                            placeholder={
                                reasonRequired
                                    ? 'Enter reason for this action…'
                                    : 'Add optional remarks…'
                            }
                            multiline
                            minRows={3}
                            fullWidth
                            required={reasonRequired}
                            value={actionReason}
                            onChange={(e) => setActionReason(e.target.value)}
                            disabled={actionLoading}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} disabled={actionLoading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmAction}
                            variant="contained"
                            color={
                                actionType === 'reject' || actionType === 'suspend'
                                    ? 'error'
                                    : 'success'
                            }
                            disabled={
                                actionLoading ||
                                (reasonRequired && actionReason.trim().length < 3)
                            }
                        >
                            {actionLoading ? 'Processing…' : 'Confirm'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </ProtectedRoute>
    );
};

export default InfluencerDetailPage;
