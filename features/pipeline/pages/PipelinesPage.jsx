import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { usePipelines } from "../hooks/usePipelines";
import { useCompany } from "../../companies/pages/CompanyLayout";
import PipelineCard from "../components/PipelineCard";
import { useTranslation } from "../../../shared/context/I18nContext";

export default function PipelinesPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const styles = createStyles(c);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { company } = useCompany();
  const { pipelines, loading, error } = usePipelines(company?.id);

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
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>{t("pipeline.pipelines_header")}</Text>
        <Text style={styles.headerTitle}>
          {company?.name || t("pipeline.company")} {t("pipeline.pipelines")}
        </Text>
      </View>

      <FlatList
        data={pipelines}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PipelineCard
            pipeline={item}
            onPress={(pipeline) =>
              navigation.navigate("PipelineBuilder", { jobId: pipeline.id })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="git-network-outline" size={48} color={c.border} />
            <Text style={styles.emptyTitle}>{t("pipeline.no_pipelines")}</Text>
            <Text style={styles.emptyHint}>
              {t("pipeline.create_job_hint")}
            </Text>
          </View>
        }
      />
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
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
    },
    headerLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: c['muted-foreground'],
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: c.foreground,
    },
    list: {
      padding: 16,
    },
    emptyContainer: {
      alignItems: "center",
      paddingTop: 60,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: c['muted-foreground'],
    },
    emptyHint: {
      fontSize: 13,

      color: c['muted-foreground'],
      textAlign: "center",
      paddingHorizontal: 40,
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
  });
}
