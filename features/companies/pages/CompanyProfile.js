import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import { useCompany } from "./CompanyLayout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CompanyProfile() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
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

  const styles = createStyles(c);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      {/* Company Profile Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("companies.profile_title")}</Text>
        <Text style={styles.cardSubtitle}>
          {t("companies.profile_subtitle")}
        </Text>

        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {company?.name?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>

          <View style={styles.fieldsGrid}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{t("companies.company_name")}</Text>
              <TextInput
                style={styles.fieldInput}
                value={company?.name || ""}
                editable={false}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{t("companies.industry")}</Text>
              <TextInput
                style={styles.fieldInput}
                value={company?.industry || ""}
                editable={false}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{t("companies.company_size")}</Text>
              <TextInput
                style={styles.fieldInput}
                value={
                  company?.size
                    ? t("companies.employees_count", { size: company.size.toLocaleString() })
                    : ""
                }
                editable={false}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{t("companies.created_at")}</Text>
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

      

      {/* Team Members Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("companies.team_members")}</Text>
        <Text style={styles.cardSubtitle}>
          {t("companies.team_members_subtitle")}
        </Text>

        <View style={styles.inviteForm}>
          <TextInput
            style={styles.inviteInput}
            value={memberName}
            onChangeText={setMemberName}
            placeholder={t("companies.name_placeholder")}
            placeholderTextColor={c['muted-foreground']}
          />
          <TextInput
            style={styles.inviteInput}
            value={memberEmail}
            onChangeText={setMemberEmail}
            placeholder={t("companies.email_placeholder")}
            placeholderTextColor={c['muted-foreground']}
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.inviteBtn} onPress={handleInviteSubmit}>
            <Text style={styles.inviteBtnText}>{t("companies.invite_btn")}</Text>
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
                    {member.profiles?.full_name || t("companies.unknown_member")}
                  </Text>
                  <Text style={styles.memberRole} numberOfLines={1}>
                    {member.profiles?.role || t("companies.team_member_role")}
                  </Text>
                </View>
              </View>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {member.profiles?.role || t("companies.team_member_role")}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c['surface-muted'],
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: c.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      padding: 20,
      marginBottom: 20,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: c.foreground,
      marginBottom: 2,
    },
    cardSubtitle: {
      fontSize: 11,
      color: c['muted-foreground'],
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
      backgroundColor: c['surface-muted'],
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 22,
      fontWeight: "700",
      color: c.primary,
    },
    fieldsGrid: {
      flex: 1,
      gap: 12,
    },
    field: {},
    fieldLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: c['muted-foreground'],
      marginBottom: 4,
    },
    fieldInput: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 13,
      color: c.foreground,
      backgroundColor: c['surface-muted'],
    },
    uploadArea: {
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: c.border,
      borderRadius: 12,
      padding: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c['surface-muted'],
    },
    uploadIcon: {
      fontSize: 24,
      color: c['muted-foreground'],
      marginBottom: 8,
      fontWeight: "700",
    },
    uploadText: {
      fontSize: 13,
      fontWeight: "500",
      color: c.foreground,
      textAlign: "center",
    },
    uploadHint: {
      fontSize: 11,
      color: c['muted-foreground'],
      marginTop: 4,
    },
    fileRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 12,
      backgroundColor: c['surface-muted'],
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
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
      color: c['muted-foreground'],
      marginRight: 6,
    },
    fileName: {
      fontSize: 12,
      fontWeight: "500",
      color: c.foreground,
      flexShrink: 1,
    },
    badge: {
      backgroundColor: `${c.success}1a`,
      borderWidth: 1,
      borderColor: `${c.success}40`,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: "700",
      color: c.success,
    },
    inviteForm: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      backgroundColor: c['surface-muted'],
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 20,
    },
    inviteInput: {
      flex: 1,
      minWidth: 140,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 14,
      fontSize: 12,
      color: c.foreground,
    },
    inviteBtn: {
      backgroundColor: c.foreground,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 6,
      justifyContent: "center",
    },
    inviteBtnText: {
      color: c['destructive-foreground'],
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
      borderBottomColor: c['surface-muted'],
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
      backgroundColor: c.border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    memberAvatarText: {
      fontSize: 11,
      fontWeight: "700",
      color: c.foreground,
    },
    memberDetails: {
      flex: 1,
    },
    memberName: {
      fontSize: 13,
      fontWeight: "500",
      color: c.foreground,
    },
    memberRole: {
      fontSize: 11,
      color: c['muted-foreground'],
    },
    roleBadge: {
      backgroundColor: c.border,
      paddingHorizontal: 10,
      paddingVertical: 2,
      borderRadius: 6,
    },
    roleBadgeText: {
      fontSize: 11,
      fontWeight: "500",
      color: c['muted-foreground'],
    },
  });
}
