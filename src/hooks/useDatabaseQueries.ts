import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Donor, BloodUnit, LabTest, Prediction, Notification } from "@/lib/types";

// Helper to map DB row to app type
const mapDonor = (row: any): Donor => ({
  id: row.id,
  name: row.name,
  age: row.age,
  gender: row.gender,
  bloodGroup: row.blood_group,
  contact: row.contact,
  address: row.address,
  lastDonationDate: row.last_donation_date,
  eligible: row.eligible,
});

const mapBloodUnit = (row: any): BloodUnit => ({
  id: row.id,
  donorId: row.donor_id,
  donorName: row.donor_name,
  bloodGroup: row.blood_group,
  collectedDate: row.collected_date,
  expiryDate: row.expiry_date,
  status: row.status,
  labTestId: row.lab_test_id,
});

const mapLabTest = (row: any): LabTest => ({
  id: row.id,
  bloodUnitId: row.blood_unit_id,
  donorName: row.donor_name,
  bloodGroup: row.blood_group,
  date: row.date,
  hemoglobin: row.hemoglobin,
  rbcCount: row.rbc_count,
  wbcCount: row.wbc_count,
  plateletCount: row.platelet_count,
  hematocrit: row.hematocrit,
  mcv: row.mcv,
  mch: row.mch,
  mchc: row.mchc,
  result: row.result,
});

const mapPrediction = (row: any): Prediction => ({
  id: row.id,
  labTestId: row.lab_test_id,
  donorName: row.donor_name,
  date: row.date,
  disease: row.disease,
  confidence: row.confidence,
  severity: row.severity,
  description: row.description,
});

const mapNotification = (row: any): Notification => ({
  id: row.id,
  type: row.type,
  title: row.title,
  message: row.message,
  date: row.date,
  read: row.read,
  donorId: row.donor_id,
});

export function useDonors() {
  return useQuery({
    queryKey: ["donors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("donors").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapDonor);
    },
  });
}

export function useAddDonor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (donor: Donor) => {
      const { error } = await supabase.from("donors").insert({
        id: donor.id,
        name: donor.name,
        age: donor.age,
        gender: donor.gender,
        blood_group: donor.bloodGroup,
        contact: donor.contact,
        address: donor.address,
        last_donation_date: donor.lastDonationDate,
        eligible: donor.eligible,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["donors"] }),
  });
}

export function useBloodUnits() {
  return useQuery({
    queryKey: ["blood_units"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blood_units").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapBloodUnit);
    },
  });
}

export function useLabTests() {
  return useQuery({
    queryKey: ["lab_tests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lab_tests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapLabTest);
    },
  });
}

export function usePredictions() {
  return useQuery({
    queryKey: ["predictions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("predictions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapPrediction);
    },
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapNotification);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
