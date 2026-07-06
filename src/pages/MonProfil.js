import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { MdEdit, MdClose } from 'react-icons/md';

const MonProfil = () => {
    const { utilisateur, logout } = useAuth();
    const [showEdit, setShowEdit] = useState(false);
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
            setMessage('Profil mis à jour ! Reconnectez-vous avec vos nouveaux identifiants.');
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

    const roleLabel = (role) => {
        const map = {
            ADMINISTRATEUR: 'Administrateur',
            RESP_ACHAT: 'Responsable Achat',
            RESP_QUALITE: 'Responsable Qualité',
            RESP_STOCK: 'Responsable Stock',
            RESP_COMMERCIAL: 'Responsable Commercial',
            OPERATEUR_PRODUCTION: 'Opérateur Production',
            AUDITEUR: 'Auditeur',
        };
        return map[role] || role;
    };

    const roleColor = (role) => {
        const map = {
            ADMINISTRATEUR: { bg: '#faf5ff', color: '#a855f7' },
            RESP_ACHAT: { bg: '#eff6ff', color: '#3b82f6' },
            RESP_QUALITE: { bg: '#f0fdf4', color: '#16a34a' },
            RESP_STOCK: { bg: '#fffbeb', color: '#f59e0b' },
            RESP_COMMERCIAL: { bg: '#fff1f2', color: '#f43f5e' },
            OPERATEUR_PRODUCTION: { bg: '#f0f9ff', color: '#0ea5e9' },
            AUDITEUR: { bg: '#f8fafc', color: '#94a3b8' },
        };
        return map[role] || { bg: '#f1f5f9', color: '#555' };
    };

    const rc = roleColor(utilisateur?.role);

    return (
        <div>
            <div style={S.header}>
                <h1 style={S.title}>Mon Profil</h1>
                <p style={S.subtitle}>Vos informations personnelles</p>
            </div>

            {/* Carte profil */}
            <div style={S.profileCard}>
                <div style={S.profileTop}>
                    <div style={S.avatarLarge}>
                        {utilisateur?.nom?.charAt(0).toUpperCase()}
                    </div>
                    <div style={S.profileInfo}>
                        <h2 style={S.profileName}>{utilisateur?.nom}</h2>
                        <span style={{ ...S.roleBadge, backgroundColor: rc.bg, color: rc.color }}>
                            {roleLabel(utilisateur?.role)}
                        </span>
                    </div>
                    <button style={S.btnEdit} onClick={() => setShowEdit(true)}>
                        <MdEdit size={16} /> Modifier mes identifiants
                    </button>
                </div>

                <hr style={S.divider} />

                <div style={S.infoGrid}>
                    <div style={S.infoItem}>
                        <span style={S.infoLabel}>Login</span>
                        <span style={S.infoValue}>{utilisateur?.login}</span>
                    </div>
                    <div style={S.infoItem}>
                        <span style={S.infoLabel}>Rôle</span>
                        <span style={S.infoValue}>{roleLabel(utilisateur?.role)}</span>
                    </div>
                    <div style={S.infoItem}>
                        <span style={S.infoLabel}>Statut</span>
                        <span style={{ ...S.infoValue, color: '#16a34a' }}>● Actif</span>
                    </div>
                    <div style={S.infoItem}>
                        <span style={S.infoLabel}>Système</span>
                        <span style={S.infoValue}>AgroTrace</span>
                    </div>
                </div>
            </div>

            {/* Modal modification */}
            {showEdit && (
                <div style={S.modalOverlay}>
                    <div style={S.modal}>
                        <div style={S.modalHeader}>
                            <h3 style={S.modalTitle}>Modifier mes identifiants</h3>
                            <button style={S.closeBtn} onClick={() => setShowEdit(false)}>
                                <MdClose size={20} />
                            </button>
                        </div>
                        <p style={S.modalSubtitle}>
                            Après modification vous serez déconnecté(e) automatiquement.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div style={S.formGroup}>
                                <label style={S.label}>Nouveau login</label>
                                <input style={S.input}
                                    value={form.login}
                                    onChange={e => setForm({...form, login: e.target.value})}
                                    required />
                            </div>
                            <div style={S.formGroup}>
                                <label style={S.label}>Mot de passe actuel *</label>
                                <input style={S.input} type="password"
                                    value={form.ancienMotDePasse}
                                    onChange={e => setForm({...form, ancienMotDePasse: e.target.value})}
                                    placeholder="Requis pour toute modification"
                                    required />
                            </div>
                            <div style={S.formGroup}>
                                <label style={S.label}>Nouveau mot de passe (optionnel)</label>
                                <input style={S.input} type="password"
                                    value={form.nouveauMotDePasse}
                                    onChange={e => setForm({...form, nouveauMotDePasse: e.target.value})}
                                    placeholder="Laissez vide pour ne pas changer" />
                            </div>
                            {form.nouveauMotDePasse && (
                                <div style={S.formGroup}>
                                    <label style={S.label}>Confirmer le nouveau mot de passe</label>
                                    <input style={S.input} type="password"
                                        value={form.confirmation}
                                        onChange={e => setForm({...form, confirmation: e.target.value})}
                                        placeholder="Confirmez votre nouveau mot de passe" />
                                </div>
                            )}

                            {message && <div style={S.success}>{message}</div>}
                            {erreur && <div style={S.erreur}>{erreur}</div>}

                            <div style={S.modalFooter}>
                                <button type="button" style={S.btnSecondary}
                                    onClick={() => setShowEdit(false)}>Annuler</button>
                                <button type="submit" style={S.btnPrimary} disabled={loading}>
                                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const S = {
    header: { marginBottom: '24px' },
    title: { fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' },
    subtitle: { color: '#94a3b8', fontSize: '14px', margin: 0 },
    profileCard: {
        backgroundColor: '#fff', borderRadius: '12px',
        padding: '32px', maxWidth: '700px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9',
    },
    profileTop: {
        display: 'flex', alignItems: 'center',
        gap: '20px', marginBottom: '24px',
    },
    avatarLarge: {
        width: '72px', height: '72px', borderRadius: '50%',
        backgroundColor: '#1B6B3A', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold', fontSize: '28px', flexShrink: 0,
    },
    profileInfo: { flex: 1 },
    profileName: { fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' },
    roleBadge: {
        display: 'inline-block', padding: '4px 14px',
        borderRadius: '20px', fontSize: '13px', fontWeight: '600',
    },
    btnEdit: {
        display: 'flex', alignItems: 'center', gap: '6px',
        backgroundColor: '#f8fafc', color: '#374151',
        border: '1px solid #e2e8f0', padding: '8px 16px',
        borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
        fontWeight: '600', whiteSpace: 'nowrap',
    },
    divider: { border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 24px 0' },
    infoGrid: {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
    },
    infoItem: {
        display: 'flex', flexDirection: 'column', gap: '4px',
        padding: '16px', backgroundColor: '#f8fafc',
        borderRadius: '8px', border: '1px solid #f1f5f9',
    },
    infoLabel: { fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
    infoValue: { fontSize: '15px', color: '#0f172a', fontWeight: '600' },
    modalOverlay: {
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 500, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
    },
    modal: {
        backgroundColor: '#fff', borderRadius: '16px',
        padding: '24px', width: '100%', maxWidth: '480px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    },
    modalHeader: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '8px',
    },
    modalTitle: { fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 },
    modalSubtitle: { fontSize: '13px', color: '#94a3b8', marginBottom: '20px' },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' },
    modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column', marginBottom: '14px' },
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
        backgroundColor: '#1B6B3A', color: '#fff',
        border: 'none', padding: '10px 20px',
        borderRadius: '8px', fontSize: '14px',
        fontWeight: '600', cursor: 'pointer',
    },
    btnSecondary: {
        backgroundColor: '#f1f5f9', color: '#555',
        border: '1px solid #e2e8f0', padding: '10px 18px',
        borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
    },
};

export default MonProfil;