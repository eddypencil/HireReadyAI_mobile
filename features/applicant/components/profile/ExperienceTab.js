// features/applicant/components/profile/ExperienceTab.js
// ── Field names come from model .toJson() output:
//   Experience:   title, company_name, industry, from, to, description
//   Education:    level, university, faculty, major, start_year, end_year, grade
//   Volunteering: organization, role, start, end, description
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../src/theme';

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
    <TouchableOpacity
      style={styles.emptyRow}
      onPress={!viewOnly ? onAdd : null}
      disabled={viewOnly}
      activeOpacity={0.75}
    >
      <Ionicons name="add-circle-outline" size={20} color={colors.border} />
      <Text style={styles.emptyText}>{viewOnly ? 'Nothing added yet' : text}</Text>
    </TouchableOpacity>
  );
}

function ItemCard({ iconName, iconBg, iconColor, title, subtitle, date, extra, description, onEdit, onDelete, viewOnly }) {
  return (
    <View style={styles.itemCard}>
      <View style={[styles.itemIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{title}</Text>
        {subtitle ? <Text style={styles.itemSubtitle}>{subtitle}</Text> : null}
        {extra ? <Text style={styles.itemExtra}>{extra}</Text> : null}
        {date ? <Text style={styles.itemDate}>{date}</Text> : null}
        {description ? <Text style={styles.itemDesc}>{description}</Text> : null}
      </View>
      {!viewOnly && (
        <View style={styles.itemActions}>
          <TouchableOpacity onPress={onEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="pencil-outline" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={14} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function ExperienceTab({ profile, viewOnly, onEdit, onDelete }) {
  // Data comes from Supabase as JSON (snake_case from toJson())
  const experience  = profile?.experience  || [];
  const education   = profile?.education   || [];
  const volunteering = profile?.volunteering || [];

  return (
    <View style={styles.container}>

      {/* ── Work Experience */}
      <View style={styles.section}>
        <SectionHeader
          title="Work Experience"
          icon="briefcase-outline"
          onAdd={() => onEdit('experience', null, null)}
          viewOnly={viewOnly}
        />
        {experience.length === 0
          ? <EmptySection text="Add your work experience" onAdd={() => onEdit('experience', null, null)} viewOnly={viewOnly} />
          : experience.map((item, index) => (
            <ItemCard
              key={index}
              iconName="briefcase-outline"
              iconBg={`${colors.accent}18`}
              iconColor={colors.accent}
              title={item.title}
              subtitle={[item.company_name, item.industry].filter(Boolean).join(' · ')}
              date={[item.from, item.to || 'Present'].filter(Boolean).join(' — ')}
              description={item.description}
              onEdit={() => onEdit('experience', item, index)}
              onDelete={() => onDelete('experience', index)}
              viewOnly={viewOnly}
            />
          ))}
      </View>

      {/* ── Education */}
      <View style={styles.section}>
        <SectionHeader
          title="Education"
          icon="school-outline"
          onAdd={() => onEdit('education', null, null)}
          viewOnly={viewOnly}
        />
        {education.length === 0
          ? <EmptySection text="Add your education" onAdd={() => onEdit('education', null, null)} viewOnly={viewOnly} />
          : education.map((item, index) => (
            <ItemCard
              key={index}
              iconName="school-outline"
              iconBg="#ede9fe"
              iconColor="#7c3aed"
              title={[item.level, item.major].filter(Boolean).join(' in ') || item.university}
              subtitle={item.university}
              extra={[item.faculty, item.grade ? `Grade: ${item.grade}` : null].filter(Boolean).join(' · ')}
              date={[item.start_year, item.end_year || 'Present'].filter(Boolean).join(' — ')}
              description={null}
              onEdit={() => onEdit('education', item, index)}
              onDelete={() => onDelete('education', index)}
              viewOnly={viewOnly}
            />
          ))}
      </View>

      {/* ── Volunteering */}
      <View style={styles.section}>
        <SectionHeader
          title="Volunteering"
          icon="heart-outline"
          onAdd={() => onEdit('volunteering', null, null)}
          viewOnly={viewOnly}
        />
        {volunteering.length === 0
          ? <EmptySection text="Add volunteering experience" onAdd={() => onEdit('volunteering', null, null)} viewOnly={viewOnly} />
          : volunteering.map((item, index) => (
            <ItemCard
              key={index}
              iconName="heart-outline"
              iconBg="#dcfce7"
              iconColor="#16a34a"
              title={item.role}
              subtitle={item.organization}
              date={[item.start, item.end || 'Present'].filter(Boolean).join(' — ')}
              description={item.description}
              onEdit={() => onEdit('volunteering', item, index)}
              onDelete={() => onDelete('volunteering', index)}
              viewOnly={viewOnly}
            />
          ))}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  section: {
    backgroundColor: colors.white, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 18, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground },
  addBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 18 },
  emptyText: { fontSize: 13, color: colors.mutedForeground, fontStyle: 'italic' },
  itemCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 16, borderTopWidth: 1, borderTopColor: colors.border,
  },
  itemIcon: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  itemContent: { flex: 1, gap: 3 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: colors.foreground },
  itemSubtitle: { fontSize: 13, color: colors.mutedForeground, fontWeight: '500' },
  itemExtra: { fontSize: 12, color: colors.mutedForeground },
  itemDate: { fontSize: 12, color: colors.mutedForeground },
  itemDesc: { fontSize: 13, color: colors.foreground, lineHeight: 19, marginTop: 4 },
  itemActions: { gap: 8, flexShrink: 0 },
});