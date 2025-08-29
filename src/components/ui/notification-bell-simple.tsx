'use client';

import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get unread count - with error handling
  const { data: unreadCount = 0, error: countError } = api.notification.getUnreadCount.useQuery(undefined, {
    retry: false,
    onError: (error) => {
      console.error('Failed to get unread count:', error);
    }
  });
  
  // Get notifications - only when dropdown is open
  const { data: notificationData, refetch, error: notificationError } = api.notification.getNotifications.useQuery({
    limit: 10,
    offset: 0,
    unreadOnly: false,
  }, {
    enabled: isOpen,
    retry: false,
    onError: (error) => {
      console.error('Failed to get notifications:', error);
    }
  });

  // Mutations
  const markAsReadMutation = api.notification.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Failed to mark notification as read:', error);
    }
  });

  const deleteMutation = api.notification.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Failed to delete notification:', error);
    }
  });

  const notifications = notificationData?.notifications || [];

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate({ notificationId });
  };

  const handleDelete = (notificationId: string) => {
    deleteMutation.mutate({ notificationId });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'POLICY_CREATED':
      case 'POLICY_RENEWED':
        return '🏠';
      case 'CLAIM_SUBMITTED':
      case 'CLAIM_STATUS_UPDATE':
        return '📋';
      case 'PAYMENT_DUE':
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_FAILED':
        return '💳';
      case 'WELCOME':
        return '👋';
      default:
        return '📢';
    }
  };

  // If there's an error with the notification system, show a simple bell
  if (countError || notificationError) {
    return (
      <Button variant="ghost" size="icon" className={className} title="Notifications (Error)">
        <Bell className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 flex h-2 w-2 items-center justify-center rounded-full bg-red-500"></span>
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <div className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        
        <div className="max-h-96 overflow-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-2 p-4 cursor-pointer hover:bg-muted"
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div className="flex w-full items-start gap-3">
                  <div className="flex-shrink-0 text-lg">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-medium text-sm ${!notification.read ? 'text-primary' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}