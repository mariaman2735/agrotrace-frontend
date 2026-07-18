import React, { useState, useEffect } from 'react';
import { getFournisseurs, createFournisseur, deleteFournisseur, getMatieresPremieres, setMatieresPremieresFournisseur } from '../services/api';
import { MdAdd, MdClose } from 'react-icons/md';
import { FiTrash2 } from 'react-icons/fi';

const Fournisseurs = () => {
    const [fournisseurs, setFournisseurs] = useState([]);
    const [matieresPremieres, setMatieresPremieres] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState({
        nom: '', NINEA: '', adresse: '', telephone: '', email: '', matierePremiereIds: []
    });

    useEffect(() => { charger(); }, []);

    const charger = async () => {
        try {
            const [fournRes, mpRes] = await Promise.all([
                getFournisseurs(), getMatieresPremieres()
            ]);
            setFournisseurs(fournRes.data);
            setMatieresPremieres(mpRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const toggleMatierePremiere = (id) => {
        setForm(prev => {
            const dejaChoisi = prev.matierePremiereIds.includes(id);
            return {
                ...prev,
                matierePremiereIds: dejaChoisi
                    ? prev.matierePremiereIds.filter(mpId => mpId !== id)
                    : [...prev.matierePremiereIds, id]
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { matierePremiereIds, ...fournisseurData } = form;
            const res = await createFournisseur(fournisseurData);

            // Lier les matières premières sélectionnées au fournisseur créé
            if (matierePremiereIds.length > 0) {
                await setMatieresPremieresFournisseur(res.data.fournisseurId, { matierePremiereIds });
            }

            setMessage('Fournisseur créé avec succès !');
            setForm({ nom: '', NINEA: '', adresse: '', telephone: '', email: '', matierePremiereIds: [] });
            setShowForm(false);
            charger();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Erreur');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce fournisseur ?')) return;
        try {
            await deleteFournisseur(id);
            charger();
        } catch (e) { alert('Erreur lors de la suppression'); }
    };

    return (
        <div>
            {/* Header */}
            <div style={S.header}>
                <div>
                    <h1 style={S.title}>Fournisseurs</h1>
                    <p style={S.subtitle}>Gérez vos fournisseurs et producteurs</p>
                </div>
                <button style={S.btnPrimary} onClick={() => setShowForm(true)}>
                    <MdAdd size={18} /> Nouveau fournisseur
                </button>
            </div>

            {/* Message */}
            {message && (
                <div style={S.alert}>{message}</div>
            )}

            {/* Modal formulaire */}
            {showForm && (
                <div style={S.modalOverlay}>
                    <div style={S.modal}>
                        <div style={S.modalHeader}>
                            <h3 style={S.modalTitle}>Nouveau fournisseur</h3>
                            <button style={S.closeBtn} onClick={() => setShowForm(false)}>
                                <MdClose size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={S.formGrid}>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Nom *</label>
                                    <input style={S.input} name="nom"
                                        value={form.nom}
                                        onChange={e => setForm({...form, nom: e.target.value})}
                                        required />
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>NINEA *</label>
                                    <input style={S.input} name="NINEA"
                                        value={form.NINEA}
                                        onChange={e => setForm({...form, NINEA: e.target.value})}
                                        required />
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Adresse</label>
                                    <input style={S.input} name="adresse"
                                        value={form.adresse}
                                        onChange={e => setForm({...form, adresse: e.target.value})} />
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Téléphone</label>
                                    <input style={S.input} name="telephone"
                                        value={form.telephone}
                                        onChange={e => setForm({...form, telephone: e.target.value})} />
                                </div>
                                <div style={{ ...S.formGroup, gridColumn: '1 / -1' }}>
                                    <label style={S.label}>Email</label>
                                    <input style={S.input} name="email" type="email"
                                        value={form.email}
                                        onChange={e => setForm({...form, email: e.target.value})} />
                                </div>
                                <div style={{ ...S.formGroup, gridColumn: '1 / -1' }}>
                                    <label style={S.label}>Matières premières fournies</label>
                                    <div style={S.mpList}>
                                        {matieresPremieres.length === 0 ? (
                                            <p style={S.mpEmpty}>Aucune matière première dans le catalogue</p>
                                        ) : (
                                            matieresPremieres.map(mp => (
                                                <label key={mp.id} style={S.mpItem}>
                                                    <input
                                                        type="checkbox"
                                                        checked={form.matierePremiereIds.includes(mp.id)}
                                                        onChange={() => toggleMatierePremiere(mp.id)}
                                                    />
                                                    {mp.nom} ({mp.code})
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div style={S.modalFooter}>
                                <button type="button" style={S.btnSecondary}
                                    onClick={() => setShowForm(false)}>
                                    Annuler
                                </button>
                                <button type="submit" style={S.btnPrimary}>
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table */}
            <div style={S.tableCard}>
                {loading ? (
                    <p style={S.empty}>Chargement...</p>
                ) : fournisseurs.length === 0 ? (
                    <p style={S.empty}>Aucun fournisseur enregistré</p>
                ) : (
                    <table style={S.table}>
                        <thead>
                            <tr>
                                <th style={S.th}>Nom</th>
                                <th style={S.th}>NINEA</th>
                                <th style={S.th}>Contact</th>
                                <th style={S.th}>Adresse</th>
                                <th style={S.th}>Matières fournies</th>
                                <th style={S.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fournisseurs.map((f) => (
                                <tr key={f.id} style={S.tr}>
                                    <td style={S.td}>
                                        <div style={S.nameCell}>
                                            <div style={S.avatar}>
                                                {f.nom?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={S.nameText}>{f.nom}</div>
                                                <div style={S.subText}>{f.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={S.td}>
                                        <span style={S.badge}>{f.NINEA}</span>
                                    </td>
                                    <td style={S.td}>
                                        <div style={S.nameText}>{f.telephone}</div>
                                    </td>
                                    <td style={S.td}>{f.adresse}</td>
                                    <td style={S.td}>
                                        {f.matieresPremieresFournies && f.matieresPremieresFournies.length > 0 ? (
                                            <div style={S.mpTagsWrap}>
                                                {f.matieresPremieresFournies.map(mp => (
                                                    <span key={mp.id} style={S.mpTag}>{mp.nom}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span style={S.subText}>—</span>
                                        )}
                                    </td>
                                    <td style={S.td}>
                                        <div style={S.actions}>
                                            <button style={S.iconBtn}
                                                onClick={() => handleDelete(f.id)}>
                                                <FiTrash2 size={16} color="#171616" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
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
        maxHeight: '90vh', overflowY: 'auto',
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
    mpList: {
        display: 'flex', flexDirection: 'column', gap: '8px',
        maxHeight: '160px', overflowY: 'auto',
        border: '1px solid #e2e8f0', borderRadius: '8px',
        padding: '10px 12px', backgroundColor: '#fafafa',
    },
    mpItem: {
        display: 'flex', alignItems: 'center', gap: '8px',
        fontSize: '14px', color: '#374151', cursor: 'pointer',
    },
    mpEmpty: { color: '#94a3b8', fontSize: '13px', margin: 0 },
    mpTagsWrap: { display: 'flex', flexWrap: 'wrap', gap: '4px' },
    mpTag: {
        backgroundColor: '#f0fdf4', color: '#1B6B3A',
        padding: '2px 8px', borderRadius: '12px',
        fontSize: '11px', fontWeight: '600',
        border: '1px solid #bbf7d0',
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
        letterSpacing: '0.5px',
        borderBottom: '1px solid #f1f5f9',
    },
    tr: { borderBottom: '1px solid #f8fafc' },
    td: { padding: '14px 16px', fontSize: '14px', color: '#374151' },
    nameCell: { display: 'flex', alignItems: 'center', gap: '10px' },
    avatar: {
        width: '36px', height: '36px', borderRadius: '50%',
        backgroundColor: '#f0fdf4', color: '#1B6B3A',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '700', fontSize: '14px', flexShrink: 0,
        border: '1px solid #bbf7d0',
    },
    nameText: { fontWeight: '600', color: '#0f172a', fontSize: '14px' },
    subText: { color: '#94a3b8', fontSize: '12px' },
    badge: {
        backgroundColor: '#f1f5f9', color: '#475569',
        padding: '3px 10px', borderRadius: '20px',
        fontSize: '12px', fontWeight: '500',
    },
    actions: { display: 'flex', gap: '8px' },
    iconBtn: {
        background: 'none', border: 'none',
        cursor: 'pointer', padding: '4px',
        borderRadius: '6px',
    },
    empty: { color: '#94a3b8', textAlign: 'center', padding: '40px', fontSize: '14px' },
};

export default Fournisseurs;