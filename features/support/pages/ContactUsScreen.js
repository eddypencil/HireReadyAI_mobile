import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Linking,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useUser } from '../../auth/context/user.context';
import { spacing } from '../../../src/theme';
import { useTranslation } from '../../../shared/context/I18nContext';
import { FONT_FAMILY, FONT_FAMILY_BOLD, FONT_FAMILY_EXTRABOLD } from '../../../src/fonts';

const SUPPORT_EMAIL = 'support@hireready.ai';
const SUPPORT_PHONE = '+201234567899';

export default function ContactUsScreen() {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const { profile } = useUser();
    const { t } = useTranslation();
    const c = theme.colors;

    const [formData, setFormData] = useState({
        name: profile?.name || '',
        email: profile?.email || '',
        company: '',
        message: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleCall = () => {
        Linking.openURL(`tel:${SUPPORT_PHONE}`);
    };

    const handleEmail = () => {
        Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.message) {
            Alert.alert(
                t('contact_us.title'),
                t('contact_us.missing_fields')
            );
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const body =
                `Name: ${formData.name}\n` +
                `Email: ${formData.email}\n` +
                `Company: ${formData.company}\n\n` +
                `${formData.message}`;

            const url =
                `mailto:${SUPPORT_EMAIL}` +
                `?subject=${encodeURIComponent('Contact Message')}` +
                `&body=${encodeURIComponent(body)}`;

            const canOpen = await Linking.canOpenURL(url);
            if (!canOpen) throw new Error('No email app found');

            await Linking.openURL(url);

            setSubmitted(true);

            setFormData({
                name: profile?.name || '',
                email: profile?.email || '',
                company: '',
                message: '',
            });

            setTimeout(() => setSubmitted(false), 4000);
        } catch (err) {
            setError(err.message || t('errors.something_wrong'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: c.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.container,
                    { paddingBottom: insets.bottom + 30 },
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >

                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={[styles.badge, { color: c.primary }]}>
                        {t('contact_us.badge')}
                    </Text>

                    <Text style={[styles.title, { color: c.foreground }]}>
                        {t('contact_us.title')}
                    </Text>

                    <Text style={[styles.subtitle, { color: c['muted-foreground'] }]}>
                        {t('contact_us.subtitle')}
                    </Text>
                </View>

                {/* FORM */}
                <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Text style={[styles.label, { color: c.foreground }]}>
                        {t('contact_us.name')}
                    </Text>
                    <TextInput
                        value={formData.name}
                        onChangeText={(v) => handleChange('name', v)}
                        style={[styles.input, { color: c.foreground, borderColor: c.border }]}
                        placeholder={t('contact_us.name_placeholder')}
                        placeholderTextColor={c['muted-foreground']}
                    />

                    <Text style={[styles.label, { color: c.foreground }]}>
                        {t('contact_us.email')}
                    </Text>
                    <TextInput
                        value={formData.email}
                        onChangeText={(v) => handleChange('email', v)}
                        style={[styles.input, { color: c.foreground, borderColor: c.border }]}
                        placeholder={t('contact_us.email_placeholder')}
                        keyboardType="email-address"
                        placeholderTextColor={c['muted-foreground']}
                    />

                    <Text style={[styles.label, { color: c.foreground }]}>
                        {t('contact_us.company')}
                    </Text>
                    <TextInput
                        value={formData.company}
                        onChangeText={(v) => handleChange('company', v)}
                        style={[styles.input, { color: c.foreground, borderColor: c.border }]}
                        placeholder={t('contact_us.company_placeholder')}
                        placeholderTextColor={c['muted-foreground']}
                    />

                    <Text style={[styles.label, { color: c.foreground }]}>
                        {t('contact_us.message')}
                    </Text>
                    <TextInput
                        value={formData.message}
                        onChangeText={(v) => handleChange('message', v)}
                        multiline
                        style={[
                            styles.input,
                            styles.textarea,
                            { color: c.foreground, borderColor: c.border },
                        ]}
                        placeholder={t('contact_us.message_placeholder')}
                        placeholderTextColor={c['muted-foreground']}
                    />

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        style={[
                            styles.button,
                            {
                                backgroundColor: c.foreground,
                                opacity: isSubmitting ? 0.6 : 1,
                            },
                        ]}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Ionicons name="send" color="#fff" size={16} />
                        )}

                        <Text style={styles.buttonText}>
                            {isSubmitting
                                ? t('contact_us.sending')
                                : t('contact_us.send')}
                        </Text>
                    </TouchableOpacity>

                    {error && <Text style={styles.error}>{error}</Text>}
                    {submitted && (
                        <Text style={styles.success}>
                            {t('contact_us.success')}
                        </Text>
                    )}
                </View>


                <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Text style={[styles.sectionTitle, { color: c.foreground }]}>
                        {t('contact_us.contact_info')}
                    </Text>

                    <TouchableOpacity style={styles.infoRow} onPress={handleEmail}>
                        <Ionicons name="mail" size={18} color={c.primary} />
                        <Text style={{ color: c.foreground }}>
                            {SUPPORT_EMAIL}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
                        <Ionicons name="call" size={18} color={c.primary} />
                        <Text style={{ color: c.foreground }}>
                            {SUPPORT_PHONE}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.infoRow}>
                        <Ionicons name="location" size={18} color={c.primary} />
                        <Text style={{ color: c.foreground }}>
                            Smart Village, Cairo
                        </Text>
                    </View>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing[4],
    },
    header: {
        marginBottom: spacing[5],
    },
    badge: {
        fontSize: 11,
        fontFamily: FONT_FAMILY_EXTRABOLD,
        letterSpacing: 2,
        marginBottom: 6,
    },
    title: {
        fontSize: 24,
        fontFamily: FONT_FAMILY_EXTRABOLD,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 13,
        lineHeight: 18,
        fontFamily: FONT_FAMILY,
    },
    card: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontFamily: FONT_FAMILY_BOLD,
        marginTop: 10,
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        fontSize: 14,
        fontFamily: FONT_FAMILY,
    },
    textarea: {
        minHeight: 110,
        textAlignVertical: 'top',
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 14,
        padding: 12,
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontFamily: FONT_FAMILY_BOLD,
        marginLeft: 6,
    },
    error: {
        marginTop: 10,
        color: 'red',
        fontSize: 12,
        fontFamily: FONT_FAMILY,
    },
    success: {
        marginTop: 10,
        color: 'green',
        fontSize: 12,
        fontFamily: FONT_FAMILY,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: FONT_FAMILY_EXTRABOLD,
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
    },
});