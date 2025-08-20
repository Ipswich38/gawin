'use client';

import Link from 'next/link';

export default function BootcampPage() {
  const tracks = [
    {
      title: 'Web Development',
      description: 'Full-stack web development with React, Node.js, and databases.',
      duration: '16 weeks',
      level: 'Beginner to Advanced'
    },
    {
      title: 'Python Programming',
      description: 'Comprehensive Python development including frameworks and data science.',
      duration: '12 weeks',
      level: 'Beginner'
    },
    {
      title: 'Mobile Development',
      description: 'Cross-platform mobile apps with React Native and Flutter.',
      duration: '14 weeks',
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
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-950 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💻</span>
            </div>
            <h1 className="text-3xl font-medium text-gray-900 dark:text-white">
              Coding Bootcamp
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Intensive programming courses to accelerate your software development career.
          </p>
        </div>

        {/* Tracks Grid - Apple Style */}
        <div className="space-y-6">
          {tracks.map((track, index) => (
            <div
              key={index}
              className="bg-white/50 backdrop-blur-md border border-white/40 rounded-2xl p-8 hover:bg-white/70 transition-all shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 mr-6">
                  <h3 className="font-medium text-lg mb-3" style={{ color: '#051a1c' }}>{track.title}</h3>
                  <p className="text-base opacity-70 leading-relaxed mb-4" style={{ color: '#051a1c' }}>
                    {track.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm opacity-60" style={{ color: '#051a1c' }}>
                    <span>📅 {track.duration}</span>
                    <span>📊 {track.level}</span>
                  </div>
                </div>
                <button className="text-white text-sm px-6 py-3 rounded-2xl hover:opacity-90 transition-all font-medium shadow-sm" style={{ backgroundColor: '#051a1c' }}>
                  Enroll
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}