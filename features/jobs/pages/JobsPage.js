import { useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import JobSearch from '../components/JobSearch';
import JobFilters from '../components/JobFilters';
import JobCard from '../components/JobCard';
import { useJobs } from '../hooks/useJobs';
import { colors } from '../../../src/theme';

export default function JobsPage() {
  const { jobs, loading, error } = useJobs();

  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [jobType, setJobType] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [datePosted, setDatePosted] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(true);

  function clearFilters() {
    setLevel('');
    setJobType('');
    setWorkLocation('');
    setDatePosted('');
    setSalaryMin('');
    setSalaryMax('');
    setSearch('');
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
        <ActivityIndicator size="large" color={colors.darkAmethyst[600]} />
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
      <View style={styles.header}>
        <View style={styles.headerGlow} />
        <View style={styles.headerContent}>
          <Text style={styles.headerLabel}>HireReadyAI - Job Board</Text>
          <Text style={styles.headerTitle}>Find your dream job</Text>
          <Text style={styles.headerSubtitle}>
            Browse our latest job openings and apply to the best opportunities today.
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <JobSearch search={search} setSearch={setSearch} />
      </View>

      <View style={styles.body}>
        <Text style={styles.resultCount}>
          <Text style={styles.resultCountNumber}>{filteredJobs.length}</Text> job{filteredJobs.length !== 1 ? 's' : ''} found
        </Text>

        <View style={styles.mainRow}>
          {filtersVisible && (
            <View style={styles.filtersColumn}>
              <JobFilters
                level={level} setLevel={setLevel}
                jobType={jobType} setJobType={setJobType}
                workLocation={workLocation} setWorkLocation={setWorkLocation}
                datePosted={datePosted} setDatePosted={setDatePosted}
                salaryMin={salaryMin} setSalaryMin={setSalaryMin}
                salaryMax={salaryMax} setSalaryMax={setSalaryMax}
                onClear={clearFilters}
              />
            </View>
          )}

          <View style={styles.listColumn}>
            {filteredJobs.length > 0 ? (
              <FlatList
                data={filteredJobs}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <JobCard job={item} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No jobs found matching your filters.</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.darkAmethyst[50],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.darkAmethyst[50],
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    color: colors.darkAmethyst[500],
    fontSize: 15,
  },
  errorText: {
    color: colors.red[500],
    fontSize: 15,
  },
  header: {
    backgroundColor: colors.darkAmethyst[950],
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 56,
    overflow: 'hidden',
  },
  headerGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    opacity: 0.3,
  },
  headerContent: {
    position: 'relative',
    zIndex: 10,
  },
  headerLabel: {
    color: colors.darkAmethyst[300],
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 38,
    marginBottom: 8,
  },
  headerSubtitle: {
    color: colors.darkAmethyst[200],
    fontSize: 14,
    opacity: 0.7,
    maxWidth: 400,
  },
  searchContainer: {
    marginHorizontal: 24,
    marginTop: -28,
    zIndex: 10,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  resultCount: {
    fontSize: 13,
    color: colors.darkAmethyst[500],
    marginBottom: 20,
  },
  resultCountNumber: {
    fontWeight: '600',
    color: colors.darkAmethyst[900],
  },
  mainRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 20,
  },
  filtersColumn: {
    width: 260,
  },
  listColumn: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.darkAmethyst[400],
    fontSize: 14,
  },
});
