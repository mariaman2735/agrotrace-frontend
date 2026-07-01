import React, { useState, useEffect } from 'react';
import { getLotsPF, createLotPF, updateStatutLotPF, getTraceabilite, getOFs } from '../services/api';
import { MdAdd, MdClose, MdSearch } from 'react-icons/md';

const LotsPF = () => {
    const [lots, setLots] = useState([]);
    const [ofs, setOfs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showTrace, setShowTrace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState({
        dateProduction: '', quantiteProduite: '', dateDC: '', ordreFabrication_id: ''
    });

    useEffect(() => { charger(); }, []);

    const charger = async () => {
        try {
            const [lotsRes, ofsRes] = await Promise.all([getLotsPF(), getOFs()]);
            setLots(lotsRes.data);
            setOfs(ofsRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createLotPF(form);
            setMessage('Lot PF créé avec succès !');
            setForm({ dateProduction: '', quantiteProduite: '', dateDC: '', ordreFabrication_id: '' });
            setShowForm(false);
            charger();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Erreur');
        }
    };

    const handleStatut = async (id, statut) => {
        try {
            await updateStatutLotPF(id, { statut });
            charger();
        } catch (e) { console.error(e); }
    };

    const handleTrace = async (id) => {
        try {
            const res = await getTraceabilite(id);
            setShowTrace(res.data);
        } catch (e) { console.error(e); }
    };

    const statutStyle = (s) => {
        const map = {
            EN_ATTENTE:   { bg: '#fffbeb', color: '#f59e0b' },
            CONFORME:     { bg: '#f0fdf4', color: '#16a34a' },
            NON_CONFORME: { bg: '#fff1f2', color: '#f43f5e' },
            BLOQUE:       { bg: '#faf5ff', color: '#a855f7' },
            EPUISE:       { bg: '#f8fafc', color: '#94a3b8' },
        };
        return map[s] || { bg: '#f1f5f9', color: '#555' };
    };

    return (
        <div>
            <div style={S.header}>
                <div>
                    <h1 style={S.title}>Lots de Produits Finis</h1>
                    <p style={S.subtitle}>Consultez et gérez les lots de produits finis</p>
                </div>
                <button style={S.btnPrimary} onClick={() => setShowForm(true)}>
                    <MdAdd size={18} /> Nouveau lot PF
                </button>
            </div>

            {message && <div style={S.alert}>{message}</div>}

            {showForm && (
                <div style={S.modalOverlay}>
                    <div style={S.modal}>
                        <div style={S.modalHeader}>
                            <h3 style={S.modalTitle}>Nouveau lot de produit fini</h3>
                            <button style={S.closeBtn} onClick={() => setShowForm(false)}>
                                <MdClose size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={S.formGrid}>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Ordre de fabrication *</label>
                                    <select style={S.input}
                                        value={form.ordreFabrication_id}
                                        onChange={e => setForm({...form, ordreFabrication_id: e.target.value})}
                                        required>
                                        <option value="">Sélectionner</option>
                                        {ofs.filter(o => o.statut === 'EN_COURS' || o.statut === 'PLANIFIE').map(o => (
                                            <option key={o.id} value={o.id}>{o.numOrdreFabrication}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Date de production *</label>
                                    <input style={S.input} type="date"
                                        value={form.dateProduction}
                                        onChange={e => setForm({...form, dateProduction: e.target.value})}
                                        required />
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Quantité produite *</label>
                                    <input style={S.input} type="number"
                                        value={form.quantiteProduite}
                                        onChange={e => setForm({...form, quantiteProduite: e.target.value})}
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

            {/* Modal traçabilité */}
            {showTrace && (
                <div style={S.modalOverlay}>
                    <div style={{ ...S.modal, maxWidth: '640px' }}>
                        <div style={S.modalHeader}>
                            <h3 style={S.modalTitle}>Traçabilité — {showTrace.lotProduitFini?.numLot}</h3>
                            <button style={S.closeBtn} onClick={() => setShowTrace(null)}>
                                <MdClose size={20} />
                            </button>
                        </div>
                        <div>
                            <h4 style={{ color: '#374151', marginBottom: '8px' }}>Matières premières utilisées</h4>
                            {showTrace.matieresPremières?.length === 0 ? (
                                <p style={{ color: '#94a3b8' }}>Aucune consommation enregistrée</p>
                            ) : (
                                showTrace.matieresPremières?.map((mp, i) => (
                                    <div key={i} style={S.traceItem}>
                                        <span style={S.lotNum}>{mp.numLotMP}</span>
                                        <span style={{ color: '#374151' }}>{mp.fournisseurNom}</span>
                                        <span style={{ color: '#1B6B3A', fontWeight: '600' }}>
                                            {mp.quantiteConsommee} unités
                                        </span>
                                    </div>
                                ))
                            )}
                            <h4 style={{ color: '#374151', margin: '16px 0 8px' }}>Ventes associées</h4>
                            {showTrace.ventes?.length === 0 ? (
                                <p style={{ color: '#94a3b8' }}>Aucune vente enregistrée</p>
                            ) : (
                                showTrace.ventes?.map((v, i) => (
                                    <div key={i} style={S.traceItem}>
                                        <span style={S.lotNum}>{v.referenceCommande}</span>
                                        <span style={{ color: '#374151' }}>{v.clientNom}</span>
                                        <span style={{ color: '#1B6B3A', fontWeight: '600' }}>
                                            {v.quantiteVendue} unités
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div style={S.tableCard}>
                {loading ? (
                    <p style={S.empty}>Chargement...</p>
                ) : lots.length === 0 ? (
                    <p style={S.empty}>Aucun lot de produit fini</p>
                ) : (
                    <table style={S.table}>
                        <thead>
                            <tr>
                                <th style={S.th}>Numéro de lot</th>
                                <th style={S.th}>Date production</th>
                                <th style={S.th}>Qté produite</th>
                                <th style={S.th}>Qté disponible</th>
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
                                        <td style={S.td}>{lot.dateProduction?.split('T')[0]}</td>
                                        <td style={S.td}>{lot.quantiteProduite}</td>
                                        <td style={S.td}>{lot.quantiteDisponible}</td>
                                        <td style={S.td}>{lot.dateDC?.split('T')[0] || '—'}</td>
                                        <td style={S.td}>
                                            <span style={{ ...S.badge, backgroundColor: st.bg, color: st.color }}>
                                                {lot.statut}
                                            </span>
                                        </td>
                                        <td style={S.td}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <button style={S.traceBtn}
                                                    onClick={() => handleTrace(lot.id)}>
                                                    <MdSearch size={14} /> Tracer
                                                </button>
                                                <select style={S.selectAction}
                                                    onChange={e => handleStatut(lot.id, e.target.value)}
                                                    defaultValue="">
                                                    <option value="" disabled>Statut</option>
                                                    <option value="CONFORME">CONFORME</option>
                                                    <option value="NON_CONFORME">NON_CONFORME</option>
                                                    <option value="BLOQUE">BLOQUE</option>
                                                    <option value="EPUISE">EPUISE</option>
                                                </select>
                                            </div>
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
    traceBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', backgroundColor: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
    traceItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '6px' },
    empty: { color: '#94a3b8', textAlign: 'center', padding: '40px', fontSize: '14px' },
};

export default LotsPF;