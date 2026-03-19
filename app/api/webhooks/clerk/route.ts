import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createUserProfile, updateUserProfile, getUserProfileByClerkId } from '@/lib/db';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET is not set');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, created_at } = evt.data;
    const primaryEmail = email_addresses.find((email) => email.id === evt.data.primary_email_address_id);

    // Create user profile in database
    try {
      createUserProfile(id, primaryEmail?.email_address);
      console.log('✓ User profile created:', id);

      // Track signup completion in PostHog (server-side)
      if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        try {
          const event = {
            api_key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
            event: 'signup_completed',
            properties: {
              distinct_id: id,
              email: primaryEmail?.email_address,
              source: 'clerk_webhook',
              timestamp: created_at ? new Date(created_at).toISOString() : new Date().toISOString(),
              $set: {
                email: primaryEmail?.email_address,
              },
            },
            timestamp: created_at ? new Date(created_at).toISOString() : new Date().toISOString(),
          };

          // Send to PostHog API (server-side capture)
          await fetch('https://app.posthog.com/capture/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
          });

          console.log('✓ PostHog signup_completed tracked:', id);
        } catch (analyticsError) {
          // Don't fail webhook if analytics fails
          console.warn('PostHog tracking failed:', analyticsError);
        }
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      return new Response('Error creating user profile', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const primaryEmail = email_addresses.find((email) => email.id === evt.data.primary_email_address_id);

    // Update user profile in database
    try {
      const existingUser = await getUserProfileByClerkId(id);
      if (existingUser) {
        updateUserProfile(id, {
          email: primaryEmail?.email_address,
          first_name: first_name || undefined,
          last_name: last_name || undefined,
        });
        console.log('✓ User profile updated:', id);
      } else {
        // Create if doesn't exist (safety fallback)
        createUserProfile(id, primaryEmail?.email_address);
        console.log('✓ User profile created (via update event):', id);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      return new Response('Error updating user profile', { status: 500 });
    }
  }

  return new Response('Webhook processed', { status: 200 });
}
