import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Trash2, ChevronRight, ShieldAlert, LogOut, Clock, Info } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { supabase } from '@travelhealthbridge/shared';
import { secureStore } from '../lib/secureStore';
import { database } from '../../db';
import { palette, typography, spacing, borderRadius } from '@travelhealthbridge/shared/ui/tokens';
import { Button, Modal } from '@travelhealthbridge/shared/ui';

export default function SettingsScreen() {
  const router = useRouter();
  const { session, logout } = useAuthStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification states
  const [prefs, setPrefs] = useState({ follow_up: true, announcements: false });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!session?.user?.id) return;
    const { data, error } = await supabase
      .from('user_profiles')
      .select('notification_prefs')
      .eq('id', session.user.id)
      .single();

    if (data?.notification_prefs) {
      setPrefs(data.notification_prefs);
    }
  };

  const updatePrefs = async (key: string, value: boolean) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    
    if (session?.user?.id) {
       await supabase
        .from('user_profiles')
        .update({ notification_prefs: newPrefs })
        .eq('id', session.user.id);
    }
  };

  const handleDeleteAccount = async () => {
    if (!session?.access_token) {
      Alert.alert('Error', 'Session not found. Please log in again.');
      return;
    }

    setIsDeleting(true);
    try {
      // 1. Call Supabase Edge Function with User JWT
      // Note: We use the supabase client which automatically sends the current session JWT
      const { data, error } = await supabase.functions.invoke('delete-user-data', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      // 2. Wipe local storage
      await secureStore.removeItem('thb_vault_cached_data');
      await secureStore.removeItem('supabase_session');
      
      // 3. Clear WatermelonDB local data for this user
      await database.write(async () => {
         await database.get('vault_entries').query().destroyAllPermanently();
         await database.get('visit_history').query().destroyAllPermanently();
      });

      // 4. Sign out
      await logout();
      
      Alert.alert(
        'Account Deleted', 
        'Your profile and medical data have been removed. Some anonymized data is retained for audit trails.',
        [{ text: 'OK', onPress: () => router.replace('/') }]
      );
    } catch (e) {
      console.error('Deletion error:', e);
      Alert.alert(
        'Deletion Failed', 
        'We could not complete your request at this time. This may be due to a connection issue.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: handleDeleteAccount }
        ]
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Settings', headerShadowVisible: false }} />
      
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Phone Number</Text>
              <Text style={styles.rowValue}>{session?.user?.phone}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profile/help')}
          >
            <View style={styles.menuItemContent}>
              <Info size={20} color={palette.teal[600]} />
              <Text style={styles.menuItemText}>Help & Privacy</Text>
            </View>
            <ChevronRight size={20} color={palette.navy[200]} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteBtn}
            onPress={() => setShowDeleteModal(true)}
          >
            <View style={styles.deleteBtnContent}>
              <Trash2 size={20} color={palette.rose[600]} />
              <Text style={styles.deleteText}>Delete Account</Text>
            </View>
            <ChevronRight size={20} color={palette.navy[200]} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.settingsRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Post-visit follow-up</Text>
                <Text style={styles.rowHint}>Reminders to share feedback after your clinic visit.</Text>
              </View>
              <Switch 
                value={prefs.follow_up} 
                onValueChange={(val) => updatePrefs('follow_up', val)}
                trackColor={{ false: palette.gray[200], true: palette.teal[600] }}
              />
            </View>
            <View style={[styles.settingsRow, { borderTopWidth: 1, borderTopColor: palette.navy[50], marginTop: spacing.md, paddingTop: spacing.md }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Announcements</Text>
                <Text style={styles.rowHint}>Safety advisories and new city launches.</Text>
              </View>
              <Switch 
                value={prefs.announcements} 
                onValueChange={(val) => updatePrefs('announcements', val)}
                trackColor={{ false: palette.gray[200], true: palette.teal[600] }}
              />
            </View>
          </View>
          <View style={styles.quietHoursBox}>
              <Clock size={16} color={palette.navy[400]} />
              <Text style={styles.quietHoursText}>Quiet Hours: 10pm – 7am IST enforced automatically.</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={async () => {
            await logout();
            resetAnalytics();
            router.replace('/');
          }}
        >
          <LogOut size={20} color={palette.navy[900]} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal 
        visible={showDeleteModal} 
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title="Delete Account?"
      >
        <View style={styles.modalBody}>
          <ShieldAlert size={48} color={palette.rose[600]} style={{ marginBottom: spacing.lg }} />
          <Text style={styles.modalSub}>
            Delete my account and all medical data. I understand that my medical vault entries will be removed immediately. 
          </Text>
          <Text style={styles.modalSubAnonymized}>
            Non-identifying session data and overcharge reports will be retained for 24-48 months for system audit purposes only.
          </Text>

          <Button 
            label={isDeleting ? "Deleting..." : "Permanently Delete Account"}
            onPress={handleDeleteAccount}
            variant="primary" // Red/Danger style would be better but using primary for now
            style={{ backgroundColor: palette.rose[600], marginTop: spacing.xl }}
            disabled={isDeleting}
          />
          
          <TouchableOpacity 
            onPress={() => setShowDeleteModal(false)} 
            disabled={isDeleting}
            style={{ padding: spacing.md, marginTop: spacing.sm }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {isDeleting && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={palette.white} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  content: {
    padding: spacing.xl,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[400],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: palette.navy[50],
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 14,
    color: palette.navy[600],
  },
  rowValue: {
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[900],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: palette.navy[50],
    marginBottom: spacing.md,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[900],
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.rose[50],
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  deleteBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: palette.rose[600],
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: palette.navy[900],
  },
  modalBody: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  modalSub: {
    fontSize: 16,
    color: palette.navy[900],
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  modalSubAnonymized: {
    fontSize: 12,
    color: palette.navy[400],
    textAlign: 'center',
    lineHeight: 18,
  },
  cancelText: {
    fontSize: 14,
    color: palette.navy[400],
    fontWeight: typography.fontWeight.bold,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowHint: {
    fontSize: 12,
    color: palette.navy[400],
    marginTop: 2,
  },
  quietHoursBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: palette.navy[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  quietHoursText: {
    fontSize: 12,
    color: palette.navy[400],
    fontWeight: typography.fontWeight.medium,
  }
});
