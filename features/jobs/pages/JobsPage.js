import { useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator,
  TouchableOpacity, Modal, ScrollView, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import JobSearch from '../components/JobSearch';
import JobCard from '../components/JobCard';
import { useJobs } from '../hooks/useJobs';
import { SENIORITY_LEVEL } from '../../../shared/constants/enums';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useTranslation } from '../../../shared/context/I18nContext';
import { fontSize, fontWeight } from '../../../src/theme';
import { FONT_FAMILY, FONT_FAMILY_MEDIUM, FONT_FAMILY_SEMIBOLD, FONT_FAMILY_BOLD, FONT_FAMILY_BLACK } from '../../../src/fonts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DATE_OPTIONS = [
  { labelKey: 'jobs_page.anytime', value: '' },
  { labelKey: 'jobs_page.last_24h', value: '24h' },
  { labelKey: 'jobs_page.last_week', value: 'week' },
  { labelKey: 'jobs_page.last_month', value: 'month' },
];

export default function JobsPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const { jobs, loading, error } = useJobs();

  const [search, setSearch] = useState('');
  const [levels, setLevels] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [workLocations, setWorkLocations] = useState([]);
  const [datePosted, setDatePosted] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = [levels, jobTypes, workLocations, datePosted, salaryMin, salaryMax]
    .filter(f => Array.isArray(f) ? f.length > 0 : Boolean(f)).length;

  const toggleArray = (arr, value) =>
    arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];

  function clearFilters() {
    setLevels([]); setJobTypes([]); setWorkLocations([]);
    setDatePosted(''); setSalaryMin(''); setSalaryMax('');
  }

  const filteredJobs = jobs.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levels.length === 0 || levels.includes(job.seniority_level);
    const matchType = jobTypes.length === 0 || jobTypes.includes(job.job_type);
    const matchLocation = workLocations.length === 0 || workLocations.includes(job.work_location);
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

  const s = {
    screen: { flex: 1, backgroundColor: c['surface-muted'] },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c['surface-muted'], padding: 32 },
    loadingText: { fontFamily: FONT_FAMILY, marginTop: 12, color: c['muted-foreground'], fontSize: 15 },
    errorText: { fontFamily: FONT_FAMILY, color: c.destructive, fontSize: 15 },
    header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 56 },
    headerLabel: { fontFamily: FONT_FAMILY_MEDIUM, color: `${c['destructive-foreground']}99`, fontSize: 11, fontWeight: '500', letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' },
    headerTitle: { fontFamily: FONT_FAMILY_BLACK, color: c['destructive-foreground'], fontSize: 34, fontWeight: '900', lineHeight: 40, marginBottom: 8 },
    headerSubtitle: { fontFamily: FONT_FAMILY, color: `${c['destructive-foreground']}b3`, fontSize: 14, lineHeight: 20 },
    searchContainer: { marginHorizontal: 16, marginTop: -28, zIndex: 10 },
    resultsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 },
    resultCount: { fontFamily: FONT_FAMILY, fontSize: 13, color: c['muted-foreground'] },
    resultCountNumber: { fontFamily: FONT_FAMILY_BOLD, fontWeight: '700', color: c.foreground },
    filterButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: c.border, backgroundColor: c.card },
    filterButtonActive: { backgroundColor: c.primary, borderColor: c.primary },
    filterButtonText: { fontFamily: FONT_FAMILY_SEMIBOLD, fontSize: 13, fontWeight: '600', color: c.primary },
    filterButtonTextActive: { fontFamily: FONT_FAMILY, color: c['destructive-foreground'] },
    filterBadge: { width: 18, height: 18, borderRadius: 9, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center' },
    filterBadgeText: { fontFamily: FONT_FAMILY_BOLD, fontSize: 11, fontWeight: '700', color: c.primary },
    listContent: { paddingBottom: 32 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
    emptyText: { fontFamily: FONT_FAMILY, color: c['muted-foreground'], fontSize: 14, textAlign: 'center' },
    clearButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, marginTop: 4 },
    clearButtonText: { fontFamily: FONT_FAMILY_SEMIBOLD, fontSize: 13, color: c.primary, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    bottomSheet: { backgroundColor: c.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 32, maxHeight: '80%' },
    sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: c['muted-foreground'], alignSelf: 'center', marginTop: 12, marginBottom: 8 },
    sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: c.border, marginBottom: 20 },
    sheetTitle: { fontFamily: FONT_FAMILY_BOLD, fontSize: 17, fontWeight: '700', color: c.foreground },
    clearAllText: { fontFamily: FONT_FAMILY_MEDIUM, fontSize: 13, color: c['muted-foreground'], fontWeight: '500' },
    sheetScroll: { maxHeight: 420 },
    filterSectionTitle: { fontFamily: FONT_FAMILY_BOLD, fontSize: 11, fontWeight: '700', color: c.foreground, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12, marginTop: 4 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
    chip: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 999, borderWidth: 1, borderColor: c.border, backgroundColor: c.card },
    chipActive: { backgroundColor: c.primary, borderColor: c.primary },
    chipText: { fontFamily: FONT_FAMILY_MEDIUM, fontSize: 13, color: c.foreground, fontWeight: '500' },
    chipTextActive: { fontFamily: FONT_FAMILY_SEMIBOLD, color: c['destructive-foreground'], fontWeight: '600' },
    salaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    salaryInput: { fontFamily: FONT_FAMILY, flex: 1, height: 44, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: c.border, backgroundColor: c.card, fontSize: fontSize.sm, color: c.foreground },
    salarySep: { fontFamily: FONT_FAMILY, fontSize: 13, color: c['muted-foreground'] },
    applyFiltersButton: { backgroundColor: c.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 8 },
    applyFiltersText: { fontFamily: FONT_FAMILY_BOLD, color: c['destructive-foreground'], fontSize: 15, fontWeight: '700' },
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={s.loadingText}>{t('jobs_page.loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.centered}>
        <Text style={s.errorText}>{t('jobs_page.error')}: {error}</Text>
      </View>
    );
  }

  return (
    <View style={[s.screen]}>
      <FlatList
        data={filteredJobs}
        keyExtractor={item => item.id}
        renderItem={({ item }) =>
          <View style={{ paddingHorizontal: 16 }}>
            <JobCard job={item} />
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <>
            <LinearGradient
              colors={[c.sidebar, c.primary, c.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.3, y: 1 }}
              style={s.header}
            >
              <Text style={s.headerLabel}>HireReadyAI · {t('jobs_page.job_board')}</Text>
              <Text style={s.headerTitle}>{t('jobs_page.find_dream_job')}</Text>
              <Text style={s.headerSubtitle}>{t('jobs_page.browse_openings')}</Text>
            </LinearGradient>

            <View style={s.searchContainer}>
              <JobSearch search={search} setSearch={setSearch} />
            </View>

            <View style={s.resultsRow}>
              <Text style={s.resultCount}>
                <Text style={s.resultCountNumber}>{filteredJobs.length}</Text>
                {' '}{t('jobs_page.jobs_found')}
              </Text>
              <TouchableOpacity
                style={[s.filterButton, activeFilterCount > 0 && s.filterButtonActive]}
                onPress={() => setFiltersOpen(true)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="options-outline"
                  size={16}
                  color={activeFilterCount > 0 ? c['destructive-foreground'] : c.primary}
                />
                <Text style={[s.filterButtonText, activeFilterCount > 0 && s.filterButtonTextActive]}>
                  {t('jobs_page.filters')}
                </Text>
                {activeFilterCount > 0 && (
                  <View style={s.filterBadge}>
                    <Text style={s.filterBadgeText}>{activeFilterCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Ionicons name="search-outline" size={40} color={c['muted-foreground']} />
            <Text style={s.emptyText}>{t('jobs_page.no_jobs_found')}</Text>
            {activeFilterCount > 0 && (
              <TouchableOpacity onPress={clearFilters} style={s.clearButton}>
                <Text style={s.clearButtonText}>{t('jobs_page.clear_filters')}</Text>
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
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setFiltersOpen(false)}
        />

        <View style={s.bottomSheet}>
          <View style={s.sheetHandle} />

          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>{t('jobs_page.filters')}</Text>
            <TouchableOpacity onPress={() => { clearFilters(); setFiltersOpen(false); }}>
              <Text style={s.clearAllText}>{t('jobs_page.clear_all')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={s.sheetScroll}>
            <Text style={s.filterSectionTitle}>{t('jobs_page.date_posted')}</Text>
            <View style={s.chipRow}>
              {DATE_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[s.chip, datePosted === opt.value && s.chipActive]}
                  onPress={() => setDatePosted(opt.value)}
                >
                  <Text style={[s.chipText, datePosted === opt.value && s.chipTextActive]}>
                    {t(opt.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.filterSectionTitle}>{t('jobs_page.salary_range')}</Text>
            <View style={s.salaryRow}>
              <TextInput
                style={s.salaryInput}
                value={salaryMin}
                onChangeText={setSalaryMin}
                placeholder={t('jobs_page.min')}
                placeholderTextColor={c['muted-foreground']}
                keyboardType="numeric"
              />
              <Text style={s.salarySep}>{t('jobs_page.to')}</Text>
              <TextInput
                style={s.salaryInput}
                value={salaryMax}
                onChangeText={setSalaryMax}
                placeholder={t('jobs_page.max')}
                placeholderTextColor={c['muted-foreground']}
                keyboardType="numeric"
              />
            </View>

            <Text style={s.filterSectionTitle}>{t('jobs_page.job_type')}</Text>
            <View style={s.chipRow}>
              {[{ labelKey: 'jobs_page.full_time', value: 'full_time' }, { labelKey: 'jobs_page.part_time', value: 'part_time' }].map(({ labelKey, value }) => (
                <TouchableOpacity
                  key={value}
                  style={[s.chip, jobTypes.includes(value) && s.chipActive]}
                  onPress={() => setJobTypes(prev => toggleArray(prev, value))}
                >
                  <Text style={[s.chipText, jobTypes.includes(value) && s.chipTextActive]}>
                    {t(labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.filterSectionTitle}>{t('jobs_page.work_location')}</Text>
            <View style={s.chipRow}>
              {[{ labelKey: 'jobs_page.on_site', value: 'on_site' }, { labelKey: 'jobs_page.remote', value: 'remote' }, { labelKey: 'jobs_page.hybrid', value: 'hybrid' }].map(({ labelKey, value }) => (
                <TouchableOpacity
                  key={value}
                  style={[s.chip, workLocations.includes(value) && s.chipActive]}
                  onPress={() => setWorkLocations(prev => toggleArray(prev, value))}
                >
                  <Text style={[s.chipText, workLocations.includes(value) && s.chipTextActive]}>
                    {t(labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.filterSectionTitle}>{t('jobs_page.seniority_level')}</Text>
            <View style={s.chipRow}>
              {Object.values(SENIORITY_LEVEL).map(lvl => (
                <TouchableOpacity
                  key={lvl}
                  style={[s.chip, levels.includes(lvl) && s.chipActive]}
                  onPress={() => setLevels(prev => toggleArray(prev, lvl))}
                >
                  <Text style={[s.chipText, levels.includes(lvl) && s.chipTextActive, { textTransform: 'capitalize' }]}>
                    {lvl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          <TouchableOpacity
            style={s.applyFiltersButton}
            onPress={() => setFiltersOpen(false)}
            activeOpacity={0.8}
          >
            <Text style={s.applyFiltersText}>{t('jobs_page.apply_filters')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
