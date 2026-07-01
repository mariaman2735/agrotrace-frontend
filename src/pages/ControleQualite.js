import React, { useState, useEffect } from 'react';
import { getControles, createControle, getLotsPF } from '../services/api';
import { MdAdd, MdClose } from 'react-icons/md';

const ControleQualite = () => {
    const [controles, setControles] = useState([]);
    const [lotsPF, setLotsPF] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState({
        dateControle: '', typeControle: '', resultats: '', statut: '', lotPF_id: ''
    });

    useEffect(() => { charger(); }, []);

    const charger = async () => {
        try {
            const [cRes, lRes] = await Promise.all([getControles(), getLotsPF()]);
            setControles(cRes.data);
            setLotsPF(lRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createControle(form);
            setMessage('Contrôle qualité enregistré avec succès !');
            setForm({ dateControle: '', typeControle: '', resultats: '', statut: '', lotPF_id: '' });
            setShowForm(false);
            charger();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Erreur');
        }
    };

    const statutStyle = (s) => {
        const map = {
            CONFORME:     { bg: '#f0fdf4', color: '#16a34a' },
            NON_CONFORME: { bg: '#fff1f2', color: '#f43f5e' },
            EN_ATTENTE:   { bg: '#fffbeb', color: '#f59e0b' },
        };
        return map[s] || { bg: '#f1f5f9', color: '#555' };
    };

    return (
        <div>
            <div style={S.header}>
                <div>
                    <h1 style={S.title}>Contrôle Qualité</h1>
                    <p style={S.subtitle}>Enregistrez et suivez les contrôles qualité</p>
                </div>
                <button style={S.btnPrimary} onClick={() => setShowForm(true)}>
                    <MdAdd size={18} /> Nouveau contrôle
                </button>
            </div>

            {message && <div style={S.alert}>{message}</div>}

            {showForm && (
                <div style={S.modalOverlay}>
                    <div style={S.modal}>
                        <div style={S.modalHeader}>
                            <h3 style={S.modalTitle}>Nouveau contrôle qualité</h3>
                            <button style={S.closeBtn} onClick={() => setShowForm(false)}>
                                <MdClose size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={S.formGrid}>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Lot PF *</label>
                                    <select style={S.input}
                                        value={form.lotPF_id}
                                        onChange={e => setForm({...form, lotPF_id: e.target.value})}
                                        required>
                                        <option value="">Sélectionner</option>
                                        {lotsPF.map(l => (
                                            <option key={l.id} value={l.id}>{l.numLot}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Date de contrôle *</label>
                                    <input style={S.input} type="date"
                                        value={form.dateControle}
                                        onChange={e => setForm({...form, dateControle: e.target.value})}
                                        required />
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Type de contrôle *</label>
                                    <input style={S.input}
                                        placeholder="Ex: Contrôle physique, microbiologique..."
                                        value={form.typeControle}
                                        onChange={e => setForm({...form, typeControle: e.target.value})}
                                        required />
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Résultat *</label>
                                    <select style={S.input}
                                        value={form.statut}
                                        onChange={e => setForm({...form, statut: e.target.value})}
                                        required>
                                        <option value="">Sélectionner</option>
                                        <option value="CONFORME">CONFORME</option>
                                        <option value="NON_CONFORME">NON_CONFORME</option>
                                        <option value="EN_ATTENTE">EN_ATTENTE</option>
                                    </select>
                                </div>
                                <div style={{ ...S.formGroup, gridColumn: '1 / -1' }}>
                                    <label style={S.label}>Observations</label>
                                    <textarea style={{ ...S.input, height: '80px', resize: 'vertical' }}
                                        value={form.resultats}
                                        onChange={e => setForm({...form, resultats: e.target.value})} />
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
                ) : controles.length === 0 ? (
                    <p style={S.empty}>Aucun contrôle qualité enregistré</p>
                ) : (
                    <table style={S.table}>
                        <thead>
                            <tr>
                                <th style={S.th}>Date</th>
                                <th style={S.th}>Lot PF</th>
                                <th style={S.th}>Type de contrôle</th>
                                <th style={S.th}>Observations</th>
                                <th style={S.th}>Résultat</th>
                                <th style={S.th}>Responsable</th>
                            </tr>
                        </thead>
                        <tbody>
                            {controles.map((c) => {
                                const st = statutStyle(c.statut);
                                return (
                                    <tr key={c.id} style={S.tr}>
                                        <td style={S.td}>{c.dateControle?.split('T')[0]}</td>
                                        <td style={S.td}>
                                            <span style={S.lotNum}>{c.numLotPF}</span>
                                        </td>
                                        <td style={S.td}>{c.typeControle}</td>
                                        <td style={{ ...S.td, maxWidth: '200px' }}>{c.resultats || '—'}</td>
                                        <td style={S.td}>
                                            <span style={{ ...S.badge, backgroundColor: st.bg, color: st.color }}>
                                                {c.statut}
                                            </span>
                                        </td>
                                        <td style={S.td}>{c.responsableNom || '—'}</td>
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
    empty: { color: '#94a3b8', textAlign: 'center', padding: '40px', fontSize: '14px' },
};

export default ControleQualite;