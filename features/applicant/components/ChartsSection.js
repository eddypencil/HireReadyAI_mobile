// features/applicant/components/ChartsSection.js
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useTranslation } from '../../../shared/context/I18nContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;

// ── Color by status
const LABEL_COLORS = {
  hired: '#22c55e',
  offer: '#22c55e',
  in_progress: '#468faf',
  rejected: '#ef4444',
};
const FALLBACK_COLORS = ['#2a6f97', '#89c2d9', '#61a5c2'];

function getSliceColor(status, fallbackIndex) {
  return LABEL_COLORS[status] || FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length];
}

// ── Build donut slices
function buildDonutSlices(data, cx, cy, r) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return [];
  let angle = -Math.PI / 2;
  return data.map((item, i) => {
    const slice = (item.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle + slice);
    const y2 = cy + r * Math.sin(angle + slice);
    const large = slice > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    const color = getSliceColor(item.status, i);
    angle += slice;
    return { path, color, status: item.status, label: item.label, value: item.value };
  });
}

// ── Donut Chart — shows per-application status (not per-stage)
function DonutChart({ applications }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const c = theme.colors;
  const styles = createStyles(c);
  const SIZE = Math.min(CHART_WIDTH * 0.55, 180);
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const outerR = SIZE * 0.42;
  const innerR = SIZE * 0.26;

  // ── Count by application-level outcome
  const statusMap = {};
  (applications || []).forEach(app => {
    let status;
    if (app.is_rejected || app.current_stage === 'rejected') {
      status = 'rejected';
    } else if (app.current_stage === 'hired') {
      status = 'hired';
    } else if (app.current_stage === 'offer') {
      status = 'offer';
    } else {
      status = 'in_progress';
    }
    statusMap[status] = (statusMap[status] || 0) + 1;
  });

  const data = Object.entries(statusMap)
    .filter(([, v]) => v > 0)
    .map(([status, value]) => ({
      status,
      label: t(`applicant.charts.${status}`),
      value,
    }));

  const total = data.reduce((s, d) => s + d.value, 0);
  const slices = data.length === 1
    ? []
    : buildDonutSlices(data, cx, cy, outerR);
  const singleColor = data.length === 1 ? getSliceColor(data[0]?.status, 0) : null;

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>{t('applicant.charts.application_status')}</Text>
      <Text style={styles.chartSubtitle}>{t('applicant.charts.application_status_sub')}</Text>

      {total === 0 ? (
        <View style={styles.chartEmpty}>
          <Text style={styles.chartEmptyText}>{t('applicant.charts.no_applications')}</Text>
        </View>
      ) : (
        <View style={styles.donutRow}>
          <Svg width={SIZE} height={SIZE}>
            <G>
              {data.length === 1 ? (
                <Circle cx={cx} cy={cy} r={outerR} fill={singleColor} />
              ) : (
                slices.map((s, i) => (
                  <Path key={i} d={s.path} fill={s.color} />
                ))
              )}
              <Circle cx={cx} cy={cy} r={innerR} fill={c.white} />
              <SvgText
                x={cx} y={cy - 8}
                textAnchor="middle"
                fontSize={22} fontWeight="700"
                fill={c.foreground}
              >
                {total}
              </SvgText>
              <SvgText
                x={cx} y={cy + 12}
                textAnchor="middle"
                fontSize={10}
                fill={c['muted-foreground']}
              >
                {t('applicant.charts.applications_label')}
              </SvgText>
            </G>
          </Svg>

          <View style={styles.legendCol}>
            {data.map((item, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: getSliceColor(item.status, i) }]} />
                <Text style={styles.legendText}>
                  {item.label}
                  <Text style={styles.legendCount}> ({item.value})</Text>
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Bar Chart — full width
function BarChart({ applications }) {
  const { theme } = useTheme();
  const { t, language } = useTranslation();
  const c = theme.colors;
  const styles = createStyles(c);
  const SIZE_W = CHART_WIDTH;
  const SIZE_H = 160;
  const padLeft = 28;
  const padBottom = 32;
  const padTop = 12;
  const padRight = 12;
  const chartW = SIZE_W - padLeft - padRight;
  const chartH = SIZE_H - padBottom - padTop;

  const monthMap = {};
  (applications || []).forEach(app => {
    if (!app.applied_at) return;
    const d = new Date(app.applied_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', year: 'numeric' });
    if (!monthMap[key]) monthMap[key] = { label, count: 0 };
    monthMap[key].count++;
  });

  const sorted = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, v]) => v);

  const maxVal = Math.max(...sorted.map(d => d.count), 1);
  const barCount = sorted.length;
  const barWidth = barCount > 0 ? Math.min((chartW / barCount) * 0.5, 36) : 24;
  const gap = barCount > 1 ? (chartW - barWidth * barCount) / (barCount - 1) : 0;
  const ticks = [0, Math.ceil(maxVal / 2), maxVal];

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>{t('applicant.charts.applications_over_time')}</Text>
      <Text style={styles.chartSubtitle}>{t('applicant.charts.monthly_submissions')}</Text>

      {sorted.length === 0 ? (
        <View style={styles.chartEmpty}>
          <Text style={styles.chartEmptyText}>{t('applicant.charts.no_data')}</Text>
        </View>
      ) : (
        <Svg width={SIZE_W} height={SIZE_H} style={{ marginTop: 12 }}>
          {ticks.map((tick, i) => {
            const y = padTop + chartH - (tick / maxVal) * chartH;
            return (
              <G key={i}>
                <Path
                  d={`M ${padLeft} ${y} L ${SIZE_W - padRight} ${y}`}
                  stroke={c.border}
                  strokeWidth={0.8}
                  strokeDasharray="4,4"
                />
                <SvgText
                  x={padLeft - 5} y={y + 4}
                  textAnchor="end"
                  fontSize={9}
                  fill={c['muted-foreground']}
                >
                  {tick}
                </SvgText>
              </G>
            );
          })}

          {sorted.map((item, i) => {
            const barH = Math.max((item.count / maxVal) * chartH, 2);
            const x = padLeft + i * (barWidth + gap);
            const y = padTop + chartH - barH;
            const shortLabel = item.label.split(' ')[0];
            return (
              <G key={i}>
                <Rect
                  x={x} y={y}
                  width={barWidth} height={barH}
                  rx={5}
                  fill={c.primary}
                  opacity={0.9}
                />
                <SvgText
                  x={x + barWidth / 2}
                  y={SIZE_H - padBottom + 16}
                  textAnchor="middle"
                  fontSize={9}
                  fill={c['muted-foreground']}
                >
                  {shortLabel}
                </SvgText>
              </G>
            );
          })}

          <Path
            d={`M ${padLeft} ${padTop + chartH} L ${SIZE_W - padRight} ${padTop + chartH}`}
            stroke={c.border}
            strokeWidth={1}
          />
        </Svg>
      )}
    </View>
  );
}

export default function ChartsSection({ applications }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const styles = createStyles(c);
  return (
    <View style={styles.container}>
      <DonutChart applications={applications} />
      <BarChart applications={applications} />
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    container: {
      gap: 14,
    },
    chartCard: {
      backgroundColor: c.white,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 20,
    },
    chartTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: c.foreground,
    },
    chartSubtitle: {
      fontSize: 11,
      color: c['muted-foreground'],
      marginTop: 2,
      marginBottom: 4,
    },
    chartEmpty: {
      height: 100,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chartEmptyText: {
      fontSize: 12,
      color: c['muted-foreground'],
    },
    donutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
      marginTop: 8,
    },
    legendCol: {
      flex: 1,
      gap: 10,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      flexShrink: 0,
    },
    legendText: {
      fontSize: 13,
      color: c.foreground,
      fontWeight: '500',
    },
    legendCount: {
      fontSize: 12,
      color: c['muted-foreground'],
      fontWeight: '400',
    },
  });
}
