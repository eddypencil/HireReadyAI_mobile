---
name: "moai-domain-react-native-uiux"
description: "React Native UI/UX Expert - Mobile design systems, component architecture, accessibility, navigation, theming, performance, and Expo best practices"
version: 3.0.0
category: "domain"
modularized: true
user-invocable: false
tags:
  - react-native
  - expo
  - mobile-ui
  - mobile-ux
  - design-system
  - accessibility
  - navigation
  - theming
  - performance
  - reanimated
updated: 2026-06-05
status: "active"

allowed-tools:
  - Read
  - Grep
  - Glob
  - mcp__context7__resolve-library-id
  - mcp__context7__get-library-docs

triggers:
  keywords:
    - react native
    - expo
    - mobile ui
    - mobile ux
    - accessibility
    - voiceover
    - talkback
    - navigation
    - react navigation
    - expo router
    - dark mode
    - theming
    - design tokens
    - safe area
    - gesture
    - reanimated
    - flashlist
    - mobile performance
    - onboarding
    - bottom tabs
    - drawer
    - keyboard avoidance
    - haptics
    - responsive mobile
    - design system
    - component library

---

# Quick Reference

Enterprise-grade React Native UI/UX foundation focused on scalable design systems, mobile accessibility, navigation architecture, theming, performance optimization, and modern Expo development.

Unified Capabilities:

* Design Systems: Design tokens, semantic colors, typography scales, spacing systems
* Component Architecture: Shared UI, feature UI, screen composition, reusable primitives
* Accessibility: VoiceOver, TalkBack, Dynamic Type, accessibility labels and roles
* Navigation: React Navigation 7, Expo Router, deep linking, auth flows
* Theming: Light mode, dark mode, brand themes, token-driven styling
* Performance: FlashList, memoization, image optimization, virtualization
* Mobile UX: Gestures, pull-to-refresh, skeleton states, offline states, haptics

When to Use:

* Building production-grade React Native applications
* Creating reusable mobile design systems
* Improving accessibility compliance
* Implementing scalable navigation architecture
* Designing recruiter, marketplace, SaaS, and enterprise mobile applications
* Optimizing rendering and mobile performance

Module Organization:

* Components: modules/component-architecture.md
* Design System: modules/design-system.md
* Accessibility: modules/accessibility.md
* Navigation: modules/navigation.md
* Theming: modules/theming.md
* Mobile UX: modules/mobile-ux.md
* Performance: modules/performance.md
* Icons: modules/icons.md
* Examples: examples.md
* Reference: reference.md

***

# Implementation Guide

## Foundation Stack

Core Technologies:

* React Native 0.82+
* Expo SDK
* TypeScript 5.x
* React Navigation 7
* React Native Reanimated
* React Native Gesture Handler
* React Native Safe Area Context
* Expo Router (optional)
* Zustand or Context API
* FlashList for large datasets

Recommended UI Stack:

* Native components first
* Design token architecture
* Shared UI primitives
* Lucide React Native
* Expo Vector Icons
* React Native Paper (optional)
* Tamagui (optional)
* NativeWind (optional)

***

# Quick Decision Guide

For design systems:

* Use modules/design-system.md
* Implement semantic tokens
* Avoid hardcoded colors

For accessibility:

* Use modules/accessibility.md
* VoiceOver and TalkBack support required
* Accessibility labels required

For navigation:

* Use modules/navigation.md
* React Navigation preferred
* Expo Router for file-based routing

For performance:

* Use modules/performance.md
* FlashList for large lists
* Optimize image rendering

For theming:

* Use modules/theming.md
* Appearance API
* Token-driven themes

***

# Design System Principles

## Design Token First

All design decisions should originate from tokens.

Example Categories:

* Colors
* Typography
* Spacing
* Radius
* Elevation
* Motion
* Opacity
* Shadows

Use:

primary.500

Instead of:

#3B82F6

Use:

spacing.md

Instead of:

16

Benefits:

* Theme switching
* Brand customization
* Consistency
* Multi-platform scalability

***

## Component Architecture

Preferred Structure:

src/

shared/
ui/
Button/
Input/
Card/
Avatar/
Modal/

features/
auth/
jobs/
companies/
recruiter/

screens/

Principles:

* Shared UI contains reusable primitives
* Features contain business-specific components
* Screens orchestrate features
* Avoid duplicating components

