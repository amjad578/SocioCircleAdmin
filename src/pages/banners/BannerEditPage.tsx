import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
    apiGetBanner,
    apiUpdateBanner,
    apiGetBoxType,
    apiGetBoxAdminDetails,
    apiListBoxTypes,
    apiListBoxes,
    type ApiStatus,
    type ApiBannerRedirectType,
    type ApiBoxType,
    type ApiBox,
} from '@/lib/api';

type DropdownOption = { _id: string; label: string };

const toOption = (item: ApiBoxType | ApiBox): DropdownOption => ({
    _id: item._id,
    label: (item as ApiBoxType).name ?? (item as ApiBox).name,
});

const BannerEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // ── form values ──────────────────────────────────────────────────────────
    const [values, setValues] = React.useState<{
        title: string;
        redirectType: ApiBannerRedirectType;
        position: number;
        status: ApiStatus;
        existingImage?: string;
    } | null>(null);
    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // ── box type autocomplete ─────────────────────────────────────────────────
    const [selectedBoxType, setSelectedBoxType] = React.useState<DropdownOption | null>(null);
    const [boxTypeInput, setBoxTypeInput] = React.useState('');
    const [boxTypeOptions, setBoxTypeOptions] = React.useState<DropdownOption[]>([]);
    const [boxTypeLoading, setBoxTypeLoading] = React.useState(false);

    // ── box autocomplete ──────────────────────────────────────────────────────
    const [selectedBox, setSelectedBox] = React.useState<DropdownOption | null>(null);
    const [boxInput, setBoxInput] = React.useState('');
    const [boxOptions, setBoxOptions] = React.useState<DropdownOption[]>([]);
    const [boxLoading, setBoxLoading] = React.useState(false);

    // ── load banner on mount ──────────────────────────────────────────────────
    React.useEffect(() => {
        const load = async () => {
            try {
                const data = await apiGetBanner(id!);
                if (!data) { navigate('/banners'); return; }

                setValues({
                    title: data.title,
                    redirectType: data.redirectType,
                    position: data.position,
                    status: data.status,
                    existingImage: data.image,
                });

                // Pre-populate box type dropdown
                if (data.redirectType === 'box_list' && data.boxTypeId) {
                    try {
                        const bt = await apiGetBoxType(data.boxTypeId);
                        setSelectedBoxType({ _id: bt._id, label: bt.name });
                        setBoxTypeInput(bt.name);
                    } catch { /* not critical */ }
                }

                // Pre-populate box dropdown
                if (data.redirectType === 'box' && data.boxId) {
                    try {
                        const details = await apiGetBoxAdminDetails(data.boxId);
                        setSelectedBox({ _id: details.box._id, label: details.box.name });
                        setBoxInput(details.box.name);
                    } catch { /* not critical */ }
                }
            } catch (err: any) {
                setError(err?.message ?? 'Failed to load banner');
            }
        };
        void load();
    }, [id, navigate]);

    // ── debounced search – Box Types ──────────────────────────────────────────
    React.useEffect(() => {
        if (values?.redirectType !== 'box_list') return;
        let active = true;
        setBoxTypeLoading(true);
        const timer = setTimeout(async () => {
            try {
                const res = await apiListBoxTypes({ search: boxTypeInput || undefined, limit: 20 });
                if (active) setBoxTypeOptions(res.data.map(toOption));
            } catch { /* ignore */ } finally {
                if (active) setBoxTypeLoading(false);
            }
        }, 350);
        return () => { active = false; clearTimeout(timer); };
    }, [boxTypeInput, values?.redirectType]);

    // ── debounced search – Boxes ──────────────────────────────────────────────
    React.useEffect(() => {
        if (values?.redirectType !== 'box') return;
        let active = true;
        setBoxLoading(true);
        const timer = setTimeout(async () => {
            try {
                const res = await apiListBoxes({ search: boxInput || undefined, limit: 20 });
                if (active) setBoxOptions(res.data.map(toOption));
            } catch { /* ignore */ } finally {
                if (active) setBoxLoading(false);
            }
        }, 350);
        return () => { active = false; clearTimeout(timer); };
    }, [boxInput, values?.redirectType]);

    const handleRedirectTypeChange = (type: ApiBannerRedirectType) => {
        setValues((v) => v ? { ...v, redirectType: type } : v);
        setSelectedBoxType(null);
        setSelectedBox(null);
        setBoxTypeInput('');
        setBoxInput('');
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => { if (typeof reader.result === 'string') setImagePreview(reader.result); };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!values) return;
        setError(null);
        setLoading(true);
        try {
            await apiUpdateBanner(id!, {
                title: values.title,
                redirectType: values.redirectType,
                boxId: selectedBox?._id || undefined,
                boxTypeId: selectedBoxType?._id || undefined,
                position: values.position,
                status: values.status,
                imageFile,
            });
            navigate('/banners');
        } catch (err: any) {
            setError(err?.message ?? 'Failed to update banner');
        } finally {
            setLoading(false);
        }
    };

    if (!values && !error) return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        </ProtectedRoute>
    );

    return (
        <ProtectedRoute requiredPermissions={['boxes:edit']}>
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate('/banners')} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
                    <Typography variant="h5">Edit Banner</Typography>
                </Box>
                <Paper sx={{ p: 3, maxWidth: 520 }} component="form" onSubmit={handleSubmit}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {values && (
                        <>
                            <TextField label="Title" fullWidth required margin="normal" value={values.title}
                                onChange={(e) => setValues((v) => ({ ...v!, title: e.target.value }))} />

                            <TextField label="Redirect Type" select fullWidth required margin="normal"
                                value={values.redirectType}
                                onChange={(e) => handleRedirectTypeChange(e.target.value as ApiBannerRedirectType)}>
                                <MenuItem value="box_list">Box List</MenuItem>
                                <MenuItem value="box">Box</MenuItem>
                            </TextField>

                            {/* Box Type dropdown (when redirectType === 'box_list') */}
                            {values.redirectType === 'box_list' && (
                                <Autocomplete
                                    sx={{ mt: 1 }}
                                    options={boxTypeOptions}
                                    value={selectedBoxType}
                                    inputValue={boxTypeInput}
                                    loading={boxTypeLoading}
                                    isOptionEqualToValue={(opt, val) => opt._id === val._id}
                                    getOptionLabel={(opt) => opt.label}
                                    onInputChange={(_, val) => setBoxTypeInput(val)}
                                    onChange={(_, val) => setSelectedBoxType(val)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Box Type (optional)"
                                            margin="normal"
                                            helperText="Leave empty to show all box types"
                                            slotProps={{
                                                input: {
                                                    ...params.slotProps?.input,
                                                    endAdornment: (
                                                        <>
                                                            {boxTypeLoading && <CircularProgress size={18} />}
                                                            {params.slotProps?.input?.endAdornment}
                                                        </>
                                                    ),
                                                }
                                            }}
                                        />
                                    )}
                                />
                            )}

                            {/* Box dropdown (when redirectType === 'box') */}
                            {values.redirectType === 'box' && (
                                <Autocomplete
                                    sx={{ mt: 1 }}
                                    options={boxOptions}
                                    value={selectedBox}
                                    inputValue={boxInput}
                                    loading={boxLoading}
                                    isOptionEqualToValue={(opt, val) => opt._id === val._id}
                                    getOptionLabel={(opt) => opt.label}
                                    onInputChange={(_, val) => setBoxInput(val)}
                                    onChange={(_, val) => setSelectedBox(val)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Box"
                                            required
                                            margin="normal"
                                            helperText="Type to search boxes"
                                            slotProps={{
                                                input: {
                                                    ...params.slotProps?.input,
                                                    endAdornment: (
                                                        <>
                                                            {boxLoading && <CircularProgress size={18} />}
                                                            {params.slotProps?.input?.endAdornment}
                                                        </>
                                                    ),
                                                }
                                            }}
                                        />
                                    )}
                                />
                            )}

                            <TextField label="Position" type="number" fullWidth required margin="normal"
                                slotProps={{ htmlInput: { min: 1 } }} value={values.position}
                                onChange={(e) => setValues((v) => ({ ...v!, position: Number(e.target.value) }))} />

                            <TextField label="Status" select fullWidth required margin="normal" value={values.status}
                                onChange={(e) => setValues((v) => ({ ...v!, status: e.target.value as ApiStatus }))}>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                                <MenuItem value="delete">Delete</MenuItem>
                            </TextField>

                            <Box sx={{ mt: 2 }}>
                                <Button variant="outlined" component="label">
                                    {imageFile ? 'Change Image' : 'Upload New Image'}
                                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                                </Button>
                                {(imagePreview ?? values.existingImage) && (
                                    <Box sx={{ mt: 2 }}>
                                        <img src={imagePreview ?? values.existingImage} alt="Preview"
                                            style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }} />
                                    </Box>
                                )}
                            </Box>

                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                                <Button type="button" variant="outlined" color="inherit"
                                    onClick={() => navigate('/banners')}>Cancel</Button>
                                <Button type="submit" variant="contained" disabled={loading}>
                                    {loading ? 'Saving...' : 'Update'}
                                </Button>
                            </Box>
                        </>
                    )}
                </Paper>
            </Box>
        </ProtectedRoute>
    );
};

export default BannerEditPage;
