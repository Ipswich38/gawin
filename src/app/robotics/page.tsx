'use client';

import Link from 'next/link';

export default function RoboticsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffbeb' }}>
      {/* Apple-style Header */}
      <header className="border-b border-gray-200/30">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#051a1c' }}>
                <span className="text-white font-semibold text-sm">K</span>
              </div>
              <span className="text-base font-medium" style={{ color: '#051a1c' }}>
                KreativLoops AI
              </span>
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
            <span className="text-2xl">🤖</span>
            <h1 className="text-3xl font-normal" style={{ color: '#051a1c' }}>
              Robotics Lab
            </h1>
          </div>
          <p className="text-lg opacity-60 leading-relaxed" style={{ color: '#051a1c' }}>
            Explore robotics, automation, and hardware programming in our virtual lab environment.
          </p>
        </div>

        {/* Lab Modules - Apple Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-sm">
            <h3 className="font-medium text-lg mb-3" style={{ color: '#051a1c' }}>Arduino Programming</h3>
            <p className="text-base opacity-70 mb-6" style={{ color: '#051a1c' }}>
              Learn to program microcontrollers and create interactive projects.
            </p>
            <button className="text-white text-sm px-6 py-3 rounded-2xl hover:opacity-90 transition-all font-medium shadow-sm" style={{ backgroundColor: '#051a1c' }}>
              Start Lab
            </button>
          </div>

          <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-sm">
            <h3 className="font-medium text-lg mb-3" style={{ color: '#051a1c' }}>Sensor Integration</h3>
            <p className="text-base opacity-70 mb-6" style={{ color: '#051a1c' }}>
              Work with various sensors and learn data collection techniques.
            </p>
            <button className="text-white text-sm px-6 py-3 rounded-2xl hover:opacity-90 transition-all font-medium shadow-sm" style={{ backgroundColor: '#051a1c' }}>
              Start Lab
            </button>
          </div>

          <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-sm">
            <h3 className="font-medium text-lg mb-3" style={{ color: '#051a1c' }}>Robot Control</h3>
            <p className="text-base opacity-70 mb-6" style={{ color: '#051a1c' }}>
              Program robot movements and autonomous navigation systems.
            </p>
            <button className="text-white/60 text-sm px-6 py-3 rounded-2xl transition-all font-medium shadow-sm cursor-not-allowed" style={{ backgroundColor: '#051a1c' }}>
              Coming Soon
            </button>
          </div>

          <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-sm">
            <h3 className="font-medium text-lg mb-3" style={{ color: '#051a1c' }}>IoT Projects</h3>
            <p className="text-base opacity-70 mb-6" style={{ color: '#051a1c' }}>
              Build Internet of Things devices and smart home automation.
            </p>
            <button className="text-white/60 text-sm px-6 py-3 rounded-2xl transition-all font-medium shadow-sm cursor-not-allowed" style={{ backgroundColor: '#051a1c' }}>
              Coming Soon
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}