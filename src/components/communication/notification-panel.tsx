'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  FileText, 
  CreditCard,
  Settings,
  CheckCircle,
  X,
  Volume2,
  VolumeX
} from 'lucide-react';

interface NotificationSetting {
  id: string;
  category: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

interface NotificationItem {
  id: string;
  type: 'policy' | 'claim' | 'payment' | 'system' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

export function NotificationPanel() {
  const [activeTab, setActiveTab] = useState<'recent' | 'settings'>('recent');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: '1',
      category: 'Policy Updates',
      title: 'Policy Changes',
      description: 'Notifications about policy renewals, updates, and changes',
      email: true,
      push: true,
      sms: false
    },
    {
      id: '2',
      category: 'Claim Updates',
      title: 'Claim Status Changes',
      description: 'Updates on claim processing, approvals, and payments',
      email: true,
      push: true,
      sms: true
    },
    {
      id: '3',
      category: 'Payment Reminders',
      title: 'Payment Due Dates',
      description: 'Reminders for upcoming premium payments',
      email: true,
      push: false,
      sms: true
    },
    {
      id: '4',
      category: 'System Messages',
      title: 'System Updates',
      description: 'Important system maintenance and feature updates',
      email: false,
      push: true,
      sms: false
    },
    {
      id: '5',
      category: 'Marketing',
      title: 'Promotional Offers',
      description: 'Special offers and insurance product promotions',
      email: false,
      push: false,
      sms: false
    }
  ]);

  const recentNotifications: NotificationItem[] = [
    {
      id: '1',
      type: 'claim',
      title: 'Claim Status Update',
      message: 'Your claim CL-2024-001 has been approved for processing.',
      timestamp: '5 minutes ago',
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Reminder',
      message: 'Your premium payment of R399 is due in 3 days.',
      timestamp: '2 hours ago',
      read: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'policy',
      title: 'Policy Renewal Available',
      message: 'Your home insurance policy is eligible for renewal.',
      timestamp: '1 day ago',
      read: true,
      priority: 'low'
    },
    {
      id: '4',
      type: 'message',
      title: 'New Message from Agent',
      message: 'Sarah Johnson has sent you a message about your policy.',
      timestamp: '2 days ago',
      read: true,
      priority: 'medium'
    },
    {
      id: '5',
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance tonight from 2 AM to 4 AM.',
      timestamp: '3 days ago',
      read: true,
      priority: 'low'
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'policy':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'claim':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'payment':
        return <CreditCard className="h-5 w-5 text-orange-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'medium':
        return <Badge variant="warning" className="text-xs">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary" className="text-xs">Low</Badge>;
      default:
        return null;
    }
  };

  const updateNotificationSetting = (id: string, field: 'email' | 'push' | 'sms', value: boolean) => {
    setNotificationSettings(prev => 
      prev.map(setting => 
        setting.id === id ? { ...setting, [field]: value } : setting
      )
    );
  };

  const markAsRead = (notificationId: string) => {
    // In real implementation, this would update the backend
    console.log(`Marking notification ${notificationId} as read`);
  };

  const dismissNotification = (notificationId: string) => {
    // In real implementation, this would remove the notification
    console.log(`Dismissing notification ${notificationId}`);
  };

  return (
    <Card className="w-full h-[600px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage your notification preferences and view recent alerts
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={activeTab === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('recent')}
            >
              Recent
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="h-[calc(100%-120px)] overflow-auto">
        {activeTab === 'recent' ? (
          <div className="space-y-4">
            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-green-500" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  Sound notifications {soundEnabled ? 'enabled' : 'disabled'}
                </span>
              </div>
              <Switch 
                checked={soundEnabled} 
                onCheckedChange={setSoundEnabled} 
              />
            </div>

            {/* Recent Notifications */}
            <div className="space-y-3">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                    !notification.read 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-muted/20 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium text-sm ${
                            !notification.read ? 'text-primary' : 'text-foreground'
                          }`}>
                            {notification.title}
                          </h4>
                          {getPriorityBadge(notification.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.timestamp}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-8 w-8 p-0"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissNotification(notification.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {recentNotifications.length === 0 && (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No notifications</h3>
                <p className="text-sm text-muted-foreground">
                  You're all caught up! No new notifications at this time.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Notification Preferences</h3>
              <p className="text-sm text-muted-foreground">
                Choose how you want to receive notifications for different types of events.
              </p>
            </div>

            <div className="space-y-6">
              {notificationSettings.map((setting) => (
                <Card key={setting.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{setting.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {setting.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${setting.id}-email`}
                          checked={setting.email}
                          onCheckedChange={(checked) => 
                            updateNotificationSetting(setting.id, 'email', checked)
                          }
                        />
                        <Label htmlFor={`${setting.id}-email`} className="text-sm">
                          <Mail className="h-4 w-4 inline mr-1" />
                          Email
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${setting.id}-push`}
                          checked={setting.push}
                          onCheckedChange={(checked) => 
                            updateNotificationSetting(setting.id, 'push', checked)
                          }
                        />
                        <Label htmlFor={`${setting.id}-push`} className="text-sm">
                          <Bell className="h-4 w-4 inline mr-1" />
                          Push
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${setting.id}-sms`}
                          checked={setting.sms}
                          onCheckedChange={(checked) => 
                            updateNotificationSetting(setting.id, 'sms', checked)
                          }
                        />
                        <Label htmlFor={`${setting.id}-sms`} className="text-sm">
                          <MessageSquare className="h-4 w-4 inline mr-1" />
                          SMS
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="pt-4 border-t">
              <Button className="w-full">
                Save Notification Preferences
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}