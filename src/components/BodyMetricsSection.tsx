import React, { useMemo, useState } from 'react';
import {
  Activity,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Edit2,
  Info,
  Layers,
  Percent,
  Plus,
  Scale,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { BodyWeightLog } from '../types';
import { calculateMovingAverage, kgToLb, lbToKg } from '../utils/calculations';

export const BodyMetricsSection: React.FC = () => {
  const {
    bodyWeights,
    addBodyWeight,
    updateBodyWeight,
    deleteBodyWeight,
    userProfile,
    updateUserProfile,
  } = useWorkout();

  const [activeMetricTab, setActiveMetricTab] = useState<'dual' | 'weight' | 'bodyfat' | 'lean'>('dual');
  const [timeRange, setTimeRange] = useState<'14d' | '30d' | '90d' | 'all'>('30d');
  const [showMovingAvg, setShowMovingAvg] = useState(true);
  const [showGoalLine, setShowGoalLine] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showHistoryList, setShowHistoryList] = useState(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Form state for logging / editing
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logWeight, setLogWeight] = useState('');
  const [logBodyFat, setLogBodyFat] = useState('');
  const [logNotes, setLogNotes] = useState('');

  // Form state for goals
  const [goalWeightInput, setGoalWeightInput] = useState(
    userProfile.targetWeightKg
      ? userProfile.unitPreference === 'lb'
        ? String(kgToLb(userProfile.targetWeightKg))
        : String(userProfile.targetWeightKg)
      : ''
  );
  const [goalBodyFatInput, setGoalBodyFatInput] = useState(
    userProfile.targetBodyFatPercent !== undefined ? String(userProfile.targetBodyFatPercent) : ''
  );

  const isLb = userProfile.unitPreference === 'lb';

  // Sorted data chronologically
  const sortedLogs = useMemo(() => {
    return [...bodyWeights].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [bodyWeights]);

  // Filtered by time range
  const filteredLogs = useMemo(() => {
    if (timeRange === 'all') return sortedLogs;
    const now = new Date().getTime();
    const days = timeRange === '14d' ? 14 : timeRange === '30d' ? 30 : 90;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    const filtered = sortedLogs.filter((l) => new Date(l.date).getTime() >= cutoff);
    // If filtered has less than 2 points but sorted has more, provide at least the last 2 for visualization
    if (filtered.length < 2 && sortedLogs.length >= 2) {
      return sortedLogs.slice(-Math.min(days, sortedLogs.length));
    }
    return filtered;
  }, [sortedLogs, timeRange]);

  // Moving average data
  const movingAvgData = useMemo(() => {
    return calculateMovingAverage(filteredLogs, 7);
  }, [filteredLogs]);

  // Latest and Initial values
  const latestLog = sortedLogs[sortedLogs.length - 1] || null;
  const initialLog = filteredLogs[0] || sortedLogs[0] || null;

  // Weight stats
  const currentWeightDisplay = latestLog
    ? isLb
      ? kgToLb(latestLog.weightKg)
      : latestLog.weightKg
    : 0;

  const initialWeightDisplay = initialLog
    ? isLb
      ? kgToLb(initialLog.weightKg)
      : initialLog.weightKg
    : 0;

  const weightDiff =
    latestLog && initialLog
      ? Math.round((currentWeightDisplay - initialWeightDisplay) * 10) / 10
      : 0;

  // Body fat stats
  const latestBodyFat = latestLog?.bodyFatPercent;
  const initialBodyFat = filteredLogs.find((l) => l.bodyFatPercent !== undefined)?.bodyFatPercent;
  const bodyFatDiff =
    latestBodyFat !== undefined && initialBodyFat !== undefined
      ? Math.round((latestBodyFat - initialBodyFat) * 10) / 10
      : undefined;

  // Estimated Lean Body Mass (LBM) & Fat Mass
  const estimatedLeanMass =
    latestLog && latestBodyFat !== undefined
      ? Math.round(currentWeightDisplay * (1 - latestBodyFat / 100) * 10) / 10
      : null;

  const estimatedFatMass =
    latestLog && latestBodyFat !== undefined
      ? Math.round(currentWeightDisplay * (latestBodyFat / 100) * 10) / 10
      : null;

  // 7-day average latest
  const latestMovingAvg =
    movingAvgData.length > 0
      ? isLb
        ? kgToLb(movingAvgData[movingAvgData.length - 1].movingAvg)
        : movingAvgData[movingAvgData.length - 1].movingAvg
      : null;

  // Weekly Rate of Change
  const weeklyRate = useMemo(() => {
    if (filteredLogs.length < 2) return null;
    const first = filteredLogs[0];
    const last = filteredLogs[filteredLogs.length - 1];
    const daysBetween =
      (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24);
    if (daysBetween <= 2) return null;

    const firstW = isLb ? kgToLb(first.weightKg) : first.weightKg;
    const lastW = isLb ? kgToLb(last.weightKg) : last.weightKg;
    const diff = lastW - firstW;
    const weeks = daysBetween / 7;
    return Math.round((diff / weeks) * 100) / 100;
  }, [filteredLogs, isLb]);

  // Target goals
  const targetWeightDisplay = userProfile.targetWeightKg
    ? isLb
      ? kgToLb(userProfile.targetWeightKg)
      : userProfile.targetWeightKg
    : undefined;

  const targetBfDisplay = userProfile.targetBodyFatPercent;

  // Open Log Modal (new or edit)
  const handleOpenAdd = () => {
    setEditingEntryId(null);
    setLogDate(new Date().toISOString().split('T')[0]);
    if (latestLog) {
      setLogWeight(isLb ? String(kgToLb(latestLog.weightKg)) : String(latestLog.weightKg));
      if (latestLog.bodyFatPercent !== undefined) {
        setLogBodyFat(String(latestLog.bodyFatPercent));
      } else {
        setLogBodyFat('');
      }
    } else {
      setLogWeight('');
      setLogBodyFat('');
    }
    setLogNotes('');
    setShowLogModal(true);
  };

  const handleOpenEdit = (entry: BodyWeightLog) => {
    setEditingEntryId(entry.id);
    setLogDate(entry.date);
    setLogWeight(isLb ? String(kgToLb(entry.weightKg)) : String(entry.weightKg));
    setLogBodyFat(entry.bodyFatPercent !== undefined ? String(entry.bodyFatPercent) : '');
    setLogNotes(entry.notes || '');
    setShowLogModal(true);
  };

  // Handle Save Log (Add or Edit)
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedWeight = parseFloat(logWeight);
    if (isNaN(parsedWeight) || parsedWeight <= 0) return;

    const finalWeightKg = isLb ? lbToKg(parsedWeight) : parsedWeight;
    const parsedBf = logBodyFat ? parseFloat(logBodyFat) : undefined;

    if (editingEntryId) {
      updateBodyWeight(editingEntryId, {
        date: logDate,
        weightKg: finalWeightKg,
        bodyFatPercent: parsedBf !== undefined && !isNaN(parsedBf) ? parsedBf : undefined,
        notes: logNotes.trim() || undefined,
      });
    } else {
      addBodyWeight(finalWeightKg, logNotes.trim() || undefined, logDate, parsedBf);
    }

    setLogWeight('');
    setLogBodyFat('');
    setLogNotes('');
    setEditingEntryId(null);
    setShowLogModal(false);
  };

  // Handle Save Goals
  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTargetW = parseFloat(goalWeightInput);
    const parsedTargetBf = parseFloat(goalBodyFatInput);

    updateUserProfile({
      targetWeightKg: !isNaN(parsedTargetW) && parsedTargetW > 0
        ? isLb
          ? lbToKg(parsedTargetW)
          : parsedTargetW
        : undefined,
      targetBodyFatPercent: !isNaN(parsedTargetBf) && parsedTargetBf >= 3 && parsedTargetBf <= 60
        ? parsedTargetBf
        : undefined,
    });
    setShowGoalModal(false);
  };

  // SVG Chart Dimensions & Geometry
  const chartHeight = 180;
  const chartWidth = 380;
  const paddingLeft = 36;
  const paddingRight = activeMetricTab === 'dual' ? 36 : 24;
  const paddingTop = 24;
  const paddingBottom = 26;

  const validWeightLogs = filteredLogs.filter((l) => l.weightKg > 0);
  const validBfLogs = filteredLogs.filter((l) => l.bodyFatPercent !== undefined && l.bodyFatPercent > 0);

  // Bounds for weight
  const weightsArr = validWeightLogs.map((l) => (isLb ? kgToLb(l.weightKg) : l.weightKg));
  if (targetWeightDisplay) weightsArr.push(targetWeightDisplay);
  const rawMinWeight = weightsArr.length > 0 ? Math.min(...weightsArr) : 60;
  const rawMaxWeight = weightsArr.length > 0 ? Math.max(...weightsArr) : 90;
  const weightBuffer = Math.max(0.6, (rawMaxWeight - rawMinWeight) * 0.1);
  const minWeight = Math.floor((rawMinWeight - weightBuffer) * 10) / 10;
  const maxWeight = Math.ceil((rawMaxWeight + weightBuffer) * 10) / 10;
  const weightSpan = maxWeight - minWeight || 1;

  // Bounds for body fat
  const bfArr = validBfLogs.map((l) => l.bodyFatPercent!);
  if (targetBfDisplay) bfArr.push(targetBfDisplay);
  const rawMinBf = bfArr.length > 0 ? Math.min(...bfArr) : 10;
  const rawMaxBf = bfArr.length > 0 ? Math.max(...bfArr) : 25;
  const bfBuffer = Math.max(0.8, (rawMaxBf - rawMinBf) * 0.1);
  const minBf = Math.max(0, Math.floor((rawMinBf - bfBuffer) * 10) / 10);
  const maxBf = Math.ceil((rawMaxBf + bfBuffer) * 10) / 10;
  const bfSpan = maxBf - minBf || 1;

  // Bounds for lean mass
  const leanLogs = validWeightLogs
    .map((l) => {
      const w = isLb ? kgToLb(l.weightKg) : l.weightKg;
      return l.bodyFatPercent !== undefined
        ? { date: l.date, lean: Math.round(w * (1 - l.bodyFatPercent / 100) * 10) / 10, log: l }
        : null;
    })
    .filter((x): x is { date: string; lean: number; log: BodyWeightLog } => x !== null);

  const leanArr = leanLogs.map((l) => l.lean);
  const rawMinLean = leanArr.length > 0 ? Math.min(...leanArr) : 50;
  const rawMaxLean = leanArr.length > 0 ? Math.max(...leanArr) : 80;
  const leanBuffer = Math.max(0.6, (rawMaxLean - rawMinLean) * 0.1);
  const minLean = Math.floor((rawMinLean - leanBuffer) * 10) / 10;
  const maxLean = Math.ceil((rawMaxLean + leanBuffer) * 10) / 10;
  const leanSpan = maxLean - minLean || 1;

  // Coordinate mappers
  const getX = (idx: number, total: number) => {
    if (total <= 1) return chartWidth / 2;
    return paddingLeft + (idx / (total - 1)) * (chartWidth - paddingLeft - paddingRight);
  };

  const getYWeight = (w: number) => {
    return chartHeight - paddingBottom - ((w - minWeight) / weightSpan) * (chartHeight - paddingTop - paddingBottom);
  };

  const getYBf = (bf: number) => {
    return chartHeight - paddingBottom - ((bf - minBf) / bfSpan) * (chartHeight - paddingTop - paddingBottom);
  };

  const getYLean = (lm: number) => {
    return chartHeight - paddingBottom - ((lm - minLean) / leanSpan) * (chartHeight - paddingTop - paddingBottom);
  };

  // Build SVG path points
  const weightPoints = validWeightLogs.map((log, idx) => {
    const val = isLb ? kgToLb(log.weightKg) : log.weightKg;
    return {
      x: getX(idx, validWeightLogs.length),
      y: getYWeight(val),
      log,
      val,
      prevVal: idx > 0 ? (isLb ? kgToLb(validWeightLogs[idx - 1].weightKg) : validWeightLogs[idx - 1].weightKg) : null,
    };
  });

  const bfPoints = validBfLogs.map((log) => {
    // Match date index for aligned X position
    const logIndex = validWeightLogs.findIndex((w) => w.id === log.id || w.date === log.date);
    const idx = logIndex >= 0 ? logIndex : 0;
    return {
      x: getX(idx, validWeightLogs.length),
      y: getYBf(log.bodyFatPercent!),
      log,
      val: log.bodyFatPercent!,
    };
  });

  const leanPoints = leanLogs.map((item) => {
    const logIndex = validWeightLogs.findIndex((w) => w.id === item.log.id || w.date === item.log.date);
    const idx = logIndex >= 0 ? logIndex : 0;
    return {
      x: getX(idx, validWeightLogs.length),
      y: getYLean(item.lean),
      log: item.log,
      val: item.lean,
    };
  });

  // Moving average line points
  const movingAvgPoints = movingAvgData
    .map((item, idx) => {
      if (idx >= validWeightLogs.length) return null;
      const val = isLb ? kgToLb(item.movingAvg) : item.movingAvg;
      return {
        x: getX(idx, validWeightLogs.length),
        y: getYWeight(val),
      };
    })
    .filter((pt): pt is { x: number; y: number } => pt !== null);

  const weightPathD =
    weightPoints.length > 0
      ? weightPoints.reduce(
          (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`,
          ''
        )
      : '';

  const bfPathD =
    bfPoints.length > 0
      ? bfPoints.reduce(
          (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`,
          ''
        )
      : '';

  const leanPathD =
    leanPoints.length > 0
      ? leanPoints.reduce(
          (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`,
          ''
        )
      : '';

  const movingAvgPathD =
    movingAvgPoints.length > 0
      ? movingAvgPoints.reduce(
          (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`,
          ''
        )
      : '';

  // Body fat category classification helper
  const getBfCategory = (bf: number) => {
    if (bf < 10) return 'Essential / Very Lean';
    if (bf < 14) return 'Athletic';
    if (bf < 18) return 'Fitness';
    if (bf < 25) return 'Average';
    return 'Higher Body Fat';
  };

  return (
    <div className="bg-surface border border-subtle rounded-3xl p-5 shadow-sm space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center border border-subtle"
            style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
          >
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-main uppercase tracking-wider">
              Body Weight &amp; Body Fat Trends
            </h3>
            <p className="text-[10px] text-muted">Progress tracking &amp; composition curve</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-surface-subtle border border-subtle text-main hover:bg-surface transition-colors"
            title="Configure target weight and body fat %"
          >
            <Target className="w-3.5 h-3.5 text-muted" />
            <span className="hidden sm:inline">Goals</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Log Entry</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Current Weight Card */}
        <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle flex flex-col justify-between">
          <div>
            <div className="text-[10px] text-muted font-medium flex items-center justify-between">
              <span>Current Weight</span>
              {weightDiff !== 0 && (
                <span
                  className={`text-[10px] font-bold flex items-center gap-0.5 ${
                    weightDiff < 0 ? 'text-emerald-500' : 'text-amber-500'
                  }`}
                >
                  {weightDiff < 0 ? <TrendingDown className="w-2.5 h-2.5" /> : <TrendingUp className="w-2.5 h-2.5" />}
                  {weightDiff > 0 ? `+${weightDiff}` : weightDiff}
                </span>
              )}
            </div>
            <div className="text-lg font-black font-mono-numbers text-main mt-1">
              {currentWeightDisplay > 0 ? `${currentWeightDisplay}` : '—'}
              <span className="text-xs font-normal text-muted ml-1">{userProfile.unitPreference}</span>
            </div>
          </div>
          <div className="text-[10px] text-muted mt-2 border-t border-subtle/50 pt-1.5 truncate">
            {targetWeightDisplay ? (
              <span className="text-main font-semibold">
                Goal: {targetWeightDisplay} {userProfile.unitPreference}
              </span>
            ) : (
              <span>{latestLog ? `Logged ${latestLog.date}` : 'No logs'}</span>
            )}
          </div>
        </div>

        {/* Body Fat % Card */}
        <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle flex flex-col justify-between">
          <div>
            <div className="text-[10px] text-muted font-medium flex items-center justify-between">
              <span>Body Fat %</span>
              {bodyFatDiff !== undefined && bodyFatDiff !== 0 && (
                <span
                  className={`text-[10px] font-bold flex items-center gap-0.5 ${
                    bodyFatDiff < 0 ? 'text-emerald-500' : 'text-amber-500'
                  }`}
                >
                  {bodyFatDiff < 0 ? <TrendingDown className="w-2.5 h-2.5" /> : <TrendingUp className="w-2.5 h-2.5" />}
                  {bodyFatDiff > 0 ? `+${bodyFatDiff}%` : `${bodyFatDiff}%`}
                </span>
              )}
            </div>
            <div className="text-lg font-black font-mono-numbers text-main mt-1">
              {latestBodyFat !== undefined ? (
                <>
                  {latestBodyFat}
                  <span className="text-xs font-normal text-muted ml-0.5">%</span>
                </>
              ) : (
                '—'
              )}
            </div>
          </div>
          <div className="text-[10px] text-muted mt-2 border-t border-subtle/50 pt-1.5 truncate">
            {latestBodyFat !== undefined ? (
              <span className="font-semibold text-main">{getBfCategory(latestBodyFat)}</span>
            ) : (
              <span>Track fat %</span>
            )}
          </div>
        </div>

        {/* Lean Mass vs Fat Mass Card */}
        <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle flex flex-col justify-between">
          <div>
            <div className="text-[10px] text-muted font-medium flex items-center justify-between">
              <span>Body Composition</span>
              <Activity className="w-3 h-3 text-muted" />
            </div>
            <div className="text-base font-black font-mono-numbers text-main mt-1 flex items-baseline gap-1">
              <span>{estimatedLeanMass !== null ? estimatedLeanMass : '—'}</span>
              <span className="text-[10px] font-normal text-muted">LBM {userProfile.unitPreference}</span>
            </div>
          </div>
          <div className="mt-2 border-t border-subtle/50 pt-1.5">
            {estimatedLeanMass !== null && estimatedFatMass !== null ? (
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden flex border border-subtle">
                  <div
                    className="h-full bg-main transition-all"
                    style={{ width: `${100 - (latestBodyFat || 15)}%` }}
                    title={`Lean Mass: ${estimatedLeanMass} ${userProfile.unitPreference}`}
                  />
                  <div
                    className="h-full bg-muted/40 transition-all"
                    style={{ width: `${latestBodyFat || 15}%` }}
                    title={`Fat Mass: ${estimatedFatMass} ${userProfile.unitPreference}`}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] text-muted font-mono-numbers">
                  <span>Lean {estimatedLeanMass}</span>
                  <span>Fat {estimatedFatMass}</span>
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-muted">Add body fat % to view</div>
            )}
          </div>
        </div>

        {/* 7-Day Moving Avg & Weekly Rate Card */}
        <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle flex flex-col justify-between">
          <div>
            <div className="text-[10px] text-muted font-medium flex items-center justify-between">
              <span>7-Day Smoothed</span>
              <Sparkles className="w-3 h-3 text-muted" />
            </div>
            <div className="text-lg font-black font-mono-numbers text-main mt-1">
              {latestMovingAvg !== null ? latestMovingAvg : '—'}
              <span className="text-xs font-normal text-muted ml-1">{userProfile.unitPreference}</span>
            </div>
          </div>
          <div className="text-[10px] text-muted mt-2 border-t border-subtle/50 pt-1.5 truncate">
            {weeklyRate !== null ? (
              <span className="font-semibold text-main">
                {weeklyRate > 0 ? `+${weeklyRate}` : weeklyRate} {userProfile.unitPreference}/wk
              </span>
            ) : (
              <span>Water flux smoothed</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Visualization Container */}
      <div className="rounded-2xl bg-surface-subtle border border-subtle p-3.5 space-y-3">
        {/* Controls Toolbar: Metric View Tabs, Range Buttons, and Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-subtle/60 pb-2.5">
          {/* View Modes */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-surface border border-subtle">
            <button
              onClick={() => setActiveMetricTab('dual')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                activeMetricTab === 'dual'
                  ? 'bg-surface-subtle text-main shadow-xs'
                  : 'text-muted hover:text-main'
              }`}
            >
              Dual Trend
            </button>
            <button
              onClick={() => setActiveMetricTab('weight')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                activeMetricTab === 'weight'
                  ? 'bg-surface-subtle text-main shadow-xs'
                  : 'text-muted hover:text-main'
              }`}
            >
              Weight
            </button>
            <button
              onClick={() => setActiveMetricTab('bodyfat')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                activeMetricTab === 'bodyfat'
                  ? 'bg-surface-subtle text-main shadow-xs'
                  : 'text-muted hover:text-main'
              }`}
            >
              Body Fat %
            </button>
            <button
              onClick={() => setActiveMetricTab('lean')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                activeMetricTab === 'lean'
                  ? 'bg-surface-subtle text-main shadow-xs'
                  : 'text-muted hover:text-main'
              }`}
            >
              Lean Mass
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 text-[11px] font-semibold text-muted">
            <button
              onClick={() => setTimeRange('14d')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                timeRange === '14d' ? 'bg-surface text-main font-bold border border-subtle' : 'hover:text-main'
              }`}
            >
              14D
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                timeRange === '30d' ? 'bg-surface text-main font-bold border border-subtle' : 'hover:text-main'
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                timeRange === '90d' ? 'bg-surface text-main font-bold border border-subtle' : 'hover:text-main'
              }`}
            >
              90D
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                timeRange === 'all' ? 'bg-surface text-main font-bold border border-subtle' : 'hover:text-main'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Feature Switches (Moving Average and Goals) */}
        <div className="flex items-center justify-between text-[11px] text-muted px-1">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-main select-none">
              <input
                type="checkbox"
                checked={showMovingAvg}
                onChange={(e) => setShowMovingAvg(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-subtle"
                style={{ accentColor: 'var(--accent)' }}
              />
              <span>7-Day Trendline</span>
            </label>

            {(targetWeightDisplay || targetBfDisplay) && (
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-main select-none">
                <input
                  type="checkbox"
                  checked={showGoalLine}
                  onChange={(e) => setShowGoalLine(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-subtle"
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span>Goal Targets</span>
              </label>
            )}
          </div>

          <span className="font-mono-numbers text-[10px]">
            {filteredLogs.length} logs · {timeRange.toUpperCase()}
          </span>
        </div>

        {/* Responsive Interactive SVG Chart */}
        {filteredLogs.length >= 2 ? (
          <div className="relative w-full pt-1">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 overflow-visible select-none"
            >
              {/* Horizontal Background Grid & Scale Guides */}
              <line
                x1={paddingLeft}
                y1={paddingTop}
                x2={chartWidth - paddingRight}
                y2={paddingTop}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeDasharray="2 3"
              />
              <line
                x1={paddingLeft}
                y1={paddingTop + (chartHeight - paddingTop - paddingBottom) / 2}
                x2={chartWidth - paddingRight}
                y2={paddingTop + (chartHeight - paddingTop - paddingBottom) / 2}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeDasharray="2 3"
              />
              <line
                x1={paddingLeft}
                y1={chartHeight - paddingBottom}
                x2={chartWidth - paddingRight}
                y2={chartHeight - paddingBottom}
                stroke="currentColor"
                strokeOpacity="0.12"
              />

              {/* Y-Axis Scale Values: Left (Weight or Lean) */}
              <text
                x={paddingLeft - 6}
                y={paddingTop + 3}
                textAnchor="end"
                className="text-[9px] fill-current opacity-40 font-mono-numbers"
              >
                {activeMetricTab === 'lean' ? maxLean : maxWeight}
              </text>
              <text
                x={paddingLeft - 6}
                y={paddingTop + (chartHeight - paddingTop - paddingBottom) / 2 + 3}
                textAnchor="end"
                className="text-[9px] fill-current opacity-40 font-mono-numbers"
              >
                {activeMetricTab === 'lean'
                  ? Math.round(((maxLean + minLean) / 2) * 10) / 10
                  : Math.round(((maxWeight + minWeight) / 2) * 10) / 10}
              </text>
              <text
                x={paddingLeft - 6}
                y={chartHeight - paddingBottom + 3}
                textAnchor="end"
                className="text-[9px] fill-current opacity-40 font-mono-numbers"
              >
                {activeMetricTab === 'lean' ? minLean : minWeight}
              </text>

              {/* Y-Axis Scale Values: Right (Body Fat % in dual mode) */}
              {activeMetricTab === 'dual' && (
                <>
                  <text
                    x={chartWidth - paddingRight + 6}
                    y={paddingTop + 3}
                    textAnchor="start"
                    className="text-[9px] fill-current opacity-40 font-mono-numbers"
                  >
                    {maxBf}%
                  </text>
                  <text
                    x={chartWidth - paddingRight + 6}
                    y={paddingTop + (chartHeight - paddingTop - paddingBottom) / 2 + 3}
                    textAnchor="start"
                    className="text-[9px] fill-current opacity-40 font-mono-numbers"
                  >
                    {Math.round(((maxBf + minBf) / 2) * 10) / 10}%
                  </text>
                  <text
                    x={chartWidth - paddingRight + 6}
                    y={chartHeight - paddingBottom + 3}
                    textAnchor="start"
                    className="text-[9px] fill-current opacity-40 font-mono-numbers"
                  >
                    {minBf}%
                  </text>
                </>
              )}

              {/* Target Goal Lines */}
              {showGoalLine && targetWeightDisplay && (activeMetricTab === 'weight' || activeMetricTab === 'dual') && (
                <g>
                  <line
                    x1={paddingLeft}
                    y1={getYWeight(targetWeightDisplay)}
                    x2={chartWidth - paddingRight}
                    y2={getYWeight(targetWeightDisplay)}
                    stroke="var(--accent)"
                    strokeOpacity="0.4"
                    strokeWidth="1.2"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={chartWidth - paddingRight - 4}
                    y={getYWeight(targetWeightDisplay) - 4}
                    textAnchor="end"
                    className="text-[9px] font-bold fill-current opacity-60 font-mono-numbers"
                  >
                    Goal: {targetWeightDisplay}
                  </text>
                </g>
              )}

              {showGoalLine && targetBfDisplay && (activeMetricTab === 'bodyfat' || activeMetricTab === 'dual') && (
                <g>
                  <line
                    x1={paddingLeft}
                    y1={getYBf(targetBfDisplay)}
                    x2={chartWidth - paddingRight}
                    y2={getYBf(targetBfDisplay)}
                    stroke="currentColor"
                    strokeOpacity="0.4"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={paddingLeft + 4}
                    y={getYBf(targetBfDisplay) - 4}
                    textAnchor="start"
                    className="text-[9px] font-bold fill-current opacity-60 font-mono-numbers"
                  >
                    Goal: {targetBfDisplay}% BF
                  </text>
                </g>
              )}

              {/* 7-Day Moving Average Line (Subtle Smoothing) */}
              {showMovingAvg && (activeMetricTab === 'weight' || activeMetricTab === 'dual') && movingAvgPathD && (
                <path
                  d={movingAvgPathD}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.3"
                  strokeWidth="1.8"
                  strokeDasharray="3 3"
                  strokeLinecap="round"
                />
              )}

              {/* Weight Trend Line (Solid clean minimal stroke) */}
              {(activeMetricTab === 'weight' || activeMetricTab === 'dual') && weightPathD && (
                <>
                  <path
                    d={weightPathD}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {weightPoints.map((pt, i) => (
                    <g key={`w-pt-${i}`}>
                      {/* Invisible larger hit target for touch / hover */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="12"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPointIndex(i)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                        onClick={() => setHoveredPointIndex(i)}
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredPointIndex === i ? 5 : 3}
                        fill="var(--bg-surface)"
                        stroke="var(--accent)"
                        strokeWidth="2"
                        className="cursor-pointer transition-all pointer-events-none"
                      />
                    </g>
                  ))}
                </>
              )}

              {/* Body Fat % Trend Line (Distinctive dashed pattern for clarity) */}
              {(activeMetricTab === 'bodyfat' || activeMetricTab === 'dual') && bfPathD && (
                <>
                  <path
                    d={bfPathD}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.75"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {bfPoints.map((pt, i) => (
                    <g key={`bf-pt-${i}`}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="12"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPointIndex(i)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                        onClick={() => setHoveredPointIndex(i)}
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredPointIndex === i ? 4.5 : 2.5}
                        fill="var(--bg-surface)"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="cursor-pointer transition-all pointer-events-none"
                      />
                    </g>
                  ))}
                </>
              )}

              {/* Lean Mass Trend Line */}
              {activeMetricTab === 'lean' && leanPathD && (
                <>
                  <path
                    d={leanPathD}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {leanPoints.map((pt, i) => (
                    <circle
                      key={`lean-pt-${i}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredPointIndex === i ? 5 : 3}
                      fill="var(--bg-surface)"
                      stroke="var(--accent)"
                      strokeWidth="2"
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredPointIndex(i)}
                      onMouseLeave={() => setHoveredPointIndex(null)}
                    />
                  ))}
                </>
              )}

              {/* X-Axis Date Range Markers */}
              <text
                x={paddingLeft}
                y={chartHeight - 8}
                textAnchor="start"
                className="text-[9px] fill-current opacity-40 font-mono-numbers"
              >
                {filteredLogs[0]?.date}
              </text>
              <text
                x={chartWidth - paddingRight}
                y={chartHeight - 8}
                textAnchor="end"
                className="text-[9px] fill-current opacity-40 font-mono-numbers"
              >
                {filteredLogs[filteredLogs.length - 1]?.date}
              </text>
            </svg>

            {/* Hover / Touch Interactive Tooltip */}
            {hoveredPointIndex !== null && weightPoints[hoveredPointIndex] && (
              <div
                className="absolute -top-4 z-20 p-2.5 rounded-2xl bg-surface border border-subtle shadow-2xl text-left pointer-events-none text-xs transform -translate-x-1/2 min-w-[130px]"
                style={{
                  left: `${(weightPoints[hoveredPointIndex].x / chartWidth) * 100}%`,
                }}
              >
                <div className="text-[10px] text-muted font-bold flex items-center justify-between border-b border-subtle pb-1 mb-1">
                  <span>{weightPoints[hoveredPointIndex].log.date}</span>
                  {weightPoints[hoveredPointIndex].prevVal !== null && (
                    <span
                      className={`text-[9px] font-mono-numbers font-bold ${
                        weightPoints[hoveredPointIndex].val - weightPoints[hoveredPointIndex].prevVal! < 0
                          ? 'text-emerald-500'
                          : 'text-amber-500'
                      }`}
                    >
                      {weightPoints[hoveredPointIndex].val - weightPoints[hoveredPointIndex].prevVal! > 0 ? '+' : ''}
                      {(weightPoints[hoveredPointIndex].val - weightPoints[hoveredPointIndex].prevVal!).toFixed(1)}
                    </span>
                  )}
                </div>

                <div className="font-extrabold text-main font-mono-numbers text-sm">
                  {weightPoints[hoveredPointIndex].val} {userProfile.unitPreference}
                </div>

                {weightPoints[hoveredPointIndex].log.bodyFatPercent !== undefined && (
                  <div className="text-[11px] font-bold text-main font-mono-numbers mt-0.5">
                    {weightPoints[hoveredPointIndex].log.bodyFatPercent}% Body Fat
                  </div>
                )}

                {weightPoints[hoveredPointIndex].log.notes && (
                  <div className="text-[10px] text-muted italic mt-1 pt-1 border-t border-subtle/50">
                    "{weightPoints[hoveredPointIndex].log.notes}"
                  </div>
                )}
              </div>
            )}

            {/* Visual Legend */}
            <div className="flex flex-wrap items-center justify-between text-[10px] text-muted pt-2 px-1 font-mono-numbers border-t border-subtle/40">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-0.5 inline-block"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                  <span>Weight ({userProfile.unitPreference})</span>
                </span>

                {(activeMetricTab === 'bodyfat' || activeMetricTab === 'dual') && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 border-t-2 border-dashed border-current inline-block opacity-80" />
                    <span>Body Fat (%)</span>
                  </span>
                )}

                {showMovingAvg && (
                  <span className="flex items-center gap-1.5 opacity-60">
                    <span className="w-3 h-0.5 border-t border-dotted border-current inline-block" />
                    <span>7D Avg</span>
                  </span>
                )}
              </div>

              <span>Tap any point for details</span>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-muted">
            <Scale className="w-6 h-6 mx-auto mb-1 opacity-40" />
            <p className="font-semibold text-main">Log at least 2 weigh-ins</p>
            <p className="text-[11px] text-muted mt-0.5">
              Visualize your progressive trendline and body composition curve.
            </p>
          </div>
        )}
      </div>

      {/* Expandable History Logs Section with Edit & Delete */}
      <div className="border border-subtle rounded-2xl bg-surface-subtle overflow-hidden">
        <button
          onClick={() => setShowHistoryList(!showHistoryList)}
          className="w-full flex items-center justify-between text-xs font-bold text-main p-3 hover:bg-surface transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-muted" />
            <span>Weigh-In History &amp; Records ({sortedLogs.length} logs)</span>
          </div>
          {showHistoryList ? (
            <ChevronUp className="w-4 h-4 text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted" />
          )}
        </button>

        {showHistoryList && (
          <div className="p-3 pt-0 space-y-1.5 max-h-56 overflow-y-auto">
            {[...sortedLogs].reverse().map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-subtle text-xs transition-colors hover:border-strong"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-main font-mono-numbers">
                      {isLb ? kgToLb(entry.weightKg) : entry.weightKg} {userProfile.unitPreference}
                    </span>
                    {entry.bodyFatPercent !== undefined && (
                      <span className="px-1.5 py-0.5 rounded-md bg-surface-subtle text-main font-bold text-[10px] font-mono-numbers border border-subtle">
                        {entry.bodyFatPercent}% BF
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted mt-0.5">
                    {entry.date} {entry.notes && `· ${entry.notes}`}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(entry)}
                    className="p-1.5 text-muted hover:text-main rounded-lg hover:bg-surface-subtle transition-colors"
                    title="Edit entry"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteBodyWeight(entry.id)}
                    className="p-1.5 text-muted hover:text-rose-500 rounded-lg hover:bg-surface-subtle transition-colors"
                    title="Delete weigh-in entry"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log / Edit Entry Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-surface border border-subtle rounded-3xl w-full max-w-sm shadow-2xl p-5 overflow-hidden text-main">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4" />
                <h3 className="font-extrabold text-base text-main font-display">
                  {editingEntryId ? 'Edit Body Metrics' : 'Log Body Weight & Fat'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowLogModal(false);
                  setEditingEntryId(null);
                }}
                className="p-1 text-muted hover:text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="space-y-3.5 mt-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-secondary">Date</label>
                  <button
                    type="button"
                    onClick={() => setLogDate(new Date().toISOString().split('T')[0])}
                    className="text-[10px] text-muted hover:text-main font-medium"
                  >
                    Today
                  </button>
                </div>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full bg-surface-subtle border border-subtle rounded-xl px-3 py-2 text-xs text-main font-mono-numbers focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    Weight ({userProfile.unitPreference})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={logWeight}
                    onChange={(e) => setLogWeight(e.target.value)}
                    placeholder={isLb ? '170.0' : '77.5'}
                    className="w-full bg-surface-subtle border border-subtle rounded-xl px-3 py-2 text-xs text-main font-bold font-mono-numbers focus:outline-none"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    Body Fat % (Opt.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="3"
                    max="60"
                    value={logBodyFat}
                    onChange={(e) => setLogBodyFat(e.target.value)}
                    placeholder="15.0"
                    className="w-full bg-surface-subtle border border-subtle rounded-xl px-3 py-2 text-xs text-main font-bold font-mono-numbers focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="Morning fasted, post cardio..."
                  className="w-full bg-surface-subtle border border-subtle rounded-xl px-3 py-2 text-xs text-main focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowLogModal(false);
                    setEditingEntryId(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-surface-subtle border border-subtle text-xs font-semibold text-main hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                >
                  {editingEntryId ? 'Update Entry' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-surface border border-subtle rounded-3xl w-full max-w-sm shadow-2xl p-5 overflow-hidden text-main">
            <div className="flex items-center justify-between pb-3 border-b border-subtle">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <h3 className="font-extrabold text-base text-main font-display">Target Goals</h3>
              </div>
              <button onClick={() => setShowGoalModal(false)} className="p-1 text-muted hover:text-main">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted mt-2">
              Set your target body weight and body fat percentage to visualize your milestone line on the progress curve.
            </p>

            <form onSubmit={handleSaveGoals} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">
                  Target Weight ({userProfile.unitPreference})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={goalWeightInput}
                  onChange={(e) => setGoalWeightInput(e.target.value)}
                  placeholder={isLb ? '165.0' : '75.0'}
                  className="w-full bg-surface-subtle border border-subtle rounded-xl px-3 py-2 text-xs text-main font-bold font-mono-numbers focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">Target Body Fat %</label>
                <input
                  type="number"
                  step="0.1"
                  min="3"
                  max="60"
                  value={goalBodyFatInput}
                  onChange={(e) => setGoalBodyFatInput(e.target.value)}
                  placeholder="13.5"
                  className="w-full bg-surface-subtle border border-subtle rounded-xl px-3 py-2 text-xs text-main font-bold font-mono-numbers focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-surface-subtle border border-subtle text-xs font-semibold text-main hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                >
                  Save Goals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