***

## Mobile UX Principles

Mobile-first interaction design.

Required Patterns:

* Touch-friendly targets
* Bottom navigation
* Swipe gestures
* Pull-to-refresh
* Infinite scrolling
* Skeleton loading
* Empty states
* Offline states
* Error recovery

Minimum Touch Target:

44x44 points

Avoid:

* Tiny buttons
* Hidden actions
* Hover-dependent interactions

***

# Accessibility Standards

Accessibility is mandatory.

Required:

* accessibilityLabel
* accessibilityHint
* accessibilityRole
* allowFontScaling
* keyboard navigation support where applicable

Example:

<TouchableOpacity
accessibilityRole="button"
accessibilityLabel="Apply for Job"
accessibilityHint="Submits your application"

>

VoiceOver Support:

* iOS VoiceOver
* Android TalkBack

Text:

* Support Dynamic Type
* Respect system font scaling

Color:

* WCAG AA contrast minimum
* Do not rely solely on color

Focus:

* Visible focus state
* Logical reading order

***

# Navigation Standards

Supported:

* React Navigation
* Expo Router

Preferred Patterns:

Authentication:

Auth Stack

Main App:

Bottom Tabs

Details:

Native Stack

Complex Apps:

Drawer + Tabs

Required Features:

* Deep Linking
* Protected Routes
* Session Persistence
* Navigation Analytics

Avoid:

* Excessive nesting
* Deep navigation chains

***

# Theme System

Required:

* Light Mode
* Dark Mode
* System Theme Support

Implementation:

Appearance API

useColorScheme()

Theme Structure:

theme/

colors.ts
spacing.ts
typography.ts
radius.ts

Rules:

* No hardcoded colors
* All components consume theme tokens
* Theme switching must be instant

***

# Icon System

Preferred Libraries:

1. Lucide React Native
2. Expo Vector Icons
3. Phosphor React Native

Guidelines:

* Consistent icon size scale
* Semantic icon usage
* Avoid mixing icon styles

Sizes:

16
20
24
32

Use tokenized icon sizing.

***

# Performance Standards

Required:

* React.memo for expensive components
* useCallback for event handlers
* useMemo for heavy computations
* FlashList for large collections

Images:

* Lazy loading
* Caching
* Proper sizing

Lists:

Use FlashList when:

* More than 50 items
* Infinite scrolling
* Complex rows

Avoid:

* Nested FlatLists
* Inline object creation
* Unnecessary re-renders

Monitor:

* FPS
* Memory usage
* Bundle size
* Startup time

***

# Recruiter Platform UX Guidelines

Suitable for:

* Applicant Tracking Systems
* Recruiting Platforms
* Hiring Dashboards
* HR SaaS Products

Patterns:

* Candidate pipelines
* Kanban workflows
* Search and filtering
* Saved views
* Interview scheduling
* Application tracking

Required States:

* Loading
* Empty
* Error
* Success

Every screen must support all four.

***

# Best Practices

Required Practices:

* Use TypeScript everywhere
* Follow feature-based architecture
* Use design tokens exclusively
* Support dark mode
* Support accessibility labels
* Test VoiceOver and TalkBack
* Use safe area insets
* Provide loading states
* Handle offline scenarios
* Optimize large lists

Avoid:

* Hardcoded values
* Inline styles for reusable components
* Business logic in screens
* Large monolithic components
* Untyped props
* Navigation duplication

***

# Works Well With

Skills:

* moai-lang-typescript
* moai-domain-react-native
* moai-domain-expo
* moai-domain-accessibility
* moai-domain-performance

Agents:

* code-mobile
* code-react-native
* design-mobile
* core-quality

Commands:

* /moai:analyze-ui
* /moai:generate-screen
* /moai:review-accessibility
* /moai:review-performance

***

# Resources

React Native:
https://reactnative.dev

Expo:
https://expo.dev

React Navigation:
https://reactnavigation.org

Reanimated:
https://docs.swmansion.com/react-native-reanimated

FlashList:
https://shopify.github.io/flash-list

Lucide React Native:
https://lucide.dev

Expo Vector Icons:
https://docs.expo.dev/guides/icons

Accessibility:
https://reactnative.dev/docs/accessibility

Apple Human Interface Guidelines:
https://developer.apple.com/design/human-interface-guidelines

Material Design:
https://m3.material.io

***
