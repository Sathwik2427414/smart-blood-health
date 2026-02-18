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
    // 1. Try donor by donorId
    let donor = notif.donorId ? donors.find(d => d.id === notif.donorId) : null;

    // 2. Try by name extracted from title "Prediction Result — Name"
    if (!donor) {
      const nameMatch = notif.title.match(/—\s*(.+)$/);
      if (nameMatch) {
        const extractedName = nameMatch[1].trim().toLowerCase();
        donor = donors.find(d => d.name.toLowerCase() === extractedName);
      }
    }

    // 3. Try any word in the title that matches a donor name
    if (!donor) {
      donor = donors.find(d => notif.title.toLowerCase().includes(d.name.toLowerCase()));
    }

    if (!donor) {
      toast({
        title: "Donor not found",
        description: "No matching donor in the system for this notification. Make sure the donor is registered in Donor Management.",
        variant: "destructive",
      });
      return;
    }

    if (!donor.contact) {
      toast({
        title: "No contact number",
        description: `No phone number found for ${donor.name}. Update their contact in Donor Management.`,
        variant: "destructive",
      });
      return;
    }

    // Mock SMS send
    toast({
      title: "📱 SMS Sent!",
      description: `Message sent to ${donor.name} (${donor.contact}): "${notif.message}"`,
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
          <div key={n.id} className={`bg-card border rounded-xl p-4 transition-all ${!n.read ? "border-destructive/30 bg-destructive/5 shadow-sm" : "border-success/20 bg-success/5"}`}>
            <div className="flex items-start gap-3">
              <span className="text-lg">{typeIcon[n.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-foreground truncate">{n.title}</h4>
                  <span className="text-[10px] text-muted-foreground shrink-0">{n.date}</span>
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
                {/* Read status dot: green = read, red = unread */}
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    n.read
                      ? "bg-success"
                      : "bg-destructive animate-pulse"
                  }`}
                  title={n.read ? "Read" : "Unread"}
                />
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
