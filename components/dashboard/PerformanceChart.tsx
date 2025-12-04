"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface PerformanceChartProps {
  data: Array<{
    exam_title: string;
    score: number;
    date: string;
  }>;
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  // Format data for chart
  const chartData = data.slice(0, 10).reverse().map((item, index) => ({
    name: `امتحان ${index + 1}`,
    score: item.score,
    fullTitle: item.exam_title,
    date: new Date(item.date).toLocaleDateString('ar-EG', {
      month: 'short',
      day: 'numeric'
    })
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="
        rounded-2xl p-6 h-full
        bg-white/[0.03]
        border border-white/[0.05]
        hover:bg-white/[0.05] hover:border-white/[0.08]
        backdrop-blur-xl
        transition-all duration-300
      "
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      <h3 className="text-xl font-bold text-white mb-6">📊 أداؤك في الامتحانات</h3>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '12px',
                direction: 'rtl'
              }}
              labelStyle={{ color: '#fff', marginBottom: '8px' }}
              itemStyle={{ color: '#a78bfa' }}
              formatter={(value: number, name: string, props: any) => [
                `${value.toFixed(2)}%`,
                props.payload.fullTitle
              ]}
              labelFormatter={(label, payload) => {
                if (payload && payload.length > 0) {
                  return payload[0].payload.date;
                }
                return label;
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#a78bfa' }}
              fill="url(#scoreGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-gray-500 text-center">
            لا توجد امتحانات مكتملة حتى الآن<br />
            <span className="text-sm">ابدأ أول امتحان لك لترى أداءك هنا!</span>
          </p>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">أعلى درجة</p>
            <p className="text-white font-bold">
              {Math.max(...chartData.map(d => d.score)).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">أقل درجة</p>
            <p className="text-white font-bold">
              {Math.min(...chartData.map(d => d.score)).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">المتوسط</p>
            <p className="text-white font-bold">
              {(chartData.reduce((acc, d) => acc + d.score, 0) / chartData.length).toFixed(1)}%
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
