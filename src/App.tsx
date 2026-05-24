import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth pages
import LoginPage from '@/src/pages/auth/LoginPage';
import ForgotPasswordPage from '@/src/pages/auth/ForgotPasswordPage';

// Dashboard layout & pages
import DashboardLayout from '@/src/layouts/DashboardLayout';
import DashboardPage from '@/src/pages/dashboard/DashboardPage';
import ChangePasswordPage from '@/src/pages/ChangePasswordPage';





// Box Types (hidden — kept for future use)
// import BoxTypesListPage from '@/src/pages/box-types/BoxTypesListPage';
// import BoxTypeDetailPage from '@/src/pages/box-types/BoxTypeDetailPage';
// import BoxTypeEditPage from '@/src/pages/box-types/BoxTypeEditPage';
// import BoxTypeNewPage from '@/src/pages/box-types/BoxTypeNewPage';





// Queries
import QueriesListPage from '@/src/pages/queries/QueriesListPage';
import QueryDetailPage from '@/src/pages/queries/QueryDetailPage';
import QueryEditPage from '@/src/pages/queries/QueryEditPage';

const App: React.FC = () => {
    return (
        <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Auth routes (no sidebar layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Dashboard routes (with sidebar layout) */}
            <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/change-password" element={<ChangePasswordPage />} />





                {/* Box Types (hidden — kept for future use)
                <Route path="/box-types" element={<BoxTypesListPage />} />
                <Route path="/box-types/new" element={<BoxTypeNewPage />} />
                <Route path="/box-types/:id" element={<BoxTypeDetailPage />} />
                <Route path="/box-types/:id/edit" element={<BoxTypeEditPage />} />
                */}





                {/* Queries */}
                <Route path="/queries" element={<QueriesListPage />} />
                <Route path="/queries/:id" element={<QueryDetailPage />} />
                <Route path="/queries/:id/edit" element={<QueryEditPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default App;
