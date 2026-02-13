export interface Donor {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  contact: string;
  address: string;
  lastDonationDate: string;
  eligible: boolean;
}

export interface BloodUnit {
  id: string;
  donorId: string;
  donorName: string;
  bloodGroup: string;
  collectedDate: string;
  expiryDate: string;
  status: "available" | "reserved" | "expired" | "used";
  labTestId?: string;
}

export interface LabTest {
  id: string;
  bloodUnitId: string;
  donorName: string;
  bloodGroup: string;
  date: string;
  hemoglobin: number;
  rbcCount: number;
  wbcCount: number;
  plateletCount: number;
  hematocrit: number;
  mcv: number;
  mch: number;
  mchc: number;
  result: "pending" | "safe" | "abnormal";
}

export interface Prediction {
  id: string;
  labTestId: string;
  donorName: string;
  date: string;
  disease: string;
  confidence: number;
  severity: "normal" | "mild" | "moderate" | "severe";
  description: string;
}

export interface Notification {
  id: string;
  type: "alert" | "info" | "warning";
  title: string;
  message: string;
  date: string;
  read: boolean;
  donorId?: string;
}
