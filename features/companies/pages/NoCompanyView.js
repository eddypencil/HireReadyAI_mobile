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
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { fetchAllCompanies, createCompany } from "../services/companies.service";
import { addMembership } from "../services/memberships.service";
import { useUser } from "../../auth/context/user.context";
import { MEMBERSHIP_PERMISSION } from "../../../shared/constants/enums";
import Snackbar from "../../../shared/ui/Snackbar";

const AVATAR_COLORS = [
  '#01497c', '#2a6f97', '#468faf', '#61a5c2', '#89c2d9',
  '#013a63', '#035a8f', '#1e7fa5', '#3b9bc7', '#5dade2',
];

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function NoCompanyView({ onCompanyJoined }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { t } = useTranslation();
  const { profile } = useUser();
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
  const styles = createStyles(c);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchAllCompanies();
        setCompanies((data || []).filter((c) => c.account_status !== "banned"));
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
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={styles.loadingText}>{t("companies.loading_companies")}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c['surface-muted'] }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ---- Error Banner ---- */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={c['destructive']} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ===== PRICING STEP ===== */}
        {showingPricing && !selectedPlan && (
          <View>
            <TouchableOpacity onPress={() => setShowingPricing(false)} style={styles.backRow}>
              <Ionicons name="arrow-back" size={18} color={c['muted-foreground']} />
              <Text style={styles.backText}>{t("companies.back")}</Text>
            </TouchableOpacity>
            <View style={styles.hero}>
              <View style={styles.heroIcon}>
                <Ionicons name="rocket" size={28} color={c.primary} />
              </View>
              <Text style={styles.heroTitle}>{t("companies.choose_plan")}</Text>
              <Text style={styles.heroSubtitle}>{t("companies.choose_plan_subtitle")}</Text>
            </View>

            {/* Free Plan */}
            <View style={styles.planCard}>
              <View style={styles.planIconWrap}>
                <Ionicons name="rocket-outline" size={22} color={c.primary} />
              </View>
              <Text style={styles.planName}>{t("companies.plan_free")}</Text>
              <View style={styles.planPriceRow}>
                <Text style={styles.planPrice}>{t("companies.plan_free_price")}</Text>
                <Text style={styles.planPeriod}>{t("companies.plan_free_period")}</Text>
              </View>
              <View style={styles.planFeatures}>
                {t("companies.plan_free_features").split("|").map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={18} color={c.success} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.selectPlanBtn}
                onPress={() => { setSelectedPlan("free"); setIsCreating(true); }}
              >
                <Text style={styles.selectPlanBtnText}>{t("companies.get_started_free")}</Text>
              </TouchableOpacity>
            </View>

            {/* Premium Plan */}
            <View style={[styles.planCard, styles.planCardPremium]}>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>{t("companies.coming_soon")}</Text>
              </View>
              <View style={[styles.planIconWrap, { backgroundColor: c.accent + '18' }]}>
                <Ionicons name="diamond" size={22} color={c.accent} />
              </View>
              <Text style={styles.planName}>{t("companies.plan_premium")}</Text>
              <View style={styles.planPriceRow}>
                <Text style={styles.planPrice}>{t("companies.plan_premium_price")}</Text>
                <Text style={styles.planPeriod}>{t("companies.plan_premium_period")}</Text>
              </View>
              <View style={styles.planFeatures}>
                {t("companies.plan_premium_features").split("|").map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={18} color={c.success} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.comingSoonBtn} disabled>
                <Text style={styles.comingSoonBtnText}>{t("companies.coming_soon")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ===== CREATE COMPANY FORM ===== */}
        {isCreating && selectedPlan === "free" && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <TouchableOpacity onPress={() => { setIsCreating(false); setSelectedPlan(null); setShowingPricing(true); }}>
                <Ionicons name="arrow-back" size={20} color={c['muted-foreground']} />
              </TouchableOpacity>
              <Text style={styles.formTitle}>{t("companies.create_company_title")}</Text>
            </View>
            <ScrollView style={styles.formBody} nestedScrollEnabled keyboardShouldPersistTaps="handled">
              <Text style={styles.label}>{t("companies.company_name")}</Text>
              <TextInput
                style={styles.input}
                value={newCompany.name}
                onChangeText={(t) => setNewCompany({ ...newCompany, name: t })}
                placeholder={t("companies.company_name_placeholder")}
                placeholderTextColor={c['muted-foreground']}
              />

              <Text style={styles.label}>{t("companies.industry")}</Text>
              <TextInput
                style={styles.input}
                value={newCompany.industry}
                onChangeText={(t) => setNewCompany({ ...newCompany, industry: t })}
                placeholder={t("companies.industry_placeholder_example")}
                placeholderTextColor={c['muted-foreground']}
              />

              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>{t("companies.company_size")}</Text>
                  <TextInput
                    style={styles.input}
                    value={newCompany.size}
                    onChangeText={(t) => setNewCompany({ ...newCompany, size: t })}
                    placeholder={t("companies.size_placeholder")}
                    placeholderTextColor={c['muted-foreground']}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>{t("companies.location")}</Text>
                  <TextInput
                    style={styles.input}
                    value={newCompany.location}
                    onChangeText={(t) => setNewCompany({ ...newCompany, location: t })}
                    placeholder={t("companies.location_placeholder")}
                    placeholderTextColor={c['muted-foreground']}
                  />
                </View>
              </View>

              <Text style={styles.label}>{t("companies.founded")}</Text>
              <TextInput
                style={styles.input}
                value={newCompany.founding_date}
                onChangeText={(t) => setNewCompany({ ...newCompany, founding_date: t })}
                placeholder={t("companies.founded_placeholder")}
                placeholderTextColor={c['muted-foreground']}
              />

              <Text style={styles.label}>{t("companies.about")}</Text>
              <TextInput
                style={styles.textArea}
                value={newCompany.description}
                onChangeText={(t) => setNewCompany({ ...newCompany, description: t })}
                placeholder={t("companies.about_placeholder")}
                placeholderTextColor={c['muted-foreground']}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>{t("companies.culture")}</Text>
                  <TextInput
                    style={styles.textAreaSmall}
                    value={newCompany.culture}
                    onChangeText={(t) => setNewCompany({ ...newCompany, culture: t })}
                    placeholder={t("companies.culture_placeholder")}
                    placeholderTextColor={c['muted-foreground']}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>{t("companies.benefits")}</Text>
                  <TextInput
                    style={styles.textAreaSmall}
                    value={newCompany.benefits}
                    onChangeText={(t) => setNewCompany({ ...newCompany, benefits: t })}
                    placeholder={t("companies.benefits_placeholder")}
                    placeholderTextColor={c['muted-foreground']}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <Text style={styles.label}>{t("companies.website")}</Text>
              <TextInput
                style={styles.input}
                value={newCompany.website_url}
                onChangeText={(t) => setNewCompany({ ...newCompany, website_url: t })}
                placeholder={t("companies.website_placeholder")}
                placeholderTextColor={c['muted-foreground']}
                keyboardType="url"
              />

              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>{t("companies.linkedin")}</Text>
                  <TextInput
                    style={styles.input}
                    value={newCompany.linkedin_url}
                    onChangeText={(t) => setNewCompany({ ...newCompany, linkedin_url: t })}
                    placeholder={t("companies.linkedin_placeholder")}
                    placeholderTextColor={c['muted-foreground']}
                    keyboardType="url"
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>{t("companies.twitter")}</Text>
                  <TextInput
                    style={styles.input}
                    value={newCompany.twitter_url}
                    onChangeText={(t) => setNewCompany({ ...newCompany, twitter_url: t })}
                    placeholder={t("companies.twitter_placeholder")}
                    placeholderTextColor={c['muted-foreground']}
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
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={c.white} />
                  ) : (
                    <Text style={styles.createBtnText}>{t("companies.create_company")}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}

        {/* ===== MAIN VIEW ===== */}
        {!showingPricing && !isCreating && (
          <>
            {/* Hero Section */}
            <View style={styles.hero}>
              <View style={styles.heroBannerIcon}>
                <Ionicons name="business" size={32} color={c.white} />
              </View>
              <Text style={styles.heroTitle}>{t("companies.join_or_create")}</Text>
              <Text style={styles.heroSubtitle}>{t("companies.hero_subtitle")}</Text>
              {companies.length > 0 && (
                <TouchableOpacity
                  style={styles.createNewBtn}
                  onPress={() => setShowingPricing(true)}
                >
                  <Ionicons name="add-circle" size={18} color={c.white} />
                  <Text style={styles.createNewBtnText}>{t("companies.create_new")}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Empty State */}
            {companies.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="building-outline" size={48} color={c['muted-foreground']} />
                </View>
                <Text style={styles.emptyTitle}>{t("companies.no_companies")}</Text>
                <Text style={styles.emptyDesc}>{t("companies.hero_subtitle")}</Text>
                <TouchableOpacity
                  style={styles.createNewBtn}
                  onPress={() => setShowingPricing(true)}
                >
                  <Ionicons name="add-circle" size={18} color={c.white} />
                  <Text style={styles.createNewBtnText}>{t("companies.create_a_company")}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Company Cards */
              <View style={styles.cardList}>
                {companies.map((company) => {
                  const avatarColor = getAvatarColor(company.name);
                  const isJoining = joining === company.id;
                  return (
                    <View key={company.id} style={styles.companyCard}>
                      <View style={styles.cardTop}>
                        <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
                          <Text style={styles.avatarLetter}>
                            {company.name?.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.cardInfo}>
                          <Text style={styles.companyName} numberOfLines={1}>
                            {company.name}
                          </Text>
                          {company.industry && (
                            <View style={[styles.industryBadge, { backgroundColor: avatarColor + '1A' }]}>
                              <Text style={[styles.industryText, { color: avatarColor }]}>
                                {company.industry}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View style={styles.cardMeta}>
                        {company.location ? (
                          <View style={styles.metaItem}>
                            <Ionicons name="location-outline" size={13} color={c['muted-foreground']} />
                            <Text style={styles.metaText} numberOfLines={1}>{company.location}</Text>
                          </View>
                        ) : null}
                        {company.size ? (
                          <View style={styles.metaItem}>
                            <Ionicons name="people-outline" size={13} color={c['muted-foreground']} />
                            <Text style={styles.metaText}>{t("companies.emp_count", { count: company.size })}</Text>
                          </View>
                        ) : null}
                      </View>

                      {company.description ? (
                        <Text style={styles.cardDesc} numberOfLines={2}>
                          {company.description}
                        </Text>
                      ) : null}

                      <TouchableOpacity
                        style={[styles.joinBtn, isJoining && styles.joinBtnDisabled]}
                        onPress={() => handleJoinCompany(company.id)}
                        disabled={isJoining}
                      >
                        {isJoining ? (
                          <ActivityIndicator size="small" color={c.white} />
                        ) : (
                          <>
                            <Ionicons name="enter-outline" size={16} color={c.white} />
                            <Text style={styles.joinBtnText}>{t("companies.join_company")}</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
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
      backgroundColor: c['surface-muted'],
    },
    content: {
      padding: 20,
      paddingBottom: 40,
      paddingTop: 30,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c['surface-muted'],
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: c['muted-foreground'],
    },
    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: c.destructive + '15',
      borderWidth: 1,
      borderColor: c.destructive + '30',
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      flex: 1,
      color: c.destructive,
      fontSize: 13,
    },

    /* Hero */
    hero: {
      alignItems: "center",
      marginBottom: 28,
      marginTop: 8,
    },
    heroBannerIcon: {
      width: 64,
      height: 64,
      borderRadius: 18,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    heroIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: c.primary + '15',
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    heroTitle: {
      fontSize: 26,
      fontWeight: '700',
      color: c.foreground,
      marginBottom: 8,
      textAlign: "center",
    },
    heroSubtitle: {
      fontSize: 14,
      color: c['muted-foreground'],
      textAlign: "center",
      marginBottom: 20,
      lineHeight: 20,
    },
    createNewBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: c.primary,
      paddingHorizontal: 24,
      paddingVertical: 13,
      borderRadius: 10,
    },
    createNewBtnText: {
      color: c.white,
      fontSize: 14,
      fontWeight: '600',
    },

    /* Empty State */
    emptyState: {
      alignItems: "center",
      backgroundColor: c.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 40,
    },
    emptyIconWrap: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: c['surface-muted'],
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: c.foreground,
      marginBottom: 8,
    },
    emptyDesc: {
      fontSize: 13,
      color: c['muted-foreground'],
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 18,
    },

    /* Company Card */
    cardList: {
      gap: 12,
    },
    companyCard: {
      backgroundColor: c.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
    },
    cardTop: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    avatarCircle: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    avatarLetter: {
      fontSize: 20,
      fontWeight: '700',
      color: c.white,
    },
    cardInfo: {
      flex: 1,
    },
    companyName: {
      fontSize: 16,
      fontWeight: '600',
      color: c.foreground,
      marginBottom: 4,
    },
    industryBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    industryText: {
      fontSize: 11,
      fontWeight: '600',
    },
    cardMeta: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 8,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      color: c['muted-foreground'],
    },
    cardDesc: {
      fontSize: 13,
      color: c['muted-foreground'],
      lineHeight: 18,
      marginBottom: 14,
    },
    joinBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: c.primary,
      paddingVertical: 12,
      borderRadius: 10,
    },
    joinBtnDisabled: {
      opacity: 0.6,
    },
    joinBtnText: {
      color: c.white,
      fontSize: 14,
      fontWeight: '600',
    },

    /* Back */
    backRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 16,
    },
    backText: {
      fontSize: 14,
      color: c['muted-foreground'],
    },

    /* Pricing Cards */
    planCard: {
      backgroundColor: c.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      padding: 24,
      marginBottom: 12,
    },
    planCardPremium: {
      borderColor: c.accent,
      position: "relative",
      overflow: "hidden",
    },
    premiumBadge: {
      position: "absolute",
      top: 12,
      right: 12,
      backgroundColor: c.accent,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    premiumBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: c.white,
    },
    planIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: c.primary + '15',
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    planName: {
      fontSize: 18,
      fontWeight: '700',
      color: c.foreground,
      marginBottom: 4,
    },
    planPriceRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 4,
      marginBottom: 20,
    },
    planPrice: {
      fontSize: 30,
      fontWeight: '800',
      color: c.foreground,
    },
    planPeriod: {
      fontSize: 13,
      color: c['muted-foreground'],
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
    featureText: {
      fontSize: 13,
      color: c['muted-foreground'],
      flex: 1,
    },
    selectPlanBtn: {
      backgroundColor: c.primary,
      paddingVertical: 13,
      borderRadius: 10,
      alignItems: "center",
    },
    selectPlanBtnText: {
      color: c.white,
      fontSize: 15,
      fontWeight: '600',
    },
    comingSoonBtn: {
      backgroundColor: c.border,
      paddingVertical: 13,
      borderRadius: 10,
      alignItems: "center",
    },
    comingSoonBtnText: {
      color: c['muted-foreground'],
      fontSize: 14,
      fontWeight: '600',
    },

    /* Form */
    formCard: {
      backgroundColor: c.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
    },
    formHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    formTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: c.foreground,
    },
    formBody: {
      padding: 20,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: c.foreground,
      marginBottom: 6,
      marginTop: 14,
    },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
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
    textArea: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: c.foreground,
      backgroundColor: c.card,
      minHeight: 80,
      textAlignVertical: "top",
    },
    textAreaSmall: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: c.foreground,
      backgroundColor: c.card,
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
      borderTopColor: c.border,
    },
    cancelBtn: {
      paddingHorizontal: 18,
      paddingVertical: 11,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    cancelBtnText: {
      fontSize: 13,
      fontWeight: '500',
      color: c['muted-foreground'],
    },
    createBtn: {
      paddingHorizontal: 22,
      paddingVertical: 11,
      borderRadius: 10,
      backgroundColor: c.primary,
      minWidth: 100,
      alignItems: "center",
    },
    createBtnDisabled: {
      opacity: 0.6,
    },
    createBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: c.white,
    },
  });
}
