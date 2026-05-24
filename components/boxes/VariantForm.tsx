import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { ApiBoxVariant } from '@/lib/api';

export type VariantFormValues = Partial<ApiBoxVariant>;

type VariantFormProps = {
  open: boolean;
  initialValues?: VariantFormValues;
  onSubmit: (values: VariantFormValues) => Promise<void>;
  onClose: () => void;
};

export const createEmptyVariant = (boxId: string): VariantFormValues => ({
  boxId,
  sku: '',
  dimension: { length: 0, width: 0, height: 0, label: '' },
  gsm: 0,
  basePrice: 0,
  moq: 100,
  stock: 0,
  ecoFriendly: false,
  minimalWastage: false,
  isActive: true,
});

export const VariantForm: React.FC<VariantFormProps> = ({ open, initialValues, onSubmit, onClose }) => {
  const [values, setValues] = React.useState<VariantFormValues>(initialValues || {});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setValues(initialValues || {});
      setError(null);
    }
  }, [open, initialValues]);

  const handleChange = (field: keyof VariantFormValues, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleDimensionChange = (field: keyof NonNullable<VariantFormValues['dimension']>, value: any) => {
    setValues((prev) => ({
      ...prev,
      dimension: {
        ...(prev.dimension || { length: 0, width: 0, height: 0, label: '' }),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save variant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initialValues?._id ? 'Edit Variant' : 'Add New Variant'}</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="SKU"
                fullWidth
                required
                margin="dense"
                value={values.sku || ''}
                onChange={(e) => handleChange('sku', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="GSM"
                type="number"
                fullWidth
                required
                margin="dense"
                value={values.gsm || 0}
                onChange={(e) => handleChange('gsm', Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Length"
                type="number"
                fullWidth
                required
                margin="dense"
                value={values.dimension?.length || 0}
                onChange={(e) => handleDimensionChange('length', Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Width"
                type="number"
                fullWidth
                required
                margin="dense"
                value={values.dimension?.width || 0}
                onChange={(e) => handleDimensionChange('width', Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Height"
                type="number"
                fullWidth
                required
                margin="dense"
                value={values.dimension?.height || 0}
                onChange={(e) => handleDimensionChange('height', Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Dimension Label (e.g., Small, 5x5x5)"
                fullWidth
                required
                margin="dense"
                value={values.dimension?.label || ''}
                onChange={(e) => handleDimensionChange('label', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Base Price"
                type="number"
                fullWidth
                required
                margin="dense"
                value={values.basePrice || 0}
                onChange={(e) => handleChange('basePrice', Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="MOQ"
                type="number"
                fullWidth
                required
                margin="dense"
                value={values.moq || 0}
                onChange={(e) => handleChange('moq', Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Stock"
                type="number"
                fullWidth
                required
                margin="dense"
                value={values.stock || 0}
                onChange={(e) => handleChange('stock', Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={<Checkbox checked={values.ecoFriendly || false} onChange={(e) => handleChange('ecoFriendly', e.target.checked)} />}
                  label="Eco Friendly"
                />
                <FormControlLabel
                  control={<Checkbox checked={values.minimalWastage || false} onChange={(e) => handleChange('minimalWastage', e.target.checked)} />}
                  label="Minimal Wastage"
                />
                <FormControlLabel
                  control={<Checkbox checked={values.isActive ?? true} onChange={(e) => handleChange('isActive', e.target.checked)} />}
                  label="Active"
                />
              </Box>
            </Grid>
          </Grid>
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
