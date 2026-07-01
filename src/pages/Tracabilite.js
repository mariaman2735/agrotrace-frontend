import React, { useState } from 'react';
import { getLotsMP, getLotsPF, getTraceabilite } from '../services/api';
import { MdSearch } from 'react-icons/md';

const Tracabilite = () => {
    const [recherche, setRecherche] = useState('');
    const [resultat, setResultat] = useState(null);
    const [loading, setLoading] = useState(false);
    const [erreur, setErreur] = useState('');

    const handleRecherche = async () => {
        if (!recherche.trim()) return;
        setLoading(true);
        setErreur('');
        setResultat(null);

        try {
            // Chercher dans les lots PF
            const pfRes = await getLotsPF();
            const lotPF = pfRes.data.find(l =>
                l.numLot.toLowerCase() === recherche.toLowerCase()
            );

            if (lotPF) {
                const traceRes = await getTraceabilite(lotPF.id);
                setResultat({ type: 'PF', ...traceRes.data });
                return;
            }

            // Chercher dans les lots MP
            const mpRes = await getLotsMP();
            const lotMP = mpRes.data.find(l =>
                l.numLot.toLowerCase() === recherche.toLowerCase()
            );

            if (lotMP) {
                setResultat({ type: 'MP', lot: lotMP });
                return;
            }

            setErreur('Aucun lot trouvé avec ce numéro.');
        } catch (e) {
            setErreur('Erreur lors de la recherche.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={S.header}>
                <div>
                    <h1 style={S.title}>Traçabilité</h1>
                    <p style={S.subtitle}>Recherchez un lot pour voir sa traçabilité complète</p>
                </div>
            </div>

            {/* Barre de recherche */}
            <div style={S.searchBox}>
                <div style={S.searchInputWrapper}>
                    <MdSearch size={20} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <input
                        style={S.searchInput}
                        placeholder="Entrez un numéro de lot (MP-2026-001, PF-2026-001...)"
                        value={recherche}
                        onChange={e => setRecherche(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleRecherche()}
                    />
                </div>
                <button style={S.btnRecherche} onClick={handleRecherche} disabled={loading}>
                    {loading ? 'Recherche...' : 'Rechercher'}
                </button>
            </div>

            {/* Erreur */}
            {erreur && (
                <div style={S.erreur}>{erreur}</div>
            )}

            {/* Résultat lot PF */}
            {resultat && resultat.type === 'PF' && (
                <div>
                    {/* Info lot PF */}
                    <div style={S.card}>
                        <h3 style={S.cardTitle}>Lot de Produit Fini</h3>
                        <div style={S.infoGrid}>
                            <div style={S.infoItem}>
                                <span style={S.infoLabel}>Numéro de lot</span>
                                <span style={S.lotNum}>{resultat.lotProduitFini?.numLot}</span>
                            </div>
                            <div style={S.infoItem}>
                                <span style={S.infoLabel}>Date de production</span>
                                <span style={S.infoValue}>{resultat.lotProduitFini?.dateProduction?.split('T')[0]}</span>
                            </div>
                            <div style={S.infoItem}>
                                <span style={S.infoLabel}>Quantité produite</span>
                                <span style={S.infoValue}>{resultat.lotProduitFini?.quantiteProduite}</span>
                            </div>
                            <div style={S.infoItem}>
                                <span style={S.infoLabel}>Statut</span>
                                <span style={S.infoValue}>{resultat.lotProduitFini?.statut}</span>
                            </div>
                            <div style={S.infoItem}>
                                <span style={S.infoLabel}>Ordre de fabrication</span>
                                <span style={S.lotNum}>{resultat.lotProduitFini?.numOrdreFabrication}</span>
                            </div>
                            <div style={S.infoItem}>
                                <span style={S.infoLabel}>DLC</span>
                                <span style={S.infoValue}>{resultat.lotProduitFini?.dateDC?.split('T')[0] || '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Matières premières utilisées */}
                    <div style={S.card}>
                        <h3 style={S.cardTitle}>
                            Matières premières utilisées
                            <span style={S.count}>{resultat.matieresPremières?.length || 0}</span>
                        </h3>
                        {resultat.matieresPremières?.length === 0 ? (
                            <p style={S.empty}>Aucune consommation enregistrée</p>
                        ) : (
                            <table style={S.table}>
                                <thead>
                                    <tr>
                                        <th style={S.th}>Lot MP</th>
                                        <th style={S.th}>Fournisseur</th>
                                        <th style={S.th}>Quantité consommée</th>
                                        <th style={S.th}>Date consommation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultat.matieresPremières?.map((mp, i) => (
                                        <tr key={i} style={S.tr}>
                                            <td style={S.td}><span style={S.lotNum}>{mp.numLotMP}</span></td>
                                            <td style={S.td}>{mp.fournisseurNom}</td>
                                            <td style={S.td}><strong style={{ color: '#1B6B3A' }}>{mp.quantiteConsommee}</strong></td>
                                            <td style={S.td}>{mp.dateConsommation?.split('T')[0]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Ventes */}
                    <div style={S.card}>
                        <h3 style={S.cardTitle}>
                            Ventes associées
                            <span style={S.count}>{resultat.ventes?.length || 0}</span>
                        </h3>
                        {resultat.ventes?.length === 0 ? (
                            <p style={S.empty}>Aucune vente enregistrée pour ce lot</p>
                        ) : (
                            <table style={S.table}>
                                <thead>
                                    <tr>
                                        <th style={S.th}>Référence</th>
                                        <th style={S.th}>Client</th>
                                        <th style={S.th}>Quantité vendue</th>
                                        <th style={S.th}>Date vente</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultat.ventes?.map((v, i) => (
                                        <tr key={i} style={S.tr}>
                                            <td style={S.td}><span style={S.lotNum}>{v.referenceCommande}</span></td>
                                            <td style={S.td}>{v.clientNom}</td>
                                            <td style={S.td}><strong style={{ color: '#1B6B3A' }}>{v.quantiteVendue}</strong></td>
                                            <td style={S.td}>{v.dateVente?.split('T')[0]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Résultat lot MP */}
            {resultat && resultat.type === 'MP' && (
                <div style={S.card}>
                    <h3 style={S.cardTitle}>Lot de Matière Première</h3>
                    <div style={S.infoGrid}>
                        <div style={S.infoItem}>
                            <span style={S.infoLabel}>Numéro de lot</span>
                            <span style={S.lotNum}>{resultat.lot?.numLot}</span>
                        </div>
                        <div style={S.infoItem}>
                            <span style={S.infoLabel}>Fournisseur</span>
                            <span style={S.infoValue}>{resultat.lot?.fournisseurNom}</span>
                        </div>
                        <div style={S.infoItem}>
                            <span style={S.infoLabel}>Date de réception</span>
                            <span style={S.infoValue}>{resultat.lot?.dateReception?.split('T')[0]}</span>
                        </div>
                        <div style={S.infoItem}>
                            <span style={S.infoLabel}>Quantité initiale</span>
                            <span style={S.infoValue}>{resultat.lot?.quantite}</span>
                        </div>
                        <div style={S.infoItem}>
                            <span style={S.infoLabel}>Quantité restante</span>
                            <span style={{ ...S.infoValue, color: '#1B6B3A', fontWeight: '700' }}>
                                {resultat.lot?.quantiteRestante}
                            </span>
                        </div>
                        <div style={S.infoItem}>
                            <span style={S.infoLabel}>Statut</span>
                            <span style={S.infoValue}>{resultat.lot?.statut}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Message initial */}
            {!resultat && !erreur && !loading && (
                <div style={S.emptyState}>
                    <MdSearch size={48} color="#e2e8f0" />
                    <p style={S.emptyTitle}>Recherchez un lot</p>
                    <p style={S.emptyText}>
                        Entrez un numéro de lot (ex: MP-2026-001 ou PF-2026-001) pour voir
                        toute sa chaîne de traçabilité
                    </p>
                </div>
            )}
        </div>
    );
};

const S = {
    header: { marginBottom: '24px' },
    title: { fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' },
    subtitle: { color: '#94a3b8', fontSize: '14px', margin: 0 },
    searchBox: { display: 'flex', gap: '12px', marginBottom: '24px' },
    searchInputWrapper: {
        flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
        backgroundColor: '#fff', border: '1px solid #e2e8f0',
        borderRadius: '10px', padding: '12px 16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    },
    searchInput: {
        flex: 1, border: 'none', outline: 'none',
        fontSize: '15px', color: '#333', backgroundColor: 'transparent',
    },
    btnRecherche: {
        backgroundColor: '#1B6B3A', color: '#fff',
        border: 'none', padding: '12px 24px',
        borderRadius: '10px', cursor: 'pointer',
        fontSize: '15px', fontWeight: '600',
    },
    erreur: {
        backgroundColor: '#fff1f2', color: '#f43f5e',
        padding: '12px 16px', borderRadius: '8px',
        marginBottom: '16px', fontSize: '14px',
        border: '1px solid #fecdd3',
    },
    card: {
        backgroundColor: '#fff', borderRadius: '12px',
        padding: '24px', marginBottom: '16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9',
    },
    cardTitle: {
        fontSize: '16px', fontWeight: '700', color: '#0f172a',
        margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px',
    },
    count: {
        backgroundColor: '#f1f5f9', color: '#64748b',
        padding: '2px 10px', borderRadius: '20px',
        fontSize: '13px', fontWeight: '600',
    },
    infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
    infoItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
    infoLabel: { fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
    infoValue: { fontSize: '14px', color: '#0f172a', fontWeight: '500' },
    lotNum: { fontFamily: 'monospace', fontWeight: '600', color: '#1B6B3A', fontSize: '14px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9' },
    tr: { borderBottom: '1px solid #f8fafc' },
    td: { padding: '12px', fontSize: '14px', color: '#374151' },
    empty: { color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '20px 0' },
    emptyState: { textAlign: 'center', padding: '60px 20px' },
    emptyTitle: { fontSize: '18px', fontWeight: '600', color: '#94a3b8', margin: '16px 0 8px' },
    emptyText: { color: '#cbd5e1', fontSize: '14px', maxWidth: '400px', margin: '0 auto' },
};

export default Tracabilite;