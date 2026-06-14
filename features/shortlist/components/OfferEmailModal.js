import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/context/ThemeContext';
import {
  FONT_FAMILY,
  FONT_FAMILY_SEMIBOLD,
  FONT_FAMILY_BOLD,
} from '../../../src/fonts';
import { useTranslation } from '../../../shared/context/I18nContext';
import { useThemedAlert } from '../../../shared/context/ThemedAlertContext';
import { supabase } from '../../../shared/services/supabase';
import { advanceToOffer } from '../services/shortlist.service';

export default function OfferEmailModal({
  visible,
  onClose,
  candidateName,
  candidateEmail,
  recruiterName,
  recruiterEmail,
  applicationId,
  jobId,
  jobTitle,
  companyName,
  action,
  onSuccess,
}) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { alert } = useThemedAlert();
  const c = theme.colors;
  const styles = createStyles(c);
  const isOffer = action === 'offer';
  const [fromName, setFromName] = useState(recruiterName || '');
  const [fromEmail, setFromEmail] = useState(recruiterEmail || '');
  const [to, setTo] = useState(candidateEmail || '');
  const [subject, setSubject] = useState(
    isOffer
      ? t("shortlist.offer_subject_initial", { companyName: companyName || '[Company Name]' })
      : t("shortlist.reject_subject_initial"),
  );
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  const fillTemplate = () => {
    if (isOffer) {
      setSubject(t("shortlist.offer_subject_template", { companyName: companyName || '[Company Name]' }));
      setBody(t("shortlist.offer_body_template", {
        candidateName: candidateName || 'Candidate',
        companyName: companyName || '[Company Name]',
        fromName: fromName || '[Your Name]',
      }));
    } else {
      setSubject(t("shortlist.reject_subject_template", { companyName: companyName || '[Company Name]' }));
      setBody(t("shortlist.reject_body_template", {
        candidateName: candidateName || 'Candidate',
        companyName: companyName || '[Company Name]',
        fromName: fromName || '[Your Name]',
      }));
    }
  };

  const handleSend = async () => {
    if (!to || !subject || !body || !fromEmail) {
      alert(t("shortlist.missing_fields"), t("shortlist.missing_fields_msg"));
      return;
    }
    setSending(true);
    try {
      const { data: offerStage } = await supabase
        .from('recruitment_stages')
        .select('id')
        .eq('stage_type', 'offer')
        .eq('job_id', jobId)
        .maybeSingle();

      if (!offerStage && isOffer) {
        alert(t("shortlist.no_offer_stage"), t("shortlist.no_offer_stage_msg"));
        setSending(false);
        return;
      }

      const { error: fnError } = await supabase.functions.invoke('send-offer-email', {
        body: {
          to,
          fromName,
          fromEmail,
          subject,
          body,
          applicationId,
          jobId,
          action: isOffer ? 'offer' : 'reject',
        },
      });

      if (fnError) {
        console.warn('Edge function unavailable, falling back to direct update:', fnError);
        if (isOffer && offerStage) {
          await advanceToOffer(applicationId, offerStage.id);
        }
      }

      onSuccess?.();
      setShowSuccess(true);
    } catch (err) {
      alert(t("shortlist.error"), err.message || t("shortlist.send_error"));
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {isOffer ? t("shortlist.offer_title") : t("shortlist.reject_title")}
              </Text>
              <Text style={styles.subtitle}>
                {t("shortlist.send_email_to", { candidateName: candidateName || 'the candidate' })}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={c['muted-foreground']} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={styles.templateBtn} onPress={fillTemplate}>
              <Ionicons name="document-text-outline" size={16} color={c.primary} />
              <Text style={styles.templateBtnText}>
                {isOffer ? t("shortlist.fill_offer_template") : t("shortlist.fill_rejection_template")}
              </Text>
            </TouchableOpacity>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                <Ionicons name="person-outline" size={12} color={c['muted-foreground']} /> {t("shortlist.from_name")}
              </Text>
              <TextInput
                style={[styles.input, !fromName && styles.inputWarning]}
                value={fromName}
                onChangeText={setFromName}
                placeholder="Your name"
                placeholderTextColor={c['muted-foreground']}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                <Ionicons name="mail-outline" size={12} color={c['muted-foreground']} /> {t("shortlist.from_email")} *
              </Text>
              <TextInput
                style={[styles.input, !fromEmail && styles.inputWarning]}
                value={fromEmail}
                onChangeText={setFromEmail}
                placeholder="your@email.com"
                placeholderTextColor={c['muted-foreground']}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                <Ionicons name="person-outline" size={12} color={c['muted-foreground']} /> {t("shortlist.to")} *
              </Text>
              <TextInput
                style={[styles.input, !to && styles.inputWarning]}
                value={to}
                onChangeText={setTo}
                placeholder="candidate@email.com"
                placeholderTextColor={c['muted-foreground']}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                <Ionicons name="text-outline" size={12} color={c['muted-foreground']} /> {t("shortlist.subject")} *
              </Text>
              <TextInput
                style={[styles.input, !subject && styles.inputWarning]}
                value={subject}
                onChangeText={setSubject}
                placeholder="Offer of Employment"
                placeholderTextColor={c['muted-foreground']}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                <Ionicons name="document-text-outline" size={12} color={c['muted-foreground']} /> {t("shortlist.body")} *
              </Text>
              <TextInput
                style={[styles.bodyInput, !body && styles.inputWarning]}
                value={body}
                onChangeText={setBody}
                placeholder="Write your message here..."
                placeholderTextColor={c['muted-foreground']}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>{t("shortlist.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={c['destructive-foreground']} />
              ) : (
                <>
                  <Ionicons name="send" size={16} color={c['destructive-foreground']} />
                  <Text style={styles.sendBtnText}>{t("shortlist.send")}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {showSuccess && (
          <View style={styles.successOverlay}>
            <View style={[styles.successModal, { width: Math.min(screenWidth * 0.85, 400) }]}>
              <View style={styles.successIconWrap}>
                <Ionicons name="checkmark-circle" size={56} color={c.success} />
              </View>
              <Text style={styles.successTitle}>{t("shortlist.success")}</Text>
              <Text style={styles.successMessage}>
                {isOffer ? t("shortlist.offer_success") : t("shortlist.reject_success")}
              </Text>
              <TouchableOpacity
                style={styles.successButton}
                onPress={() => { setShowSuccess(false); onClose(); }}
                activeOpacity={0.85}
              >
                <Text style={styles.successButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(c) { return StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: `${c.foreground}66`,
  },
  container: {
    backgroundColor: c.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  title: {
    fontSize: 17,
    fontFamily: FONT_FAMILY_BOLD,
    color: c.foreground,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: FONT_FAMILY,
    color: c['muted-foreground'],
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  templateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${c.primary}30`,
    backgroundColor: `${c.primary}08`,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  templateBtnText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY_SEMIBOLD,
    color: c.primary,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: FONT_FAMILY_SEMIBOLD,
    color: c['muted-foreground'],
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    color: c.foreground,
    backgroundColor: c['surface-muted'],
  },
  inputWarning: {
    borderColor: `${c.warning}80`,
  },
  bodyInput: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: c.foreground,
    backgroundColor: c['surface-muted'],
    minHeight: 160,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: c.border,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY_SEMIBOLD,
    color: c['muted-foreground'],
  },
  sendBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: c.primary,
    borderRadius: 12,
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  sendBtnText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY_SEMIBOLD,
    color: c['destructive-foreground'],
  },

  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `${c.foreground}66`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: c.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.border,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  successIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${c.success}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: FONT_FAMILY_BOLD,
    color: c.foreground,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    color: c['muted-foreground'],
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  successButton: {
    backgroundColor: c.primary,
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  successButtonText: {
    color: c['destructive-foreground'],
    fontSize: 15,
    fontFamily: FONT_FAMILY_SEMIBOLD,
  },
}); }
