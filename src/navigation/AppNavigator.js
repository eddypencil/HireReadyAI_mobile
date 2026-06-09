// ============================================================================
// Imports — React Native, Navigation, UI primitives, context providers,
// and all screen components used across the app.
// ============================================================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserProvider, useUser } from '../../features/auth/context/user.context';
import { SidebarProvider, useSidebar } from '../../shared/context/SidebarContext';
import AnimatedSidebar from '../../shared/ui/AnimatedSidebar';
import { USER_ROLE } from '../../shared/constants/enums';
import { colors } from '../theme';

import LoginPage from '../../features/auth/pages/LoginPage';
import RegisterPage from '../../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../../features/auth/pages/ResetPasswordPage';
import JobsPage from '../../features/jobs/pages/JobsPage';
import JobDetailsPage from '../../features/jobs/pages/JobDetailsPage';
import ShortlistsPage from '../../features/shortlist/pages/ShortlistsPage';
import { CompanyProvider } from '../../features/companies/pages/CompanyLayout';
import CompanyProfile from '../../features/companies/pages/CompanyProfile';
import JDGeneratorPage from '../../features/companies/pages/JDGeneratorPage';
import JDGeneratorResultPage from '../../features/companies/pages/JDGeneratorResultPage';
import JobPostings from '../../features/companies/pages/JobPostings';
import ApplicantPage from '../../features/applicant/pages/ApplicantPage';
import RecruiterScreen from '../../features/recruiter/pages/RecruiterScreen';
import PipelineCandidatesPage from '../../features/recruiter/pages/PipelineCandidatesPage';
import CandidateProfileScreen from '../../features/recruiter/pages/CandidateProfileScreen';
import CandidateAssessmentsScreen from '../../features/recruiter/pages/CandidateAssessmentsScreen';
import PipelinesPage from '../../features/pipeline/pages/PipelinesPage';
import PipelineBuilderPage from '../../features/pipeline/pages/PipelineBuilderPage';
import InterviewPage from '../../features/interview/pages/InterviewPage';
import ApplyJobPage from '../../features/applications/pages/ApplyJobPage';

// ============================================================================
// Stack Navigator Instances
// AuthStack handles unauthenticated flows; RootStack wraps the entire app
// and is used for session-gated navigation.
// ============================================================================
const AuthStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

// ============================================================================
// Authentication Navigator
// Handles all unauthenticated user flows including login, registration,
// password recovery, and password reset screens. All headers are hidden
// since each auth page manages its own header/logo layout.
// ============================================================================
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

// ============================================================================
// Custom Header Component
// Renders a primary-colored header bar with a hamburger menu toggle, the
// current screen title, and safe-area-aware top padding. The menu button
// triggers the AnimatedSidebar via the SidebarContext toggle function.
// Used as the header for every role-based main screen.
// ============================================================================
function Header({ title }) {
  const insets = useSafeAreaInsets();
  const { toggle } = useSidebar();
  return (
    <View style={[headerStyles.container, { paddingTop: insets.top + 8 }]}>
      <TouchableOpacity onPress={toggle} style={headerStyles.menuBtn}>
        <Ionicons name="menu" size={22} color={colors.white} />
      </TouchableOpacity>
      <Text style={headerStyles.title}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
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
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.white,
  },
});

// ============================================================================
// Screen Title Utility
// Maps internal route names to human-readable header titles. Falls back to
// the raw route name if no mapping exists (for screens like JobDetails or
// Interview that have their own header configuration).
// ============================================================================
function getScreenTitle(routeName) {
  const titles = {
    JobsTab: 'Explore Jobs',
    ApplicantHome: 'My Applications',
    RecruiterHome: 'Dashboard',
    CompanyProfile: 'Company Profile',
    JDGenerator: 'JD Generator',
    JDGeneratorResult: 'Generated JD',
    JobPostings: 'Job Postings',
    Shortlists: 'Shortlists',
    Pipeline: 'Pipeline',
    PipelinesPage: 'Pipelines',
    PipelineBuilder: 'Pipeline Builder',
    CandidateProfile: 'Candidate Profile',
    CandidateAssessments: 'Assessments & Interviews',
  };
  return titles[routeName] || routeName;
}

