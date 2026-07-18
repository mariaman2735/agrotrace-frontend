import React, { useState, useEffect } from 'react';
import { getProduits, createProduit, updateProduit, deleteProduit } from '../services/api';
import { MdAdd, MdClose, MdEdit } from 'react-icons/md';
import { FiTrash2 } from 'react-icons/fi';

const Produits = () => {
    const [produits, setProduits] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState({
        nom: '', reference: '', categorie: '', uniteMesure: ''
    });

    useEffect(() => { charger(); }, []);

    const charger = async () => {
        try {
            const res = await getProduits();
            setProduits(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleEdit = (item) => {
        setEditItem(item);
        setForm({
            nom: item.nom, reference: item.reference,
            categorie: item.categorie || '',
            uniteMesure: item.uniteMesure || ''
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editItem) {
                await updateProduit(editItem.id, form);
                setMessage('Produit mis à jour !');
            } else {
                await createProduit(form);
                setMessage('Produit créé avec succès !');
            }
            setForm({ nom: '', reference: '', categorie: '', uniteMesure: '' });
            setEditItem(null);
            setShowForm(false);
            charger();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Erreur');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce produit ?')) return;
        try {
            await deleteProduit(id);
            charger();
        } catch (e) { alert('Erreur lors de la suppression'); }
    };

    return (
        <div>
            <div style={S.header}>
                <div>
                    <h1 style={S.title}>Produits</h1>
                    <p style={S.subtitle}>Gérez le catalogue des produits finis</p>
                </div>
                <button style={S.btnPrimary} onClick={() => { setEditItem(null); setForm({ nom: '', reference: '', categorie: '', uniteMesure: '' }); setShowForm(true); }}>
                    <MdAdd size={18} /> Nouveau produit
                </button>
            </div>

            {message && <div style={S.alert}>{message}</div>}

            {showForm && (
                <div style={S.modalOverlay}>
                    <div style={S.modal}>
                        <div style={S.modalHeader}>
                            <h3 style={S.modalTitle}>{editItem ? 'Modifier' : 'Nouveau produit'}</h3>
                            <button style={S.closeBtn} onClick={() => setShowForm(false)}>
                                <MdClose size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={S.formGrid}>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Nom *</label>
                                    <input style={S.input}
                                        placeholder="Ex: Jus de Bissap 1L"
                                        value={form.nom}
                                        onChange={e => setForm({...form, nom: e.target.value})}
                                        required />
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Référence *</label>
                                    <input style={S.input}
                                        placeholder="Ex: PF-BISS-1L"
                                        value={form.reference}
                                        onChange={e => setForm({...form, reference: e.target.value})}
                                        required />
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Catégorie</label>
                                    <input style={S.input}
                                        placeholder="Ex: Boisson, Snack..."
                                        value={form.categorie}
                                        onChange={e => setForm({...form, categorie: e.target.value})} />
                                </div>
                                <div style={S.formGroup}>
                                    <label style={S.label}>Unité</label>
                                    <input style={S.input}
                                        placeholder="Ex: unite, litre, kg..."
                                        value={form.uniteMesure}
                                        onChange={e => setForm({...form, uniteMesure: e.target.value})} />
                                </div>
                            </div>
                            <div style={S.modalFooter}>
                                <button type="button" style={S.btnSecondary}
                                    onClick={() => setShowForm(false)}>Annuler</button>
                                <button type="submit" style={S.btnPrimary}>
                                    {editItem ? 'Modifier' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={S.tableCard}>
                {loading ? (
                    <p style={S.empty}>Chargement...</p>
                ) : produits.length === 0 ? (
                    <p style={S.empty}>Aucun produit enregistré</p>
                ) : (
                    <table style={S.table}>
                        <thead>
                            <tr>
                                <th style={S.th}>Nom</th>
                                <th style={S.th}>Référence</th>
                                <th style={S.th}>Catégorie</th>
                                <th style={S.th}>Unité</th>
                                <th style={S.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {produits.map((p) => (
                                <tr key={p.id} style={S.tr}>
                                    <td style={S.td}>
                                        <span style={S.nameText}>{p.nom}</span>
                                    </td>
                                    <td style={S.td}>
                                        <span style={S.codeBadge}>{p.reference}</span>
                                    </td>
                                    <td style={S.td}>{p.categorie || '—'}</td>
                                    <td style={S.td}>{p.uniteMesure || '—'}</td>
                                    <td style={S.td}>
                                        <div style={S.actions}>
                                            <button style={S.iconBtn} onClick={() => handleEdit(p)}>
                                                <MdEdit size={16} color="#3b82f6" />
                                            </button>
                                            <button style={S.iconBtn} onClick={() => handleDelete(p.id)}>
                                                <FiTrash2 size={16} color="#ef4444" />
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
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
    title: { fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' },
    subtitle: { color: '#94a3b8', fontSize: '14px', margin: 0 },
    btnPrimary: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1B6B3A', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
    btnSecondary: { backgroundColor: '#f1f5f9', color: '#555', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    alert: { backgroundColor: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid #bbf7d0' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modal: { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '580px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' },
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
    nameText: { fontWeight: '600', color: '#0f172a' },
    codeBadge: { fontFamily: 'monospace', backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: '6px', fontSize: '13px' },
    actions: { display: 'flex', gap: '8px' },
    iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px' },
    empty: { color: '#94a3b8', textAlign: 'center', padding: '40px', fontSize: '14px' },
};

export default Produits;