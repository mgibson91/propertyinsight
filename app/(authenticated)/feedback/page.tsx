import React from 'react';
import { getAllFeedback } from '@/repository/feedback-repository';
import FeedbackClientPage from '@/app/(authenticated)/feedback/client-page';

export default async function Page() {
  const feedbackList = await getAllFeedback();

  return <FeedbackClientPage initialFeedback={feedbackList} />;
}
