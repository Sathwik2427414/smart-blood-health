import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Check } from "lucide-react";
import { sampleNotifications } from "@/lib/sampleData";
import { Notification } from "@/lib/types";
import { Button } from "@/components/ui/button";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const typeIcon: Record<string, string> = { alert: "🔴", warning: "🟡", info: "🔵" };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);

  const markAllRead = () => setNotifications(notifications.map((n) => ({ ...n, read: true })));
  const unread = notifications.filter((n) => !n.read).length;

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
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1.5 text-xs">
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
              {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 animate-pulse-glow" />}
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
