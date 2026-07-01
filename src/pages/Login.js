import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const [form, setForm] = useState({ login: '', motDePasse: '' });
    const [erreur, setErreur] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErreur('');
        try {
            await login(form);
            navigate('/dashboard');
        } catch (error) {
            setErreur('Login ou mot de passe incorrect');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>

            <img src="/logo.png" alt="AgroTrace" style={styles.logo} />

            <h2 style={styles.title}>Système de Gestion et de traçabilité Agroalimentaire</h2>
            <p style={styles.subtitle}>
                Gérez vos matières premières, suivez votre production
                et assurez la traçabilité complète de vos produits.
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>

                <input
                    type="text"
                    name="login"
                    value={form.login}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Login"
                    required
                />

                <div style={styles.passwordWrapper}>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="motDePasse"
                        value={form.motDePasse}
                        onChange={handleChange}
                        style={{ ...styles.input, paddingRight: '90px' }}
                        placeholder="Mot de passe"
                        required
                    />
                    <span
                        style={styles.toggle}
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>

                {erreur && (
                    <div style={styles.erreur}>⚠️ {erreur}</div>
                )}

                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? 'Connexion en cours...' : 'Se connecter'}
                </button>

            </form>

            <div style={styles.links}>
                <span style={styles.link} onClick={() => navigate('/mot-de-passe-oublie')}>Mot de passe oublié ?</span>
                <span style={styles.separator}>|</span>
                <span style={styles.link} onClick={() => navigate('/demande-acces')}>
                    Pas de compte ? <b>Faire une demande</b>
                </span>
            </div>

            <p style={styles.footer}>
                AgroTrace © 2025 — Tous droits réservés
            </p>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
    },
    logo: {
        width: '220px',
        marginBottom: '20px',
    },
    title: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#1B6B3A',
        textAlign: 'center',
        margin: '0 0 10px 0',
    },
    subtitle: {
        fontSize: '14px',
        color: '#888',
        textAlign: 'center',
        marginBottom: '32px',
        lineHeight: '1.6',
        maxWidth: '380px',
    },
    form: {
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
    },
    input: {
        width: '100%',
        padding: '14px 16px',
        border: '1.5px solid #e0e0e0',
        borderRadius: '10px',
        fontSize: '15px',
        outline: 'none',
        boxSizing: 'border-box',
        color: '#333',
        backgroundColor: '#fafafa',
    },
    passwordWrapper: {
        position: 'relative',
    },
    toggle: {
        position: 'absolute',
        right: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        cursor: 'pointer',
        fontSize: '13px',
        color: '#2E9B56',
        fontWeight: 'bold',
    },
    erreur: {
        backgroundColor: '#fff3f3',
        color: '#c62828',
        padding: '10px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        border: '1px solid #ffcdd2',
        textAlign: 'center',
    },
    button: {
        width: '100%',
        padding: '15px',
        backgroundColor: '#2E9B56',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '4px',
    },
    links: {
        marginTop: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '13px',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    link: {
        color: '#2E9B56',
        cursor: 'pointer',
    },
    separator: {
        color: '#ddd',
    },
    footer: {
        marginTop: '32px',
        color: '#bbb',
        fontSize: '12px',
        textAlign: 'center',
    }
};

export default Login;