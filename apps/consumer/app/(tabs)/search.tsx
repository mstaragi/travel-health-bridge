import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ProviderCard } from '@travelhealthbridge/shared/ui/ProviderCard';
import { Tag } from '@travelhealthbridge/shared/ui/Tag';
import { HelplineCTA } from '@travelhealthbridge/shared/ui/HelplineCTA';
import { ProviderCardSkeleton } from '@travelhealthbridge/shared/ui/Skeleton';
import { palette, typography, spacing, borderRadius, shadows } from '@travelhealthbridge/shared/ui/tokens';
import { CITIES, LANGUAGES, SPECIALTIES } from '@travelhealthbridge/shared/constants';
import { Provider } from '@travelhealthbridge/shared/types';
import { isOpenNow } from '@travelhealthbridge/shared/utils/openStatus';

// Mock data generator for infinite scroll
const generateMockProviders = (page: number): Provider[] => {
  return Array.from({ length: 10 }).map((_, i) => ({
    id: `p-${page}-${i}`,
    name: `Provider ${page * 10 + i + 1}`,
    area: ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout'][Math.floor(Math.random() * 4)],
    city: 'Bengaluru',
    languages: ['English', 'Hindi'],
    specialties: ['General Physician'],
    lat: 12.9716, lng: 77.5946,
    fee_opd: { min: 400 + Math.random() * 400, max: 1000 + Math.random() * 500 },
    staleness_tier: Math.random() > 0.8 ? 'stale' : 'fresh',
    badge_date: new Date().toISOString(),
    verified: Math.random() > 0.3,
    last_activity_at: new Date().toISOString(),
    score: 5 + Math.random() * 5,
    opd_hours: { 'Monday': [{ open: '09:00', close: '21:00' }] },
    is_emergency_capable: Math.random() > 0.7
  }));
};

import { Modal } from '@travelhealthbridge/shared/ui/Modal';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'nearest' | 'rated' | 'price'>('rated');
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [activeModal, setActiveModal] = useState<'city' | 'lang' | 'spec' | 'sort' | null>(null);
  
  const router = useRouter();

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load initial data
  useEffect(() => {
    loadProviders(1, true);
  }, [debouncedQuery, selectedCity, selectedLanguage, selectedSpecialty, openNowOnly, emergencyOnly, sortBy]);

  const loadProviders = async (pageNumber: number, reset: boolean) => {
    if (reset) setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newProviders = generateMockProviders(pageNumber);
    
    if (reset) {
      setProviders(newProviders);
      setPage(1);
    } else {
      setProviders(prev => [...prev, ...newProviders]);
      setPage(pageNumber);
    }
    
    setHasMore(pageNumber < 5); // Limit mock to 5 pages
    setIsLoading(false);
    setIsRefreshing(false);
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadProviders(1, true);
  };

  const onEndReached = () => {
    if (!isLoading && hasMore) {
      loadProviders(page + 1, false);
    }
  };

  const renderFilterChip = (label: string, active: boolean, onPress: () => void) => (
    <TouchableOpacity onPress={onPress}>
      <Tag 
        label={label} 
        variant={active ? 'primary' : 'neutral'} 
        style={styles.filterChip}
      />
    </TouchableOpacity>
  );

  const SelectionList = ({ data, onSelect, current }: { data: string[], onSelect: (val: string) => void, current: string | null }) => (
    <ScrollView style={{ maxHeight: 400 }}>
       {data.map(item => (
         <TouchableOpacity 
           key={item} 
           style={[styles.modalItem, current === item && styles.modalItemActive]} 
           onPress={() => onSelect(item)}
         >
           <Text style={[styles.modalItemText, current === item && styles.modalItemTextActive]}>{item}</Text>
         </TouchableOpacity>
       ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search name, area, specialty..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={palette.gray[400]}
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filtersContainer}
        >
          {renderFilterChip(selectedCity || 'All Cities', !!selectedCity, () => setActiveModal('city'))}
          {renderFilterChip(selectedLanguage || 'All Languages', !!selectedLanguage, () => setActiveModal('lang'))}
          {renderFilterChip(selectedSpecialty || 'All Specialties', !!selectedSpecialty, () => setActiveModal('spec'))}
          {renderFilterChip('Open Now', openNowOnly, () => setOpenNowOnly(!openNowOnly))}
          {renderFilterChip('Emergency', emergencyOnly, () => setEmergencyOnly(!emergencyOnly))}
          {renderFilterChip(`Sort: ${sortBy}`, true, () => setActiveModal('sort'))}
        </ScrollView>
      </View>

      {/* Results List */}
      <FlatList
        data={providers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProviderCard
            provider={item}
            openStatus={isOpenNow(item.opd_hours, new Date())}
            onPress={() => router.push(`/(providers)/${item.id}`)}
            style={styles.providerCard}
          />
        )}
        contentContainerStyle={styles.listContent}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={palette.teal[600]} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No providers found matching your search.</Text>
              <HelplineCTA prefillMessage="I couldn't find a provider in the search list." />
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading && providers.length > 0 ? (
            <ActivityIndicator style={{ padding: spacing.md }} color={palette.teal[600]} />
          ) : isLoading && providers.length === 0 ? (
            <View style={{ padding: spacing.xl }}>
              <ProviderCardSkeleton />
              <ProviderCardSkeleton />
              <ProviderCardSkeleton />
            </View>
          ) : null
        }
      />

      {/* Modals */}
      <Modal visible={!!activeModal} title={`Select ${activeModal}`} onClose={() => setActiveModal(null)}>
         {activeModal === 'city' && (
           <SelectionList 
             data={CITIES.map(c => c.name)} 
             current={selectedCity} 
             onSelect={(c) => { setSelectedCity(c === selectedCity ? null : c); setActiveModal(null); }} 
           />
         )}
         {activeModal === 'lang' && (
           <SelectionList 
             data={[...LANGUAGES]} 
             current={selectedLanguage} 
             onSelect={(l) => { setSelectedLanguage(l === selectedLanguage ? null : l); setActiveModal(null); }} 
           />
         )}
         {activeModal === 'spec' && (
           <SelectionList 
             data={[...SPECIALTIES]} 
             current={selectedSpecialty} 
             onSelect={(s) => { setSelectedSpecialty(s === selectedSpecialty ? null : s); setActiveModal(null); }} 
           />
         )}
         {activeModal === 'sort' && (
           <SelectionList 
             data={['rated', 'nearest', 'price']} 
             current={sortBy} 
             onSelect={(s) => { setSortBy(s as any); setActiveModal(null); }} 
           />
         )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.gray[50],
  },
  header: {
    backgroundColor: palette.gray[0],
    paddingTop: spacing['3xl'],
    borderBottomWidth: 1,
    borderBottomColor: palette.gray[200],
    zIndex: 10,
    ...shadows.sm,
  },
  searchBar: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    height: 44,
    backgroundColor: palette.gray[100],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  searchInput: {
    fontSize: typography.fontSize.base,
    color: palette.gray[900],
  },
  filtersContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    height: 32,
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  providerCard: {
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing['5xl'],
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: palette.gray[500],
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  modalItem: {
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray[100],
  },
  modalItemActive: {
    backgroundColor: palette.teal[50],
  },
  modalItemText: {
    fontSize: typography.fontSize.base,
    color: palette.gray[800],
  },
  modalItemTextActive: {
    color: palette.teal[700],
    fontWeight: typography.fontWeight.bold,
  },
});
