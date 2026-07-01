import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    getFournisseurs, getLotsMP, getOFs,
    getLotsPF, getVentes, getNonConformites
} from '../services/api';
import {
    MdFactory, MdShoppingCart, MdAccessTime, MdWarning,
    MdInventory, MdPeople, MdTrendingUp, MdReplay
} from 'react-icons/md';

const Dashboard = () => {
    const { utilisateur } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        fournisseurs: 0, lotsMP: 0, ofs: 0,
        lotsPF: 0, ventes: 0, nonConformites: 0
    });
    const [loading, setLoading] = useState(true);
    const today = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [f, lmp, of, lpf, v, nc] = await Promise.all([
                    getFournisseurs(), getLotsMP(), getOFs(),
                    getLotsPF(), getVentes(), getNonConformites()
                ]);
                setStats({
                    fournisseurs   : f.data.length,
                    lotsMP         : lmp.data.length,
                    ofs            : of.data.length,
                    lotsPF         : lpf.data.length,
                    ventes         : v.data.length,
                    nonConformites : nc.data.length
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        {
            label: 'Productions du jour',
            value: stats.ofs,
            Icon: MdFactory,
            iconBg: '#eff6ff',
            iconColor: '#3b82f6',
        },
        {
            label: 'Ventes enregistrées',
            value: stats.ventes,
            Icon: MdShoppingCart,
            iconBg: '#faf5ff',
            iconColor: '#a855f7',
        },
        {
            label: 'Lots proches péremption',
            value: 0,
            Icon: MdAccessTime,
            iconBg: '#fffbeb',
            iconColor: '#f59e0b',
        },
        {
            label: 'Non-conformités ouvertes',
            value: stats.nonConformites,
            Icon: MdWarning,
            iconBg: '#fff1f2',
            iconColor: '#f43f5e',
        },
    ];

    const sections = [
        {
            title: 'Dernières réceptions',
            Icon: MdInventory,
            value: stats.lotsMP,
            text: `${stats.lotsMP} lot(s) de matières premières`,
            emptyText: 'Aucune réception enregistrée',
            path: '/lots-mp',
        },
        {
            title: 'Non-conformités ouvertes',
            Icon: MdWarning,
            value: stats.nonConformites,
            text: `${stats.nonConformites} non-conformité(s)`,
            emptyText: 'Aucune non-conformité ouverte',
            path: '/non-conformites',
        },
        {
            title: 'Fournisseurs',
            Icon: MdPeople,
            value: stats.fournisseurs,
            text: `${stats.fournisseurs} fournisseur(s) enregistré(s)`,
            emptyText: 'Aucun fournisseur enregistré',
            path: '/fournisseurs',
        },
        {
            title: 'Dernières ventes',
            Icon: MdTrendingUp,
            value: stats.ventes,
            text: `${stats.ventes} vente(s) enregistrée(s)`,
            emptyText: 'Aucune vente enregistrée',
            path: '/ventes',
        },
    ];

    return (
        <div>
            {/* Header */}
            <div style={S.header}>
                <div>
                    <h1 style={S.title}>Tableau de bord</h1>
                    <p style={S.date}>{today}</p>
                </div>
            </div>

            {/* Stat cards */}
            <div style={S.grid4}>
                {cards.map((card, i) => (
                    <div key={i} style={S.card}>
                        <div style={S.cardTop}>
                            <span style={S.cardLabel}>{card.label}</span>
                            <div style={{ ...S.iconBox, backgroundColor: card.iconBg }}>
                                <card.Icon size={22} color={card.iconColor} />
                            </div>
                        </div>
                        <div style={S.cardValue}>{loading ? '...' : card.value}</div>
                    </div>
                ))}
            </div>

            {/* Bottom sections */}
            <div style={S.grid2}>
                {sections.map((sec, i) => (
                    <div key={i} style={S.section}>
                        <div style={S.sectionHeader}>
                            <div style={S.sectionTitleRow}>
                                <sec.Icon size={18} color="#1B6B3A" />
                                <h3 style={S.sectionTitle}>{sec.title}</h3>
                            </div>
                            <span style={S.seeAll} onClick={() => navigate(sec.path)}>
                                Voir tout →
                            </span>
                        </div>
                        <div style={S.sectionBody}>
                            <p style={S.empty}>
                                {sec.value === 0 ? sec.emptyText : sec.text}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const S = {
    header: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '24px',
    },
    title: {
        fontSize: '28px', fontWeight: '700',
        color: '#0f172a', margin: '0 0 4px 0',
    },
    date: { color: '#94a3b8', fontSize: '14px', margin: 0 },
    grid4: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px', marginBottom: '24px',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9',
    },
    cardTop: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '12px',
    },
    cardLabel: { color: '#94a3b8', fontSize: '13px', maxWidth: '70%' },
    iconBox: {
        width: '40px', height: '40px', borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    cardValue: {
        fontSize: '32px', fontWeight: '700', color: '#0f172a',
    },
    grid2: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9',
    },
    sectionHeader: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '16px',
    },
    sectionTitleRow: {
        display: 'flex', alignItems: 'center', gap: '8px',
    },
    sectionTitle: {
        fontSize: '15px', fontWeight: '600',
        color: '#0f172a', margin: 0,
    },
    seeAll: {
        color: '#1B6B3A', fontSize: '13px',
        cursor: 'pointer', fontWeight: '500',
    },
    sectionBody: { minHeight: '60px' },
    empty: {
        color: '#94a3b8', fontSize: '14px',
        textAlign: 'center', marginTop: '16px',
    },
};

export default Dashboard;