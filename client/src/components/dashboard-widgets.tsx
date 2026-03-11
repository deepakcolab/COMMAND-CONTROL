import { Vc } from "@shared/schema";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from "recharts";

// --- Clock Component ---
export function RealTimeClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-end">
      <div className="text-3xl font-bold font-mono-num tracking-tight text-[#E6EDF3] drop-shadow-[0_0_6px_rgba(16,185,129,0.35)]">
        {format(time, "HH:mm:ss")}
      </div>
      <div className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
        {format(time, "EEEE, dd MMM yyyy")}
      </div>
    </div>
  );
}

// --- Masking Helper ---
export function maskData(str?: string | null) {
  if (!str) return "N/A";
  if (str.length <= 4) return "****";
  return str.substring(0, 2) + "•••" + str.substring(str.length - 2);
}

// --- KPI Card ---
interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  colorClass?: string;
}

export function KpiCard({ title, value, icon, trend, colorClass = "text-primary" }: KpiCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col justify-between relative overflow-hidden group">
      {/* Subtle top border accent */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-current opacity-50 ${colorClass}`} />

      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[#9FB3C8]">{title}</h3>
        <div className={`p-2 rounded-md bg-background/50 ${colorClass}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold font-mono-num text-[#E6EDF3]">{value}</span>
        {trend && <span className="text-sm font-medium text-muted-foreground">{trend}</span>}
      </div>
    </div>
  );
}

// --- Analytics Charts ---
const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444'];

export function StatusPieChart({ vcs }: { vcs: Vc[] }) {
  const data = [
    { name: 'Live', value: vcs.filter(v => v.status === 'Live').length },
    { name: 'Upcoming', value: vcs.filter(v => v.status === 'upcoming').length },
    { name: 'Completed', value: vcs.filter(v => v.status === 'completed').length },
  ].filter(d => d.value > 0);

  if (data.length === 0) return <EmptyChart message="No data available" />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={
              entry.name === 'Live' ? 'hsl(var(--primary))' :
                entry.name === 'Upcoming' ? 'hsl(var(--accent))' :
                  'hsl(var(--secondary))'
            } />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: '#E6EDF3', backdropFilter: 'blur(6px)' }}
          itemStyle={{ color: '#E6EDF3', backdropFilter: 'blur(6px)' }}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function HourlyDistributionChart({ vcs }: { vcs: Vc[] }) {
  // Aggregate VCs by hour
  const hourlyData = Array.from({ length: 24 }).map((_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    count: 0
  }));

  vcs.forEach(vc => {
    const d = new Date(vc.startTime);
    if (!isNaN(d.getTime())) {
      const hour = d.getHours();
      hourlyData[hour].count += 1;
    }
  });

  // Filter to only show working hours roughly if it's empty outside, or just show all
  const filteredData = hourlyData.filter(d => d.count > 0).length > 0
    ? hourlyData.filter(d => parseInt(d.hour) >= 8 && parseInt(d.hour) <= 20)
    : hourlyData.slice(8, 20);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          tickFormatter={(value) => `${value} VCs`}
          label={{
            value: "No. of Scheduled VCs",
            angle: -90,
            position: "insideLeft",
            fill: "hsl(var(--muted-foreground))",
            fontSize: 12,
            offset: 10
          }}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
          contentStyle={{
            backgroundColor: "#0f172a",
            borderColor: "#1e293b",
            color: "#fff",
            borderRadius: "8px"
          }}
          labelFormatter={(label) => `Time Slot: ${label}`}
          formatter={(value: number) => [`${value} VC(s)`, "Scheduled"]}
        />
        <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[2, 2, 0, 0]} name="Scheduled VCs" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm flex-col gap-2">
      <AlertCircle className="w-6 h-6 opacity-50" />
      <span>{message}</span>
    </div>
  );
}

// --- Ticker ---
export function NewsTicker() {
  const items = [
    "General guidelines for participants during Videoconferencing",
    "Please be attentive and maintain right posture as others are watching you.",
    "Do not move / hold the Microphone.Switch on Microphone only when you want to speak.",
    "Do not put any paper / articles close to Microphone.",
    "Avoid using mobile phones or keep in silent mode.",
    "Avoid bringing eatables, water bottle etc.as they obstruct camera view.",
    "If you have any presentation, get it tested well in advance.",
  ];

  return (
    <div className="h-10 bg-card border-t border-border flex items-center overflow-hidden shrink-0 relative">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-card to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-card to-transparent z-10" />

      <div className="flex items-center px-4 shrink-0 bg-emerald-500/15 border-r border-primary/20 h-full z-20">
        <span className="text-emerald-400 font-bold text-xs tracking-widest flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          GUIDELINES
        </span>
      </div>

      <motion.div
        className="flex whitespace-nowrap gap-16 px-8 items-center"
        animate={{ x: [0, -2000] }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
      >
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="text-sm font-mono tracking-wide uppercase text-[#B8C7D9]">
            {item}
            <span className="text-border">|</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
