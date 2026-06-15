// features/applicant/components/feedback/AppSelector.js
import { ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../../shared/context/ThemeContext';


export default function AppSelector({ applications, selectedId, onSelect }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const styles = createStyles(c);
  if (!applications || applications.length === 0) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {applications.map((app) => {
        const job = app.job_postings;
        const sel = app.id === selectedId;
        const isRejected = app.current_stage === 'rejected' || app.is_rejected === true;
        const isOffer = app.current_stage === 'offer' || app.current_recruitment_stage?.stage_type === 'offer';

        const badgeLabel = isRejected ? 'Rejected' : isOffer ? 'Offer' : 'Hired';
        const badgeStyle = isRejected ? (sel ? styles.badgeWhite : styles.badgeRed) : isOffer ? (sel ? styles.badgeWhite : styles.badgeAmber) : (sel ? styles.badgeWhite : styles.badgeGreen);
        const textStyle = isRejected ? (sel ? styles.textWhite : styles.textRed) : isOffer ? (sel ? styles.textWhite : styles.textAmber) : (sel ? styles.textWhite : styles.textGreen);

        const inner = (
          <View style={styles.inner}>
            <Text style={[styles.title, sel && styles.titleSelected]} numberOfLines={1}>
              {job?.title || 'Unknown'}
            </Text>
            <View style={[styles.badge, badgeStyle]}>
              <Text style={[styles.badgeText, textStyle]}>
                {badgeLabel}
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
function createStyles(c) {
  return StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingRight: 4 },
  tab: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1,
    borderColor: c.border, backgroundColor: c.card, maxWidth: 220,
  },
  tabSelected: {
    backgroundColor: c.primary,
    borderColor: c.primary,
    shadowColor: c.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 13, color: c.foreground, flexShrink: 1, fontWeight: '600' },
  titleSelected: { color: c.white, fontWeight: '600' },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, flexShrink: 0 },
  badgeWhite: { backgroundColor: `${c.white}38` },
  badgeRed: { backgroundColor: c.red[100] },
  badgeGreen: { backgroundColor: c.emerald[100] },
  badgeAmber: { backgroundColor: c.amber[100] },
  badgeText: { fontSize: 10, letterSpacing: 0.3, fontWeight: '700' },
  textWhite: { color: c.white },
  textRed: { color: c.red[600] },
  textGreen: { color: c.emerald[600] },
  textAmber: { color: c.amber[600] },
});
}
