'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@travelhealthbridge/shared';
import { track } from '@travelhealthbridge/shared';
import styles from './profile.module.css';
import { Edit2, Save, X, AlertCircle } from 'lucide-react';

interface ProviderProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city_id: string;
  languages: string[];
  specialties: string[];
  fee_min: number;
  fee_max: number;
  bio: string;
  verified_at: string;
}

export default function ProfilePage() {
  const { session } = useAuthStore();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [feeMin, setFeeMin] = useState(0);
  const [feeMax, setFeeMax] = useState(0);

  const availableLanguages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Gujarati'];
  const availableSpecialties = ['General Physician', 'Surgery', 'Pediatrics', 'Cardiology', 'Dermatology', 'Orthopedics', 'ENT', 'Gynecology'];

  useEffect(() => {
    if (session?.user?.id) {
      loadProfile();
    }
  }, [session]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', session?.user?.id)
        .single();

      if (!error && data) {
        setProfile(data);
        setName(data.name);
        setBio(data.bio || '');
        setLanguages(data.languages || []);
        setSpecialties(data.specialties || []);
        setFeeMin(data.fee_min || 0);
        setFeeMax(data.fee_max || 0);

        track('provider_profile_opened', {
          provider_id: data.id,
          verified: !!data.verified_at,
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('providers')
        .update({
          name,
          bio,
          languages,
          specialties,
          fee_min: feeMin,
          fee_max: feeMax,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({
        ...profile,
        name,
        bio,
        languages,
        specialties,
        fee_min: feeMin,
        fee_max: feeMax,
      });

      setIsEditing(false);

      track('provider_profile_updated', {
        provider_id: profile.id,
        fields_updated: ['name', 'bio', 'languages', 'specialties', 'fees'],
      });
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    setLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const toggleSpecialty = (specialty: string) => {
    setSpecialties(prev =>
      prev.includes(specialty) ? prev.filter(s => s !== specialty) : [...prev, specialty]
    );
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <AlertCircle size={48} />
          <p>Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{profile.name}</h1>
        <button
          onClick={() => (isEditing ? setIsEditing(false) : setIsEditing(true))}
          className={styles.editButton}
        >
          {isEditing ? <X size={20} /> : <Edit2 size={20} />}
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* READ MODE */}
      {!isEditing && (
        <div className={styles.viewMode}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact Information</h2>
            <div className={styles.info}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Phone:</span>
                <span>{profile.phone}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Email:</span>
                <span>{profile.email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Address:</span>
                <span>{profile.address}</span>
              </div>
            </div>
          </div>

          {profile.bio && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Bio</h2>
              <p className={styles.bio}>{profile.bio}</p>
            </div>
          )}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Languages</h2>
            <div className={styles.tagList}>
              {languages.length > 0 ? (
                languages.map(lang => (
                  <span key={lang} className={styles.tag}>
                    {lang}
                  </span>
                ))
              ) : (
                <span className={styles.empty}>Not specified</span>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Specialties</h2>
            <div className={styles.tagList}>
              {specialties.length > 0 ? (
                specialties.map(spec => (
                  <span key={spec} className={styles.tag}>
                    {spec}
                  </span>
                ))
              ) : (
                <span className={styles.empty}>Not specified</span>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Consultation Fees</h2>
            <div className={styles.feeRange}>
              ₹{feeMin} - ₹{feeMax}
            </div>
          </div>

          {profile.verified_at && (
            <div className={styles.verificationBadge}>
              ✓ Verified Provider
            </div>
          )}
        </div>
      )}

      {/* EDIT MODE */}
      {isEditing && (
        <div className={styles.editMode}>
          <div className={styles.section}>
            <label className={styles.fieldLabel}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder="Your name"
            />
          </div>

          <div className={styles.section}>
            <label className={styles.fieldLabel}>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={styles.textarea}
              placeholder="Tell travelers about yourself..."
              rows={4}
            />
          </div>

          <div className={styles.section}>
            <label className={styles.fieldLabel}>Languages</label>
            <div className={styles.checkboxGroup}>
              {availableLanguages.map(lang => (
                <label key={lang} className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={languages.includes(lang)}
                    onChange={() => toggleLanguage(lang)}
                  />
                  <span>{lang}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.fieldLabel}>Specialties</label>
            <div className={styles.checkboxGroup}>
              {availableSpecialties.map(spec => (
                <label key={spec} className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={specialties.includes(spec)}
                    onChange={() => toggleSpecialty(spec)}
                  />
                  <span>{spec}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.fieldLabel}>Consultation Fees (₹)</label>
            <div className={styles.feeInputs}>
              <input
                type="number"
                value={feeMin}
                onChange={(e) => setFeeMin(parseInt(e.target.value) || 0)}
                className={styles.input}
                placeholder="Min"
              />
              <span className={styles.dash}>—</span>
              <input
                type="number"
                value={feeMax}
                onChange={(e) => setFeeMax(parseInt(e.target.value) || 0)}
                className={styles.input}
                placeholder="Max"
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              onClick={handleSave}
              disabled={saving}
              className={styles.saveButton}
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
