import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import {
  ApiBox,
  ApiBoxType,
  ApiBoxMaterial,
  ApiBoxCategory,
  apiListBoxTypes,
  apiListBoxMaterials,
  apiListBoxCategories
} from '@/lib/api';

export type BoxFormValues = Omit<ApiBox, '_id' | 'status' | 'createdAt' | 'updatedAt'>;

// Ensure populated ObjectId objects are converted to plain strings before sending to the API
function normalizeId(val: string | { _id: string; [key: string]: any } | undefined | null): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return (val as any)._id ?? '';
}

function normalizeValues(v: BoxFormValues): BoxFormValues {
    return {
        ...v,
        typeId: normalizeId(v.typeId as any),
        materialId: normalizeId(v.materialId as any),
        categoryId: normalizeId(v.categoryId as any),
    };
}

type BoxFormProps = {
  initialValues: BoxFormValues;
  onSubmit: (values: BoxFormValues) => Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
};

export const createEmptyBoxFormValues = (): BoxFormValues => ({
  name: '',
  slug: '',
  shortDescription: '',
  longDescription: '',
  categoryId: '',
  typeId: '',
  materialId: '',
  ecoFriendly: false,
  minimalWastage: false,
  sheetOptimization: {
      sheetSize: '',
      boxesPerSheet: 0,
      wastagePercent: 0,
  },
  isActive: true,
});

export const BoxForm: React.FC<BoxFormProps> = ({
  initialValues,
  onSubmit,
  submitLabel = 'Save',
  onCancel
}) => {
  const [values, setValues] = React.useState<BoxFormValues>(() => normalizeValues(initialValues));
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [boxTypes, setBoxTypes] = React.useState<ApiBoxType[]>([]);
  const [materials, setMaterials] = React.useState<ApiBoxMaterial[]>([]);
  const [boxCategories, setBoxCategories] = React.useState<ApiBoxCategory[]>([]);

  React.useEffect(() => {
    const loadMasters = async () => {
      try {
        const [btRes, matRes, bcRes] = await Promise.all([
          apiListBoxTypes(),
          apiListBoxMaterials(),
          apiListBoxCategories()
        ]);
        const bt = btRes.data;
        const mat = matRes.data;
        const bc = bcRes.data;

        setBoxTypes(bt);
        setMaterials(mat);
        setBoxCategories(bc);

        setValues((prev) => {
          let next = { ...prev };

          if (!next.typeId && bt.length > 0) {
            next = { ...next, typeId: bt[0]._id };
          }
          if (!next.materialId && mat.length > 0) {
            next = { ...next, materialId: mat[0]._id };
          }
          if (!next.categoryId && bc.length > 0) {
            next = { ...next, categoryId: bc[0]._id };
          }

          return next;
        });
      } catch {
        // ignore errors loading dropdowns for now
      }
    };

    void loadMasters();
  }, []);

  const handleChange = (field: keyof BoxFormValues, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptimizationChange = (field: keyof NonNullable<BoxFormValues['sheetOptimization']>, value: any) => {
      setValues((prev) => ({
          ...prev,
          sheetOptimization: {
              ...(prev.sheetOptimization || { sheetSize: '', boxesPerSheet: 0, wastagePercent: 0 }),
              [field]: value
          }
      }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit(normalizeValues(values));
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save box');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Box Details
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Box Name"
            fullWidth
            required
            margin="normal"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          <TextField
            label="Slug"
            fullWidth
            required
            margin="normal"
            value={values.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            helperText="URL friendly identifier"
          />
          <TextField
            label="Short Description"
            fullWidth
            required
            margin="normal"
            value={values.shortDescription}
            onChange={(e) => handleChange('shortDescription', e.target.value)}
          />
          <TextField
            label="Long Description"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={values.longDescription}
            onChange={(e) => handleChange('longDescription', e.target.value)}
          />
          <TextField
            label="Box Type"
            fullWidth
            select
            margin="normal"
            value={typeof values.typeId === 'string' ? values.typeId : values.typeId._id || ''}
            onChange={(e) => handleChange('typeId', e.target.value)}
          >
            {boxTypes.map((bt) => (
              <MenuItem key={bt._id} value={bt._id}>
                {bt.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Material"
            fullWidth
            select
            margin="normal"
            value={typeof values.materialId === 'string' ? values.materialId : values.materialId._id || ''}
            onChange={(e) => handleChange('materialId', e.target.value)}
          >
            {materials.map((mat) => (
              <MenuItem key={mat._id} value={mat._id}>
                {mat.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Box Category"
            fullWidth
            select
            margin="normal"
            value={typeof values.categoryId === 'string' ? values.categoryId : values.categoryId._id || ''}
            onChange={(e) => handleChange('categoryId', e.target.value)}
          >
            {boxCategories.map((bc) => (
              <MenuItem key={bc._id} value={bc._id}>
                {bc.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Properties
            </Typography>
            <FormControlLabel
                control={
                <Checkbox
                    checked={values.ecoFriendly}
                    onChange={(e) => handleChange('ecoFriendly', e.target.checked)}
                />
                }
                label="Eco Friendly"
            />
            <FormControlLabel
                control={
                <Checkbox
                    checked={values.minimalWastage}
                    onChange={(e) => handleChange('minimalWastage', e.target.checked)}
                />
                }
                label="Minimal Wastage"
            />
            <FormControlLabel
                control={
                <Checkbox
                    checked={values.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                />
                }
                label="Is Active"
            />

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                Sheet Optimization
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                <TextField
                  label="Sheet Size"
                  fullWidth
                  margin="dense"
                  value={values.sheetOptimization?.sheetSize || ''}
                  onChange={(e) => handleOptimizationChange('sheetSize', e.target.value)}
                />
                <TextField
                  label="Boxes Per Sheet"
                  type="number"
                  fullWidth
                  margin="dense"
                  value={values.sheetOptimization?.boxesPerSheet || 0}
                  onChange={(e) => handleOptimizationChange('boxesPerSheet', Number(e.target.value))}
                />
                <TextField
                  label="Wastage Percent"
                  type="number"
                  fullWidth
                  margin="dense"
                  value={values.sheetOptimization?.wastagePercent || 0}
                  onChange={(e) => handleOptimizationChange('wastagePercent', Number(e.target.value))}
                />
            </Box>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1.5 }}>
        {onCancel && (
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </Box>
    </Paper>
  );
};
