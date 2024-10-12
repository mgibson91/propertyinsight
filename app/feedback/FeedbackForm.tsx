'use client';

import React, { useState } from 'react';
import { submitFeedback } from '@/repository/feedback-repository';
import { Button, TextField } from '@radix-ui/themes';

export default function FeedbackForm() {
  const [text, setText] = useState('');

  const handleSubmit = async () => {
    await submitFeedback({ feedback: text });
    setText('');
  };

  return (
    <div className={'flex flex-row justify-center items-center gap-3 p-2'}>
      <TextField.Root
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="How can we make Property Insight better?"
        className="w-full"
      />
      <Button variant={'outline'} onClick={handleSubmit}>
        Submit Feedback
      </Button>
    </div>
  );
}
