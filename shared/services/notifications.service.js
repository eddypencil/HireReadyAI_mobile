// shared/services/notifications.service.js
//
// Handles everything related to Expo push notifications:
//   1. registerAndSavePushToken  — request permission, get token, save to Supabase
//   2. sendPushNotification      — call the Supabase edge function to deliver a notification
//
// Works fully in Expo Go (free account). No native build required.

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { supabase } from "./supabase";

// Configure how notifications are shown while the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Requests push notification permission, retrieves the Expo push token,
 * and saves it to the `profiles` table so the server can send notifications.
 *
 * Safe to call multiple times — will silently skip if already registered
 * or if permission is denied.
 *
 * @param {string} userId — the authenticated user's profile id
 */
export async function registerAndSavePushToken(userId) {
  console.log("[Notifications] registerAndSavePushToken called for user:", userId);
  if (!userId) {
    console.log("[Notifications] Skipping — no userId provided");
    return;
  }

  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log("[Notifications] Skipping — not a physical device");
    return;
  }

  try {
    console.log("[Notifications] Checking permissions...");
    // Request permission (shows OS prompt on first call)
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log("[Notifications] Existing permission status:", existingStatus);
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      console.log("[Notifications] Requesting permissions...");
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    console.log("[Notifications] Final permission status:", finalStatus);
    if (finalStatus !== "granted") {
      console.log("[Notifications] Permission not granted, skipping token registration");
      return;
    }

    // Android requires a notification channel
    if (Platform.OS === "android") {
      console.log("[Notifications] Setting up Android notification channel...");
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#6C47FF",
      });
    }

    // Get the Expo push token
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId ??
      "ee6a48b2-f123-491b-9d1f-f225c829630b";

    console.log("[Notifications] Getting Expo push token with projectId:", projectId);
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const token = tokenData.data;

    if (!token) {
      console.warn("[Notifications] Failed to get push token from Expo");
      return;
    }

    console.log("[Notifications] Expo push token obtained:", token);

    // Save token to profiles table
    console.log("[Notifications] Saving token to profiles table in Supabase...");
    const { data, error } = await supabase
      .from("profiles")
      .update({ expo_push_token: token })
      .eq("id", userId)
      .select();

    if (error) {
      console.warn("[Notifications] Failed to save push token to Supabase:", error.message, error.details);
    } else {
      console.log("[Notifications] Push token successfully saved to Supabase! Row updated:", data);
    }
  } catch (err) {
    console.warn("[Notifications] Error during token registration:", err.message);
  }
}

/**
 * Sends a push notification by calling the Supabase edge function.
 * Fire-and-forget — errors are logged but not thrown so they never
 * block the main action (applying, moving stage, etc.).
 *
 * @param {Object} params
 * @param {string} params.token   - Expo push token of the recipient
 * @param {string} params.title   - Notification title
 * @param {string} params.body    - Notification body text
 * @param {Object} [params.data]  - Optional extra data payload
 */
export async function sendPushNotification({ token, title, body, data = {} }) {
  if (!token) return;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/send-push-notification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ token, title, body, data }),
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.warn("[Notifications] Edge function error:", errBody);
    }
  } catch (err) {
    console.warn("[Notifications] sendPushNotification failed:", err.message);
  }
}
