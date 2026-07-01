import React, { useState, useEffect } from 'react';
import { getLotsMP, getLotsPF } from '../services/api';
import { MdInventory, MdWarning } from 'react-icons/md';

const Stock = () => {
    const [lotsMP, setLotsMP] = useState([]);
    const [lotsPF, setLotsPF] = useState([]);
    const [loading, setLoading] = useState(true);
    const [onglet, setOnglet] = useState('mp');

    useEffect(() => { charger(); }, []);

    const charger = async () => {
        try {
            const [mpRes, pfRes] = await Promise.all([getLotsMP(), getLotsPF()]);
            setLotsMP(mpRes.data);
            setLotsPF(pfRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const totalMP = lotsMP.reduce((acc, l) => acc + (l.quantiteRestante || 0), 0);
    const totalPF = lotsPF.reduce((acc, l) => acc + (l.quantiteDisponible || 0), 0);
    const alertesMP = lotsMP.filter(l => l.statut === 'BLOQUE' || l.statut === 'NON_CONFORME').length;
    const alertesPF = lotsPF.filter(l => l.statut === 'BLOQUE' || l.statut === 'NON_CONFORME').length;

    const statutStyle = (s) => {
        const map = {
            RECU:          { bg: '#eff6ff', color: '#3b82f6' },
            EN_ATTENTE:    { bg: '#fffbeb', color: '#f59e0b' },
            CONFORME:      { bg: '#f0fdf4', color: '#16a34a' },
            NON_CONFORME:  { bg: '#fff1f2', color: '#f43f5e' },
            BLOQUE:        { bg: '#faf5ff', color: '#a855f7' },
            EPUISE:        { bg: '#f8fafc', color: '#94a3b8' },
        };
        return map[s] || { bg: '#f1f5f9', color: '#555' };
    };

    return (
        <div>
            <div style={S.header}>
                <div>
                    <h1 style={S.title}>Stocks</h1>
                    <p style={S.subtitle}>Vue d'ensemble des stocks de matières premières et produits finis</p>
                </div>
            </div>

            {/* Cartes résumé */}
            <div style={S.grid4}>
                <div style={S.card}>
                    <div style={S.cardTop}>
                        <span style={S.cardLabel}>Stock MP total</span>
                        <div style={{ ...S.iconBox, backgroundColor: '#eff6ff' }}>
                            <MdInventory size={22} color="#3b82f6" />
                        </div>
                    </div>
                    <div style={S.cardValue}>{totalMP}</div>
                    <div style={S.cardSub}>{lotsMP.length} lot(s)</div>
                </div>
                <div style={S.card}>
                    <div style={S.cardTop}>
                        <span style={S.cardLabel}>Stock PF disponible</span>
                        <div style={{ ...S.iconBox, backgroundColor: '#f0fdf4' }}>
                            <MdInventory size={22} color="#16a34a" />
                        </div>
                    </div>
                    <div style={S.cardValue}>{totalPF}</div>
                    <div style={S.cardSub}>{lotsPF.length} lot(s)</div>
                </div>
                <div style={S.card}>
                    <div style={S.cardTop}>
                        <span style={S.cardLabel}>Alertes MP</span>
                        <div style={{ ...S.iconBox, backgroundColor: '#fff1f2' }}>
                            <MdWarning size={22} color="#f43f5e" />
                        </div>
                    </div>
                    <div style={{ ...S.cardValue, color: alertesMP > 0 ? '#f43f5e' : '#0f172a' }}>
                        {alertesMP}
                    </div>
                    <div style={S.cardSub}>lots bloqués ou NC</div>
                </div>
                <div style={S.card}>
                    <div style={S.cardTop}>
                        <span style={S.cardLabel}>Alertes PF</span>
                        <div style={{ ...S.iconBox, backgroundColor: '#fff1f2' }}>
                            <MdWarning size={22} color="#f43f5e" />
                        </div>
                    </div>
                    <div style={{ ...S.cardValue, color: alertesPF > 0 ? '#f43f5e' : '#0f172a' }}>
                        {alertesPF}
                    </div>
                    <div style={S.cardSub}>lots bloqués ou NC</div>
                </div>
            </div>

            {/* Onglets */}
            <div style={S.tabs}>
                <button
                    style={{ ...S.tab, ...(onglet === 'mp' ? S.tabActive : {}) }}
                    onClick={() => setOnglet('mp')}>
                    Matières premières
                </button>
                <button
                    style={{ ...S.tab, ...(onglet === 'pf' ? S.tabActive : {}) }}
                    onClick={() => setOnglet('pf')}>
                    Produits finis
                </button>
            </div>

            {/* Table */}
            <div style={S.tableCard}>
                {loading ? (
                    <p style={S.empty}>Chargement...</p>
                ) : onglet === 'mp' ? (
                    lotsMP.length === 0 ? (
                        <p style={S.empty}>Aucun lot de matière première</p>
                    ) : (
                        <table style={S.table}>
                            <thead>
                                <tr>
                                    <th style={S.th}>Numéro de lot</th>
                                    <th style={S.th}>Fournisseur</th>
                                    <th style={S.th}>Date réception</th>
                                    <th style={S.th}>Stock total</th>
                                    <th style={S.th}>Stock disponible</th>
                                    <th style={S.th}>DLC</th>
                                    <th style={S.th}>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lotsMP.map((lot) => {
                                    const st = statutStyle(lot.statut);
                                    return (
                                        <tr key={lot.id} style={S.tr}>
                                            <td style={S.td}>
                                                <span style={S.lotNum}>{lot.numLot}</span>
                                            </td>
                                            <td style={S.td}>{lot.fournisseurNom}</td>
                                            <td style={S.td}>{lot.dateReception?.split('T')[0]}</td>
                                            <td style={S.td}>{lot.quantite}</td>
                                            <td style={S.td}>
                                                <strong style={{ color: lot.quantiteRestante === 0 ? '#f43f5e' : '#16a34a' }}>
                                                    {lot.quantiteRestante}
                                                </strong>
                                            </td>
                                            <td style={S.td}>{lot.dateDC?.split('T')[0] || '—'}</td>
                                            <td style={S.td}>
                                                <span style={{ ...S.badge, backgroundColor: st.bg, color: st.color }}>
                                                    {lot.statut}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )
                ) : (
                    lotsPF.length === 0 ? (
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
                                </tr>
                            </thead>
                            <tbody>
                                {lotsPF.map((lot) => {
                                    const st = statutStyle(lot.statut);
                                    return (
                                        <tr key={lot.id} style={S.tr}>
                                            <td style={S.td}>
                                                <span style={S.lotNum}>{lot.numLot}</span>
                                            </td>
                                            <td style={S.td}>{lot.dateProduction?.split('T')[0]}</td>
                                            <td style={S.td}>{lot.quantiteProduite}</td>
                                            <td style={S.td}>
                                                <strong style={{ color: lot.quantiteDisponible === 0 ? '#f43f5e' : '#16a34a' }}>
                                                    {lot.quantiteDisponible}
                                                </strong>
                                            </td>
                                            <td style={S.td}>{lot.dateDC?.split('T')[0] || '—'}</td>
                                            <td style={S.td}>
                                                <span style={{ ...S.badge, backgroundColor: st.bg, color: st.color }}>
                                                    {lot.statut}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )
                )}
            </div>
        </div>
    );
};

const S = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
    title: { fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' },
    subtitle: { color: '#94a3b8', fontSize: '14px', margin: 0 },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    card: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
    cardLabel: { color: '#94a3b8', fontSize: '13px', maxWidth: '70%' },
    iconBox: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    cardValue: { fontSize: '32px', fontWeight: '700', color: '#0f172a' },
    cardSub: { color: '#94a3b8', fontSize: '12px', marginTop: '4px' },
    tabs: { display: 'flex', gap: '4px', marginBottom: '16px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', width: 'fit-content' },
    tab: { padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', backgroundColor: 'transparent', color: '#64748b' },
    tabActive: { backgroundColor: '#fff', color: '#1B6B3A', fontWeight: '700', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
    tableCard: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9' },
    tr: { borderBottom: '1px solid #f8fafc' },
    td: { padding: '14px 16px', fontSize: '14px', color: '#374151' },
    lotNum: { fontFamily: 'monospace', fontWeight: '600', color: '#1B6B3A', fontSize: '13px' },
    badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    empty: { color: '#94a3b8', textAlign: 'center', padding: '40px', fontSize: '14px' },
};

export default Stock;