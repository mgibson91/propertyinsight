import React, { useEffect, useState } from 'react';
import { FeedbackModel, getAllFeedback } from '@/repository/feedback-repository';
import ClientPage from './client-page';

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<FeedbackModel[]>([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      const feedback = await getAllFeedback();
      setFeedbackList(feedback);
    };
    fetchFeedback();
  }, []);

  return <ClientPage initialFeedback={feedbackList} />;
}
