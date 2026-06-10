// src/features/applications/pages/ApplyJobPage.js
import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../auth/context/user.context';
import { fetchQuestionsByJobId, createApplication } from '../services/application.service';
import { triggerCvReview } from '../services/cv-review.service';
import { supabase } from '../../../shared/services/supabase';
import QuestionCard from '../components/apply/QuestionCard';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useTranslation } from '../../../shared/context/I18nContext';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ApplyJobPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const styles = createStyles(c);
  const route = useRoute();
  const navigation = useNavigation();
  const { profile } = useUser();
  const { jobId } = route.params;

  const STEPS = [t("applications.step_info"), t("applications.step_resume"), t("applications.step_questions")];

  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [resumeFile, setResumeFile] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    answers: {},
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  // Load questions
  useEffect(() => {
    if (!jobId) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchQuestionsByJobId(jobId);
        setQuestions(data || []);
      } catch (err) {
        console.error('Error loading questions:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId]);

  const clearFieldError = (field) => {
    setErrors(prev => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const validateStep = () => {
    const stepErrors = {};

    if (step === 0) {
      if (!form.fullName.trim()) stepErrors.fullName = t("applications.required_field_name");
      if (!form.email.trim()) stepErrors.email = t("applications.required_field_email");
      else if (!/\S+@\S+\.\S+/.test(form.email)) stepErrors.email = t("applications.invalid_email");
      if (!form.phone.trim()) stepErrors.phone = t("applications.required_field_phone");
      else if (form.phone.length < 10) stepErrors.phone = t("applications.invalid_phone");
    }

    if (step === 1 && !resumeFile) {
      stepErrors.resume = t("applications.select_resume");
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleAnswer = (id, value) => {
    setForm(prev => ({ ...prev, answers: { ...prev.answers, [id]: value } }));
    setErrors(prev => {
      const copy = { ...prev };
      delete copy[`question_${id}`];
      return copy;
    });
  };

  // const pickResume = async () => {
  //   try {
  //     const DocumentPicker = await import('expo-document-picker');
  //     const result = await DocumentPicker.getDocumentAsync({
  //       type: 'application/pdf',
  //       copyToCacheDirectory: true,
  //     });
  //     if (!result.canceled && result.assets?.[0]) {
  //       setResumeFile(result.assets[0]);
  //       clearFieldError('resume');
  //     }
  //   } catch (err) {
  //     Alert.alert('Error', 'Could not open document picker');
  //   }
  // };
  const pickResume = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      setResumeFile(result.assets[0]);
      clearFieldError('resume');
    }
  } catch (err) {
    Alert.alert(t("applications.error"), t("applications.error_document_picker"));
  }
};

  const uploadResume = async (file) => {
    const fileName = `${Date.now()}-${file.name}`;

    const base64 = await FileSystem.readAsStringAsync(file.uri, {
      encoding: 'base64',
    });

    const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    const { error } = await supabase.storage
      .from('resumes')
      .upload(fileName, byteArray, {
        contentType: 'application/pdf',
      });

    if (error) throw error;

    const { data } = supabase.storage.from('resumes').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    // Validate questions
    const newErrors = {};
    questions.forEach(q => {
      if (!form.answers[q.id]) newErrors[`question_${q.id}`] = t("applications.required_field");
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      // Check duplicate application
      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('candidate_profile_id', profile.id)
        .eq('job_id', jobId)
        .maybeSingle();

      if (existing) {
        Alert.alert(t("applications.already_applied_title"), t("applications.already_applied_message"));
        return;
      }

      let cvUrl = null;
      let cvName = null;

      if (resumeFile) {
        cvUrl = await uploadResume(resumeFile);
        cvName = resumeFile.name;
      }

      const payload = {
        candidate_profile_id: profile.id,
        job_id: jobId,
        cv_file_url: cvUrl,
        cv_file_name: cvName,
        answers: {
          info: {
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
          },
          questions: form.answers,
        },
        current_stage: 'applied',
        applied_at: new Date().toISOString(),
      };

      const application = await createApplication(payload);

      let cvText = '';
      if (cvUrl) {
        try {
          const { data: pdfData, error: pdfError } = await supabase.functions.invoke('extract-pdf-text', {
            body: { cvFileUrl: cvUrl },
          });
          console.log("[extract-pdf-text] response:", pdfData, "error:", pdfError);
          if (pdfData?.text) cvText = pdfData.text;
        } catch (err) {
          console.error('[extract-pdf-text] invocation failed:', err);
        }
      }

      console.log("[triggerCvReview] cvText length:", cvText.trim().length, "preview:", cvText.trim().slice(0, 200));
      triggerCvReview(application.id, cvText.trim());

      Alert.alert(
        t("applications.application_submitted"),
        t("applications.success_message"),
        [{ text: t("applications.ok"), onPress: () => navigation.navigate('Main', { screen: 'JobsTab' }) }]
      );
    } catch (err) {
      console.error('Submit error:', err);
      Alert.alert(t("applications.error"), t("applications.submit_error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.screen} contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 16 }]}>

        {/* Progress header */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>{t("applications.apply_title")}</Text>

          <View style={styles.stepsRow}>
            {STEPS.map((s, i) => (
              <Text key={i} style={[styles.stepLabel, i <= step && styles.stepLabelActive]}>
                {s}
              </Text>
            ))}
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Step 1 — Info */}
        {step === 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("applications.personal_info")}</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t("applications.full_name")} <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                value={form.fullName}
                onChangeText={v => { setForm(p => ({ ...p, fullName: v })); clearFieldError('fullName'); }}
                placeholder={t("applications.full_name_placeholder")}
                placeholderTextColor={c['muted-foreground']}
              />
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t("applications.email")} <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={form.email}
                onChangeText={v => { setForm(p => ({ ...p, email: v })); clearFieldError('email'); }}
                placeholder={t("applications.email_placeholder")}
                placeholderTextColor={c['muted-foreground']}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t("applications.phone")} <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                value={form.phone}
                onChangeText={v => { setForm(p => ({ ...p, phone: v })); clearFieldError('phone'); }}
                placeholder={t("applications.phone_placeholder")}
                placeholderTextColor={c['muted-foreground']}
                keyboardType="phone-pad"
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>
          </View>
        )}

        {/* Step 2 — Resume */}
        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("applications.upload_resume")}</Text>
            <Text style={styles.cardSubtitle}>{t("applications.resume_subtitle")}</Text>

            <TouchableOpacity
              style={[styles.uploadArea, errors.resume && styles.uploadAreaError]}
              onPress={pickResume}
              activeOpacity={0.7}
            >
              <Ionicons
                name={resumeFile ? 'document-text' : 'cloud-upload-outline'}
                size={36}
                color={resumeFile ? c.primary : c['muted-foreground']}
              />
              <Text style={[styles.uploadText, resumeFile && styles.uploadTextSelected]}>
                {resumeFile ? resumeFile.name : t("applications.tap_to_select")}
              </Text>
              {resumeFile && (
                <Text style={styles.uploadSubtext}>{t("applications.tap_to_change")}</Text>
              )}
            </TouchableOpacity>

            {errors.resume && <Text style={styles.errorText}>{errors.resume}</Text>}
          </View>
        )}

        {/* Step 3 — Questions */}
        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("applications.screening_questions")}</Text>
            {loading ? (
              <ActivityIndicator color={c.primary} style={{ marginTop: 20 }} />
            ) : questions.length === 0 ? (
              <Text style={styles.noQuestionsText}>{t("applications.no_questions")}</Text>
            ) : (
              <View style={styles.questionsContainer}>
                {questions.map(q => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    value={form.answers[q.id]}
                    error={errors[`question_${q.id}`]}
                    onChange={val => handleAnswer(q.id, val)}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Navigation buttons */}
        <View style={styles.footer}>
          {step > 0 ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(step - 1)}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>{t("applications.back")}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          {step < 2 ? (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => {
                if (validateStep()) setStep(step + 1);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>{t("applications.next")}</Text>
              <Ionicons name="arrow-forward" size={16} color={c['destructive-foreground']} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color={c['destructive-foreground']} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>{t("applications.submit")}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(c) { return StyleSheet.create({
  flex: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: c['surface-muted'],
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },

  // Progress
  progressCard: {
    backgroundColor: c.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    padding: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: c.foreground,
    marginBottom: 16,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 12,
    color: c['muted-foreground'],
  },
  stepLabelActive: {
    color: c.primary,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: c['surface-muted'],
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: c.primary,
    borderRadius: 999,
  },

  // Card
  card: {
    backgroundColor: c.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    padding: 20,
    gap: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: c.foreground,
  },
  cardSubtitle: {
    fontSize: 13,
    color: c['muted-foreground'],
    marginTop: -8,
  },

  // Form fields
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: c.foreground,
  },
  required: {
    color: c.destructive,
  },
  input: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: c.foreground,
    backgroundColor: c['surface-muted'],
  },
  inputError: {
    borderColor: c.destructive,
  },
  errorText: {
    fontSize: 12,
    color: c.destructive,
  },

  // Upload
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: c.border,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    backgroundColor: c['surface-muted'],
  },
  uploadAreaError: {
    borderColor: c.destructive,
  },
  uploadText: {
    fontSize: 14,
    color: c['muted-foreground'],
    textAlign: 'center',
  },
  uploadTextSelected: {
    color: c.primary,
    fontWeight: '500',
  },
  uploadSubtext: {
    fontSize: 12,
    color: c['muted-foreground'],
  },

  // Questions
  questionsContainer: {
    gap: 12,
  },
  noQuestionsText: {
    fontSize: 14,
    color: c['muted-foreground'],
    textAlign: 'center',
    paddingVertical: 20,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  backButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
    backgroundColor: c.card,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: c.foreground,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: c.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: c['destructive-foreground'],
  },
  submitButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: c.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: c.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: c['destructive-foreground'],
  },
}); }