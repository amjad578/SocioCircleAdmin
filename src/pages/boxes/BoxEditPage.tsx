import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { BoxForm, type BoxFormValues } from '@/components/boxes/BoxForm';
import { VariantForm, createEmptyVariant, type VariantFormValues } from '@/components/boxes/VariantForm';
import { PricingRuleForm, createEmptyPricingRule, type PricingRuleFormValues } from '@/components/boxes/PricingRuleForm';
import {
    apiGetBoxAdminDetails,
    apiUpdateBox,
    apiCreateVariant,
    apiUpdateVariant,
    apiAddBoxImages,
    apiRemoveBoxImage,
    apiAddAccordion,
    apiUpdateAccordion,
    apiDeleteAccordion,
    apiGetPricingRules,
    apiCreatePricingRule,
    apiUpdatePricingRule,
    ApiBoxAdminDetails,
    ApiBoxVariant,
    ApiBoxImage,
    ApiBoxAccordion,
    ApiPricingRule
} from '@/lib/api';

// ─── Tab Panel ────────────────────────────────────────────────────────────────

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}
function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`box-tabpanel-${index}`} aria-labelledby={`box-tab-${index}`} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

// ─── Accordion Form Dialog ─────────────────────────────────────────────────────

type AccordionFormValues = { _id?: string; title: string; description: string };

