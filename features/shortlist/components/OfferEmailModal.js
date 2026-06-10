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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useTranslation } from '../../../shared/context/I18nContext';
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
      Alert.alert(t("shortlist.missing_fields"), t("shortlist.missing_fields_msg"));
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
        Alert.alert(t("shortlist.no_offer_stage"), t("shortlist.no_offer_stage_msg"));
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
      onClose();
      Alert.alert(t("shortlist.success"), isOffer
        ? t("shortlist.offer_success")
        : t("shortlist.reject_success"));
    } catch (err) {
      Alert.alert(t("shortlist.error"), err.message || t("shortlist.send_error"));
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                placeholder={t("shortlist.from_name_placeholder")}
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
                placeholder={t("shortlist.from_email_placeholder")}
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
                placeholder={t("shortlist.to_placeholder")}
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
                placeholder={t("shortlist.subject_placeholder")}
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
                placeholder={t("shortlist.body_placeholder")}
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
    fontWeight: '700',
    color: c.foreground,
  },
  subtitle: {
    fontSize: 12,
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
    fontWeight: '600',
    color: c.primary,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '600',
    color: c['destructive-foreground'],
  },
}); }
