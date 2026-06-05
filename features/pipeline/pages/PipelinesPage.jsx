import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePipelines } from "../hooks/usePipelines";
import { useCompany } from "../../companies/pages/CompanyLayout";
import PipelineCard from "../components/PipelineCard";
import { colors } from "../../../src/theme";

export default function PipelinesPage() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { company } = useCompany();
  const { pipelines, loading, error } = usePipelines(company?.id);

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <View style={styles.errorWrap}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.red[400]} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>PIPELINES</Text>
        <Text style={styles.headerTitle}>
          {company?.name || "Company"} Pipelines
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
            <Ionicons name="git-network-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No pipelines found</Text>
            <Text style={styles.emptyHint}>
              Create a job posting to start building a pipeline.
            </Text>
          </View>
        }
      />
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.gray[900],
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
    fontWeight: "600",
    color: colors.gray[500],
  },
  emptyHint: {
    fontSize: 13,
    color: colors.gray[400],
    textAlign: "center",
    paddingHorizontal: 40,
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
});
