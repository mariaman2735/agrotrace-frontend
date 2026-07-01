import React, { useState, useEffect } from 'react';
import { getVentes, createVente, getLotsPF, getClients } from '../services/api';

const Ventes = () => {
    const [ventes, setVentes] = useState([]);
    const [lotsPF, setLotsPF] = useState([]);
    const [clients, setClients] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState({
        dateVente: '', referenceCommande: '',
        quantiteVendue: '', prixUnitaire: '',
        lotPF_id: '', client_id: ''
    });

    useEffect(() => {
        chargerDonnees();
    }, []);

    const chargerDonnees = async () => {
        try {
            const [ventesRes, lotsPFRes, clientsRes] = await Promise.all([
                getVentes(), getLotsPF(), getClients()
            ]);
            setVentes(ventesRes.data);
            setLotsPF(lotsPFRes.data);
            setClients(clientsRes.data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createVente(form);
            setMessage('Vente enregistrée avec succès !');
            setForm({
                dateVente: '', referenceCommande: '',
                quantiteVendue: '', prixUnitaire: '',
                lotPF_id: '', client_id: ''
            });
            setShowForm(false);
            chargerDonnees();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Erreur');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>💰 Gestion des Ventes</h2>
                <button style={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Annuler' : '+ Nouvelle vente'}
                </button>
            </div>

            {message && <div style={styles.message}>{message}</div>}

            {showForm && (
                <div style={styles.formCard}>
                    <h3 style={styles.formTitle}>Nouvelle vente</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGrid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Client *</label>
                                <select style={styles.input} name="client_id"
                                    value={form.client_id} onChange={handleChange} required>
                                    <option value="">Sélectionner un client</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.nom}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Lot produit fini *</label>
                                <select style={styles.input} name="lotPF_id"
                                    value={form.lotPF_id} onChange={handleChange} required>
                                    <option value="">Sélectionner un lot</option>
                                    {lotsPF.filter(l => l.statut === 'CONFORME').map(l => (
                                        <option key={l.id} value={l.id}>
                                            {l.numLot} — Disponible : {l.quantiteDisponible}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Date de vente *</label>
                                <input style={styles.input} type="date" name="dateVente"
                                    value={form.dateVente} onChange={handleChange} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Référence commande *</label>
                                <input style={styles.input} name="referenceCommande"
                                    value={form.referenceCommande} onChange={handleChange} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Quantité vendue *</label>
                                <input style={styles.input} type="number" name="quantiteVendue"
                                    value={form.quantiteVendue} onChange={handleChange} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Prix unitaire (FCFA) *</label>
                                <input style={styles.input} type="number" name="prixUnitaire"
                                    value={form.prixUnitaire} onChange={handleChange} required />
                            </div>
                        </div>
                        <button type="submit" style={styles.btnPrimary}>Enregistrer</button>
                    </form>
                </div>
            )}

            {loading ? <p>Chargement...</p> : (
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Référence</th>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Client</th>
                            <th style={styles.th}>Lot PF</th>
                            <th style={styles.th}>Quantité</th>
                            <th style={styles.th}>Prix unitaire</th>
                            <th style={styles.th}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ventes.map((v, i) => (
                            <tr key={v.id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                                <td style={styles.td}><b>{v.referenceCommande}</b></td>
                                <td style={styles.td}>{v.dateVente?.split('T')[0]}</td>
                                <td style={styles.td}>{v.clientNom}</td>
                                <td style={styles.td}>{v.numLotPF}</td>
                                <td style={styles.td}>{v.quantiteVendue}</td>
                                <td style={styles.td}>{v.prixUnitaire} FCFA</td>
                                <td style={styles.td}>
                                    <b>{(v.quantiteVendue * v.prixUnitaire).toLocaleString()} FCFA</b>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '22px', color: '#333', margin: 0 },
    btnPrimary: { backgroundColor: '#2e7d32', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
    message: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '10px 16px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
    formCard: { backgroundColor: '#fff', padding: '24px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '24px' },
    formTitle: { marginTop: 0, color: '#333', marginBottom: '16px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
    formGroup: { display: 'flex', flexDirection: 'column' },
    label: { fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#555' },
    input: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
    tableHeader: { backgroundColor: '#2e7d32' },
    th: { padding: '12px 16px', color: '#fff', textAlign: 'left', fontSize: '13px' },
    td: { padding: '12px 16px', fontSize: '13px', color: '#333' },
    trEven: { backgroundColor: '#f9f9f9' },
    trOdd: { backgroundColor: '#fff' },
};

export default Ventes;