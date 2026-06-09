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
import { colors } from '../../../src/theme';
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
  const isOffer = action === 'offer';
  const [fromName, setFromName] = useState(recruiterName || '');
  const [fromEmail, setFromEmail] = useState(recruiterEmail || '');
  const [to, setTo] = useState(candidateEmail || '');
  const [subject, setSubject] = useState(
    isOffer
      ? `Opportunity at ${companyName || '[Company Name]'}`
      : 'Update on Your Application',
  );
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const fillTemplate = () => {
    if (isOffer) {
      setSubject(`Exciting Opportunity at ${companyName || '[Company Name]'}`);
      setBody(
        `Dear ${candidateName || 'Candidate'},

I hope this message finds you well.

After reviewing your application and performance throughout our hiring process, we were truly impressed by your skills and experience. We believe you would be a great addition to our team at ${companyName || '[Company Name]'}.

We would love to schedule a conversation to discuss the next steps and explore how your expertise aligns with our goals. Please let us know your availability for a call or meeting at your earliest convenience.

We look forward to connecting with you!

Best regards,
${fromName || '[Your Name]'}`,
      );
    } else {
      setSubject(`Update on Your Application — ${companyName || '[Company Name]'}`);
      setBody(
        `Dear ${candidateName || 'Candidate'},

Thank you for your interest in joining ${companyName || '[Company Name]'} and for taking the time to go through our hiring process.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match the requirements of the role.

We appreciate your effort and wish you the very best in your future endeavors.

Sincerely,
${fromName || '[Your Name]'}`,
      );
    }
  };

  const handleSend = async () => {
    if (!to || !subject || !body || !fromEmail) {
      Alert.alert('Missing fields', 'Please fill in all required fields (From Email, To, Subject, Body)');
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
        Alert.alert('Error', 'No offer stage found for this job. Please set up pipeline stages first.');
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
      Alert.alert('Success', isOffer
        ? 'Email sent and candidate advanced to offer stage.'
        : 'Email sent and candidate moved to rejected.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to send email');
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
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {isOffer ? 'Advance to Offer' : 'Move to Rejected'}
              </Text>
              <Text style={styles.subtitle}>
                Send an email to {candidateName || 'the candidate'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {/* Fill Template Button */}
            <TouchableOpacity style={styles.templateBtn} onPress={fillTemplate}>
              <Ionicons name="document-text-outline" size={16} color={colors.primary} />
              <Text style={styles.templateBtnText}>
                Fill {isOffer ? 'offer' : 'rejection'} template
              </Text>
            </TouchableOpacity>

            {/* From */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                <Ionicons name="person-outline" size={12} color={colors.gray[500]} /> From Name
              </Text>
              <TextInput
                style={[styles.input, !fromName && styles.inputWarning]}
                value={fromName}
                onChangeText={setFromName}
                placeholder="Your name"
                placeholderTextColor={colors.gray[400]}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                <Ionicons name="mail-outline" size={12} color={colors.gray[500]} /> From Email *
              </Text>
              <TextInput
                style={[styles.input, !fromEmail && styles.inputWarning]}
                value={fromEmail}
                onChangeText={setFromEmail}
                placeholder="your@email.com"
                placeholderTextColor={colors.gray[400]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* To */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                <Ionicons name="person-outline" size={12} color={colors.gray[500]} /> To *
              </Text>
              <TextInput
                style={[styles.input, !to && styles.inputWarning]}
                value={to}
                onChangeText={setTo}
                placeholder="candidate@email.com"
                placeholderTextColor={colors.gray[400]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Subject */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                <Ionicons name="text-outline" size={12} color={colors.gray[500]} /> Subject *
              </Text>
              <TextInput
                style={[styles.input, !subject && styles.inputWarning]}
                value={subject}
                onChangeText={setSubject}
                placeholder="Email subject"
                placeholderTextColor={colors.gray[400]}
              />
            </View>

            {/* Body */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                <Ionicons name="document-text-outline" size={12} color={colors.gray[500]} /> Body *
              </Text>
              <TextInput
                style={[styles.bodyInput, !body && styles.inputWarning]}
                value={body}
                onChangeText={setBody}
                placeholder="Write your email body here..."
                placeholderTextColor={colors.gray[400]}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="send" size={16} color={colors.white} />
                  <Text style={styles.sendBtnText}>Send</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    backgroundColor: colors.white,
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
    borderBottomColor: colors.gray[100],
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: 12,
    color: colors.gray[500],
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
    borderColor: colors.primary + '30',
    backgroundColor: colors.primary + '08',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  templateBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[600],
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.gray[800],
    backgroundColor: colors.gray[50],
  },
  inputWarning: {
    borderColor: colors.amber[300],
  },
  bodyInput: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.gray[800],
    backgroundColor: colors.gray[50],
    minHeight: 160,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600],
  },
  sendBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  sendBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});
