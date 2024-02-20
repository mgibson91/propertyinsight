'use server';

import { db } from '@/repository/kysely-connection';
import { getLogger } from '@/utils/logging/logger';

export type UserEvent = 'logged-in' | 'added-gateways';

export type UserEventInput = {
  userId: string;
  event: UserEvent;
  data?: any; // Optionally include additional data associated with the event
};

export async function recordUserEvent(eventInput: UserEventInput, correlationId?: string): Promise<void> {
  const logger = getLogger('recordUserEvent', {
    correlationId,
    userId: eventInput.userId,
    event: eventInput.event,
  });

  logger.info('Recording user event', eventInput);

  try {
    await db
      .insertInto('user_events')
      .values({
        user_id: eventInput.userId,
        event: eventInput.event,
        data: eventInput.data || null, // Default to null if no data is provided
        timestamp: new Date(), // Automatically sets the current time
      })
      .execute();

    logger.info('User event recorded successfully');
  } catch (error) {
    logger.error('Error recording user event', error || {});
    throw error;
  }
}
