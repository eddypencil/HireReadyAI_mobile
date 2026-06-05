import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StageLibrary from "./StageLibrary";
import StageCard from "./StageCard";
import StageDetailsPanel from "./StageDetailsPanel";
import { colors } from "../../../src/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const IS_DESKTOP = SCREEN_WIDTH >= 1024;

export default function PipelineBuilder({
  job,
  stages,
  onAddStage,
  onUpdateStage,
  onDeleteStage,
  moveStage,
}) {
  const insets = useSafeAreaInsets();
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const selectedStage = stages.find((s) => s.id === selectedStageId) || null;

  const handleAddFromLibrary = useCallback(
    async (libraryItem) => {
      await onAddStage(libraryItem);
      setLibraryOpen(false);
    },
    [onAddStage]
  );

  const handleStageSelect = useCallback(
    (stage) => {
      setSelectedStageId((prev) => {
        const next = prev === stage.id ? null : stage.id;
        if (next) setDetailsOpen(true);
        return next;
      });
    },
    []
  );

  const handleDelete = useCallback(
    (id) => {
      if (selectedStageId === id) {
        setSelectedStageId(null);
        setDetailsOpen(false);
      }
      onDeleteStage(id);
    },
    [selectedStageId, onDeleteStage]
  );

  const closeAll = useCallback(() => {
    setLibraryOpen(false);
    setDetailsOpen(false);
  }, []);

  const renderCanvas = () => (
    <View style={styles.canvas}>
      <View style={styles.canvasHeader}>
        <Text style={styles.jobTitle} numberOfLines={1}>
          {job?.title || "Pipeline"}
        </Text>
        <Text style={styles.canvasHint}>
          Tap a stage to configure, or add from the library.
        </Text>
      </View>

      {stages.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="add-outline" size={24} color={colors.gray[400]} />
          </View>
          <Text style={styles.emptyTitle}>No stages yet</Text>
          <Text style={styles.emptyHint}>
            Tap the Library button to add stages.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.stageList}
          contentContainerStyle={styles.stageListContent}
          showsVerticalScrollIndicator={false}
        >
          {stages.map((stage, index) => (
            <StageCard
              key={stage.id}
              stage={stage}
              isSelected={stage.id === selectedStageId}
              onSelect={handleStageSelect}
              onDelete={handleDelete}
              onMoveUp={moveStage}
              onMoveDown={moveStage}
              isFirst={index === 0}
              isLast={index === stages.length - 1}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );

  if (IS_DESKTOP && Platform.OS === "web") {
    return (
      <View style={[styles.desktopLayout, { paddingTop: insets.top }]}>
        <View style={styles.desktopSidebar}>
          <StageLibrary onAddStage={handleAddFromLibrary} />
        </View>
        <View style={styles.desktopCanvas}>
          {renderCanvas()}
        </View>
        <View style={styles.desktopDetails}>
          <StageDetailsPanel
            stage={selectedStage}
            stages={stages}
            onUpdate={onUpdateStage}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mobileLayout}>
      <TouchableOpacity
        onPress={() => setLibraryOpen(true)}
        style={styles.libraryBtn}
      >
        <Ionicons name="library-outline" size={18} color={colors.gray[600]} />
        <Text style={styles.libraryBtnText}>Library</Text>
      </TouchableOpacity>

      {renderCanvas()}

      {selectedStage && (
        <TouchableOpacity
          onPress={() => setDetailsOpen(true)}
          style={styles.settingsBtn}
        >
          <Text style={styles.settingsBtnText}>Settings</Text>
          <Ionicons name="settings-outline" size={18} color={colors.white} />
        </TouchableOpacity>
      )}

      <Modal
        visible={libraryOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setLibraryOpen(false)}
      >
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            onPress={() => setLibraryOpen(false)}
          />
          <View style={styles.drawerLeft}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerHeaderLabel}>Stage Library</Text>
              <TouchableOpacity
                onPress={() => setLibraryOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-outline" size={22} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>
            <StageLibrary onAddStage={handleAddFromLibrary} />
          </View>
        </View>
      </Modal>

      <Modal
        visible={detailsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailsOpen(false)}
      >
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            onPress={() => setDetailsOpen(false)}
          />
          <View style={styles.drawerRight}>
            <View style={styles.drawerHeader}>
              <Text style={styles.detailsHeaderTitle} numberOfLines={1}>
                {selectedStage?.name || "Stage Settings"}
              </Text>
              <TouchableOpacity
                onPress={() => setDetailsOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-outline" size={22} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>
            <StageDetailsPanel
              stage={selectedStage}
              stages={stages}
              onUpdate={onUpdateStage}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Desktop
  desktopLayout: {
    flex: 1,
    flexDirection: "row",
  },
  desktopSidebar: {
    width: 220,
    borderRightWidth: 1,
    borderRightColor: colors.gray[100],
    backgroundColor: colors.white,
  },
  desktopCanvas: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  desktopDetails: {
    width: 260,
    borderLeftWidth: 1,
    borderLeftColor: colors.gray[100],
    backgroundColor: colors.white,
  },

  // Mobile
  mobileLayout: {
    flex: 1,
    position: "relative",
  },
  libraryBtn: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  libraryBtnText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.gray[600],
  },
  settingsBtn: {
    position: "absolute",
    right: 12,
    bottom: 12,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.darkAmethyst[600],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  settingsBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.white,
  },

  // Canvas
  canvas: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  canvasHeader: {
    marginBottom: 16,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.gray[900],
    marginBottom: 2,
  },
  canvasHint: {
    fontSize: 12,
    color: colors.gray[400],
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.gray[200],
    borderRadius: 16,
    paddingVertical: 48,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  emptyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[500],
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: "center",
  },
  stageList: {
    flex: 1,
  },
  stageListContent: {
    gap: 10,
    paddingBottom: 100,
  },

  // Drawers
  drawerOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  drawerLeft: {
    width: 280,
    maxWidth: "80%",
    backgroundColor: colors.white,
  },
  drawerRight: {
    width: 300,
    maxWidth: "85%",
    backgroundColor: colors.white,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  drawerHeaderLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  detailsHeaderTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[900],
    flex: 1,
    marginRight: 8,
  },
});
