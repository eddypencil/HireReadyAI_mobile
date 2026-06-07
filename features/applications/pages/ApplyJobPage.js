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
import { supabase } from '../../../shared/services/supabase';
import QuestionCard from '../components/apply/QuestionCard';
import { colors } from '../../../src/theme';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

const STEPS = ['Info', 'Resume', 'Questions'];

export default function ApplyJobPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { profile } = useUser();
  const { jobId } = route.params;

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
      if (!form.fullName.trim()) stepErrors.fullName = 'Full name is required';
      if (!form.email.trim()) stepErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) stepErrors.email = 'Invalid email format';
      if (!form.phone.trim()) stepErrors.phone = 'Phone is required';
      else if (form.phone.length < 10) stepErrors.phone = 'Invalid phone number';
    }

    if (step === 1 && !resumeFile) {
      stepErrors.resume = 'Please select a resume file';
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
    Alert.alert('Error', 'Could not open document picker');
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
      if (!form.answers[q.id]) newErrors[`question_${q.id}`] = "This field can't be empty";
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
        Alert.alert('Already Applied', 'You have already applied for this job.');
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

      await createApplication(payload);

      Alert.alert(
        'Application Submitted!',
        'Your application has been submitted successfully.',
        [{ text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'JobsTab' }) }]
      );
    } catch (err) {
      console.error('Submit error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer}>

        {/* Progress header */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Apply for Job</Text>

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
            <Text style={styles.cardTitle}>Personal Information</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                value={form.fullName}
                onChangeText={v => { setForm(p => ({ ...p, fullName: v })); clearFieldError('fullName'); }}
                placeholder="Your full name"
                placeholderTextColor={colors.gray[400]}
              />
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={form.email}
                onChangeText={v => { setForm(p => ({ ...p, email: v })); clearFieldError('email'); }}
                placeholder="you@email.com"
                placeholderTextColor={colors.gray[400]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Phone <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                value={form.phone}
                onChangeText={v => { setForm(p => ({ ...p, phone: v })); clearFieldError('phone'); }}
                placeholder="01xxxxxxxxx"
                placeholderTextColor={colors.gray[400]}
                keyboardType="phone-pad"
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>
          </View>
        )}

        {/* Step 2 — Resume */}
        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Upload Resume</Text>
            <Text style={styles.cardSubtitle}>PDF files only, max 5MB</Text>

            <TouchableOpacity
              style={[styles.uploadArea, errors.resume && styles.uploadAreaError]}
              onPress={pickResume}
              activeOpacity={0.7}
            >
              <Ionicons
                name={resumeFile ? 'document-text' : 'cloud-upload-outline'}
                size={36}
                color={resumeFile ? colors.primary : colors.gray[400]}
              />
              <Text style={[styles.uploadText, resumeFile && styles.uploadTextSelected]}>
                {resumeFile ? resumeFile.name : 'Tap to select PDF'}
              </Text>
              {resumeFile && (
                <Text style={styles.uploadSubtext}>Tap to change</Text>
              )}
            </TouchableOpacity>

            {errors.resume && <Text style={styles.errorText}>{errors.resume}</Text>}
          </View>
        )}

        {/* Step 3 — Questions */}
        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Screening Questions</Text>
            {loading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
            ) : questions.length === 0 ? (
              <Text style={styles.noQuestionsText}>No screening questions for this job.</Text>
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
              <Text style={styles.backButtonText}>Back</Text>
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
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },

  // Progress
  progressCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 16,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 12,
    color: colors.gray[400],
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 999,
  },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginTop: -8,
  },

  // Form fields
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  required: {
    color: colors.red[500],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.foreground,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.red[400],
  },
  errorText: {
    fontSize: 12,
    color: colors.red[500],
  },

  // Upload
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
  },
  uploadAreaError: {
    borderColor: colors.red[400],
  },
  uploadText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  uploadTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  uploadSubtext: {
    fontSize: 12,
    color: colors.gray[400],
  },

  // Questions
  questionsContainer: {
    gap: 12,
  },
  noQuestionsText: {
    fontSize: 14,
    color: colors.mutedForeground,
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
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.foreground,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: colors.emerald[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.emerald[600],
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
    color: colors.white,
  },
});