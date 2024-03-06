'use client';

import React, { useState } from 'react';

export default function DemoComponent() {
  const [color, setColor] = useState('Red');
  const [age, setAge] = useState(30);
  const [threshold, setThreshold] = useState(20);

  return (
    <div className="bg-pink-700 p-6 max-w-sm mx-auto rounded-lg shadow-md">
      <div className="mb-4">
        <label htmlFor="color" className="block text-sm font-medium text-gray-700">
          Color
        </label>
        <select
          id="color"
          value={color}
          onChange={e => setColor(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option>Red</option>
          <option>Blue</option>
          <option>Green</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="age" className="block text-sm font-medium text-gray-700">
          Age
        </label>
        <input
          type="number"
          id="age"
          value={age}
          onChange={e => setAge(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="threshold" className="block text-sm font-medium text-gray-700">
          Threshold
        </label>
        <input
          type="range"
          id="threshold"
          min="0"
          max="100"
          value={threshold}
          onChange={e => setThreshold(e.target.value)}
          className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="flex justify-between text-xs px-2">
          <span>0</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}
