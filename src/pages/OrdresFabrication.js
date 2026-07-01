import React, { useState, useEffect } from 'react';
import { getOFs, createOF, updateStatutOF, consommerLotMP, getLotsMP } from '../services/api';
import { MdAdd, MdClose } from 'react-icons/md';

const OrdresFabrication = () => {
    const [ofs, setOfs] = useState([]);
    const [lotsMP, setLotsMP] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState({
        dateCreation: '', dateLancement: '', quantitePlanifiee: ''
    });

    useEffect(() => { charger(); }, []);

    const charger = async () => {
        try {
            const [ofsRes, lotsRes] = await Promise.all([
                getOFs(), getLotsMP()
            ]);
            setOfs(ofsRes.data);
            setLotsMP(lotsRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createOF(form);
            setMessage('Ordre de fabrication créé avec succès !');
            setForm({ dateCreation: '', dateLancement: '', quantitePlanifiee: '' });
            setShowForm(false);
            charger();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Erreur');
        }
    };

    const handleStatut = async (id, statut) => {
        try {
            await updateStatutOF(id, { statut });
            charger();
        } catch (e) { console.error(e); }
    };

    const statutStyle = (s) => {
        const map = {
            PLANIFIE:  { bg: '#eff6ff', color: '#3b82f6' },
            EN_COURS:  { bg: '#fffbeb', color: '#f59e0b' },
            SUSPENDU:  { bg: '#faf5ff', color: '#a855f7' },
            TERMINE:   { bg: '#f0fdf4', color: '#16a34a' },
            ANNULE:    { bg: '#fff1f2', color: '#f43f5e' },
        };
        return map[s] || { bg: '#f1f5f9', color: '#555' };
    };

    return (
        <div>
            <div style={S.header}>
                <div>
                    <h1 style={S.title}>Ordres de Fabrication</h1>
                    <p style={S.subtitle}>Gérez les ordres de fabrication</p>
                </div>
                <button style={S.btnPrimary} onClick={() => setShowForm(true)}>
                    <MdAdd size={18} /> Nouvel OF
                </button>
            </div>

            {message && <div style={S.alert}>{message}</div>}

            {showForm && (
                <div style={S.modalOverlay}>
                    <div style={S.modal}>
                        <div style={S.modalHeader}>
                            <h3 style={S.modalTitle}>Nouvel ordre de fabrication</h3>
                            <button style={S.closeBtn} onClick={() => setShowForm(false)}>
                                <MdClose size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={S.formGrid}>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Date de création *</label>
                                    <input style={S.input} type="date"
                                        value={form.dateCreation}
                                        onChange={e => setForm({...form, dateCreation: e.target.value})}
                                        required />
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Date de lancement</label>
                                    <input style={S.input} type="date"
                                        value={form.dateLancement}
                                        onChange={e => setForm({...form, dateLancement: e.target.value})} />
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Quantité planifiée *</label>
                                    <input style={S.input} type="number"
                                        value={form.quantitePlanifiee}
                                        onChange={e => setForm({...form, quantitePlanifiee: e.target.value})}
                                        required />
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
                ) : ofs.length === 0 ? (
                    <p style={S.empty}>Aucun ordre de fabrication</p>
                ) : (
                    <table style={S.table}>
                        <thead>
                            <tr>
                                <th style={S.th}>Numéro OF</th>
                                <th style={S.th}>Date création</th>
                                <th style={S.th}>Date lancement</th>
                                <th style={S.th}>Qté planifiée</th>
                                <th style={S.th}>Statut</th>
                                <th style={S.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ofs.map((of) => {
                                const st = statutStyle(of.statut);
                                return (
                                    <tr key={of.id} style={S.tr}>
                                        <td style={S.td}>
                                            <span style={S.lotNum}>{of.numOrdreFabrication}</span>
                                        </td>
                                        <td style={S.td}>{of.dateCreation?.split('T')[0]}</td>
                                        <td style={S.td}>{of.dateLancement?.split('T')[0] || '—'}</td>
                                        <td style={S.td}>{of.quantitePlanifiee}</td>
                                        <td style={S.td}>
                                            <span style={{
                                                ...S.badge,
                                                backgroundColor: st.bg,
                                                color: st.color,
                                            }}>
                                                {of.statut}
                                            </span>
                                        </td>
                                        <td style={S.td}>
                                            <select style={S.selectAction}
                                                onChange={e => handleStatut(of.id, e.target.value)}
                                                defaultValue="">
                                                <option value="" disabled>Changer</option>
                                                <option value="EN_COURS">EN_COURS</option>
                                                <option value="SUSPENDU">SUSPENDU</option>
                                                <option value="TERMINE">TERMINE</option>
                                                <option value="ANNULE">ANNULE</option>
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
    lotNum: { fontFamily: 'monospace', fontWeight: '600', color: '#1B6B3A', fontSize: '13px' },
    badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    selectAction: { padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', color: '#374151', cursor: 'pointer' },
    empty: { color: '#94a3b8', textAlign: 'center', padding: '40px', fontSize: '14px' },
};

export default OrdresFabrication;