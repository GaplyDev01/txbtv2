'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-4 rounded-lg ${
              m.role === 'user'
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-white text-gray-800'
            } max-w-[80%]`}
          >
            <div className="font-semibold mb-1">
              {m.role === 'user' ? 'You' : 'AI'}
            </div>
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask anything..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </form>
    </div>
  );
}
