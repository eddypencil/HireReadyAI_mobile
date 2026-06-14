import { useEffect, useRef } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import { useTheme } from "../../../shared/context/ThemeContext";
import { useTranslation } from "../../../shared/context/I18nContext";

export default function PaymentSuccessModal({ visible, onDismiss }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const { t } = useTranslation();
  const styles = createStyles(c);
  const lottieRef = useRef(null);

  useEffect(() => {
    if (visible && lottieRef.current) {
      lottieRef.current.reset();
      lottieRef.current.play();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <LottieView
            ref={lottieRef}
            source={require("../../../assets/right_mark_celebration.json")}
            autoPlay
            loop={false}
            style={styles.animation}
          />
          <Text style={styles.title}>{t("companies.payment_success_title")}</Text>
          <Text style={styles.message}>{t("companies.payment_success_message")}</Text>
          <TouchableOpacity style={styles.button} onPress={onDismiss}>
            <Text style={styles.buttonText}>{t("companies.payment_success_button")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "center",
      alignItems: "center",
    },
    modal: {
      backgroundColor: c.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: 32,
      paddingHorizontal: 28,
      alignItems: "center",
      marginHorizontal: 40,
    },
    animation: {
      width: 120,
      height: 120,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: c.foreground,
      marginTop: 8,
      textAlign: "center",
    },
    message: {
      fontSize: 14,
      color: c["muted-foreground"],
      textAlign: "center",
      marginTop: 8,
      lineHeight: 20,
    },
    button: {
      backgroundColor: c.primary,
      paddingHorizontal: 40,
      paddingVertical: 12,
      borderRadius: 10,
      marginTop: 24,
    },
    buttonText: {
      color: c.white,
      fontSize: 16,
      fontWeight: '700',
    },
  });
}
