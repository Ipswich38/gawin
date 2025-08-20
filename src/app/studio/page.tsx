'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function StudioPage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const projects = [
    { id: 'web-app', title: 'Web App Builder', description: 'Create responsive web applications' },
    { id: 'game-dev', title: 'Game Development', description: 'Build interactive games' },
    { id: 'data-viz', title: 'Data Visualization', description: 'Create stunning data charts' },
    { id: 'art-gen', title: 'AI Art Generator', description: 'Generate creative artwork' }
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fffbeb' }}>
      {/* Apple-style Header */}
      <header className="border-b border-gray-200/30">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#051a1c' }}>
                <span className="text-white font-semibold text-sm">K</span>
              </div>
              <span className="text-base font-medium" style={{ color: '#051a1c' }}>KreativLoops AI</span>
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
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-4">
            <span className="text-2xl">🎨</span>
            <h1 className="text-3xl font-normal" style={{ color: '#051a1c' }}>Creative Studio</h1>
          </div>
          <p className="text-lg opacity-60" style={{ color: '#051a1c' }}>
            Build creative projects and interactive applications
          </p>
        </div>

        {/* Project Grid - Apple Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-8 hover:bg-white/60 transition-all cursor-pointer shadow-sm"
              onClick={() => setSelectedProject(project.id)}
            >
              <h3 className="font-medium text-lg mb-3" style={{ color: '#051a1c' }}>{project.title}</h3>
              <p className="text-base opacity-70 mb-6" style={{ color: '#051a1c' }}>{project.description}</p>
              <button className="text-white text-sm px-6 py-3 rounded-2xl hover:opacity-90 transition-all font-medium shadow-sm" style={{ backgroundColor: '#051a1c' }}>
                Start Project
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}