import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { usePipeline } from "../hooks/usePipeline";
import PipelineBuilder from "../components/PipelineBuilder";

export default function PipelineBuilderPage() {
  const { theme } = useTheme();
  const { t, language } = useTranslation();
  const isRtl = language === 'ar';
  const c = theme.colors;
  const styles = createStyles(c);
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
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <View style={styles.errorWrap}>
          <Ionicons name="alert-circle-outline" size={32} color={c.destructive} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backLink, isRtl && styles.rowReverse]}
          >
            <Ionicons name={isRtl ? 'arrow-forward-outline' : 'arrow-back-outline'} size={16} color={c.primary} />
            <Text style={[styles.backLinkText, isRtl && styles.textRight]}>{t("pipeline.back_to_pipelines")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {warning && (
        <View style={styles.warningBanner}>
          <Ionicons name="alert-circle-outline" size={18} color={c.destructive} />
          <Text style={styles.warningText}>{warning}</Text>
        </View>
      )}

      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.topBarBack, isRtl && styles.rowReverse]}
        >
          <Ionicons name={isRtl ? 'arrow-forward-outline' : 'arrow-back-outline'} size={18} color={c['muted-foreground']} />
          <Text style={[styles.topBarBackText, isRtl && styles.textRight]}>{t("pipeline.pipelines")}</Text>
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

function createStyles(c) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c['surface-muted'],
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: c['surface-muted'],
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
      backgroundColor: c['surface-muted'],
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    warningText: {
      fontSize: 13,
      fontWeight: '500',
      color: c.foreground,
      flex: 1,
      lineHeight: 18,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      backgroundColor: c.card,
    },
    topBarBack: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingRight: 8,
    },
    rowReverse: { flexDirection: 'row-reverse' },
    textRight: { textAlign: 'right' },
    topBarBackText: {
      fontSize: 13,

      color: c['muted-foreground'],
    },
    topBarSeparator: {
      marginHorizontal: 4,
    },
    topBarSeparatorText: {
      fontSize: 14,

      color: c.border,
    },
    topBarTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: c.foreground,
      flex: 1,
      marginHorizontal: 4,
    },
    topBarSeniority: {
      backgroundColor: c.border,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    topBarSeniorityText: {
      fontSize: 11,
      fontWeight: '600',
      color: c.foreground,
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

      color: c.destructive,
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
      fontWeight: '500',
      color: c.primary,
    },
  });
}
