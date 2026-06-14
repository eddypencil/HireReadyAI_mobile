import React, { useRef } from "react";
import * as Linking from "expo-linking";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  UserProvider,
  useUser,
} from "../../features/auth/context/user.context";
import {
  SidebarProvider,
  useSidebar,
} from "../../shared/context/SidebarContext";
import { ThemeProvider, useTheme } from "../../shared/context/ThemeContext";
import AnimatedSidebar from "../../shared/ui/AnimatedSidebar";
import { USER_ROLE } from "../../shared/constants/enums";
import { spacing, borderRadius, fontSize, fontWeight } from "../theme";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useTranslation } from '../../shared/context/I18nContext';


import LoginPage from "../../features/auth/pages/LoginPage";
import RegisterPage from "../../features/auth/pages/RegisterPage";
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../../features/auth/pages/ResetPasswordPage";
import GoogleRoleSelectPage from "../../features/auth/pages/GoogleRoleSelectPage";
import OnboardingScreen from "../../features/auth/pages/OnboardingScreen";
import EditBioScreen from "../../features/applicant/screens/edit/EditBioScreen";
import EditContactScreen from "../../features/applicant/screens/edit/EditContactScreen";
import EditLinksScreen from "../../features/applicant/screens/edit/EditLinksScreen";
import EditVolunteeringScreen from "../../features/applicant/screens/edit/EditVolunteeringScreen";
import EditLanguagesScreen from "../../features/applicant/screens/edit/EditLanguagesScreen";
import EditCertificatesScreen from "../../features/applicant/screens/edit/EditCertificatesScreen";
import EditAwardsScreen from "../../features/applicant/screens/edit/EditAwardsScreen";
import ApplicantProfilePage from "../../features/applicant/pages/ApplicantProfilePage";
import EditExperienceScreen from "../../features/applicant/screens/edit/EditExperienceScreen";
import EditEducationScreen from "../../features/applicant/screens/edit/EditEducationScreen";
import EditSkillsScreen from "../../features/applicant/screens/edit/EditSkillsScreen";
import EditProjectScreen from "../../features/applicant/screens/edit/EditProjectScreen";
import JobsPage from "../../features/jobs/pages/JobsPage";
import JobDetailsPage from "../../features/jobs/pages/JobDetailsPage";
import ShortlistsPage from "../../features/shortlist/pages/ShortlistsPage";
import { CompanyProvider } from "../../features/companies/pages/CompanyLayout";
import CompanyProfile from "../../features/companies/pages/CompanyProfile";
import JDGeneratorPage from "../../features/companies/pages/JDGeneratorPage";
import JDGeneratorResultPage from "../../features/companies/pages/JDGeneratorResultPage";
import ApplicationQuestionsPage from "../../features/companies/pages/ApplicationQuestionsPage";
import JDPublishSuccessPage from "../../features/companies/pages/JDPublishSuccessPage";
import JobPostings from "../../features/companies/pages/JobPostings";
import ApplicantPage from "../../features/applicant/pages/ApplicantPage";
import ApplicantFeedbackPage from "../../features/applicant/pages/ApplicantFeedbackPage";
import RecruiterScreen from "../../features/recruiter/pages/RecruiterScreen";
import PipelineCandidatesPage from "../../features/recruiter/pages/PipelineCandidatesPage";
import CandidateProfileScreen from "../../features/recruiter/pages/CandidateProfileScreen";
import CandidateAssessmentsScreen from "../../features/recruiter/pages/CandidateAssessmentsScreen";
import PipelinesPage from "../../features/pipeline/pages/PipelinesPage";
import PipelineBuilderPage from "../../features/pipeline/pages/PipelineBuilderPage";
import InterviewPage from "../../features/interview/pages/InterviewPage";
import ApplyJobPage from "../../features/applications/pages/ApplyJobPage";
import ContactUsScreen from "../../features/support/pages/ContactUsScreen";


const AuthStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();
const InnerStack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginPage} />
      <AuthStack.Screen name="Register" component={RegisterPage} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordPage} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordPage} />
    </AuthStack.Navigator>
  );
}

