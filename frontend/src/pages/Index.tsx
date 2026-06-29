import { FloatingGallery } from "@/components/FloatingGallery";
import { GalleryCardData } from "@/components/FloatingGallery/gallery.types";
import { GraduationCap } from "lucide-react";

// ==========================================
// PROJECT DATA FOR FLOATING GALLERY
// ==========================================
const GALLERY_CARDS: GalleryCardData[] = [
  {
    id: "1",
    title: "AI Medical Diagnostic System",
    subtitle: "Deep Learning & Computer Vision",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
    link: "/projects",
  },
  {
    id: "2",
    title: "Autonomous Drone Delivery",
    subtitle: "Robotics & Navigation",
    imageUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&q=80",
    link: "/projects",
  },
  {
    id: "3",
    title: "Smart Irrigation IoT Grid",
    subtitle: "IoT & Sustainability",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80",
    link: "/projects",
  },
  {
    id: "4",
    title: "Blockchain Credential Verifier",
    subtitle: "Blockchain & Security",
    imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&q=80",
    link: "/projects",
  },
  {
    id: "5",
    title: "AR Campus Navigation",
    subtitle: "Augmented Reality",
    imageUrl: "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=600&q=80",
    link: "/projects",
  },
  {
    id: "6",
    title: "Virtual Labs Simulation",
    subtitle: "WebGL & Physics Simulation",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80",
    link: "/projects",
  },
  {
    id: "7",
    title: "Neural Machine Translation",
    subtitle: "NLP & AI",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80",
    link: "/projects",
  },
  {
    id: "8",
    title: "Solar-Powered Eco Charger",
    subtitle: "Renewable Energy",
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
    link: "/projects",
  },
  {
    id: "9",
    title: "Sentiment Analysis Dashboard",
    subtitle: "Data Analytics & ML",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
    link: "/projects",
  },
  {
    id: "10",
    title: "Holographic Study Assistant",
    subtitle: "AR & Voice Recognition",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80",
    link: "/projects",
  },
  {
    id: "11",
    title: "Quantum Computing Lab",
    subtitle: "Quantum Algorithms",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80",
    link: "/projects",
  },
  {
    id: "12",
    title: "Gesture-Controlled Robotics",
    subtitle: "Human-Robot Interaction",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80",
    link: "/projects",
  },
  {
    id: "13",
    title: "Cyber Threat Detection",
    subtitle: "Security & ML",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80",
    link: "/projects",
  },
  {
    id: "14",
    title: "Smart Energy Grid",
    subtitle: "IoT & Power Systems",
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
    link: "/projects",
  },
  {
    id: "15",
    title: "Autonomous Vehicle Vision",
    subtitle: "Computer Vision",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80",
    link: "/projects",
  },
  {
    id: "16",
    title: "Wearable Health Monitor",
    subtitle: "Biomedical & IoT",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
    link: "/projects",
  },
  {
    id: "17",
    title: "Generative Art Engine",
    subtitle: "Creative AI",
    imageUrl: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&q=80",
    link: "/projects",
  },
  {
    id: "18",
    title: "Voice Cloning Studio",
    subtitle: "Speech Synthesis",
    imageUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&q=80",
    link: "/projects",
  },
  {
    id: "19",
    title: "Disaster Response Drones",
    subtitle: "Robotics & Relief",
    imageUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&q=80",
    link: "/projects",
  },
  {
    id: "20",
    title: "AR Chemistry Lab",
    subtitle: "Augmented Reality",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80",
    link: "/projects",
  },
  {
    id: "21",
    title: "Edge AI Camera",
    subtitle: "Embedded Vision",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80",
    link: "/projects",
  },
  {
    id: "22",
    title: "Smart Waste Sorter",
    subtitle: "Robotics & Sustainability",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80",
    link: "/projects",
  },
  {
    id: "23",
    title: "Crop Disease Detector",
    subtitle: "AgriTech & ML",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
    link: "/projects",
  },
  {
    id: "24",
    title: "Sign Language Translator",
    subtitle: "Accessibility AI",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80",
    link: "/projects",
  },
  {
    id: "25",
    title: "3D Printed Prosthetics",
    subtitle: "Biomedical Engineering",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
    link: "/projects",
  },
  {
    id: "26",
    title: "Traffic Flow Optimizer",
    subtitle: "Smart City & ML",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80",
    link: "/projects",
  },
  {
    id: "27",
    title: "Ocean Cleanup Bot",
    subtitle: "Marine Robotics",
    imageUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&q=80",
    link: "/projects",
  },
  {
    id: "28",
    title: "Personalized Tutor AI",
    subtitle: "EdTech & NLP",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80",
    link: "/projects",
  },
  {
    id: "29",
    title: "Smart Prosthetic Hand",
    subtitle: "Neural Interfaces",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80",
    link: "/projects",
  },
  {
    id: "30",
    title: "Wildfire Prediction Grid",
    subtitle: "Climate AI",
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
    link: "/projects",
  },
];



export default function Index() {
  return (
    <div
      className="w-full h-screen overflow-hidden select-none relative font-sans"
      style={{
        // Light theme: white centre fading to a soft grey at the edges (like the reference)
        background: 'radial-gradient(circle at 50% 42%, #ffffff 0%, #eef0f2 60%, #e3e6ea 100%)',
      }}
    >
      {/* Background Decorative Gradient Orbs (kept subtle for the light theme) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-emerald-400/10 blur-[150px]" />
        <div className="absolute bottom-10 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      {/* Persistent Header */}
      <header className="absolute top-0 left-0 w-full flex items-center justify-between px-6 py-6 md:px-12 bg-transparent z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center transition-transform hover:scale-105 shadow-md shadow-emerald-500/10">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 tracking-tight text-lg">ProjectSphere</span>
        </div>

        <a
          href="/login"
          className="px-6 py-2 rounded-full border border-black/10 bg-black/5 text-gray-900 text-sm font-medium hover:bg-black/10 hover:border-black/20 transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          Login
        </a>
      </header>

      {/* Full Screen 3D Floating Gallery — Pahari-style, the page's centerpiece.
          Heading + subtitle + "Change the View" toggle are rendered by the
          gallery itself (bottom-center overlay), so nothing blocks the cards. */}
      <div className="absolute inset-0 w-full h-full z-10">
        <FloatingGallery
          cards={GALLERY_CARDS}
          radius={12}
          defaultLayout="cylinder"
          autoRotate={true}
          autoRotateSpeed={0.05}
          title="ProjectSphere"
          subtitle="The Floating Gallery"
        />
      </div>
    </div>
  );
}
