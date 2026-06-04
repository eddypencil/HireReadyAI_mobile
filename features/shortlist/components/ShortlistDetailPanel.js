import React, { useState, useRef, useEffect } from 'react';
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
import { colors } from '../../../src/theme';
import { useUser } from '../../../features/auth/context/user.context';

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

function timeAgo(dateString) {
  if (!dateString) return '';
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
}

const TAG_STYLES = {
  'Strong Fit': { bg: colors.emerald[50], text: colors.emerald[700], border: colors.emerald[200] },
  'Needs Review': { bg: colors.amber[50], text: colors.amber[700], border: colors.amber[200] },
  'Leaning hire': { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
};

const VOTE_CONFIG = [
  { value: 'up', label: 'Up', icon: 'thumbs-up', activeBg: colors.emerald[500], inactiveBg: colors.gray[100], inactiveText: colors.gray[500] },
  { value: 'neutral', label: 'Neutral', icon: 'remove', activeBg: colors.gray[500], inactiveBg: colors.gray[100], inactiveText: colors.gray[500] },
  { value: 'down', label: 'Down', icon: 'thumbs-down', activeBg: colors.red[500], inactiveBg: colors.gray[100], inactiveText: colors.gray[500] },
];

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
  const { profile } = useUser();
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

  const scoreBadgeBg = composite_score >= 80 ? colors.emerald[50] : composite_score >= 65 ? colors.amber[50] : colors.gray[50];
  const scoreBadgeText = composite_score >= 80 ? colors.emerald[700] : composite_score >= 65 ? colors.amber[700] : colors.gray[600];
  const scoreBadgeBorder = composite_score >= 80 ? colors.emerald[200] : composite_score >= 65 ? colors.amber[200] : colors.gray[200];

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
          color={isActive ? colors.white : inactiveText}
        />
        <Text style={[styles.voteBtnLabel, { color: isActive ? colors.white : inactiveText }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const panelContent = (
    <View style={[styles.panel, isOverlay && styles.overlayPanel]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerAvatar, { backgroundColor: getAvatarColor(candidate?.full_name) }]}>
            <Text style={styles.headerAvatarText}>{getInitials(candidate?.full_name)}</Text>
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerName} numberOfLines={1}>{candidate?.full_name}</Text>
              {composite_score != null && (
                <View style={[styles.scorePill, { backgroundColor: scoreBadgeBg, borderColor: scoreBadgeBorder }]}>
                  <Text style={[styles.scorePillText, { color: scoreBadgeText }]}>{composite_score}</Text>
                </View>
              )}
            </View>
            <Text style={styles.headerHeadline} numberOfLines={1}>
              {candidate?.headline || candidate?.role}
            </Text>
            <View style={styles.tagRow}>
              {tags.slice(0, 3).map((tag) => {
                const ts = TAG_STYLES[tag] || { bg: colors.gray[100], text: colors.gray[600], border: colors.gray[200] };
                return (
                  <View key={tag} style={[styles.headerTag, { backgroundColor: ts.bg, borderColor: ts.border }]}>
                    <Text style={[styles.headerTagText, { color: ts.text }]}>{tag}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={18} color={colors.gray[400]} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Body */}
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
        {/* YOUR VOTE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Vote</Text>
          {myVote ? (
            <View style={[
              styles.currentVoteBadge,
              {
                backgroundColor: myVote === 'up' ? colors.emerald[50] : myVote === 'down' ? colors.red[50] : colors.gray[50],
                borderColor: myVote === 'up' ? colors.emerald[200] : myVote === 'down' ? colors.red[200] : colors.gray[200],
              },
            ]}>
              <Text style={[
                styles.currentVoteText,
                { color: myVote === 'up' ? colors.emerald[700] : myVote === 'down' ? colors.red[600] : colors.gray[600] },
              ]}>
                You voted <Text style={styles.currentVoteBold}>{myVote}</Text> — tap again to undo
              </Text>
            </View>
          ) : (
            <Text style={styles.noVoteText}>You haven't voted yet.</Text>
          )}
          <View style={styles.voteRow}>
            {VOTE_CONFIG.map(renderVoteButton)}
          </View>
        </View>

        {/* TEAM VOTES */}
        <View style={styles.section}>
          <View style={styles.teamVotesHeader}>
            <Text style={styles.sectionTitle}>Team Votes</Text>
            <Text style={styles.voterCount}>{totalVoters} / ? cast</Text>
          </View>
          {totalVoters > 0 && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(upVotes / Math.max(totalVoters, 1)) * 100}%` }]} />
            </View>
          )}
          <View style={styles.voterList}>
            {votes.length === 0 && <Text style={styles.emptyText}>No votes yet.</Text>}
            {votes.map((v, i) => (
              <View key={v.id || i} style={styles.voterItem}>
                <View style={styles.voterInfo}>
                  <View style={[styles.voterListItemAvatar, { backgroundColor: getAvatarColor(v.profiles?.full_name) }]}>
                    <Text style={styles.voterListItemAvatarText}>{getInitials(v.profiles?.full_name)}</Text>
                  </View>
                  <View>
                    <Text style={styles.voterName}>{v.profiles?.full_name}</Text>
                    <Text style={styles.voterRole}>{v.profiles?.headline || v.profiles?.role}</Text>
                  </View>
                </View>
                <View style={[
                  styles.votePill,
                  {
                    backgroundColor: v.vote === 'up' ? colors.emerald[50] : v.vote === 'down' ? colors.red[50] : colors.gray[100],
                    borderColor: v.vote === 'up' ? colors.emerald[200] : v.vote === 'down' ? colors.red[200] : colors.gray[200],
                  },
                ]}>
                  <Text style={[
                    styles.votePillText,
                    { color: v.vote === 'up' ? colors.emerald[600] : v.vote === 'down' ? colors.red[500] : colors.gray[500] },
                  ]}>
                    {v.vote === 'up' ? '↑ Up' : v.vote === 'down' ? '↓ Down' : '— Neutral'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* AI RATIONALE */}
        <View style={styles.section}>
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <View style={styles.aiTitleRow}>
                <Ionicons name="sparkles" size={14} color={colors.mauveMagic[500]} />
                <Text style={styles.aiTitle}>AI Rationale</Text>
              </View>
              {ai_confidence != null && (
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>Confidence {Math.round(ai_confidence * 100)}%</Text>
                </View>
              )}
            </View>
            <Text style={styles.aiRationaleText}>
              {ai_rationale || 'No AI rationale available for this candidate.'}
            </Text>
          </View>
        </View>

        {/* TEAM NOTES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Notes</Text>
          {notesLoading ? (
            <ActivityIndicator size="small" color={colors.darkAmethyst[500]} style={styles.notesLoader} />
          ) : (
            <View style={styles.notesList}>
              {notes.length === 0 && <Text style={styles.emptyText}>No notes yet. Be the first to leave one.</Text>}
              {notes.map((note) => (
                <View key={note.id} style={styles.noteCard}>
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteAuthor}>{note.profiles?.full_name || 'Team member'}</Text>
                    <View style={styles.noteTime}>
                      <Ionicons name="time-outline" size={11} color={colors.gray[400]} />
                      <Text style={styles.noteTimeText}>{timeAgo(note.created_at)}</Text>
                    </View>
                  </View>
                  <Text style={styles.noteBody}>{note.body}</Text>
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
            placeholder="Leave a note for the hiring team..."
            placeholderTextColor={colors.gray[400]}
            textAlignVertical="top"
          />
          <View style={styles.noteActions}>
            <TouchableOpacity
              onPress={() => setVisibleToTeam(!visibleToTeam)}
              style={styles.visibilityToggle}
            >
              <Ionicons
                name={visibleToTeam ? 'checkbox' : 'square-outline'}
                size={16}
                color={colors.darkAmethyst[500]}
              />
              <Ionicons name="person-check-outline" size={13} color={colors.gray[500]} />
              <Text style={styles.visibilityText}>Visible to hiring team</Text>
            </TouchableOpacity>
            <View style={styles.noteActionBtns}>
              <TouchableOpacity onPress={() => setNoteBody('')}>
                <Text style={styles.cancelBtn}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePostNote}
                disabled={!noteBody.trim() || postingNote}
                style={[styles.postBtn, (!noteBody.trim() || postingNote) && styles.postBtnDisabled]}
              >
                <Ionicons name="send" size={13} color={colors.white} />
                <Text style={styles.postBtnText}>{postingNote ? 'Posting...' : 'Post note'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ACTION BUTTONS */}
      {!is_rejected ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.actions}>
            {showRejectInput ? (
              <View style={styles.rejectInputSection}>
                <Text style={styles.rejectLabel}>Rejection reason (pre-filled from AI):</Text>
                <TextInput
                  style={styles.rejectInput}
                  multiline
                  numberOfLines={3}
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  textAlignVertical="top"
                />
                <View style={styles.rejectActions}>
                  <TouchableOpacity onPress={() => setShowRejectInput(false)} style={styles.cancelRejectBtn}>
                    <Text style={styles.cancelRejectText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleReject}
                    disabled={rejecting}
                    style={styles.confirmRejectBtn}
                  >
                    <Text style={styles.confirmRejectText}>
                      {rejecting ? 'Rejecting...' : 'Confirm reject'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  onPress={() => onAdvanceToOffer(app.id)}
                  style={styles.advanceBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chevron-up" size={16} color={colors.white} />
                  <Text style={styles.advanceBtnText}>Advance to offer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowRejectInput(true)}
                  style={styles.rejectBtn}
                >
                  <Text style={styles.rejectBtnText}>Move to rejected</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.rejectedBanner}>
          <Text style={styles.rejectedBannerTitle}>This candidate was rejected</Text>
          {rejection_reason && (
            <Text style={styles.rejectedBannerReason}>{rejection_reason}</Text>
          )}
        </View>
      )}
    </View>
  );

  if (isOverlay) {
    return (
      <Modal visible transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlayBackdrop}>
          <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />
          {panelContent}
        </View>
      </Modal>
    );
  }

  return panelContent;
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.white,
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderLeftColor: colors.gray[100],
  },
  overlayPanel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 380,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  overlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    backgroundColor: colors.white,
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
    color: colors.white,
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
    color: colors.gray[900],
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
    color: colors.gray[500],
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
    borderBottomColor: colors.gray[100],
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.gray[400],
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
    color: colors.gray[400],
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
    color: colors.gray[500],
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray[100],
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.emerald[400],
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
    color: colors.white,
  },
  voterName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[800],
  },
  voterRole: {
    fontSize: 10,
    color: colors.gray[400],
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
    color: colors.gray[400],
  },
  aiCard: {
    backgroundColor: colors.mauveMagic[50],
    borderWidth: 1,
    borderColor: colors.mauveMagic[200],
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
    color: colors.mauveMagic[600],
    textTransform: 'uppercase',
  },
  confidenceBadge: {
    backgroundColor: colors.mauveMagic[100],
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.mauveMagic[700],
  },
  aiRationaleText: {
    fontSize: 13,
    color: colors.gray[700],
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
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.gray[100],
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
    color: colors.gray[800],
  },
  noteTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  noteTimeText: {
    fontSize: 10,
    color: colors.gray[400],
  },
  noteBody: {
    fontSize: 12,
    color: colors.gray[600],
    lineHeight: 17,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.gray[700],
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
    color: colors.gray[500],
  },
  noteActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelBtn: {
    fontSize: 12,
    color: colors.gray[400],
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.darkAmethyst[600],
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
    color: colors.white,
  },
  actions: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    backgroundColor: colors.white,
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
    backgroundColor: colors.darkAmethyst[600],
    borderRadius: 12,
    shadowColor: 'rgba(124, 58, 237, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  advanceBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray[700],
  },
  rejectInputSection: {
    gap: 8,
  },
  rejectLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[500],
  },
  rejectInput: {
    borderWidth: 1,
    borderColor: colors.red[200],
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.gray[700],
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
    borderColor: colors.gray[200],
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelRejectText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray[600],
  },
  confirmRejectBtn: {
    flex: 1,
    paddingVertical: 9,
    backgroundColor: colors.red[500],
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmRejectText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  rejectedBanner: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    backgroundColor: colors.red[50],
  },
  rejectedBannerTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.red[500],
    marginBottom: 2,
  },
  rejectedBannerReason: {
    fontSize: 12,
    color: colors.gray[500],
    lineHeight: 17,
  },
});
