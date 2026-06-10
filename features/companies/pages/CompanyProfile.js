import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { useCompany } from "./CompanyLayout";
import { updateCompany } from "../services/companies.service";
import { uploadLogo, uploadCover } from "../services/storage.service";
import {
  removeMembership,
  updateMembershipPermission,
} from "../services/memberships.service";
import { MEMBERSHIP_PERMISSION } from "../../../shared/constants/enums";

export default function CompanyProfile() {
  const {
    company,
    members,
    onInvite,
    onMembersChange,
    onCompanyUpdate,
    frameworkFile,
    setFrameworkFile,
    permission,
  } = useCompany();
  const { theme } = useTheme();
  const colors = theme.colors;
  const { t } = useTranslation();
  const styles = createStyles(colors);
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    industry: "",
    size: "",
    location: "",
    founding_date: "",
    description: "",
    culture: "",
    benefits: "",
    cover_url: "",
    logo_url: "",
    website_url: "",
    linkedin_url: "",
    twitter_url: "",
  });

  const isHrManager = permission === MEMBERSHIP_PERMISSION.hrManager;

  const pendingMembers = (members || []).filter(
    (m) => m.recruiter_permissions === MEMBERSHIP_PERMISSION.pending,
  );
  const activeMembers = (members || []).filter(
    (m) => m.recruiter_permissions !== MEMBERSHIP_PERMISSION.pending,
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
        MEMBERSHIP_PERMISSION.recruiter,
      );
      onMembersChange((prev) =>
        prev.map((m) => (m.id === membership.id ? updated : m)),
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
      const updated = await updateMembershipPermission(
        membershipId,
        newPermission,
      );
      onMembersChange((prev) =>
        prev.map((m) => (m.id === membershipId ? updated : m)),
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
      cover_url: company?.cover_url || "",
      logo_url: company?.logo_url || "",
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
        cover_url: editForm.cover_url,
        logo_url: editForm.logo_url,
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
    if (perm === MEMBERSHIP_PERMISSION.hrManager)
      return colors.darkAmethyst[600];
    if (perm === MEMBERSHIP_PERMISSION.recruiter)
      return colors.darkAmethyst[500];
    if (perm === MEMBERSHIP_PERMISSION.pending) return colors.amber[500];
    return colors.gray[500];
  };

  const handlePickLogo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Allow access to your photo library to change the logo.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.[0]) return;
      setUploading(true);
      const url = await uploadLogo(company.id, result.assets[0].uri);
      const updated = await updateCompany(company.id, { logo_url: url });
      onCompanyUpdate(updated);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePickCover = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Allow access to your photo library to change the cover.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.[0]) return;
      setUploading(true);
      const url = await uploadCover(company.id, result.assets[0].uri);
      const updated = await updateCompany(company.id, { cover_url: url });
      onCompanyUpdate(updated);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setUploading(false);
    }
  };

  const Field = ({
    label,
    value,
    editing: isFieldEditing,
    onChange,
    multiline,
    small,
  }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isFieldEditing ? (
        <TextInput
          style={[
            styles.fieldInput,
            styles.fieldInputEditing,
            multiline && styles.fieldTextArea,
          ]}
          value={value}
          onChangeText={onChange}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
        />
      ) : (
        <View style={styles.fieldValue}>
          <Text
            style={styles.fieldValueText}
            numberOfLines={multiline ? undefined : 1}
          >
            {value || (multiline ? "" : "-")}
          </Text>
        </View>
      )}
    </View>
  );

  const hasCover = !!company?.cover_url;
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Cover Image */}
      <View style={styles.coverWrap}>
        {uploading ? (
          <View style={styles.coverPlaceholder}>
            <ActivityIndicator size="large" color={colors.darkAmethyst[400]} />
          </View>
        ) : editing ? (
          <TouchableOpacity style={styles.coverEditWrap} onPress={handlePickCover} activeOpacity={0.7}>
            {hasCover && <Image source={{ uri: company.cover_url }} style={styles.coverImg} />}
            <View style={styles.coverEditOverlay}>
              <Ionicons name="camera-outline" size={28} color={colors.white} />
              <Text style={styles.uploadOverlayText}>Upload Cover</Text>
            </View>
          </TouchableOpacity>
        ) : hasCover ? (
          <TouchableOpacity style={{ flex: 1 }} onPress={handlePickCover} activeOpacity={0.9}>
            <Image source={{ uri: company.cover_url }} style={styles.coverImg} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.coverPlaceholder} onPress={handlePickCover} activeOpacity={0.9}>
            <View style={styles.coverEmptyIcon}>
              <Ionicons name="image-outline" size={40} color={colors.darkAmethyst[300]} />
            </View>
          </TouchableOpacity>
        )}

        {/* Edit button in top right */}
        {isHrManager && !editing && (
          <TouchableOpacity style={styles.editTopBtn} onPress={handleEditStart}>
            <Ionicons name="pencil" size={18} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>

      {/* Logo */}
      <View style={styles.logoWrap}>
        {uploading ? (
          <View style={styles.logoSquare}>
            <ActivityIndicator size="small" color={colors.darkAmethyst[600]} />
          </View>
        ) : editing ? (
          <TouchableOpacity onPress={handlePickLogo} activeOpacity={0.7}>
            {company?.logo_url ? (
              <Image source={{ uri: company.logo_url }} style={[styles.logoSquare, styles.logoSquareImg]} />
            ) : (
              <View style={styles.logoSquare}>
                <Text style={styles.logoLetter}>
                  {company?.name?.charAt(0).toUpperCase() || "?"}
                </Text>
              </View>
            )}
            <View style={styles.logoOverlay}>
              <Ionicons name="camera-outline" size={18} color={colors.white} />
              <Text style={styles.logoOverlayText}>Upload Logo</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handlePickLogo} activeOpacity={0.8}>
            {company?.logo_url ? (
              <Image source={{ uri: company.logo_url }} style={[styles.logoSquare, styles.logoSquareImg]} />
            ) : (
              <View style={styles.logoSquare}>
                <Ionicons name="camera-outline" size={24} color={colors.darkAmethyst[400]} />
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Company Profile Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{company?.name}</Text>

        <View style={styles.fieldsGrid}>
          <Field
            label="Industry"
            value={editing ? editForm.industry : company?.industry || ""}
            editing={editing}
            onChange={(v) => setEditForm({ ...editForm, industry: v })}
          />
          <Field
            label="Company Size"
            value={
              editing
                ? editForm.size
                : company?.size
                  ? `${company.size.toLocaleString()} employees`
                  : ""
            }
            editing={editing}
            onChange={(v) => setEditForm({ ...editForm, size: v })}
          />
          <Field
            label="Location"
            value={editing ? editForm.location : company?.location || ""}
            editing={editing}
            onChange={(v) => setEditForm({ ...editForm, location: v })}
          />
          <Field
            label="Founded"
            value={editing ? editForm.founding_date : company?.founding_date || ""}
            editing={editing}
            onChange={(v) => setEditForm({ ...editForm, founding_date: v })}
          />
          <Field
            label="Created"
            value={
              company?.created_at
                ? new Date(company.created_at).toLocaleDateString()
                : ""
            }
            editing={false}
            onChange={() => {}}
          />
        </View>

        <Field
          label="About"
          value={editing ? editForm.description : company?.description || ""}
          editing={editing}
          onChange={(v) => setEditForm({ ...editForm, description: v })}
          multiline
        />
        <Field
          label="Culture"
          value={editing ? editForm.culture : company?.culture || ""}
          editing={editing}
          onChange={(v) => setEditForm({ ...editForm, culture: v })}
          multiline
        />
        <Field
          label="Benefits"
          value={editing ? editForm.benefits : company?.benefits || ""}
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

      {/* Team Members Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("companies.team_members")}</Text>
        <Text style={styles.cardSubtitle}>
          {t("companies.team_members_subtitle")}
        </Text>

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
                    {member.profiles?.full_name || t("companies.unknown_member")}
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
                        const next =
                          member.recruiter_permissions === MEMBERSHIP_PERMISSION.recruiter
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

function createStyles(c) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.gray[50],
    },
    content: {
      paddingBottom: 40,
    },
    coverWrap: {
      height: 200,
      overflow: "hidden",
      position: "relative",
    },
    coverImg: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    coverPlaceholder: {
      flex: 1,
      backgroundColor: c.darkAmethyst[100],
      alignItems: "center",
      justifyContent: "center",
    },
    coverEmptyIcon: {
      alignItems: "center",
      justifyContent: "center",
    },
    coverEditWrap: {
      flex: 1,
      position: "relative",
    },
    coverEditOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.45)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
    },
    uploadOverlayText: {
      color: c.white,
      fontSize: 13,
      fontWeight: "600",
      marginTop: 6,
    },
    logoWrap: {
      marginTop: -40,
      marginLeft: 20,
      zIndex: 2,
      alignSelf: "flex-start",
    },
    logoSquare: {
      width: 80,
      height: 80,
      borderRadius: 16,
      backgroundColor: c.white,
      borderWidth: 3,
      borderColor: c.darkAmethyst[300],
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
      overflow: "hidden",
    },
    logoSquareImg: {
      resizeMode: "contain",
    },
    logoLetter: {
      fontSize: 26,
      fontWeight: "700",
      color: c.darkAmethyst[600],
    },
    logoOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.45)",
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    logoOverlayText: {
      color: c.white,
      fontSize: 9,
      fontWeight: "600",
      marginTop: 2,
    },
    editTopBtn: {
      position: "absolute",
      bottom: 12,
      right: 12,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(0,0,0,0.35)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 3,
    },
    card: {
      backgroundColor: c.white,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.gray[100],
      padding: 20,
      marginHorizontal: 20,
      marginTop: 52,
      marginBottom: 20,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: c.darkAmethyst[950],
      marginBottom: 2,
    },
    cardSubtitle: {
      fontSize: 11,
      color: c.gray[400],
      marginBottom: 16,
    },
    fieldsGrid: {
      gap: 8,
    },
    field: {
      marginBottom: 8,
    },
    fieldLabel: {
      fontSize: 10,
      fontWeight: "600",
      color: c.gray[500],
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    fieldInput: {
      borderWidth: 1,
      borderColor: c.gray[200],
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 7,
      fontSize: 13,
      color: c.darkAmethyst[700],
      backgroundColor: c.white,
    },
    fieldInputEditing: {
      borderColor: c.darkAmethyst[400],
      backgroundColor: c.white,
    },
    fieldTextArea: {
      minHeight: 80,
      textAlignVertical: "top",
    },
    fieldValue: {
      backgroundColor: c.gray[50],
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: c.gray[200],
    },
    fieldValueText: {
      fontSize: 13,
      color: c.darkAmethyst[700],
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
      backgroundColor: c.gray[50],
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      fontSize: 12,
      color: c.darkAmethyst[500],
      borderWidth: 1,
      borderColor: c.gray[200],
      overflow: "hidden",
    },
    editActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: c.gray[100],
    },
    cancelBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: c.gray[200],
    },
    cancelBtnText: {
      fontSize: 12,
      fontWeight: "500",
      color: c.gray[700],
    },
    saveBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      backgroundColor: c.darkAmethyst[600],
    },
    saveBtnText: {
      fontSize: 12,
      fontWeight: "600",
      color: c.white,
    },
    inviteForm: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      backgroundColor: c.gray[50],
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.gray[100],
      marginBottom: 20,
    },
    inviteInput: {
      flex: 1,
      minWidth: 140,
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.gray[200],
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 9,
      fontSize: 12,
      color: c.darkAmethyst[700],
    },
    inviteBtn: {
      backgroundColor: c.darkAmethyst[950],
      paddingHorizontal: 20,
      paddingVertical: 9,
      borderRadius: 6,
      justifyContent: "center",
    },
    inviteBtnText: {
      color: c.white,
      fontSize: 12,
      fontWeight: "600",
    },
    pendingSection: {
      marginBottom: 16,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: c.gray[500],
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    pendingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: c.amber[50],
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.amber[100],
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
      backgroundColor: c.emerald[100],
      alignItems: "center",
      justifyContent: "center",
    },
    acceptBtnText: {
      fontSize: 14,
      color: c.emerald[700],
      fontWeight: "700",
    },
    rejectBtn: {
      width: 28,
      height: 28,
      borderRadius: 6,
      backgroundColor: c.red[100],
      alignItems: "center",
      justifyContent: "center",
    },
    rejectBtnText: {
      fontSize: 14,
      color: c.red[700],
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
      borderBottomColor: c.gray[50],
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
      backgroundColor: c.darkAmethyst[100],
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    memberAvatarText: {
      fontSize: 11,
      fontWeight: "700",
      color: c.darkAmethyst[800],
    },
    memberDetails: {
      flex: 1,
    },
    memberName: {
      fontSize: 13,
      fontWeight: "500",
      color: c.darkAmethyst[950],
    },
    memberRole: {
      fontSize: 11,
      color: c.gray[400],
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
      color: c.gray[400],
      paddingLeft: 4,
    },
  });
}
