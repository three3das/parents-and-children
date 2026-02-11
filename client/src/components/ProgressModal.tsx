import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { GameType } from "@shared/schema";

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

interface GameStats {
  gameType: string;
  gameName: string;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
}

interface ProgressData {
  stats: GameStats[];
  totals: {
    attempted: number;
    correct: number;
    incorrect: number;
    skipped: number;
  };
}

// Game type to emoji mapping
const GAME_EMOJIS: Record<string, string> = {
  'picture-match': '🖼️',
  'spell-word': '✏️',
  'syllables': '🧱',
  'sentence-game': '📝',
  'audio-picture': '🔊',
  'audio-sentence': '🎧',
};

// Map gameType to translation key
const GAME_TYPE_TO_KEY: Record<string, string> = {
  'picture-match': 'pictureMatch',
  'spell-word': 'spellWord',
  'syllables': 'syllables',
  'sentence-game': 'sentenceGame',
  'audio-picture': 'audioPicture',
  'audio-sentence': 'audioSentence',
};

export function ProgressModal({ isOpen, onClose, sessionId }: ProgressModalProps) {
  const { t, language } = useLanguage();
  const [fromDate, setFromDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default: last 30 days
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch progress data when dates change
  useEffect(() => {
    if (isOpen && fromDate && toDate) {
      fetchProgressData();
    }
  }, [isOpen, fromDate, toDate, sessionId]);

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/progress/stats?sessionId=${sessionId}&from=${fromDate}&to=${toDate}`
      );
      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get translated game name
  const getGameName = (gameType: string): string => {
    const key = GAME_TYPE_TO_KEY[gameType];
    if (key && t.progress?.gameNames) {
      return (t.progress.gameNames as any)[key] || gameType;
    }
    return gameType;
  };

  // Prepare chart data - for horizontal bars, we need game name on left + stacked bar on right
  const chartData = progressData?.stats.map(stat => ({
    name: `${GAME_EMOJIS[stat.gameType] || '🎮'} ${getGameName(stat.gameType)}`,
    gameType: stat.gameType,
    [t.progress?.correct || 'Правильно']: stat.correct,
    [t.progress?.incorrect || 'Ошибки']: stat.incorrect,
  })) || [];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              📊 {t.progress?.title || 'Прогресс'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Date Range Selection */}
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex flex-wrap items-center gap-4 justify-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600">
                  {t.progress?.fromDate || 'С какого дня'}:
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600">
                  {t.progress?.toDate || 'По какой день'}:
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-xl">⏳ {t.loading}</div>
              </div>
            ) : chartData.length > 0 ? (
              <>
                <div style={{ height: Math.max(300, chartData.length * 50) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 14 }}
                        width={110}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded-lg shadow-lg">
                                <p className="font-bold mb-2">{data.name}</p>
                                {payload.map((entry: any, index: number) => (
                                  <p key={index} style={{ color: entry.color }}>
                                    {entry.name}: {entry.value}
                                  </p>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey={t.progress?.correct || 'Правильно'}
                        stackId="a"
                        fill="#22C55E"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey={t.progress?.incorrect || 'Ошибки'}
                        stackId="a"
                        fill="#EF4444"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Totals */}
                {progressData?.totals && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-bold text-lg mb-3">
                      {t.progress?.summary || 'Итого'}:
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-100 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {progressData.totals.attempted}
                        </div>
                        <div className="text-sm text-blue-800">
                          {t.progress?.attempted || 'Всего'}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {progressData.totals.correct}
                        </div>
                        <div className="text-sm text-green-800">
                          {t.progress?.correct || 'Правильно'}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-red-100 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {progressData.totals.incorrect}
                        </div>
                        <div className="text-sm text-red-800">
                          {t.progress?.incorrect || 'Ошибки'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <div className="text-4xl mb-4">📊</div>
                <p>{t.progress?.noData || 'Нет данных за выбранный период'}</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
