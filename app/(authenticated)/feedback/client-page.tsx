'use client';

import React, { useState } from 'react';
import { FeedbackModel } from '@/repository/feedback-repository';

export default function FeedbackClientPage({ initialFeedback }: { initialFeedback: FeedbackModel[] }) {
  const [feedbackList, setFeedbackList] = useState(initialFeedback);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p>{JSON.stringify(feedbackList)}</p>
      <h1 className="text-2xl font-bold mb-4">Feedback</h1>
      <ul className="">
        {feedbackList.map((feedback, index) => (
          <li key={index} className="p-2 border-b border-gray-300">
            <p>
              <strong>User:</strong> {feedback.user_id}
            </p>
            <p>
              <strong>Feedback:</strong> {feedback.feedback}
            </p>
            {/*<p>*/}
            {/*  <strong>Time:</strong> {feedback.created_at}*/}
            {/*</p>*/}
          </li>
        ))}
      </ul>
    </div>
  );
}
