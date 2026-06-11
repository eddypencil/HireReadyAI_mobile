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
    useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useUser } from '../../auth/context/user.context';
import { spacing } from '../../../src/theme';

const SUPPORT_EMAIL = 'support@hireready.ai';
const SUPPORT_PHONE = '+201234567899';

export default function ContactUsScreen() {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const { profile } = useUser();
    const c = theme.colors;

    const { width } = useWindowDimensions();
    const isSmall = width < 380;

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

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.message) {
            Alert.alert('Missing info', 'Please fill all required fields.');
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
            setError(err.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleCall = () => {
        Linking.openURL(`tel:${SUPPORT_PHONE}`);
    };


    const handleEmail = () => {
        Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
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


                <View style={styles.header}>
                    <Text style={[styles.badge, { color: c.primary }]}>
                        Contact us
                    </Text>

                    <Text style={[styles.title, { color: c.foreground }]}>
                        Get in touch
                    </Text>

                    <Text style={[styles.subtitle, { color: c['muted-foreground'] }]}>
                        Send us a message and we’ll get back to you soon.
                    </Text>
                </View>


                <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Text style={[styles.label, { color: c.foreground }]}>Your name</Text>
                    <TextInput
                        value={formData.name}
                        onChangeText={(v) => handleChange('name', v)}
                        style={[styles.input, { color: c.foreground, borderColor: c.border }]}
                        placeholder="Jane Cooper"
                        placeholderTextColor={c['muted-foreground']}
                    />

                    <Text style={[styles.label, { color: c.foreground }]}>Email</Text>
                    <TextInput
                        value={formData.email}
                        onChangeText={(v) => handleChange('email', v)}
                        style={[styles.input, { color: c.foreground, borderColor: c.border }]}
                        placeholder="jane@company.com"
                        placeholderTextColor={c['muted-foreground']}
                        keyboardType="email-address"
                    />

                    <Text style={[styles.label, { color: c.foreground }]}>Company</Text>
                    <TextInput
                        value={formData.company}
                        onChangeText={(v) => handleChange('company', v)}
                        style={[styles.input, { color: c.foreground, borderColor: c.border }]}
                        placeholder="Acme Inc."
                        placeholderTextColor={c['muted-foreground']}
                    />

                    <Text style={[styles.label, { color: c.foreground }]}>Message</Text>
                    <TextInput
                        value={formData.message}
                        onChangeText={(v) => handleChange('message', v)}
                        multiline
                        style={[
                            styles.input,
                            styles.textarea,
                            { color: c.foreground, borderColor: c.border },
                        ]}
                        placeholder="Tell us about your request..."
                        placeholderTextColor={c['muted-foreground']}
                    />

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        style={[
                            styles.button,
                            { backgroundColor: c.foreground, opacity: isSubmitting ? 0.6 : 1 },
                        ]}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Ionicons name="send" color="#fff" size={16} />
                        )}

                        <Text style={styles.buttonText}>
                            {isSubmitting ? 'Sending...' : 'Send message'}
                        </Text>
                    </TouchableOpacity>

                    {error && <Text style={styles.error}>{error}</Text>}
                    {submitted && <Text style={styles.success}>Message sent successfully!</Text>}
                </View>

                <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Text style={[styles.sectionTitle, { color: c.foreground }]}>
                        Contact information
                    </Text>


                    <TouchableOpacity style={styles.infoRow} onPress={handleEmail}>
                        <Ionicons name="mail" size={18} color={c.primary} />
                        <Text style={{ color: c.foreground }}>{SUPPORT_EMAIL}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
                        <Ionicons name="call" size={18} color={c.primary} />
                        <Text style={{ color: c.foreground }}>{SUPPORT_PHONE}</Text>
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
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 6,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 13,
        lineHeight: 18,
    },
    card: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        marginTop: 10,
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        fontSize: 14,
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
        fontWeight: '700',
        marginLeft: 6,
    },
    error: {
        marginTop: 10,
        color: 'red',
        fontSize: 12,
    },
    success: {
        marginTop: 10,
        color: 'green',
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
    },
});