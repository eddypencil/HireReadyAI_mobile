// ============================================================================
// OnboardingScreen.js
// Pixel-perfect implementation of the HireReadyAI onboarding screens.
//
// Layout:
//   - Top ~58%: white → light blue gradient, character centered
//   - Bottom ~42%: dark navy panel with SVG wave top edge
//   - Slide 1: no back arrow | Slides 2-3: back arrow top-left
//   - Active dot = wide pill | Inactive = small circle
//   - Slides 1-2: white circle next button | Slide 3: white pill "Get Started"
//
// Image files expected in assets/:
//   character-find-job.png
//   character-apply.png
//   character-hired.png
// ============================================================================

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useTranslation } from '../../../shared/context/I18nContext';
import { FONT_FAMILY, FONT_FAMILY_BOLD, FONT_FAMILY_EXTRABOLD, FONT_FAMILY_MEDIUM, FONT_FAMILY_SEMIBOLD } from '../../../src/fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const NAVY = '#1a3a6b';
const TOP_BG = '#e8f1fb';

const SLIDES = [
  {
    key: 'find',
    title: 'Where Great Hires Happen',
    subtitle: 'AI-powered matching that connects the right candidates with the right companies instantly.',
    image: require('../../../assets/find-job-newest-removebg-preview-Picsart-AiImageEnhancer.png'),
    imageStyle: {width: 400, height: 800, marginLeft: 10},
  },
  {
    key: 'apply',
    title: 'Seamless From\nBoth Sides',
    subtitle: 'Applicants apply in seconds. Recruiters review instantly. ',
    image: require('../../../assets/onboarding-apply-both_v1-Photoroom.png'),
    imageStyle: {width: 355, height: 800, marginBottom: 23},
  },
  {
    key: 'hired',
    title: 'Every Hire Is\na Win-Win',
    subtitle: 'Get the perfect candidate for the job. Find the perfect job for your skills.',
    image: require('../../../assets/onboarding-youre-hired_v1-Photoroom.png'),
    imageStyle: {width: 430, height: 800, marginLeft: 12, marginTop: 30},
  },
];

// ── Wave SVG that creates the curved top edge of the navy panel
// The wave dips in the center and rises on the sides, exactly like screenshots
function WaveTop() {
  const w = width;
  const h = 60; // wave height
  return (
    <Svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: 'absolute', top: -h + 1, left: 0, zIndex: 1 }}
    >
      <Path
        d={`
          M0,${h}
          L0,${h * 0.55}
          Q${w * 0.25},0 ${w * 0.5},${h * 0.48}
          Q${w * 0.75},${h} ${w},${h * 0.3}
          L${w},${h}
          Z
        `}
        fill={NAVY}
      />
    </Svg>
  );
}

