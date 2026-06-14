import { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";
import AvatarModal from "./AvatarModal";


export default function ApplicantHeader({ fullName, profile_pic, email, phone, joinedDate, userId, onAvatarChange }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const [avatarOpen, setAvatarOpen] = useState(false);

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const formattedJoinDate = joinedDate
    ? new Date(joinedDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "September 2024";

  return (
    <>
      <View style={{
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: c.sidebar,
      }}>
        <View style={{
          padding: 24,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <TouchableOpacity onPress={() => setAvatarOpen(true)}>
              <View style={{ position: "relative" }}>
                {profile_pic ? (
                  <Image
                    source={{ uri: profile_pic }}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      borderWidth: 3,
                      borderColor: `${c['stage-hired']}66`,
                    }}
                  />
                ) : (
                  <View style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: `${c['stage-hired']}40`,
                    borderWidth: 3,
                    borderColor: `${c['stage-hired']}66`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Text style={{
                      fontSize: 22,
                      color: c['destructive-foreground'], fontWeight: '700',
                    }}>{initials}</Text>
                  </View>
                )}
                <View style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: c.accent,
                  borderWidth: 2,
                  borderColor: c.sidebar,
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Text style={{ fontSize: 9, color: c['destructive-foreground'] }}>?</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Text style={{
                  fontSize: 22,
                  color: c['sidebar-foreground'],
                  letterSpacing: -0.3, fontWeight: '700',
                }}>
                  {fullName || "Applicant"}
                </Text>
                <Text style={{
                  backgroundColor: `${c['stage-hired']}40`,
                  borderWidth: 1,
                  borderColor: `${c['stage-hired']}66`,
                  color: c['stage-applied'],
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 2,
                  fontSize: 11,
                  letterSpacing: 0.3,
                  textTransform: "uppercase",
                  overflow: "hidden", fontWeight: '600',
                }}>{t("applicant.applicant_badge")}</Text>
              </View>

              <View style={{ flexDirection: "row", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
                {email && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="mail-outline" size={13} color={c['sidebar-foreground']} />
                    <Text style={{ fontSize: 13, color: c['sidebar-foreground'] }}>{email}</Text>
                  </View>
                )}
                {phone && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="call-outline" size={13} color={c['sidebar-foreground']} />
                    <Text style={{ fontSize: 13, color: c['sidebar-foreground'] }}>{phone}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>

      <AvatarModal
        open={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        userId={userId}
        currentUrl={profile_pic}
        onUpdated={(url) => onAvatarChange?.(url)}
        onDeleted={() => onAvatarChange?.(null)}
      />
    </>
  );
}
