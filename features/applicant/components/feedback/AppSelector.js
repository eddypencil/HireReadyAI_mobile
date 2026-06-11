// features/applicant/components/feedback/AppSelector.js
import { ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../../src/theme';

export default function AppSelector({ applications, selectedId, onSelect }) {
  if (!applications || applications.length === 0) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {applications.map((app) => {
        const job = app.job_postings;
        const sel = app.id === selectedId;
        const isRejected = app.current_stage === 'rejected' || app.is_rejected === true;

        const inner = (
          <View style={styles.inner}>
            <Text style={[styles.title, sel && styles.titleSelected]} numberOfLines={1}>
              {job?.title || 'Unknown'}
            </Text>
            <View style={[
              styles.badge,
              isRejected ? (sel ? styles.badgeWhite : styles.badgeRed) : (sel ? styles.badgeWhite : styles.badgeGreen),
            ]}>
              <Text style={[
                styles.badgeText,
                isRejected ? (sel ? styles.textWhite : styles.textRed) : (sel ? styles.textWhite : styles.textGreen),
              ]}>
                {isRejected ? 'Rejected' : 'Hired'}
              </Text>
            </View>
          </View>
        );

        return sel ? (
          <TouchableOpacity key={app.id} onPress={() => onSelect(app.id)} style={[styles.tab, styles.tabSelected]} activeOpacity={0.85}>
            {inner}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            key={app.id}
            onPress={() => onSelect(app.id)}
            style={styles.tab}
            activeOpacity={0.8}
          >
            {inner}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingRight: 4 },
  tab: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1,
    borderColor: colors.line, backgroundColor: colors.white, maxWidth: 220,
  },
  tabSelected: {
    backgroundColor: colors.darkAmethyst[600],
    borderColor: colors.darkAmethyst[600],
    shadowColor: colors.darkAmethyst[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 13, fontWeight: '600', color: colors.ink, flexShrink: 1 },
  titleSelected: { color: colors.white },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, flexShrink: 0 },
  badgeWhite: { backgroundColor: 'rgba(255,255,255,0.22)' },
  badgeRed: { backgroundColor: colors.red[100] },
  badgeGreen: { backgroundColor: colors.emerald[100] },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  textWhite: { color: colors.white },
  textRed: { color: colors.red[600] },
  textGreen: { color: colors.emerald[600] },
});
