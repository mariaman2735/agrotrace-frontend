import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { utilisateur, loading } = useAuth();

    if (loading) return <div>Chargement...</div>;

    return utilisateur ? children : <Navigate to="/login" />;
};

export default PrivateRoute;