function Header({ title, routeName }) {
  const insets = useSafeAreaInsets();
  const { toggle } = useSidebar();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;

  const keyMap = {
    JobsTab: 'nav.explore_jobs',
    ApplicantHome: 'nav.my_applications',
    ApplicantFeedback: 'nav.my_feedback',
    ApplicantProfile: 'nav.my_profile',
    RecruiterHome: 'nav.dashboard',
    CompanyProfile: 'nav.company_profile',
    JDGenerator: 'nav.jd_generator',
    JDGeneratorResult: 'nav.jd_generator',
    JobPostings: 'nav.job_postings',
    Shortlists: 'nav.shortlists',
    Pipeline: 'nav.pipeline',
    PipelinesPage: 'nav.pipeline',
    PipelineBuilder: 'nav.pipeline',
    ContactUs: 'contact_us.badge',
  };

  const displayTitle = keyMap[routeName] ? t(keyMap[routeName]) : title;

  return (
    <View
      style={[
        headerStyles.container,
        { backgroundColor: c.sidebar, paddingTop: insets.top + spacing[2] },
      ]}
    >
      <TouchableOpacity onPress={toggle} style={headerStyles.menuBtn}>
        <Ionicons name="menu" size={22} color={c["sidebar-foreground"]} />
      </TouchableOpacity>
      <Text style={[headerStyles.title, { color: c['sidebar-foreground'] }]}>{displayTitle}</Text>

      <View style={{ width: 40 }} />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
  },
  menuBtn: {
    padding: spacing[1],
    marginRight: spacing[3],
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
  },
});

function getScreenTitle(routeName) {
  const titles = {
    JobsTab: "Explore Jobs",
    ApplicantHome: "My Applications",
    RecruiterHome: "Dashboard",
    CompanyProfile: "Company Profile",
    JDGenerator: "JD Generator",
    JDGeneratorResult: "Generated JD",
    JobPostings: "Job Postings",
    Shortlists: "Shortlists",
    Pipeline: "Pipeline",
    PipelinesPage: "Pipelines",
    PipelineBuilder: "Pipeline Builder",
    CandidateProfile: "Candidate Profile",
    CandidateAssessments: "Assessments & Interviews",
    ContactUs: "Contact Us",
  };
  return titles[routeName] || routeName;
}

