import React from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { BoxForm, createEmptyBoxFormValues, type BoxFormValues } from '@/components/boxes/BoxForm';
import { apiCreateBox } from '@/lib/api';

const BoxNewPage: React.FC = () => {
    const navigate = useNavigate();

    const handleSubmit = async (values: BoxFormValues) => {
        const created = await apiCreateBox(values);
        navigate(`/boxes/${created._id}/edit`);
    };

    const handleCancel = () => {
        navigate('/boxes');
    };

    return (
        <ProtectedRoute requiredPermissions={['boxes:create']}>
            <Box>
                <Typography variant="h5" gutterBottom>
                    Add New Box
                </Typography>
                <BoxForm
                    initialValues={createEmptyBoxFormValues()}
                    onSubmit={handleSubmit}
                    submitLabel="Create Box"
                    onCancel={handleCancel}
                />
            </Box>
        </ProtectedRoute>
    );
};

export default BoxNewPage;
