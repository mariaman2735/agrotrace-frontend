import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const MonProfil = () => {
    const { utilisateur, logout } = useAuth();
    const [form, setForm] = useState({
        login: utilisateur?.login || '',
        ancienMotDePasse: '',
        nouveauMotDePasse: '',
        confirmation: ''
    });
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setErreur('');

        if (form.nouveauMotDePasse && form.nouveauMotDePasse !== form.confirmation) {
            setErreur('Les mots de passe ne correspondent pas');
            return;
        }

        if (form.nouveauMotDePasse && form.nouveauMotDePasse.length < 6) {
            setErreur('Le nouveau mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);
        try {
            await API.put('/auth/profil', {
                login: form.login,
                ancienMotDePasse: form.ancienMotDePasse,
                nouveauMotDePasse: form.nouveauMotDePasse || undefined,
            });
            setMessage('Profil mis à jour avec succès ! Reconnectez-vous avec vos nouveaux identifiants.');
            setTimeout(() => {
                logout();
                window.location.href = '/login';
            }, 2000);
        } catch (error) {
            setErreur(error.response?.data?.message || 'Erreur lors de la mise à jour');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={S.header}>
                <div>
                    <h1 style={S.title}>Mon Profil</h1>
                    <p style={S.subtitle}>Modifiez votre login et votre mot de passe</p>
                </div>
            </div>

            <div style={S.card}>
                {/* Info utilisateur */}
                <div style={S.userInfo}>
                    <div style={S.avatar}>
                        {utilisateur?.nom?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={S.userName}>{utilisateur?.nom}</div>
                        <div style={S.userRole}>{utilisateur?.role}</div>
                    </div>
                </div>

                <hr style={S.divider} />

                <form onSubmit={handleSubmit}>
                    <div style={S.formGroup}>
                        <label style={S.label}>Nouveau login</label>
                        <input
                            style={S.input}
                            value={form.login}
                            onChange={e => setForm({...form, login: e.target.value})}
                            placeholder="Nouveau login"
                            required
                        />
                    </div>

                    <div style={S.formGroup}>
                        <label style={S.label}>Mot de passe actuel *</label>
                        <input
                            style={S.input}
                            type="password"
                            value={form.ancienMotDePasse}
                            onChange={e => setForm({...form, ancienMotDePasse: e.target.value})}
                            placeholder="Entrez votre mot de passe actuel"
                            required
                        />
                    </div>

                    <div style={S.formGroup}>
                        <label style={S.label}>Nouveau mot de passe (optionnel)</label>
                        <input
                            style={S.input}
                            type="password"
                            value={form.nouveauMotDePasse}
                            onChange={e => setForm({...form, nouveauMotDePasse: e.target.value})}
                            placeholder="Laissez vide pour ne pas changer"
                        />
                    </div>

                    {form.nouveauMotDePasse && (
                        <div style={S.formGroup}>
                            <label style={S.label}>Confirmer le nouveau mot de passe</label>
                            <input
                                style={S.input}
                                type="password"
                                value={form.confirmation}
                                onChange={e => setForm({...form, confirmation: e.target.value})}
                                placeholder="Confirmez votre nouveau mot de passe"
                            />
                        </div>
                    )}

                    {message && <div style={S.success}>{message}</div>}
                    {erreur && <div style={S.erreur}>{erreur}</div>}

                    <button type="submit" style={S.btnPrimary} disabled={loading}>
                        {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const S = {
    header: { marginBottom: '24px' },
    title: { fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' },
    subtitle: { color: '#94a3b8', fontSize: '14px', margin: 0 },
    card: {
        backgroundColor: '#fff', borderRadius: '12px',
        padding: '32px', maxWidth: '500px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9',
    },
    userInfo: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
    avatar: {
        width: '56px', height: '56px', borderRadius: '50%',
        backgroundColor: '#1B6B3A', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold', fontSize: '22px', flexShrink: 0,
    },
    userName: { fontSize: '18px', fontWeight: '700', color: '#0f172a' },
    userRole: { fontSize: '13px', color: '#94a3b8', marginTop: '2px' },
    divider: { border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 24px 0' },
    formGroup: { display: 'flex', flexDirection: 'column', marginBottom: '16px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
    input: {
        padding: '10px 12px', border: '1px solid #e2e8f0',
        borderRadius: '8px', fontSize: '14px', outline: 'none',
        color: '#333', backgroundColor: '#fafafa',
    },
    success: {
        backgroundColor: '#f0fdf4', color: '#16a34a',
        padding: '12px 16px', borderRadius: '8px',
        marginBottom: '16px', fontSize: '14px',
        border: '1px solid #bbf7d0',
    },
    erreur: {
        backgroundColor: '#fff1f2', color: '#f43f5e',
        padding: '12px 16px', borderRadius: '8px',
        marginBottom: '16px', fontSize: '14px',
        border: '1px solid #fecdd3',
    },
    btnPrimary: {
        width: '100%', padding: '12px',
        backgroundColor: '#1B6B3A', color: '#fff',
        border: 'none', borderRadius: '8px',
        fontSize: '15px', fontWeight: '600', cursor: 'pointer',
        marginTop: '8px',
    },
};

export default MonProfil;