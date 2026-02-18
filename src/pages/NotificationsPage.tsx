import { motion } from "framer-motion";
import { Bell, Check, Send } from "lucide-react";
import { useNotifications, useMarkAllNotificationsRead, useDonors } from "@/hooks/useDatabaseQueries";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const typeIcon: Record<string, string> = { alert: "🔴", warning: "🟡", info: "🔵" };

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: donors = [] } = useDonors();
  const markAllRead = useMarkAllNotificationsRead();
  const { toast } = useToast();

  const unread = notifications.filter((n) => !n.read).length;

  const handleSendSMS = (notif: typeof notifications[0]) => {
    // Find donor by donorId or by name from title
    let donor = notif.donorId ? donors.find(d => d.id === notif.donorId) : null;
    if (!donor) {
      // Try to extract name from title "Prediction Result — Name"
      const nameMatch = notif.title.match(/—\s*(.+)$/);
      if (nameMatch) {
        donor = donors.find(d => d.name.toLowerCase() === nameMatch[1].trim().toLowerCase());
      }
    }

    if (!donor) {
      toast({ title: "Donor not found", description: "Could not find donor details to send message.", variant: "destructive" });
      return;
    }

    if (!donor.contact) {
      toast({ title: "No contact number", description: `No phone number found for ${donor.name}.`, variant: "destructive" });
      return;
    }

    // Mock SMS send
    toast({
      title: "📱 SMS Sent!",
      description: `Message sent to ${donor.name} at ${donor.contact}: "${notif.message}"`,
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading notifications...</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" /> Notifications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{unread} unread alerts</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} className="gap-1.5 text-xs">
            <Check className="w-3 h-3" /> Mark all read
          </Button>
        )}
      </motion.div>

      <motion.div variants={item} className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className={`bg-card border rounded-xl p-4 transition-all ${!n.read ? "border-primary/30 bg-accent/30 shadow-sm" : "border-border"}`}>
            <div className="flex items-start gap-3">
              <span className="text-lg">{typeIcon[n.type]}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">{n.title}</h4>
                  <span className="text-[10px] text-muted-foreground">{n.date}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendSMS(n)}
                  className="gap-1.5 text-xs"
                >
                  <Send className="w-3 h-3" /> Send
                </Button>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 animate-pulse-glow" />}
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
