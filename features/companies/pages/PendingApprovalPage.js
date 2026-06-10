import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../src/theme";

export default function PendingApprovalPage({ companyName }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <Ionicons name="time-outline" size={18} color={colors.white} />
        </View>
        <Text style={styles.logoText}>HireReadyAI</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.iconCircle}>
          <Ionicons name="time-outline" size={36} color={colors.amber[500]} />
        </View>
        <Text style={styles.title}>Pending Approval</Text>
        <Text style={styles.subtitle}>
          Your membership request for {companyName || "the company"} is under review.
        </Text>
        <Text style={styles.hint}>
          Please wait for an HR Manager to approve your request.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  logoWrap: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.darkAmethyst[600],
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.darkAmethyst[950],
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.amber[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.darkAmethyst[950],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: "center",
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: "center",
  },
});
