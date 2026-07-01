import React, { useState, useEffect } from 'react';
import { getUtilisateurs, creerUtilisateur } from '../services/api';
import { MdAdd, MdClose } from 'react-icons/md';

const Utilisateurs = () => {
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState({
        login: '', motDePasse: '', nom: '', role: ''
    });

    useEffect(() => { charger(); }, []);

    const charger = async () => {
        try {
            const res = await getUtilisateurs();
            setUtilisateurs(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await creerUtilisateur(form);
            setMessage('Utilisateur créé avec succès !');
            setForm({ login: '', motDePasse: '', nom: '', role: '' });
            setShowForm(false);
            charger();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Erreur');
        }
    };

    const roleStyle = (r) => {
        const map = {
            ADMINISTRATEUR:       { bg: '#faf5ff', color: '#a855f7' },
            RESP_ACHAT:           { bg: '#eff6ff', color: '#3b82f6' },
            RESP_QUALITE:         { bg: '#f0fdf4', color: '#16a34a' },
            RESP_STOCK:           { bg: '#fffbeb', color: '#f59e0b' },
            RESP_COMMERCIAL:      { bg: '#fff1f2', color: '#f43f5e' },
            OPERATEUR_PRODUCTION: { bg: '#f0f9ff', color: '#0ea5e9' },
            AUDITEUR:             { bg: '#f8fafc', color: '#94a3b8' },
        };
        return map[r] || { bg: '#f1f5f9', color: '#555' };
    };

    return (
        <div>
            <div style={S.header}>
                <div>
                    <h1 style={S.title}>Gestion des Utilisateurs</h1>
                    <p style={S.subtitle}>Invitez et gérez les utilisateurs de l'application</p>
                </div>
                <button style={S.btnPrimary} onClick={() => setShowForm(true)}>
                    <MdAdd size={18} /> Nouvel utilisateur
                </button>
            </div>

            {message && <div style={S.alert}>{message}</div>}

            {showForm && (
                <div style={S.modalOverlay}>
                    <div style={S.modal}>
                        <div style={S.modalHeader}>
                            <h3 style={S.modalTitle}>Nouvel utilisateur</h3>
                            <button style={S.closeBtn} onClick={() => setShowForm(false)}>
                                <MdClose size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={S.formGrid}>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Nom complet *</label>
                                    <input style={S.input}
                                        value={form.nom}
                                        onChange={e => setForm({...form, nom: e.target.value})}
                                        required />
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Login *</label>
                                    <input style={S.input}
                                        value={form.login}
                                        onChange={e => setForm({...form, login: e.target.value})}
                                        required />
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Mot de passe *</label>
                                    <input style={S.input} type="password"
                                        value={form.motDePasse}
                                        onChange={e => setForm({...form, motDePasse: e.target.value})}
                                        required />
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Rôle *</label>
                                    <select style={S.input}
                                        value={form.role}
                                        onChange={e => setForm({...form, role: e.target.value})}
                                        required>
                                        <option value="">Sélectionner</option>
                                        <option value="ADMINISTRATEUR">Administrateur</option>
                                        <option value="RESP_ACHAT">Responsable Achat</option>
                                        <option value="RESP_QUALITE">Responsable Qualité</option>
                                        <option value="RESP_STOCK">Responsable Stock</option>
                                        <option value="RESP_COMMERCIAL">Responsable Commercial</option>
                                        <option value="OPERATEUR_PRODUCTION">Opérateur Production</option>
                                        <option value="AUDITEUR">Auditeur</option>
                                    </select>
                                </div>
                            </div>
                            <div style={S.modalFooter}>
                                <button type="button" style={S.btnSecondary}
                                    onClick={() => setShowForm(false)}>Annuler</button>
                                <button type="submit" style={S.btnPrimary}>Créer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={S.tableCard}>
                {loading ? (
                    <p style={S.empty}>Chargement...</p>
                ) : utilisateurs.length === 0 ? (
                    <p style={S.empty}>Aucun utilisateur</p>
                ) : (
                    <table style={S.table}>
                        <thead>
                            <tr>
                                <th style={S.th}>Utilisateur</th>
                                <th style={S.th}>Login</th>
                                <th style={S.th}>Rôle</th>
                                <th style={S.th}>Statut</th>
                                <th style={S.th}>Date création</th>
                            </tr>
                        </thead>
                        <tbody>
                            {utilisateurs.map((u) => {
                                const rs = roleStyle(u.role);
                                return (
                                    <tr key={u.id} style={S.tr}>
                                        <td style={S.td}>
                                            <div style={S.nameCell}>
                                                <div style={S.avatar}>
                                                    {u.nom?.charAt(0).toUpperCase()}
                                                </div>
                                                <div style={S.nameText}>{u.nom}</div>
                                            </div>
                                        </td>
                                        <td style={S.td}>
                                            <span style={S.loginBadge}>{u.login}</span>
                                        </td>
                                        <td style={S.td}>
                                            <span style={{ ...S.badge, backgroundColor: rs.bg, color: rs.color }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={S.td}>
                                            <span style={{
                                                ...S.badge,
                                                backgroundColor: u.actif ? '#f0fdf4' : '#fff1f2',
                                                color: u.actif ? '#16a34a' : '#f43f5e',
                                            }}>
                                                {u.actif ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td style={S.td}>
                                            {u.dateCreation?.split('T')[0]}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const S = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
    title: { fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' },
    subtitle: { color: '#94a3b8', fontSize: '14px', margin: 0 },
    btnPrimary: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1B6B3A', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
    btnSecondary: { backgroundColor: '#f1f5f9', color: '#555', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    alert: { backgroundColor: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid #bbf7d0' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modal: { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '540px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    modalTitle: { fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' },
    modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    formGroup: { display: 'flex', flexDirection: 'column' },
    label: { fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
    input: { padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', color: '#333', backgroundColor: '#fafafa' },
    tableCard: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9' },
    tr: { borderBottom: '1px solid #f8fafc' },
    td: { padding: '14px 16px', fontSize: '14px', color: '#374151' },
    nameCell: { display: 'flex', alignItems: 'center', gap: '10px' },
    avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f0fdf4', color: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0, border: '1px solid #bbf7d0' },
    nameText: { fontWeight: '600', color: '#0f172a', fontSize: '14px' },
    badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    loginBadge: { fontFamily: 'monospace', backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: '6px', fontSize: '13px' },
    empty: { color: '#94a3b8', textAlign: 'center', padding: '40px', fontSize: '14px' },
};

export default Utilisateurs;