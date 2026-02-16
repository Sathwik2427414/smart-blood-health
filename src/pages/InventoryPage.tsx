import { motion } from "framer-motion";
import { Package, AlertTriangle, Check, Clock } from "lucide-react";
import { useBloodUnits } from "@/hooks/useDatabaseQueries";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/StatCard";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const statusConfig: Record<string, { label: string; className: string }> = {
  available: { label: "Available", className: "bg-success/15 text-success border-success/30" },
  reserved: { label: "Reserved", className: "bg-info/15 text-info border-info/30" },
  expired: { label: "Expired", className: "bg-destructive/15 text-destructive border-destructive/30" },
  used: { label: "Used", className: "bg-muted text-muted-foreground border-border" },
};

export default function InventoryPage() {
  const { data: bloodUnits = [], isLoading } = useBloodUnits();

  const available = bloodUnits.filter((u) => u.status === "available").length;
  const expired = bloodUnits.filter((u) => u.status === "expired").length;
  const reserved = bloodUnits.filter((u) => u.status === "reserved").length;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading inventory...</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" /> Blood Inventory
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time blood stock and expiry tracking</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Available Units" value={available} icon={<Check className="w-5 h-5" />} variant="success" />
        <StatCard title="Reserved" value={reserved} icon={<Clock className="w-5 h-5" />} variant="info" />
        <StatCard title="Expired" value={expired} icon={<AlertTriangle className="w-5 h-5" />} variant="warning" subtitle="Auto-removed from stock" />
      </motion.div>

      <motion.div variants={item} className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Unit ID", "Donor", "Blood Group", "Collected", "Expiry", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bloodUnits.map((u) => {
                const s = statusConfig[u.status];
                const isExpiringSoon = u.status === "available" && new Date(u.expiryDate) < new Date(Date.now() + 14 * 86400000);
                return (
                  <tr key={u.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${isExpiringSoon ? "bg-warning/5" : ""}`}>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.id}</td>
                    <td className="px-4 py-3 font-medium text-foreground text-xs">{u.donorName}</td>
                    <td className="px-4 py-3"><Badge variant="secondary" className="font-mono font-bold">{u.bloodGroup}</Badge></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{u.collectedDate}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {u.expiryDate}
                      {isExpiringSoon && <span className="ml-1 text-warning">⚠</span>}
                    </td>
                    <td className="px-4 py-3"><Badge className={`${s.className} hover:opacity-80`}>{s.label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
