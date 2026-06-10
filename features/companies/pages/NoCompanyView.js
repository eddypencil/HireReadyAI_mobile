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
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchAllCompanies, createCompany } from "../services/companies.service";
import { addMembership } from "../services/memberships.service";
import { useUser } from "../../auth/context/user.context";
import { MEMBERSHIP_PERMISSION } from "../../../shared/constants/enums";

export default function NoCompanyView({ onCompanyJoined }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();
  const { profile, signOutUser } = useUser();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showingPricing, setShowingPricing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [newCompany, setNewCompany] = useState({
    name: "",
    industry: "",
    size: "",
    location: "",
    description: "",
    culture: "",
    benefits: "",
    founding_date: "",
    website_url: "",
    linkedin_url: "",
    twitter_url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const styles = createStyles(colors);

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
        recruiter_permissions: MEMBERSHIP_PERMISSION.pending,
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
        description: newCompany.description,
        culture: newCompany.culture,
        benefits: newCompany.benefits,
        founding_date: newCompany.founding_date || null,
        website_url: newCompany.website_url,
        linkedin_url: newCompany.linkedin_url,
        twitter_url: newCompany.twitter_url,
      });
      await addMembership({
        company_id: created.id,
        profile_id: profile.id,
        recruiter_permissions: MEMBERSHIP_PERMISSION.hrManager,
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
        <ActivityIndicator size="small" color={colors.primary} />
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
      <View style={[styles.headerBar, { paddingTop: insets.top }]}>
        <View style={styles.logoWrap}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>H</Text>
          </View>
          <Text style={styles.wordmark}>HireReadyAI</Text>
        </View>
        <TouchableOpacity onPress={signOutUser} style={styles.signOutBtn}>
          <Ionicons name="log-out" size={16} color={c['muted-foreground']} />
          <Text style={styles.signOutText}>{t("companies.sign_out")}</Text>
        </TouchableOpacity>
      </View>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Pricing Step */}
      {showingPricing && !selectedPlan && (
        <View>
          <TouchableOpacity onPress={() => setShowingPricing(false)} style={styles.backRow}>
            <Text style={styles.backArrow}>{"< "}</Text>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Choose your plan</Text>
            <Text style={styles.heroSubtitle}>
              Start with a free plan and upgrade anytime
            </Text>
          </View>
          <View style={styles.pricingRow}>
            <View style={styles.planCard}>
              <View style={styles.planIconWrap}>
                <Text style={styles.planIcon}>✓</Text>
              </View>
              <Text style={styles.planName}>Free</Text>
              <Text style={styles.planPrice}>$0</Text>
              <Text style={styles.planPeriod}>forever</Text>
              <View style={styles.planFeatures}>
                {["Up to 10 active job postings", "Basic candidate management", "Team collaboration (up to 5 members)", "Email support"].map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Text style={styles.featureCheck}>✓</Text>
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.selectPlanBtn}
                onPress={() => { setSelectedPlan("free"); setIsCreating(true); }}
              >
                <Text style={styles.selectPlanBtnText}>Get Started Free</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.planCard, styles.planCardPremium]}>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>Coming Soon</Text>
              </View>
              <View style={styles.planIconWrap}>
                <Text style={[styles.planIcon, { color: colors.amber[500] }]}>★</Text>
              </View>
              <Text style={styles.planName}>Premium</Text>
              <Text style={styles.planPrice}>$29</Text>
              <Text style={styles.planPeriod}>/month</Text>
              <View style={styles.planFeatures}>
                {["Unlimited job postings", "AI-powered candidate screening", "Advanced analytics & reports", "Priority support", "Custom branding"].map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Text style={styles.featureCheck}>✓</Text>
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.comingSoonBtn} disabled>
                <Text style={styles.comingSoonBtnText}>Coming Soon</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Create Company Form */}
      {isCreating && selectedPlan === "free" && (
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <TouchableOpacity onPress={() => { setIsCreating(false); setSelectedPlan(null); setShowingPricing(true); }}>
              <Text style={styles.formBackArrow}>{"<"}</Text>
            </TouchableOpacity>
            <Text style={styles.formTitle}>Create Company</Text>
          </View>
          <ScrollView style={styles.formBody} nestedScrollEnabled>
            <Text style={styles.label}>Company Name</Text>
            <TextInput
              style={styles.input}
              value={newCompany.name}
              onChangeText={(t) => setNewCompany({ ...newCompany, name: t })}
              placeholder="Acme Corp"
              placeholderTextColor={colors.darkAmethyst[300]}
            />

            <Text style={styles.label}>{t("companies.industry")}</Text>
            <TextInput
              style={styles.input}
              value={newCompany.industry}
              onChangeText={(t) => setNewCompany({ ...newCompany, industry: t })}
              placeholder="e.g. Technology, Healthcare"
              placeholderTextColor={colors.darkAmethyst[300]}
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("companies.company_size")}</Text>
                <TextInput
                  style={styles.input}
                  value={newCompany.size}
                  onChangeText={(t) => setNewCompany({ ...newCompany, size: t })}
                  placeholder="Employees"
                  placeholderTextColor={colors.darkAmethyst[300]}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("companies.location")}</Text>
                <TextInput
                  style={styles.input}
                  value={newCompany.location}
                  onChangeText={(t) => setNewCompany({ ...newCompany, location: t })}
                  placeholder="City, Country"
                  placeholderTextColor={colors.darkAmethyst[300]}
                />
              </View>
            </View>

            <Text style={styles.label}>Founded</Text>
            <TextInput
              style={styles.input}
              value={newCompany.founding_date}
              onChangeText={(t) => setNewCompany({ ...newCompany, founding_date: t })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.darkAmethyst[300]}
            />

            <Text style={styles.label}>About</Text>
            <TextInput
              style={styles.textArea}
              value={newCompany.description}
              onChangeText={(t) => setNewCompany({ ...newCompany, description: t })}
              placeholder="Tell applicants about your company..."
              placeholderTextColor={colors.darkAmethyst[300]}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Culture</Text>
                <TextInput
                  style={styles.textAreaSmall}
                  value={newCompany.culture}
                  onChangeText={(t) => setNewCompany({ ...newCompany, culture: t })}
                  placeholder="Company values, culture..."
                  placeholderTextColor={colors.darkAmethyst[300]}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Benefits</Text>
                <TextInput
                  style={styles.textAreaSmall}
                  value={newCompany.benefits}
                  onChangeText={(t) => setNewCompany({ ...newCompany, benefits: t })}
                  placeholder="Perks, benefits..."
                  placeholderTextColor={colors.darkAmethyst[300]}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              value={newCompany.website_url}
              onChangeText={(t) => setNewCompany({ ...newCompany, website_url: t })}
              placeholder="https://example.com"
              placeholderTextColor={colors.darkAmethyst[300]}
              keyboardType="url"
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>LinkedIn</Text>
                <TextInput
                  style={styles.input}
                  value={newCompany.linkedin_url}
                  onChangeText={(t) => setNewCompany({ ...newCompany, linkedin_url: t })}
                  placeholder="LinkedIn URL"
                  placeholderTextColor={colors.darkAmethyst[300]}
                  keyboardType="url"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Twitter</Text>
                <TextInput
                  style={styles.input}
                  value={newCompany.twitter_url}
                  onChangeText={(t) => setNewCompany({ ...newCompany, twitter_url: t })}
                  placeholder="Twitter URL"
                  placeholderTextColor={colors.darkAmethyst[300]}
                  keyboardType="url"
                />
              </View>
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setIsCreating(false); setSelectedPlan(null); }}
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
          </ScrollView>
        </View>
      )}

      {/* Main View */}
      {!showingPricing && !isCreating && (
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
                onPress={() => setShowingPricing(true)}
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
                onPress={() => setShowingPricing(true)}
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
      <Snackbar
        message={error}
        visible={!!error}
        onDismiss={() => setError(null)}
      />
    </KeyboardAvoidingView>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.darkAmethyst[50],
    },
    content: {
      padding: 24,
      paddingBottom: 40,
    },
    headerBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 8,
      backgroundColor: c.sidebar,
    },
    logoWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    logoMark: {
      width: 28,
      height: 28,
      borderRadius: 6,
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: {
      fontSize: 16,
      fontWeight: "700",
      color: c['destructive-foreground'],
    },
    wordmark: {
      fontSize: 17,
      fontWeight: "600",
      color: c['sidebar-foreground'],
    },
    signOutBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: c.border,
    },
    signOutText: {
      fontSize: 12,
      color: c['muted-foreground'],
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.gray[50],
    },
    loadingText: {
      marginTop: 8,
      fontSize: 13,
      color: c.gray[500],
    },
    errorBanner: {
      backgroundColor: c.red[50],
      borderColor: c.red[200],
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      color: c.red[700],
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
      backgroundColor: c.darkAmethyst[100],
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    heroIconText: {
      fontSize: 28,
      fontWeight: "700",
      color: c.darkAmethyst[700],
    },
    heroTitle: {
      fontSize: 26,
      fontWeight: "700",
      color: c.darkAmethyst[950],
      marginBottom: 8,
      textAlign: "center",
    },
    heroSubtitle: {
      fontSize: 14,
      color: c.gray[600],
      textAlign: "center",
      marginBottom: 20,
    },
    createNewBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.darkAmethyst[950],
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    createNewBtnText: {
      color: c.white,
      fontSize: 14,
      fontWeight: "600",
    },
    emptyState: {
      alignItems: "center",
      backgroundColor: c.white,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.gray[100],
      padding: 48,
    },
    emptyText: {
      color: c.gray[500],
      marginBottom: 24,
      fontSize: 14,
    },
    gridRow: {
      justifyContent: "space-between",
      marginBottom: 12,
    },
    companyCard: {
      flex: 1,
      backgroundColor: c.white,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.gray[100],
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
      backgroundColor: c.darkAmethyst[100],
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    avatarLetter: {
      fontSize: 18,
      fontWeight: "700",
      color: c.darkAmethyst[700],
    },
    cardInfo: {
      flex: 1,
    },
    companyName: {
      fontSize: 15,
      fontWeight: "600",
      color: c.darkAmethyst[950],
      marginBottom: 2,
    },
    companyIndustry: {
      fontSize: 12,
      color: c.gray[500],
    },
    companySize: {
      fontSize: 11,
      color: c.gray[500],
      marginBottom: 12,
    },
    joinBtn: {
      backgroundColor: c.darkAmethyst[50],
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    joinBtnDisabled: {
      opacity: 0.5,
    },
    joinBtnText: {
      color: c.darkAmethyst[700],
      fontSize: 13,
      fontWeight: "500",
    },
    backRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    backArrow: {
      fontSize: 16,
      color: c.gray[500],
    },
    backText: {
      fontSize: 13,
      color: c.gray[500],
    },
    pricingRow: {
      gap: 16,
      marginBottom: 24,
    },
    planCard: {
      backgroundColor: c.white,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.gray[100],
      padding: 24,
      marginBottom: 12,
    },
    planCardPremium: {
      borderColor: c.darkAmethyst[300],
      backgroundColor: c.darkAmethyst[50],
      position: "relative",
      overflow: "hidden",
    },
    premiumBadge: {
      position: "absolute",
      top: 12,
      right: 12,
      backgroundColor: c.darkAmethyst[600],
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    premiumBadgeText: {
      fontSize: 10,
      fontWeight: "700",
      color: c.white,
    },
    planIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: c.darkAmethyst[50],
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    planIcon: {
      fontSize: 20,
      fontWeight: "700",
      color: c.darkAmethyst[600],
    },
    planName: {
      fontSize: 18,
      fontWeight: "700",
      color: c.darkAmethyst[950],
      marginBottom: 4,
    },
    planPrice: {
      fontSize: 28,
      fontWeight: "800",
      color: c.darkAmethyst[950],
    },
    planPeriod: {
      fontSize: 12,
      color: c.gray[500],
      marginBottom: 20,
    },
    planFeatures: {
      gap: 10,
      marginBottom: 24,
    },
    featureRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    featureCheck: {
      fontSize: 14,
      color: c.emerald[500],
      fontWeight: "700",
    },
    featureText: {
      fontSize: 13,
      color: c.gray[600],
      flex: 1,
    },
    selectPlanBtn: {
      backgroundColor: c.darkAmethyst[950],
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    selectPlanBtnText: {
      color: c.white,
      fontSize: 14,
      fontWeight: "600",
    },
    comingSoonBtn: {
      backgroundColor: c.gray[200],
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    comingSoonBtnText: {
      color: c.gray[500],
      fontSize: 14,
      fontWeight: "600",
    },
    formCard: {
      backgroundColor: c.white,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.gray[100],
      overflow: "hidden",
      maxHeight: "100%",
    },
    formHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: c.gray[100],
    },
    formBackArrow: {
      fontSize: 20,
      color: c.gray[500],
      marginRight: 12,
    },
    formTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: c.darkAmethyst[950],
    },
    formBody: {
      padding: 20,
    },
    label: {
      fontSize: 12,
      fontWeight: "600",
      color: c.gray[700],
      marginBottom: 6,
      marginTop: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: c.gray[300],
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: c.darkAmethyst[700],
      backgroundColor: c.white,
    },
    row: {
      flexDirection: "row",
      gap: 12,
    },
    halfField: {
      flex: 1,
    },
    textArea: {
      borderWidth: 1,
      borderColor: c.gray[300],
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: c.darkAmethyst[700],
      backgroundColor: c.white,
      minHeight: 80,
      textAlignVertical: "top",
    },
    textAreaSmall: {
      borderWidth: 1,
      borderColor: c.gray[300],
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: c.darkAmethyst[700],
      backgroundColor: c.white,
      minHeight: 60,
      textAlignVertical: "top",
    },
    formActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
      marginTop: 24,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: c.gray[100],
    },
    cancelBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.gray[300],
      backgroundColor: c.white,
    },
    cancelBtnText: {
      fontSize: 13,
      fontWeight: "500",
      color: c.gray[700],
    },
    createBtn: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: c.darkAmethyst[950],
    },
    createBtnDisabled: {
      opacity: 0.5,
    },
    createBtnText: {
      fontSize: 13,
      fontWeight: "600",
      color: c.white,
    },
  });
}
