// features/applicant/pages/ApplicantProfilePage.js
import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../shared/context/ThemeContext';
import { fetchApplicantProfile } from '../services/profile.service';
import { deleteExperience } from '../services/experience.service';
import { deleteEducation } from '../services/education.service';
import { deleteVolunteering } from '../services/volunteering.service';
import { deleteSkill } from '../services/skills.service';
import { deleteLanguage } from '../services/languages.service';
import { deleteCertificate } from '../services/certificates.service';
import { deleteProject } from '../services/projects.service';
import { supabase } from '../../../shared/services/supabase';
import { calcCompleteness } from '../components/profile/CompletenessBar';
import AvatarModal from '../components/AvatarModal';
import ProfileHero from '../components/profile/ProfileHero';
import CompletenessBar from '../components/profile/CompletenessBar';
import AboutTab from '../components/profile/AboutTab';
import ExperienceTab from '../components/profile/ExperienceTab';
import SkillsTab from '../components/profile/SkillsTab';
import ProjectsTab from '../components/profile/ProjectsTab';

const TABS = [
  { key: 'about',      label: 'About',      icon: 'person-outline' },
  { key: 'experience', label: 'Experience', icon: 'briefcase-outline' },
  { key: 'skills',     label: 'Skills',     icon: 'code-slash-outline' },
  { key: 'projects',   label: 'Projects',   icon: 'rocket-outline' },
];

const DELETE_SERVICES = {
  experience:   deleteExperience,
  education:    deleteEducation,
  volunteering: deleteVolunteering,
  skills:       deleteSkill,
  languages:    deleteLanguage,
  certificates: deleteCertificate,
  projects:     deleteProject,
};

// Awards don't have a service — delete manually
async function deleteAward(userId, index) {
  const { data } = await supabase.from('profiles').select('awards').eq('id', userId).maybeSingle();
  const awards = data?.awards || [];
  awards.splice(index, 1);
  await supabase.from('profiles').update({ awards }).eq('id', userId);
}

