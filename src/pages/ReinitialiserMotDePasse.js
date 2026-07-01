import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifierTokenReset, reinitialiserMotDePasse } from '../services/api';

const ReinitialiserMotDePasse = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [valide, setValide] = useState(null);
    const [motDePasse, setMotDePasse] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const verifier = async () => {
            try {
                await verifierTokenReset(token);
                setValide(true);
            } catch (error) {
                setValide(false);
            }
        };
        verifier();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (motDePasse !== confirmation) {
            setMessage('Les mots de passe ne correspondent pas');
            return;
        }
        if (motDePasse.length < 6) {
            setMessage('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }
        setLoading(true);
        try {
            await reinitialiserMotDePasse({ token, nouveauMotDePasse: motDePasse });
            setSuccess(true);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    if (valide === null) {
        return <div style={S.page}><p>Vérification du lien...</p></div>;
    }

    if (valide === false) {
        return (
            <div style={S.page}>
                <div style={S.container}>
                    <img src="/logo.png" alt="AgroTrace" style={S.logo} />
                    <h2 style={S.title}>Lien invalide</h2>
                    <p style={S.subtitle}>
                        Ce lien de réinitialisation est invalide ou a expiré.
                        Veuillez refaire une demande.
                    </p>
                    <p style={S.backLink} onClick={() => navigate('/mot-de-passe-oublie')}>
                        ← Faire une nouvelle demande
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={S.page}>
            <div style={S.container}>
                <img src="/logo.png" alt="AgroTrace" style={S.logo} />

                {!success ? (
                    <>
                        <h2 style={S.title}>Nouveau mot de passe</h2>
                        <p style={S.subtitle}>Choisissez un nouveau mot de passe sécurisé.</p>

                        <form onSubmit={handleSubmit} style={S.form}>
                            <input
                                style={S.input}
                                type="password"
                                placeholder="Nouveau mot de passe"
                                value={motDePasse}
                                onChange={e => setMotDePasse(e.target.value)}
                                required
                            />
                            <input
                                style={S.input}
                                type="password"
                                placeholder="Confirmer le mot de passe"
                                value={confirmation}
                                onChange={e => setConfirmation(e.target.value)}
                                required
                            />

                            {message && <div style={S.erreur}>{message}</div>}

                            <button type="submit" style={S.button} disabled={loading}>
                                {loading ? 'Enregistrement...' : 'Réinitialiser le mot de passe'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={S.successBox}>
                        <div style={S.successIcon}>✓</div>
                        <h2 style={S.title}>Mot de passe réinitialisé !</h2>
                        <p style={S.subtitle}>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
                        <button style={S.button} onClick={() => navigate('/login')}>
                            Aller à la connexion
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const S = {
    page: {
        minHeight: '100vh', backgroundColor: '#fff',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px',
    },
    container: {
        width: '100%', maxWidth: '400px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
    },
    logo: { width: '180px', marginBottom: '16px' },
    title: {
        fontSize: '20px', fontWeight: 'bold', color: '#1B6B3A',
        textAlign: 'center', margin: '0 0 10px 0',
    },
    subtitle: {
        fontSize: '14px', color: '#888', textAlign: 'center',
        marginBottom: '28px', lineHeight: '1.6',
    },
    form: {
        width: '100%', display: 'flex',
        flexDirection: 'column', gap: '14px',
    },
    input: {
        width: '100%', padding: '14px 16px',
        border: '1.5px solid #e0e0e0', borderRadius: '10px',
        fontSize: '15px', outline: 'none',
        boxSizing: 'border-box', color: '#333',
        backgroundColor: '#fafafa',
    },
    erreur: {
        backgroundColor: '#fff3f3', color: '#c62828',
        padding: '10px 14px', borderRadius: '8px',
        fontSize: '13px', border: '1px solid #ffcdd2',
        textAlign: 'center',
    },
    button: {
        width: '100%', padding: '15px',
        backgroundColor: '#2E9B56', color: '#fff',
        border: 'none', borderRadius: '10px',
        fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
    },
    successBox: { textAlign: 'center' },
    successIcon: {
        width: '60px', height: '60px', borderRadius: '50%',
        backgroundColor: '#f0fdf4', color: '#16a34a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '28px', fontWeight: 'bold',
        margin: '0 auto 20px',
    },
    backLink: {
        marginTop: '24px', color: '#2E9B56',
        cursor: 'pointer', fontSize: '14px',
    },
};

export default ReinitialiserMotDePasse;