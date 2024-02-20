'use server';

import { db } from '@/repository/kysely-connection';
import { getLogger } from '@/utils/logging/logger';
import { UserEvent } from '@/repository/user-events/record-user-event';

export type LatestUserEventResponse = {
  id: string;
  userId: string;
  event: UserEvent;
  data: any; // Assuming the data column in user_events is JSON or similar
  timestamp: string;
};

export type UserEventQueryParams = {
  userId: string;
  event?: string; // Made optional to fetch any event type
  // after: string;
};

export async function getLatestUserEvents(
  params: UserEventQueryParams,
  correlationId?: string
): Promise<LatestUserEventResponse[]> {
  // Updated return type to an array
  const logger = getLogger('getLatestUserEvents', {
    // Renamed for clarity
    correlationId,
    ...params,
  });

  logger.info('Getting latest user events after specified time', params);

  try {
    const query = db
      .selectFrom('user_events')
      .selectAll()
      .where('user_id', '=', params.userId)
      // .where('timestamp', '>', new Date(params.after))
      .orderBy('timestamp', 'desc')
      .limit(10); // Fetch up to 10 latest events

    if (params.event) {
      query.where('event', '=', params.event); // Conditional where clause for event type
    }

    const data = await query.execute();

    if (data.length === 0) {
      return [];
    }

    const latestEvents = data.map(event => ({
      id: event.id,
      userId: event.user_id,
      event: event.event as UserEvent,
      data: event.data,
      timestamp: event.timestamp.toISOString(),
    })) satisfies LatestUserEventResponse[];

    return latestEvents;
  } catch (error) {
    logger.error('Error getting latest user events after specified time', error || {});
    throw error;
  }
}
