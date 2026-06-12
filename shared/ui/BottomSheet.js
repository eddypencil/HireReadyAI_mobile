import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/I18nContext';

export default function BottomSheet({ visible, onClose, title, subtitle, children, closeButton, footer }) {
  const { theme } = useTheme();
  const { language } = useTranslation();
  const isRtl = language === 'ar';
  const insets = useSafeAreaInsets();
  const c = theme.colors;
  const styles = createStyles(c, insets);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          <View style={styles.dragHandleArea}>
            <View style={styles.dragHandle} />
          </View>

          {(title || subtitle || closeButton) && (
            <View style={[styles.header, isRtl && styles.rowReverse]}>
              <View style={styles.headerText}>
                {title && <Text style={[styles.title, isRtl && styles.textRight]}>{title}</Text>}
                {subtitle && <Text style={[styles.subtitle, isRtl && styles.textRight]}>{subtitle}</Text>}
              </View>
              {closeButton}
            </View>
          )}

          <ScrollView
            style={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {children}
          </ScrollView>

          {footer && (
            <View style={styles.footer}>
              {footer}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(c, insets) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      flex: 1,
      backgroundColor: `${c.foreground}66`,
    },
    sheet: {
      backgroundColor: c.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '85%',
    },
    dragHandleArea: {
      alignItems: 'center',
      paddingVertical: 10,
    },
    dragHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: 20,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: c.foreground,
    },
    subtitle: {
      fontSize: 12,
      color: c['muted-foreground'],
      marginTop: 2,
    },
    body: {
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingHorizontal: 20,
      paddingVertical: 14,
      paddingBottom: Math.max(insets.bottom, 14),
      backgroundColor: c.card,
    },
    rowReverse: { flexDirection: 'row-reverse' },
    textRight: { textAlign: 'right' },
  });
}