function TabBar({ active, onSelect, styles }) {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <ScrollView
      horizontal showsHorizontalScrollIndicator={false}
      style={styles.tabBarScroll} contentContainerStyle={styles.tabBarContent}
    >
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, active === tab.key && styles.tabActive]}
          onPress={() => onSelect(tab.key)}
          activeOpacity={0.75}
        >
          <Ionicons name={tab.icon} size={14} color={active === tab.key ? c.primary : c['muted-foreground']} />
          <Text style={[styles.tabLabel, active === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export default function ApplicantProfilePage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { profileId, viewOnly = false } = route.params || {};
  const { theme } = useTheme();
  const c = theme.colors;
  const styles = createStyles(c);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [avatarOpen, setAvatarOpen] = useState(false);

  // ── Reload profile every time this screen comes into focus
  // This handles the return from all edit screens automatically
  // without needing to pass onSave as a param
  const loadProfile = useCallback(async () => {
    if (!profileId) return;
    try {
      const data = await fetchApplicantProfile(profileId);
      setProfile(data);
    } catch {
      Alert.alert('Error', 'Could not load profile.');
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useFocusEffect(useCallback(() => { loadProfile(); }, [loadProfile]));

  // ── Delete by index
  const handleDelete = (field, index) => {
    Alert.alert('Delete', 'Are you sure you want to remove this?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            if (field === 'awards') {
              await deleteAward(profileId, index);
            } else {
              const service = DELETE_SERVICES[field];
              if (service) await service(profileId, index);
            }
            await loadProfile();
          } catch {
            Alert.alert('Error', 'Could not delete item.');
          }
        },
      },
    ]);
  };

  // ── Navigate to edit screen WITHOUT onSave
  // useFocusEffect above reloads automatically on return
  const handleEdit = (section, item, itemIndex) => {
    const screenMap = {
      // About tab — 3 separate focused screens
      bio:          'EditBio',
      contact:      'EditContact',
      links:        'EditLinks',
      // Experience tab
      experience:   'EditExperience',
      education:    'EditEducation',
      volunteering: 'EditVolunteering',
      // Skills tab
      skills:       'EditSkills',
      languages:    'EditLanguages',
      certificates: 'EditCertificates',
      awards:       'EditAwards',
    };
    const screen = screenMap[section];
    if (screen) {
      // Don't pass onSave — useFocusEffect handles reload
      navigation.navigate(screen, { profileId, item, itemIndex });
    }
  };

  const handleEditProject = (item, itemIndex) => {
    navigation.navigate('EditProject', { profileId, item, itemIndex });
  };

  const handleAddMedia = (project, itemIndex) => {
    navigation.navigate('EditProject', { profileId, item: project, itemIndex, focusMedia: true });
  };

  const { score, missing } = profile ? calcCompleteness(profile) : { score: 0, missing: [] };

  const handleMissingFieldPress = (field) => {
    const actions = {
      'Profile photo':  () => setAvatarOpen(true),
      'Headline':       () => handleEdit('bio', null, null),
      'Bio / Summary':  () => handleEdit('bio', null, null),
      'Location':       () => handleEdit('contact', null, null),
      'Phone number':   () => handleEdit('contact', null, null),
      'LinkedIn URL':   () => handleEdit('links', null, null),
      'Work experience':() => { setActiveTab('experience'); handleEdit('experience', null, null); },
      'Education':      () => { setActiveTab('experience'); handleEdit('education', null, null); },
      'Skills':         () => { setActiveTab('skills'); handleEdit('skills', null, null); },
      'Projects':       () => { setActiveTab('projects'); handleEditProject(null, null); },
    };
    actions[field]?.();
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={c.primary} /></View>;
  if (!profile) return <View style={styles.centered}><Text style={styles.errorText}>Profile not found.</Text></View>;

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ProfileHero
          profile={profile}
          viewOnly={viewOnly}
          onEditAvatar={() => setAvatarOpen(true)}
          onViewApplications={!viewOnly ? () => navigation.navigate('ApplicantHome') : null}
        />

        {!viewOnly && (
          <CompletenessBar score={score} missing={missing} onFieldPress={handleMissingFieldPress} />
        )}

        <TabBar active={activeTab} onSelect={setActiveTab} styles={styles} />

        {activeTab === 'about' && (
          <AboutTab profile={profile} viewOnly={viewOnly} onEdit={handleEdit} />
        )}
        {activeTab === 'experience' && (
          <ExperienceTab profile={profile} viewOnly={viewOnly} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        {activeTab === 'skills' && (
          <SkillsTab profile={profile} viewOnly={viewOnly} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        {activeTab === 'projects' && (
          <ProjectsTab
            profile={profile} viewOnly={viewOnly}
            onEdit={handleEditProject}
            onDelete={(index) => handleDelete('projects', index)}
            onAddMedia={handleAddMedia}
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {!viewOnly && (
        <AvatarModal
          open={avatarOpen}
          onClose={() => setAvatarOpen(false)}
          userId={profileId}
          currentUrl={profile?.profile_pic}
          onUpdated={(url) => { setProfile(prev => ({ ...prev, profile_pic: url })); setAvatarOpen(false); }}
          onDeleted={() => { setProfile(prev => ({ ...prev, profile_pic: null })); setAvatarOpen(false); }}
        />
      )}
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background },
    scroll: { flex: 1 },
    content: { padding: 16, gap: 14, paddingBottom: 40 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background },
    errorText: { fontSize: 14, color: c['muted-foreground'] },
    tabBarScroll: { backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.border },
    tabBarContent: { flexDirection: 'row', padding: 4, gap: 2 },
    tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
    tabActive: { backgroundColor: `${c.primary}12` },
    tabLabel: { fontSize: 13, fontWeight: '600', color: c['muted-foreground'] },
    tabLabelActive: { color: c.primary },
  });
}