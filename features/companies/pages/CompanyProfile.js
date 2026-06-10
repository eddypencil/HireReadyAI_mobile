import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../src/theme";
import { useCompany } from "./CompanyLayout";
import { updateCompany } from "../services/companies.service";
import { removeMembership, updateMembershipPermission } from "../services/memberships.service";
import { MEMBERSHIP_PERMISSION } from "../../../shared/constants/enums";

export default function CompanyProfile() {
  const { company, members, onInvite, onMembersChange, onCompanyUpdate, frameworkFile, setFrameworkFile, permission } = useCompany();
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "", industry: "", size: "", location: "",
    founding_date: "", description: "", culture: "", benefits: "",
    website_url: "", linkedin_url: "", twitter_url: "",
  });

  const isHrManager = permission === MEMBERSHIP_PERMISSION.hrManager;

  const pendingMembers = (members || []).filter(
    (m) => m.recruiter_permissions === MEMBERSHIP_PERMISSION.pending
  );
  const activeMembers = (members || []).filter(
    (m) => m.recruiter_permissions !== MEMBERSHIP_PERMISSION.pending
  );

  const handleInviteSubmit = () => {
    if (!memberName || !memberEmail) return;
    onInvite(memberName, memberEmail);
    setMemberName("");
    setMemberEmail("");
  };

  const handleAccept = async (membership) => {
    try {
      const updated = await updateMembershipPermission(
        membership.id,
        MEMBERSHIP_PERMISSION.recruiter
      );
      onMembersChange((prev) =>
        prev.map((m) => (m.id === membership.id ? updated : m))
      );
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleReject = async (membershipId) => {
    try {
      await removeMembership(membershipId);
      onMembersChange((prev) => prev.filter((m) => m.id !== membershipId));
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleRemove = async (membershipId) => {
    try {
      await removeMembership(membershipId);
      onMembersChange((prev) => prev.filter((m) => m.id !== membershipId));
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleChangePermission = async (membershipId, newPermission) => {
    try {
      const updated = await updateMembershipPermission(membershipId, newPermission);
      onMembersChange((prev) =>
        prev.map((m) => (m.id === membershipId ? updated : m))
      );
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleEditStart = () => {
    setEditForm({
      name: company?.name || "",
      industry: company?.industry || "",
      size: company?.size ? String(company.size) : "",
      location: company?.location || "",
      founding_date: company?.founding_date || "",
      description: company?.description || "",
      culture: company?.culture || "",
      benefits: company?.benefits || "",
      website_url: company?.website_url || "",
      linkedin_url: company?.linkedin_url || "",
      twitter_url: company?.twitter_url || "",
    });
    setEditing(true);
  };

  const handleEditCancel = () => {
    setEditing(false);
  };

  const handleEditSave = async () => {
    if (!company?.id) return;
    try {
      const updated = await updateCompany(company.id, {
        name: editForm.name,
        industry: editForm.industry,
        size: editForm.size ? parseInt(editForm.size, 10) : null,
        location: editForm.location,
        founding_date: editForm.founding_date || null,
        description: editForm.description,
        culture: editForm.culture,
        benefits: editForm.benefits,
        website_url: editForm.website_url,
        linkedin_url: editForm.linkedin_url,
        twitter_url: editForm.twitter_url,
      });
      onCompanyUpdate(updated);
      setEditing(false);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleFilePick = () => {
    setFrameworkFile("framework-" + Date.now() + ".pdf");
  };

  const formatPermission = (perm) => {
    if (perm === MEMBERSHIP_PERMISSION.hrManager) return "HR Manager";
    if (perm === MEMBERSHIP_PERMISSION.recruiter) return "Recruiter";
    if (perm === MEMBERSHIP_PERMISSION.pending) return "Pending";
    return perm || "Unknown";
  };

  const permissionColor = (perm) => {
    if (perm === MEMBERSHIP_PERMISSION.hrManager) return colors.darkAmethyst[600];
    if (perm === MEMBERSHIP_PERMISSION.recruiter) return colors.darkAmethyst[500];
    if (perm === MEMBERSHIP_PERMISSION.pending) return colors.amber[500];
    return colors.gray[500];
  };

  const Field = ({ label, value, editing: isFieldEditing, onChange, multiline, small }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isFieldEditing ? (
        <TextInput
          style={[styles.fieldInput, styles.fieldInputEditing, multiline && styles.fieldTextArea]}
          value={value}
          onChangeText={onChange}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
        />
      ) : (
        <View style={styles.fieldValue}>
          <Text style={styles.fieldValueText} numberOfLines={multiline ? undefined : 1}>
            {value || (multiline ? "" : "-")}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Company Profile Card */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <View>
            <Text style={styles.cardTitle}>Company Profile</Text>
            <Text style={styles.cardSubtitle}>
              Manage your workspace details and branding.
            </Text>
          </View>
          {isHrManager && !editing && (
            <TouchableOpacity style={styles.editBtn} onPress={handleEditStart}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {company?.name?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>

          <View style={styles.fieldsGrid}>
            <Field
              label="Company Name"
              value={editing ? editForm.name : (company?.name || "")}
              editing={editing}
              onChange={(v) => setEditForm({ ...editForm, name: v })}
            />
            <Field
              label="Industry"
              value={editing ? editForm.industry : (company?.industry || "")}
              editing={editing}
              onChange={(v) => setEditForm({ ...editForm, industry: v })}
            />
            <Field
              label="Company Size"
              value={editing ? editForm.size : (company?.size ? `${company.size.toLocaleString()} employees` : "")}
              editing={editing}
              onChange={(v) => setEditForm({ ...editForm, size: v })}
            />
            <Field
              label="Location"
              value={editing ? editForm.location : (company?.location || "")}
              editing={editing}
              onChange={(v) => setEditForm({ ...editForm, location: v })}
            />
            <Field
              label="Founded"
              value={editing ? editForm.founding_date : (company?.founding_date || "")}
              editing={editing}
              onChange={(v) => setEditForm({ ...editForm, founding_date: v })}
            />
            <Field
              label="Created At"
              value={company?.created_at ? new Date(company.created_at).toLocaleDateString() : ""}
              editing={false}
              onChange={() => {}}
            />
          </View>
        </View>

        <Field
          label="About"
          value={editing ? editForm.description : (company?.description || "")}
          editing={editing}
          onChange={(v) => setEditForm({ ...editForm, description: v })}
          multiline
        />

        <Field
          label="Culture"
          value={editing ? editForm.culture : (company?.culture || "")}
          editing={editing}
          onChange={(v) => setEditForm({ ...editForm, culture: v })}
          multiline
        />

        <Field
          label="Benefits"
          value={editing ? editForm.benefits : (company?.benefits || "")}
          editing={editing}
          onChange={(v) => setEditForm({ ...editForm, benefits: v })}
          multiline
        />

        {/* Links */}
        <View style={styles.linksSection}>
          <Text style={styles.fieldLabel}>Links</Text>
          <View style={styles.linksRow}>
            <View style={styles.linkField}>
              <Text style={styles.fieldLabel}>Website</Text>
              {editing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={editForm.website_url}
                  onChangeText={(v) => setEditForm({ ...editForm, website_url: v })}
                  placeholder="https://"
                />
              ) : (
                <Text style={styles.linkText} numberOfLines={1}>
                  {company?.website_url || "-"}
                </Text>
              )}
            </View>
            <View style={styles.linkField}>
              <Text style={styles.fieldLabel}>LinkedIn</Text>
              {editing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={editForm.linkedin_url}
                  onChangeText={(v) => setEditForm({ ...editForm, linkedin_url: v })}
                  placeholder="https://"
                />
              ) : (
                <Text style={styles.linkText} numberOfLines={1}>
                  {company?.linkedin_url || "-"}
                </Text>
              )}
            </View>
            <View style={styles.linkField}>
              <Text style={styles.fieldLabel}>Twitter</Text>
              {editing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={editForm.twitter_url}
                  onChangeText={(v) => setEditForm({ ...editForm, twitter_url: v })}
                  placeholder="https://"
                />
              ) : (
                <Text style={styles.linkText} numberOfLines={1}>
                  {company?.twitter_url || "-"}
                </Text>
              )}
            </View>
          </View>
        </View>

        {editing && (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleEditCancel}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleEditSave}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Competency Framework Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Competency Framework</Text>
        <Text style={styles.cardSubtitle}>
          Upload your grading framework for AI analysis.
        </Text>

        <TouchableOpacity style={styles.uploadArea} onPress={handleFilePick}>
          <Text style={styles.uploadIcon}>UPLOAD</Text>
          <Text style={styles.uploadText}>
            Click to upload your framework file
          </Text>
          <Text style={styles.uploadHint}>PDF or DOCX up to 25MB</Text>
        </TouchableOpacity>

        {frameworkFile && (
          <View style={styles.fileRow}>
            <View style={styles.fileInfo}>
              <Text style={styles.fileIcon}>F</Text>
              <Text style={styles.fileName} numberOfLines={1}>
                {frameworkFile}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Active & Indexed</Text>
            </View>
          </View>
        )}
      </View>

      {/* Team Members Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Team Members</Text>
        <Text style={styles.cardSubtitle}>
          Invite and manage your recruitment team permissions.
        </Text>

        {isHrManager && (
          <View style={styles.inviteForm}>
            <TextInput
              style={styles.inviteInput}
              value={memberName}
              onChangeText={setMemberName}
              placeholder="Full Name"
              placeholderTextColor={colors.gray[400]}
            />
            <TextInput
              style={styles.inviteInput}
              value={memberEmail}
              onChangeText={setMemberEmail}
              placeholder="Email Address"
              placeholderTextColor={colors.gray[400]}
              keyboardType="email-address"
            />
            <TouchableOpacity style={styles.inviteBtn} onPress={handleInviteSubmit}>
              <Text style={styles.inviteBtnText}>+ Invite</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pending Members */}
        {isHrManager && pendingMembers.length > 0 && (
          <View style={styles.pendingSection}>
            <Text style={styles.sectionLabel}>Pending Approval</Text>
            {pendingMembers.map((member) => (
              <View key={member.id} style={styles.pendingRow}>
                <View style={styles.memberInfo}>
                    <View style={[styles.memberAvatar, { backgroundColor: colors.amber[100] }]}>
                    <Text style={[styles.memberAvatarText, { color: colors.amber[700] }]}>
                      {member.profiles?.full_name
                        ? member.profiles.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()
                        : "?"}
                    </Text>
                  </View>
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName} numberOfLines={1}>
                      {member.profiles?.full_name || "Unknown"}
                    </Text>
                    <Text style={styles.memberRole} numberOfLines={1}>
                      {member.profiles?.headline || member.profiles?.role || "Team Member"}
                    </Text>
                  </View>
                </View>
                <View style={styles.pendingActions}>
                  <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(member)}>
                    <Text style={styles.acceptBtnText}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(member.id)}>
                    <Text style={styles.rejectBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Active Members */}
        <View>
          <Text style={styles.sectionLabel}>
            Team Members ({activeMembers.length})
          </Text>
          {activeMembers.map((member) => (
            <View key={member.id} style={styles.memberRow}>
              <View style={styles.memberInfo}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {member.profiles?.full_name
                      ? member.profiles.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()
                      : "?"}
                  </Text>
                </View>
                <View style={styles.memberDetails}>
                  <Text style={styles.memberName} numberOfLines={1}>
                    {member.profiles?.full_name || "Unknown"}
                  </Text>
                  <Text style={styles.memberRole} numberOfLines={1}>
                    {member.profiles?.headline || member.profiles?.role || "Team Member"}
                  </Text>
                </View>
              </View>
              <View style={styles.memberActions}>
                {isHrManager && member.profile_id !== company?.profile_id ? (
                  <View style={styles.permissionRow}>
                    <TouchableOpacity
                      style={[styles.permBadge, { backgroundColor: permissionColor(member.recruiter_permissions) + "20" }]}
                      onPress={() => {
                        const next = member.recruiter_permissions === MEMBERSHIP_PERMISSION.recruiter
                          ? MEMBERSHIP_PERMISSION.hrManager
                          : MEMBERSHIP_PERMISSION.recruiter;
                        handleChangePermission(member.id, next);
                      }}
                    >
                      <Text style={[styles.permBadgeText, { color: permissionColor(member.recruiter_permissions) }]}>
                        {formatPermission(member.recruiter_permissions)}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemove(member.id)}>
                      <Text style={styles.removeIcon}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={[styles.permBadge, { backgroundColor: permissionColor(member.recruiter_permissions) + "20" }]}>
                    <Text style={[styles.permBadgeText, { color: permissionColor(member.recruiter_permissions) }]}>
                      {formatPermission(member.recruiter_permissions)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[100],
    padding: 20,
    marginBottom: 20,
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.darkAmethyst[950],
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: colors.gray[400],
    marginBottom: 16,
  },
  editBtn: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.gray[700],
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.darkAmethyst[50],
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.darkAmethyst[600],
  },
  fieldsGrid: {
    flex: 1,
    gap: 8,
  },
  field: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.gray[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    color: colors.darkAmethyst[700],
    backgroundColor: colors.white,
  },
  fieldInputEditing: {
    borderColor: colors.darkAmethyst[400],
    backgroundColor: colors.white,
  },
  fieldTextArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  fieldValue: {
    backgroundColor: colors.gray[50],
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  fieldValueText: {
    fontSize: 13,
    color: colors.darkAmethyst[700],
  },
  linksSection: {
    marginTop: 12,
  },
  linksRow: {
    flexDirection: "row",
    gap: 8,
  },
  linkField: {
    flex: 1,
  },
  linkText: {
    backgroundColor: colors.gray[50],
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.darkAmethyst[500],
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: "hidden",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.gray[700],
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.darkAmethyst[600],
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.white,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[50],
  },
  uploadIcon: {
    fontSize: 24,
    color: colors.gray[400],
    marginBottom: 8,
    fontWeight: "700",
  },
  uploadText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.gray[700],
    textAlign: "center",
  },
  uploadHint: {
    fontSize: 11,
    color: colors.gray[400],
    marginTop: 4,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    backgroundColor: colors.darkAmethyst[50],
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  fileIcon: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.darkAmethyst[500],
    marginRight: 6,
  },
  fileName: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.darkAmethyst[950],
    flexShrink: 1,
  },
  badge: {
    backgroundColor: colors.emerald[50],
    borderWidth: 1,
    borderColor: colors.emerald[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.emerald[600],
  },
  inviteForm: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    backgroundColor: colors.gray[50],
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[100],
    marginBottom: 20,
  },
  inviteInput: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    color: colors.darkAmethyst[700],
  },
  inviteBtn: {
    backgroundColor: colors.darkAmethyst[950],
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 6,
    justifyContent: "center",
  },
  inviteBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  pendingSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.gray[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pendingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.amber[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.amber[100],
    padding: 10,
    marginBottom: 6,
  },
  pendingActions: {
    flexDirection: "row",
    gap: 6,
  },
  acceptBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.emerald[100],
    alignItems: "center",
    justifyContent: "center",
  },
  acceptBtnText: {
    fontSize: 14,
    color: colors.emerald[700],
    fontWeight: "700",
  },
  rejectBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.red[100],
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtnText: {
    fontSize: 14,
    color: colors.red[700],
    fontWeight: "700",
  },
  memberList: {
    gap: 12,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
    marginBottom: 8,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.darkAmethyst[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  memberAvatarText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.darkAmethyst[800],
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.darkAmethyst[950],
  },
  memberRole: {
    fontSize: 11,
    color: colors.gray[400],
  },
  memberActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  permissionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  permBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  permBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  removeIcon: {
    fontSize: 12,
    color: colors.gray[400],
    paddingLeft: 4,
  },
});
