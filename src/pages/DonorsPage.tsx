import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Search, Check, X } from "lucide-react";
import { useDonors, useAddDonor, useAddBloodUnit, useBloodUnits } from "@/hooks/useDatabaseQueries";
import { BloodUnit } from "@/lib/types";
import { Donor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function DonorsPage() {
  const { data: donors = [], isLoading } = useDonors();
  const { data: bloodUnits = [] } = useBloodUnits();
  const addDonor = useAddDonor();
  const addBloodUnit = useAddBloodUnit();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", age: "", gender: "Male" as Donor["gender"], bloodGroup: "O+" as Donor["bloodGroup"], contact: "", email: "", address: "", componentType: "Whole Blood" });

  const filtered = donors.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.bloodGroup.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async () => {
    if (!form.name || !form.age) return;
    const donorId = `D${String(donors.length + 1).padStart(3, "0")}`;
    const today = new Date().toISOString().split("T")[0];
    const expiryDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const newDonor: Donor = {
      id: donorId,
      name: form.name,
      age: parseInt(form.age),
      gender: form.gender,
      bloodGroup: form.bloodGroup,
      contact: form.contact,
      email: form.email,
      address: form.address,
      lastDonationDate: today,
      eligible: true,
    };
    const newBloodUnit: BloodUnit = {
      id: `BU${String(bloodUnits.length + 1).padStart(3, "0")}`,
      donorId: donorId,
      donorName: form.name,
      bloodGroup: form.bloodGroup,
      componentType: form.componentType,
      collectedDate: today,
      expiryDate: expiryDate,
      status: "available",
    };
    try {
      await addDonor.mutateAsync(newDonor);
      await addBloodUnit.mutateAsync(newBloodUnit);
      setOpen(false);
      setForm({ name: "", age: "", gender: "Male", bloodGroup: "O+", contact: "", email: "", address: "", componentType: "Whole Blood" });
      toast({ title: "Donor registered", description: `${form.name} has been added with a blood unit.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to register donor.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading donors...</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Donor Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Register and manage blood donors</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 glow-primary gap-2">
              <Plus className="w-4 h-4" /> Add Donor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Register New Donor</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Full Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter name" /></div>
                <div><Label>Age</Label><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="Age" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v as Donor["gender"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Blood Group</Label>
                  <Select value={form.bloodGroup} onValueChange={(v) => setForm({ ...form, bloodGroup: v as Donor["bloodGroup"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Contact</Label><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Phone number" /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="donor@email.com" /></div>
              <div><Label>Blood Component</Label>
                <Select value={form.componentType} onValueChange={(v) => setForm({ ...form, componentType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Whole Blood","Plasma","RBC","WBC","Platelets"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="City, State" /></div>
              <Button onClick={handleAdd} disabled={addDonor.isPending} className="gradient-primary border-0 w-full">
                {addDonor.isPending ? "Registering..." : "Register Donor"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search donors..." className="pl-9" />
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Age/Gender</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Blood Group</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Contact</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Last Donation</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{d.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{d.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.age} / {d.gender}</td>
                  <td className="px-4 py-3"><Badge variant="secondary" className="font-mono font-bold">{d.bloodGroup}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{d.contact}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{d.lastDonationDate}</td>
                  <td className="px-4 py-3">{d.eligible ? <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><Check className="w-3 h-3" />Eligible</span> : <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive"><X className="w-3 h-3" />Not Eligible</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
