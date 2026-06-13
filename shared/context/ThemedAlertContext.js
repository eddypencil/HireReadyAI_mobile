import { createContext, useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from './ThemeContext';
import {
  FONT_FAMILY,
  FONT_FAMILY_SEMIBOLD,
  FONT_FAMILY_BOLD,
} from '../../src/fonts';

const ThemedAlertContext = createContext(null);

export function ThemedAlertProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    message: '',
    buttons: [{ text: 'OK' }],
  });

  const alert = useCallback((title, message, buttons) => {
    setConfig({
      title: title || '',
      message: message || '',
      buttons: buttons || [{ text: 'OK' }],
    });
    setVisible(true);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <ThemedAlertContext.Provider value={{ alert }}>
      {children}
      <ThemedAlertModal
        visible={visible}
        title={config.title}
        message={config.message}
        buttons={config.buttons}
        onDismiss={dismiss}
      />
    </ThemedAlertContext.Provider>
  );
}

function ThemedAlertModal({ visible, title, message, buttons, onDismiss }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const styles = createStyles(c);

  const handlePress = useCallback((btn) => {
    const onPress = btn?.onPress;
    onDismiss();
    if (onPress) {
      setTimeout(onPress, 0);
    }
  }, [onDismiss]);

  const isStacked = buttons.length > 2;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={[styles.actions, isStacked && styles.actionsStacked]}>
            {buttons.map((btn, i) => {
              const isCancel = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.button,
                    isStacked && styles.buttonStacked,
                    isCancel && styles.buttonCancel,
                    isDestructive && styles.buttonDestructive,
                  ]}
                  onPress={() => handlePress(btn)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.buttonText,
                    isCancel && styles.buttonTextCancel,
                    isDestructive && styles.buttonTextDestructive,
                  ]}>
                    {btn.text || 'OK'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function useThemedAlert() {
  const ctx = useContext(ThemedAlertContext);
  if (!ctx) throw new Error('useThemedAlert must be used inside ThemedAlertProvider');
  return ctx;
}

function createStyles(c) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: `${c.foreground}66`,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    modal: {
      backgroundColor: c.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
      paddingTop: 28,
      paddingHorizontal: 24,
      paddingBottom: 16,
      maxWidth: 340,
      width: '100%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 10,
    },
    title: {
      fontSize: 18,
      fontFamily: FONT_FAMILY_BOLD,
      color: c.foreground,
      textAlign: 'center',
      marginBottom: 8,
    },
    message: {
      fontSize: 14,
      fontFamily: FONT_FAMILY,
      color: c['muted-foreground'],
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
      width: '100%',
    },
    actionsStacked: {
      flexDirection: 'column',
      gap: 8,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: c.primary,
    },
    buttonStacked: {
      flex: 0,
      width: '100%',
    },
    buttonCancel: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: c.border,
    },
    buttonDestructive: {
      backgroundColor: c.destructive,
    },
    buttonText: {
      fontSize: 15,
      fontFamily: FONT_FAMILY_SEMIBOLD,
      color: c['destructive-foreground'],
    },
    buttonTextCancel: {
      color: c.foreground,
    },
    buttonTextDestructive: {
      color: c['destructive-foreground'],
    },
  });
}
