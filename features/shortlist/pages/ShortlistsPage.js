import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme';
import { useJobs } from '../../jobs/hooks/useJobs';
import { useShortlistData } from '../hooks/useShortlistData';
import { useUser } from '../../../features/auth/context/user.context';
import { useCompany } from '../../../features/companies/pages/CompanyLayout';
import ShortlistInsightsBar from '../components/ShortlistInsightsBar';
import ShortlistCandidateCard from '../components/ShortlistCandidateCard';
import ShortlistDetailPanel from '../components/ShortlistDetailPanel';
import OfferEmailModal from '../components/OfferEmailModal';

const SORT_OPTIONS = [
  { key: 'consensus', label: 'Consensus' },
  { key: 'ai_score', label: 'AI Score' },
  { key: 'name', label: 'Name' },
];

export default function ShortlistsPage() {
  const { jobs } = useJobs();
  const { user } = useUser();
  const { company } = useCompany();

  const {
    selectedJobId,
    setSelectedJobId,
    selectedJob,
    sortedEntries,
    loading,
    insightsSummary,
    selectedCandidateId,
    setSelectedCandidateId,
    selectedEntry,
    myVote,
    sortMode,
    setSortMode,
    notes,
    notesLoading,
    castVote,
    rejectApplication,
    advanceToOffer,
    postNote,
  } = useShortlistData(jobs);

  const [search, setSearch] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showJobPicker, setShowJobPicker] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAction, setOfferAction] = useState('offer');
  const [offerCandidate, setOfferCandidate] = useState(null);

  const handleAdvance = (applicationId) => {
    const entry = sortedEntries.find((e) => e.applications.id === applicationId);
    if (!entry) return;
    setOfferCandidate(entry);
    setOfferAction('offer');
    setShowOfferModal(true);
  };

  const handleOfferSuccess = () => {
    setShowOfferModal(false);
    setOfferCandidate(null);
  };

  const filteredEntries = useMemo(() => {
    return sortedEntries.filter((entry) => {
      const name = entry.applications.profiles?.full_name?.toLowerCase() || '';
      return name.includes(search.toLowerCase());
    });
  }, [sortedEntries, search]);

  const handleSelectCandidate = (applicationId) => {
    setSelectedCandidateId(applicationId);
    setIsPanelOpen(true);
  };

  const renderCandidateCard = ({ item, index }) => (
    <ShortlistCandidateCard
      entry={item}
      index={index}
      isSelected={item.applications.id === selectedCandidateId}
      onClick={() => handleSelectCandidate(item.applications.id)}
    />
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyState}>
      <Ionicons name="sparkles" size={32} color={colors.gray[300]} />
      <Text style={styles.emptyStateText}>No candidates in this shortlist yet.</Text>
    </View>
  );

  const keyExtractor = (item) => item.id;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.pageTitle}>Shortlist</Text>
            <Text style={styles.pageSubtitle}>
              Top candidates surfaced by AI · awaiting hiring team decision
            </Text>
          </View>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={14} color={colors.gray[400]} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search candidates..."
              placeholderTextColor={colors.gray[400]}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Controls row */}
        <View style={styles.controls}>
          {/* Job selector */}
          <TouchableOpacity
            style={styles.jobSelector}
            onPress={() => setShowJobPicker(true)}
          >
            <Text style={styles.jobSelectorText} numberOfLines={1}>
              {selectedJob?.title || 'Select a job posting'}
            </Text>
            <Ionicons name="chevron-down" size={14} color={colors.gray[500]} />
          </TouchableOpacity>

          {/* Filters button */}
          <TouchableOpacity style={styles.filtersBtn}>
            <Ionicons name="options-outline" size={14} color={colors.gray[600]} />
            <Text style={styles.filtersBtnText}>Filters</Text>
          </TouchableOpacity>

          {/* Sort chips */}
          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>Sort</Text>
            {SORT_OPTIONS.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                onPress={() => setSortMode(key)}
                style={[
                  styles.sortChip,
                  sortMode === key && styles.sortChipActive,
                ]}
              >
                <Text style={[
                  styles.sortChipText,
                  sortMode === key && styles.sortChipTextActive,
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Insights Bar */}
      <ShortlistInsightsBar
        insightsSummary={insightsSummary}
        selectedJobTitle={selectedJob?.title}
      />

      {/* Main content */}
      <View style={styles.mainContent}>
        {/* Candidate List */}
        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.darkAmethyst[500]} />
            </View>
          ) : (
            <FlatList
              data={filteredEntries}
              renderItem={renderCandidateCard}
              keyExtractor={keyExtractor}
              ListEmptyComponent={ListEmptyComponent}
              contentContainerStyle={filteredEntries.length === 0 ? styles.emptyListContainer : undefined}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Detail Panel overlay (mobile) */}
        {selectedEntry && isPanelOpen && (
          <ShortlistDetailPanel
            entry={selectedEntry}
            myVote={myVote}
            notes={notes}
            notesLoading={notesLoading}
            onClose={() => setIsPanelOpen(false)}
            onCastVote={castVote}
            onReject={rejectApplication}
            onAdvanceToOffer={handleAdvance}
            onPostNote={postNote}
            isOverlay={true}
          />
        )}
      </View>

      {/* Job Picker Modal */}
      <Modal visible={showJobPicker} transparent animationType="slide" onRequestClose={() => setShowJobPicker(false)}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowJobPicker(false)}
        >
          <View style={styles.jobPickerContainer}>
            <View style={styles.jobPickerHeader}>
              <Text style={styles.jobPickerTitle}>Select a job posting</Text>
              <TouchableOpacity onPress={() => setShowJobPicker(false)}>
                <Ionicons name="close" size={20} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={jobs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.jobOption,
                    selectedJobId === item.id && styles.jobOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedJobId(item.id);
                    setShowJobPicker(false);
                  }}
                >
                  <Text style={[
                    styles.jobOptionText,
                    selectedJobId === item.id && styles.jobOptionTextSelected,
                  ]}>
                    {item.title}
                  </Text>
                  {selectedJobId === item.id && (
                    <Ionicons name="checkmark" size={18} color={colors.darkAmethyst[600]} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <Text style={styles.jobPickerEmpty}>No jobs available.</Text>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Offer Email Modal */}
      {offerCandidate && (
        <OfferEmailModal
          visible={showOfferModal}
          onClose={() => { setShowOfferModal(false); setOfferCandidate(null); }}
          candidateName={offerCandidate.applications.profiles?.full_name || ''}
          candidateEmail=""
          recruiterName={user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''}
          recruiterEmail={user?.email || ''}
          applicationId={offerCandidate.applications.id}
          jobId={selectedJobId}
          jobTitle={selectedJob?.title || ''}
          companyName={company?.name || ''}
          action={offerAction}
          onSuccess={handleOfferSuccess}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  headerTop: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.gray[900],
  },
  pageSubtitle: {
    fontSize: 11,
    color: colors.gray[500],
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 10,
    width: Platform.OS === 'web' ? 220 : '100%',
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.gray[700],
    paddingVertical: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  jobSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.white,
    maxWidth: 200,
  },
  jobSelectorText: {
    fontSize: 13,
    color: colors.gray[700],
    flexShrink: 1,
  },
  filtersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.white,
  },
  filtersBtnText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  sortLabel: {
    fontSize: 11,
    color: colors.gray[400],
    marginRight: 4,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  sortChipActive: {
    backgroundColor: colors.darkAmethyst[600],
    borderColor: colors.darkAmethyst[600],
  },
  sortChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.gray[600],
  },
  sortChipTextActive: {
    color: colors.white,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  listContainer: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 13,
    color: colors.gray[400],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  jobPickerContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  jobPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  jobPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  jobOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
  },
  jobOptionSelected: {
    backgroundColor: colors.darkAmethyst[50],
  },
  jobOptionText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  jobOptionTextSelected: {
    fontWeight: '600',
    color: colors.darkAmethyst[700],
  },
  jobPickerEmpty: {
    padding: 20,
    textAlign: 'center',
    color: colors.gray[400],
    fontSize: 13,
  },
});
