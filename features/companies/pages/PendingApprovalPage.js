import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/context/ThemeContext";


export default function PendingApprovalPage({ companyName }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const styles = createStyles(c);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <Ionicons name="time-outline" size={18} color={c.white} />
        </View>
        <Text style={styles.logoText}>HireReadyAI</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.iconCircle}>
          <Ionicons name="time-outline" size={36} color={c.amber[500]} />
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

function createStyles(c) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.white,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.gray[100],
    },
    logoWrap: {
      width: 28,
      height: 28,
      borderRadius: 6,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: {
      fontSize: 18,
      fontWeight: '700',
      color: c.foreground,
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
      backgroundColor: c.amber[50],
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: c.foreground,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: c.gray[600],
      textAlign: "center",
      marginBottom: 4,
    },
    hint: {
      fontSize: 12,
      color: c.gray[400],
      textAlign: "center",
    },
  });
}
