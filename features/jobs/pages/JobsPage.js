import { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, Modal, ScrollView, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import JobSearch from '../components/JobSearch';
import JobCard from '../components/JobCard';
import { useJobs } from '../hooks/useJobs';
import { SENIORITY_LEVEL } from '../../../shared/constants/enums';
import { colors } from '../../../src/theme';

const DATE_OPTIONS = [
  { label: 'Anytime', value: '' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last week', value: 'week' },
  { label: 'Last month', value: 'month' },
];

export default function JobsPage() {
  const { jobs, loading, error } = useJobs();

  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [jobType, setJobType] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [datePosted, setDatePosted] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = [level, jobType, workLocation, datePosted, salaryMin, salaryMax]
    .filter(Boolean).length;

  function clearFilters() {
    setLevel('');
    setJobType('');
    setWorkLocation('');
    setDatePosted('');
    setSalaryMin('');
    setSalaryMax('');
  }

  const filteredJobs = jobs.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase());
    const matchLevel = level ? job.seniority_level === level : true;
    const matchType = jobType ? job.job_type === jobType : true;
    const matchLocation = workLocation ? job.work_location === workLocation : true;

    const matchDate = (() => {
      if (!datePosted) return true;
      const posted = new Date(job.created_at);
      const now = new Date();
      const diff = (now - posted) / (1000 * 60 * 60 * 24);
      if (datePosted === '24h') return diff <= 1;
      if (datePosted === 'week') return diff <= 7;
      if (datePosted === 'month') return diff <= 30;
      return true;
    })();

    const matchSalary = (() => {
      if (!salaryMin && !salaryMax) return true;
      if (job.salary_min == null && job.salary_max == null) return false;
      const min = Number(salaryMin) || 0;
      const max = Number(salaryMax) || Infinity;
      return job.salary_min >= min && job.salary_max <= max;
    })();

    return matchSearch && matchLevel && matchType && matchLocation && matchDate && matchSalary;
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading jobs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>

      
      <FlatList
        data={filteredJobs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => 
        (<View style={{ paddingHorizontal: 16 }}>
          <JobCard job={item} />
        </View>)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            
            <LinearGradient
              colors={['#012a4a', '#01497c', '#2a6f97']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.3, y: 1 }}
              style={styles.header}
            >
              <Text style={styles.headerLabel}>HireReadyAI · Job Board</Text>
              <Text style={styles.headerTitle}>Find your{'\n'}dream job</Text>
              <Text style={styles.headerSubtitle}>
                Browse the latest openings and apply today.
              </Text>
            </LinearGradient>

            
            <View style={styles.searchContainer}>
              <JobSearch search={search} setSearch={setSearch} />
            </View>

            
            <View style={styles.resultsRow}>
              <Text style={styles.resultCount}>
                <Text style={styles.resultCountNumber}>{filteredJobs.length}</Text>
                {' '}job{filteredJobs.length !== 1 ? 's' : ''} found
              </Text>
              <TouchableOpacity
                style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
                onPress={() => setFiltersOpen(true)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="options-outline"
                  size={16}
                  color={activeFilterCount > 0 ? colors.white : colors.primary}
                />
                <Text style={[styles.filterButtonText, activeFilterCount > 0 && styles.filterButtonTextActive]}>
                  Filters
                </Text>
                {activeFilterCount > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={40} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No jobs found matching your search.</Text>
            {activeFilterCount > 0 && (
              <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear filters</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      
      <Modal
        visible={filtersOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFiltersOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFiltersOpen(false)}
        />

        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filters</Text>
            <TouchableOpacity onPress={() => { clearFilters(); setFiltersOpen(false); }}>
              <Text style={styles.clearAllText}>Clear all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetScroll}>

            <Text style={styles.filterSectionTitle}>Date Posted</Text>
            <View style={styles.chipRow}>
              {DATE_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, datePosted === opt.value && styles.chipActive]}
                  onPress={() => setDatePosted(opt.value)}
                >
                  <Text style={[styles.chipText, datePosted === opt.value && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Salary Range (EGP)</Text>
            <View style={styles.salaryRow}>
              <TextInput
                style={styles.salaryInput}
                value={salaryMin}
                onChangeText={setSalaryMin}
                placeholder="Min"
                placeholderTextColor={colors.gray[400]}
                keyboardType="numeric"
              />
              <Text style={styles.salarySep}>to</Text>
              <TextInput
                style={styles.salaryInput}
                value={salaryMax}
                onChangeText={setSalaryMax}
                placeholder="Max"
                placeholderTextColor={colors.gray[400]}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.filterSectionTitle}>Job Type</Text>
            <View style={styles.chipRow}>
              {[{ label: 'Full Time', value: 'full_time' }, { label: 'Part Time', value: 'part_time' }].map(({ label, value }) => (
                <TouchableOpacity
                  key={value}
                  style={[styles.chip, jobType === value && styles.chipActive]}
                  onPress={() => setJobType(jobType === value ? '' : value)}
                >
                  <Text style={[styles.chipText, jobType === value && styles.chipTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Work Location</Text>
            <View style={styles.chipRow}>
              {[{ label: 'On-site', value: 'on_site' }, { label: 'Remote', value: 'remote' }, { label: 'Hybrid', value: 'hybrid' }].map(({ label, value }) => (
                <TouchableOpacity
                  key={value}
                  style={[styles.chip, workLocation === value && styles.chipActive]}
                  onPress={() => setWorkLocation(workLocation === value ? '' : value)}
                >
                  <Text style={[styles.chipText, workLocation === value && styles.chipTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Seniority Level</Text>
            <View style={styles.chipRow}>
              {Object.values(SENIORITY_LEVEL).map(lvl => (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.chip, level === lvl && styles.chipActive]}
                  onPress={() => setLevel(level === lvl ? '' : lvl)}
                >
                  <Text style={[styles.chipText, level === lvl && styles.chipTextActive, { textTransform: 'capitalize' }]}>
                    {lvl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          <TouchableOpacity
            style={styles.applyFiltersButton}
            onPress={() => setFiltersOpen(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.applyFiltersText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    color: colors.mutedForeground,
    fontSize: 15,
  },
  errorText: {
    color: colors.red[500],
    fontSize: 15,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 56,
  },
  headerLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: -28,
    zIndex: 10,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  resultCount: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  resultCountNumber: {
    fontWeight: '700',
    color: colors.foreground,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  filterBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: 'center',
  },
  clearButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  clearButtonText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bottomSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[300],
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.foreground,
  },
  clearAllText: {
    fontSize: 13,
    color: colors.mutedForeground,
    fontWeight: '500',
  },
  sheetScroll: {
    maxHeight: 420,
  },
  filterSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.foreground,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.foreground,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  salaryInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontSize: 14,
    color: colors.foreground,
  },
  salarySep: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  applyFiltersButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyFiltersText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});