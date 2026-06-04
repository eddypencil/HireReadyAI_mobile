import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../src/theme";
import { useCompany } from "./CompanyLayout";

export default function CompanyProfile() {
  const { company, members, onInvite, frameworkFile, setFrameworkFile } = useCompany();
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");

  const handleInviteSubmit = () => {
    if (!memberName || !memberEmail) return;
    onInvite(memberName, memberEmail);
    setMemberName("");
    setMemberEmail("");
  };

  const handleFilePick = () => {
    setFrameworkFile("framework-" + Date.now() + ".pdf");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Company Profile Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Company Profile</Text>
        <Text style={styles.cardSubtitle}>
          Manage your workspace details and branding.
        </Text>

        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {company?.name?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>

          <View style={styles.fieldsGrid}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Company Name</Text>
              <TextInput
                style={styles.fieldInput}
                value={company?.name || ""}
                editable={false}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Industry</Text>
              <TextInput
                style={styles.fieldInput}
                value={company?.industry || ""}
                editable={false}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Company Size</Text>
              <TextInput
                style={styles.fieldInput}
                value={
                  company?.size
                    ? `${company.size.toLocaleString()} employees`
                    : ""
                }
                editable={false}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Created At</Text>
              <TextInput
                style={styles.fieldInput}
                value={
                  company?.created_at
                    ? new Date(company.created_at).toLocaleDateString()
                    : ""
                }
                editable={false}
              />
            </View>
          </View>
        </View>
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

        <View style={styles.memberList}>
          {(members || []).map((member, i) => (
            <View key={member.id || i} style={styles.memberRow}>
              <View style={styles.memberInfo}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {member.profiles?.full_name
                      ? member.profiles.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "?"}
                  </Text>
                </View>
                <View style={styles.memberDetails}>
                  <Text style={styles.memberName} numberOfLines={1}>
                    {member.profiles?.full_name || "Unknown"}
                  </Text>
                  <Text style={styles.memberRole} numberOfLines={1}>
                    {member.profiles?.role || "Team Member"}
                  </Text>
                </View>
              </View>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {member.profiles?.role || "Team Member"}
                </Text>
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.darkAmethyst[950],
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: colors.gray[400],
    marginBottom: 20,
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
    gap: 12,
  },
  field: {},
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.gray[500],
    marginBottom: 4,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.gray[700],
    backgroundColor: colors.gray[50],
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
  roleBadge: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.gray[600],
  },
});
