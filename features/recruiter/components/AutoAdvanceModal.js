// features/recruiter/components/AutoAdvanceModal.js
import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { FONT_FAMILY, FONT_FAMILY_SEMIBOLD, FONT_FAMILY_BOLD, FONT_FAMILY_EXTRABOLD } from '../../../src/fonts';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useTranslation } from '../../../shared/context/I18nContext';
import { supabase } from '../../../shared/services/supabase';

function createStyles(c) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: c.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '85%',
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerTitle: { fontSize: 17, fontFamily: FONT_FAMILY_BOLD, color: c.foreground },
    closeBtn: { padding: 4 },
    body: { padding: 20 },
    section: { marginBottom: 20 },
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    label: { fontSize: 14, fontFamily: FONT_FAMILY_SEMIBOLD, color: c.foreground },
    generateBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: c.primary + '1a',
    },
    generateBtnText: { fontSize: 12, fontFamily: FONT_FAMILY_SEMIBOLD, color: c.primary },
    generateBtnDisabled: { opacity: 0.5 },
    textarea: {
      backgroundColor: c['surface-muted'],
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      padding: 12,
      fontSize: 14,
      fontFamily: FONT_FAMILY,
      color: c.foreground,
      minHeight: 90,
      textAlignVertical: 'top',
    },
    textareaDisabled: { opacity: 0.6 },
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    scoreValue: {
      fontSize: 28,
      fontFamily: FONT_FAMILY_EXTRABOLD,
      color: c.primary,
      minWidth: 48,
      textAlign: 'center',
    },
    slider: { flex: 1, height: 40 },
    sliderLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: -4,
    },
    sliderLabel: { fontSize: 11, fontFamily: FONT_FAMILY, color: c['muted-foreground'] },
    suggestionBox: {
      backgroundColor: c['surface-muted'],
      borderRadius: 10,
      padding: 12,
      borderLeftWidth: 3,
      borderLeftColor: c.primary,
      marginTop: 8,
    },
    suggestionTitle: {
      fontSize: 12,
      fontFamily: FONT_FAMILY_BOLD,
      color: c.primary,
      marginBottom: 4,
    },
    suggestionText: { fontSize: 12, fontFamily: FONT_FAMILY, color: c['muted-foreground'], lineHeight: 18 },
    footer: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
    },
    cancelBtnText: { fontSize: 15, fontFamily: FONT_FAMILY_SEMIBOLD, color: c['muted-foreground'] },
    runBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: c.primary,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
    },
    runBtnText: { fontSize: 15, fontFamily: FONT_FAMILY_BOLD, color: c['destructive-foreground'] },
    runBtnDisabled: { opacity: 0.5 },
    generatingOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    generatingBox: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      marginHorizontal: 40,
    },
    generatingText: {
      marginTop: 12,
      fontSize: 15,
      fontFamily: FONT_FAMILY_SEMIBOLD,
      color: c.foreground,
    },
    generatingSub: {
      marginTop: 4,
      fontSize: 12,
      fontFamily: FONT_FAMILY,
      color: c['muted-foreground'],
      textAlign: 'center',
    },
    resultOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    resultBox: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 24,
      marginHorizontal: 24,
      width: '85%',
    },
    resultTitle: {
      fontSize: 18,
      fontFamily: FONT_FAMILY_BOLD,
      color: c.foreground,
      textAlign: 'center',
      marginBottom: 12,
    },
    resultStats: {
      backgroundColor: c['surface-muted'],
      borderRadius: 10,
      padding: 16,
      marginBottom: 16,
    },
    resultStatRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    resultStatLabel: { fontSize: 13, fontFamily: FONT_FAMILY, color: c['muted-foreground'] },
    resultStatValue: { fontSize: 14, fontFamily: FONT_FAMILY_BOLD, color: c.foreground },
    resultDivider: { height: 1, backgroundColor: c.border, marginVertical: 8 },
    resultDoneBtn: {
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: c.primary,
      alignItems: 'center',
    },
    resultDoneBtnText: {
      fontSize: 15,
      fontFamily: FONT_FAMILY_BOLD,
      color: c['destructive-foreground'],
    },
  });
}