function MainScreens() {
  const { profile } = useUser();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;

  if (!profile) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: c.background,
        }}
      >
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  const isApplicant = profile?.role === USER_ROLE.applicant;

  if (isApplicant) {
    return (
      <InnerStack.Navigator
        screenOptions={({ route }) => ({
          header: () => <Header title={getScreenTitle(route.name)} routeName={route.name} />,
        })}
      >
        <InnerStack.Screen name="JobsTab" component={JobsPage} />
        <InnerStack.Screen name="ApplicantHome" component={ApplicantPage} />

        <InnerStack.Screen
          name="ApplicantFeedback"
          component={ApplicantFeedbackPage}
         
        />
        <InnerStack.Screen
          name="ApplicantProfile"
          component={ApplicantProfilePage}
        />
        <InnerStack.Screen name="EditBio" component={EditBioScreen}
          options={{ header: undefined, headerShown: true, headerTitle: t('profile.edit_titles.bio'), headerTitleStyle: { fontWeight: '600' },
                    headerStyle: { backgroundColor: c.primary }, headerTintColor: c.white }} />
        <InnerStack.Screen name="EditContact" component={EditContactScreen}
          options={{ header: undefined, headerShown: true, headerTitle: t('profile.edit_titles.contact'), headerTitleStyle: { fontWeight: '600' },
                    headerStyle: { backgroundColor: c.primary }, headerTintColor: c.white }} />
        <InnerStack.Screen name="EditLinks" component={EditLinksScreen}
          options={{ header: undefined, headerShown: true, headerTitle: t('profile.edit_titles.links'), headerTitleStyle: { fontWeight: '600' },
                    headerStyle: { backgroundColor: c.primary }, headerTintColor: c.white }} />
        <InnerStack.Screen name="EditVolunteering" component={EditVolunteeringScreen}
          options={{ header: undefined, headerShown: true, headerTitle: t('profile.edit_titles.volunteering'), headerTitleStyle: { fontWeight: '600' },
                    headerStyle: { backgroundColor: c.primary }, headerTintColor: c.white }} />
        <InnerStack.Screen name="EditLanguages" component={EditLanguagesScreen}
          options={{ header: undefined, headerShown: true, headerTitle: t('profile.edit_titles.languages'), headerTitleStyle: { fontWeight: '600' },
                    headerStyle: { backgroundColor: c.primary }, headerTintColor: c.white }} />
        <InnerStack.Screen name="EditCertificates" component={EditCertificatesScreen}
          options={{ header: undefined, headerShown: true, headerTitle: t('profile.edit_titles.certificates'), headerTitleStyle: { fontWeight: '600' },
                    headerStyle: { backgroundColor: c.primary }, headerTintColor: c.white }} />
        <InnerStack.Screen name="EditAwards" component={EditAwardsScreen}
          options={{ header: undefined, headerShown: true, headerTitle: t('profile.edit_titles.awards'), headerTitleStyle: { fontWeight: '600' },
                    headerStyle: { backgroundColor: c.primary }, headerTintColor: c.white }} />
        <InnerStack.Screen
          name="EditExperience"
          component={EditExperienceScreen}
          options={{
            header: undefined,
            headerShown: true,
            headerTitle: t('profile.edit_titles.experience'),
            headerTitleStyle: { fontWeight: '600' },
            headerStyle: { backgroundColor: c.primary },
            headerTintColor: c.white,
          }}
        />
        <InnerStack.Screen
          name="EditEducation"
          component={EditEducationScreen}
          options={{
            header: undefined,
            headerShown: true,
            headerTitle: t('profile.edit_titles.education'),
            headerTitleStyle: { fontWeight: '600' },
            headerStyle: { backgroundColor: c.primary },
            headerTintColor: c.white,
          }}
        />
        <InnerStack.Screen
          name="EditSkills"
          component={EditSkillsScreen}
          options={{
            header: undefined,
            headerShown: true,
            headerTitle: t('profile.edit_titles.skills'),
            headerTitleStyle: { fontWeight: '600' },
            headerStyle: { backgroundColor: c.primary },
            headerTintColor: c.white,
          }}
        />
        <InnerStack.Screen
          name="EditProject"
          component={EditProjectScreen}
          options={{
            header: undefined,
            headerShown: true,
            headerTitle: t('profile.edit_titles.projects'),
            headerTitleStyle: { fontWeight: '600' },
            headerStyle: { backgroundColor: c.primary },
            headerTintColor: c.white,
          }}
        />
        <InnerStack.Screen name="ContactUs" component={ContactUsScreen} />
      </InnerStack.Navigator>
    );
  }

  return (
    <CompanyProvider>
      <InnerStack.Navigator
        screenOptions={({ route }) => ({
          header: () => <Header title={getScreenTitle(route.name)} routeName={route.name} />,
        })}
      >
        <InnerStack.Screen name="RecruiterHome" component={RecruiterScreen} />
        <InnerStack.Screen name="ApplicantProfile" component={ApplicantProfilePage}
          options={{ headerShown: true, headerTitle: t('profile.applicant_profile'), headerTitleStyle: { fontWeight: '600' },
                    headerStyle: { backgroundColor: c.primary },
                    headerTintColor: c.white }} />
        <InnerStack.Screen name="CompanyProfile" component={CompanyProfile} />
        <InnerStack.Screen name="JDGenerator" component={JDGeneratorPage} />
        <InnerStack.Screen
          name="JDGeneratorResult"
          component={JDGeneratorResultPage}
        />
        <InnerStack.Screen
          name="ApplicationQuestions"
          component={ApplicationQuestionsPage}
          options={{
            headerShown: true,
            headerTitle: t('profile.screening_questions'),
            headerTitleStyle: { fontWeight: '600' },
            headerStyle: { backgroundColor: c.primary },
            headerTintColor: c.white,
          }}
        />
        <InnerStack.Screen
          name="JDPublishSuccess"
          component={JDPublishSuccessPage}
          options={{
            headerShown: true,
            headerTitle: t('publish_success'),
            headerTitleStyle: { fontWeight: '600' },
            headerStyle: { backgroundColor: c.primary },
            headerTintColor: c.white,
          }}
        />
        <InnerStack.Screen name="JobPostings" component={JobPostings} />
        <InnerStack.Screen name="Shortlists" component={ShortlistsPage} />
        <InnerStack.Screen name="Pipeline" component={PipelineCandidatesPage} />
        <InnerStack.Screen name="PipelinesPage" component={PipelinesPage} />
        <InnerStack.Screen
          name="PipelineBuilder"
          component={PipelineBuilderPage}
        />
        <InnerStack.Screen
          name="CandidateProfile"
          component={CandidateProfileScreen}
        />
        <InnerStack.Screen
          name="CandidateAssessments"
          component={CandidateAssessmentsScreen}
        />
        <InnerStack.Screen name="ContactUs" component={ContactUsScreen} />
      </InnerStack.Navigator>
    </CompanyProvider>
  );
}

