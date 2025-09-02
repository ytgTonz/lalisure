'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Filter, 
  Plus, 
  Paperclip,
  Star,
  Archive,
  Trash2,
  User
} from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  senderRole: string;
  recipient: string;
  subject: string;
  preview: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  category: 'claim' | 'policy' | 'general' | 'urgent';
}

export function MessageCenter() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const messages: Message[] = [
    {
      id: '1',
      sender: 'John Smith',
      senderRole: 'Customer',
      recipient: 'You',
      subject: 'Question about claim status',
      preview: 'Hi, I wanted to check on the status of my claim CL-2024-001...',
      timestamp: '2 hours ago',
      read: false,
      priority: 'high',
      category: 'claim'
    },
    {
      id: '2',
      sender: 'Sarah Johnson',
      senderRole: 'Agent',
      recipient: 'You',
      subject: 'Policy review needed',
      preview: 'Could you please review the policy application for...',
      timestamp: '4 hours ago',
      read: true,
      priority: 'medium',
      category: 'policy'
    },
    {
      id: '3',
      sender: 'Mike Davis',
      senderRole: 'Customer',
      recipient: 'You',
      subject: 'Payment confirmation',
      preview: 'Thank you for processing my payment. I have a question about...',
      timestamp: '1 day ago',
      read: true,
      priority: 'low',
      category: 'general'
    }
  ];

  const filteredMessages = filterCategory === 'all' 
    ? messages 
    : messages.filter(msg => msg.category === filterCategory);

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

  const getCategoryBadge = (category: string) => {
    const categoryStyles = {
      claim: 'bg-blue-100 text-blue-800',
      policy: 'bg-green-100 text-green-800',
      general: 'bg-gray-100 text-gray-800',
      urgent: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={`text-xs ${categoryStyles[category as keyof typeof categoryStyles]}`}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="h-[600px] flex border rounded-lg overflow-hidden">
      {/* Message List */}
      <div className="w-1/3 border-r bg-muted/50">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Messages</h2>
            <Button size="sm" onClick={() => setShowCompose(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-8" />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="claim">Claims</SelectItem>
                <SelectItem value="policy">Policies</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-auto h-[calc(100%-140px)]">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                selectedMessage?.id === message.id ? 'bg-muted' : ''
              } ${!message.read ? 'bg-blue-50' : ''}`}
              onClick={() => setSelectedMessage(message)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {message.sender.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className={`font-medium text-sm ${!message.read ? 'text-primary' : ''}`}>
                      {message.sender}
                    </p>
                    <p className="text-xs text-muted-foreground">{message.senderRole}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getPriorityBadge(message.priority)}
                  <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium text-sm truncate ${!message.read ? 'text-primary' : ''}`}>
                    {message.subject}
                  </h3>
                  {getCategoryBadge(message.category)}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {message.preview}
                </p>
              </div>
              
              {!message.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 flex flex-col">
        {selectedMessage ? (
          <>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {selectedMessage.sender.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">{selectedMessage.subject}</h2>
                    <p className="text-sm text-muted-foreground">
                      From {selectedMessage.sender} ({selectedMessage.senderRole})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(selectedMessage.priority)}
                  {getCategoryBadge(selectedMessage.category)}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Star className="h-4 w-4 mr-1" />
                  Star
                </Button>
                <Button variant="outline" size="sm">
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="flex-1 p-4">
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-muted-foreground mb-4">
                  Sent {selectedMessage.timestamp}
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p>{selectedMessage.preview}</p>
                  <p className="mt-4">
                    I would appreciate a quick response on this matter as it's quite urgent for me.
                    Please let me know if you need any additional information.
                  </p>
                  <p className="mt-4">
                    Best regards,<br />
                    {selectedMessage.sender}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t">
              <div className="space-y-3">
                <Textarea 
                  placeholder="Type your reply..." 
                  className="min-h-[80px]"
                />
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach File
                  </Button>
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : showCompose ? (
          <div className="flex-1 p-4">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Compose Message</h2>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="to">To</Label>
                  <Input id="to" placeholder="Select recipient..." />
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Enter subject..." />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claim">Claim</SelectItem>
                      <SelectItem value="policy">Policy</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message"
                    placeholder="Type your message..." 
                    className="min-h-[200px]"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => setShowCompose(false)}>
                    Cancel
                  </Button>
                  <div className="space-x-2">
                    <Button variant="outline">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach File
                    </Button>
                    <Button>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Message Selected</h3>
              <p className="text-sm text-muted-foreground">
                Choose a message from the list to view its content
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}