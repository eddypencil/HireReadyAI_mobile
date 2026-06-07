import { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../src/theme";
import AvatarModal from "./AvatarModal";

export default function ApplicantHeader({ fullName, profile_pic, email, phone, joinedDate, userId, onAvatarChange }) {
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
        background: "linear-gradient(135deg, #012a4a 0%, #01497c 60%, #2a6f97 100%)",
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: colors.darkAmethyst[800],
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
                      borderColor: "rgba(70,143,175,0.4)",
                    }}
                  />
                ) : (
                  <View style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: "rgba(70,143,175,0.25)",
                    borderWidth: 3,
                    borderColor: "rgba(70,143,175,0.4)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Text style={{
                      fontSize: 22,
                      fontWeight: "700",
                      color: colors.surface,
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
                  backgroundColor: colors.accent,
                  borderWidth: 2,
                  borderColor: colors.darkAmethyst[800],
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Text style={{ fontSize: 9, color: colors.white }}>✎</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Text style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: colors.white,
                  letterSpacing: -0.3,
                }}>
                  {fullName || "Applicant"}
                </Text>
                <Text style={{
                  backgroundColor: "rgba(70,143,175,0.25)",
                  borderWidth: 1,
                  borderColor: "rgba(70,143,175,0.4)",
                  color: "#89c2d9",
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 2,
                  fontSize: 11,
                  fontWeight: "600",
                  letterSpacing: 0.3,
                  textTransform: "uppercase",
                  overflow: "hidden",
                }}>Applicant</Text>
              </View>

              <View style={{ flexDirection: "row", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
                {email && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="mail-outline" size={13} color="rgba(207,231,242,0.8)" />
                    <Text style={{ fontSize: 13, color: "rgba(207,231,242,0.8)" }}>{email}</Text>
                  </View>
                )}
                {phone && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="call-outline" size={13} color="rgba(207,231,242,0.8)" />
                    <Text style={{ fontSize: 13, color: "rgba(207,231,242,0.8)" }}>{phone}</Text>
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