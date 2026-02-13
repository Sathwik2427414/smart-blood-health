// Rule-based CBC disease prediction engine
// Uses clinically-standard reference ranges for Complete Blood Count

export interface CBCInput {
  hemoglobin: number;      // g/dL
  rbcCount: number;        // million/μL
  wbcCount: number;        // thousand/μL
  plateletCount: number;   // thousand/μL
  hematocrit: number;      // %
  mcv: number;             // fL
  mch: number;             // pg
  mchc: number;            // g/dL
}

export interface PredictionResult {
  disease: string;
  confidence: number;
  severity: "normal" | "mild" | "moderate" | "severe";
  description: string;
  color: string;
}

interface RangeCheck {
  low: number;
  high: number;
}

const REFERENCE_RANGES: Record<keyof CBCInput, RangeCheck> = {
  hemoglobin: { low: 12, high: 17.5 },
  rbcCount: { low: 4.0, high: 5.9 },
  wbcCount: { low: 4.5, high: 11.0 },
  plateletCount: { low: 150, high: 400 },
  hematocrit: { low: 36, high: 50 },
  mcv: { low: 80, high: 100 },
  mch: { low: 27, high: 33 },
  mchc: { low: 32, high: 36 },
};

function deviation(value: number, range: RangeCheck): number {
  if (value < range.low) return (range.low - value) / range.low;
  if (value > range.high) return (value - range.high) / range.high;
  return 0;
}

function getSeverity(conf: number): PredictionResult["severity"] {
  if (conf < 0.3) return "normal";
  if (conf < 0.55) return "mild";
  if (conf < 0.75) return "moderate";
  return "severe";
}

