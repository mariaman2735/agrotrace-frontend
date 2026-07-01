 import React, { useState, useEffect } from 'react';
import { getNonConformites, createNonConformite, updateNonConformite, getLotsPF } from '../services/api';
import { MdAdd, MdClose } from 'react-icons/md';

const NonConformites = () => {
    const [ncs, setNcs] = useState([]);
    const [lotsPF, setLotsPF] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState({
        dateSignalement: '', type: '', gravite: '', description: '', lotPF_id: ''
    });

    useEffect(() => { charger(); }, []);

    const charger = async () => {
        try {
            const [ncsRes, lotsRes] = await Promise.all([
                getNonConformites(), getLotsPF()
            ]);
            setNcs(ncsRes.data);
            setLotsPF(lotsRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createNonConformite(form);
            setMessage('Non-conformité signalée avec succès !');
            setForm({ dateSignalement: '', type: '', gravite: '', description: '', lotPF_id: '' });
            setShowForm(false);
            charger();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Erreur');
        }
    };

    const handleStatut = async (id, statut) => {
        try {
            await updateNonConformite(id, { statut });
            charger();
        } catch (e) { console.error(e); }
    };

    const graviteStyle = (g) => {
        const map = {
            CRITIQUE: { bg: '#fff1f2', color: '#f43f5e' },
            MAJEURE:  { bg: '#fffbeb', color: '#f59e0b' },
            MINEURE:  { bg: '#f0fdf4', color: '#16a34a' },
        };
        return map[g] || { bg: '#f1f5f9', color: '#555' };
    };

    const statutStyle = (s) => {
        const map = {
            OUVERTE:  { bg: '#fff1f2', color: '#f43f5e' },
            EN_COURS: { bg: '#fffbeb', color: '#f59e0b' },
            CLOTUREE: { bg: '#f0fdf4', color: '#16a34a' },
            ARCHIVEE: { bg: '#f8fafc', color: '#94a3b8' },
        };
        return map[s] || { bg: '#f1f5f9', color: '#555' };
    };

    return (
        <div>
            <div style={S.header}>
                <div>
                    <h1 style={S.title}>Non-conformités</h1>
                    <p style={S.subtitle}>Gérez les non-conformités et actions correctives</p>
                </div>
                <button style={S.btnPrimary} onClick={() => setShowForm(true)}>
                    <MdAdd size={18} /> Signaler une NC
                </button>
            </div>

            {message && <div style={S.alert}>{message}</div>}

            {showForm && (
                <div style={S.modalOverlay}>
                    <div style={S.modal}>
                        <div style={S.modalHeader}>
                            <h3 style={S.modalTitle}>Signaler une non-conformité</h3>
                            <button style={S.closeBtn} onClick={() => setShowForm(false)}>
                                <MdClose size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={S.formGrid}>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Lot PF concerné *</label>
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
                                    <label style={S.label}>Date de signalement *</label>
                                    <input style={S.input} type="date"
                                        value={form.dateSignalement}
                                        onChange={e => setForm({...form, dateSignalement: e.target.value})}
                                        required />
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Type *</label>
                                    <input style={S.input}
                                        placeholder="Ex: Contamination, Défaut emballage..."
                                        value={form.type}
                                        onChange={e => setForm({...form, type: e.target.value})}
                                        required />
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Gravité *</label>
                                    <select style={S.input}
                                        value={form.gravite}
                                        onChange={e => setForm({...form, gravite: e.target.value})}
                                        required>
                                        <option value="">Sélectionner</option>
                                        <option value="CRITIQUE">CRITIQUE</option>
                                        <option value="MAJEURE">MAJEURE</option>
                                        <option value="MINEURE">MINEURE</option>
                                    </select>
                                </div>
                                <div style={{ ...S.formGroup, gridColumn: '1 / -1' }}>
                                    <label style={S.label}>Description *</label>
                                    <textarea style={{ ...S.input, height: '80px', resize: 'vertical' }}
                                        value={form.description}
                                        onChange={e => setForm({...form, description: e.target.value})}
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
                ) : ncs.length === 0 ? (
                    <p style={S.empty}>Aucune non-conformité enregistrée</p>
                ) : (
                    <table style={S.table}>
                        <thead>
                            <tr>
                                <th style={S.th}>Date</th>
                                <th style={S.th}>Lot PF</th>
                                <th style={S.th}>Type</th>
                                <th style={S.th}>Gravité</th>
                                <th style={S.th}>Description</th>
                                <th style={S.th}>Statut</th>
                                <th style={S.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ncs.map((nc) => {
                                const gs = graviteStyle(nc.gravite);
                                const ss = statutStyle(nc.statut);
                                return (
                                    <tr key={nc.id} style={S.tr}>
                                        <td style={S.td}>{nc.dateSignalement?.split('T')[0]}</td>
                                        <td style={S.td}>
                                            <span style={S.lotNum}>{nc.numLotPF}</span>
                                        </td>
                                        <td style={S.td}>{nc.type}</td>
                                        <td style={S.td}>
                                            <span style={{
                                                ...S.badge,
                                                backgroundColor: gs.bg,
                                                color: gs.color,
                                            }}>
                                                {nc.gravite}
                                            </span>
                                        </td>
                                        <td style={{ ...S.td, maxWidth: '200px' }}>
                                            {nc.description}
                                        </td>
                                        <td style={S.td}>
                                            <span style={{
                                                ...S.badge,
                                                backgroundColor: ss.bg,
                                                color: ss.color,
                                            }}>
                                                {nc.statut}
                                            </span>
                                        </td>
                                        <td style={S.td}>
                                            <select style={S.selectAction}
                                                onChange={e => handleStatut(nc.id, e.target.value)}
                                                defaultValue="">
                                                <option value="" disabled>Changer</option>
                                                <option value="EN_COURS">EN_COURS</option>
                                                <option value="CLOTUREE">CLOTUREE</option>
                                                <option value="ARCHIVEE">ARCHIVEE</option>
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
        padding: '24px', width: '100%', maxWidth: '580px',
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

export default NonConformites;