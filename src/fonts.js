import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import {
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_600SemiBold,
  Cairo_700Bold,
  Cairo_800ExtraBold,
  Cairo_900Black,
} from '@expo-google-fonts/cairo';

const fontConfig = {
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_600SemiBold,
  Cairo_700Bold,
  Cairo_800ExtraBold,
  Cairo_900Black,
};

export const FONT_FAMILY = 'Cairo_400Regular';
export const FONT_FAMILY_MEDIUM = 'Cairo_500Medium';
export const FONT_FAMILY_SEMIBOLD = 'Cairo_600SemiBold';
export const FONT_FAMILY_BOLD = 'Cairo_700Bold';
export const FONT_FAMILY_EXTRABOLD = 'Cairo_800ExtraBold';
export const FONT_FAMILY_BLACK = 'Cairo_900Black';

export function useCairoFonts() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        await Font.loadAsync(fontConfig);
        setLoaded(true);
      } catch (e) {
        setError(e);
      }
    }
    load();
  }, []);

  return [loaded, error];
}
