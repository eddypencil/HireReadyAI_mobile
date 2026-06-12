import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useTranslation } from '../../../shared/context/I18nContext';
import { useUser } from '../../../features/auth/context/user.context';
import BottomSheet from '../../../shared/ui/BottomSheet';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(name) {
  const avatarColors = [
    '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b',
    '#f43f5e', '#6366f1', '#14b8a6', '#d946ef',
  ];
  let hash = 0;
  if (name) {
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function timeAgo(dateString, t) {
  if (!dateString) return '';
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return t('shortlist.days_ago', { count: days });
  if (hours > 0) return t('shortlist.hours_ago', { count: hours });
  return t('shortlist.just_now');
}

export default function ShortlistDetailPanel({
  entry,
  myVote,
  notes,
  notesLoading,
  onClose,
  onCastVote,
  onReject,
  onAdvanceToOffer,
  onPostNote,
  isOverlay,
}) {
  const { theme } = useTheme();
  const { t, language } = useTranslation();
  const isRtl = language === 'ar';
  const c = theme.colors;
  const styles = createStyles(c);
  const { profile } = useUser();

  const TAG_STYLES = {
    'Strong Fit': { bg: `${c.success}1a`, text: c.success, border: `${c.success}40` },
    'Needs Review': { bg: `${c.warning}1a`, text: c.warning, border: `${c.warning}40` },
    'Leaning hire': { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
  };

  const VOTE_CONFIG = useMemo(() => [
    { value: 'up', label: t('shortlist.vote_up_pill'), icon: 'thumbs-up', activeBg: c.success, inactiveBg: c.border, inactiveText: c['muted-foreground'] },
    { value: 'neutral', label: t('shortlist.vote_neutral_pill'), icon: 'remove', activeBg: c['muted-foreground'], inactiveBg: c.border, inactiveText: c['muted-foreground'] },
    { value: 'down', label: t('shortlist.vote_down_pill'), icon: 'thumbs-down', activeBg: c.destructive, inactiveBg: c.border, inactiveText: c['muted-foreground'] },
  ], [t]);
  const [noteBody, setNoteBody] = useState('');
  const [visibleToTeam, setVisibleToTeam] = useState(true);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [postingNote, setPostingNote] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const notesEndRef = useRef(null);

  const { applications: app, tags = [], rank } = entry;
  const {
    profiles: candidate,
    shortlist_votes: votes = [],
    composite_score,
    ai_rationale,
    ai_confidence,
    is_rejected,
    rejection_reason,
  } = app;

  useEffect(() => {
    if (showRejectInput && !rejectReason && ai_rationale) {
      setRejectReason(ai_rationale);
    }
  }, [showRejectInput]);

  useEffect(() => {
    if (notesEndRef.current) {
      notesEndRef.current.scrollIntoView ? notesEndRef.current.scrollIntoView({ behavior: 'smooth' }) : null;
    }
  }, [notes]);

  const upVotes = votes.filter((v) => v.vote === 'up').length;
  const totalVoters = votes.length;

  const handlePostNote = async () => {
    if (!noteBody.trim()) return;
    setPostingNote(true);
    await onPostNote(noteBody.trim(), visibleToTeam);
    setNoteBody('');
    setPostingNote(false);
  };

  const handleReject = async () => {
    setRejecting(true);
    await onReject(app.id, rejectReason.trim());
    setRejecting(false);
    setShowRejectInput(false);
  };

  const scoreBadgeBg = composite_score >= 80 ? `${c.success}1a` : composite_score >= 65 ? `${c.warning}1a` : c['surface-muted'];
  const scoreBadgeText = composite_score >= 80 ? c.success : composite_score >= 65 ? c.warning : c['muted-foreground'];
  const scoreBadgeBorder = composite_score >= 80 ? `${c.success}40` : composite_score >= 65 ? `${c.warning}40` : c.border;

  const renderVoteButton = ({ value, label, icon, activeBg, inactiveBg, inactiveText }) => {
    const isActive = myVote === value;
    return (
      <TouchableOpacity
        key={value}
        onPress={() => onCastVote(app.id, isActive ? null : value)}
        activeOpacity={0.7}
        style={[
          styles.voteBtn,
          { backgroundColor: isActive ? activeBg : inactiveBg },
        ]}
      >
        <Ionicons
          name={isActive ? icon : `${icon}-outline`}
          size={14}
          color={isActive ? c['destructive-foreground'] : inactiveText}
        />
        <Text style={[styles.voteBtnLabel, { color: isActive ? c['destructive-foreground'] : inactiveText }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const headerContent = (
    <View style={[isOverlay ? styles.overlaySection : styles.header, isRtl && styles.rowReverse]}>
      <View style={[styles.headerLeft, isRtl && styles.rowReverse]}>
        <View style={[styles.headerAvatar, { backgroundColor: getAvatarColor(candidate?.full_name) }]}>
          <Text style={styles.headerAvatarText}>{getInitials(candidate?.full_name)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <View style={[styles.headerNameRow, isRtl && styles.rowReverse]}>
            <Text style={[styles.headerName, isRtl && styles.textRight]} numberOfLines={1}>{candidate?.full_name}</Text>
            {composite_score != null && (
              <View style={[styles.scorePill, { backgroundColor: scoreBadgeBg, borderColor: scoreBadgeBorder }]}>
                <Text style={[styles.scorePillText, { color: scoreBadgeText }]}>{composite_score}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.headerHeadline, isRtl && styles.textRight]} numberOfLines={1}>
            {candidate?.headline || candidate?.role}
          </Text>
          <View style={[styles.tagRow, isRtl && styles.rowReverse]}>
            {tags.slice(0, 3).map((tag) => {
              const ts = TAG_STYLES[tag] || { bg: c.border, text: c['muted-foreground'], border: c.border };
              return (
                <View key={tag} style={[styles.headerTag, { backgroundColor: ts.bg, borderColor: ts.border }]}>
                  <Text style={[styles.headerTagText, { color: ts.text }]}>{tag}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
      {!isOverlay && (
        <TouchableOpacity onPress={onClose} style={[styles.closeBtn, isRtl && styles.closeBtnRtl]} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={18} color={c['muted-foreground']} />
        </TouchableOpacity>
      )}
    </View>
  );

  const bodySections = (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("shortlist.your_vote")}</Text>
        {myVote ? (
          <View style={[
            styles.currentVoteBadge,
            {
              backgroundColor: myVote === 'up' ? `${c.success}1a` : myVote === 'down' ? `${c.destructive}1a` : c['surface-muted'],
              borderColor: myVote === 'up' ? `${c.success}40` : myVote === 'down' ? `${c.destructive}40` : c.border,
            },
          ]}>
            <Text style={[
              styles.currentVoteText,
              { color: myVote === 'up' ? c.success : myVote === 'down' ? c.destructive : c['muted-foreground'] },
            ]}>
              {t("shortlist.you_voted", { vote: myVote })}
            </Text>
          </View>
        ) : (
          <Text style={styles.noVoteText}>{t("shortlist.not_voted")}</Text>
        )}
        <View style={[styles.voteRow, isRtl && styles.rowReverse]}>
          {VOTE_CONFIG.map(renderVoteButton)}
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.teamVotesHeader, isRtl && styles.rowReverse]}>
          <Text style={[styles.sectionTitle, isRtl && styles.textRight]}>{t("shortlist.team_votes")}</Text>
          <Text style={styles.voterCount}>{t("shortlist.votes_cast", { count: totalVoters })}</Text>
        </View>
        {totalVoters > 0 && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(upVotes / Math.max(totalVoters, 1)) * 100}%` }]} />
          </View>
        )}
        <View style={styles.voterList}>
          {votes.length === 0 && <Text style={styles.emptyText}>{t("shortlist.no_votes")}</Text>}
          {votes.map((v, i) => (
            <View key={v.id || i} style={[styles.voterItem, isRtl && styles.rowReverse]}>
              <View style={styles.voterInfo}>
                <View style={[styles.voterListItemAvatar, { backgroundColor: getAvatarColor(v.profiles?.full_name) }]}> 
                  <Text style={styles.voterListItemAvatarText}>{getInitials(v.profiles?.full_name)}</Text>
                </View>
                <View>
                  <Text style={[styles.voterName, isRtl && styles.textRight]}>{v.profiles?.full_name}</Text>
                  <Text style={[styles.voterRole, isRtl && styles.textRight]}>{v.profiles?.headline || v.profiles?.role}</Text>
                </View>
              </View>
              <View style={[
                styles.votePill,
                {
                  backgroundColor: v.vote === 'up' ? `${c.success}1a` : v.vote === 'down' ? `${c.destructive}1a` : c.border,
                  borderColor: v.vote === 'up' ? `${c.success}40` : v.vote === 'down' ? `${c.destructive}40` : c.border,
                },
              ]}>
                <Text style={[
                  styles.votePillText,
                  { color: v.vote === 'up' ? c.success : v.vote === 'down' ? c.destructive : c['muted-foreground'] },
                ]}>
                  {v.vote === 'up' ? t("shortlist.vote_up_pill") : v.vote === 'down' ? t("shortlist.vote_down_pill") : t("shortlist.vote_neutral_pill")}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiTitleRow}>
              <Ionicons name="sparkles" size={14} color={c['muted-foreground']} />
              <Text style={styles.aiTitle}>{t("shortlist.ai_rationale")}</Text>
            </View>
            {ai_confidence != null && (
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>{t("shortlist.confidence", { percent: Math.round(ai_confidence * 100) })}</Text>
              </View>
            )}
          </View>
          <Text style={styles.aiRationaleText}>
            {ai_rationale || t("shortlist.no_rationale")}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("shortlist.team_notes")}</Text>
        {notesLoading ? (
          <ActivityIndicator size="small" color={c['muted-foreground']} style={styles.notesLoader} />
        ) : (
          <View style={styles.notesList}>
            {notes.length === 0 && <Text style={styles.emptyText}>{t("shortlist.no_notes")}</Text>}
            {notes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <View style={[styles.noteHeader, isRtl && styles.rowReverse]}>
                  <Text style={[styles.noteAuthor, isRtl && styles.textRight]}>{note.profiles?.full_name || t("shortlist.team_member")}</Text>
                  <View style={styles.noteTime}>
                    <Ionicons name="time-outline" size={11} color={c['muted-foreground']} />
                    <Text style={[styles.noteTimeText, isRtl && styles.textRight]}>{timeAgo(note.created_at, t)}</Text>
                  </View>
                </View>
                <Text style={[styles.noteBody, isRtl && styles.textRight]}>{note.body}</Text>
              </View>
            ))}
            <View ref={notesEndRef} />
          </View>
        )}
        <TextInput
          style={styles.noteInput}
          multiline
          numberOfLines={2}
          value={noteBody}
          onChangeText={setNoteBody}
          placeholder={t("shortlist.note_placeholder")}
          placeholderTextColor={c['muted-foreground']}
          textAlignVertical="top"
        />
        <View style={[styles.noteActions, isRtl && styles.rowReverse]}>
          <TouchableOpacity
            onPress={() => setVisibleToTeam(!visibleToTeam)}
            style={[styles.visibilityToggle, isRtl && styles.rowReverse]}
          >
            <Ionicons
              name={visibleToTeam ? 'checkbox' : 'square-outline'}
              size={16}
              color={c['muted-foreground']}
            />
            <Ionicons name="person-check-outline" size={13} color={c['muted-foreground']} />
            <Text style={styles.visibilityText}>{t("shortlist.visible_to_team")}</Text>
          </TouchableOpacity>
          <View style={styles.noteActionBtns}>
            <TouchableOpacity onPress={() => setNoteBody('')}>
              <Text style={styles.cancelBtn}>{t("shortlist.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePostNote}
              disabled={!noteBody.trim() || postingNote}
              style={[styles.postBtn, (!noteBody.trim() || postingNote) && styles.postBtnDisabled]}
            >
              <Ionicons name="send" size={13} color={c['destructive-foreground']} />
              <Text style={styles.postBtnText}>{postingNote ? t("shortlist.posting") : t("shortlist.post_note")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );

  const actionsContent = !is_rejected ? (
    showRejectInput ? (
      <View style={styles.rejectInputSection}>
        <Text style={styles.rejectLabel}>{t("shortlist.rejection_reason_label")}</Text>
        <TextInput
          style={styles.rejectInput}
          multiline
          numberOfLines={3}
          value={rejectReason}
          onChangeText={setRejectReason}
          textAlignVertical="top"
        />
        <View style={[styles.rejectActions, isRtl && styles.rowReverse]}>
          <TouchableOpacity onPress={() => setShowRejectInput(false)} style={styles.cancelRejectBtn}>
            <Text style={styles.cancelRejectText}>{t("shortlist.cancel")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleReject}
            disabled={rejecting}
            style={styles.confirmRejectBtn}
          >
            <Text style={styles.confirmRejectText}>
              {rejecting ? t("shortlist.rejecting") : t("shortlist.confirm_reject")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    ) : (
      <View style={[styles.actionRow, isRtl && styles.rowReverse]}>
        <TouchableOpacity
          onPress={() => onAdvanceToOffer(app.id)}
          style={styles.advanceBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-up" size={16} color={c['destructive-foreground']} />
          <Text style={styles.advanceBtnText}>{t("shortlist.advance_to_offer")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowRejectInput(true)}
          style={styles.rejectBtn}
        >
          <Text style={styles.rejectBtnText}>{t("shortlist.move_to_rejected")}</Text>
        </TouchableOpacity>
      </View>
    )
  ) : (
    <View style={styles.rejectedBanner}>
      <Text style={styles.rejectedBannerTitle}>{t("shortlist.rejected_title")}</Text>
      {rejection_reason && (
        <Text style={styles.rejectedBannerReason}>{rejection_reason}</Text>
      )}
    </View>
  );

  if (isOverlay) {
    return (
      <BottomSheet
        visible
        onClose={onClose}
        closeButton={
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, isRtl && styles.closeBtnRtl]} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={18} color={c['muted-foreground']} />
          </TouchableOpacity>
        }
        footer={actionsContent}
      >
        {headerContent}
        {bodySections}
      </BottomSheet>
    );
  }

  return (
    <View style={styles.panel}>
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
        {headerContent}
        {bodySections}
      </ScrollView>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {actionsContent}
      </KeyboardAvoidingView>
    </View>
  );
}

function createStyles(c) { return StyleSheet.create({
  panel: {
    backgroundColor: c.card,
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderLeftColor: c.border,
  },
  overlaySection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    backgroundColor: c.card,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: c['destructive-foreground'],
  },
  headerInfo: {
    flex: 1,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: c.foreground,
    flexShrink: 1,
  },
  scorePill: {
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 999,
    borderWidth: 1,
  },
  scorePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  headerHeadline: {
    fontSize: 12,
    color: c['muted-foreground'],
    marginTop: 1,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  headerTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    borderWidth: 1,
  },
  headerTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 6,
    marginLeft: 8,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: c['muted-foreground'],
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  currentVoteBadge: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  currentVoteText: {
    fontSize: 13,
    fontWeight: '500',
  },
  currentVoteBold: {
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  noVoteText: {
    fontSize: 12,
    color: c['muted-foreground'],
    marginBottom: 10,
  },
  voteRow: {
    flexDirection: 'row',
    gap: 6,
  },
  voteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
  },
  voteBtnLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  teamVotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  voterCount: {
    fontSize: 11,
    color: c['muted-foreground'],
  },
  progressBar: {
    height: 6,
    backgroundColor: c.border,
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: c.success,
    borderRadius: 3,
  },
  voterList: {
    gap: 8,
  },
  voterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voterListItemAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voterListItemAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: c['destructive-foreground'],
  },
  voterName: {
    fontSize: 12,
    fontWeight: '600',
    color: c.foreground,
  },
  voterRole: {
    fontSize: 10,
    color: c['muted-foreground'],
  },
  votePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  votePillText: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 12,
    color: c['muted-foreground'],
  },
  aiCard: {
    backgroundColor: c['surface-muted'],
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    padding: 14,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  aiTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: c.primary,
    textTransform: 'uppercase',
  },
  confidenceBadge: {
    backgroundColor: c.border,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '700',
    color: c.foreground,
  },
  aiRationaleText: {
    fontSize: 13,
    color: c.foreground,
    lineHeight: 19,
  },
  notesLoader: {
    marginVertical: 10,
  },
  notesList: {
    gap: 10,
    marginBottom: 10,
  },
  noteCard: {
    backgroundColor: c['surface-muted'],
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: c.border,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  noteAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: c.foreground,
  },
  noteTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  noteTimeText: {
    fontSize: 10,
    color: c['muted-foreground'],
  },
  noteBody: {
    fontSize: 12,
    color: c['muted-foreground'],
    lineHeight: 17,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: c.foreground,
    minHeight: 44,
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  visibilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  visibilityText: {
    fontSize: 11,
    color: c['muted-foreground'],
  },
  noteActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelBtn: {
    fontSize: 12,
    color: c['muted-foreground'],
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: c.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  postBtnDisabled: {
    opacity: 0.5,
  },
  postBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: c['destructive-foreground'],
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  advanceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    backgroundColor: c.primary,
    borderRadius: 12,
    shadowColor: `${c.primary}4d`,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  advanceBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: c['destructive-foreground'],
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: c.foreground,
  },
  rejectInputSection: {
    gap: 8,
  },
  rejectLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: c['muted-foreground'],
  },
  rejectInput: {
    borderWidth: 1,
    borderColor: `${c.destructive}40`,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: c.foreground,
    minHeight: 60,
  },
  rejectActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelRejectBtn: {
    flex: 1,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelRejectText: {
    fontSize: 13,
    fontWeight: '500',
    color: c['muted-foreground'],
  },
  confirmRejectBtn: {
    flex: 1,
    paddingVertical: 9,
    backgroundColor: c.destructive,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmRejectText: {
    fontSize: 13,
    fontWeight: '600',
    color: c['destructive-foreground'],
  },
  rejectedBanner: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: c.border,
    backgroundColor: `${c.destructive}1a`,
  },
  rejectedBannerTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: c.destructive,
    marginBottom: 2,
  },
  rejectedBannerReason: {
    fontSize: 12,
    color: c['muted-foreground'],
    lineHeight: 17,
  },
  closeBtnRtl: {
    marginLeft: 0,
    marginRight: 8,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  textRight: { textAlign: 'right' },
}); }
