import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Megaphone, FileCheck, MessageSquare, UserPlus, Clock, CalendarClock } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useNotifications, type Notification, type NotificationType } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

const ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  announcement: Megaphone,
  project_status: FileCheck,
  project_feedback: MessageSquare,
  team_assignment: UserPlus,
  mentor_assignment: UserPlus,
  deadline: CalendarClock,
};

const relativeTime = (iso: string) => {
  const delta = (Date.now() - new Date(iso).getTime()) / 1000;
  if (delta < 60)        return 'just now';
  if (delta < 3600)      return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400)     return `${Math.floor(delta / 3600)}h ago`;
  if (delta < 7 * 86400) return `${Math.floor(delta / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-GB');
};

const Row: React.FC<{ n: Notification; onClick: () => void }> = ({ n, onClick }) => {
  const Icon = ICONS[n.type] ?? Bell;
  const body = (
    <div
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 p-3 cursor-pointer transition-colors hover:bg-muted/60',
        !n.read_at && 'bg-primary/5'
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
        n.read_at ? 'bg-muted text-muted-foreground' : 'bg-primary/15 text-primary'
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="text-sm font-medium leading-snug flex-1 line-clamp-2">{n.title}</p>
          {!n.read_at && <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" aria-label="unread" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
        <p className="text-[10px] text-muted-foreground mt-1">{relativeTime(n.created_at)}</p>
      </div>
    </div>
  );
  return n.link ? <Link to={n.link} className="block">{body}</Link> : body;
};

const NotificationsBell: React.FC = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          className="relative p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          <Bell className="w-4 h-4 text-sidebar-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 p-0"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <p className="font-heading font-semibold text-sm">Notifications</p>
            <p className="text-[10px] text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 gap-1"
              onClick={(e) => { e.preventDefault(); markAllAsRead(); }}
            >
              <CheckCheck className="w-3 h-3" /> Mark all
            </Button>
          )}
        </div>

        {loading && notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Clock className="w-3 h-3 animate-spin" /> Loading…
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="text-xs text-muted-foreground mt-1">You'll see updates here as they happen.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <Row
                  key={n.id}
                  n={n}
                  onClick={() => { if (!n.read_at) markAsRead(n.id); }}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsBell;
