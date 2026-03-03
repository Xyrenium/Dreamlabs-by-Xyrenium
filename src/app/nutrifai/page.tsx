'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import PageWrapper, { SectionHeader, TokenCostPreview, LoadingOverlay } from '@/components/PageWrapper';

type Gender = 'male' | 'female';

interface MealItem {
  name: string;
  description: string;
  nutrition: string;
  steps: string[];
}

interface AnalysisResult {
  category: string;
  insights: string[];
  projection: string[];
  recommendations: string[];
}

interface MealPlan {
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snack: MealItem;
}

export default function NutrifaiPage() {
  const router = useRouter();
  const { t, deductTokens, tokens, locale, isAuthenticated } = useApp();
  const [birthWeight, setBirthWeight] = useState('');
  const [currentAge, setCurrentAge] = useState('');
  const [currentHeight, setCurrentHeight] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isGeneratingMeal, setIsGeneratingMeal] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'meals'>('analysis');
  const [error, setError] = useState<string | null>(null);

  const analysisTokens = 2;
  const mealPlanTokens = 2;

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleAnalyze = async () => {
    if (!birthWeight || !currentAge || !currentHeight || !currentWeight) return;
    
    const canProceed = deductTokens(analysisTokens, 'NutrifAI: Growth Analysis');
    if (!canProceed) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/nutrifai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthWeight: parseFloat(birthWeight),
          currentAge: parseInt(currentAge),
          currentHeight: parseFloat(currentHeight),
          currentWeight: parseFloat(currentWeight),
          gender,
          locale,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to connect to server');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateMealPlan = async () => {
    const canProceed = deductTokens(mealPlanTokens, 'NutrifAI: Meal Plan');
    if (!canProceed) return;

    setIsGeneratingMeal(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/nutrifai/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: result?.category || 'Normal',
          age: parseInt(currentAge),
          gender,
          locale,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMealPlan(data.mealPlan);
        setActiveTab('meals');
      } else {
        setError(data.error || 'Meal plan generation failed');
      }
    } catch (err) {
      console.error('Meal plan error:', err);
      setError('Failed to generate meal plan');
    } finally {
      setIsGeneratingMeal(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const categoryColors: Record<string, string> = {
    Normal: 'text-green-400 bg-green-500/10 border-green-500/20',
    Underweight: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Overweight: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    'Stunting Risk': 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  const MealCard = ({ meal, label }: { meal: MealItem; label: string }) => {
    const [expanded, setExpanded] = useState(false);
    return (
      <div className="glass rounded-2xl p-5 border border-white/5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className="text-xs text-purple-400 font-medium">{label}</span>
            <h4 className="text-white font-semibold mt-1">{meal.name}</h4>
          </div>
        </div>
        <p className="text-white/50 text-sm mb-2">{meal.description}</p>
        <p className="text-xs text-white/30 font-mono mb-3">{meal.nutrition}</p>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          {expanded ? 'Hide steps' : 'Show cooking steps'}
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <ol className="mt-3 space-y-1.5">
                {meal.steps.map((step, i) => (
                  <li key={i} className="text-xs text-white/40 flex gap-2">
                    <span className="text-purple-400/50 shrink-0">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <PageWrapper>
      <SectionHeader title={t.nutrifai.title} subtitle={t.nutrifai.subtitle} badge="Growth Tracker" />

      {/* Medical Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto mb-8"
      >
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400 shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-amber-400/70 text-sm">{t.nutrifai.disclaimer}</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {(isAnalyzing || isGeneratingMeal) && <LoadingOverlay message={isAnalyzing ? t.nutrifai.analyzing : t.common.loading} />}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
              <h3 className="text-lg font-semibold text-white">Growth Data</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">{t.nutrifai.birthWeight}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={birthWeight}
                    onChange={(e) => setBirthWeight(e.target.value)}
                    placeholder="3.2"
                    className="input-magic text-sm py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">{t.nutrifai.currentAge}</label>
                  <input
                    type="number"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(e.target.value)}
                    placeholder="24"
                    className="input-magic text-sm py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">{t.nutrifai.currentHeight}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentHeight}
                    onChange={(e) => setCurrentHeight(e.target.value)}
                    placeholder="84"
                    className="input-magic text-sm py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">{t.nutrifai.currentWeight}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    placeholder="11.5"
                    className="input-magic text-sm py-3"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">{t.nutrifai.gender}</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['male', 'female'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`py-3 rounded-xl text-sm font-medium transition-all ${
                        gender === g
                          ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 border'
                          : 'bg-white/5 border border-white/10 text-white/50 hover:text-white/70'
                      }`}
                    >
                      {g === 'male' ? '👦 ' : '👧 '}{t.nutrifai[g]}
                    </button>
                  ))}
                </div>
              </div>

              <TokenCostPreview cost={analysisTokens} label={t.nutrifai.estimatedTokens} />

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!birthWeight || !currentAge || !currentHeight || !currentWeight || tokens < analysisTokens}
                className="btn-magic w-full py-3.5 text-base disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t.nutrifai.analyze}
              </button>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {result ? (
              <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-xl bg-white/5">
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'analysis' ? 'bg-purple-500/20 text-purple-300' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {t.nutrifai.result}
                  </button>
                  <button
                    onClick={() => mealPlan ? setActiveTab('meals') : handleGenerateMealPlan()}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === 'meals' ? 'bg-purple-500/20 text-purple-300' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {t.nutrifai.mealPlan}
                  </button>
                </div>

                {activeTab === 'analysis' ? (
                  <div className="space-y-5">
                    {/* Category */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${categoryColors[result.category] || categoryColors.Normal}`}>
                      <span className="w-2 h-2 rounded-full bg-current" />
                      {result.category}
                    </div>

                    {/* Insights */}
                    <div>
                      <h4 className="text-sm font-semibold text-white/70 mb-2">{t.nutrifai.insights}</h4>
                      <ul className="space-y-2">
                        {result.insights.map((insight, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                            <span className="text-green-400 mt-1 shrink-0">&#10003;</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Projection */}
                    <div>
                      <h4 className="text-sm font-semibold text-white/70 mb-2">{t.nutrifai.projection}</h4>
                      <ul className="space-y-2">
                        {result.projection.map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                            <span className="text-blue-400 mt-0.5 shrink-0">&#8594;</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="text-sm font-semibold text-white/70 mb-2">{t.nutrifai.recommendations}</h4>
                      <ul className="space-y-2">
                        {result.recommendations.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                            <span className="text-purple-400 mt-0.5 shrink-0">&#9679;</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Generate meal plan button */}
                    {!mealPlan && (
                      <button
                        onClick={handleGenerateMealPlan}
                        className="btn-outline-magic w-full py-3 text-sm"
                      >
                        {t.nutrifai.generateMealPlan} (2 tokens)
                      </button>
                    )}
                  </div>
                ) : mealPlan ? (
                  <div className="space-y-4">
                    <MealCard meal={mealPlan.breakfast} label={t.nutrifai.breakfast} />
                    <MealCard meal={mealPlan.lunch} label={t.nutrifai.lunch} />
                    <MealCard meal={mealPlan.dinner} label={t.nutrifai.dinner} />
                    <MealCard meal={mealPlan.snack} label={t.nutrifai.snack} />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/30 text-sm mb-4">Generate a personalized meal plan</p>
                    <button
                      onClick={handleGenerateMealPlan}
                      className="btn-magic py-3 px-6 text-sm"
                    >
                      {t.nutrifai.generateMealPlan}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-white/5 flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <p className="text-white/30 text-sm">Enter growth data and analyze to see results</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
