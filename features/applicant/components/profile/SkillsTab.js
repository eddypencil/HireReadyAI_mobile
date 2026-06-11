// features/applicant/components/profile/SkillsTab.js
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../src/theme';

const LEVEL_COLORS = {
  beginner:     { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },
  intermediate: { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
  advanced:     { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  expert:       { bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd' },
};

const LANG_LEVEL_COLORS = {
  basic:          { bg: '#f1f5f9', text: '#475569' },
  conversational: { bg: '#dbeafe', text: '#1d4ed8' },
  fluent:         { bg: '#dcfce7', text: '#15803d' },
  native:         { bg: '#ede9fe', text: '#6d28d9' },
};

function SectionHeader({ title, icon, onAdd, viewOnly }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <Ionicons name={icon} size={16} color={colors.accent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {!viewOnly && (
        <TouchableOpacity onPress={onAdd} style={styles.addBtn} activeOpacity={0.75}>
          <Ionicons name="add" size={16} color={colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function EmptySection({ text, onAdd, viewOnly }) {
  return (
    <TouchableOpacity style={styles.emptyRow} onPress={!viewOnly ? onAdd : null} disabled={viewOnly}>
      <Ionicons name="add-circle-outline" size={18} color={colors.border} />
      <Text style={styles.emptyText}>{viewOnly ? 'Nothing added yet' : text}</Text>
    </TouchableOpacity>
  );
}

export default function SkillsTab({ profile, viewOnly, onEdit, onDelete }) {
  const skills       = profile?.skills       || [];
  const languages    = profile?.languages    || [];
  const certificates = profile?.certificates || [];
  const awards       = profile?.awards       || [];

  return (
    <View style={styles.container}>

      {/* ── Skills */}
      <View style={styles.section}>
        <SectionHeader title="Skills" icon="code-slash-outline" onAdd={() => onEdit('skills', null, null)} viewOnly={viewOnly} />
        {skills.length === 0
          ? <EmptySection text="Add your skills" onAdd={() => onEdit('skills', null, null)} viewOnly={viewOnly} />
          : (
            <View style={styles.pillsContainer}>
              {skills.map((item, index) => {
                const lc = LEVEL_COLORS[item.level] || LEVEL_COLORS.intermediate;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.skillPill, { backgroundColor: lc.bg, borderColor: lc.border }]}
                    onPress={!viewOnly ? () => onEdit('skills', item, index) : null}
                    disabled={viewOnly}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.skillPillText, { color: lc.text }]}>{item.name}</Text>
                    {item.level && (
                      <Text style={[styles.skillLevel, { color: lc.text }]}>
                        · {item.level.charAt(0).toUpperCase() + item.level.slice(1)}
                      </Text>
                    )}
                    {!viewOnly && (
                      <TouchableOpacity
                        onPress={() => onDelete('skills', index)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Ionicons name="close" size={12} color={lc.text} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
      </View>

      {/* ── Languages */}
      <View style={styles.section}>
        <SectionHeader title="Languages" icon="language-outline" onAdd={() => onEdit('languages', null, null)} viewOnly={viewOnly} />
        {languages.length === 0
          ? <EmptySection text="Add languages you speak" onAdd={() => onEdit('languages', null, null)} viewOnly={viewOnly} />
          : languages.map((item, index) => {
            const ls = LANG_LEVEL_COLORS[item.level?.toLowerCase()] || LANG_LEVEL_COLORS.conversational;
            return (
              <View key={index} style={styles.langRow}>
                <View style={styles.langLeft}>
                  <Ionicons name="chatbubble-outline" size={16} color={colors.accent} />
                  <Text style={styles.langName}>{item.name}</Text>
                </View>
                <View style={styles.langRight}>
                  {item.level && (
                    <View style={[styles.levelBadge, { backgroundColor: ls.bg }]}>
                      <Text style={[styles.levelBadgeText, { color: ls.text }]}>
                        {item.level.charAt(0).toUpperCase() + item.level.slice(1)}
                      </Text>
                    </View>
                  )}
                  {!viewOnly && (
                    <View style={styles.rowActions}>
                      <TouchableOpacity onPress={() => onEdit('languages', item, index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="pencil-outline" size={14} color={colors.mutedForeground} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => onDelete('languages', index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="trash-outline" size={14} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
      </View>

      {/* ── Certificates */}
      <View style={styles.section}>
        <SectionHeader title="Certificates" icon="ribbon-outline" onAdd={() => onEdit('certificates', null, null)} viewOnly={viewOnly} />
        {certificates.length === 0
          ? <EmptySection text="Add your certifications" onAdd={() => onEdit('certificates', null, null)} viewOnly={viewOnly} />
          : certificates.map((item, index) => (
            <View key={index} style={styles.certCard}>
              {/* Info row */}
              <View style={styles.certRow}>
                <View style={[styles.certIcon, { backgroundColor: '#fef9c3' }]}>
                  <Ionicons name="ribbon-outline" size={16} color="#d97706" />
                </View>
                <View style={styles.certInfo}>
                  <Text style={styles.certName}>{item.name}</Text>
                  <Text style={styles.certMeta}>
                    {[item.organization, item.date].filter(Boolean).join(' · ')}
                  </Text>
                  {item.field && <Text style={styles.certField}>{item.field}</Text>}
                </View>
                {!viewOnly && (
                  <View style={styles.rowActions}>
                    <TouchableOpacity onPress={() => onEdit('certificates', item, index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="pencil-outline" size={14} color={colors.mutedForeground} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete('certificates', index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="trash-outline" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* ── Certificate image shown below info row, like project screenshots */}
              {item.image && (
                <View style={styles.certImageContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.certImageGallery}>
                    <View style={styles.certMediaTile}>
                      <Image source={{ uri: item.image }} style={styles.certMediaImg} resizeMode="cover" />
                    </View>
                  </ScrollView>
                </View>
              )}
            </View>
          ))}
      </View>

      {/* ── Awards */}
      <View style={styles.section}>
        <SectionHeader title="Awards & Honors" icon="trophy-outline" onAdd={() => onEdit('awards', null, null)} viewOnly={viewOnly} />
        {awards.length === 0
          ? <EmptySection text="Add awards or honors" onAdd={() => onEdit('awards', null, null)} viewOnly={viewOnly} />
          : awards.map((item, index) => (
            <View key={index} style={styles.certRow}>
              <View style={[styles.certIcon, { backgroundColor: '#fce7f3' }]}>
                <Ionicons name="trophy-outline" size={16} color="#db2777" />
              </View>
              <View style={styles.certInfo}>
                <Text style={styles.certName}>{item.title}</Text>
                <Text style={styles.certMeta}>
                  {[item.issuer, item.year].filter(Boolean).join(' · ')}
                </Text>
                {item.description && <Text style={styles.certDesc}>{item.description}</Text>}
              </View>
              {!viewOnly && (
                <View style={styles.rowActions}>
                  <TouchableOpacity onPress={() => onEdit('awards', item, index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="pencil-outline" size={14} color={colors.mutedForeground} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onDelete('awards', index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="trash-outline" size={14} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  section: {
    backgroundColor: colors.white, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground },
  addBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 },
  emptyText: { fontSize: 13, color: colors.mutedForeground, fontStyle: 'italic' },
  pillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16 },
  skillPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  skillPillText: { fontSize: 13, fontWeight: '600' },
  skillLevel: { fontSize: 11, fontWeight: '500' },
  langRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderTopWidth: 1, borderTopColor: colors.border,
  },
  langLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  langName: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  langRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  levelBadgeText: { fontSize: 11, fontWeight: '600' },

  // Certificate card — wraps info row + image
  certCard: {
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  certRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 14,
  },
  certIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  certInfo: { flex: 1, gap: 3 },
  certName: { fontSize: 14, fontWeight: '700', color: colors.foreground },
  certMeta: { fontSize: 12, color: colors.mutedForeground },
  certField: { fontSize: 12, color: colors.accent },
  certDesc: { fontSize: 13, color: colors.foreground, lineHeight: 18, marginTop: 2 },
  rowActions: {
    flexDirection: 'column', gap: 8, flexShrink: 0,
    alignItems: 'center', justifyContent: 'center',
  },

  // Certificate image gallery — same style as project screenshots
  certImageContainer: {
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  certImageGallery: {
    padding: 12, gap: 8,
  },
  certMediaTile: {
    width: 120, height: 90, borderRadius: 10, overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  certMediaImg: {
    width: '100%', height: '100%',
  },
});