// ============================================================================
// Root Navigator — Session Gating & Top-Level Navigation
// Reads session + loading state from UserContext. While auth state is being
// resolved it shows a full-screen loader. If no session exists it renders
// the Auth (unauthenticated) stack. Once authenticated it renders the
// role-based Main screens plus JobDetails and Interview as modal/push
// screens with a default header (no side menu). The AnimatedSidebar overlay
// is rendered outside the navigator so it floats above all screens.
// ============================================================================

function RootNavigator({ onboardingSeen }) {
  const { session, loading, needsRoleSelection } = useUser();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const navigation = useNavigation();

  useEffect(() => {
    const handleDeepLink = async (url) => {
      if (!url) return;

      if (url.includes("premium/success")) {
        console.log("Payment success, redirecting to CompanyProfile");
        if (navigation) {
          navigation.navigate('Main', { screen: 'CompanyProfile' });
        }
      }

      if (url.includes("premium/cancel")) {
        console.log("Payment cancelled");
      }
    };

    Linking.getInitialURL().then(handleDeepLink);

    const subscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription.remove();
  }, [navigation]);
  if (loading || onboardingSeen === null) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: c.background }]}
      >
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }
  

  if (!session) {
    return (
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {/* {!onboardingSeen && (
          <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
        )} */}
        <RootStack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{ animation: "fade_from_bottom" }}
        />
      </RootStack.Navigator>
    );
  }

  if (needsRoleSelection) {
    return (
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="RoleSelect" component={GoogleRoleSelectPage} initialParams={{ user: session?.user }} />
      </RootStack.Navigator>
    );
  }

  const navHeaderStyle = { backgroundColor: c.sidebar };

  return (
    <View style={{ flex: 1 }}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Main" component={MainScreens} />
        <RootStack.Screen name="GoogleRoleSelect" component={GoogleRoleSelectPage} />
        <RootStack.Screen
          name="JobDetails"
          component={JobDetailsPage}
          options={{
            headerShown: true,

            headerTitle: t('nav.job_details'),
            headerTitleStyle: { fontWeight: '600' },
            headerStyle: navHeaderStyle,
            headerTintColor: c["sidebar-foreground"],
          }}
        />
        <RootStack.Screen
          name="Apply"
          component={ApplyJobPage}
          options={{
            headerShown: true,

            headerTitle: t('nav.apply_job'),
            headerTitleStyle: { fontWeight: '600' },
            headerStyle: navHeaderStyle,
            headerTintColor: c["sidebar-foreground"],
          }}
        />
        <RootStack.Screen
          name="Interview"
          component={InterviewPage}
          options={{
            headerShown: true,

            headerTitle: t('nav.interview'),
            headerTitleStyle: { fontWeight: '600' },
            headerStyle: navHeaderStyle,
            headerTintColor: c["sidebar-foreground"],
          }}
        />
      </RootStack.Navigator>
      <AnimatedSidebar />
    </View>
  );
}

export default function AppNavigator() {
  const [onboardingSeen, setOnboardingSeen] = useState(null);
  const navigationRef = useRef(null);

  useEffect(() => {
    AsyncStorage.removeItem("onboarding_seen");
    AsyncStorage.getItem("onboarding_seen").then((val) => {
      setOnboardingSeen(val === "true");
    });
  }, []);

  // Handle notification taps (works from background/killed state too)
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (!navigationRef.current) return;
      if (data?.type === 'stage_update') {
        navigationRef.current.navigate('Main', { screen: 'ApplicantHome' });
      } else if (data?.type === 'new_application') {
        navigationRef.current.navigate('Main', { screen: 'Pipeline' });
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <UserProvider>
      <SidebarProvider>
        <NavigationContainer ref={navigationRef}>
          <RootNavigator onboardingSeen={onboardingSeen} />
        </NavigationContainer>
      </SidebarProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