export function predictDiseases(input: CBCInput): PredictionResult[] {
  const results: PredictionResult[] = [];
  const R = REFERENCE_RANGES;

  // 1. Anemia check
  const hbDev = deviation(input.hemoglobin, R.hemoglobin);
  const hctDev = deviation(input.hematocrit, R.hematocrit);
  if (input.hemoglobin < R.hemoglobin.low || input.hematocrit < R.hematocrit.low) {
    const conf = Math.min(0.95, 0.5 + (hbDev + hctDev) * 0.8);
    let type = "Normocytic";
    if (input.mcv < R.mcv.low) type = "Microcytic (Iron-deficiency)";
    else if (input.mcv > R.mcv.high) type = "Macrocytic (B12/Folate deficiency)";
    results.push({
      disease: "Anemia",
      confidence: conf,
      severity: getSeverity(conf),
      description: `${type} anemia detected. Hb: ${input.hemoglobin} g/dL (ref: ${R.hemoglobin.low}-${R.hemoglobin.high})`,
      color: "hsl(0 72% 51%)",
    });
  }

  // 2. Lung Disease / Infection
  const wbcDev = deviation(input.wbcCount, R.wbcCount);
  if (input.wbcCount > R.wbcCount.high) {
    const conf = Math.min(0.9, 0.4 + wbcDev * 1.2);
    results.push({
      disease: "Lung Disease / Infection Indicator",
      confidence: conf,
      severity: getSeverity(conf),
      description: `Elevated WBC count (${input.wbcCount}K/μL) suggests active infection or inflammation. Further testing recommended.`,
      color: "hsl(38 92% 50%)",
    });
  }

  // 3. Erythrocytosis
  if (input.rbcCount > R.rbcCount.high || input.hematocrit > R.hematocrit.high) {
    const rbcDev = deviation(input.rbcCount, R.rbcCount);
    const conf = Math.min(0.9, 0.45 + (rbcDev + hctDev) * 0.7);
    results.push({
      disease: "Erythrocytosis (High RBC)",
      confidence: conf,
      severity: getSeverity(conf),
      description: `Elevated RBC (${input.rbcCount}M/μL) and/or Hematocrit (${input.hematocrit}%). May indicate polycythemia.`,
      color: "hsl(280 65% 60%)",
    });
  }

  // 4. Bone Marrow Disorder
  const hasPancytopenia =
    input.hemoglobin < R.hemoglobin.low &&
    input.wbcCount < R.wbcCount.low &&
    input.plateletCount < R.plateletCount.low;
  if (hasPancytopenia) {
    const conf = Math.min(0.92, 0.6 + (hbDev + wbcDev) * 0.5);
    results.push({
      disease: "Bone Marrow Related Disorder",
      confidence: conf,
      severity: getSeverity(conf),
      description: `Pancytopenia detected — low Hb, WBC, and Platelets simultaneously. Bone marrow evaluation strongly recommended.`,
      color: "hsl(0 0% 50%)",
    });
  }

  // 5. Platelet Disorders
  const pltDev = deviation(input.plateletCount, R.plateletCount);
  if (input.plateletCount < R.plateletCount.low) {
    const conf = Math.min(0.9, 0.45 + pltDev * 1.1);
    results.push({
      disease: "Thrombocytopenia (Low Platelets)",
      confidence: conf,
      severity: getSeverity(conf),
      description: `Platelet count critically low (${input.plateletCount}K/μL). Risk of bleeding. Investigate cause.`,
      color: "hsl(217 91% 60%)",
    });
  } else if (input.plateletCount > R.plateletCount.high) {
    const conf = Math.min(0.85, 0.4 + pltDev * 1.0);
    results.push({
      disease: "Thrombocytosis (High Platelets)",
      confidence: conf,
      severity: getSeverity(conf),
      description: `Elevated platelet count (${input.plateletCount}K/μL). May indicate reactive thrombocytosis or myeloproliferative disorder.`,
      color: "hsl(217 91% 60%)",
    });
  }

  // 6. Normal
  if (results.length === 0) {
    results.push({
      disease: "Normal / Healthy",
      confidence: 0.95,
      severity: "normal",
      description: "All CBC parameters within normal reference ranges. Blood unit is safe for transfusion.",
      color: "hsl(142 71% 45%)",
    });
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

export function generateSampleCBC(): CBCInput {
  const random = (min: number, max: number) => +(Math.random() * (max - min) + min).toFixed(1);
  // Generate with ~40% chance of abnormal values
  const abnormal = Math.random() > 0.6;
  if (abnormal) {
    const type = Math.floor(Math.random() * 5);
    switch (type) {
      case 0: // Anemia
        return { hemoglobin: random(6, 11), rbcCount: random(2.5, 3.8), wbcCount: random(5, 9), plateletCount: random(160, 380), hematocrit: random(25, 35), mcv: random(65, 110), mch: random(22, 35), mchc: random(30, 37) };
      case 1: // Infection
        return { hemoglobin: random(12, 16), rbcCount: random(4.2, 5.5), wbcCount: random(12, 25), plateletCount: random(200, 450), hematocrit: random(38, 48), mcv: random(82, 98), mch: random(28, 32), mchc: random(33, 35) };
      case 2: // Erythrocytosis
        return { hemoglobin: random(17, 22), rbcCount: random(6.0, 8.0), wbcCount: random(5, 10), plateletCount: random(200, 350), hematocrit: random(52, 65), mcv: random(85, 95), mch: random(29, 33), mchc: random(33, 36) };
      case 3: // Bone marrow
        return { hemoglobin: random(5, 10), rbcCount: random(2, 3.5), wbcCount: random(1.5, 4), plateletCount: random(30, 140), hematocrit: random(20, 34), mcv: random(85, 100), mch: random(28, 33), mchc: random(32, 35) };
      default: // Platelet disorder
        return { hemoglobin: random(12, 16), rbcCount: random(4.2, 5.5), wbcCount: random(5, 9), plateletCount: random(20, 120), hematocrit: random(38, 47), mcv: random(82, 98), mch: random(28, 32), mchc: random(33, 35) };
    }
  }
  return { hemoglobin: random(12.5, 16.5), rbcCount: random(4.2, 5.5), wbcCount: random(5, 9.5), plateletCount: random(160, 380), hematocrit: random(37, 48), mcv: random(82, 96), mch: random(28, 32), mchc: random(33, 35) };
}
