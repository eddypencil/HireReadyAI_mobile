import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSidebar } from '../context/SidebarContext';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../../features/auth/context/user.context';
import { USER_ROLE } from '../constants/enums';
import { spacing, borderRadius, fontSize, fontWeight } from '../../src/theme';
import LanguageSwitcher from '../i18n/LanguageSwitcher';

const SIDEBAR_WIDTH = 280;

export default function AnimatedSidebar() {
  const { isOpen, close } = useSidebar();
  const { theme, toggleTheme, isDark } = useTheme();
  const c = theme.colors;
  const navigation = useNavigation();
  const { profile, signOutUser } = useUser();
  const isApplicant = profile?.role === USER_ROLE.applicant;

  const applicantLinks = [
    { name: 'Jobs', label: 'Explore Jobs', icon: 'briefcase', screen: 'JobsTab' },
    { name: 'MyApplications', label: 'My Applications', icon: 'document-text', screen: 'ApplicantHome' },
  ];

  const recruiterLinks = [
    { name: 'Dashboard', label: 'Dashboard', icon: 'grid', screen: 'RecruiterHome' },
    { name: 'CompanyProfile', label: 'Company Profile', icon: 'business', screen: 'CompanyProfile' },
    { name: 'JobPostings', label: 'Job Postings', icon: 'briefcase', screen: 'JobPostings' },
    { name: 'Shortlists', label: 'Shortlists', icon: 'heart', screen: 'Shortlists' },
    { name: 'JDGenerator', label: 'JD Generator', icon: 'sparkles', screen: 'JDGenerator' },
    { name: 'Pipeline', label: 'Pipeline', icon: 'git-branch', screen: 'Pipeline' },
  ];

  const links = isApplicant ? applicantLinks : recruiterLinks;

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

  const handleNavigate = (screenName) => {
    close();
    if (navigation) {
      navigation.navigate(screenName);
    }
  };

  const handleSignOut = () => {
    close();
    signOutUser();
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isOpen ? 'auto' : 'none'}>
      <Animated.View
        style={[styles.backdrop, { opacity: fadeAnim }]}
        pointerEvents={isOpen ? 'auto' : 'none'}
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
          { backgroundColor: c.sidebar, transform: [{ translateX: slideAnim }] },
        ]}
      >
        <SafeAreaView style={styles.sidebarSafe}>
          <View style={styles.drawerHeader}>
            <View style={[styles.logoMark, { backgroundColor: c.accent }]}>
              <Text style={[styles.logoText, { color: c['destructive-foreground'] }]}>H</Text>
            </View>
            <Text style={[styles.wordmark, { color: c['destructive-foreground'] }]}>HireReadyAI</Text>
          </View>

          <View style={[styles.userChip, { borderTopColor: `${c['destructive-foreground']}14`, borderBottomColor: `${c['destructive-foreground']}14` }]}>
            <View style={[styles.avatar, { backgroundColor: `${c.accent}33` }]}>
              <Text style={[styles.avatarText, { color: c.accent }]}>
                {(profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)) || '?'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.userName, { color: c['destructive-foreground'] }]}>{profile?.full_name || 'User'}</Text>
              <Text style={[styles.userRole, { color: `${c['destructive-foreground']}80` }]}>{profile?.role || ''}</Text>
            </View>
            <LanguageSwitcher />
          </View>

          <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
            {links.map((link) => (
              <TouchableOpacity
                key={link.name}
                onPress={() => handleNavigate(link.screen)}
                style={styles.navItem}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={link.icon}
                  size={18}
                  color={`${c['destructive-foreground']}b3`}
                  style={styles.navIcon}
                />
                <Text style={[styles.navLabel, { color: `${c['destructive-foreground']}cc` }]}>
                  {link.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.themeButton, { borderTopColor: `${c['destructive-foreground']}14` }]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={18}
              color={c['muted-foreground']}
            />
            <Text style={[styles.themeText, { color: c['muted-foreground'] }]}>
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSignOut} style={[styles.logoutButton, { borderTopColor: `${c['destructive-foreground']}14` }]} activeOpacity={0.7}>
            <Ionicons name="log-out" size={18} color={c.destructive} />
            <Text style={[styles.logoutText, { color: c.destructive }]}>Logout</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 40,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 50,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sidebarSafe: {
    flex: 1,
    padding: spacing[4],
    justifyContent: 'space-between',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2.5],
    paddingHorizontal: spacing[1],
    paddingVertical: spacing[2],
    marginBottom: spacing[5],
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  wordmark: {
    fontSize: 17,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.3,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
  },
  userName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  userRole: {
    fontSize: fontSize.xs,
    textTransform: 'capitalize',
  },
  navScroll: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2.5],
    borderRadius: borderRadius.lg,
    marginBottom: 2,
  },
  navIcon: {
    width: 20,
    textAlign: 'center',
  },
  navLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderTopWidth: 1,
  },
  themeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderTopWidth: 1,
    marginTop: spacing[2],
  },
  logoutText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
});
