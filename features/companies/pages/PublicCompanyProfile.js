import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { fetchCompanyById, fetchJobsByCompanyId } from "../services/companies.service";

export default function PublicCompanyProfile({ route }) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { id } = route?.params || {};
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const styles = createStyles(colors);

  useEffect(() => {
    if (!id) { setError("No company ID"); setLoading(false); return; }
    (async () => {
      try {
        setLoading(true);
        const companyData = await fetchCompanyById(id);
        if (!companyData) { setError("Company not found"); return; }
        setCompany(companyData);
        const jobsData = await fetchJobsByCompanyId(id);
        setJobs(jobsData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color={colors.darkAmethyst[600]} />
        <Text style={styles.loadingText}>Loading company...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Error</Text>
          <Text style={styles.errorDetail}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!company) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Cover */}
      <View style={styles.cover}>
        <View style={styles.coverGradient} />
      </View>

      {/* Logo + Name */}
      <View style={styles.headerRow}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>
            {company.name?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.companyName}>{company.name}</Text>
          {company.industry && (
            <View style={styles.industryBadge}>
              <Text style={styles.industryText}>{company.industry}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Company Details</Text>
        {company.location && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={colors.darkAmethyst[500]} />
            <Text style={styles.detailText}>{company.location}</Text>
          </View>
        )}
        {company.size && (
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color={colors.darkAmethyst[500]} />
            <Text style={styles.detailText}>{company.size.toLocaleString()} employees</Text>
          </View>
        )}
        {company.founding_date && (
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.darkAmethyst[500]} />
            <Text style={styles.detailText}>Founded {company.founding_date}</Text>
          </View>
        )}
      </View>

      {/* Links */}
      {(company.website_url || company.linkedin_url || company.twitter_url) && (
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Links</Text>
          {company.website_url && (
            <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL(company.website_url)}>
              <Ionicons name="globe-outline" size={16} color={colors.darkAmethyst[500]} />
              <Text style={styles.linkText} numberOfLines={1}>
                {company.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </Text>
            </TouchableOpacity>
          )}
          {company.linkedin_url && (
            <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL(company.linkedin_url)}>
              <Ionicons name="globe-outline" size={16} color={colors.darkAmethyst[500]} />
              <Text style={styles.linkText}>LinkedIn</Text>
            </TouchableOpacity>
          )}
          {company.twitter_url && (
            <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL(company.twitter_url)}>
              <Ionicons name="globe-outline" size={16} color={colors.darkAmethyst[500]} />
              <Text style={styles.linkText}>Twitter</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* About */}
      {company.description && (
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="business-outline" size={14} color={colors.darkAmethyst[500]} /> About
          </Text>
          <Text style={styles.bodyText}>{company.description}</Text>
        </View>
      )}

      {/* Culture */}
      {company.culture && (
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Culture</Text>
          <Text style={styles.bodyText}>{company.culture}</Text>
        </View>
      )}

      {/* Benefits */}
      {company.benefits && (
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <Text style={styles.bodyText}>{company.benefits}</Text>
        </View>
      )}

      {/* Open Positions */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="briefcase-outline" size={14} color={colors.darkAmethyst[500]} /> Open Positions ({jobs.length})
        </Text>
        {jobs.length === 0 ? (
          <Text style={styles.bodyText}>No open positions at the moment.</Text>
        ) : (
          jobs.map((job) => (
            <View key={job.id} style={styles.jobCard}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobMeta}>
                {job.seniority_level || "Any"} &middot; {job.work_location || "Any"}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.gray[50],
    },
    content: {
      paddingBottom: 40,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.gray[50],
      padding: 20,
    },
    loadingText: {
      marginTop: 8,
      fontSize: 13,
      color: c.gray[500],
    },
    errorBox: {
      backgroundColor: c.red[50],
      borderWidth: 1,
      borderColor: c.red[200],
      borderRadius: 12,
      padding: 16,
      maxWidth: 300,
      alignItems: "center",
    },
    errorText: {
      fontSize: 14,
      fontWeight: "600",
      color: c.red[700],
      marginBottom: 4,
    },
    errorDetail: {
      fontSize: 12,
      color: c.red[600],
      textAlign: "center",
    },
    cover: {
      height: 160,
      backgroundColor: c.darkAmethyst[50],
    },
    coverGradient: {
      flex: 1,
      backgroundColor: c.darkAmethyst[50],
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingHorizontal: 20,
      marginTop: -32,
      marginBottom: 20,
    },
    logoBox: {
      width: 64,
      height: 64,
      borderRadius: 14,
      backgroundColor: c.white,
      borderWidth: 2,
      borderColor: c.white,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    logoText: {
      fontSize: 22,
      fontWeight: "700",
      color: c.darkAmethyst[600],
    },
    headerInfo: {
      marginLeft: 14,
      flex: 1,
      paddingTop: 32,
    },
    companyName: {
      fontSize: 22,
      fontWeight: "700",
      color: c.darkAmethyst[950],
      marginBottom: 4,
    },
    industryBadge: {
      alignSelf: "flex-start",
      backgroundColor: c.darkAmethyst[50],
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 6,
    },
    industryText: {
      fontSize: 11,
      fontWeight: "600",
      color: c.darkAmethyst[600],
    },
    detailsCard: {
      backgroundColor: c.white,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.gray[100],
      padding: 20,
      marginHorizontal: 20,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: c.darkAmethyst[950],
      marginBottom: 12,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 8,
    },
    detailText: {
      fontSize: 14,
      color: c.gray[600],
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 6,
    },
    linkText: {
      fontSize: 14,
      color: c.darkAmethyst[500],
      flex: 1,
    },
    bodyText: {
      fontSize: 14,
      color: c.gray[600],
      lineHeight: 22,
    },
    jobCard: {
      backgroundColor: c.gray[50],
      borderRadius: 8,
      padding: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: c.gray[100],
    },
    jobTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: c.darkAmethyst[950],
      marginBottom: 4,
    },
    jobMeta: {
      fontSize: 12,
      color: c.gray[500],
    },
  });
}
