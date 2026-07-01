import React, { useState, useEffect } from 'react';
import { getLotsMP, createLotMP, updateStatutLotMP, getFournisseurs } from '../services/api';
import { MdAdd, MdClose } from 'react-icons/md';
import { FiTrash2 } from 'react-icons/fi';

const LotsMP = () => {
    const [lots, setLots] = useState([]);
    const [fournisseurs, setFournisseurs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState({
        dateReception: '', quantite: '', dateDC: '', fournisseur_id: ''
    });

    useEffect(() => { charger(); }, []);

    const charger = async () => {
        try {
            const [lotsRes, fournRes] = await Promise.all([
                getLotsMP(), getFournisseurs()
            ]);
            setLots(lotsRes.data);
            setFournisseurs(fournRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createLotMP(form);
            setMessage('Lot MP créé avec succès !');
            setForm({ dateReception: '', quantite: '', dateDC: '', fournisseur_id: '' });
            setShowForm(false);
            charger();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Erreur');
        }
    };

    const handleStatut = async (id, statut) => {
        try {
            await updateStatutLotMP(id, { statut });
            charger();
        } catch (e) { console.error(e); }
    };

    const statutStyle = (statut) => {
        const map = {
            RECU:          { bg: '#eff6ff', color: '#3b82f6' },
            EN_ATTENTE:    { bg: '#fffbeb', color: '#f59e0b' },
            CONFORME:      { bg: '#f0fdf4', color: '#16a34a' },
            NON_CONFORME:  { bg: '#fff1f2', color: '#f43f5e' },
            BLOQUE:        { bg: '#faf5ff', color: '#a855f7' },
            EPUISE:        { bg: '#f8fafc', color: '#94a3b8' },
        };
        return map[statut] || { bg: '#f1f5f9', color: '#555' };
    };

    return (
        <div>
            <div style={S.header}>
                <div>
                    <h1 style={S.title}>Lots de Matières Premières</h1>
                    <p style={S.subtitle}>Enregistrez les réceptions de matières premières</p>
                </div>
                <button style={S.btnPrimary} onClick={() => setShowForm(true)}>
                    <MdAdd size={18} /> Nouvelle réception
                </button>
            </div>

            {message && <div style={S.alert}>{message}</div>}

            {showForm && (
                <div style={S.modalOverlay}>
                    <div style={S.modal}>
                        <div style={S.modalHeader}>
                            <h3 style={S.modalTitle}>Nouvelle réception</h3>
                            <button style={S.closeBtn} onClick={() => setShowForm(false)}>
                                <MdClose size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={S.formGrid}>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Fournisseur *</label>
                                    <select style={S.input}
                                        value={form.fournisseur_id}
                                        onChange={e => setForm({...form, fournisseur_id: e.target.value})}
                                        required>
                                        <option value="">Sélectionner</option>
                                        {fournisseurs.map(f => (
                                            <option key={f.id} value={f.id}>{f.nom}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Date de réception *</label>
                                    <input style={S.input} type="date"
                                        value={form.dateReception}
                                        onChange={e => setForm({...form, dateReception: e.target.value})}
                                        required />
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Quantité *</label>
                                    <input style={S.input} type="number"
                                        value={form.quantite}
                                        onChange={e => setForm({...form, quantite: e.target.value})}
                                        required />
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Date limite consommation</label>
                                    <input style={S.input} type="date"
                                        value={form.dateDC}
                                        onChange={e => setForm({...form, dateDC: e.target.value})} />
                                </div>
                            </div>
                            <div style={S.modalFooter}>
                                <button type="button" style={S.btnSecondary}
                                    onClick={() => setShowForm(false)}>Annuler</button>
                                <button type="submit" style={S.btnPrimary}>Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={S.tableCard}>
                {loading ? (
                    <p style={S.empty}>Chargement...</p>
                ) : lots.length === 0 ? (
                    <p style={S.empty}>Aucune réception enregistrée</p>
                ) : (
                    <table style={S.table}>
                        <thead>
                            <tr>
                                <th style={S.th}>Numéro de lot</th>
                                <th style={S.th}>Fournisseur</th>
                                <th style={S.th}>Date réception</th>
                                <th style={S.th}>Quantité</th>
                                <th style={S.th}>Qté restante</th>
                                <th style={S.th}>DLC</th>
                                <th style={S.th}>Statut</th>
                                <th style={S.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lots.map((lot) => {
                                const st = statutStyle(lot.statut);
                                return (
                                    <tr key={lot.id} style={S.tr}>
                                        <td style={S.td}>
                                            <span style={S.lotNum}>{lot.numLot}</span>
                                        </td>
                                        <td style={S.td}>{lot.fournisseurNom}</td>
                                        <td style={S.td}>{lot.dateReception?.split('T')[0]}</td>
                                        <td style={S.td}>{lot.quantite}</td>
                                        <td style={S.td}>{lot.quantiteRestante}</td>
                                        <td style={S.td}>{lot.dateDC?.split('T')[0] || '—'}</td>
                                        <td style={S.td}>
                                            <span style={{
                                                ...S.badge,
                                                backgroundColor: st.bg,
                                                color: st.color,
                                            }}>
                                                {lot.statut}
                                            </span>
                                        </td>
                                        <td style={S.td}>
                                            <select style={S.selectAction}
                                                onChange={e => handleStatut(lot.id, e.target.value)}
                                                defaultValue="">
                                                <option value="" disabled>Changer</option>
                                                <option value="CONFORME">CONFORME</option>
                                                <option value="NON_CONFORME">NON_CONFORME</option>
                                                <option value="BLOQUE">BLOQUE</option>
                                                <option value="EPUISE">EPUISE</option>
                                            </select>
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
    header: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '24px',
    },
    title: { fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' },
    subtitle: { color: '#94a3b8', fontSize: '14px', margin: 0 },
    btnPrimary: {
        display: 'flex', alignItems: 'center', gap: '6px',
        backgroundColor: '#1B6B3A', color: '#fff',
        border: 'none', padding: '10px 18px',
        borderRadius: '8px', cursor: 'pointer',
        fontSize: '14px', fontWeight: '600',
    },
    btnSecondary: {
        backgroundColor: '#f1f5f9', color: '#555',
        border: '1px solid #e2e8f0', padding: '10px 18px',
        borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
    },
    alert: {
        backgroundColor: '#f0fdf4', color: '#16a34a',
        padding: '12px 16px', borderRadius: '8px',
        marginBottom: '16px', fontSize: '14px',
        border: '1px solid #bbf7d0',
    },
    modalOverlay: {
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 500, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
    },
    modal: {
        backgroundColor: '#fff', borderRadius: '16px',
        padding: '24px', width: '100%', maxWidth: '540px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    },
    modalHeader: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '20px',
    },
    modalTitle: { fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 },
    closeBtn: {
        background: 'none', border: 'none',
        cursor: 'pointer', color: '#94a3b8', padding: '4px',
    },
    modalFooter: {
        display: 'flex', justifyContent: 'flex-end',
        gap: '10px', marginTop: '20px',
    },
    formGrid: {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
    },
    formGroup: { display: 'flex', flexDirection: 'column' },
    label: { fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
    input: {
        padding: '10px 12px', border: '1px solid #e2e8f0',
        borderRadius: '8px', fontSize: '14px', outline: 'none',
        color: '#333', backgroundColor: '#fafafa',
    },
    tableCard: {
        backgroundColor: '#fff', borderRadius: '12px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9', overflow: 'hidden',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
        padding: '12px 16px', textAlign: 'left',
        fontSize: '12px', fontWeight: '600',
        color: '#94a3b8', textTransform: 'uppercase',
        letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9',
    },
    tr: { borderBottom: '1px solid #f8fafc' },
    td: { padding: '14px 16px', fontSize: '14px', color: '#374151' },
    lotNum: {
        fontFamily: 'monospace', fontWeight: '600',
        color: '#1B6B3A', fontSize: '13px',
    },
    badge: {
        padding: '4px 10px', borderRadius: '20px',
        fontSize: '12px', fontWeight: '600',
    },
    selectAction: {
        padding: '6px 10px', border: '1px solid #e2e8f0',
        borderRadius: '6px', fontSize: '12px',
        color: '#374151', cursor: 'pointer',
    },
    empty: { color: '#94a3b8', textAlign: 'center', padding: '40px', fontSize: '14px' },
};

export default LotsMP;