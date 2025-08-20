'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AcademyPage() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const courses = [
    {
      id: 'ai-fundamentals',
      title: 'AI Fundamentals',
      description: 'Learn the basics of artificial intelligence, machine learning, and neural networks.',
      duration: '8 weeks',
      level: 'Beginner'
    },
    {
      id: 'machine-learning',
      title: 'Machine Learning',
      description: 'Deep dive into supervised and unsupervised learning algorithms.',
      duration: '12 weeks',
      level: 'Intermediate'
    },
    {
      id: 'deep-learning',
      title: 'Deep Learning',
      description: 'Advanced neural networks, CNNs, RNNs, and transformer architectures.',
      duration: '16 weeks',
      level: 'Advanced'
    },
    {
      id: 'nlp',
      title: 'Natural Language Processing',
      description: 'Text processing, sentiment analysis, and language models.',
      duration: '10 weeks',
      level: 'Intermediate'
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffbeb' }}>
      {/* Apple-style Header */}
      <header className="border-b border-white/20 bg-white/20 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm" style={{ backgroundColor: '#051a1c' }}>
                <span className="text-white font-semibold text-sm">G</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-medium leading-tight" style={{ color: '#051a1c' }}>Gawin</span>
                <span className="text-xs opacity-50 leading-tight" style={{ color: '#051a1c' }}>by kreativloops AI</span>
              </div>
            </Link>
            <Link href="/">
              <button className="text-sm opacity-60 hover:opacity-80 transition-opacity" style={{ color: '#051a1c' }}>
                ← Back
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-4">
            <span className="text-2xl">🎓</span>
            <h1 className="text-3xl font-normal" style={{ color: '#051a1c' }}>
              AI Academy
            </h1>
          </div>
          <p className="text-lg opacity-60 leading-relaxed" style={{ color: '#051a1c' }}>
            Master artificial intelligence through structured courses designed for all skill levels.
          </p>
        </div>

        {/* Course Grid - Apple Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white/50 backdrop-blur-md border border-white/40 rounded-2xl p-8 hover:bg-white/70 transition-all cursor-pointer shadow-lg"
              onClick={() => setSelectedCourse(course.id)}
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-lg" style={{ color: '#051a1c' }}>{course.title}</h3>
                  <span className="text-xs px-3 py-1 bg-white/50 backdrop-blur-sm rounded-full border border-white/30" style={{ color: '#051a1c' }}>
                    {course.level}
                  </span>
                </div>
                <p className="text-base opacity-70 leading-relaxed mb-4" style={{ color: '#051a1c' }}>
                  {course.description}
                </p>
                <div className="flex items-center text-sm opacity-60" style={{ color: '#051a1c' }}>
                  <span>📅 {course.duration}</span>
                </div>
              </div>
              <button className="w-full text-white text-sm py-3 rounded-2xl hover:opacity-90 transition-all font-medium shadow-sm" style={{ backgroundColor: '#051a1c' }}>
                Start Course
              </button>
            </div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-16 border-t border-white/20 pt-12">
          <h2 className="text-xl font-medium mb-8 text-center" style={{ color: '#051a1c' }}>
            Coming Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Computer Vision', 'Reinforcement Learning', 'AI Ethics'].map((topic) => (
              <div key={topic} className="bg-white/30 backdrop-blur-sm border border-white/20 rounded-2xl p-6 opacity-60 shadow-sm">
                <h3 className="font-medium mb-2" style={{ color: '#051a1c' }}>{topic}</h3>
                <p className="text-sm opacity-70" style={{ color: '#051a1c' }}>Coming soon</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}