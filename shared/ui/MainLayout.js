import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../features/auth/context/user.context';
import { USER_ROLE } from '../constants/enums';
import { colors } from '../../src/theme';

const SIDEBAR_WIDTH = 256;

export default function MainLayout({ children }) {
  const { profile, signOutUser } = useUser();
  const navigation = useNavigation();
  const route = useRoute();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isApplicant = profile?.role === USER_ROLE.applicant;

  const links = isApplicant
    ? [
        { to: 'Jobs', label: 'Explore Jobs', icon: 'briefcase' },
        { to: 'MyApplications', label: 'My Applications', icon: 'document-text' },
      ]
    : [
        { to: 'Dashboard', label: 'Dashboard', icon: 'grid' },
        { to: 'CompanyProfile', label: 'Company Profile', icon: 'business' },
        { to: 'JobPostings', label: 'Job Postings', icon: 'briefcase' },
        { to: 'Shortlists', label: 'Shortlists', icon: 'checkmark-circle' },
        { to: 'JDGenerator', label: 'JD Generator', icon: 'sparkles' },
      ];

  const isActive = useCallback(
    (screenName) => route.name === screenName,
    [route.name],
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isSidebarOpen ? 0 : -SIDEBAR_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: isSidebarOpen ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isSidebarOpen, slideAnim, fadeAnim]);

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);

  const handleNavigate = useCallback(
    (screenName) => {
      closeSidebar();
      navigation.navigate(screenName);
    },
    [closeSidebar, navigation],
  );

  return (
    <View style={styles.root}>
      {isSidebarOpen && (
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeSidebar}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.sidebar,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <SafeAreaView style={styles.sidebarSafe}>
          <View style={styles.sidebarInner}>
            <View style={styles.sidebarTop}>
              <View style={styles.sidebarHeader}>
                <Text style={styles.logo}>HireReadyAI</Text>
                <TouchableOpacity onPress={closeSidebar} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color={colors.gray[400]} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
                {links.map((link) => {
                  const active = isActive(link.to);
                  return (
                    <TouchableOpacity
                      key={link.to}
                      onPress={() => handleNavigate(link.to)}
                      style={[styles.navItem, active && styles.navItemActive]}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={link.icon}
                        size={18}
                        color={active ? colors.white : colors.mauveMagic[300]}
                        style={styles.navIcon}
                      />
                      <Text
                        style={[
                          styles.navLabel,
                          active && styles.navLabelActive,
                        ]}
                      >
                        {link.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <TouchableOpacity
              onPress={signOutUser}
              style={styles.logoutButton}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out" size={18} color={colors.red[400]} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      <View style={styles.mainContent}>
        <SafeAreaView edges={['top']} style={styles.mainSafe}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
              <Ionicons name="menu" size={20} color={colors.gray[500]} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>
              {isApplicant ? 'Applicant Dashboard' : 'Recruiter Dashboard'}
            </Text>
          </View>

          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(249, 250, 251, 0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 40,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.darkAmethyst[950],
    zIndex: 50,
    elevation: 10,
  },
  sidebarSafe: {
    flex: 1,
  },
  sidebarInner: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  sidebarTop: {
    gap: 24,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.mauveMagic[300],
  },
  closeButton: {
    padding: 4,
    borderRadius: 8,
  },
  navScroll: {
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  navIcon: {
    width: 20,
    textAlign: 'center',
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[300],
  },
  navLabelActive: {
    color: colors.white,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.red[400],
  },
  mainContent: {
    flex: 1,
  },
  mainSafe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuButton: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.gray[50],
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkAmethyst[950],
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});
