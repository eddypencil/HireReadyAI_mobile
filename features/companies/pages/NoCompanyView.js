import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../../src/theme";
import { useSidebar } from "../../../shared/context/SidebarContext";
import { fetchAllCompanies, createCompany } from "../services/companies.service";
import { addMembership } from "../services/memberships.service";
import { useUser } from "../../auth/context/user.context";
import { signOut } from "../../auth/services/auth.service";

export default function NoCompanyView({ onCompanyJoined }) {
  const { profile } = useUser();
  const { toggle } = useSidebar();
  const insets = useSafeAreaInsets();
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

  const handleSignOut = () => {
    
    signOut();
  };

  const renderHeader = () => (
    <View style={[localStyles.header, { paddingTop: insets.top + 8 }]}>
      <TouchableOpacity onPress={toggle} style={localStyles.menuBtn}>
        <Ionicons name="menu" size={22} color={colors.white} />
      </TouchableOpacity>
      <Text style={localStyles.headerTitle}>Company Setup</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color={colors.darkAmethyst[600]} />
        <Text style={styles.loadingText}>Loading companies...</Text>
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
            {company.industry || "Organization"}
          </Text>
        </View>
      </View>
      {company.size && (
        <Text style={styles.companySize}>
          {company.size.toLocaleString()} employees
        </Text>
      )}
      <TouchableOpacity
        style={[styles.joinBtn, joining === company.id && styles.joinBtnDisabled]}
        onPress={() => handleJoinCompany(company.id)}
        disabled={joining === company.id}
      >
        <Text style={styles.joinBtnText}>
          {joining === company.id ? "Joining..." : "Join"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.darkAmethyst[50] }}>
      {renderHeader()}
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
            <Text style={styles.formTitle}>Create a New Company</Text>
          </View>

          <View style={styles.formBody}>
            <Text style={styles.label}>Company Name</Text>
            <TextInput
              style={styles.input}
              value={newCompany.name}
              onChangeText={(text) =>
                setNewCompany({ ...newCompany, name: text })
              }
              placeholder="Acme Corp"
              placeholderTextColor={colors.darkAmethyst[300]}
            />

            <Text style={styles.label}>Industry</Text>
            <TextInput
              style={styles.input}
              value={newCompany.industry}
              onChangeText={(text) =>
                setNewCompany({ ...newCompany, industry: text })
              }
              placeholder="e.g. Technology, Healthcare"
              placeholderTextColor={colors.darkAmethyst[300]}
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Company Size</Text>
                <TextInput
                  style={styles.input}
                  value={newCompany.size}
                  onChangeText={(text) =>
                    setNewCompany({ ...newCompany, size: text })
                  }
                  placeholder="Employees"
                  placeholderTextColor={colors.darkAmethyst[300]}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  value={newCompany.location}
                  onChangeText={(text) =>
                    setNewCompany({ ...newCompany, location: text })
                  }
                  placeholder="City, Country"
                  placeholderTextColor={colors.darkAmethyst[300]}
                />
              </View>
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsCreating(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createBtn, isSubmitting && styles.createBtnDisabled]}
                onPress={handleCreateCompany}
                disabled={isSubmitting}
              >
                <Text style={styles.createBtnText}>
                  {isSubmitting ? "Creating..." : "Create Company"}
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
            <Text style={styles.heroTitle}>Join or Create a Company</Text>
            <Text style={styles.heroSubtitle}>
              Select a company to get started with HireReadyAI or create your
              own
            </Text>
            {companies.length > 0 && (
              <TouchableOpacity
                style={styles.createNewBtn}
                onPress={() => setIsCreating(true)}
              >
                <Text style={styles.createNewBtnText}>
                  + Create a New Company
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {companies.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No companies available to join.
              </Text>
              <TouchableOpacity
                style={styles.createNewBtn}
                onPress={() => setIsCreating(true)}
              >
                <Text style={styles.createNewBtnText}>+ Create a Company</Text>
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
      <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton} activeOpacity={0.7}>
        <Ionicons name="log-out" size={18} color="#ef4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const localStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  menuBtn: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.white,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkAmethyst[50],
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[50],
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.gray[500],
  },
  errorBanner: {
    backgroundColor: colors.red[50],
    borderColor: colors.red[200],
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.red[700],
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
    backgroundColor: colors.darkAmethyst[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroIconText: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.darkAmethyst[700],
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.darkAmethyst[950],
    marginBottom: 8,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: "center",
    marginBottom: 20,
  },
  createNewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.darkAmethyst[950],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createNewBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[100],
    padding: 48,
  },
  emptyText: {
    color: colors.gray[500],
    marginBottom: 24,
    fontSize: 14,
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  companyCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[100],
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
    backgroundColor: colors.darkAmethyst[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.darkAmethyst[700],
  },
  cardInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.darkAmethyst[950],
    marginBottom: 2,
  },
  companyIndustry: {
    fontSize: 12,
    color: colors.gray[500],
  },
  companySize: {
    fontSize: 11,
    color: colors.gray[500],
    marginBottom: 12,
  },
  joinBtn: {
    backgroundColor: colors.darkAmethyst[50],
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  joinBtnDisabled: {
    opacity: 0.5,
  },
  joinBtnText: {
    color: colors.darkAmethyst[700],
    fontSize: 13,
    fontWeight: "500",
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[100],
    overflow: "hidden",
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  backArrow: {
    fontSize: 20,
    color: colors.gray[500],
    marginRight: 12,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.darkAmethyst[950],
  },
  formBody: {
    padding: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.gray[700],
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.darkAmethyst[700],
    backgroundColor: colors.white,
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
    borderTopColor: colors.gray[100],
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.gray[700],
  },
  createBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.darkAmethyst[950],
  },
  createBtnDisabled: {
    opacity: 0.5,
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.white,
  },
});