export default function OnboardingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { language } = useTranslation();
  const c = theme.colors;
  const [currentIndex, setCurrentIndex] = useState(0);

  const imageFade = useRef(new Animated.Value(1)).current;
  const imageTranslate = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(1)).current;

  const isLast = currentIndex === SLIDES.length - 1;
  const isFirst = currentIndex === 0;
  const slide = SLIDES[currentIndex];

  const goToSlide = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= SLIDES.length) return;
    const dir = nextIndex > currentIndex ? 1 : -1;

    Animated.parallel([
      Animated.timing(imageFade, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(imageTranslate, { toValue: -50 * dir, duration: 150, useNativeDriver: true }),
      Animated.timing(textFade, { toValue: 0, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setCurrentIndex(nextIndex);
      imageTranslate.setValue(50 * dir);

      Animated.parallel([
        Animated.timing(imageFade, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(imageTranslate, { toValue: 0, friction: 7, tension: 80, useNativeDriver: true }),
        Animated.timing(textFade, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem('onboarding_seen', 'true');
    navigation.navigate('Auth');
  };

  // Top area height
  const TOP_HEIGHT = height * 0.56;
  // Navy panel height
  const NAVY_HEIGHT = height - TOP_HEIGHT + 30; // +30 overlap for wave

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={TOP_BG} />

      {/* ════════════════════════════════════════
          TOP AREA — light blue-white background
          ════════════════════════════════════════ */}
      <View style={[styles.topArea, { height: TOP_HEIGHT }]}>

        <View style={[styles.topBar, { paddingTop: 8 }]}>
          {/* Back arrow — hidden on slide 1 */}
          {!isFirst ? (
            <TouchableOpacity
              onPress={() => goToSlide(currentIndex - 1)}
              style={styles.backBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.backArrow}>{language === 'ar' ? '›' : '‹'}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
          
          <View style={{ flex: 1 }} />
            {/* {!isLast && (
              <TouchableOpacity
                onPress={handleFinish}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )} */}
          </View>

        {/* Character illustration — centered in top area */}
        <Animated.View
          style={[
            styles.characterWrapper,
            {
              opacity: imageFade,
              transform: [{ translateX: imageTranslate }],
            },
          ]}
        >
          <Image
            source={slide.image}
            style={[styles.characterImage, slide.imageStyle]} // ← merge base + per-slide
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* ════════════════════════════════════════
          NAVY PANEL — wave top edge + content
          ════════════════════════════════════════ */}
      <View style={[styles.navyPanel, { minHeight: NAVY_HEIGHT, paddingBottom: insets.bottom + 16 }]}>
        {/* SVG wave curve on top of navy panel */}
        <WaveTop />

        {/* Text content */}
        <Animated.View style={[styles.textBlock, { opacity: textFade }]}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
        </Animated.View>

        {/* Dots + button row */}
        <View style={styles.controlsRow}>
          {/* Dot indicators */}
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => goToSlide(i)}>
                <View
                  style={[
                    styles.dot,
                    i === currentIndex ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Next / Get Started */}
          {isLast ? (
            <TouchableOpacity
              style={styles.getStartedBtn}
              onPress={handleFinish}
              activeOpacity={0.85}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => goToSlide(currentIndex + 1)}
              activeOpacity={0.85}
            >
              <Text style={styles.nextArrow}>{language === 'ar' ? '‹' : '›'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: TOP_BG,
  },

  // ── Top area
  topArea: {
    backgroundColor: TOP_BG,
    position: 'relative',
    overflow: 'visible',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: NAVY,
    fontSize: 32,
    fontFamily: FONT_FAMILY,
    marginTop: -7, 
  },
  skipText: {
    fontSize: 15,
    fontFamily: FONT_FAMILY_MEDIUM,
    color: NAVY,
    letterSpacing: 0.2,
  },
 
  characterWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120, 
    paddingBottom: 8,
    zIndex: 2,
  },
  characterImage: {
    // width: 400,
    // height: 800,
  },

  // ── Navy panel
  navyPanel: {
    backgroundColor: NAVY,
    position: 'relative',
    paddingTop: 44, // space below wave
    flex: 1,
  },

  textBlock: {
    paddingHorizontal: 28,
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 50,
    marginBottom: 30,
    lineHeight: 32,
    fontFamily: FONT_FAMILY_EXTRABOLD,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 21,
    letterSpacing: 0.1,
    fontFamily: FONT_FAMILY,
  },

  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    borderRadius: 5,
  },
  dotActive: {
    width: 28,
    height: 9,
    backgroundColor: '#ffffff',
  },
  dotInactive: {
    width: 9,
    height: 9,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },

  // Circle next button — white with navy arrow
  nextBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  nextArrow: {
    color: NAVY,
    fontSize: 32,
    fontFamily: FONT_FAMILY,
    marginTop: -7,
    marginLeft: 3,
  },

  // Pill Get Started button — white outlined
  getStartedBtn: {
    borderWidth: 2,
    borderColor: '#ffffff',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },
  getStartedText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: FONT_FAMILY_BOLD,
  },
});