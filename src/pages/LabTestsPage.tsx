import { motion } from "framer-motion";
import { FlaskConical } from "lucide-react";
import { sampleLabTests } from "@/lib/sampleData";
import { Badge } from "@/components/ui/badge";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const resultBadge = (result: string) => {
  if (result === "safe") return <Badge className="bg-success/15 text-success border-success/30 hover:bg-success/20">Safe</Badge>;
  if (result === "abnormal") return <Badge className="bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20">Abnormal</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
};

export default function LabTestsPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-primary" /> Lab Tests & Reports
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Complete Blood Count (CBC) results for donated units</p>
      </motion.div>

      <motion.div variants={item} className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["ID", "Donor", "Blood", "Date", "Hb", "RBC", "WBC", "PLT", "HCT", "MCV", "MCH", "MCHC", "Result"].map((h) => (
                  <th key={h} className="text-left px-3 py-3 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleLabTests.map((t) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{t.id}</td>
                  <td className="px-3 py-3 font-medium text-foreground text-xs">{t.donorName}</td>
                  <td className="px-3 py-3"><Badge variant="secondary" className="font-mono text-[10px]">{t.bloodGroup}</Badge></td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{t.date}</td>
                  <td className={`px-3 py-3 font-mono text-xs ${t.hemoglobin < 12 ? "text-destructive font-bold" : "text-foreground"}`}>{t.hemoglobin}</td>
                  <td className={`px-3 py-3 font-mono text-xs ${t.rbcCount < 4 || t.rbcCount > 5.9 ? "text-destructive font-bold" : "text-foreground"}`}>{t.rbcCount}</td>
                  <td className={`px-3 py-3 font-mono text-xs ${t.wbcCount > 11 ? "text-warning font-bold" : t.wbcCount < 4.5 ? "text-destructive font-bold" : "text-foreground"}`}>{t.wbcCount}</td>
                  <td className={`px-3 py-3 font-mono text-xs ${t.plateletCount < 150 ? "text-destructive font-bold" : "text-foreground"}`}>{t.plateletCount}</td>
                  <td className={`px-3 py-3 font-mono text-xs ${t.hematocrit < 36 ? "text-destructive font-bold" : "text-foreground"}`}>{t.hematocrit}</td>
                  <td className="px-3 py-3 font-mono text-xs text-foreground">{t.mcv}</td>
                  <td className="px-3 py-3 font-mono text-xs text-foreground">{t.mch}</td>
                  <td className="px-3 py-3 font-mono text-xs text-foreground">{t.mchc}</td>
                  <td className="px-3 py-3">{resultBadge(t.result)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Reference Ranges */}
      <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">📋 Normal Reference Ranges</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            { label: "Hemoglobin", range: "12–17.5 g/dL" },
            { label: "RBC Count", range: "4.0–5.9 M/μL" },
            { label: "WBC Count", range: "4.5–11.0 K/μL" },
            { label: "Platelets", range: "150–400 K/μL" },
            { label: "Hematocrit", range: "36–50%" },
            { label: "MCV", range: "80–100 fL" },
            { label: "MCH", range: "27–33 pg" },
            { label: "MCHC", range: "32–36 g/dL" },
          ].map((r) => (
            <div key={r.label} className="bg-muted/50 rounded-lg px-3 py-2">
              <p className="font-medium text-foreground">{r.label}</p>
              <p className="text-muted-foreground font-mono">{r.range}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
