import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SENIORITY_LEVEL } from '../../../shared/constants/enums';
import { colors } from '../../../src/theme';

const DATE_OPTIONS = [
  { label: 'Anytime', value: '' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last week', value: 'week' },
  { label: 'Last month', value: 'month' },
];

export default function JobFilters({
  level, setLevel,
  jobType, setJobType,
  workLocation, setWorkLocation,
  datePosted, setDatePosted,
  salaryMin, setSalaryMin,
  salaryMax, setSalaryMax,
  onClear,
}) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const selectedDateLabel = DATE_OPTIONS.find(o => o.value === datePosted)?.label || 'Anytime';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Filter</Text>
        <TouchableOpacity onPress={onClear}>
          <Text style={styles.clearText}>Clear all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date Posted</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setDatePickerOpen(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownText}>{selectedDateLabel}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.darkAmethyst[400]} />
        </TouchableOpacity>
      </View>

      <Modal visible={datePickerOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDatePickerOpen(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Date Posted</Text>
            {DATE_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  datePosted === option.value && styles.modalOptionActive,
                ]}
                onPress={() => {
                  setDatePosted(option.value);
                  setDatePickerOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    datePosted === option.value && styles.modalOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {datePosted === option.value && (
                  <Ionicons name="checkmark" size={18} color={colors.darkAmethyst[600]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Salary Range (EGP)</Text>
        <View style={styles.salaryRow}>
          <TextInput
            style={styles.salaryInput}
            value={salaryMin}
            onChangeText={setSalaryMin}
            placeholder="Min"
            placeholderTextColor={colors.darkAmethyst[300]}
            keyboardType="numeric"
          />
          <Text style={styles.salarySeparator}>to</Text>
          <TextInput
            style={styles.salaryInput}
            value={salaryMax}
            onChangeText={setSalaryMax}
            placeholder="Max"
            placeholderTextColor={colors.darkAmethyst[300]}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job Type</Text>
        {[
          { label: 'Full Time', value: 'full_time' },
          { label: 'Part Time', value: 'part_time' },
        ].map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            style={styles.checkboxRow}
            onPress={() => setJobType(jobType === value ? '' : value)}
          >
            <View style={[styles.checkbox, jobType === value && styles.checkboxActive]}>
              {jobType === value && (
                <Ionicons name="checkmark" size={12} color={colors.white} />
              )}
            </View>
            <Text style={styles.checkboxLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>On-site / Remote</Text>
        {[
          { label: 'On-site', value: 'on_site' },
          { label: 'Remote', value: 'remote' },
          { label: 'Hybrid', value: 'hybrid' },
        ].map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            style={styles.checkboxRow}
            onPress={() => setWorkLocation(workLocation === value ? '' : value)}
          >
            <View style={[styles.checkbox, workLocation === value && styles.checkboxActive]}>
              {workLocation === value && (
                <Ionicons name="checkmark" size={12} color={colors.white} />
              )}
            </View>
            <Text style={styles.checkboxLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seniority Level</Text>
        {Object.values(SENIORITY_LEVEL).map(lvl => (
          <TouchableOpacity
            key={lvl}
            style={styles.checkboxRow}
            onPress={() => setLevel(level === lvl ? '' : lvl)}
          >
            <View style={[styles.checkbox, level === lvl && styles.checkboxActive]}>
              {level === lvl && (
                <Ionicons name="checkmark" size={12} color={colors.white} />
              )}
            </View>
            <Text style={[styles.checkboxLabel, { textTransform: 'capitalize' }]}>{lvl}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkAmethyst[950],
  },
  clearText: {
    fontSize: 12,
    color: colors.darkAmethyst[500],
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.darkAmethyst[800],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    backgroundColor: colors.darkAmethyst[50],
  },
  dropdownText: {
    fontSize: 14,
    color: colors.darkAmethyst[800],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkAmethyst[950],
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  modalOptionActive: {
    backgroundColor: colors.darkAmethyst[50],
  },
  modalOptionText: {
    fontSize: 15,
    color: colors.darkAmethyst[800],
  },
  modalOptionTextActive: {
    color: colors.darkAmethyst[600],
    fontWeight: '600',
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  salaryInput: {
    flex: 1,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.darkAmethyst[100],
    backgroundColor: colors.darkAmethyst[50],
    fontSize: 14,
    color: colors.darkAmethyst[800],
  },
  salarySeparator: {
    fontSize: 14,
    color: colors.darkAmethyst[300],
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.darkAmethyst[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.darkAmethyst[600],
    borderColor: colors.darkAmethyst[600],
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.darkAmethyst[700],
  },
});
