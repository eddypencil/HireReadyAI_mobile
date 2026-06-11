import { useRef, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSidebar } from '../context/SidebarContext';
import { useUser } from '../../features/auth/context/user.context';
import { USER_ROLE } from '../constants/enums';
import { colors } from '../../src/theme';

const SIDEBAR_WIDTH = 280;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AnimatedSidebar() {
  const { isOpen, close } = useSidebar();
  const navigation = useNavigation();
  const { profile, signOutUser } = useUser();
  const isApplicant = profile?.role === USER_ROLE.applicant;

  const applicantLinks = [
    { name: 'Jobs', label: 'Explore Jobs', icon: 'briefcase', screen: 'JobsTab' },
    { name: 'MyApplications', label: 'My Applications', icon: 'document-text', screen: 'ApplicantHome' },
    { name: 'Feedback', label: 'My Feedback', icon: 'bar-chart', screen: 'ApplicantFeedback' },
    { name: 'Profile', label: 'My Profile', icon: 'person-circle-outline', screen: 'ApplicantProfile' },
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
    if (screenName === 'ApplicantProfile') {
      navigation.navigate('ApplicantProfile', { profileId: profile?.id, viewOnly: false });
    } else {
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
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <SafeAreaView style={styles.sidebarSafe}>
          <View style={styles.drawerHeader}>
            <View style={styles.logoMark}>
              <Text style={styles.logoText}>H</Text>
            </View>
            <Text style={styles.wordmark}>HireReadyAI</Text>
          </View>

          <View style={styles.userChip}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)) || '?'}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{profile?.full_name || 'User'}</Text>
              <Text style={styles.userRole}>{profile?.role || ''}</Text>
            </View>
          </View>

          <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
            {links.map((link) => {
              return (
                <TouchableOpacity
                  key={link.name}
                  onPress={() => handleNavigate(link.screen)}
                  style={styles.navItem}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={link.icon}
                    size={18}
                    color="rgba(255,255,255,0.7)"
                    style={styles.navIcon}
                  />
                  <Text style={styles.navLabel}>
                    {link.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton} activeOpacity={0.7}>
            <Ionicons name="log-out" size={18} color="#ef4444" />
            <Text style={styles.logoutText}>Logout</Text>
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
    backgroundColor: colors.sidebarBg,
    zIndex: 50,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sidebarSafe: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
    paddingVertical: 8,
    marginBottom: 20,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  wordmark: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(70, 143, 175, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  userName: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  userRole: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  navScroll: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 2,
  },
  navItemActive: {
    backgroundColor: 'rgba(70, 143, 175, 0.2)',
  },
  navIcon: {
    width: 20,
    textAlign: 'center',
  },
  navLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  navLabelActive: {
    color: colors.white,
    fontWeight: '600',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    marginTop: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
  },
});
