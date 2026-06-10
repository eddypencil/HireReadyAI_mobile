import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { fetchAllCompanies, createCompany } from "../services/companies.service";
import { addMembership } from "../services/memberships.service";
import { useUser } from "../../auth/context/user.context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NoCompanyView({ onCompanyJoined }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const { profile } = useUser();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    industry: "",
    size: "",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const styles = createStyles(c);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchAllCompanies();
        setCompanies(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleJoinCompany = async (companyId) => {
    if (!profile?.id) return;
    try {
      setJoining(companyId);
      await addMembership({
        company_id: companyId,
        profile_id: profile.id,
        permissions: { role: "recruiter" },
      });
      onCompanyJoined(companyId);
    } catch (err) {
      setError(err.message);
    } finally {
      setJoining(null);
    }
  };

  const handleCreateCompany = async () => {
    if (!profile?.id) return;
    try {
      setIsSubmitting(true);
      setError(null);
      const created = await createCompany({
        name: newCompany.name,
        industry: newCompany.industry,
        size: newCompany.size ? parseInt(newCompany.size, 10) : null,
        location: newCompany.location,
      });
      await addMembership({
        company_id: created.id,
        profile_id: profile.id,
        permissions: { role: "admin" },
      });
      onCompanyJoined(created.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color={c.primary} />
        <Text style={styles.loadingText}>{t("companies.loading_companies")}</Text>
      </View>
    );
  }

  const renderCompanyCard = ({ item: company }) => (
    <View style={styles.companyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarLetter}>
            {company.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.companyName}>{company.name}</Text>
          <Text style={styles.companyIndustry}>
            {company.industry || t("companies.organization")}
          </Text>
        </View>
      </View>
      {company.size && (
        <Text style={styles.companySize}>
          {t("companies.employees_count", { size: company.size.toLocaleString() })}
        </Text>
      )}
      <TouchableOpacity
        style={[styles.joinBtn, joining === company.id && styles.joinBtnDisabled]}
        onPress={() => handleJoinCompany(company.id)}
        disabled={joining === company.id}
      >
        <Text style={styles.joinBtnText}>
          {joining === company.id ? t("companies.joining") : t("companies.join")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} contentContainerStyle={styles.content}>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isCreating ? (
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <TouchableOpacity onPress={() => setIsCreating(false)}>
              <Text style={styles.backArrow}>{"<"}</Text>
            </TouchableOpacity>
            <Text style={styles.formTitle}>{t("companies.create_new_company")}</Text>
          </View>

          <View style={styles.formBody}>
            <Text style={styles.label}>{t("companies.company_name")}</Text>
            <TextInput
              style={styles.input}
              value={newCompany.name}
              onChangeText={(text) =>
                setNewCompany({ ...newCompany, name: text })
              }
              placeholder={t("companies.company_name_placeholder")}
              placeholderTextColor={c['muted-foreground']}
            />

            <Text style={styles.label}>{t("companies.industry")}</Text>
            <TextInput
              style={styles.input}
              value={newCompany.industry}
              onChangeText={(text) =>
                setNewCompany({ ...newCompany, industry: text })
              }
              placeholder={t("companies.industry_placeholder")}
              placeholderTextColor={c['muted-foreground']}
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("companies.company_size")}</Text>
                <TextInput
                  style={styles.input}
                  value={newCompany.size}
                  onChangeText={(text) =>
                    setNewCompany({ ...newCompany, size: text })
                  }
                  placeholder={t("companies.employees_placeholder")}
                  placeholderTextColor={c['muted-foreground']}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("companies.location")}</Text>
                <TextInput
                  style={styles.input}
                  value={newCompany.location}
                  onChangeText={(text) =>
                    setNewCompany({ ...newCompany, location: text })
                  }
                  placeholder={t("companies.location_placeholder")}
                  placeholderTextColor={c['muted-foreground']}
                />
              </View>
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsCreating(false)}
              >
                <Text style={styles.cancelBtnText}>{t("companies.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createBtn, isSubmitting && styles.createBtnDisabled]}
                onPress={handleCreateCompany}
                disabled={isSubmitting}
              >
                <Text style={styles.createBtnText}>
                  {isSubmitting ? t("companies.creating") : t("companies.create_company")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Text style={styles.heroIconText}>H</Text>
            </View>
            <Text style={styles.heroTitle}>{t("companies.join_or_create")}</Text>
            <Text style={styles.heroSubtitle}>
              {t("companies.hero_subtitle")}
            </Text>
            {companies.length > 0 && (
              <TouchableOpacity
                style={styles.createNewBtn}
                onPress={() => setIsCreating(true)}
              >
                <Text style={styles.createNewBtnText}>
                  {t("companies.create_new")}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {companies.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {t("companies.no_companies")}
              </Text>
              <TouchableOpacity
                style={styles.createNewBtn}
                onPress={() => setIsCreating(true)}
              >
                <Text style={styles.createNewBtnText}>{t("companies.create_a_company")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={companies}
              keyExtractor={(item) => item.id}
              renderItem={renderCompanyCard}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.gridRow}
            />
          )}
        </>
      )}
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c['surface-muted'],
    },
    content: {
      padding: 24,
      paddingBottom: 40,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c['surface-muted'],
    },
    loadingText: {
      marginTop: 8,
      fontSize: 13,
      color: c['muted-foreground'],
    },
    errorBanner: {
      backgroundColor: `${c.destructive}1a`,
      borderColor: `${c.destructive}40`,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      color: c.destructive,
      fontSize: 13,
    },
    hero: {
      alignItems: "center",
      marginBottom: 32,
    },
    heroIcon: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: c.border,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    heroIconText: {
      fontSize: 28,
      fontWeight: "700",
      color: c.foreground,
    },
    heroTitle: {
      fontSize: 26,
      fontWeight: "700",
      color: c.foreground,
      marginBottom: 8,
      textAlign: "center",
    },
    heroSubtitle: {
      fontSize: 14,
      color: c['muted-foreground'],
      textAlign: "center",
      marginBottom: 20,
    },
    createNewBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.foreground,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    createNewBtnText: {
      color: c['destructive-foreground'],
      fontSize: 14,
      fontWeight: "600",
    },
    emptyState: {
      alignItems: "center",
      backgroundColor: c.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      padding: 48,
    },
    emptyText: {
      color: c['muted-foreground'],
      marginBottom: 24,
      fontSize: 14,
    },
    gridRow: {
      justifyContent: "space-between",
      marginBottom: 12,
    },
    companyCard: {
      flex: 1,
      backgroundColor: c.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      marginHorizontal: 4,
      justifyContent: "space-between",
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    avatarCircle: {
      width: 44,
      height: 44,
      borderRadius: 8,
      backgroundColor: c.border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    avatarLetter: {
      fontSize: 18,
      fontWeight: "700",
      color: c.foreground,
    },
    cardInfo: {
      flex: 1,
    },
    companyName: {
      fontSize: 15,
      fontWeight: "600",
      color: c.foreground,
      marginBottom: 2,
    },
    companyIndustry: {
      fontSize: 12,
      color: c['muted-foreground'],
    },
    companySize: {
      fontSize: 11,
      color: c['muted-foreground'],
      marginBottom: 12,
    },
    joinBtn: {
      backgroundColor: c['surface-muted'],
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    joinBtnDisabled: {
      opacity: 0.5,
    },
    joinBtnText: {
      color: c.foreground,
      fontSize: 13,
      fontWeight: "500",
    },
    formCard: {
      backgroundColor: c.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
    },
    formHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    backArrow: {
      fontSize: 20,
      color: c['muted-foreground'],
      marginRight: 12,
    },
    formTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: c.foreground,
    },
    formBody: {
      padding: 20,
    },
    label: {
      fontSize: 12,
      fontWeight: "600",
      color: c.foreground,
      marginBottom: 6,
      marginTop: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: c.foreground,
      backgroundColor: c.card,
    },
    row: {
      flexDirection: "row",
      gap: 12,
    },
    halfField: {
      flex: 1,
    },
    formActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
      marginTop: 24,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    cancelBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    cancelBtnText: {
      fontSize: 13,
      fontWeight: "500",
      color: c.foreground,
    },
    createBtn: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: c.foreground,
    },
    createBtnDisabled: {
      opacity: 0.5,
    },
    createBtnText: {
      fontSize: 13,
      fontWeight: "600",
      color: c['destructive-foreground'],
    },
  });
}