// ============================================================================
// Main Screens — Role-Based Navigation
// Reads the current user's role from UserContext and conditionally renders
// either the applicant or recruiter screen stack. Each stack uses the custom
// Header component with the side menu toggle. Recruiters additionally get a
// CompanyProvider wrapper so all recruiter child screens can access and
// mutate company data.
//
// Applicant stack:  JobsTab -> ApplicantHome
// Recruiter stack:  RecruiterHome -> CompanyProfile -> JDGenerator ->
//                   JobPostings -> Shortlists -> Pipeline
// ============================================================================
function MainScreens() {
  const { profile } = useUser();
  const isApplicant = profile?.role === USER_ROLE.applicant;

  if (isApplicant) {
    return (
      <RootStack.Navigator
        screenOptions={({ route }) => ({
          header: () => <Header title={getScreenTitle(route.name)} />,
        })}
      >
        <RootStack.Screen name="JobsTab" component={JobsPage} />
        <RootStack.Screen name="ApplicantHome" component={ApplicantPage} />
      </RootStack.Navigator>
    );
  }

  return (
    <CompanyProvider>
      <RootStack.Navigator
        screenOptions={({ route }) => ({
          header: () => <Header title={getScreenTitle(route.name)} />,
        })}
      >
        <RootStack.Screen name="RecruiterHome" component={RecruiterScreen} />
        <RootStack.Screen name="CompanyProfile" component={CompanyProfile} />
        <RootStack.Screen name="JDGenerator" component={JDGeneratorPage} />
        <RootStack.Screen name="JDGeneratorResult" component={JDGeneratorResultPage} />
        <RootStack.Screen name="JobPostings" component={JobPostings} />
        <RootStack.Screen name="Shortlists" component={ShortlistsPage} />
        <RootStack.Screen name="Pipeline" component={PipelineCandidatesPage} />
        <RootStack.Screen name="PipelinesPage" component={PipelinesPage} />
        <RootStack.Screen name="PipelineBuilder" component={PipelineBuilderPage} />
        <RootStack.Screen name="CandidateProfile" component={CandidateProfileScreen} />
        <RootStack.Screen name="CandidateAssessments" component={CandidateAssessmentsScreen} />
      </RootStack.Navigator>
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
function RootNavigator() {
  const { session, loading } = useUser();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      </RootStack.Navigator>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Main" component={MainScreens} />
        <RootStack.Screen
          name="JobDetails"
          component={JobDetailsPage}
          options={{
            headerShown: true,
            headerTitle: 'Job Details',
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            // headerStatusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
          }}
        />
        <RootStack.Screen
          name="Apply"
          component={ApplyJobPage}
          options={{
            headerShown: true,
            headerTitle: 'Apply for Job',
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
          }}
        />
        <RootStack.Screen
          name="Interview"
          component={InterviewPage}
          options={{
            headerShown: true,
            headerTitle: 'Interview',
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
          }}
        />
      </RootStack.Navigator>
      <AnimatedSidebar />
    </View>
  );
}

// ============================================================================
// App Entry Point — Provider Hierarchy & Navigation Container
// Wraps the entire navigation tree inside UserProvider (auth state) and
// SidebarProvider (sidebar open/close state). NavigationContainer from
// React Navigation manages the navigation state and linking.
//
// Provider nesting order (outer -> inner):
//   UserProvider > SidebarProvider > NavigationContainer
// ============================================================================
export default function AppNavigator() {
  return (
    <UserProvider>
      <SidebarProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SidebarProvider>
    </UserProvider>
  );
}

// ============================================================================
// Shared Styles
// ============================================================================
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});