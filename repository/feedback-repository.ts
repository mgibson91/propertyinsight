'use server';

import { db } from './kysely-connection';

export interface FeedbackModel {
  id: string;
  feedback: string;
  created_at: Date;
  user_id?: string;
}

export async function submitFeedback(feedback: { feedback: string }): Promise<void> {
  await db.insertInto('feedback').values(feedback).execute();
}

export async function getAllFeedback(): Promise<FeedbackModel[]> {
  const results = await db.selectFrom('feedback').selectAll().execute();
  return results.map(result => ({
    id: result.id,
    feedback: result.feedback,
    created_at: result.created_at,
    user_id: result.user_id || undefined,
  }));
}