interface AccordionFormDialogProps {
    open: boolean;
    initialValues?: AccordionFormValues;
    onClose: () => void;
    onSubmit: (values: AccordionFormValues) => Promise<void>;
}
const AccordionFormDialog: React.FC<AccordionFormDialogProps> = ({ open, initialValues, onClose, onSubmit }) => {
    const [values, setValues] = React.useState<AccordionFormValues>({ title: '', description: '' });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (open) {
            setValues(initialValues ?? { title: '', description: '' });
            setError(null);
        }
    }, [open, initialValues]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onSubmit(values);
            onClose();
        } catch (err: any) {
            setError(err?.message ?? 'Failed to save accordion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>{values._id ? 'Edit Accordion' : 'Add Accordion'}</DialogTitle>
                <DialogContent dividers>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField
                        label="Title"
                        fullWidth
                        required
                        margin="dense"
                        value={values.title}
                        onChange={(e) => setValues((p) => ({ ...p, title: e.target.value }))}
                    />
                    <TextField
                        label="Description"
                        fullWidth
                        required
                        margin="dense"
                        multiline
                        rows={3}
                        value={values.description}
                        onChange={(e) => setValues((p) => ({ ...p, description: e.target.value }))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

// ─── Pricing Dialog ────────────────────────────────────────────────────────────

interface PricingDialogProps {
    open: boolean;
    variantId: string | null;
    onClose: () => void;
    onSaved: () => void;
}
const PricingDialog: React.FC<PricingDialogProps> = ({ open, variantId, onClose, onSaved }) => {
    const [rules, setRules] = React.useState<ApiPricingRule[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [formOpen, setFormOpen] = React.useState(false);
    const [editingRule, setEditingRule] = React.useState<PricingRuleFormValues | undefined>(undefined);

    const loadRules = React.useCallback(async () => {
        if (!variantId) return;
        setLoading(true);
        try {
            const data = await apiGetPricingRules(variantId);
            setRules(data);
        } finally {
            setLoading(false);
        }
    }, [variantId]);

    React.useEffect(() => {
        if (open && variantId) void loadRules();
    }, [open, variantId, loadRules]);

    const handleSavePricing = async (values: PricingRuleFormValues) => {
        if (values._id) {
            await apiUpdatePricingRule(values._id, values);
        } else {
            await apiCreatePricingRule({ ...values, variantId: variantId! });
        }
        await loadRules();
        onSaved();
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>Pricing Rules</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setEditingRule(createEmptyPricingRule(variantId!));
                                setFormOpen(true);
                            }}
                        >
                            Add Rule
                        </Button>
                    </Box>
                    {loading ? (
                        <Typography color="text.secondary">Loading rules...</Typography>
                    ) : (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Min Qty</TableCell>
                                    <TableCell>Max Qty</TableCell>
                                    <TableCell>Price (₹)</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rules.map((r) => (
                                    <TableRow key={r._id}>
                                        <TableCell>{r.minQty}</TableCell>
                                        <TableCell>{r.maxQty}</TableCell>
                                        <TableCell>₹{r.price}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setEditingRule(r);
                                                    setFormOpen(true);
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {rules.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">No pricing rules yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
            <PricingRuleForm
                open={formOpen}
                initialValues={editingRule}
                onClose={() => setFormOpen(false)}
                onSubmit={handleSavePricing}
            />
        </>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const BoxEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [tabValue, setTabValue] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    const [details, setDetails] = React.useState<ApiBoxAdminDetails | null>(null);

    // Variant State
    const [variantOpen, setVariantOpen] = React.useState(false);
    const [editingVariant, setEditingVariant] = React.useState<VariantFormValues | undefined>(undefined);

    // Pricing Dialog State
    const [pricingDialogOpen, setPricingDialogOpen] = React.useState(false);
    const [selectedVariantId, setSelectedVariantId] = React.useState<string | null>(null);

    // Accordion State
    const [accordionDialogOpen, setAccordionDialogOpen] = React.useState(false);
    const [editingAccordion, setEditingAccordion] = React.useState<AccordionFormValues | undefined>(undefined);

    const loadData = React.useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await apiGetBoxAdminDetails(id);
            setDetails(data);
        } catch (error) {
            console.error(error);
            navigate('/boxes');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    React.useEffect(() => {
        void loadData();
    }, [loadData]);

    const handleTabChange = (_e: React.SyntheticEvent, newValue: number) => setTabValue(newValue);

    // ── Details ──────────────────────────────────────────────────────────────
    const handleBoxUpdate = async (values: BoxFormValues) => {
        if (!id) return;
        await apiUpdateBox(id, values);
        await loadData();
    };

    // ── Variants ─────────────────────────────────────────────────────────────
    const handleSaveVariant = async (values: VariantFormValues) => {
        if (values._id) {
            await apiUpdateVariant(values._id, values);
        } else {
            await apiCreateVariant(values);
        }
        await loadData();
    };

    // ── Images ────────────────────────────────────────────────────────────────
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !id) return;
        const filesToUpload = Array.from(e.target.files);
        await apiAddBoxImages(id, filesToUpload);
        await loadData();
    };

    const handleDeleteImage = async (imageId: string) => {
        await apiRemoveBoxImage(imageId);
        await loadData();
    };

    // ── Accordions ────────────────────────────────────────────────────────────
    const handleSaveAccordion = async (values: AccordionFormValues) => {
        if (!id) return;
        if (values._id) {
            await apiUpdateAccordion(values._id, { title: values.title, description: values.description });
        } else {
            await apiAddAccordion(id, { title: values.title, description: values.description });
        }
        await loadData();
    };

    const handleDeleteAccordion = async (accordionId: string) => {
        if (!window.confirm('Delete this accordion?')) return;
        await apiDeleteAccordion(accordionId);
        await loadData();
    };

    if (loading || !details) {
        return (
            <ProtectedRoute requiredPermissions={['boxes:edit']}>
                <Typography>Loading...</Typography>
            </ProtectedRoute>
        );
    }

    const { box, variants, images, accordions } = details;

    return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate('/boxes')} sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5">Edit Box: {box.name}</Typography>
                </Box>

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Details" />
                        <Tab label={`Variants (${variants.length})`} />
                        <Tab label={`Media (${images.length})`} />
                        <Tab label={`Accordions (${accordions.length})`} />
                    </Tabs>
                </Box>

                {/* DETAILS TAB */}
                <CustomTabPanel value={tabValue} index={0}>
                    <BoxForm
                        initialValues={box}
                        onSubmit={handleBoxUpdate}
                        submitLabel="Update Details"
                    />
                </CustomTabPanel>

                {/* VARIANTS TAB */}
                <CustomTabPanel value={tabValue} index={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setEditingVariant(createEmptyVariant(id!));
                                setVariantOpen(true);
                            }}
                        >
                            Add Variant
                        </Button>
                    </Box>
                    <Paper>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>SKU</TableCell>
                                    <TableCell>Label</TableCell>
                                    <TableCell>GSM</TableCell>
                                    <TableCell>Base Price</TableCell>
                                    <TableCell>MOQ</TableCell>
                                    <TableCell>Active</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {variants.map((v) => (
                                    <TableRow key={v._id}>
                                        <TableCell>{v.sku}</TableCell>
                                        <TableCell>{v.dimension.label} ({v.dimension.length}x{v.dimension.width}x{v.dimension.height})</TableCell>
                                        <TableCell>{v.gsm}</TableCell>
                                        <TableCell>₹{v.basePrice}</TableCell>
                                        <TableCell>{v.moq}</TableCell>
                                        <TableCell>{v.isActive ? 'Yes' : 'No'}</TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                startIcon={<AttachMoneyIcon />}
                                                sx={{ mr: 1 }}
                                                onClick={() => {
                                                    setSelectedVariantId(v._id);
                                                    setPricingDialogOpen(true);
                                                }}
                                            >
                                                Pricing
                                            </Button>
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setEditingVariant(v);
                                                    setVariantOpen(true);
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {variants.length === 0 && (
                                    <TableRow><TableCell colSpan={7} align="center">No variants found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Paper>
                </CustomTabPanel>

                {/* MEDIA TAB */}
                <CustomTabPanel value={tabValue} index={2}>
                    <Box sx={{ mb: 2 }}>
                        <Button variant="contained" component="label" startIcon={<AddIcon />}>
                            Upload Media
                            <input type="file" hidden multiple accept="image/*,video/*" onChange={handleImageUpload} />
                        </Button>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Max 8 files allowed (images or videos).
                        </Typography>
                    </Box>
                    <Grid container spacing={2}>
                        {images.map((img) => (
                            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={img._id}>
                                <Paper sx={{ p: 1, position: 'relative' }}>
                                    {img.mediaType === 'video' ? (
                                        <video src={img.imageUrl} style={{ width: '100%', height: 150, objectFit: 'cover' }} controls />
                                    ) : (
                                        <img src={img.imageUrl} alt="" style={{ width: '100%', height: 150, objectFit: 'cover' }} />
                                    )}
                                    <IconButton
                                        size="small"
                                        color="error"
                                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)' }}
                                        onClick={() => handleDeleteImage(img._id)}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Paper>
                            </Grid>
                        ))}
                        {images.length === 0 && (
                            <Grid size={{ xs: 12 }}>
                                <Typography color="text.secondary">No media uploaded yet.</Typography>
                            </Grid>
                        )}
                    </Grid>
                </CustomTabPanel>

                {/* ACCORDIONS TAB */}
                <CustomTabPanel value={tabValue} index={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setEditingAccordion({ title: '', description: '' });
                                setAccordionDialogOpen(true);
                            }}
                        >
                            Add Accordion
                        </Button>
                    </Box>
                    {accordions.length === 0 ? (
                        <Typography color="text.secondary">No accordions yet. Click "Add Accordion" to create one.</Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {accordions.map((acc, idx) => (
                                <Paper key={acc._id} sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography sx={{ fontWeight: 600 }}>
                                                {idx + 1}. {acc.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                {acc.description}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setEditingAccordion({ _id: acc._id, title: acc.title, description: acc.description });
                                                    setAccordionDialogOpen(true);
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteAccordion(acc._id)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    )}
                </CustomTabPanel>
            </Box>

            {/* VARIANT FORM DIALOG */}
            <VariantForm
                open={variantOpen}
                initialValues={editingVariant}
                onClose={() => setVariantOpen(false)}
                onSubmit={handleSaveVariant}
            />

            {/* PRICING DIALOG */}
            <PricingDialog
                open={pricingDialogOpen}
                variantId={selectedVariantId}
                onClose={() => setPricingDialogOpen(false)}
                onSaved={loadData}
            />

            {/* ACCORDION FORM DIALOG */}
            <AccordionFormDialog
                open={accordionDialogOpen}
                initialValues={editingAccordion}
                onClose={() => setAccordionDialogOpen(false)}
                onSubmit={handleSaveAccordion}
            />
        </ProtectedRoute>
    );
};

export default BoxEditPage;
