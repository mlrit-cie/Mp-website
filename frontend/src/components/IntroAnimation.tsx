import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useSpring, useTransform, useMotionValue, MotionValue, animate } from "framer-motion";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

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

interface FlipCardProps {
  src: string;
  index: number;
  total: number;
  containerSize: { width: number; height: number };
  scatterPos: { x: number; y: number; rotation: number; scale: number; opacity: number };
  layoutProgress: MotionValue<number>;
  smoothMorph: MotionValue<number>;
  smoothScrollRotate: MotionValue<number>;
  smoothMouseX: MotionValue<number>;
  finalAssembly: MotionValue<number>;
}

const IMG_WIDTH = 60;
const IMG_HEIGHT = 85;

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

function FlipCard({ 
  src, 
  index, 
  total, 
  containerSize, 
  scatterPos, 
  layoutProgress,
  smoothMorph, 
  smoothScrollRotate, 
  smoothMouseX,
  finalAssembly
}: FlipCardProps) {
  
  const x = useTransform(
    [layoutProgress, smoothMorph, smoothScrollRotate, smoothMouseX, finalAssembly],
    ([lp, morph, rotate, mouse, final]) => {
      // Scatter Position
      const sx = scatterPos.x;
      
      // Line Position
      const lineSpacing = 70;
      const lineTotalWidth = total * lineSpacing;
      const lx = index * lineSpacing - lineTotalWidth / 2;
      
      // Circle vs Arc logic
      const isMobile = containerSize.width < 768;
      const minDimension = Math.min(containerSize.width, containerSize.height);
      const circleRadius = Math.min(minDimension * 0.35, 350);
      const circleAngle = (index / total) * 360;
      const circleRad = (circleAngle * Math.PI) / 180;
      const cx = Math.cos(circleRad) * circleRadius;

      const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
      const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);
      const spreadAngle = isMobile ? 100 : 130;
      const startAngle = -90 - spreadAngle / 2;
      const step = spreadAngle / (total - 1);
      const scrollProgress = Math.min(Math.max((rotate as number) / 360, 0), 1);
      const maxRotation = spreadAngle * 0.8;
      const boundedRotation = -scrollProgress * maxRotation;
      const currentArcAngle = startAngle + index * step + boundedRotation;
      const arcRad = (currentArcAngle * Math.PI) / 180;
      const ax = Math.cos(arcRad) * arcRadius + (mouse as number);

      const circleOrArcX = lerp(cx, ax, morph as number);

      // Grid Position logic
      const cols = isMobile ? 4 : 5;
      const colSpacing = isMobile ? 80 : 180;
      const rowSpacing = isMobile ? 110 : 140;
      const gridX = (index % cols - (cols - 1) / 2) * colSpacing;

      let baseLayoutX;
      if ((lp as number) <= 1) {
        baseLayoutX = lerp(sx, lx, lp as number);
      } else {
        baseLayoutX = lerp(lx, circleOrArcX, (lp as number) - 1);
      }

      return lerp(baseLayoutX, gridX, final as number);
    }
  );

  const y = useTransform(
    [layoutProgress, smoothMorph, smoothScrollRotate, finalAssembly],
    ([lp, morph, rotate, final]) => {
      const sy = scatterPos.y;
      const ly = 0;
      
      const isMobile = containerSize.width < 768;
      const minDimension = Math.min(containerSize.width, containerSize.height);
      const circleRadius = Math.min(minDimension * 0.35, 350);
      const circleAngle = (index / total) * 360;
      const circleRad = (circleAngle * Math.PI) / 180;
      const cy = Math.sin(circleRad) * circleRadius;

      const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
      const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);
      const arcApexY = containerSize.height * (isMobile ? 0.35 : 0.25);
      const arcCenterY = arcApexY + arcRadius;
      const spreadAngle = isMobile ? 100 : 130;
      const startAngle = -90 - spreadAngle / 2;
      const step = spreadAngle / (total - 1);
      const scrollProgress = Math.min(Math.max((rotate as number) / 360, 0), 1);
      const maxRotation = spreadAngle * 0.8;
      const boundedRotation = -scrollProgress * maxRotation;
      const currentArcAngle = startAngle + index * step + boundedRotation;
      const arcRad = (currentArcAngle * Math.PI) / 180;
      const ay = Math.sin(arcRad) * arcRadius + arcCenterY;

      const circleOrArcY = lerp(cy, ay, morph as number);

      // Grid Position logic
      const cols = isMobile ? 4 : 5;
      const rowSpacing = isMobile ? 110 : 140;
      const gridY = (Math.floor(index / cols) - 1.5) * rowSpacing + 50;

      let baseLayoutY;
      if ((lp as number) <= 1) {
        baseLayoutY = lerp(sy, ly, lp as number);
      } else {
        baseLayoutY = lerp(ly, circleOrArcY, (lp as number) - 1);
      }

      return lerp(baseLayoutY, gridY, final as number);
    }
  );

  const rotation = useTransform(
    [layoutProgress, smoothMorph, smoothScrollRotate, finalAssembly],
    ([lp, morph, rotate, final]) => {
      const sr = scatterPos.rotation;
      const lr = 0;

      const circleAngle = (index / total) * 360;
      const cr = circleAngle + 90;

      const isMobile = containerSize.width < 768;
      const spreadAngle = isMobile ? 100 : 130;
      const startAngle = -90 - spreadAngle / 2;
      const step = spreadAngle / (total - 1);
      const scrollProgress = Math.min(Math.max((rotate as number) / 360, 0), 1);
      const maxRotation = spreadAngle * 0.8;
      const boundedRotation = -scrollProgress * maxRotation;
      const currentArcAngle = startAngle + index * step + boundedRotation;
      const ar = currentArcAngle + 90;

      const circleOrArcR = lerp(cr, ar, morph as number);

      const gridR = 0;

      let baseLayoutR;
      if ((lp as number) <= 1) {
        baseLayoutR = lerp(sr, lr, lp as number);
      } else {
        baseLayoutR = lerp(lr, circleOrArcR, (lp as number) - 1);
      }

      return lerp(baseLayoutR, gridR, final as number);
    }
  );

  const scale = useTransform(
    [layoutProgress, smoothMorph, finalAssembly], 
    ([lp, morph, final]) => {
      const ss = scatterPos.scale;
      const ls = 1;

      const isMobile = containerSize.width < 768;
      const arcScale = isMobile ? 1.4 : 1.8;
      const circleOrArcS = lerp(1, arcScale, morph as number);

      const gridS = isMobile ? 1.2 : 2.5;

      let baseLayoutS;
      if ((lp as number) <= 1) {
        baseLayoutS = lerp(ss, ls, lp as number);
      } else {
        baseLayoutS = lerp(ls, circleOrArcS, (lp as number) - 1);
      }

      return lerp(baseLayoutS, gridS, final as number);
    }
  );

  const opacity = useTransform(layoutProgress, (lp) => {
    return lerp(scatterPos.opacity, 1, Math.min(lp as number, 1));
  });

  const detailOpacity = useTransform(finalAssembly, [0.8, 1], [0, 1]);

  return (
    <motion.div
      style={{
        position: "absolute",
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
        transformStyle: "preserve-3d",
        perspective: "1000px",
        x,
        y,
        rotate: rotation,
        scale,
        opacity,
      }}
      className="cursor-pointer group"
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ rotateY: 180 }}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-gray-200"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img src={src} alt={`hero-${index}`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
          
          <motion.div 
            style={{ opacity: detailOpacity }}
            className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent"
          >
            <p className="text-[6px] font-bold text-white uppercase truncate">{PAGE_DETAILS[index].title}</p>
          </motion.div>
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-gray-900 flex flex-col items-center justify-center p-2 border border-gray-700"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="text-center w-full px-1">
            <p className="text-[6px] font-bold text-green-500 uppercase tracking-widest mb-1 truncate">{PAGE_DETAILS[index].title}</p>
            <p className="text-[5px] text-gray-400 leading-tight line-clamp-2">{PAGE_DETAILS[index].desc}</p>
            <Link 
              to={PAGE_DETAILS[index].to}
              className="mt-2 inline-block w-full py-1 rounded bg-green-500 text-[5px] text-white hover:bg-green-600 transition-colors text-center"
            >
              Open Page
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const TOTAL_IMAGES = 20;
const MAX_SCROLL = 5000;

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
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);
    setContainerSize({
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    });

    return () => observer.disconnect();
  }, []);

  const virtualScroll = useMotionValue(0);
  const scrollRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const newScroll = Math.min(Math.max(scrollRef.current + e.deltaY, 0), MAX_SCROLL);
      scrollRef.current = newScroll;
      virtualScroll.set(newScroll);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      touchStartY = touchY;

      const newScroll = Math.min(Math.max(scrollRef.current + deltaY, 0), MAX_SCROLL);
      scrollRef.current = newScroll;
      virtualScroll.set(newScroll);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [virtualScroll]);

  const morphProgress = useTransform(virtualScroll, [0, 600], [0, 1]);
  const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });

  const scrollRotate = useTransform(virtualScroll, [600, 3000], [0, 360]);
  const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 });

  const finalAssemblyProgress = useTransform(virtualScroll, [3500, 5000], [0, 1]);
  const smoothFinalAssembly = useSpring(finalAssemblyProgress, { stiffness: 30, damping: 15 });

  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });

  const layoutProgress = useMotionValue(0); // 0: scatter, 1: line, 2: circle

  useEffect(() => {
    // Start transitions
    const controls1 = animate(layoutProgress, 1, { 
      duration: 1.2, 
      delay: 0.5, 
      ease: [0.23, 1, 0.32, 1] 
    });
    
    let controls2: any;
    const timer = setTimeout(() => {
      controls2 = animate(layoutProgress, 2, { 
        duration: 1.5, 
        ease: [0.23, 1, 0.32, 1] 
      });
    }, 2000);

    return () => {
      controls1.stop();
      if (controls2) controls2.stop();
      clearTimeout(timer);
    };
  }, [layoutProgress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const normalizedX = (relativeX / rect.width) * 2 - 1;
      mouseX.set(normalizedX * 100);
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX]);

  const scatterPositions = useMemo(() => {
    return IMAGES.map(() => ({
      x: (Math.random() - 0.5) * 800,
      y: (Math.random() - 0.5) * 600,
      rotation: (Math.random() - 0.5) * 90,
      scale: 0.8,
      opacity: 0,
    }));
  }, []);

  const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1]);
  const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0]);

  // Title only shows when we reach the circle layout (lp >= 2) and haven't morphed much into the arc
  const titleOpacity = useTransform(
    [layoutProgress, smoothMorph, smoothFinalAssembly],
    ([lp, morph, final]) => {
      const fadeFromLayout = (lp as number) >= 1.5 ? ((lp as number) - 1.5) * 2 : 0;
      const fadeFromMorph = (morph as number) * 2;
      const fadeOutForFinal = (final as number) * 2;
      return Math.min(fadeFromLayout, Math.max(0, 1 - fadeFromMorph), Math.max(0, 1 - fadeOutForFinal));
    }
  );

  const titleBlur = useTransform(smoothMorph, [0, 0.5], ["blur(0px)", "blur(10px)"]);

  const finalTitleOpacity = useTransform(smoothFinalAssembly, [0.3, 0.6], [0, 1]);
  const finalTitleY = useTransform(smoothFinalAssembly, [0.3, 0.6], [20, 0]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#FAFAFA] overflow-hidden">
      {/* Top Navbar for Student Login */}
      <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 pointer-events-none">
        <div className="flex items-center gap-2 group pointer-events-auto cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center transition-transform group-hover:scale-105">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-gray-900 tracking-tight">ProjectSphere</span>
        </div>
        
        <div className="pointer-events-auto">
          <Link 
            to="/login"
            className="px-6 py-2.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/5"
          >
            Login
          </Link>
        </div>
      </div>

      <div className="flex h-full w-full flex-col items-center justify-center perspective-1000">
        <div className="absolute z-0 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2">
          <motion.h1
            style={{ opacity: titleOpacity, filter: titleBlur }}
            className="text-2xl font-medium tracking-tight text-gray-800 md:text-4xl"
          >
            OUR PROJECTS.
          </motion.h1>
          <motion.p
            style={{ opacity: titleOpacity }}
            className="mt-4 text-xs font-bold tracking-[0.2em] text-gray-500"
          >
            SCROLL TO EXPLORE
          </motion.p>
        </div>

        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="absolute top-[10%] z-10 flex flex-col items-center justify-center text-center pointer-events-none px-4"
        >
          <h2 className="text-3xl md:text-5xl font-semibold text-gray-900 tracking-tight mb-4">
            Explore Our Vision
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-lg leading-relaxed">
            Discover a world where technology meets creativity. <br className="hidden md:block" />
            Scroll through our curated collection of innovations designed to shape the future.
          </p>
        </motion.div>

        <motion.div
          style={{ opacity: finalTitleOpacity, y: finalTitleY }}
          className="absolute top-[8%] z-10 flex flex-col items-center justify-center text-center pointer-events-none px-4"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tighter mb-4">
            Our Core Platform
          </h2>
          <p className="text-sm md:text-base text-gray-500 font-medium tracking-wide">
            EVERYTHING YOU NEED TO MANAGE YOUR PROJECT JOURNEY
          </p>
        </motion.div>

        <div className="relative flex items-center justify-center w-full h-full">
          {IMAGES.slice(0, TOTAL_IMAGES).map((src, i) => (
            <FlipCard
              key={i}
              src={src}
              index={i}
              total={TOTAL_IMAGES}
              containerSize={containerSize}
              scatterPos={scatterPositions[i]}
              layoutProgress={layoutProgress}
              smoothMorph={smoothMorph}
              smoothScrollRotate={smoothScrollRotate}
              smoothMouseX={smoothMouseX}
              finalAssembly={smoothFinalAssembly}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

