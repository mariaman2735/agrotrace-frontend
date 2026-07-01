import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDemandeAcces } from '../services/api';

const DemandeAcces = () => {
    const [form, setForm] = useState({
        nom: '', email: '', telephone: '', fonction: '', motif: ''
    });
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createDemandeAcces({ ...form, entreprise: form.fonction });
            setSuccess(true);
            setMessage('Votre demande a été envoyée avec succès ! Vous serez contacté(e) prochainement par l\'administrateur.');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Erreur lors de l\'envoi de la demande');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={S.page}>
            <div style={S.container}>
                <img src="/logo.png" alt="AgroTrace" style={S.logo} />

                {!success ? (
                    <>
                        <h2 style={S.title}>Demande d'accès</h2>
                        <p style={S.subtitle}>
                            Vous êtes un employé de l'entreprise et vous n'avez pas encore de compte ?
                            Remplissez ce formulaire, votre demande sera examinée par l'administrateur.
                        </p>

                        <form onSubmit={handleSubmit} style={S.form}>
                            <input
                                style={S.input}
                                placeholder="Nom complet *"
                                value={form.nom}
                                onChange={e => setForm({...form, nom: e.target.value})}
                                required
                            />
                            <input
                                style={S.input}
                                type="email"
                                placeholder="Email *"
                                value={form.email}
                                onChange={e => setForm({...form, email: e.target.value})}
                                required
                            />
                            <input
                                style={S.input}
                                placeholder="Téléphone"
                                value={form.telephone}
                                onChange={e => setForm({...form, telephone: e.target.value})}
                            />
                           <select
                                style={S.input}
                                value={form.fonction}
                                onChange={e => setForm({...form, fonction: e.target.value})}
                                required
                            >
                                <option value="">Votre fonction *</option>
                                <option value="Administrateur">Administrateur</option>
                                <option value="Responsable Achat">Responsable Achat</option>
                                <option value="Responsable Qualité">Responsable Qualité</option>
                                <option value="Responsable Stock">Responsable Stock</option>
                                <option value="Responsable Commercial">Responsable Commercial</option>
                                <option value="Opérateur Production">Opérateur Production</option>
                                <option value="Auditeur">Auditeur</option>
                                <option value="Stagiaire - Achat">Stagiaire - Achat</option>
                                <option value="Stagiaire - Qualité">Stagiaire - Qualité</option>
                                <option value="Stagiaire - Production">Stagiaire - Production</option>
                                <option value="Stagiaire - Commercial">Stagiaire - Commercial</option>
                                <option value="Autre">Autre</option>
                            </select>

                            {form.fonction === 'Autre' && (
                                <input
                                    style={S.input}
                                    placeholder="Précisez votre fonction *"
                                    value={form.motif}
                                    onChange={e => setForm({...form, motif: e.target.value})}
                                    required
                                />
                            )}

                            {message && !success && (
                                <div style={S.erreur}>{message}</div>
                            )}

                            <button type="submit" style={S.button} disabled={loading}>
                                {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={S.successBox}>
                        <div style={S.successIcon}>✓</div>
                        <h2 style={S.title}>Demande envoyée !</h2>
                        <p style={S.subtitle}>{message}</p>
                    </div>
                )}

                <p style={S.backLink} onClick={() => navigate('/login')}>
                    ← Retour à la connexion
                </p>
            </div>
        </div>
    );
};

const S = {
    page: {
        minHeight: '100vh', backgroundColor: '#fff',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px',
    },
    container: {
        width: '100%', maxWidth: '440px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
    },
    logo: { width: '180px', marginBottom: '16px' },
    title: {
        fontSize: '20px', fontWeight: 'bold', color: '#1B6B3A',
        textAlign: 'center', margin: '0 0 10px 0',
    },
    subtitle: {
        fontSize: '14px', color: '#888', textAlign: 'center',
        marginBottom: '28px', lineHeight: '1.6',
    },
    form: {
        width: '100%', display: 'flex',
        flexDirection: 'column', gap: '14px',
    },
    input: {
        width: '100%', padding: '14px 16px',
        border: '1.5px solid #e0e0e0', borderRadius: '10px',
        fontSize: '14px', outline: 'none',
        boxSizing: 'border-box', color: '#333',
        backgroundColor: '#fafafa', fontFamily: 'inherit',
    },
    erreur: {
        backgroundColor: '#fff3f3', color: '#c62828',
        padding: '10px 14px', borderRadius: '8px',
        fontSize: '13px', border: '1px solid #ffcdd2',
        textAlign: 'center',
    },
    button: {
        width: '100%', padding: '15px',
        backgroundColor: '#2E9B56', color: '#fff',
        border: 'none', borderRadius: '10px',
        fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
    },
    successBox: { textAlign: 'center' },
    successIcon: {
        width: '60px', height: '60px', borderRadius: '50%',
        backgroundColor: '#f0fdf4', color: '#16a34a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '28px', fontWeight: 'bold',
        margin: '0 auto 20px',
    },
    backLink: {
        marginTop: '24px', color: '#2E9B56',
        cursor: 'pointer', fontSize: '14px',
    },
};

export default DemandeAcces;