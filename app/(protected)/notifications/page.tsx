'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/use-auth';
import { useNotificationStore } from '@/lib/stores/use-notification';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Spinner from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { Bell, Trash2, Archive, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
  } = useNotificationStore();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
      getUnreadCount(user.id);
    }
  }, [user?.id]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await markAllAsRead(user.id);
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      toast({
        title: 'Success',
        description: 'Notification deleted',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleArchive = async (notificationId: string) => {
    try {
      await archiveNotification(notificationId);
      toast({
        title: 'Success',
        description: 'Notification archived',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <Spinner fullScreen text="Loading notifications..." />;
  }

  const unreadNotifications = notifications.filter((n) => n.status === 'unread');
  const archivedNotifications = notifications.filter((n) => n.status === 'archived');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'claim':
        return '🎯';
      case 'message':
        return '💬';
      case 'match':
        return '✨';
      case 'status':
        return '📝';
      case 'security':
        return '🚨';
      case 'announcement':
        return '📢';
      default:
        return '🔔';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'claim':
        return 'bg-blue-100 text-blue-800';
      case 'message':
        return 'bg-green-100 text-green-800';
      case 'match':
        return 'bg-purple-100 text-purple-800';
      case 'status':
        return 'bg-yellow-100 text-yellow-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      case 'announcement':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />

      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Notifications</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Bell className="w-4 h-4" />
              {unreadCount} new notifications
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Unread Notifications */}
        {unreadNotifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Unread</h2>
            <div className="space-y-3">
              {unreadNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  icon={getNotificationIcon(notification.type)}
                  typeColor={getTypeColor(notification.type)}
                  onMarkRead={() => handleMarkAsRead(notification.id)}
                  onDelete={() => handleDelete(notification.id)}
                  onArchive={() => handleArchive(notification.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Read Notifications */}
        {notifications.filter((n) => n.status === 'read').length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Read</h2>
            <div className="space-y-3">
              {notifications
                .filter((n) => n.status === 'read')
                .map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    icon={getNotificationIcon(notification.type)}
                    typeColor={getTypeColor(notification.type)}
                    onDelete={() => handleDelete(notification.id)}
                    onArchive={() => handleArchive(notification.id)}
                    isRead
                  />
                ))}
            </div>
          </div>
        )}

        {/* Archived Notifications */}
        {archivedNotifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Archived</h2>
            <div className="space-y-3">
              {archivedNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  icon={getNotificationIcon(notification.type)}
                  typeColor={getTypeColor(notification.type)}
                  onDelete={() => handleDelete(notification.id)}
                  isArchived
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No notifications yet</p>
              <p className="text-muted-foreground text-sm">
                You'll get notified about claims, messages, and more
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function NotificationCard({
  notification,
  icon,
  typeColor,
  onMarkRead,
  onDelete,
  onArchive,
  isRead,
  isArchived,
}: {
  notification: any;
  icon: string;
  typeColor: string;
  onMarkRead?: () => void;
  onDelete: () => void;
  onArchive?: () => void;
  isRead?: boolean;
  isArchived?: boolean;
}) {
  return (
    <Card className={isRead ? 'opacity-75' : ''}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="text-2xl">{icon}</div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold">{notification.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              </div>
              <Badge className={typeColor}>{notification.type}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(notification.created_at).toLocaleDateString()} at{' '}
              {new Date(notification.created_at).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex gap-2">
            {!isRead && onMarkRead && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onMarkRead}
                title="Mark as read"
              >
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            )}
            {!isArchived && onArchive && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onArchive}
                title="Archive"
              >
                <Archive className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