export default function AutoAdvanceModal({
  visible,
  onClose,
  selectedJobId,
  precedingStageCandidates,
  onComplete,
}) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { t } = useTranslation();
  const styles = createStyles(c);

  const [criteria, setCriteria] = useState('');
  const [minScore, setMinScore] = useState(70);
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [suggestedMinScore, setSuggestedMinScore] = useState(null);
  const [scoreReasoning, setScoreReasoning] = useState('');
  const [results, setResults] = useState(null);

  const handleGenerate = useCallback(async () => {
    if (!selectedJobId) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'auto-generate-criteria',
        { body: { jobId: selectedJobId } }
      );
      if (error) throw error;
      setCriteria(data.criteria || '');
      setSuggestedMinScore(data.suggestedMinScore);
      setScoreReasoning(data.scoreReasoning || '');
      setMinScore(data.suggestedMinScore ?? 70);
    } catch (err) {
      Alert.alert(t('recruiter.error'), err.message);
    } finally {
      setGenerating(false);
    }
  }, [selectedJobId, t]);

  const handleRunEvaluation = useCallback(async () => {
    if (!criteria.trim()) {
      Alert.alert(t('recruiter.error'), t('recruiter.criteria_required'));
      return;
    }
    const appIds = (precedingStageCandidates || []).map(c => c.id);
    if (appIds.length === 0) {
      Alert.alert(t('recruiter.error'), t('recruiter.no_candidates_to_evaluate'));
      return;
    }
    setEvaluating(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'evaluate-shortlist',
        {
          body: {
            applicationIds: appIds,
            evaluationCriteria: criteria.trim(),
            minScore,
          },
        }
      );
      if (error) throw error;

      const resultsData = data?.results || [];
      const advanced = resultsData.filter(r => r.passed);
      const rejected = resultsData.filter(r => !r.passed && !r.error);
      const errors = resultsData.filter(r => r.error);

      setResults({ advanced, rejected, errors, total: resultsData.length });
    } catch (err) {
      Alert.alert(t('recruiter.error'), err.message);
    } finally {
      setEvaluating(false);
    }
  }, [criteria, minScore, precedingStageCandidates, t]);

  const handleDone = () => {
    const advancedCount = results?.advanced?.length || 0;
    onComplete(advancedCount);
    setResults(null);
    setCriteria('');
    setMinScore(70);
    setSuggestedMinScore(null);
    setScoreReasoning('');
    onClose();
  };

  const hasCandidates = (precedingStageCandidates || []).length > 0;

  if (evaluating) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.generatingOverlay}>
          <View style={styles.generatingBox}>
            <ActivityIndicator size="large" color={c.primary} />
            <Text style={styles.generatingText}>
              {t('recruiter.evaluating_candidates')}
            </Text>
            <Text style={styles.generatingSub}>
              {t('recruiter.evaluating_sub')}
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {results ? (
        <View style={styles.resultOverlay}>
          <View style={styles.resultBox}>
            <Ionicons
              name={results.advanced.length > 0 ? 'checkmark-circle' : 'information-circle'}
              size={48}
              color={results.advanced.length > 0 ? c.success : c.warning}
              style={{ alignSelf: 'center', marginBottom: 8 }}
            />
            <Text style={styles.resultTitle}>
              {results.advanced.length > 0
                ? t('recruiter.advance_complete')
                : t('recruiter.advance_no_results')}
            </Text>
            <View style={styles.resultStats}>
              <View style={styles.resultStatRow}>
                <Text style={styles.resultStatLabel}>{t('recruiter.total_evaluated')}</Text>
                <Text style={styles.resultStatValue}>{results.total}</Text>
              </View>
              <View style={styles.resultStatRow}>
                <Text style={styles.resultStatLabel}>{t('recruiter.advanced_to_shortlist')}</Text>
                <Text style={[styles.resultStatValue, { color: c.success }]}>
                  {results.advanced.length}
                </Text>
              </View>
              <View style={styles.resultStatRow}>
                <Text style={styles.resultStatLabel}>{t('recruiter.did_not_meet_threshold')}</Text>
                <Text style={[styles.resultStatValue, { color: c.destructive }]}>
                  {results.rejected.length}
                </Text>
              </View>
              {results.errors.length > 0 && (
                <>
                  <View style={styles.resultDivider} />
                  <View style={styles.resultStatRow}>
                    <Text style={styles.resultStatLabel}>{t('recruiter.errors')}</Text>
                    <Text style={[styles.resultStatValue, { color: c.destructive }]}>
                      {results.errors.length}
                    </Text>
                  </View>
                </>
              )}
            </View>
            <TouchableOpacity style={styles.resultDoneBtn} onPress={handleDone}>
              <Text style={styles.resultDoneBtnText}>{t('recruiter.done')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{t('recruiter.shortlist_advancement_title')}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={c.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body}>
              {/* Criteria Section */}
              <View style={styles.section}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>{t('recruiter.evaluation_criteria')}</Text>
                  <TouchableOpacity
                    style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
                    onPress={handleGenerate}
                    disabled={generating}
                  >
                    {generating ? (
                      <ActivityIndicator size="small" color={c.primary} />
                    ) : (
                      <Ionicons name="sparkles" size={14} color={c.primary} />
                    )}
                    <Text style={styles.generateBtnText}>
                      {generating ? t('recruiter.generating') : t('recruiter.auto_generate')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[styles.textarea, generating && styles.textareaDisabled]}
                  value={criteria}
                  onChangeText={setCriteria}
                  placeholder={t('recruiter.criteria_placeholder')}
                  placeholderTextColor={c['muted-foreground']}
                  multiline
                  editable={!generating}
                  textAlignVertical="top"
                />
              </View>

              {/* Min Score Section */}
              <View style={styles.section}>
                <Text style={styles.label}>{t('recruiter.min_score')}</Text>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreValue}>{minScore}</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={50}
                    maximumValue={90}
                    step={1}
                    value={minScore}
                    onValueChange={setMinScore}
                    minimumTrackTintColor={c.primary}
                    maximumTrackTintColor={c.border}
                    thumbTintColor={c.primary}
                  />
                </View>
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>50</Text>
                  <Text style={styles.sliderLabel}>90</Text>
                </View>
              </View>

              {/* AI Suggestion */}
              {suggestedMinScore != null && scoreReasoning && (
                <View style={styles.suggestionBox}>
                  <Text style={styles.suggestionTitle}>
                    {t('recruiter.ai_suggestion')}: {suggestedMinScore}/100
                  </Text>
                  <Text style={styles.suggestionText}>{scoreReasoning}</Text>
                </View>
              )}

              {/* Candidate count */}
              <View style={styles.section}>
                <Text style={{ fontSize: 12, fontFamily: FONT_FAMILY, color: c['muted-foreground'] }}>
                  {t('recruiter.candidates_to_evaluate', { count: (precedingStageCandidates || []).length })}
                  {!hasCandidates ? ` — ${t('recruiter.no_candidates_to_evaluate')}` : ''}
                </Text>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>{t('recruiter.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.runBtn, (!hasCandidates || !criteria.trim()) && styles.runBtnDisabled]}
                onPress={handleRunEvaluation}
                disabled={!hasCandidates || !criteria.trim()}
              >
                <Ionicons name="flash" size={18} color={c['destructive-foreground']} />
                <Text style={styles.runBtnText}>{t('recruiter.run_evaluation')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
}
