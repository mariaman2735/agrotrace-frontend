import React, { useState, useEffect } from 'react';
import { getDemandesAcces, updateStatutDemande, creerUtilisateur } from '../services/api';
import { MdEmail, MdPhone, MdClose } from 'react-icons/md';

const fonctionToRole = (fonction) => {
    const map = {
        'Administrateur': 'ADMINISTRATEUR',
        'Responsable Achat': 'RESP_ACHAT',
        'Responsable Qualité': 'RESP_QUALITE',
        'Responsable Stock': 'RESP_STOCK',
        'Responsable Commercial': 'RESP_COMMERCIAL',
        'Opérateur Production': 'OPERATEUR_PRODUCTION',
        'Auditeur': 'AUDITEUR',
        'Stagiaire - Achat': 'RESP_ACHAT',
        'Stagiaire - Qualité': 'RESP_QUALITE',
        'Stagiaire - Production': 'OPERATEUR_PRODUCTION',
        'Stagiaire - Commercial': 'RESP_COMMERCIAL',
    };
    return map[fonction] || 'AUDITEUR';
};

const DemandesAcces = () => {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [showCreate, setShowCreate] = useState(null);
    const [form, setForm] = useState({ login: '', motDePasse: '', nom: '', role: '' });

    useEffect(() => { charger(); }, []);

    const charger = async () => {
        try {
            const res = await getDemandesAcces();
            setDemandes(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const ouvrirCreation = (demande) => {
        const prenom = demande.nom.split(' ')[0].toLowerCase();
        setForm({
            login: prenom,
            motDePasse: '',
            nom: demande.nom,
            role: fonctionToRole(demande.entreprise)
        });
        setShowCreate(demande);
    };

    const handleCreer = async (e) => {
        e.preventDefault();
        try {
            await creerUtilisateur(form);
            await updateStatutDemande(showCreate.id, { statut: 'ACCEPTEE' });
            setMessage(`Compte créé ! Identifiants à communiquer à ${form.nom} : login = "${form.login}", mot de passe = "${form.motDePasse}"`);
            setShowCreate(null);
            charger();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la création du compte');
        }
    };

    const handleRefuser = async (id) => {
        try {
            await updateStatutDemande(id, { statut: 'REFUSEE' });
            setMessage('Demande refusée.');
            charger();
            setTimeout(() => setMessage(''), 3000);
        } catch (e) { console.error(e); }
    };

    const statutStyle = (s) => {
        const map = {
            EN_ATTENTE: { bg: '#fffbeb', color: '#f59e0b' },
            ACCEPTEE:   { bg: '#f0fdf4', color: '#16a34a' },
            REFUSEE:    { bg: '#fff1f2', color: '#f43f5e' },
        };
        return map[s] || { bg: '#f1f5f9', color: '#555' };
    };

    return (
        <div>
            <div style={S.header}>
                <div>
                    <h1 style={S.title}>Demandes d'accès</h1>
                    <p style={S.subtitle}>Examinez et validez les demandes d'accès à la plateforme</p>
                </div>
            </div>

            {message && <div style={S.alert}>{message}</div>}

            {/* Modal création de compte */}
            {showCreate && (
                <div style={S.modalOverlay}>
                    <div style={S.modal}>
                        <div style={S.modalHeader}>
                            <h3 style={S.modalTitle}>Créer le compte de {showCreate.nom}</h3>
                            <button style={S.closeBtn} onClick={() => setShowCreate(null)}>
                                <MdClose size={20} />
                            </button>
                        </div>
                        <p style={S.modalInfo}>
                            Définissez un login et un mot de passe. Vous devrez les communiquer
                            vous-même à la personne (téléphone, en personne...).
                        </p>
                        <form onSubmit={handleCreer}>
                            <div style={S.formGroup}>
                                <label style={S.label}>Nom complet</label>
                                <input style={S.input} value={form.nom}
                                    onChange={e => setForm({...form, nom: e.target.value})} required />
                            </div>
                            <div style={S.formGroup}>
                                <label style={S.label}>Login *</label>
                                <input style={S.input} value={form.login}
                                    onChange={e => setForm({...form, login: e.target.value})} required />
                            </div>
                            <div style={S.formGroup}>
                                <label style={S.label}>Mot de passe *</label>
                                <input style={S.input} type="text" value={form.motDePasse}
                                    placeholder="Choisissez un mot de passe"
                                    onChange={e => setForm({...form, motDePasse: e.target.value})} required />
                            </div>
                            <div style={S.formGroup}>
                                <label style={S.label}>Rôle *</label>
                                <select style={S.input} value={form.role}
                                    onChange={e => setForm({...form, role: e.target.value})} required>
                                    <option value="ADMINISTRATEUR">Administrateur</option>
                                    <option value="RESP_ACHAT">Responsable Achat</option>
                                    <option value="RESP_QUALITE">Responsable Qualité</option>
                                    <option value="RESP_STOCK">Responsable Stock</option>
                                    <option value="RESP_COMMERCIAL">Responsable Commercial</option>
                                    <option value="OPERATEUR_PRODUCTION">Opérateur Production</option>
                                    <option value="AUDITEUR">Auditeur</option>
                                </select>
                            </div>
                            <div style={S.modalFooter}>
                                <button type="button" style={S.btnSecondary}
                                    onClick={() => setShowCreate(null)}>Annuler</button>
                                <button type="submit" style={S.btnPrimary}>Créer le compte</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={S.tableCard}>
                {loading ? (
                    <p style={S.empty}>Chargement...</p>
                ) : demandes.length === 0 ? (
                    <p style={S.empty}>Aucune demande d'accès</p>
                ) : (
                    <table style={S.table}>
                        <thead>
                            <tr>
                                <th style={S.th}>Demandeur</th>
                                <th style={S.th}>Contact</th>
                                <th style={S.th}>Fonction souhaitée</th>
                                <th style={S.th}>Date</th>
                                <th style={S.th}>Statut</th>
                                <th style={S.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {demandes.map((d) => {
                                const st = statutStyle(d.statut);
                                return (
                                    <tr key={d.id} style={S.tr}>
                                        <td style={S.td}>
                                            <div style={S.nameCell}>
                                                <div style={S.avatar}>
                                                    {d.nom?.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={S.nameText}>{d.nom}</span>
                                            </div>
                                        </td>
                                        <td style={S.td}>
                                            <div style={S.contactCell}>
                                                <div style={S.contactItem}>
                                                    <MdEmail size={13} color="#94a3b8" /> {d.email}
                                                </div>
                                                {d.telephone && (
                                                    <div style={S.contactItem}>
                                                        <MdPhone size={13} color="#94a3b8" /> {d.telephone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={S.td}>
                                            <span style={S.fonctionBadge}>
                                                {d.entreprise === 'Autre' ? d.motif : d.entreprise}
                                            </span>
                                        </td>
                                        <td style={S.td}>{d.dateCreation?.split('T')[0]}</td>
                                        <td style={S.td}>
                                            <span style={{ ...S.badge, backgroundColor: st.bg, color: st.color }}>
                                                {d.statut}
                                            </span>
                                        </td>
                                        <td style={S.td}>
                                            {d.statut === 'EN_ATTENTE' && (
                                                <div style={S.actions}>
                                                    <button style={S.btnAccept}
                                                        onClick={() => ouvrirCreation(d)}>
                                                        Accepter
                                                    </button>
                                                    <button style={S.btnReject}
                                                        onClick={() => handleRefuser(d.id)}>
                                                        Refuser
                                                    </button>
                                                </div>
                                            )}
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
    alert: { backgroundColor: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid #bbf7d0' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modal: { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    modalTitle: { fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 },
    modalInfo: { fontSize: '13px', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.5' },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' },
    modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column', marginBottom: '14px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
    input: { padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', color: '#333', backgroundColor: '#fafafa' },
    btnPrimary: { backgroundColor: '#1B6B3A', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
    btnSecondary: { backgroundColor: '#f1f5f9', color: '#555', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    tableCard: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9' },
    tr: { borderBottom: '1px solid #f8fafc' },
    td: { padding: '14px 16px', fontSize: '14px', color: '#374151' },
    nameCell: { display: 'flex', alignItems: 'center', gap: '10px' },
    avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f0fdf4', color: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0, border: '1px solid #bbf7d0' },
    nameText: { fontWeight: '600', color: '#0f172a', fontSize: '14px' },
    contactCell: { display: 'flex', flexDirection: 'column', gap: '4px' },
    contactItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' },
    fonctionBadge: { backgroundColor: '#eff6ff', color: '#3b82f6', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    actions: { display: 'flex', gap: '8px' },
    btnAccept: { backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
    btnReject: { backgroundColor: '#f1f5f9', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
    empty: { color: '#94a3b8', textAlign: 'center', padding: '40px', fontSize: '14px' },
};

export default DemandesAcces;