'use client';

import { useState } from 'react';
import { Mail, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

/**
 * Invite Friends Modal Component
 * Allows users to send referral invitations via email
 */
export function InviteFriendsModal({ referralCode }: { referralCode: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendInvitation = async () => {
    // Validate email
    if (!friendEmail || !friendEmail.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/email/send-referral-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friendEmail,
          personalMessage: personalMessage.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      toast({
        title: '✉️ Invitation sent!',
        description: `Referral invitation sent to ${friendEmail}`,
      });

      // Reset form and close modal
      setFriendEmail('');
      setPersonalMessage('');
      setIsOpen(false);
    } catch (error: any) {
      console.error('Failed to send invitation:', error);
      toast({
        title: 'Failed to send invitation',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          <Mail className="w-4 h-4 mr-2" />
          Invite by Email
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Invite a Friend</DialogTitle>
          <DialogDescription className="text-slate-400">
            Send a personalized referral invitation via email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Friend's Email */}
          <div>
            <label htmlFor="friendEmail" className="block text-sm font-medium text-slate-300 mb-2">
              Friend's Email Address
            </label>
            <input
              id="friendEmail"
              type="email"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              placeholder="friend@example.com"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={isSending}
            />
          </div>

          {/* Personal Message (Optional) */}
          <div>
            <label htmlFor="personalMessage" className="block text-sm font-medium text-slate-300 mb-2">
              Personal Message <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              id="personalMessage"
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              placeholder="Hey! I've been using TaxBridge for my cross-border taxes and thought you might find it useful..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              disabled={isSending}
            />
            <div className="text-xs text-slate-500 mt-1 text-right">
              {personalMessage.length}/500
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">Your friend will receive:</p>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• <span className="text-emerald-400 font-semibold">20% discount</span> on their first year ($60 savings)</li>
              <li>• Your personal message (if added)</li>
              <li>• Info about TaxBridge features</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSending}
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInvitation}
              disabled={isSending || !friendEmail}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
