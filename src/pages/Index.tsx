import { motion } from "framer-motion";
import { Droplets, Users, FlaskConical, Package, Brain, AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import StatCard from "@/components/StatCard";
import { useDonors, useBloodUnits, usePredictions, useNotifications } from "@/hooks/useDatabaseQueries";

const bloodGroupData = [
  { name: "O+", units: 45 },
  { name: "A+", units: 38 },
  { name: "B+", units: 32 },
  { name: "AB+", units: 12 },
  { name: "O-", units: 18 },
  { name: "A-", units: 14 },
  { name: "B-", units: 9 },
  { name: "AB-", units: 5 },
];

const predictionDistribution = [
  { name: "Normal", value: 62, color: "hsl(142 71% 45%)" },
  { name: "Anemia", value: 18, color: "hsl(0 72% 51%)" },
  { name: "Infection", value: 10, color: "hsl(38 92% 50%)" },
  { name: "Platelet Disorder", value: 6, color: "hsl(217 91% 60%)" },
  { name: "Other", value: 4, color: "hsl(280 65% 60%)" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { data: donors = [] } = useDonors();
  const { data: bloodUnits = [] } = useBloodUnits();
  const { data: predictions = [] } = usePredictions();
  const { data: notifications = [] } = useNotifications();

  const availableUnits = bloodUnits.filter((u) => u.status === "available").length;
  const abnormalPredictions = predictions.filter((p) => p.severity !== "normal").length;
  const unreadAlerts = notifications.filter((n) => !n.read).length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Smart Blood Bank Management System — Overview</p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Donors" value={donors.length} subtitle="2 new this month" icon={<Users className="w-5 h-5" />} variant="primary" trend={{ value: 12, positive: true }} />
        <StatCard title="Blood Units" value={availableUnits} subtitle="Available for transfusion" icon={<Droplets className="w-5 h-5" />} variant="success" />
        <StatCard title="ML Predictions" value={abnormalPredictions} subtitle="Abnormal results detected" icon={<Brain className="w-5 h-5" />} variant="warning" />
        <StatCard title="Active Alerts" value={unreadAlerts} subtitle="Unread notifications" icon={<AlertTriangle className="w-5 h-5" />} variant="info" />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Group Distribution */}
        <motion.div variants={item} className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            Blood Inventory by Group
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bloodGroupData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
              <Bar dataKey="units" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Prediction Distribution */}
        <motion.div variants={item} className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            Disease Prediction Distribution
          </h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie data={predictionDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {predictionDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {predictionDistribution.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-semibold text-foreground ml-auto">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
}
