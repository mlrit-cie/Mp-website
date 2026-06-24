import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Rocket,
  Shield,
  BookOpen,
  Users,
  Brain,
  ArrowRight,
  ChevronDown,
  Sparkles,
  CheckCircle,
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#dde4dd] relative overflow-hidden font-sans selection:bg-[#4edea3] selection:text-[#002113]">
      {/* Decorative Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#10b981]/5 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#4169e1]/5 blur-[150px]" />
        <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] rounded-full bg-[#10b981]/3 blur-[100px]" />
      </div>

      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0e1511]/5 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-12 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981] to-[#4169e1] flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-white text-lg tracking-tight">ProjectSphere</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-emerald-400/10"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 max-w-7xl mx-auto px-6 md:px-12 text-center flex flex-col items-center justify-center min-h-[85vh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl mx-auto"
        >
          <div className="glass-panel p-8 md:p-16 rounded-3xl relative overflow-hidden">
            {/* Spotlight Accent */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-[#10b981]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Innovation & Engineering
            </div>

            <h1 className="font-heading text-4xl md:text-6xl font-bold leading-tight mb-6 text-white tracking-tight">
              Empowering{" "}
              <span className="bg-gradient-to-r from-[#4edea3] to-[#b6c4ff] bg-clip-text text-transparent">
                Academic Innovation
              </span>
            </h1>

            <p className="text-base md:text-lg text-[#bbcabf] mb-10 max-w-2xl mx-auto leading-relaxed">
              The ultimate project management and collaboration workspace for MLRIT students, faculty mentors, and administrators to build world-class portfolios.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/signup"
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:shadow-xl hover:shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 border border-emerald-400/10"
              >
                <span>Get Started</span>
                <Rocket className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 text-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <ChevronDown className="w-8 h-8 text-emerald-400" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative z-10 border-t border-b border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Projects", val: "1,200+" },
              { label: "Students", val: "3,500+" },
              { label: "Faculty", val: "450+" },
              { label: "Success Rate", val: "98%" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-panel p-6 md:p-8 rounded-2xl text-center group hover:border-[#10b981]/30 transition-all duration-300"
              >
                <div className="text-emerald-400 text-3xl md:text-4xl font-heading font-bold mb-1.5 group-hover:scale-105 transition-transform duration-300">
                  {stat.val}
                </div>
                <div className="text-[#bbcabf] font-mono uppercase tracking-widest text-[11px]">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Showcase Section */}
      <section className="py-28 max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-white">Ecosystem Roles</h2>
          <p className="text-[#bbcabf] max-w-md mx-auto mt-3 text-sm leading-relaxed">
            Tailored experiences for every member of the MLRIT project ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              role: "Admin",
              desc: "Oversee the entire ecosystem, manage resource allocation, and drive global initiatives.",
              icon: Shield,
              color: "from-red-500/20 to-emerald-500/10",
              glow: "bg-red-500/10",
              iconColor: "text-red-400",
            },
            {
              role: "Faculty",
              desc: "Guide innovation, approve milestones, and integrate research into academic curricula.",
              icon: BookOpen,
              color: "from-blue-500/20 to-emerald-500/10",
              glow: "bg-blue-500/10",
              iconColor: "text-blue-400",
            },
            {
              role: "Mentor",
              desc: "Provide technical expertise, industry insights, and career-shaping professional guidance.",
              icon: Brain,
              color: "from-emerald-500/20 to-blue-500/10",
              glow: "bg-emerald-500/10",
              iconColor: "text-emerald-400",
            },
            {
              role: "Student",
              desc: "Build projects, collaborate with peers, and showcase your professional portfolio to the world.",
              icon: Users,
              color: "from-blue-500/20 to-emerald-500/10",
              glow: "bg-blue-500/10",
              iconColor: "text-blue-300",
            },
          ].map((item, i) => (
            <motion.div
              key={item.role}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="glass-panel p-6 md:p-8 rounded-3xl group hover:-translate-y-1.5 transition-all duration-300 overflow-hidden relative"
            >
              {/* Backglow blur */}
              <div className={`absolute -right-4 -top-4 w-24 h-24 ${item.glow} rounded-full blur-2xl group-hover:opacity-100 transition-opacity duration-300`} />

              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 border border-white/5`}>
                <item.icon className={`w-6 h-6 ${item.iconColor}`} />
              </div>

              <h3 className="font-heading text-lg font-bold text-white mb-2">{item.role}</h3>
              <p className="text-[#bbcabf] text-xs leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
        >
          {/* Decorative Backdrops */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />

          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-8 text-white relative z-10 leading-tight">
            Ready to shape the future? <br />
            Join ProjectSphere today.
          </h2>

          <div className="flex justify-center relative z-10">
            <Link
              to="/signup"
              className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-bold px-10 py-4 rounded-xl hover:shadow-xl hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.95] text-base flex items-center gap-3 transition-all duration-200 border border-emerald-400/10"
            >
              <span>Get Early Access</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 relative z-10 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-semibold text-white tracking-tight">ProjectSphere</span>
            </div>
            <p className="text-[#bbcabf] text-xs">MLRIT Micro Projects Portal</p>
          </div>

          <div className="text-white/40 text-[11px] font-mono">
            &copy; {new Date().getFullYear()} MLRIT. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
