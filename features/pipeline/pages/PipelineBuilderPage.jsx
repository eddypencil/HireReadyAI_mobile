import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePipeline } from "../hooks/usePipeline";
import PipelineBuilder from "../components/PipelineBuilder";
import { colors } from "../../../src/theme";

export default function PipelineBuilderPage() {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const { jobId } = route.params || {};
  const {
    job,
    stages,
    loading,
    error,
    warning,
    handleAddStage,
    handleUpdateStage,
    handleDeleteStage,
    moveStage,
    handleReorderStages,
  } = usePipeline(jobId);

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.darkAmethyst[600]} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <View style={styles.errorWrap}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.red[400]} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backLink}
          >
            <Ionicons name="arrow-back-outline" size={16} color={colors.darkAmethyst[600]} />
            <Text style={styles.backLinkText}>Back to Pipelines</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {warning && (
        <View style={styles.warningBanner}>
          <Ionicons name="alert-circle-outline" size={18} color={colors.red[600]} />
          <Text style={styles.warningText}>{warning}</Text>
        </View>
      )}

      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.topBarBack}
        >
          <Ionicons name="arrow-back-outline" size={18} color={colors.gray[500]} />
          <Text style={styles.topBarBackText}>Pipelines</Text>
        </TouchableOpacity>
        <View style={styles.topBarSeparator}>
          <Text style={styles.topBarSeparatorText}>/</Text>
        </View>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {job?.title}
        </Text>
        {job?.seniority_level && (
          <View style={styles.topBarSeniority}>
            <Text style={styles.topBarSeniorityText}>
              {job.seniority_level}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.builderContainer}>
        <PipelineBuilder
          job={job}
          stages={stages}
          onAddStage={handleAddStage}
          onUpdateStage={handleUpdateStage}
          onDeleteStage={handleDeleteStage}
          moveStage={moveStage}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gray[50],
  },
  warningBanner: {
    position: "absolute",
    top: 8,
    left: 16,
    right: 16,
    zIndex: 50,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: colors.red[50],
    borderWidth: 1,
    borderColor: colors.red[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  warningText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.red[700],
    flex: 1,
    lineHeight: 18,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    backgroundColor: colors.white,
  },
  topBarBack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingRight: 8,
  },
  topBarBackText: {
    fontSize: 13,
    color: colors.gray[500],
  },
  topBarSeparator: {
    marginHorizontal: 4,
  },
  topBarSeparatorText: {
    fontSize: 14,
    color: colors.gray[300],
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[900],
    flex: 1,
    marginHorizontal: 4,
  },
  topBarSeniority: {
    backgroundColor: colors.darkAmethyst[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topBarSeniorityText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.darkAmethyst[700],
    textTransform: "capitalize",
  },
  builderContainer: {
    flex: 1,
  },
  errorWrap: {
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.red[600],
    textAlign: "center",
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.darkAmethyst[600],
  },
});
