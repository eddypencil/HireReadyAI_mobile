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
import CompanyLayout from '../../features/companies/pages/CompanyLayout';
import { CompanyProvider } from '../../features/companies/pages/CompanyLayout';
import CompanyProfile from '../../features/companies/pages/CompanyProfile';
import JDGeneratorPage from '../../features/companies/pages/JDGeneratorPage';
import JobPostings from '../../features/companies/pages/JobPostings';
import ApplicantPage from '../../features/applicant/pages/ApplicantPage';
import RecruiterScreen from '../../features/recruiter/pages/RecruiterScreen';
import PipelineCandidatesPage from '../../features/recruiter/pages/PipelineCandidatesPage';
import InterviewPage from '../../features/interview/pages/InterviewPage';
import ApplyJobPage from '../../features/applications/pages/ApplyJobPage';

const AuthStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

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

function getScreenTitle(routeName) {
  const titles = {
    JobsTab: 'Explore Jobs',
    ApplicantHome: 'My Applications',
    RecruiterHome: 'Dashboard',
    CompanyProfile: 'Company Profile',
    JDGenerator: 'JD Generator',
    JobPostings: 'Job Postings',
    Shortlists: 'Shortlists',
    Pipeline: 'Pipeline',
  };
  return titles[routeName] || routeName;
}

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
        <RootStack.Screen name="JobPostings" component={JobPostings} />
        <RootStack.Screen name="Shortlists" component={ShortlistsPage} />
        <RootStack.Screen name="Pipeline" component={PipelineCandidatesPage} />
      </RootStack.Navigator>
    </CompanyProvider>
  );
}

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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});