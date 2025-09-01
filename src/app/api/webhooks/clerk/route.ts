import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

interface WebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
}

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.text();

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  
  if (eventType === 'user.created') {
    try {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      
      // Create user in database
      const user = await db.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0]?.email_address || '',
          firstName: first_name || '',
          lastName: last_name || '',
          avatar: image_url || null,
          role: UserRole.CUSTOMER,
        },
      });
      
      console.log('User created:', user.id);
    } catch (error) {
      console.error('Error creating user:', error);
      return new Response('Error creating user', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    try {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      
      // Update user in database
      await db.user.update({
        where: {
          clerkId: id,
        },
        data: {
          email: email_addresses[0]?.email_address || '',
          firstName: first_name || '',
          lastName: last_name || '',
          avatar: image_url || null,
        },
      });
      
      console.log('User updated:', id);
    } catch (error) {
      console.error('Error updating user:', error);
      return new Response('Error updating user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    try {
      const { id } = evt.data;
      
      // Delete user from database
      await db.user.delete({
        where: {
          clerkId: id,
        },
      });
      
      console.log('User deleted:', id);
    } catch (error) {
      console.error('Error deleting user:', error);
      return new Response('Error deleting user', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}