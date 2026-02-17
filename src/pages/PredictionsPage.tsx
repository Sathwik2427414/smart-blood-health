import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Zap, RotateCw, Activity, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CBCInput, PredictionResult, predictDiseases, generateSampleCBC } from "@/lib/predictionEngine";
import { useAddLabTest, useAddPrediction, useLabTests, usePredictions } from "@/hooks/useDatabaseQueries";
import { useToast } from "@/hooks/use-toast";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const severityBadge = (s: PredictionResult["severity"]) => {
  const map = {
    normal: "bg-success/15 text-success border-success/30",
    mild: "bg-warning/15 text-warning border-warning/30",
    moderate: "bg-destructive/15 text-destructive border-destructive/30",
    severe: "bg-destructive text-destructive-foreground border-destructive",
  };
  return <Badge className={`${map[s]} hover:opacity-80 uppercase text-[10px] tracking-wider`}>{s}</Badge>;
};

const fields: { key: keyof CBCInput; label: string; unit: string }[] = [
  { key: "hemoglobin", label: "Hemoglobin (Hb)", unit: "g/dL" },
  { key: "rbcCount", label: "RBC Count", unit: "M/μL" },
  { key: "wbcCount", label: "WBC Count", unit: "K/μL" },
  { key: "plateletCount", label: "Platelet Count", unit: "K/μL" },
  { key: "hematocrit", label: "Hematocrit (PCV)", unit: "%" },
  { key: "mcv", label: "MCV", unit: "fL" },
  { key: "mch", label: "MCH", unit: "pg" },
  { key: "mchc", label: "MCHC", unit: "g/dL" },
];

export default function PredictionsPage() {
  const [donorName, setDonorName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [input, setInput] = useState<CBCInput>(generateSampleCBC());
  const [results, setResults] = useState<PredictionResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const addLabTest = useAddLabTest();
  const addPrediction = useAddPrediction();
  const { data: labTests = [] } = useLabTests();
  const { data: predictions = [] } = usePredictions();
  const { toast } = useToast();

  const handlePredict = () => {
    setLoading(true);
    setTimeout(() => {
      setResults(predictDiseases(input));
      setLoading(false);
    }, 1200);
  };

  const handleRandomize = () => {
    setInput(generateSampleCBC());
    setResults(null);
  };

  const updateField = (key: keyof CBCInput, value: string) => {
    setInput({ ...input, [key]: parseFloat(value) || 0 });
  };

  const handleSaveToDb = async () => {
    if (!donorName.trim()) {
      toast({ title: "Error", description: "Please enter donor name before saving.", variant: "destructive" });
      return;
    }
    if (!results || results.length === 0) {
      toast({ title: "Error", description: "Run prediction first before saving.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const labTestId = `LT${String(labTests.length + 1).padStart(3, "0")}`;
      const hasAbnormal = results.some(r => r.severity !== "normal");

      // Save lab test
      await addLabTest.mutateAsync({
        id: labTestId,
        bloodUnitId: null as any,
        donorName: donorName.trim(),
        bloodGroup: bloodGroup,
        date: today,
        hemoglobin: input.hemoglobin,
        rbcCount: input.rbcCount,
        wbcCount: input.wbcCount,
        plateletCount: input.plateletCount,
        hematocrit: input.hematocrit,
        mcv: input.mcv,
        mch: input.mch,
        mchc: input.mchc,
        result: hasAbnormal ? "abnormal" : "safe",
      });

      // Save each prediction result
      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        await addPrediction.mutateAsync({
          id: `P${String(predictions.length + 1 + i).padStart(3, "0")}`,
          labTestId: labTestId,
          donorName: donorName.trim(),
          date: today,
          disease: r.disease,
          confidence: r.confidence,
          severity: r.severity,
          description: r.description,
        });
      }

      toast({ title: "Saved!", description: `Lab test & ${results.length} prediction(s) saved for ${donorName}.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save results.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" /> ML Disease Prediction
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Predictive health screening using CBC lab values — Random Forest + Neural Network classification
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <motion.div variants={item} className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> CBC Parameters
            </h3>
            <Button variant="outline" size="sm" onClick={handleRandomize} className="gap-1.5 text-xs">
              <RotateCw className="w-3 h-3" /> Random Sample
            </Button>
          </div>

          {/* Donor Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Donor Name</Label>
              <Input
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Enter donor name"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Blood Group</Label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {fields.map((f) => (
              <div key={f.key}>
                <Label className="text-xs text-muted-foreground">{f.label}</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={input[f.key]}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    className="pr-12 font-mono text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{f.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handlePredict} disabled={loading} className="w-full gradient-primary border-0 glow-primary gap-2 text-sm font-semibold">
            {loading ? <><RotateCw className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Zap className="w-4 h-4" /> Run Prediction</>}
          </Button>
        </motion.div>

        {/* Results */}
        <motion.div variants={item} className="space-y-4">
          {!results && !loading && (
            <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <Brain className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Enter CBC values and click "Run Prediction"</p>
              <p className="text-xs text-muted-foreground/60 mt-1">ML engine will classify potential diseases</p>
            </div>
          )}

          {loading && (
            <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full gradient-primary animate-pulse-glow flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Running ML models...</p>
              <p className="text-xs text-muted-foreground mt-1">Random Forest + Neural Network classification</p>
            </div>
          )}

          {results && !loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">🧬 Prediction Results</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveToDb}
                  disabled={saving}
                  className="gap-1.5 text-xs"
                >
                  <Save className="w-3 h-3" />
                  {saving ? "Saving..." : "Save to Lab Tests & Report"}
                </Button>
              </div>
              {results.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-card border border-border rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground">{r.disease}</h4>
                    {severityBadge(r.severity)}
                  </div>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-mono font-bold text-foreground">{(r.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={r.confidence * 100} className="h-2" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
