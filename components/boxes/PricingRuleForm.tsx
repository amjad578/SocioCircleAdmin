import React from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { ApiPricingRule } from '@/lib/api';

export type PricingRuleFormValues = Partial<ApiPricingRule>;

type PricingRuleFormProps = {
  open: boolean;
  initialValues?: PricingRuleFormValues;
  onSubmit: (values: PricingRuleFormValues) => Promise<void>;
  onClose: () => void;
};

export const createEmptyPricingRule = (variantId: string): PricingRuleFormValues => ({
  variantId,
  minQty: 0,
  maxQty: 0,
  price: 0,
});

export const PricingRuleForm: React.FC<PricingRuleFormProps> = ({ open, initialValues, onSubmit, onClose }) => {
  const [values, setValues] = React.useState<PricingRuleFormValues>(initialValues || {});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setValues(initialValues || {});
      setError(null);
    }
  }, [open, initialValues]);

  const handleChange = (field: keyof PricingRuleFormValues, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save pricing rule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initialValues?._id ? 'Edit Pricing Rule' : 'Add Pricing Rule'}</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Min Qty"
                type="number"
                fullWidth
                required
                margin="dense"
                value={values.minQty || 0}
                onChange={(e) => handleChange('minQty', Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Max Qty"
                type="number"
                fullWidth
                required
                margin="dense"
                value={values.maxQty || 0}
                onChange={(e) => handleChange('maxQty', Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Price (Per Unit)"
                type="number"
                fullWidth
                required
                margin="dense"
                value={values.price || 0}
                onChange={(e) => handleChange('price', Number(e.target.value))}
              />
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
