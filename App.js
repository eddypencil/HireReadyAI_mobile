import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import { ThemeProvider } from './shared/context/ThemeContext';
import { I18nProvider } from './shared/context/I18nContext';
import { SidebarProvider } from './shared/context/SidebarContext';
import { ThemedAlertProvider } from './shared/context/ThemedAlertContext';
import { useCairoFonts } from './src/fonts';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [fontsLoaded, fontError] = useCairoFonts();

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#061826' }}>
        <ActivityIndicator size="large" color="#468faf" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nProvider>
          <ThemeProvider>
            <ThemedAlertProvider>
              <SidebarProvider>
                <StatusBar style="auto" />
                <AppNavigator />
              </SidebarProvider>
            </ThemedAlertProvider>
          </ThemeProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
