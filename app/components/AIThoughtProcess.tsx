'use client';

import { useState, useEffect, useRef } from 'react';
import { Brain, Clock, CheckCircle, Lightbulb, Coffee, Zap } from 'lucide-react';

interface ThoughtEntry {
  id: string;
  timestamp: string;
  type: 'thinking' | 'planning' | 'working' | 'completed' | 'insight' | 'break';
  wave?: number;
  waveName?: string;
  thought: string;
  details?: string;
  mood?: 'focused' | 'excited' | 'contemplative' | 'satisfied' | 'determined';
}

interface AIThoughtProcessProps {
  jobId?: string;
  className?: string;
}

const thoughtPersonalities = {
  thinking: {
    icon: Brain,
    color: 'text-blue-600 bg-blue-50',
    prefix: ['🤔 Hmm...', '💭 Let me think...', '🧠 Analyzing...', '🎯 Considering...']
  },
  planning: {
    icon: Lightbulb,
    color: 'text-yellow-600 bg-yellow-50',
    prefix: ['💡 I have an idea!', '📋 Here\'s my plan:', '🎨 I\'m going to...', '🚀 Next up:']
  },
  working: {
    icon: Zap,
    color: 'text-purple-600 bg-purple-50',
    prefix: ['⚡ Working on it...', '🔥 In the zone!', '💪 Getting this done...', '🎯 Executing...']
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-600 bg-green-50',
    prefix: ['✅ Done!', '🎉 Nailed it!', '💯 Perfect!', '🏆 Mission accomplished!']
  },
  insight: {
    icon: Lightbulb,
    color: 'text-orange-600 bg-orange-50',
    prefix: ['💡 Aha!', '🌟 I just realized...', '🔍 Interesting...', '📖 I discovered...']
  },
  break: {
    icon: Coffee,
    color: 'text-gray-600 bg-gray-50',
    prefix: ['☕ Quick break...', '🧘 Pausing to think...', '📊 Let me assess...', '🔄 Regrouping...']
  }
};

export default function AIThoughtProcess({ jobId, className = '' }: AIThoughtProcessProps) {
  const [thoughts, setThoughts] = useState<ThoughtEntry[]>([]);
  const [isActive, setIsActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new thoughts are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thoughts]);

  // Fetch real AI thoughts from the job
  useEffect(() => {
    if (!jobId) return;

    setIsActive(true);
    fetchThoughts();
    
    // Poll for new thoughts every 2 seconds while job is active
    const interval = setInterval(fetchThoughts, 2000);
    
    return () => clearInterval(interval);
  }, [jobId]);

  const fetchThoughts = async () => {
    try {
      const response = await fetch(`/api/ai/eight-wave-brief/thoughts?jobId=${jobId}`);
      const data = await response.json();
      
      if (data.success) {
        setThoughts(data.thoughts || []);
        
        // Stop polling if job is complete
        if (data.jobStatus === 'completed' || data.jobStatus === 'failed') {
          setIsActive(false);
        }
      }
    } catch (error) {
      console.error('Error fetching thoughts:', error);
    }
  };



  const getThoughtPrefix = (type: ThoughtEntry['type']) => {
    const prefixes = thoughtPersonalities[type].prefix;
    return prefixes[Math.floor(Math.random() * prefixes.length)];
  };

  const getThoughtStyle = (type: ThoughtEntry['type']) => {
    return thoughtPersonalities[type];
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Legal Assistant - Thought Process</h3>
          {isActive && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="animate-pulse h-2 w-2 bg-green-500 rounded-full"></div>
              <span>Thinking...</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Follow along as I build your Supreme Court brief, step by step!
        </p>
      </div>

      {/* Thought Stream */}
      <div 
        ref={scrollRef}
        className="max-h-96 overflow-y-auto p-4 space-y-3"
      >
        {thoughts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Waiting to start the thought process...</p>
            <p className="text-sm">I'll share my thinking as I work through each wave!</p>
          </div>
        ) : (
          thoughts.map((thought) => {
            const style = getThoughtStyle(thought.type);
            const Icon = style.icon;
            
            return (
              <div
                key={thought.id}
                className={`p-3 rounded-lg border-l-4 ${style.color} animate-fadeIn`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {thought.wave && (
                        <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          Wave {thought.wave}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(thought.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="font-medium text-sm mb-1">
                      {getThoughtPrefix(thought.type)} {thought.thought}
                    </p>
                    
                    {thought.details && (
                      <details className="text-xs text-gray-600 mt-2">
                        <summary className="cursor-pointer hover:text-gray-800 font-medium">
                          Details
                        </summary>
                        <p className="mt-1 pl-4 border-l-2 border-gray-200">
                          {thought.details}
                        </p>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isActive && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span>AI is actively thinking and working...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// CSS for fade-in animation (add to globals.css)
const styles = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
`;
