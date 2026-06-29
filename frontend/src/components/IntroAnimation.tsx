import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { GraduationCap, X, ArrowRight, ArrowDown } from "lucide-react";

// ==========================================
// DATA DEFINITIONS (Project Details & Images)
// ==========================================
const PAGE_DETAILS = [
  { title: "Student Portal", desc: "Access your project workspace", to: "/login" },
  { title: "Mentor Dashboard", desc: "Guide and evaluate teams", to: "/login" },
  { title: "Faculty View", desc: "Monitor department progress", to: "/login" },
  { title: "Admin Console", desc: "System-wide management", to: "/login" },
  { title: "Project Archive", desc: "Explore past innovations", to: "/archive" },
  { title: "Active Teams", desc: "Collaborate with peers", to: "/teams" },
  { title: "Announcements", desc: "Latest hub updates", to: "/announcements" },
  { title: "Section Sync", desc: "Group-wise coordination", to: "/sections" },
  { title: "Mentors List", desc: "Connect with experts", to: "/mentors" },
  { title: "Performance", desc: "Track grading metrics", to: "/dashboard" },
  { title: "Timetable", desc: "Schedule and milestones", to: "/timetable" },
  { title: "Profile", desc: "Manage your credentials", to: "/profile" },
  { title: "Projects", desc: "All ongoing works", to: "/projects" },
  { title: "Dashboard", desc: "Overview of your progress", to: "/dashboard" },
  { title: "MLRIT Portal", desc: "Official college site", to: "/login" },
  { title: "CIE Vision", desc: "Innovation & Future", to: "/profile" },
  { title: "Help Center", desc: "Get platform support", to: "/profile" },
  { title: "Tech Stack", desc: "How we build things", to: "/profile" },
  { title: "Join Us", desc: "Be part of the community", to: "/login" },
  { title: "CIE MLRIT", desc: "Project Hub Home", to: "/" },
  { title: "ProjectSphere", desc: "Digital Management Hub", to: "/" },
];

const IMAGES = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&q=80",
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=300&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&q=80",
  "https://images.unsplash.com/photo-1506765515384-028b60a970df?w=300&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&q=80",
  "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=300&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80",
  "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=300&q=80",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&q=80",
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=300&q=80",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300&q=80",
  "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=300&q=80",
  "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=300&q=80",
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=300&q=80",
  "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=300&q=80",
  "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=300&q=80",
];

export default function IntroAnimation() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="w-full min-h-screen bg-[#0a0a0c] text-[#dde4dd] select-none flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Decorative Gradient Blur Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[150px]" />
        <div className="absolute bottom-10 -right-40 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="w-full flex items-center justify-between px-6 py-6 md:px-12 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center transition-transform group-hover:scale-105 shadow-md shadow-emerald-500/10">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-white tracking-tight text-lg">ProjectSphere</span>
        </div>
        
        <Link 
          to="/login"
          className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-white text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          Login
        </Link>
      </header>

      {/* Cinematic Hero Section */}
      <section className="h-[75vh] flex flex-col justify-center items-center text-center px-6 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl md:text-8xl font-heading font-extrabold tracking-tight text-white mb-4 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent"
        >
          ProjectSphere
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs md:text-sm font-bold tracking-[0.35em] text-emerald-400 uppercase mb-12"
        >
          Build. Collaborate. Innovate.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="animate-bounce flex flex-col items-center gap-2 text-white/30 text-xs tracking-widest mt-8"
        >
          <span>SCROLL TO EXPLORE PORTAL</span>
          <ArrowDown className="w-4 h-4 text-emerald-400/60" />
        </motion.div>
      </section>

      {/* Features Platform Grid Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20 w-full">
        <div className="mb-16 text-center md:text-left border-b border-white/5 pb-8">
          <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">Our Core Platform</h2>
          <p className="text-sm md:text-base text-white/50 mt-3 font-medium tracking-wide">
            EXPLORE THE FEATURES AND PORTALS AVAILABLE TO YOUR PROJECT SPHERE
          </p>
        </div>

        {/* CSS Responsive Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {PAGE_DETAILS.map((detail, index) => (
            <motion.div
              key={index}
              onClick={() => setSelected(index)}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="cursor-pointer group rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] p-3 border border-white/5 hover:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col h-[280px]"
            >
              {/* Feature image preview */}
              <div className="relative flex-1 w-full overflow-hidden rounded-xl bg-black/40">
                <img
                  src={IMAGES[index % IMAGES.length]}
                  alt={detail.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/50 pointer-events-none" />
              </div>
              
              {/* Feature info */}
              <div className="pt-3 px-1">
                <h3 className="text-white font-semibold text-sm group-hover:text-emerald-400 transition-colors leading-snug">
                  {detail.title}
                </h3>
                <p className="text-white/50 text-[11px] mt-1 line-clamp-2 leading-relaxed">
                  {detail.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Expanded Modal Detail View */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            key="detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0c]/95 px-6 py-16 backdrop-blur-xl md:px-16"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelected(null)}
              className="absolute right-6 top-6 z-10 flex items-center gap-2 text-xs font-bold tracking-[0.15em] text-white/50 transition-colors hover:text-white md:right-12 md:top-8"
            >
              <X className="h-4 w-4" /> CLOSE
            </button>

            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.96 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="grid w-full max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-[1fr_minmax(260px,380px)_1fr] md:gap-8"
            >
              {/* Title Section */}
              <div className="order-2 text-center md:order-1 md:text-left">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
                  ProjectSphere
                </p>
                <h2 className="font-heading text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
                  {PAGE_DETAILS[selected].title}
                </h2>
              </div>

              {/* Framed Image Section */}
              <div className="order-1 mx-auto w-full max-w-xs overflow-hidden rounded-2xl bg-white/5 p-2.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5),0_48px_88px_-24px_rgba(0,0,0,0.7)] ring-1 ring-white/10 md:order-2 md:max-w-none">
                <img
                  src={IMAGES[selected % IMAGES.length]}
                  alt={PAGE_DETAILS[selected].title}
                  className="aspect-[3/4] w-full rounded-xl object-cover"
                />
              </div>

              {/* Info + CTA Section */}
              <div className="order-3 text-center md:text-left">
                <p className="mx-auto max-w-sm text-base leading-relaxed text-white/70 md:mx-0 md:text-lg">
                  {PAGE_DETAILS[selected].desc}.
                </p>
                <Link
                  to={PAGE_DETAILS[selected].to}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-gray-900 shadow-lg shadow-black/10 transition-all hover:scale-105 hover:bg-white/90 active:scale-95"
                >
                  Open Page <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
