import { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from "react-native";
import { useThemedAlert } from "../context/ThemedAlertContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSidebar } from "../context/SidebarContext";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../../features/auth/context/user.context";
import { USER_ROLE } from "../constants/enums";
import { spacing, borderRadius, fontSize, fontWeight } from "../../src/theme";
import { useTranslation } from "../context/I18nContext";
import LanguageSwitcher from "../i18n/LanguageSwitcher";

const SIDEBAR_WIDTH = 280;

export default function AnimatedSidebar({ companyData, membershipPermission }) {
  const { alert } = useThemedAlert();
  const { isOpen, close } = useSidebar();
  const { theme, toggleTheme, isDark } = useTheme();
  const { language, t } = useTranslation();
  const c = theme.colors;
  const navigation = useNavigation();
  const { profile, signOutUser } = useUser();
  const isApplicant = profile?.role === USER_ROLE.applicant;
  const isAdmin = profile?.role === USER_ROLE.admin;
  const showClosureWarning = companyData?.account_status === "closing_warning" && membershipPermission === "hr_manager";

  const adminLinks = [
    { name: "AdminDashboard", label: "nav.admin_dashboard", icon: "shield", screen: "AdminDashboard" },
    { name: "AdminReports", label: "nav.reports", icon: "flag", screen: "AdminReports" },
    { name: "AdminCompanies", label: "nav.companies", icon: "business", screen: "AdminCompanies" },
    { name: "AdminAppeals", label: "nav.appeals", icon: "chatbox", screen: "AdminAppeals" },
    { name: "AdminTechnicalIssues", label: "nav.technical_issues", icon: "bug", screen: "AdminTechnicalIssues" },
  ];

  const applicantLinks = [
    {
      name: "Jobs",
      label: "nav.explore_jobs",
      icon: "briefcase",
      screen: "JobsTab",
    },
    {
      name: "MyApplications",
      label: "nav.my_applications",
      icon: "document-text",
      screen: "ApplicantHome",
    },
    {
      name: "Feedback",
      label: "nav.my_feedback",
      icon: "bar-chart",
      screen: "ApplicantFeedback",
    },
    {
      name: "Profile",
      label: "nav.my_profile",
      icon: "person-circle-outline",
      screen: "ApplicantProfile",
    },
    {
      name: "ContactUs",
      label: "contact_us.badge",
      icon: "mail-outline",
      screen: "ContactUs",
    },
  ];

  const recruiterLinks = [
    {
      name: "Dashboard",
      label: "nav.dashboard",
      icon: "grid",
      screen: "RecruiterHome",
    },
    {
      name: "CompanyProfile",
      label: "nav.company_profile",
      icon: "business",
      screen: "CompanyProfile",
    },
    {
      name: "JobPostings",
      label: "nav.job_postings",
      icon: "briefcase",
      screen: "JobPostings",
    },
    {
      name: "Shortlists",
      label: "nav.shortlists",
      icon: "heart",
      screen: "Shortlists",
    },
    {
      name: "JDGenerator",
      label: "nav.jd_generator",
      icon: "sparkles",
      screen: "JDGenerator",
    },
    {
      name: "Pipeline",
      label: "nav.pipeline",
      icon: "git-branch",
      screen: "Pipeline",
    },
    {
      name: "ContactUs",
      label: "contact_us.badge",
      icon: "mail-outline",
      screen: "ContactUs",
    },
  ];

  const links = isAdmin ? adminLinks : (isApplicant ? applicantLinks : recruiterLinks);

  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: isOpen ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen, slideAnim, fadeAnim]);

  useEffect(() => {
    close();
  }, [language]);

  const screenExists = (navState, name) => {
    if (!navState) return false;
    if (navState.routeNames?.includes(name)) return true;
    if (navState.routes) {
      return navState.routes.some((r) =>
        r.state ? screenExists(r.state, name) : r.name === name,
      );
    }
    return false;
  };

  const handleNavigate = (screenName) => {
    close();
    if (!navigation) return;
    const rootState = navigation.getRootState();
    if (screenExists(rootState, screenName)) {
      if (screenName === "ApplicantProfile") {
        navigation.navigate("ApplicantProfile", {
          profileId: profile?.id,
          viewOnly: false,
        });
      } else {
        navigation.navigate(screenName);
      }
    } else {
      alert("Unavailable", "Join or create an organization first.");
    }
  };

  const handleSignOut = () => {
    close();
    signOutUser();
  };

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={isOpen ? "auto" : "none"}
    >
      <Animated.View
        style={[styles.backdrop, { opacity: fadeAnim }]}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={close}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.sidebar,
          {
            backgroundColor: c.sidebar,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.sidebarSafe}>
          <View style={styles.drawerHeader}>
            <View style={[styles.logoMark, { backgroundColor: c.accent }]}>
              <Text
                style={[
                  styles.logoText,
                  { color: c["destructive-foreground"] },
                ]}
              >
                H
              </Text>
            </View>
            <Text
              style={[styles.wordmark, { color: c["destructive-foreground"] }]}
            >
              HireReadyAI
            </Text>
          </View>

          <View
            style={[
              styles.userChip,
              {
                borderTopColor: `${c["destructive-foreground"]}14`,
                borderBottomColor: `${c["destructive-foreground"]}14`,
              },
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: `${c.accent}33` }]}>
              <Text style={[styles.avatarText, { color: c.accent }]}>
                {profile?.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "?"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.userName,
                  { color: c["destructive-foreground"] },
                ]}
              >
                {profile?.full_name || "User"}
              </Text>
              <Text
                style={[
                  styles.userRole,
                  { color: `${c["destructive-foreground"]}80` },
                ]}
              >
                {profile?.role || ""}
              </Text>
            </View>
            <LanguageSwitcher />
          </View>

          <ScrollView
            style={styles.navScroll}
            showsVerticalScrollIndicator={false}
          >
            {links.map((link) => (
              <TouchableOpacity
                key={link.name}
                onPress={() => handleNavigate(link.screen)}
                style={styles.navItem}
                activeOpacity={0.7}
              >
                <View style={{ position: "relative" }}>
                  <Ionicons
                    name={link.icon}
                    size={18}
                    color={`${c["destructive-foreground"]}b3`}
                    style={styles.navIcon}
                  />
                  {showClosureWarning && link.icon === "business" && (
                    <View style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: c.warning }} />
                  )}
                </View>
                <Text
                  style={[
                    styles.navLabel,
                    { color: `${c["destructive-foreground"]}cc` },
                  ]}
                >
                  {t(link.label)}
                </Text>
              </TouchableOpacity>
            ))}
            {showClosureWarning && (
              <View style={[styles.warningBanner, { backgroundColor: `${c.warning}18`, borderTopColor: `${c["destructive-foreground"]}14`, marginTop: spacing[3] }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: `${c.warning}22`, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: c.warning }}>!</Text>
                  </View>
                  <Text style={{ flex: 1, fontSize: 11, color: c["muted-foreground"], lineHeight: 15 }}>
                    <Text style={{ fontWeight: "600", color: c.foreground }}>{companyData.name}</Text> closing{" "}
                    <Text style={{ fontWeight: "600", color: c.warning }}>
                      {companyData.closing_deadline ? new Date(companyData.closing_deadline).toLocaleDateString() : "soon"}
                    </Text>
                    {companyData.suspension_reason ? <Text>{` — ${companyData.suspension_reason}`}</Text> : null}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate("ContactSupport", {
                    companyId: companyData.id,
                    companyName: companyData.name,
                    suspensionReason: companyData.suspension_reason,
                    closingDeadline: companyData.closing_deadline,
                  })}
                  style={{ marginTop: 8, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: c.primary, alignSelf: "flex-end" }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "600", color: "#fff" }}>Contact Support</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.themeButton,
              { borderTopColor: `${c["destructive-foreground"]}14` },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? "sunny" : "moon"}
              size={18}
              color={c["muted-foreground"]}
            />
            <Text style={[styles.themeText, { color: c["muted-foreground"] }]}>
              {t(isDark ? "light_mode" : "dark_mode")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignOut}
            style={[
              styles.logoutButton,
              { borderTopColor: `${c["destructive-foreground"]}14` },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out" size={18} color={c.destructive} />
            <Text style={[styles.logoutText, { color: c.destructive }]}>
              {t("logout")}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 40,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 50,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sidebarSafe: {
    flex: 1,
    padding: spacing[4],
    justifyContent: "space-between",
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2.5],
    paddingHorizontal: spacing[1],
    paddingVertical: spacing[2],
    marginBottom: spacing[5],
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  wordmark: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  userChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2.5],
    paddingHorizontal: spacing[1],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: spacing[4],
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '600',
  },
  userName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  userRole: {
    fontSize: fontSize.xs,
    textTransform: "capitalize",
  },
  navScroll: {
    flex: 1,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2.5],
    borderRadius: borderRadius.lg,
    marginBottom: 2,
  },
  navIcon: {
    width: 20,
    textAlign: "center",
  },
  navLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  themeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderTopWidth: 1,
  },
  themeText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  warningBanner: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2.5],
    borderTopWidth: 1,
    marginTop: spacing[1],
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderTopWidth: 1,
    marginTop: spacing[2],
  },
  logoutText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
});
