import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../shared/context/ThemeContext";
import StageLibrary from "./StageLibrary";
import StageCard from "./StageCard";
import StageDetailsPanel from "./StageDetailsPanel";
import StageConfigDialog from "./StageConfigDialog";
import { generateEvaluationCriteria } from "../services/pipeline.service";
import { useTranslation } from "../../../shared/context/I18nContext";

const AI_STAGE_TYPES = new Set([
  "hr_interview", "technical_interview",
  "assessment", "assessment_test", "coding_test",
]);
import { useCompany } from "../../companies/pages/CompanyLayout";
import { FONT_FAMILY, FONT_FAMILY_MEDIUM, FONT_FAMILY_SEMIBOLD, FONT_FAMILY_BOLD } from "../../../src/fonts";

export default function PipelineBuilder({
  job,
  stages,
  onAddStage,
  onUpdateStage,
  onDeleteStage,
  moveStage,
}) {
  const { theme } = useTheme();
  const { t, language } = useTranslation();
  const isRtl = language === 'ar';
  const { company } = useCompany();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const BOTTOM_SHEET_HEIGHT = Math.min(SCREEN_HEIGHT * 0.75, 560);
  const styles = createStyles(c, BOTTOM_SHEET_HEIGHT, isRtl);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pendingLibraryItem, setPendingLibraryItem] = useState(null);

  const selectedStage = stages.find((s) => s.id === selectedStageId) || null;

  const handleRequestAddStage = useCallback(
    (libraryItem) => {
      if (AI_STAGE_TYPES.has(libraryItem.key)) {
        setPendingLibraryItem(libraryItem);
        setLibraryOpen(false);
      } else {
        onAddStage(libraryItem);
        setLibraryOpen(false);
      }
    },
    [onAddStage]
  );

  const handleDialogConfirm = useCallback(
    async (libraryItem, extraFields, setCriteriaState) => {
      const created = await onAddStage(libraryItem, extraFields);
      if (!created) {
        setPendingLibraryItem(null);
        return;
      }
      
      if (AI_STAGE_TYPES.has(libraryItem.key)) {
        setCriteriaState("generating");
        try {
          await generateEvaluationCriteria(created.id);
          setCriteriaState("idle");
        } catch (err) {
          console.error("Criteria generation failed:", err);
          setCriteriaState("warning");
          await new Promise(r => setTimeout(r, 2500));
        }
      }
      setPendingLibraryItem(null);
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
          {job?.title || t("pipeline.title")}
        </Text>
        <Text style={styles.canvasHint}>
          {t("pipeline.tap_stage_hint")}
        </Text>
      </View>

      {stages.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="add-outline" size={24} color={c['muted-foreground']} />
          </View>
          <Text style={styles.emptyTitle}>{t("pipeline.no_stages")}</Text>
          <Text style={styles.emptyHint}>
            {t("pipeline.tap_library_hint")}
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

  return (
    <View style={styles.mobileLayout}>
      <TouchableOpacity
        onPress={() => setLibraryOpen(true)}
        style={styles.libraryBtn}
      >
        <Ionicons name="library-outline" size={18} color={c['muted-foreground']} />
        <Text style={styles.libraryBtnText}>{t("pipeline.library")}</Text>
      </TouchableOpacity>

      {renderCanvas()}

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
          <View style={isRtl ? styles.drawerRight : styles.drawerLeft}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerHeaderLabel}>{t("pipeline.stage_library")}</Text>
              <TouchableOpacity
                onPress={() => setLibraryOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-outline" size={22} color={c['muted-foreground']} />
              </TouchableOpacity>
            </View>
            <StageLibrary onRequestAddStage={handleRequestAddStage} isPremium={company?.is_premium} />
          </View>
        </View>
      </Modal>

      <Modal
        visible={detailsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailsOpen(false)}
      >
        <View style={styles.bottomSheetOverlay}>
          <TouchableOpacity
            style={styles.bottomSheetBackdrop}
            onPress={() => setDetailsOpen(false)}
          />
          <View style={styles.bottomSheetContainer}>
            <View style={styles.bottomSheetHandle} />
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.detailsHeaderTitle} numberOfLines={1}>
                {selectedStage?.name || t("pipeline.stage_settings")}
              </Text>
              <TouchableOpacity
                onPress={() => setDetailsOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-outline" size={22} color={c['muted-foreground']} />
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

      <StageConfigDialog
        visible={!!pendingLibraryItem}
        libraryItem={pendingLibraryItem}
        onConfirm={handleDialogConfirm}
        onCancel={() => setPendingLibraryItem(null)}
      />
    </View>
  );
}

function createStyles(c, bottomSheetHeight, isRtl) {
  return StyleSheet.create({
    // Mobile
    mobileLayout: {
      flex: 1,
      position: "relative",
    },
    libraryBtn: {
      position: "absolute",
      top: 12,
      [isRtl ? 'right' : 'left']: 12,
      zIndex: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      shadowColor: c.foreground,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    libraryBtnText: {
      fontSize: 12,
      fontFamily: FONT_FAMILY_MEDIUM,
      color: c['muted-foreground'],
    },
    bottomSheetOverlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    bottomSheetBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: `${c.foreground}4D`,
    },
    bottomSheetContainer: {
      height: bottomSheetHeight,
      backgroundColor: c.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: "hidden",
    },
    bottomSheetHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
      alignSelf: "center",
      marginTop: 10,
      marginBottom: 4,
    },
    bottomSheetHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
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
      fontFamily: FONT_FAMILY_BOLD,
      color: c.foreground,
      marginBottom: 2,
    },
    canvasHint: {
      fontSize: 12,
      fontFamily: FONT_FAMILY,
      color: c['muted-foreground'],
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: c.border,
      borderRadius: 16,
      paddingVertical: 48,
      paddingHorizontal: 24,
      marginTop: 20,
    },
    emptyIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.border,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    emptyTitle: {
      fontSize: 14,
      fontFamily: FONT_FAMILY_SEMIBOLD,
      color: c['muted-foreground'],
      marginBottom: 4,
    },
    emptyHint: {
      fontSize: 12,
      fontFamily: FONT_FAMILY,
      color: c['muted-foreground'],
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
      backgroundColor: `${c.foreground}4D`,
    },
    drawerLeft: {
      width: 280,
      maxWidth: "80%",
      backgroundColor: c.card,
    },
    drawerRight: {
      width: 300,
      maxWidth: "85%",
      backgroundColor: c.card,
    },
    drawerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    drawerHeaderLabel: {
      fontSize: 10,
      fontFamily: FONT_FAMILY_BOLD,
      color: c['muted-foreground'],
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    detailsHeaderTitle: {
      fontSize: 14,
      fontFamily: FONT_FAMILY_SEMIBOLD,
      color: c.foreground,
      flex: 1,
      marginRight: isRtl ? 0 : 8,
      marginLeft: isRtl ? 8 : 0,
    },
    rowReverse: { flexDirection: 'row-reverse' },
    textRight: { textAlign: 'right' },
  });
}
