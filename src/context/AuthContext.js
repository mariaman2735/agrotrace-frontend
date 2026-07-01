import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as loginAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [utilisateur, setUtilisateur] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user  = localStorage.getItem('utilisateur');
        const expiry = localStorage.getItem('tokenExpiry');

        // Vérifier si le token est encore valide
        if (token && user && expiry) {
            const now = new Date().getTime();
            if (now < parseInt(expiry)) {
                setUtilisateur(JSON.parse(user));
            } else {
                // Token expiré — nettoyer le localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('utilisateur');
                localStorage.removeItem('tokenExpiry');
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        const response = await loginAPI(credentials);
        const { token, utilisateur } = response.data;

        // Sauvegarder avec expiry (8h)
        const expiry = new Date().getTime() + 8 * 60 * 60 * 1000;
        localStorage.setItem('token', token);
        localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
        localStorage.setItem('tokenExpiry', expiry.toString());

        setUtilisateur(utilisateur);
        return utilisateur;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('utilisateur');
        localStorage.removeItem('tokenExpiry');
        setUtilisateur(null);
    };

    return (
        <AuthContext.Provider value={{ utilisateur, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);