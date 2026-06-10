import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { supabase } from "../../../shared/services/supabase";
import { useJobs } from "../../jobs/hooks/useJobs";
import { useCompany } from "./CompanyLayout";
import { useUser } from "../../auth/context/user.context";
import { seedAnchorStages } from "../../recruiter/services/candidatesPipline.service";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function JDGeneratorResultPage({ route }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const styles = createStyles(c);

  const params = route.params;
  const { company, reload: reloadCompany } = useCompany();
  const { profile } = useUser();
  const { createJob } = useJobs();

  const [generating, setGenerating] = useState(true);
  const [aiResult, setAiResult] = useState(null);
  const [generateError, setGenerateError] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    generateJD();
  }, []);

  async function generateJD() {
    setGenerating(true);
    setGenerateError(null);
    try {
      const { data: result, error: invokeError } = await supabase.functions.invoke("jd-generate", {
        body: {
          title: params.title,
          seniority: params.seniority,
          workLocation: params.workLocation,
          location: company?.location || "",
          keyNotes: params.keyNotes || "",
          requiredSkills: params.requiredSkills || "",
          experienceYears: params.experienceYears,
          companyName: company?.name || "",
          companyIndustry: company?.industry || "",
        },
      });
      if (invokeError) throw new Error(invokeError.message);
      setAiResult(result);
    } catch (err) {
      setGenerateError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handlePublish() {
    if (!aiResult || !company?.id) return;
    setPublishing(true);
    setPublishError(null);
    try {
      const newJob = await createJob({
        company_id: company.id,
        created_by_profile_id: profile?.id || null,
        title: params.title,
        seniority_level: params.seniority || null,
        job_type: params.jobType || null,
        work_location: params.workLocation || null,
        experience_years: params.experienceYears || null,
        description: aiResult.description,
        responsibilities: aiResult.responsibilities,
        requirements: aiResult.requirements,
        skills: aiResult.skills,
        salary_min: params.salaryMin ? Number(params.salaryMin) : null,
        salary_max: params.salaryMax ? Number(params.salaryMax) : null,
      });

      if (newJob?.id) {
        await seedAnchorStages(newJob.id);
      }

      setPublished(true);
      reloadCompany();
    } catch (err) {
      setPublishError(err.message);
    } finally {
      setPublishing(false);
    }
  }

  if (published) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={36} color={c.primary} />
        </View>
        <Text style={styles.successTitle}>{t("companies.job_published")}</Text>
        <Text style={styles.successSubtitle}>
          {t("companies.publish_success", { title: params.title })}
        </Text>
      </View>
    );
  }

  if (generating) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={styles.loadingText}>{t("companies.generating")}</Text>
        <Text style={styles.loadingSubtext}>{t("companies.generating_subtext")}</Text>
      </View>
    );
  }

  if (generateError) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={c.destructive} />
        <Text style={styles.errorTitle}>{t("companies.generation_failed")}</Text>
        <Text style={styles.errorBody}>{generateError}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={generateJD}>
          <Text style={styles.retryBtnText}>{t("companies.try_again")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.pageContainer, { paddingTop: insets.top }]} contentContainerStyle={styles.pageContent}>
      <View style={styles.previewColumn}>
        <View style={styles.previewContent}>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={14} color={c['muted-foreground']} />
            <Text style={styles.aiBadgeText}> {t("companies.ai_generated")}</Text>
          </View>

          <Text style={styles.previewTitle}>{params.title}</Text>

          <View style={styles.previewMeta}>
            {company?.name && (
              <View style={styles.metaTag}>
                <Text style={styles.metaText}>{company.name}</Text>
              </View>
            )}
            {params.workLocation && (
              <View style={styles.metaTag}>
                <Text style={styles.metaText}>
                  {params.workLocation.replace(/_/g, " ")}
                </Text>
              </View>
            )}
            {params.jobType && (
              <View style={styles.metaTag}>
                <Text style={styles.metaText}>
                  {params.jobType.replace(/_/g, " ")}
                </Text>
              </View>
            )}
            {params.seniority && (
              <View style={styles.metaTag}>
                <Text style={styles.metaText}>
                  {params.seniority}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.salaryDisplay}>
            <Ionicons name="cash-outline" size={14} color={c['muted-foreground']} />
            <Text style={styles.salaryDisplayText}>
              {params.salaryMin && params.salaryMax
                ? t("companies.salary_range_display", { min: Number(params.salaryMin).toLocaleString(), max: Number(params.salaryMax).toLocaleString() })
                : t("companies.salary_confidential")}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.previewSection}>
            <Text style={styles.previewSectionTitle}>{t("companies.about_role")}</Text>
            <Text style={styles.previewSectionBody}>
              {aiResult?.description}
            </Text>
          </View>

          {aiResult?.responsibilities?.length > 0 && (
            <View style={styles.previewSection}>
              <Text style={styles.previewSectionTitle}>{t("companies.what_youll_do")}</Text>
              {aiResult.responsibilities.map((item, i) => (
                <View key={i} style={styles.listRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.listItem}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {aiResult?.requirements?.length > 0 && (
            <View style={styles.previewSection}>
              <Text style={styles.previewSectionTitle}>{t("companies.what_were_looking_for")}</Text>
              {aiResult.requirements.map((item, i) => (
                <View key={i} style={styles.listRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.listItem}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {aiResult?.skills?.length > 0 && (
            <View style={styles.previewSection}>
              <Text style={styles.previewSectionTitle}>{t("companies.skills_and_tools")}</Text>
              <View style={styles.skillsGrid}>
                {aiResult.skills.map((skill, i) => (
                  <View key={i} style={styles.skillRow}>
                    <View style={styles.skillBullet} />
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {publishError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{publishError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.publishBtn, publishing && styles.publishBtnDisabled]}
            onPress={handlePublish}
            disabled={publishing}
          >
            {publishing ? (
              <ActivityIndicator size="small" color={c['destructive-foreground']} />
            ) : (
              <Text style={styles.publishBtnText}>{t("companies.publish_jd")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    pageContainer: {
      flex: 1,
      backgroundColor: c['surface-muted'],
    },
    pageContent: {
      padding: 20,
      paddingBottom: 40,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: c['surface-muted'],
      padding: 24,
    },
    loadingText: {
      fontSize: 16,
      fontWeight: "600",
      color: c.foreground,
      marginTop: 20,
    },
    loadingSubtext: {
      fontSize: 13,
      color: c['muted-foreground'],
      marginTop: 6,
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: c.foreground,
      marginTop: 16,
    },
    errorBody: {
      fontSize: 13,
      color: c.primary,
      textAlign: "center",
      marginTop: 8,
      lineHeight: 20,
    },
    retryBtn: {
      backgroundColor: c.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 24,
    },
    retryBtnText: {
      color: c['destructive-foreground'],
      fontSize: 14,
      fontWeight: "600",
    },
    previewColumn: {
      backgroundColor: c.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 24,
    },
    previewContent: {
      gap: 20,
    },
    aiBadge: {
      flexDirection: "row",
      alignItems: "center",
    },
    aiBadgeText: {
      fontSize: 11,
      color: c['muted-foreground'],
    },
    previewTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: c.foreground,
    },
    previewMeta: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    metaTag: {
      backgroundColor: c['surface-muted'],
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    metaText: {
      fontSize: 12,
      color: c.primary,
      textTransform: "capitalize",
    },
    salaryDisplay: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    salaryDisplayText: {
      fontSize: 13,
      color: c.primary,
    },
    divider: {
      height: 1,
      backgroundColor: c.border,
    },
    previewSection: {
      gap: 8,
    },
    previewSectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: c.foreground,
      marginBottom: 2,
    },
    previewSectionBody: {
      fontSize: 14,
      color: c.foreground,
      lineHeight: 22,
    },
    listRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c['muted-foreground'],
      marginTop: 7,
    },
    listItem: {
      fontSize: 13,
      color: c.foreground,
      flex: 1,
      lineHeight: 20,
    },
    skillsGrid: {
      gap: 8,
    },
    skillRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    skillBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c['muted-foreground'],
    },
    skillText: {
      fontSize: 13,
      color: c.foreground,
    },
    errorBanner: {
      backgroundColor: `${c.destructive}1a`,
      borderWidth: 1,
      borderColor: `${c.destructive}40`,
      borderRadius: 8,
      padding: 12,
    },
    errorBannerText: {
      fontSize: 12,
      color: c.destructive,
    },
    publishBtn: {
      backgroundColor: c.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    publishBtnDisabled: {
      backgroundColor: c['muted-foreground'],
    },
    publishBtnText: {
      color: c['destructive-foreground'],
      fontSize: 15,
      fontWeight: "600",
    },
    successContainer: {
      flex: 1,
      backgroundColor: c['surface-muted'],
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    successIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: c.border,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    successTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: c.foreground,
      marginBottom: 8,
      textAlign: "center",
    },
    successSubtitle: {
      fontSize: 13,
      color: c.foreground,
      textAlign: "center",
      lineHeight: 22,
    },
  });
}
