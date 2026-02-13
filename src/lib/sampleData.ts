import { Donor, BloodUnit, LabTest, Prediction, Notification } from "./types";

export const sampleDonors: Donor[] = [
  { id: "D001", name: "Rahul Sharma", age: 28, gender: "Male", bloodGroup: "O+", contact: "+91 98765 43210", address: "Mumbai, Maharashtra", lastDonationDate: "2025-11-15", eligible: true },
  { id: "D002", name: "Priya Patel", age: 32, gender: "Female", bloodGroup: "A+", contact: "+91 87654 32109", address: "Delhi, NCR", lastDonationDate: "2025-12-20", eligible: true },
  { id: "D003", name: "Amit Kumar", age: 45, gender: "Male", bloodGroup: "B+", contact: "+91 76543 21098", address: "Bangalore, Karnataka", lastDonationDate: "2025-10-05", eligible: true },
  { id: "D004", name: "Sneha Reddy", age: 24, gender: "Female", bloodGroup: "AB-", contact: "+91 65432 10987", address: "Hyderabad, Telangana", lastDonationDate: "2026-01-10", eligible: false },
  { id: "D005", name: "Vikram Singh", age: 36, gender: "Male", bloodGroup: "O-", contact: "+91 54321 09876", address: "Pune, Maharashtra", lastDonationDate: "2025-09-25", eligible: true },
  { id: "D006", name: "Anjali Gupta", age: 29, gender: "Female", bloodGroup: "A-", contact: "+91 43210 98765", address: "Chennai, Tamil Nadu", lastDonationDate: "2025-11-30", eligible: true },
];

export const sampleBloodUnits: BloodUnit[] = [
  { id: "BU001", donorId: "D001", donorName: "Rahul Sharma", bloodGroup: "O+", collectedDate: "2025-11-15", expiryDate: "2026-02-15", status: "available" },
  { id: "BU002", donorId: "D002", donorName: "Priya Patel", bloodGroup: "A+", collectedDate: "2025-12-20", expiryDate: "2026-03-20", status: "available" },
  { id: "BU003", donorId: "D003", donorName: "Amit Kumar", bloodGroup: "B+", collectedDate: "2025-10-05", expiryDate: "2026-01-05", status: "expired" },
  { id: "BU004", donorId: "D004", donorName: "Sneha Reddy", bloodGroup: "AB-", collectedDate: "2026-01-10", expiryDate: "2026-04-10", status: "available" },
  { id: "BU005", donorId: "D005", donorName: "Vikram Singh", bloodGroup: "O-", collectedDate: "2025-09-25", expiryDate: "2025-12-25", status: "used" },
  { id: "BU006", donorId: "D006", donorName: "Anjali Gupta", bloodGroup: "A-", collectedDate: "2025-11-30", expiryDate: "2026-02-28", status: "reserved" },
];

export const sampleLabTests: LabTest[] = [
  { id: "LT001", bloodUnitId: "BU001", donorName: "Rahul Sharma", bloodGroup: "O+", date: "2025-11-15", hemoglobin: 14.5, rbcCount: 4.8, wbcCount: 6.5, plateletCount: 250, hematocrit: 42, mcv: 88, mch: 30, mchc: 34, result: "safe" },
  { id: "LT002", bloodUnitId: "BU002", donorName: "Priya Patel", bloodGroup: "A+", date: "2025-12-20", hemoglobin: 9.2, rbcCount: 3.2, wbcCount: 7.1, plateletCount: 180, hematocrit: 30, mcv: 72, mch: 24, mchc: 31, result: "abnormal" },
  { id: "LT003", bloodUnitId: "BU003", donorName: "Amit Kumar", bloodGroup: "B+", date: "2025-10-05", hemoglobin: 15.1, rbcCount: 5.1, wbcCount: 14.2, plateletCount: 310, hematocrit: 44, mcv: 90, mch: 31, mchc: 34, result: "abnormal" },
  { id: "LT004", bloodUnitId: "BU004", donorName: "Sneha Reddy", bloodGroup: "AB-", date: "2026-01-10", hemoglobin: 13.8, rbcCount: 4.6, wbcCount: 5.8, plateletCount: 220, hematocrit: 40, mcv: 87, mch: 29, mchc: 33, result: "safe" },
  { id: "LT005", bloodUnitId: "BU005", donorName: "Vikram Singh", bloodGroup: "O-", date: "2025-09-25", hemoglobin: 7.5, rbcCount: 2.8, wbcCount: 3.2, plateletCount: 85, hematocrit: 24, mcv: 92, mch: 30, mchc: 33, result: "abnormal" },
];

export const samplePredictions: Prediction[] = [
  { id: "P001", labTestId: "LT002", donorName: "Priya Patel", date: "2025-12-20", disease: "Anemia", confidence: 0.87, severity: "moderate", description: "Microcytic anemia. Hb: 9.2 g/dL" },
  { id: "P002", labTestId: "LT003", donorName: "Amit Kumar", date: "2025-10-05", disease: "Lung Disease / Infection", confidence: 0.72, severity: "mild", description: "Elevated WBC count (14.2K/μL)" },
  { id: "P003", labTestId: "LT005", donorName: "Vikram Singh", date: "2025-09-25", disease: "Bone Marrow Disorder", confidence: 0.89, severity: "severe", description: "Pancytopenia detected" },
  { id: "P004", labTestId: "LT005", donorName: "Vikram Singh", date: "2025-09-25", disease: "Thrombocytopenia", confidence: 0.82, severity: "severe", description: "Platelets critically low (85K/μL)" },
];

export const sampleNotifications: Notification[] = [
  { id: "N001", type: "alert", title: "Critical Result: Vikram Singh", message: "Blood screening shows severe abnormalities. Immediate consultation recommended.", date: "2025-09-25", read: false, donorId: "D005" },
  { id: "N002", type: "warning", title: "Abnormal Result: Priya Patel", message: "Donor blood screening indicates moderate anemia. Follow-up advised.", date: "2025-12-20", read: false, donorId: "D002" },
  { id: "N003", type: "info", title: "Blood Unit Expired", message: "Blood unit BU003 (B+) has expired and been removed from inventory.", date: "2026-01-06", read: true },
  { id: "N004", type: "warning", title: "Elevated WBC: Amit Kumar", message: "Donor screening shows elevated WBC. Possible infection indicator.", date: "2025-10-05", read: true, donorId: "D003" },
];
