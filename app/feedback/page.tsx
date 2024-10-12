import React from 'react';
import { getAllFeedback } from '../../repository/feedback-repository';
import FeedbackClientPage from './client-page';

export default async function Page() {
  const feedbackList = await getAllFeedback();

  return <FeedbackClientPage initialFeedback={feedbackList} />;
}
