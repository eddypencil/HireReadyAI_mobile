// features/applicant/components/profile/ProjectsTab.js
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../shared/context/ThemeContext';

function ProjectMedia({ images, onAdd, viewOnly }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const styles = createStyles(c);
  if (!images?.length) {
    if (viewOnly) return null;
    return (
      <TouchableOpacity style={styles.addMediaBtn} onPress={onAdd} activeOpacity={0.75}>
        <Ionicons name="images-outline" size={18} color={c['muted-foreground']} />
        <Text style={styles.addMediaText}>Add screenshots</Text>
      </TouchableOpacity>
    );
  }
  return (
    <View style={styles.gallerySection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
        {images.map((url, i) => (
          <View key={i} style={styles.mediaTile}>
            <Image source={{ uri: url }} style={styles.mediaTileImg} resizeMode="cover" />
          </View>
        ))}
        {!viewOnly && (
          <TouchableOpacity style={[styles.mediaTile, styles.addTile]} onPress={onAdd} activeOpacity={0.75}>
            <Ionicons name="add" size={22} color={c['muted-foreground']} />
            <Text style={styles.addTileText}>Add</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

function ProjectCard({ item, index, onEdit, onDelete, viewOnly, onAddMedia }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const styles = createStyles(c);
  return (
    <View style={styles.projectCard}>
      <View style={styles.projectHeader}>
        <View style={styles.projectHeaderLeft}>
          <View style={styles.projectIcon}>
            <Ionicons name="rocket-outline" size={18} color={c.primary} />
          </View>
          <Text style={styles.projectName}>{item.name}</Text>
        </View>
        {!viewOnly && (
          <View style={styles.projectActions}>
            <TouchableOpacity onPress={onEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="pencil-outline" size={14} color={c['muted-foreground']} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={14} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {item.description ? <Text style={styles.projectDesc}>{item.description}</Text> : null}

      {item.technologies?.length > 0 && (
        <View style={styles.techRow}>
          {item.technologies.map((tech, i) => (
            <View key={i} style={styles.techPill}>
              <Text style={styles.techText}>{tech}</Text>
            </View>
          ))}
        </View>
      )}

      {/* url — from Project model, can be GitHub, live link, or video */}
      {item.url ? (
        <TouchableOpacity
          style={styles.projectLink}
          onPress={() => Linking.openURL(item.url).catch(() => {})}
          activeOpacity={0.75}
        >
          <Ionicons name="link-outline" size={13} color={c.accent} />
          <Text style={styles.projectLinkText} numberOfLines={1}>{item.url}</Text>
          <Ionicons name="open-outline" size={13} color={c.accent} />
        </TouchableOpacity>
      ) : null}

      <ProjectMedia
        images={item.images}
        onAdd={() => onAddMedia(item, index)}
        viewOnly={viewOnly}
      />
    </View>
  );
}

export default function ProjectsTab({ profile, viewOnly, onEdit, onDelete, onAddMedia }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const styles = createStyles(c);
  const projects = profile?.projects || [];

  return (
    <View style={styles.container}>
      {/* ── White card wrapping header + content, matching Work Experience style */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="rocket-outline" size={16} color={c.accent} />
            <Text style={styles.sectionTitle}>Projects</Text>
          </View>
          {!viewOnly && (
            <TouchableOpacity style={styles.addBtn} onPress={() => onEdit(null, null)} activeOpacity={0.75}>
              <Ionicons name="add" size={16} color={c.white} />
            </TouchableOpacity>
          )}
        </View>

        {projects.length === 0 ? (
          <TouchableOpacity
            style={styles.emptyRow}
            onPress={!viewOnly ? () => onEdit(null, null) : null}
            disabled={viewOnly}
            activeOpacity={0.75}
          >
            <View style={styles.emptyIllustration}>
              <Ionicons name="rocket-outline" size={36} color={c.border} />
            </View>
            <Text style={styles.emptyTitle}>
              {viewOnly ? 'No projects added yet' : 'Showcase your work'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {viewOnly
                ? "This applicant hasn't added any projects yet."
                : 'Add projects with screenshots and videos to impress recruiters'}
            </Text>
            {!viewOnly && (
              <View style={styles.emptyAddBtn}>
                <Ionicons name="add-circle-outline" size={16} color={c.white} />
                <Text style={styles.emptyAddBtnText}>Add Project</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          projects.map((item, index) => (
            <ProjectCard
              key={index}
              item={item}
              index={index}
              onEdit={() => onEdit(item, index)}
              onDelete={() => onDelete(index)}
              onAddMedia={onAddMedia}
              viewOnly={viewOnly}
            />
          ))
        )}
      </View>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
  container: { gap: 14 },

  // ── Same card style as Work Experience / Education sections
  section: {
    backgroundColor: c.card, borderRadius: 16,
    borderWidth: 1, borderColor: c.border, overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 18, borderBottomWidth: 1, borderBottomColor: c.border,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: c.foreground },
  addBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center',
  },

  // Empty state inside the card
  emptyRow: { alignItems: 'center', padding: 28, gap: 8 },
  emptyIllustration: {
    width: 64, height: 64, borderRadius: 16,
    backgroundColor: c.surface,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: c.foreground, textAlign: 'center' },
  emptySubtitle: {
    fontSize: 13, color: c['muted-foreground'],
    textAlign: 'center', lineHeight: 19, maxWidth: 240,
  },
  emptyAddBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: c.primary, borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 10, marginTop: 6,
  },
  emptyAddBtnText: { color: c.white, fontSize: 13, fontWeight: '600' },

  // Project card — sits inside the section, separated by top border
  projectCard: {
    borderTopWidth: 1, borderTopColor: c.border,
    backgroundColor: c.card, overflow: 'hidden',
  },
  projectHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', padding: 16, gap: 12,
  },
  projectHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  projectIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: `${c.primary}12`,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  projectName: { fontSize: 15, fontWeight: '700', color: c.foreground, flex: 1 },
  projectActions: { flexDirection: 'row', gap: 12, flexShrink: 0 },
  projectDesc: {
    fontSize: 13, color: c.foreground, lineHeight: 20,
    paddingHorizontal: 16, paddingBottom: 12,
  },
  techRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6,
    paddingHorizontal: 16, paddingBottom: 12,
  },
  techPill: {
    backgroundColor: `${c.accent}15`,
    borderWidth: 1, borderColor: `${c.accent}30`,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  techText: { fontSize: 11, color: c.accent, fontWeight: '600' },
  projectLink: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: `${c.accent}10`,
    borderWidth: 1, borderColor: `${c.accent}25`,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7,
  },
  projectLinkText: { flex: 1, fontSize: 12, color: c.accent },
  gallerySection: { borderTopWidth: 1, borderTopColor: c.border },
  gallery: { padding: 12, gap: 8 },
  mediaTile: {
    width: 120, height: 90, borderRadius: 10, overflow: 'hidden',
    backgroundColor: c.surface,
    borderWidth: 1, borderColor: c.border,
  },
  mediaTileImg: { width: '100%', height: '100%' },
  addTile: {
    alignItems: 'center', justifyContent: 'center', gap: 4,
    borderStyle: 'dashed', backgroundColor: c.card,
  },
  addTileText: { fontSize: 11, color: c['muted-foreground'] },
  addMediaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderTopWidth: 1, borderTopColor: c.border, padding: 14,
  },
  addMediaText: { fontSize: 13, color: c['muted-foreground'], fontStyle: 'italic' },
  });
}