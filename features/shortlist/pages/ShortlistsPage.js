import React, { useState, useMemo } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import {
  FONT_FAMILY,
  FONT_FAMILY_MEDIUM,
  FONT_FAMILY_SEMIBOLD,
  FONT_FAMILY_BOLD,
} from "../../../src/fonts";
import { useTranslation } from "../../../shared/context/I18nContext";
import { useJobs } from "../../jobs/hooks/useJobs";
import { useShortlistData } from "../hooks/useShortlistData";
import { useUser } from "../../../features/auth/context/user.context";
import { useCompany } from "../../../features/companies/pages/CompanyLayout";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ShortlistInsightsBar from "../components/ShortlistInsightsBar";
import ShortlistCandidateCard from "../components/ShortlistCandidateCard";
import ShortlistDetailPanel from "../components/ShortlistDetailPanel";
import OfferEmailModal from "../components/OfferEmailModal";

export default function ShortlistsPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const styles = createStyles(c);
  const { jobs } = useJobs();
  const { user } = useUser();
  const { company } = useCompany();

  const sortOptions = useMemo(
    () => [
      { key: "consensus", label: t("shortlist.sort_consensus") },
      { key: "ai_score", label: t("shortlist.sort_ai_score") },
      { key: "name", label: t("shortlist.sort_name") },
    ],
    [t],
  );

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

  const [search, setSearch] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showJobPicker, setShowJobPicker] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAction, setOfferAction] = useState("offer");
  const [offerCandidate, setOfferCandidate] = useState(null);

  const handleAdvance = async (applicationId) => {
    const entry = sortedEntries.find(
      (e) => e.applications.id === applicationId,
    );
    if (!entry) return;

    // Get email from answers.info.email (already fetched) 
    const candidateEmail =
      entry.applications.answers?.info?.email ||
      entry.applications.profiles?.email ||
      '';

    setOfferCandidate({ ...entry, _candidateEmail: candidateEmail });
    setOfferAction('offer');
    setIsPanelOpen(false);
    setTimeout(() => setShowOfferModal(true), 300); // fixes the overlap bug too
  };

  const handleOfferSuccess = () => {
    setShowOfferModal(false);
    setOfferCandidate(null);
  };

  const filteredEntries = useMemo(() => {
    return sortedEntries.filter((entry) => {
      const name = entry.applications.profiles?.full_name?.toLowerCase() || "";
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
      <Ionicons name="sparkles" size={32} color={c.border} />
      <Text style={styles.emptyStateText}>{t("shortlist.no_candidates")}</Text>
    </View>
  );

  const keyExtractor = (item) => item.id;

  return (
    <View style={[styles.container]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <View style={{ display:"flex",flexDirection:"row",gap:25 }}>
              <Text style={styles.pageTitle}>{t("shortlist.title")}</Text>
              <TouchableOpacity
                style={styles.jobSelector}
                onPress={() => setShowJobPicker(true)}
              >
                <Text style={styles.jobSelectorText} numberOfLines={1}>
                  {selectedJob?.title || t("shortlist.select_job")}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={c["muted-foreground"]}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.pageSubtitle}>{t("shortlist.subtitle")}</Text>
          </View>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={14}
              color={c["muted-foreground"]}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={t("shortlist.search_placeholder")}
              placeholderTextColor={c["muted-foreground"]}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <View style={styles.controls}>
          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>{t("shortlist.sort")}</Text>
            {sortOptions.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                onPress={() => setSortMode(key)}
                style={[
                  styles.sortChip,
                  sortMode === key && styles.sortChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    sortMode === key && styles.sortChipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <ShortlistInsightsBar
        insightsSummary={insightsSummary}
        selectedJobTitle={selectedJob?.title}
      />

      <View style={styles.mainContent}>
        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={c["muted-foreground"]} />
            </View>
          ) : (
            <FlatList
              data={filteredEntries}
              renderItem={renderCandidateCard}
              keyExtractor={keyExtractor}
              ListEmptyComponent={ListEmptyComponent}
              contentContainerStyle={
                filteredEntries.length === 0
                  ? styles.emptyListContainer
                  : undefined
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

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

      <Modal
        visible={showJobPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowJobPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowJobPicker(false)}
        >
          <View style={styles.jobPickerContainer}>
            <View style={styles.jobPickerHeader}>
              <Text style={styles.jobPickerTitle}>
                {t("shortlist.select_job")}
              </Text>
              <TouchableOpacity onPress={() => setShowJobPicker(false)}>
                <Ionicons
                  name="close"
                  size={20}
                  color={c["muted-foreground"]}
                />
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
                  <Text
                    style={[
                      styles.jobOptionText,
                      selectedJobId === item.id && styles.jobOptionTextSelected,
                    ]}
                  >
                    {item.title}
                  </Text>
                  {selectedJobId === item.id && (
                    <Ionicons name="checkmark" size={18} color={c.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <Text style={styles.jobPickerEmpty}>
                  {t("shortlist.no_jobs")}
                </Text>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {offerCandidate && (
        <OfferEmailModal
          visible={showOfferModal}
          onClose={() => {
            setShowOfferModal(false);
            setOfferCandidate(null);
          }}
          candidateName={offerCandidate.applications.profiles?.full_name || ""}
          candidateEmail={
            offerCandidate._candidateEmail ||
            offerCandidate.applications.profiles?.email ||
            ""
          }
          recruiterName={
            user?.user_metadata?.full_name || user?.email?.split("@")[0] || ""
          }
          recruiterEmail={user?.email || ""}
          applicationId={offerCandidate.applications.id}
          jobId={selectedJobId}
          jobTitle={selectedJob?.title || ""}
          companyName={company?.name || ""}
          action={offerAction}
          onSuccess={handleOfferSuccess}
        />
      )}
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c["surface-muted"],
    },
    header: {
      backgroundColor: c.card,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 14,
    },
    headerTop: {
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },
    pageTitle: {
      fontSize: 22,
      fontFamily: FONT_FAMILY_BOLD,
      color: c.foreground,
    },
    pageSubtitle: {
      fontSize: 11,
      fontFamily: FONT_FAMILY,
      color: c["muted-foreground"],
      marginTop: 2,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c["surface-muted"],
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      width: "100%",
    },
    searchIcon: {
      marginRight: 6,
    },
    searchInput: {
      flex: 1,
      fontSize: 13,
      fontFamily: FONT_FAMILY,
      color: c.foreground,
      paddingVertical: 8,
    },
    controls: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 12,
      flexWrap: "wrap",
    },
    jobSelector: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 7,
      backgroundColor: c.card,
      maxWidth: 200,
    },
    jobSelectorText: {
      fontSize: 13,
      fontFamily: FONT_FAMILY,
      color: c.foreground,
      flexShrink: 1,
    },
    filtersBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 7,
      backgroundColor: c.card,
    },
    filtersBtnText: {
      fontSize: 12,
      fontFamily: FONT_FAMILY,
      color: c["muted-foreground"],
    },
    sortRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginLeft: "auto",
    },
    sortLabel: {
      fontSize: 11,
      fontFamily: FONT_FAMILY,
      color: c["muted-foreground"],
      marginRight: 4,
    },
    sortChip: {
      paddingHorizontal: 10,
      paddingVertical: 12,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    sortChipActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    sortChipText: {
      fontSize: 11,
      fontFamily: FONT_FAMILY_MEDIUM,
      color: c["muted-foreground"],
    },
    sortChipTextActive: {
      color: c["destructive-foreground"],
    },
    mainContent: {
      flex: 1,
      flexDirection: "row",
    },
    listContainer: {
      flex: 1,
    },
    loaderContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyListContainer: {
      flexGrow: 1,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 60,
    },
    emptyStateText: {
      fontSize: 13,
      fontFamily: FONT_FAMILY,
      color: c["muted-foreground"],
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: `${c.foreground}66`,
      justifyContent: "flex-end",
    },
    jobPickerContainer: {
      backgroundColor: c.card,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: "60%",
      paddingBottom: Platform.OS === "ios" ? 34 : 16,
    },
    jobPickerHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    jobPickerTitle: {
      fontSize: 16,
      fontFamily: FONT_FAMILY_SEMIBOLD,
      color: c.foreground,
    },
    jobOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: c["surface-muted"],
    },
    jobOptionSelected: {
      backgroundColor: c["surface-muted"],
    },
    jobOptionText: {
      fontSize: 14,
      fontFamily: FONT_FAMILY,
      color: c.foreground,
    },
    jobOptionTextSelected: {
      fontFamily: FONT_FAMILY_SEMIBOLD,
      color: c.foreground,
    },
    jobPickerEmpty: {
      padding: 20,
      textAlign: "center",
      fontFamily: FONT_FAMILY,
      color: c["muted-foreground"],
      fontSize: 13,
    },
  });
}
