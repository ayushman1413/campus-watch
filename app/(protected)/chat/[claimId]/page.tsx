'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/use-auth';
import { useClaimsStore } from '@/lib/stores/claims-store';
import { format } from 'date-fns';

export default function ChatPage({ params }: { params: { claimId: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { getClaimById, getMessagesByClaim, addMessage } = useClaimsStore();
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const claim = getClaimById(params.claimId);
  const messages = getMessagesByClaim(params.claimId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) {
    router.push('/login');
    return null;
  }

  if (!claim) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold">Claim not found</h1>
          <Button onClick={() => router.push('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const otherUser = user.id === claim.claimantId ? claim.item.user : claim.claimant;

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    addMessage({
      claimId: claim.id,
      senderId: user.id,
      sender: user,
      content: newMessage,
    });

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />

      <div className="container py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                  <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{otherUser.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Claim for: {claim.item.title}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  claim.status === 'pending'
                    ? 'warning'
                    : claim.status === 'approved'
                    ? 'success'
                    : 'destructive'
                }
              >
                {claim.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => {
                  const isCurrentUser = message.senderId === user.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 animate-fade-in ${
                        isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                        <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                        <div
                          className={`inline-block rounded-lg px-4 py-2 max-w-[70%] ${
                            isCurrentUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(message.timestamp), 'p')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              {claim.status === 'approved' && claim.otp && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-green-900">
                    Handover OTP: <span className="text-xl font-bold">{claim.otp}</span>
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Share this OTP when collecting/handing over the item
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} className="gap-2">
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claim Details */}
        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Claim Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Claimed on</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(claim.createdAt), 'PPP')}
              </p>
            </div>

            {claim.verificationAnswer && (
              <div>
                <p className="text-sm font-medium">Verification Answer</p>
                <p className="text-sm text-muted-foreground">{claim.verificationAnswer}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium">Initial Message</p>
              <p className="text-sm text-muted-foreground">{claim.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
