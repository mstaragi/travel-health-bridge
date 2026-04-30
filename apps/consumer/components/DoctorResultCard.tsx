/**
 * apps/consumer/components/DoctorResultCard.tsx
 * Displays doctor information with all key details
 * Answers: What? Why this doctor? What should I do?
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Phone,
  MapPin,
  Clock,
  Star,
  Navigation,
  Award,
  MessageCircle,
} from 'lucide-react-native';
import { palette, typography, spacing } from '@travelhealthbridge/shared/ui/tokens';
import { track } from '@travelhealthbridge/shared';
import { haversineDistance } from '@travelhealthbridge/shared/utils/distance';

interface DoctorResultCardProps {
  provider: any;
  rank: number; // 1 for primary, 2 for secondary
  userLocation?: { lat: number; lng: number };
  onCall: (provider: any, rank: number) => void;
  onDirections: (provider: any, rank: number) => void;
}

export function DoctorResultCard({
  provider,
  rank,
  userLocation,
  onCall,
  onDirections,
}: DoctorResultCardProps) {
  const distance = userLocation
    ? haversineDistance(userLocation.lat, userLocation.lng, provider.lat, provider.lng)
    : null;

  const handleWhatsApp = () => {
    track('doctor_whatsapp_clicked', {
      provider_id: provider.id,
      rank,
    });
    Linking.openURL(`whatsapp://send?phone=${provider.phone}`);
  };

  const getRecommendationReason = () => {
    if (rank === 1) {
      return '⭐ Best Match - Highest rated doctor for your needs';
    }
    return '✓ Alternative - Backup option if primary unavailable';
  };

  return (
    <View style={[styles.card, rank === 1 && styles.primaryCard]}>
      {/* Rank Badge */}
      <View
        style={[
          styles.rankBadge,
          rank === 1 ? styles.rankBadgePrimary : styles.rankBadgeSecondary,
        ]}
      >
        <Text style={styles.rankText}>
          {rank === 1 ? '🥇 PRIMARY' : '🥈 BACKUP'}
        </Text>
        <Text style={styles.recommendationReason}>{getRecommendationReason()}</Text>
      </View>

      {/* Doctor Info */}
      <View style={styles.header}>
        <View style={styles.nameSection}>
          <Text style={styles.name}>{provider.name}</Text>
          {provider.emergency && (
            <View style={styles.emergencyBadge}>
              <Text style={styles.emergencyBadgeText}>24/7 Available</Text>
            </View>
          )}
        </View>
      </View>

      {/* Key Details Grid */}
      <View style={styles.detailsGrid}>
        {/* Distance */}
        {distance !== null && (
          <View style={styles.detailItem}>
            <MapPin size={18} color={palette.teal[600]} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Distance</Text>
              <Text style={styles.detailValue}>
                {distance < 1 ? '<1 km' : `${distance.toFixed(1)} km`}
              </Text>
            </View>
          </View>
        )}

        {/* Fee Range */}
        <View style={styles.detailItem}>
          <Text style={styles.feeIcon}>₹</Text>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Consultation Fee</Text>
            <Text style={styles.detailValue}>
              ₹{provider.fee_opd.min} - ₹{provider.fee_opd.max}
            </Text>
          </View>
        </View>

        {/* Experience/Rating */}
        <View style={styles.detailItem}>
          <Star size={18} color={palette.amber[600]} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Reliability</Text>
            <Text style={styles.detailValue}>
              {provider.reliability_score.toFixed(1)}/2.0
            </Text>
          </View>
        </View>

        {/* Languages */}
        <View style={styles.detailItem}>
          <MessageCircle size={18} color={palette.navy[400]} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Languages</Text>
            <Text style={styles.detailValue}>
              {provider.languages.join(', ')}
            </Text>
          </View>
        </View>

        {/* Specialties */}
        <View style={styles.detailItem}>
          <Award size={18} color={palette.navy[400]} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Specialties</Text>
            <Text style={styles.detailValue}>
              {provider.specialties.slice(0, 2).join(', ')}
            </Text>
          </View>
        </View>
      </View>

      {/* Address */}
      <View style={styles.addressSection}>
        <MapPin size={16} color={palette.navy[400]} />
        <Text style={styles.address}>{provider.address}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.callButton]}
          onPress={() => onCall(provider, rank)}
        >
          <Phone size={20} color={palette.white} />
          <Text style={styles.callButtonText}>📞 Call Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.directionsButton]}
          onPress={() => onDirections(provider, rank)}
        >
          <Navigation size={20} color={palette.teal[600]} />
          <Text style={styles.directionsButtonText}>📍 Directions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.whatsappButton]}
          onPress={handleWhatsApp}
        >
          <MessageCircle size={20} color={palette.teal[600]} />
          <Text style={styles.whatsappButtonText}>💬</Text>
        </TouchableOpacity>
      </View>

      {/* Why This Doctor */}
      <View style={styles.whySection}>
        <Text style={styles.whyTitle}>Why this doctor?</Text>
        <View style={styles.whyReasons}>
          {distance !== null && distance < 5 && (
            <Text style={styles.whyReason}>✓ Close to you ({distance.toFixed(1)} km)</Text>
          )}
          {provider.reliability_score >= 1.5 && (
            <Text style={styles.whyReason}>✓ Highly reliable provider</Text>
          )}
          {provider.languages.includes('Hindi') && (
            <Text style={styles.whyReason}>✓ Speaks your language</Text>
          )}
          {provider.emergency && (
            <Text style={styles.whyReason}>✓ 24/7 emergency available</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: palette.navy[100],
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  primaryCard: {
    borderColor: palette.teal[600],
    borderWidth: 3,
    backgroundColor: palette.teal[0],
  },
  rankBadge: {
    padding: spacing.md,
    backgroundColor: palette.navy[50],
    borderBottomWidth: 1,
    borderBottomColor: palette.navy[100],
  },
  rankBadgePrimary: {
    backgroundColor: palette.teal[50],
    borderBottomColor: palette.teal[100],
  },
  rankBadgeSecondary: {
    backgroundColor: palette.amber[50],
    borderBottomColor: palette.amber[100],
  },
  rankText: {
    ...typography.labelMedium,
    fontWeight: typography.fontWeight.black,
    color: palette.navy[900],
    marginBottom: spacing.xs,
  },
  recommendationReason: {
    ...typography.bodySmall,
    color: palette.navy[600],
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: palette.navy[50],
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  name: {
    ...typography.heading3,
    color: palette.navy[900],
    flex: 1,
  },
  emergencyBadge: {
    backgroundColor: palette.rose[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  emergencyBadgeText: {
    ...typography.labelSmall,
    color: palette.rose[700],
    fontWeight: typography.fontWeight.bold,
  },
  detailsGrid: {
    padding: spacing.lg,
    backgroundColor: palette.navy[0],
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  detailContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  detailLabel: {
    ...typography.labelSmall,
    color: palette.navy[600],
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.bodyMedium,
    color: palette.navy[900],
    fontWeight: typography.fontWeight.semibold,
  },
  feeIcon: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: palette.teal[600],
    width: 18,
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    backgroundColor: palette.navy[50],
    gap: spacing.md,
  },
  address: {
    ...typography.bodySmall,
    color: palette.navy[700],
    flex: 1,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  callButton: {
    backgroundColor: palette.rose[600],
    flex: 1.5,
  },
  callButtonText: {
    ...typography.labelMedium,
    color: palette.white,
    fontWeight: typography.fontWeight.bold,
  },
  directionsButton: {
    backgroundColor: palette.teal[100],
    borderWidth: 2,
    borderColor: palette.teal[600],
  },
  directionsButtonText: {
    ...typography.bodySmall,
    color: palette.teal[600],
    fontWeight: typography.fontWeight.bold,
  },
  whatsappButton: {
    backgroundColor: palette.teal[100],
    borderWidth: 2,
    borderColor: palette.teal[600],
    flex: 0.5,
  },
  whySection: {
    padding: spacing.lg,
    backgroundColor: palette.teal[0],
    borderTopWidth: 1,
    borderTopColor: palette.teal[100],
  },
  whyTitle: {
    ...typography.labelMedium,
    color: palette.navy[900],
    marginBottom: spacing.md,
    fontWeight: typography.fontWeight.bold,
  },
  whyReasons: {
    gap: spacing.sm,
  },
  whyReason: {
    ...typography.bodySmall,
    color: palette.navy[700],
    lineHeight: 20,
  },
});
