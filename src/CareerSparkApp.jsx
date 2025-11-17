import React, { useState, useEffect } from "react";
import personalityTraitsData from "./personality_traits.json";
// Import celebrity images
import harveyImage from "./assets/harvey.png";
import usherImage from "./assets/usher.png";
import tomImage from "./assets/tom.png";
import oprahImage from "./assets/oprah.png";
import jordanImage from "./assets/jordan.png";
import nolanImage from "./assets/nolan.png";

// Canvas-ready single-file React app for Career Spark – Entertainment
// This version SIMULATES upload so you can run & check UX directly.
// TODO: Replace simulateUploadWithS3() with a real API call to your backend
// that uploads text + files to Amazon S3.

export default function CareerSparkApp() {
  const [started, setStarted] = useState(false);
  const [theme, setTheme] = useState(() => {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem("career-spark-theme") || "dark";
});

useEffect(() => {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  if (typeof window !== "undefined") {
    localStorage.setItem("career-spark-theme", theme);
  }
}, [theme]);

  return (
    <div className="min-h-screen h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-200 flex flex-col overflow-hidden">
      <Header theme={theme} setTheme={setTheme} />
      <main className="flex-1 overflow-y-auto flex flex-col">
        {!started ? (
          <WelcomeScreen onGetStarted={() => setStarted(true)} />
        ) : (
          <ChatUploadScreen onBack={() => setStarted(false)} theme={theme} />
        )}
      </main>
    </div>
  );
}

function Header({ theme, setTheme }) {
  return (
    <header className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-slate-200/50 dark:border-slate-800/70 flex-shrink-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-400 text-xl sm:text-2xl shadow-lg shadow-pink-500/40">
          🎬
        </div>
        <div className="leading-tight">
          <div className="font-bold text-base sm:text-lg lg:text-xl">Career Spark</div>
        
        </div>
      </div>
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 dark:border-slate-700/80 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur shadow-sm hover:shadow-md transition-all hover:scale-105"
      >
        <span className="text-base sm:text-lg">{theme === "dark" ? "☀️" : "🌙"}</span>
        <span className="hidden sm:inline font-medium">
          {theme === "dark" ? "Light" : "Dark"} mode
        </span>
      </button>
    </header>
  );
}

function WelcomeScreen({ onGetStarted }) {
  // Generate spark particles
  const [sparks, setSparks] = useState([]);

  useEffect(() => {
    // Create spark particles
    const newSparks = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
      size: 2 + Math.random() * 3,
    }));
    setSparks(newSparks);
  }, []);

  return (
    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4 sm:gap-6 lg:gap-8 items-stretch h-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <section className="w-full rounded-3xl border border-slate-200/70 dark:border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 dark:from-slate-950 dark:via-slate-950/95 dark:to-slate-900 px-5 sm:px-7 lg:px-8 py-6 sm:py-8 flex flex-col shadow-xl shadow-slate-900/70 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />
        
        {/* Spark animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {sparks.map((spark) => (
            <div
              key={spark.id}
              className="absolute rounded-full bg-gradient-to-r from-pink-400 via-amber-400 to-pink-400 opacity-60"
              style={{
                left: `${spark.left}%`,
                top: `${spark.top}%`,
                width: `${spark.size}px`,
                height: `${spark.size}px`,
                animation: `sparkle ${spark.duration}s ease-in-out infinite`,
                animationDelay: `${spark.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 leading-tight">
            Find your <span className="text-pink-400 relative inline-block">
              <span className="relative z-10">spark</span>
              <span className="absolute inset-0 bg-pink-400/20 blur-xl animate-pulse" />
            </span> in the entertainment world.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 mb-4 sm:mb-6">
            Pick what you like, upload a few things, and let us suggest paths that fit you.
          </p>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="rounded-2xl bg-white/5 border border-white/10 px-3 sm:px-4 py-2 sm:py-3 backdrop-blur hover:bg-white/10 transition-colors">
              <div className="text-sm sm:text-base font-semibold text-pink-300 mb-1">10+ tracks</div>
              <div className="text-[11px] sm:text-xs text-slate-300">Acting, film, music & more.</div>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 px-3 sm:px-4 py-2 sm:py-3 backdrop-blur hover:bg-white/10 transition-colors">
              <div className="text-sm sm:text-base font-semibold text-amber-300 mb-1">3 steps</div>
              <div className="text-[11px] sm:text-xs text-slate-300">Share, match, explore.</div>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 px-3 sm:px-4 py-2 sm:py-3 backdrop-blur hover:bg-white/10 transition-colors">
              <div className="text-sm sm:text-base font-semibold text-sky-300 mb-1">1 profile</div>
              <div className="text-[11px] sm:text-xs text-slate-300">All your work in one place.</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-4 sm:mb-6">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-tr from-pink-500 to-amber-400 text-sm sm:text-base font-semibold px-6 sm:px-8 py-3 sm:py-3.5 text-white shadow-lg shadow-pink-500/50 hover:shadow-pink-500/60 hover:-translate-y-[1px] transition-all hover:scale-105"
            >
              Get started
              <span className="text-lg">→</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 mt-3">Share a bit about yourself to begin.</p>
        </div>
      </section>

      <EntertainmentGallery />
    </div>
  );
}

function ActorFrame({ src, label }) {
  return (
    <div className="relative h-24 w-20 sm:h-28 sm:w-24 rounded-xl overflow-hidden border border-white/15 bg-slate-900/80 flex-shrink-0 hover:scale-105 transition-transform cursor-pointer">
      <div className="h-full w-full bg-gradient-to-br from-pink-500/20 to-amber-400/20 flex items-center justify-center">
        <span className="text-2xl">🎭</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
        <span className="text-[10px] sm:text-xs font-medium text-slate-50">{label}</span>
      </div>
    </div>
  );
}

function EntertainmentGallery() {
  const cards = [
    {
      label: "Business & Management",
      description: "Plan and lead projects.",
      emoji: "📊",
      tint: "from-blue-500/50 to-indigo-500/50",
      iconBg: "bg-blue-500/20",
      bgImages: [harveyImage], // Can add more images for carousel
      celebrity: "Harvey Specter"
    },
    {
      label: "Animation & VFX",
      description: "Bring ideas to life on screen.",
      emoji: "🎨",
      tint: "from-purple-500/50 to-pink-500/50",
      iconBg: "bg-purple-500/20",
      bgImages: [nolanImage],
      celebrity: "Christopher Nolan"
    },
    {
      label: "Writing & Journalism",
      description: "Write scripts, news, and more.",
      emoji: "✍️",
      tint: "from-amber-500/50 to-red-500/50",
      iconBg: "bg-amber-500/20",
      bgImages: [oprahImage],
      celebrity: "Oprah Winfrey"
    },
    {
      label: "Music",
      description: "Produce music, beats, and audio.",
      emoji: "🎧",
      tint: "from-green-500/50 to-emerald-500/50",
      iconBg: "bg-green-500/20",
      bgImages: [usherImage],
      celebrity: "Usher"
    },
    {
      label: "Sports",
      description: "Compete, coach, or create content.",
      emoji: "🏅",
      tint: "from-orange-500/50 to-yellow-500/50",
      iconBg: "bg-orange-500/20",
      bgImages: [jordanImage],
      celebrity: "Michael Jordan"
    },
    {
      label: "Film & TV",
      description: "Work in film, TV, and online video.",
      emoji: "🎬",
      tint: "from-red-500/50 to-slate-500/50",
      iconBg: "bg-red-500/20",
      bgImages: [tomImage],
      celebrity: "Tom Cruise"
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 sm:gap-4 h-full">
      {cards.map((card, cardIndex) => (
        <ImageCarouselCard key={card.label} card={card} cardIndex={cardIndex} />
      ))}
    </section>
  );
}

// Image Carousel Card Component
function ImageCarouselCard({ card, cardIndex }) {
  // Create multiple instances of images for seamless infinite loop
  // We duplicate images 3 times to create smooth looping effect
  const originalImages = card.bgImages;
  const carouselImages = [...originalImages, ...originalImages, ...originalImages];
  const animationDuration = 25; // seconds for one full cycle - slower for smoother effect

  return (
    <div
      className="relative rounded-2xl sm:rounded-3xl border border-slate-200/70 dark:border-slate-800/80 bg-slate-900/80 overflow-hidden shadow-lg shadow-slate-950/60 flex flex-col justify-between hover:scale-105 hover:shadow-xl transition-all cursor-pointer group"
    >
      {/* Image Carousel Background with infinite loop animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 flex"
          style={{
            width: '300%', // 3 copies of images
            animation: `carouselScroll ${animationDuration}s linear infinite`,
            animationDelay: `${cardIndex * 0.5}s`, // Stagger animations for different cards
          }}
        >
          {carouselImages.map((bgImage, index) => (
            <div
              key={index}
              className="flex-shrink-0 h-full"
              style={{
                width: '33.333%', // Each image takes 1/3 of container (100% of viewport)
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.75)',
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Gradient overlay - subtle to show the images */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${card.tint} opacity-40 group-hover:opacity-50 transition-opacity`}
      />
      
      {/* Content */}
      <div className="relative z-10 p-4 sm:p-5 lg:p-6 flex flex-col gap-3 text-slate-50 h-full">
        <div className="flex items-start justify-between gap-2">
          <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl ${card.iconBg} border border-white/20 flex items-center justify-center text-2xl sm:text-3xl shadow-lg backdrop-blur-sm`}>
            {card.emoji}
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-end">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide mb-1.5 text-white drop-shadow-lg">
            {card.label}
          </h3>
          <p className="text-[11px] sm:text-xs leading-snug text-slate-100/90 drop-shadow-md mb-2">
            {card.description}
          </p>
          {card.celebrity && (
            <p className="text-[10px] sm:text-xs text-slate-200/70 italic drop-shadow-md">
              Inspired by {card.celebrity}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatUploadScreen({ onBack, theme }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  
  const isDark = theme === "dark";

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles]);
    // Reset input to allow selecting the same file again
    e.target.value = '';
  };

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  async function uploadToS3ViaApi(messageText, uploadedFiles) {
    const formData = new FormData();
    
    // Append text message
    if (messageText.trim()) {
      formData.append("message", messageText);
    }

    // Append all files
    uploadedFiles.forEach((file) => {
      formData.append("files", file);
    });

    let response;
    try {
      response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
    } catch (fetchError) {
      // Handle network/connection errors
      if (fetchError.name === 'TypeError' || fetchError.message?.includes('Failed to fetch')) {
        throw new Error("Failed to fetch - backend server may not be running");
      }
      throw fetchError;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Upload failed");
    }

    const data = await response.json();
    return data; // expected shape: { success: boolean, s3Keys: string[], message: string }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setUploadSuccess(false);

    if (!text.trim() && files.length === 0) {
      setError("Please add some text or upload at least one file.");
      return;
    }

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const handleConfirmUpload = async () => {
    setShowConfirmation(false);
    setError("");
    setUploadSuccess(false);

    if (files.length === 0 && !text.trim()) {
      setError("Please add some text or upload at least one file.");
      return;
    }

    try {
      setIsUploading(true);

      console.log(`Uploading ${files.length} file(s) and text to S3...`);
      
      const result = await uploadToS3ViaApi(text, files);
      
      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      console.log("Upload successful:", result);

      const newMessage = {
        id: Date.now(),
        text,
        files: files.map((f) => f.name),
        s3Keys: result.s3Keys || [],
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setText("");
      setFiles([]);
      setUploadSuccess(true);
      
      // Move to questions screen after 2 seconds
      setTimeout(() => {
        setUploadSuccess(false);
        setShowQuestions(true);
      }, 2000);
    } catch (err) {
      console.error("Upload error:", err);
      console.error("Error details:", err);
      
      let errorMessage = err.message || "Something went wrong while uploading.";
      
      // Check for connection errors (backend not running)
      if (err.message?.includes('Failed to fetch') || 
          err.message?.includes('NetworkError') ||
          err.message?.includes('ECONNREFUSED') ||
          err.name === 'TypeError' && err.message?.includes('fetch')) {
        errorMessage = "Cannot connect to backend server. Please make sure the backend is running:\n\nRun: npm run server\n\nOr: python3 backend/server.py";
      } else if (err.message?.includes('credentials')) {
        errorMessage = "AWS credentials are invalid. Please check your .env file.";
      } else if (err.message?.includes('Access denied') || err.message?.includes('AccessDenied')) {
        errorMessage = "Access denied. Please check your AWS IAM permissions.";
      } else if (err.message?.includes('bucket')) {
        errorMessage = "S3 bucket not found or not accessible.";
      } else if (err.message?.includes('Network') || err.message?.includes('fetch')) {
        errorMessage = "Network error. Please make sure the backend server is running on port 3001.";
      }
      
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // If showing questions screen, render that instead
  if (showQuestions) {
    return <QuestionsScreen onBack={() => setShowQuestions(false)} theme={theme} />;
  }

  return (
    <div className="relative flex flex-col items-center gap-4 sm:gap-6 flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto">
      <section className={`w-full max-w-4xl rounded-3xl border transition-all duration-300 ${
        isDark 
          ? "border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-xl shadow-slate-950/80" 
          : "border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-white shadow-xl shadow-slate-200/50"
      } px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col relative overflow-hidden`}>
        {/* Decorative gradient orbs */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-30 transition-opacity duration-500 ${
          isDark ? "bg-pink-500/30" : "bg-pink-400/20"
        }`} />
        <div className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl opacity-30 transition-opacity duration-500 ${
          isDark ? "bg-amber-500/20" : "bg-amber-300/15"
        }`} />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-start gap-3 flex-1">
              <button
                onClick={onBack}
                className={`inline-flex items-center justify-center w-10 h-10 rounded-full border transition-all hover:scale-105 flex-shrink-0 mt-0.5 ${
                  isDark
                    ? "border-slate-700/80 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:border-pink-500/50"
                    : "border-slate-300/80 bg-white/80 hover:bg-slate-50 text-slate-600 hover:border-pink-400/50 shadow-sm"
                }`}
                aria-label="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex flex-col gap-2 flex-1">
                <h2 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  Your creative snapshot
                </h2>
                <p className={`text-sm sm:text-base ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}>
                  Upload scripts, clips, resumes, portfolios, or just raw ideas. We&apos;ll
                  use this to understand you and later suggest concrete entertainment
                  roles to try.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className={`inline-flex items-center gap-2 rounded-full border transition-all hover:scale-105 flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm ${
                isDark
                  ? "border-slate-700/80 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:border-pink-500/50"
                  : "border-slate-300/80 bg-white/80 hover:bg-slate-50 text-slate-600 hover:border-pink-400/50 shadow-sm"
              }`}
              aria-label="Toggle instructions"
            >
              <span className="text-base">ℹ️</span>
              <span className="hidden sm:inline font-medium">Instructions</span>
            </button>
          </div>

          <div className={`flex-1 rounded-2xl border transition-all duration-300 ${
            isDark
              ? "border-slate-800/80 bg-gradient-to-b from-slate-900/70 to-slate-950/90"
              : "border-slate-200/70 bg-gradient-to-b from-slate-50/80 to-white"
          } px-4 sm:px-5 py-4 sm:py-5 overflow-hidden flex flex-col min-h-[400px]`}>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {messages.length === 0 ? (
                <div className={`h-full flex flex-col items-center justify-center text-center px-4 py-8 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                    isDark 
                      ? "bg-gradient-to-br from-pink-500/20 to-amber-500/20 border border-pink-500/30" 
                      : "bg-gradient-to-br from-pink-100 to-amber-100 border border-pink-200"
                  }`}>
                    <span className="text-4xl">✨</span>
                  </div>
                  <p className="text-sm sm:text-base font-medium mb-2">
                    Ready to share your creativity?
                  </p>
                  <p className="text-xs sm:text-sm opacity-80">
                    Start by uploading files or typing a message below
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="ml-auto max-w-[88%] rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-400 text-sm sm:text-base text-white px-4 py-3 shadow-lg shadow-pink-500/50 hover:shadow-pink-500/60 transition-shadow"
                  >
                    <div className="flex justify-between items-center text-xs opacity-90 mb-1.5">
                      <span className="font-medium">You</span>
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {msg.text && <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                    {msg.files.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.files.map((name) => (
                          <span
                            key={name}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-2.5 py-1 text-xs font-medium backdrop-blur-sm"
                          >
                            <span>📎</span>
                            <span className="truncate max-w-[140px]">{name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSubmit} className={`pt-3 border-t mt-3 ${
              isDark ? "border-slate-800/80" : "border-slate-200/70"
            }`}>
              <div className="flex flex-col gap-3">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  className={`w-full text-sm sm:text-base rounded-2xl border transition-all duration-200 px-4 py-3 outline-none resize-none ${
                    isDark
                      ? "border-slate-700/80 bg-slate-900/80 text-slate-50 placeholder:text-slate-500 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/60"
                      : "border-slate-300/80 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/60 shadow-sm"
                  }`}
                  placeholder="Tell us about your interests, experience, or dreams in entertainment..."
                />

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <label className={`inline-flex items-center gap-2 text-xs sm:text-sm cursor-pointer rounded-full border border-dashed transition-all px-4 py-2.5 ${
                    isDark
                      ? "border-slate-700/80 bg-slate-800/30 text-slate-300 hover:border-pink-500/60 hover:bg-slate-800/50 hover:text-pink-200"
                      : "border-slate-300/80 bg-slate-50/50 text-slate-600 hover:border-pink-400/60 hover:bg-pink-50/50 hover:text-pink-600 shadow-sm"
                  }`}>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <span className="text-lg">📁</span>
                    <span className="font-medium">Upload</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-tr from-pink-500 to-amber-400 text-sm sm:text-base font-semibold px-6 py-2.5 text-white shadow-lg shadow-pink-500/50 hover:shadow-pink-500/60 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <span>Upload & save</span>
                        <span className="text-lg">↑</span>
                      </>
                    )}
                  </button>
                </div>

                {files.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="text-xs font-medium opacity-70">
                      {files.length} file{files.length > 1 ? 's' : ''} selected
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {files.map((file, idx) => (
                        <span
                          key={`${file.name}-${idx}`}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                            isDark
                              ? "bg-slate-800/80 text-slate-300 border border-slate-700/50"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          <span className="text-sm">📎</span>
                          <span className="truncate max-w-[140px]">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="ml-1 hover:opacity-70 transition-opacity"
                            aria-label="Remove file"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {uploadSuccess && (
                  <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${
                    isDark
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  }`}>
                    <span className="text-lg">✅</span>
                    <span className="font-medium">Upload successful! Your files have been saved.</span>
                  </div>
                )}

                {error && (
                  <div className={`flex flex-col gap-2 rounded-xl px-4 py-3 text-sm ${
                    isDark
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "bg-rose-50 text-rose-600 border border-rose-200"
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      <span className="font-semibold">Connection Error</span>
                    </div>
                    <div className="whitespace-pre-line pl-7">{error}</div>
                    <div className={`mt-2 pt-2 border-t ${isDark ? "border-rose-500/30" : "border-rose-200"} pl-7`}>
                      <p className="text-xs opacity-80">
                        💡 Tip: Open a new terminal and run: <code className="bg-black/10 px-1 py-0.5 rounded">npm run server</code>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Instructions Side Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-96 lg:w-[420px] bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-lg border-l border-slate-200/70 dark:border-slate-800/80 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          showInstructions ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200/70 dark:border-slate-800/80">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50">
            Instructions
          </h3>
          <button
            onClick={() => setShowInstructions(false)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Close instructions"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 text-xs sm:text-sm">
          <div>
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-slate-50">What we&apos;ll do with this</h4>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1.5">
              <li>Understand your interests and confidence levels.</li>
              <li>Infer strengths from your files and stories.</li>
              <li>
                Match you to entertainment career categories (acting, directing,
                editing, music, content).
              </li>
              <li>
                Next steps: simulate 2–3 specific roles you can &quot;try&quot; in the app.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/80 p-4">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-slate-50">What you can upload</h4>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1.5">
              <li>🎭 Photos from a school play or drama club.</li>
              <li>🎬 Short film or vlog you shot on your phone.</li>
              <li>🎧 A song, beat, or cover you recorded.</li>
              <li>📝 Script, story, lyrics, or monologue.</li>
              <li>📄 Resume, CV, or portfolio PDF.</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-pink-500/15 via-amber-400/10 to-sky-400/10 border border-pink-500/30 px-4 py-3 text-[11px] sm:text-xs text-slate-700 dark:text-slate-200">
            <p>
              Designed for ages <span className="font-semibold">16–24</span>. There
              are no &quot;right&quot; answers — just your experiences and what excites you.
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay when panel is open */}
      {showInstructions && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 sm:hidden"
          onClick={() => setShowInstructions(false)}
        />
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <>
          <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50"
            onClick={() => setShowConfirmation(false)}
          />
          <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            <div
              className={`w-full max-w-lg rounded-3xl border shadow-2xl ${
                isDark
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-200"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className={`text-xl font-bold mb-4 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  Review Your Upload
                </h3>
                <p className={`text-sm mb-4 ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}>
                  Please review everything before uploading. Does everything look good?
                </p>

                {/* Text Preview */}
                {text.trim() && (
                  <div className={`mb-4 p-4 rounded-xl ${
                    isDark ? "bg-slate-800/50" : "bg-slate-50"
                  }`}>
                    <div className={`text-xs font-semibold mb-2 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}>
                      Your description:
                    </div>
                    <p className={`text-sm whitespace-pre-wrap ${
                      isDark ? "text-slate-200" : "text-slate-700"
                    }`}>
                      {text}
                    </p>
                  </div>
                )}

                {/* Files Preview */}
                {files.length > 0 && (
                  <div className={`mb-4 p-4 rounded-xl ${
                    isDark ? "bg-slate-800/50" : "bg-slate-50"
                  }`}>
                    <div className={`text-xs font-semibold mb-2 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}>
                      Files to Upload ({files.length}):
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {files.map((file, idx) => (
                        <div
                          key={`${file.name}-${idx}`}
                          className={`flex items-center gap-2 text-sm ${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}
                        >
                          <span>📎</span>
                          <span className="flex-1 truncate">{file.name}</span>
                          <span className={`text-xs ${
                            isDark ? "text-slate-500" : "text-slate-400"
                          }`}>
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmUpload}
                    className="px-6 py-2 rounded-full bg-gradient-to-tr from-pink-500 to-amber-400 text-sm font-semibold text-white shadow-lg shadow-pink-500/50 hover:shadow-pink-500/60 hover:scale-105 transition-all"
                  >
                    Yes, Upload Everything
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Questions Screen Component
function QuestionsScreen({ onBack, theme }) {
  const isDark = theme === "dark";
  
  // Load questions from personality_traits.json
  const questions = React.useMemo(() => {
    const questionsObj = personalityTraitsData.questions;
    // Convert questions object to array, sorted by key (Q1, Q2, etc.)
    return Object.keys(questionsObj)
      .sort()
      .map((key) => ({
        id: key,
        ...questionsObj[key]
      }));
  }, []);

  const [responses, setResponses] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitSuccess(false);
    setIsSubmitting(true);

    try {
      // Prepare the structure with only responses (trait scores will be calculated separately)
      const questionsData = questions.map((q) => ({
        id: q.id,
        question: q.question,
        response: responses[q.id] || ""
      }));

      // Prepare the payload
      const payload = {
        user_id: "uuid001",
        questions: questionsData,
        user_input_summary: "",
        predicted_category: ""
      };

      console.log("Submitting questions data:", payload);

      // Send to backend API
      const response = await fetch("/api/submit-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit questions");
      }

      if (result.success) {
        console.log("Questions submitted successfully:", result);
        // Show success screen, which will auto-transition to loading
        setSubmitSuccess(true);
      } else {
        throw new Error(result.error || "Submission failed");
      }
    } catch (err) {
      console.error("Error submitting questions:", err);
      setSubmitError(err.message || "Something went wrong while submitting your answers.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show results screen if ready
  if (showResults) {
    return <ResultsScreen onBack={() => setShowResults(false)} theme={theme} userId="uuid001" />;
  }

  // Show loading screen
  if (showLoading) {
    return <LoadingScreen theme={theme} onComplete={() => setShowResults(true)} />;
  }

  // Show success screen if submission was successful
  if (submitSuccess) {
    return <SuccessScreen onContinue={() => {
      setSubmitSuccess(false);
      setShowLoading(true);
    }} theme={theme} />;
  }

  // Safety check
  if (!questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className={`text-center ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLikertQuestion = currentQuestion?.type === "likert" || currentQuestion?.type === "likert_reverse";
  const isChoiceQuestion = currentQuestion?.type === "choice";
  const choiceOptions = isChoiceQuestion ? Object.keys(currentQuestion.answers || {}) : [];

  return (
    <div className="relative flex flex-col items-center gap-4 sm:gap-6 flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto">
      <section className={`w-full max-w-4xl rounded-3xl border transition-all duration-300 ${
        isDark 
          ? "border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-xl shadow-slate-950/80" 
          : "border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-white shadow-xl shadow-slate-200/50"
      } px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col relative overflow-hidden`}>
        {/* Decorative gradient orbs */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-30 transition-opacity duration-500 ${
          isDark ? "bg-pink-500/30" : "bg-pink-400/20"
        }`} />
        <div className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl opacity-30 transition-opacity duration-500 ${
          isDark ? "bg-amber-500/20" : "bg-amber-300/15"
        }`} />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-6">
            <div className="flex items-start gap-3 flex-1">
              <button
                onClick={onBack}
                className={`inline-flex items-center justify-center w-10 h-10 rounded-full border transition-all hover:scale-105 flex-shrink-0 mt-0.5 ${
                  isDark
                    ? "border-slate-700/80 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:border-pink-500/50"
                    : "border-slate-300/80 bg-white/80 hover:bg-slate-50 text-slate-600 hover:border-pink-400/50 shadow-sm"
                }`}
                aria-label="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex flex-col gap-2 flex-1">
                <h2 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  Personality Assessment
                </h2>
                <p className={`text-sm sm:text-base ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}>
                  Answer these questions to help us understand your preferences and strengths.
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className={`flex items-center justify-between text-xs sm:text-sm mb-2 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${
              isDark ? "bg-slate-800/50" : "bg-slate-200"
            }`}>
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-amber-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className={`rounded-2xl border transition-all duration-300 mb-6 ${
            isDark
              ? "border-slate-800/80 bg-gradient-to-b from-slate-900/70 to-slate-950/90"
              : "border-slate-200/70 bg-gradient-to-b from-slate-50/80 to-white"
          } px-4 sm:px-6 py-6 sm:py-8`}>
            <div className="mb-6">
              <h3 className={`text-lg sm:text-xl font-semibold mb-4 ${
                isDark ? "text-white" : "text-slate-900"
              }`}>
                {currentQuestion.question}
              </h3>

              {isLikertQuestion ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleResponseChange(currentQuestion.id, num)}
                        className={`flex-1 py-3 px-4 rounded-xl border transition-all font-semibold ${
                          responses[currentQuestion.id] === num
                            ? "bg-gradient-to-tr from-pink-500 to-amber-400 text-white border-transparent shadow-lg shadow-pink-500/50"
                            : isDark
                            ? "border-slate-700/80 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
                            : "border-slate-300/80 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className={`flex justify-between text-xs ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}>
                    <span>{currentQuestion.type === "likert_reverse" ? "Very much" : "Not at all"}</span>
                    <span>{currentQuestion.type === "likert_reverse" ? "Not at all" : "Very much"}</span>
                  </div>
                </div>
              ) : isChoiceQuestion ? (
                <div className="flex flex-col gap-2">
                  <select
                    value={responses[currentQuestion.id] || ""}
                    onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                    className={`w-full text-sm sm:text-base rounded-xl border transition-all duration-200 px-4 py-3 outline-none ${
                      isDark
                        ? "border-slate-700/80 bg-slate-900/80 text-slate-50 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/60"
                        : "border-slate-300/80 bg-white text-slate-900 focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/60 shadow-sm"
                    }`}
                  >
                    <option value="">Select an option...</option>
                    {choiceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <textarea
                  value={responses[currentQuestion.id] || ""}
                  onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                  rows={4}
                  className={`w-full text-sm sm:text-base rounded-xl border transition-all duration-200 px-4 py-3 outline-none resize-none ${
                    isDark
                      ? "border-slate-700/80 bg-slate-900/80 text-slate-50 placeholder:text-slate-500 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/60"
                      : "border-slate-300/80 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/60 shadow-sm"
                  }`}
                  placeholder="Type your answer here..."
                />
              )}
            </div>
          </div>

          {/* Error Messages */}
          {submitError && (
            <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm mb-4 ${
              isDark
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "bg-rose-50 text-rose-600 border border-rose-200"
            }`}>
              <span className="text-lg">⚠️</span>
              <span>{submitError}</span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`inline-flex items-center justify-center gap-2 rounded-full border transition-all px-4 sm:px-6 py-2.5 text-sm sm:text-base font-medium ${
                currentQuestionIndex === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105"
              } ${
                isDark
                  ? "border-slate-700/80 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
                  : "border-slate-300/80 bg-white/80 hover:bg-slate-50 text-slate-700 shadow-sm"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-tr from-pink-500 to-amber-400 text-sm sm:text-base font-semibold px-6 sm:px-8 py-2.5 text-white shadow-lg shadow-pink-500/50 hover:shadow-pink-500/60 hover:scale-105 transition-all ${
                  isSubmitting ? "opacity-70 cursor-not-allowed hover:scale-100" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit
                    <span className="text-lg">✓</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-tr from-pink-500 to-amber-400 text-sm sm:text-base font-semibold px-6 sm:px-8 py-2.5 text-white shadow-lg shadow-pink-500/50 hover:shadow-pink-500/60 hover:scale-105 transition-all"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// Success Screen Component with Animations
function SuccessScreen({ onContinue, theme }) {
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);
  const [checkmarkVisible, setCheckmarkVisible] = useState(false);

  // Generate stable particle positions
  const particles = React.useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
    }));
  }, []);

  useEffect(() => {
    // Trigger animations after mount
    setMounted(true);
    // Trigger checkmark animation after a short delay
    setTimeout(() => setCheckmarkVisible(true), 300);
    
    // Auto-transition to loading screen after 2 seconds
    const timer = setTimeout(() => {
      onContinue();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="relative flex flex-col items-center justify-center flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse ${
          isDark ? "bg-pink-500/40" : "bg-pink-400/30"
        }`} style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse ${
          isDark ? "bg-amber-500/40" : "bg-amber-400/30"
        }`} style={{ animationDelay: '1s', animationDuration: '3s' }} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 animate-pulse ${
          isDark ? "bg-emerald-500/30" : "bg-emerald-400/20"
        }`} style={{ animationDelay: '0.5s', animationDuration: '4s' }} />
      </div>

      {/* Main Content */}
      <div className={`relative z-10 w-full max-w-2xl rounded-3xl border transition-all duration-500 ${
        mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      } ${
        isDark 
          ? "border-slate-800/80 bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-slate-900/95 shadow-2xl shadow-slate-950/80 backdrop-blur-sm" 
          : "border-slate-200/70 bg-gradient-to-br from-white/95 via-slate-50/95 to-white/95 shadow-2xl shadow-slate-200/50 backdrop-blur-sm"
      } px-6 sm:px-8 lg:px-12 py-12 sm:py-16 flex flex-col items-center text-center`}>
        
        {/* Animated Checkmark Circle */}
        <div className={`relative mb-8 ${
          mounted ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        } transition-all duration-700`} style={{ transitionDelay: '200ms' }}>
          {/* Outer Circle with Pulse Animation */}
          <div className={`absolute inset-0 rounded-full ${
            isDark ? "bg-emerald-500/20" : "bg-emerald-400/20"
          } animate-ping`} style={{ animationDuration: '2s' }} />
          
          {/* Middle Circle */}
          <div className={`absolute inset-2 rounded-full ${
            isDark ? "bg-emerald-500/30" : "bg-emerald-400/30"
          } animate-pulse`} style={{ animationDuration: '2s' }} />
          
          {/* Inner Circle with Gradient */}
          <div className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 ${
            isDark ? "shadow-2xl shadow-emerald-500/50" : "shadow-2xl shadow-emerald-400/50"
          } flex items-center justify-center`}>
            {/* Animated Checkmark SVG */}
            <svg 
              className="w-16 h-16 sm:w-20 sm:h-20 text-white"
              fill="none" 
              stroke="currentColor" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              viewBox="0 0 24 24"
            >
              <path
                d="M5 13l4 4L19 7"
                style={{
                  strokeDasharray: 24,
                  strokeDashoffset: checkmarkVisible ? 0 : 24,
                  opacity: checkmarkVisible ? 1 : 0,
                  transition: 'stroke-dashoffset 0.6s ease-in-out 0.3s, opacity 0.3s ease-in-out 0.3s'
                }}
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } transition-all duration-700 ${
          isDark ? "text-white" : "text-slate-900"
        }`} style={{ transitionDelay: '600ms' }}>
          Questions submitted successfully!
        </h1>
        
        <p className={`text-lg sm:text-xl mb-8 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } transition-all duration-700 ${
          isDark ? "text-slate-300" : "text-slate-600"
        }`} style={{ transitionDelay: '800ms' }}>
          Your responses have been saved.
        </p>

        {/* Decorative Elements */}
        <div className={`flex gap-2 mb-8 ${
          mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        } transition-all duration-500`} style={{ transitionDelay: '1000ms' }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                isDark ? "bg-emerald-400" : "bg-emerald-500"
              } animate-bounce`}
              style={{ animationDelay: `${i * 0.1}s`, animationDuration: '1s' }}
            />
          ))}
        </div>

      </div>

      {/* Floating Particles Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute w-2 h-2 rounded-full ${
              isDark ? "bg-emerald-400/30" : "bg-emerald-500/30"
            }`}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animation: `float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Loading Screen Component
function LoadingScreen({ theme, onComplete }) {
  const isDark = theme === "dark";
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Wait a bit more then show results
          setTimeout(() => {
            onComplete();
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 80); // 4 seconds total (100 / 2 * 80ms = 4000ms)

    // Animate loading dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(dotsInterval);
    };
  }, [onComplete]);

  return (
    <div className="relative flex flex-col items-center justify-center flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${
          isDark ? "bg-pink-500/40" : "bg-pink-400/30"
        }`} style={{ animationDuration: '3s' }} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${
          isDark ? "bg-amber-500/40" : "bg-amber-400/30"
        }`} style={{ animationDuration: '3s', animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className={`relative z-10 w-full max-w-2xl rounded-3xl border transition-all duration-500 ${
        isDark 
          ? "border-slate-800/80 bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-slate-900/95 shadow-2xl shadow-slate-950/80 backdrop-blur-sm" 
          : "border-slate-200/70 bg-gradient-to-br from-white/95 via-slate-50/95 to-white/95 shadow-2xl shadow-slate-200/50 backdrop-blur-sm"
      } px-6 sm:px-8 lg:px-12 py-12 sm:py-16 flex flex-col items-center text-center`}>
        
        {/* Spinning Loader */}
        <div className="relative mb-8">
          <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 ${
            isDark ? "border-slate-700" : "border-slate-200"
          } border-t-transparent animate-spin`} />
          <div className={`absolute inset-0 w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 ${
            isDark ? "border-pink-500/30" : "border-pink-400/30"
          } border-t-transparent animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>

        {/* Loading Text */}
        <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${
          isDark ? "text-white" : "text-slate-900"
        }`}>
          Analyzing your responses{dots}
        </h1>
        
        <p className={`text-lg sm:text-xl mb-8 ${
          isDark ? "text-slate-300" : "text-slate-600"
        }`}>
          We're processing your personality profile...
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-md mb-4">
          <div className={`w-full h-2 rounded-full overflow-hidden ${
            isDark ? "bg-slate-800/50" : "bg-slate-200"
          }`}>
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-amber-400 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={`text-sm mt-2 ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}>
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
}

// Debate Choice Screen - Let user choose viewing mode
function DebateChoiceScreen({ theme, onChooseLiveDebate, onChooseSimpleLoader, onBack }) {
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse ${
          isDark ? "bg-pink-500/40" : "bg-pink-400/30"
        }`} style={{ animationDuration: '3s' }} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse ${
          isDark ? "bg-amber-500/40" : "bg-amber-400/30"
        }`} style={{ animationDuration: '3s', animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className={`relative z-10 w-full max-w-3xl rounded-3xl border transition-all duration-500 ${
        mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      } ${
        isDark 
          ? "border-slate-800/80 bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-slate-900/95 shadow-2xl shadow-slate-950/80 backdrop-blur-sm" 
          : "border-slate-200/70 bg-gradient-to-br from-white/95 via-slate-50/95 to-white/95 shadow-2xl shadow-slate-200/50 backdrop-blur-sm"
      } px-6 sm:px-8 lg:px-12 py-12 sm:py-16 flex flex-col items-center text-center`}>
        
        {/* Icon */}
        <div className={`relative mb-8 ${
          mounted ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        } transition-all duration-700`} style={{ transitionDelay: '200ms' }}>
          <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 ${
            isDark ? "shadow-2xl shadow-blue-500/50" : "shadow-2xl shadow-blue-400/50"
          } flex items-center justify-center text-4xl sm:text-5xl`}>
            🎭
          </div>
        </div>

        {/* Title */}
        <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } transition-all duration-700 ${
          isDark ? "text-white" : "text-slate-900"
        }`} style={{ transitionDelay: '300ms' }}>
          How would you like to view the analysis?
        </h1>
        
        <p className={`text-base sm:text-lg mb-8 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } transition-all duration-700 ${
          isDark ? "text-slate-300" : "text-slate-600"
        }`} style={{ transitionDelay: '400ms' }}>
          Choose to watch the AI agents debate in real-time or skip to the results.
        </p>

        {/* Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
          {/* Live Debate Option */}
          <button
            onClick={onChooseLiveDebate}
            className={`group relative rounded-2xl border-2 p-6 text-left transition-all hover:scale-105 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            } transition-all duration-700 ${
              isDark
                ? "border-blue-500/50 bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:border-blue-400/70 hover:shadow-xl hover:shadow-blue-500/30"
                : "border-blue-400/50 bg-gradient-to-br from-blue-50 to-purple-50 hover:border-blue-400/70 hover:shadow-xl hover:shadow-blue-400/30"
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                isDark ? "bg-blue-500/30" : "bg-blue-100"
              }`}>
                🎬
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  Watch Live Debate
                </h3>
                <p className={`text-sm ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}>
                  See AI agents reason, debate, and reach a conclusion in real-time. Experience the full analysis process.
                </p>
              </div>
            </div>
            <div className={`mt-4 flex items-center gap-2 text-sm font-semibold ${
              isDark ? "text-blue-300" : "text-blue-600"
            }`}>
              <span>View Analysis</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>

          {/* Simple Loader Option */}
          <button
            onClick={onChooseSimpleLoader}
            className={`group relative rounded-2xl border-2 p-6 text-left transition-all hover:scale-105 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            } transition-all duration-700 ${
              isDark
                ? "border-amber-500/50 bg-gradient-to-br from-amber-500/20 to-orange-500/20 hover:border-amber-400/70 hover:shadow-xl hover:shadow-amber-500/30"
                : "border-amber-400/50 bg-gradient-to-br from-amber-50 to-orange-50 hover:border-amber-400/70 hover:shadow-xl hover:shadow-amber-400/30"
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                isDark ? "bg-amber-500/30" : "bg-amber-100"
              }`}>
                ⚡
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  Quick Results
                </h3>
                <p className={`text-sm ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}>
                  Skip the analysis and go straight to your recommended role. Faster, but you'll miss the reasoning process.
                </p>
              </div>
            </div>
            <div className={`mt-4 flex items-center gap-2 text-sm font-semibold ${
              isDark ? "text-amber-300" : "text-amber-600"
            }`}>
              <span>Skip to Results</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className={`inline-flex items-center justify-center gap-2 rounded-full border transition-all hover:scale-105 px-6 sm:px-8 py-3 text-sm sm:text-base font-medium ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          } transition-all duration-700 ${
            isDark
              ? "border-slate-700/80 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:border-pink-500/50"
              : "border-slate-300/80 bg-white/80 hover:bg-slate-50 text-slate-700 hover:border-pink-400/50 shadow-sm"
          }`}
          style={{ transitionDelay: '700ms' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Go Back
        </button>
      </div>
    </div>
  );
}

// Simple Loading Screen Component
function SimpleLoadingScreen({ theme, predictedCategory }) {
  const isDark = theme === "dark";
  const [currentMessage, setCurrentMessage] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  const messages = [
    "Finding Your Perfect Role",
    "Crafting Your Perfect Career",
    "Analyzing Your Unique Strengths",
    "Matching Your Personality",
    "Exploring Career Possibilities",
    "Discovering Your Path",
    "Building Your Future",
    "Unlocking Your Potential",
  ];

  useEffect(() => {
    // Cycle through messages with fade animation
    const messageInterval = setInterval(() => {
      setFadeKey(prev => prev + 1);
      setTimeout(() => {
        setCurrentMessage((prev) => {
          return (prev + 1) % messages.length;
        });
      }, 300); // Half of fade transition duration
    }, 2500); // Change message every 2.5 seconds

    return () => {
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${
          isDark ? "bg-pink-500/40" : "bg-pink-400/30"
        }`} style={{ animationDuration: '3s' }} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${
          isDark ? "bg-amber-500/40" : "bg-amber-400/30"
        }`} style={{ animationDuration: '3s', animationDelay: '1s' }} />
        <div className={`absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl opacity-15 animate-pulse ${
          isDark ? "bg-purple-500/40" : "bg-purple-400/30"
        }`} style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
      </div>

      {/* Main Content */}
      <div className={`relative z-10 w-full max-w-2xl rounded-3xl border transition-all duration-500 ${
        isDark 
          ? "border-slate-800/80 bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-slate-900/95 shadow-2xl shadow-slate-950/80 backdrop-blur-sm" 
          : "border-slate-200/70 bg-gradient-to-br from-white/95 via-slate-50/95 to-white/95 shadow-2xl shadow-slate-200/50 backdrop-blur-sm"
      } px-6 sm:px-8 lg:px-12 py-12 sm:py-16 flex flex-col items-center text-center`}>
        
        {/* Spinning Loader with enhanced animation */}
        <div className="relative mb-10">
          <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 ${
            isDark ? "border-slate-700" : "border-slate-200"
          } border-t-transparent animate-spin`} style={{ animationDuration: '1s' }} />
          <div className={`absolute inset-0 w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 ${
            isDark ? "border-pink-500/40" : "border-pink-400/40"
          } border-t-transparent animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className={`absolute inset-2 w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 ${
            isDark ? "border-amber-500/30" : "border-amber-400/30"
          } border-t-transparent animate-spin`} style={{ animationDuration: '2s' }} />
          
          {/* Center glow effect */}
          <div className={`absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full ${
            isDark ? "bg-gradient-to-br from-pink-500/20 to-amber-500/20" : "bg-gradient-to-br from-pink-400/20 to-amber-400/20"
          } blur-xl animate-pulse`} />
        </div>

        {/* Animated Main Message */}
        <div className="relative h-20 sm:h-24 mb-6 flex items-center justify-center">
          <h1 
            key={fadeKey}
            className={`absolute text-2xl sm:text-3xl lg:text-4xl font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
            style={{
              animation: 'fadeInOut 2.5s ease-in-out',
            }}
          >
            {messages[currentMessage]}
          </h1>
        </div>

        {/* Floating particles animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1.5 h-1.5 rounded-full ${
                isDark ? "bg-pink-400/40" : "bg-pink-500/40"
              }`}
              style={{
                left: `${10 + (i * 7)}%`,
                top: `${20 + (i % 3) * 25}%`,
                animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Category Badge */}
        {predictedCategory && (
          <div className={`mt-8 px-6 py-3 rounded-full border transition-all hover:scale-105 ${
            isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-slate-100 border-slate-200"
          }`}>
            <span className={`text-sm sm:text-base font-medium ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}>
              🎯 {predictedCategory}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Debate Stream Screen Component - Shows live debate reasoning
function DebateStreamScreen({ debateStream, theme, onBack }) {
  const isDark = theme === "dark";
  const messagesEndRef = React.useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [debateStream]);

  const renderEvent = (event, index) => {
    const { type, data } = event;
    
    switch (type) {
      case "step_header":
        return (
          <div key={index} className={`text-center py-4 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {data.message}
            </h3>
          </div>
        );
      
      case "step_info":
      case "info":
        return (
          <div key={index} className={`py-2 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            {data.message}
          </div>
        );
      
      case "step_success":
        return (
          <div key={index} className={`py-2 flex items-center gap-2 ${isDark ? "text-emerald-300" : "text-emerald-600"}`}>
            <span>✅</span>
            <span className="font-semibold">{data.message}</span>
          </div>
        );
      
      case "header":
        return (
          <div key={index} className={`text-center py-3 my-2 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
            <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {data.message}
            </h2>
          </div>
        );
      
      case "agent_argument":
        return (
          <div key={index} className={`my-3 p-4 rounded-xl border ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
            <div className={`font-semibold mb-2 ${isDark ? "text-blue-300" : "text-blue-600"}`}>
              {data.agent_name} ({data.role}) presents their case:
            </div>
            <div className={`${isDark ? "text-slate-200" : "text-slate-700"}`}>
              {data.argument}
            </div>
          </div>
        );
      
      case "rebuttal":
        return (
          <div key={index} className={`my-3 p-4 rounded-xl border ${isDark ? "bg-slate-800/50 border-purple-500/30" : "bg-purple-50/50 border-purple-200"}`}>
            <div className={`font-semibold mb-2 ${isDark ? "text-purple-300" : "text-purple-600"}`}>
              {data.agent_name} responds to {data.opponent_name}:
            </div>
            <div className={`${isDark ? "text-slate-200" : "text-slate-700"}`}>
              {data.rebuttal}
            </div>
          </div>
        );
      
      case "moderator_review":
        return (
          <div key={index} className={`text-center py-4 my-3 rounded-lg ${isDark ? "bg-amber-500/20 border border-amber-500/30" : "bg-amber-50 border border-amber-200"}`}>
            <div className={`text-lg font-semibold ${isDark ? "text-amber-300" : "text-amber-700"}`}>
              🎯 Moderator Review
            </div>
            <div className={`mt-2 ${isDark ? "text-amber-200" : "text-amber-600"}`}>
              Analyzing the debate and user profile...
            </div>
          </div>
        );
      
      case "conclusion":
        return (
          <div key={index} className={`my-4 p-6 rounded-xl border-2 ${isDark ? "bg-emerald-500/20 border-emerald-500/50" : "bg-emerald-50 border-emerald-300"}`}>
            <div className={`text-2xl font-bold mb-3 ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
              🎯 FINAL RECOMMENDATION: {data.recommended_role}
            </div>
            <div className={`mb-3 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              Confidence: {'⭐'.repeat(data.confidence)} ({data.confidence}/10)
            </div>
            <div className={`mb-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              <strong>Reason:</strong> {data.reason}
            </div>
            {data.pros && data.pros.length > 0 && (
              <div className="mt-4">
                <div className={`font-semibold mb-2 ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                  ✅ Key Strengths:
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {data.pros.map((pro, i) => (
                    <li key={i} className={isDark ? "text-slate-200" : "text-slate-700"}>{pro}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.considerations && data.considerations.length > 0 && (
              <div className="mt-4">
                <div className={`font-semibold mb-2 ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                  ℹ️ Considerations:
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {data.considerations.map((consideration, i) => (
                    <li key={i} className={isDark ? "text-slate-200" : "text-slate-700"}>{consideration}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="relative flex flex-col flex-1 overflow-hidden">
      <div className={`absolute inset-0 ${isDark ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" : "bg-gradient-to-br from-slate-50 via-white to-slate-50"}`} />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 sm:p-6 border-b ${isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white/50"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isDark ? "bg-blue-500/20" : "bg-blue-100"}`}>
              🎭
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                Live Debate Analysis
              </h2>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Watch the agents debate your best career path
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className={`px-4 py-2 rounded-full border transition-all hover:scale-105 ${
              isDark
                ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
                : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
            }`}
          >
            Close
          </button>
        </div>

        {/* Debate Stream Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className={`max-w-4xl mx-auto rounded-2xl border p-6 ${isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200"}`}>
            {debateStream.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                  Starting debate analysis...
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {debateStream.map((event, index) => renderEvent(event, index))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Results Screen Component
function ResultsScreen({ onBack, theme, userId = "uuid001" }) {
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);
  const [predictedCategory, setPredictedCategory] = useState("");
  const [userInputSummary, setUserInputSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [findingRole, setFindingRole] = useState(false);
  const [showRoleResult, setShowRoleResult] = useState(false);
  const [roleResult, setRoleResult] = useState(null);

  useEffect(() => {
    setMounted(true);
    
    // Fetch the predicted category from the API
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/get-analysis/${userId}`);
        const data = await response.json();
        
        if (data.success && data.predicted_category) {
          setPredictedCategory(data.predicted_category);
          // Extract user_input_summary from analysis if available
          if (data.analysis && data.analysis.user_input_summary) {
            setUserInputSummary(data.analysis.user_input_summary);
          }
        } else {
          setError("Category not found. Please try again later.");
        }
      } catch (err) {
        console.error("Error fetching category:", err);
        setError("Failed to load your category. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [userId]);

  const [debateStream, setDebateStream] = useState([]);
  const [showDebateStream, setShowDebateStream] = useState(false);
  const [showDebateChoice, setShowDebateChoice] = useState(false);
  const [showSimpleLoader, setShowSimpleLoader] = useState(false);

  const handleFindBestRole = async (showLiveDebate = true) => {
    setFindingRole(true);
    setError("");
    setShowDebateChoice(false);
    
    if (showLiveDebate) {
      setDebateStream([]);
      setShowDebateStream(true);
      
      try {
        const response = await fetch(`/api/find-best-role-stream/${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            predicted_category: predictedCategory
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to start debate stream");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const eventData = JSON.parse(line.slice(6));
                
                if (eventData.type === 'error') {
                  throw new Error(eventData.message);
                } else if (eventData.type === 'final_result') {
                  setRoleResult(eventData.data);
                  setShowRoleResult(true);
                  setShowDebateStream(false);
                  setFindingRole(false);
                  return;
                } else {
                  // Add to debate stream
                  setDebateStream(prev => [...prev, eventData]);
                }
              } catch (e) {
                console.error("Error parsing event:", e);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error finding best role:", err);
        setError(err.message || "Failed to find your best matching role. Please try again.");
        setShowDebateStream(false);
        setFindingRole(false);
      }
    } else {
      // Simple loader mode - use non-streaming endpoint
      setShowSimpleLoader(true);
      
      try {
        const response = await fetch(`/api/find-best-role/${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            predicted_category: predictedCategory
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to find best role");
        }

        if (data.success) {
          setRoleResult(data);
          setShowRoleResult(true);
          setShowSimpleLoader(false);
          setFindingRole(false);
        } else {
          throw new Error(data.error || "Failed to find best role");
        }
      } catch (err) {
        console.error("Error finding best role:", err);
        setError(err.message || "Failed to find your best matching role. Please try again.");
        setShowSimpleLoader(false);
        setFindingRole(false);
      }
    }
  };

  const handleStartDebate = () => {
    setShowDebateChoice(true);
  };

  // Show role result screen if available
  if (showRoleResult && roleResult) {
    return <RoleResultScreen onBack={() => setShowRoleResult(false)} theme={theme} roleResult={roleResult} />;
  }

  // Show simple loader if user chose not to see live debate
  if (showSimpleLoader) {
    return <SimpleLoadingScreen theme={theme} predictedCategory={predictedCategory} />;
  }

  // Show debate choice screen
  if (showDebateChoice) {
    return <DebateChoiceScreen 
      theme={theme} 
      onChooseLiveDebate={() => handleFindBestRole(true)}
      onChooseSimpleLoader={() => handleFindBestRole(false)}
      onBack={() => setShowDebateChoice(false)}
    />;
  }

  // Show debate stream if active
  if (showDebateStream) {
    return <DebateStreamScreen debateStream={debateStream} theme={theme} onBack={() => {
      setShowDebateStream(false);
      setFindingRole(false);
    }} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className={`text-center ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p>Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className={`text-center ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={onBack}
            className={`px-6 py-2 rounded-full ${
              isDark
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto custom-scrollbar">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse ${
          isDark ? "bg-pink-500/40" : "bg-pink-400/30"
        }`} style={{ animationDuration: '3s' }} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse ${
          isDark ? "bg-amber-500/40" : "bg-amber-400/30"
        }`} style={{ animationDuration: '3s', animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className={`relative z-10 w-full max-w-2xl rounded-3xl border transition-all duration-500 my-8 ${
        mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      } ${
        isDark 
          ? "border-slate-800/80 bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-slate-900/95 shadow-2xl shadow-slate-950/80 backdrop-blur-sm" 
          : "border-slate-200/70 bg-gradient-to-br from-white/95 via-slate-50/95 to-white/95 shadow-2xl shadow-slate-200/50 backdrop-blur-sm"
      } px-6 sm:px-8 lg:px-12 py-12 sm:py-16 flex flex-col items-center text-center`}>
        
        {/* Category Icon */}
        <div className={`relative mb-8 ${
          mounted ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        } transition-all duration-700`} style={{ transitionDelay: '200ms' }}>
          <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-pink-500 to-amber-400 ${
            isDark ? "shadow-2xl shadow-pink-500/50" : "shadow-2xl shadow-pink-400/50"
          } flex items-center justify-center text-5xl sm:text-6xl`}>
            🎯
          </div>
        </div>

        {/* Category Title */}
        <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } transition-all duration-700 ${
          isDark ? "text-white" : "text-slate-900"
        }`} style={{ transitionDelay: '400ms' }}>
          Your Career Category
        </h1>
        
        {/* Predicted Category */}
        <div className={`w-full mb-8 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } transition-all duration-700`} style={{ transitionDelay: '600ms' }}>
          <div className={`rounded-2xl border-2 ${
            isDark
              ? "border-pink-500/50 bg-gradient-to-br from-pink-500/20 to-amber-400/20"
              : "border-pink-400/50 bg-gradient-to-br from-pink-100/50 to-amber-100/50"
          } px-8 py-6`}>
            <p className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              {predictedCategory || "Unknown"}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className={`text-lg sm:text-xl mb-6 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } transition-all duration-700 ${
          isDark ? "text-slate-300" : "text-slate-600"
        }`} style={{ transitionDelay: '800ms' }}>
          Based on your responses, this category best matches your personality and interests.
        </p>

        {/* User Input Summary - Scrollable */}
        {userInputSummary && (
          <div className={`w-full mb-6 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          } transition-all duration-700`} style={{ transitionDelay: '850ms' }}>
            <div className={`rounded-xl border ${
              isDark 
                ? "border-slate-700/50 bg-slate-800/30" 
                : "border-slate-200 bg-slate-50/50"
            } overflow-hidden`}>
              <div className={`px-4 py-2 border-b ${
                isDark ? "border-slate-700/50 bg-slate-800/50" : "border-slate-200 bg-slate-100/50"
              }`}>
                <h3 className={`text-sm font-semibold ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}>
                  📄 Your Input Summary
                </h3>
              </div>
              <div className={`max-h-48 overflow-y-auto p-4 ${
                isDark ? "text-slate-300" : "text-slate-600"
              } text-sm leading-relaxed custom-scrollbar`}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: isDark ? '#475569 #1e293b' : '#cbd5e1 #f1f5f9'
              }}>
                <div className="whitespace-pre-wrap break-words">
                  {userInputSummary}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Find Best Role Button */}
        <button
          onClick={handleStartDebate}
          disabled={findingRole}
          className={`inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-tr from-pink-500 to-amber-400 text-sm sm:text-base font-semibold px-6 sm:px-8 py-3 text-white shadow-lg shadow-pink-500/50 hover:shadow-pink-500/60 hover:scale-105 transition-all mb-4 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          } transition-all duration-700 ${
            findingRole ? "opacity-70 cursor-not-allowed hover:scale-100" : ""
          }`}
          style={{ transitionDelay: '900ms' }}
        >
          Find your best matching role
          <span className="text-lg">→</span>
        </button>

        {/* Error Message */}
        {error && (
          <div className={`w-full mb-4 rounded-xl px-4 py-2.5 text-sm ${
            isDark
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              : "bg-rose-50 text-rose-600 border border-rose-200"
          }`}>
            {error}
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={onBack}
          className={`inline-flex items-center justify-center gap-2 rounded-full border transition-all hover:scale-105 px-6 sm:px-8 py-3 text-sm sm:text-base font-medium ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          } transition-all duration-700 ${
            isDark
              ? "border-slate-700/80 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:border-pink-500/50"
              : "border-slate-300/80 bg-white/80 hover:bg-slate-50 text-slate-700 hover:border-pink-400/50 shadow-sm"
          }`}
          style={{ transitionDelay: '1000ms' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Go Back
        </button>
      </div>
    </div>
  );
}

// Role Result Screen Component
function RoleResultScreen({ onBack, theme, roleResult }) {
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showExperience, setShowExperience] = useState(false);
  const [experienceRole, setExperienceRole] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { recommended_role, confidence, reason, pros, considerations, debated_roles } = roleResult || {};

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowChat(true);
  };

  const handleExperienceRole = (role) => {
    setExperienceRole(role);
    setShowExperience(true);
  };

  return (
    <div className="relative flex flex-col flex-1 overflow-y-auto">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-full ${
          isDark ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" : "bg-gradient-to-br from-slate-50 via-white to-slate-50"
        }`} />
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse ${
          isDark ? "bg-pink-500/20" : "bg-pink-400/15"
        }`} style={{ animationDuration: '4s' }} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse ${
          isDark ? "bg-amber-500/20" : "bg-amber-400/15"
        }`} style={{ animationDuration: '4s', animationDelay: '1.5s' }} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-15 animate-pulse ${
          isDark ? "bg-emerald-500/15" : "bg-emerald-400/10"
        }`} style={{ animationDuration: '5s', animationDelay: '0.5s' }} />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        
        {/* Top Section: Hero + Other Roles Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Hero Section - Takes 2 columns */}
          <div className={`lg:col-span-2 text-center lg:text-left transition-all duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}>
            {/* Success Badge */}
            <div className="mb-6 flex justify-center lg:justify-start" style={{ transitionDelay: '200ms' }}>
              <div className="relative inline-block">
                <div className={`absolute inset-0 rounded-full ${
                  isDark ? "bg-emerald-500/20" : "bg-emerald-400/20"
                } animate-ping`} style={{ animationDuration: '2s' }} />
                <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-500 ${
                  isDark ? "shadow-2xl shadow-emerald-500/40" : "shadow-2xl shadow-emerald-400/40"
                } flex items-center justify-center text-4xl sm:text-5xl`}>
                  🎯
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 ${
              isDark ? "text-white" : "text-slate-900"
            }`} style={{ transitionDelay: '300ms' }}>
              Your Perfect Match
            </h1>
            
            {/* Recommended Role - Large Display */}
            <div className="mb-6" style={{ transitionDelay: '400ms' }}>
              <div className={`inline-block rounded-2xl ${
                isDark
                  ? "bg-gradient-to-br from-emerald-500/20 via-emerald-600/30 to-emerald-500/20 border-2 border-emerald-500/40"
                  : "bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-100 border-2 border-emerald-300/60"
              } px-8 sm:px-12 py-6 sm:py-8 shadow-xl relative group`}>
                <p className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold bg-gradient-to-r ${
                  isDark 
                    ? "from-emerald-400 via-emerald-300 to-emerald-400" 
                    : "from-emerald-600 via-emerald-700 to-emerald-600"
                } bg-clip-text text-transparent mb-4`}>
                  {recommended_role || "Unknown"}
                </p>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  <button
                    onClick={() => handleRoleSelect(recommended_role)}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:scale-105 ${
                      isDark
                        ? "bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40"
                        : "bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-300"
                    }`}
                  >
                    <span>💬</span>
                    <span>Chat with Expert</span>
                  </button>
                  <button
                    onClick={() => handleExperienceRole(recommended_role)}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:scale-105 ${
                      isDark
                        ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40"
                        : "bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300"
                    }`}
                  >
                    <span>🎮</span>
                    <span>Experience This</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Confidence Score */}
            {confidence && (
              <div className="flex justify-center lg:justify-start" style={{ transitionDelay: '500ms' }}>
                <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full ${
                  isDark 
                    ? "bg-slate-800/60 border border-slate-700/50" 
                    : "bg-white/80 border border-slate-200/50 shadow-md"
                }`}>
                  <span className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Confidence
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(10)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-base transition-all ${
                          i < confidence 
                            ? "text-amber-400" 
                            : isDark ? "text-slate-600" : "text-slate-300"
                        }`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className={`text-base font-bold ${
                    isDark ? "text-amber-400" : "text-amber-600"
                  }`}>
                    {confidence}/10
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Other Roles Considered - Sidebar (Takes 1 column) */}
          {debated_roles && debated_roles.length > 0 && (
            <div className={`lg:col-span-1 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`} style={{ transitionDelay: '400ms' }}>
              <div className={`rounded-2xl border overflow-hidden h-full ${
                isDark
                  ? "border-purple-500/40 bg-gradient-to-br from-slate-900/95 to-slate-950/95 shadow-2xl shadow-purple-500/20"
                  : "border-purple-400/40 bg-white/95 shadow-2xl shadow-purple-400/10"
              }`}>
                <div className={`px-5 sm:px-6 py-5 border-b ${
                  isDark ? "border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-pink-500/20" : "border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isDark ? "bg-purple-500/30" : "bg-purple-200"
                    }`}>
                      <span className="text-xl">🎭</span>
                    </div>
                    <h2 className={`text-lg sm:text-xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}>
                      Other Roles
                    </h2>
                  </div>
                </div>
                <div className="px-5 sm:px-6 py-6 space-y-3">
                  {debated_roles.map((role, index) => (
                    <button
                      key={index}
                      onClick={() => handleRoleSelect(role)}
                      className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 w-full text-left ${
                        role === recommended_role
                          ? isDark
                            ? "bg-gradient-to-r from-emerald-500/30 via-emerald-600/30 to-emerald-500/30 border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40"
                            : "bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 border-2 border-emerald-400 shadow-lg shadow-emerald-400/30 hover:shadow-emerald-400/40"
                          : isDark
                            ? "bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70 hover:border-purple-500/50 hover:shadow-lg"
                            : "bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-purple-300 hover:shadow-md"
                      } ${selectedRole === role ? (isDark ? "ring-2 ring-purple-500" : "ring-2 ring-purple-400") : ""}`}
                    >
                      {role === recommended_role && (
                        <div className={`absolute top-2 right-2 ${
                          isDark ? "text-emerald-400" : "text-emerald-600"
                        }`}>
                          <span className="text-lg">👑</span>
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        <div className={`flex-1 ${
                          role === recommended_role
                            ? isDark ? "text-emerald-300 font-semibold" : "text-emerald-700 font-semibold"
                            : isDark ? "text-slate-300" : "text-slate-600"
                        }`}>
                          <span className="text-sm sm:text-base">{role}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRoleSelect(role);
                            }}
                            className={`text-xs px-2 py-1 rounded-full transition-all hover:scale-105 ${
                              isDark ? "bg-purple-500/20 hover:bg-purple-500/30 text-purple-300" : "bg-purple-100 hover:bg-purple-200 text-purple-600"
                            }`}
                          >
                            💬 Chat
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExperienceRole(role);
                            }}
                            className={`text-xs px-2 py-1 rounded-full transition-all hover:scale-105 ${
                              isDark ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300" : "bg-blue-100 hover:bg-blue-200 text-blue-600"
                            }`}
                          >
                            🎮 Experience
                          </button>
                        </div>
                      </div>
                      {role === recommended_role && (
                        <div className={`mt-2 text-xs font-medium ${
                          isDark ? "text-emerald-400" : "text-emerald-600"
                        }`}>
                          ⭐ Recommended
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Section - Full Width */}
        <div className="space-y-6">
          
          {/* Why This Role - Full Width */}
          {reason && (
            <div className={`rounded-2xl border overflow-hidden transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            } ${
              isDark
                ? "border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950/90 shadow-xl"
                : "border-slate-200/80 bg-white/90 shadow-xl"
            }`} style={{ transitionDelay: '600ms' }}>
              <div className={`px-6 sm:px-8 py-5 border-b ${
                isDark ? "border-slate-800 bg-slate-800/50" : "border-slate-200 bg-slate-50/50"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isDark ? "bg-blue-500/20" : "bg-blue-100"
                  }`}>
                    <span className="text-2xl">💡</span>
                  </div>
                  <h2 className={`text-xl sm:text-2xl font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}>
                    Why This Role?
                  </h2>
                </div>
              </div>
              <div className="px-6 sm:px-8 py-6">
                <p className={`text-base sm:text-lg leading-relaxed ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}>
                  {reason}
                </p>
              </div>
            </div>
          )}

          {/* Two Column Grid for Pros and Considerations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Key Strengths Card */}
            {pros && pros.length > 0 && (
              <div className={`rounded-2xl border overflow-hidden transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              } ${
                isDark
                  ? "border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950/90 shadow-xl"
                  : "border-slate-200/80 bg-white/90 shadow-xl"
              }`} style={{ transitionDelay: '700ms' }}>
                <div className={`px-6 py-5 border-b ${
                  isDark ? "border-slate-800 bg-slate-800/50" : "border-slate-200 bg-slate-50/50"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isDark ? "bg-emerald-500/20" : "bg-emerald-100"
                    }`}>
                      <span className="text-2xl">✨</span>
                    </div>
                    <h2 className={`text-xl sm:text-2xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}>
                      Key Strengths
                    </h2>
                  </div>
                </div>
                <div className="px-6 py-6">
                  <ul className="space-y-3">
                    {pros.map((pro, index) => (
                      <li 
                        key={index} 
                        className={`flex items-start gap-3 p-3 rounded-xl transition-all hover:scale-[1.01] ${
                          isDark 
                            ? "bg-slate-800/30 hover:bg-slate-800/50" 
                            : "bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isDark ? "bg-emerald-500/20" : "bg-emerald-100"
                        }`}>
                          <span className="text-emerald-500 text-sm font-bold">✓</span>
                        </div>
                        <span className={`flex-1 text-sm sm:text-base ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                          {pro}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Considerations Card */}
            {considerations && considerations.length > 0 && (
              <div className={`rounded-2xl border overflow-hidden transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              } ${
                isDark
                  ? "border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950/90 shadow-xl"
                  : "border-slate-200/80 bg-white/90 shadow-xl"
              }`} style={{ transitionDelay: '800ms' }}>
                <div className={`px-6 py-5 border-b ${
                  isDark ? "border-slate-800 bg-slate-800/50" : "border-slate-200 bg-slate-50/50"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isDark ? "bg-amber-500/20" : "bg-amber-100"
                    }`}>
                      <span className="text-2xl">📋</span>
                    </div>
                    <h2 className={`text-xl sm:text-2xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}>
                      Things to Consider
                    </h2>
                  </div>
                </div>
                <div className="px-6 py-6">
                  <ul className="space-y-3">
                    {considerations.map((consideration, index) => (
                      <li 
                        key={index} 
                        className={`flex items-start gap-3 p-3 rounded-xl transition-all hover:scale-[1.01] ${
                          isDark 
                            ? "bg-slate-800/30 hover:bg-slate-800/50" 
                            : "bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isDark ? "bg-amber-500/20" : "bg-amber-100"
                        }`}>
                          <span className="text-amber-500 text-sm">ℹ</span>
                        </div>
                        <span className={`flex-1 text-sm sm:text-base ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                          {consideration}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Back Button */}
        <div className="text-center pt-6">
          <button
            onClick={onBack}
            className={`inline-flex items-center justify-center gap-2 rounded-full border transition-all hover:scale-105 px-8 py-3.5 text-base font-medium ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            } transition-all duration-700 ${
              isDark
                ? "border-slate-700/80 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:border-pink-500/50 shadow-lg"
                : "border-slate-300/80 bg-white/80 hover:bg-slate-50 text-slate-700 hover:border-pink-400/50 shadow-lg"
            }`}
            style={{ transitionDelay: '1000ms' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
          </button>
        </div>
      </div>

      {/* Chatbot Sidebar */}
      {showChat && selectedRole && (
        <MentorChatbot
          role={selectedRole}
          theme={theme}
          onClose={() => {
            setShowChat(false);
            setSelectedRole(null);
          }}
        />
      )}

      {/* Virtual Experience Modal */}
      {showExperience && experienceRole && (
        <VirtualExperience
          role={experienceRole}
          theme={theme}
          onClose={() => {
            setShowExperience(false);
            setExperienceRole(null);
          }}
        />
      )}
    </div>
  );
}

// Virtual Experience Component - Interactive Role Simulation Game
function VirtualExperience({ role, theme, onClose }) {
  const isDark = theme === "dark";
  const [gameState, setGameState] = useState("playing"); // "playing", "completed"
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
  const [level, setLevel] = useState(1);

    const roleLower = role?.toLowerCase() || "";
    
  // Game state for different role types - Meaningful real-world scenarios
  const [gameData, setGameData] = useState(() => {
    
    // Video Editor Game: Edit a story with narrative flow
    if (roleLower.includes("editor") || roleLower.includes("video")) {
      const scenes = [
        { id: 1, description: "Wide shot: Character walks into coffee shop", storyPoint: "Establishing location" },
        { id: 2, description: "Close-up: Character's hand shakes as they order", storyPoint: "Show nervousness" },
        { id: 3, description: "Medium shot: Character sits at table, looks around", storyPoint: "Build tension" },
        { id: 4, description: "Extreme close-up: Character's eyes widen in recognition", storyPoint: "Revelation moment" }
      ];
      return {
        type: "timeline",
        scenes: scenes.sort(() => Math.random() - 0.5),
        correctOrder: [1, 2, 3, 4],
        selected: [],
        storyContext: "A character is meeting someone important for the first time. Edit the scenes to create emotional progression."
      };
    }
    // Sound Engineer Game: Mix a song with real context
    else if (roleLower.includes("sound") || roleLower.includes("audio") || roleLower.includes("engineer")) {
      return {
        type: "mixing",
        songContext: "You're mixing a pop ballad. The vocals need to be prominent, but the emotional guitar solo should shine in the bridge.",
        tracks: [
          { name: "Lead Vocals", level: Math.floor(Math.random() * 100), target: 80, description: "Main melody - should be clear and upfront" },
          { name: "Drums", level: Math.floor(Math.random() * 100), target: 65, description: "Rhythm foundation - present but not overwhelming" },
          { name: "Bass", level: Math.floor(Math.random() * 100), target: 60, description: "Low end support - felt more than heard" },
          { name: "Guitar Solo", level: Math.floor(Math.random() * 100), target: 75, description: "Emotional peak - needs space to breathe" },
          { name: "Background Vocals", level: Math.floor(Math.random() * 100), target: 55, description: "Harmony layer - subtle enhancement" }
        ]
      };
    }
    // Director Game: Choose shots based on emotional storytelling
    else if (roleLower.includes("director") || roleLower.includes("filmmaker")) {
      const scenarios = [
        {
          scene: "Opening scene: A detective arrives at a crime scene",
          goal: "Establish the setting and mood",
          shots: [
            { id: 1, description: "Wide establishing shot of the entire scene", correct: true, reason: "Establishes location and context for the audience" },
            { id: 2, description: "Close-up of detective's face", correct: false, reason: "Too intimate for an opening - we need context first" },
            { id: 3, description: "Extreme close-up of a clue", correct: false, reason: "Spoils the mystery - save details for later" }
          ]
        },
        {
          scene: "Emotional moment: Character learns their loved one is safe",
          goal: "Capture the emotional release",
          shots: [
            { id: 1, description: "Wide shot of the room", correct: false, reason: "Too distant - we need to feel the emotion" },
            { id: 2, description: "Close-up of character's face showing relief", correct: true, reason: "Captures the emotional moment intimately" },
            { id: 3, description: "Overhead shot looking down", correct: false, reason: "Creates distance from the emotion" }
          ]
        },
        {
          scene: "Action sequence: A chase through narrow streets",
          goal: "Create energy and urgency",
          shots: [
            { id: 1, description: "Static wide shot", correct: false, reason: "Too static - action needs movement" },
            { id: 2, description: "Handheld medium shot following the action", correct: true, reason: "Creates immediacy and energy" },
            { id: 3, description: "Slow-motion close-up", correct: false, reason: "Kills the urgency of the chase" }
          ]
        }
      ];
      return {
        type: "shot",
        scenarios: scenarios,
        currentScenario: 0
      };
    }
    // Writer Game: Write dialogue that matches character voice
    else if (roleLower.includes("writer") || roleLower.includes("screenwriter") || roleLower.includes("journalist")) {
      const challenges = [
        {
          context: "A confident CEO is addressing their team after a major setback.",
          character: "Strong, reassuring leader",
          dialogue: "Team, I know this is tough, but we've faced challenges before. We will _____.",
          options: [
            { text: "bounce back stronger", correct: true, reason: "Shows resilience and leadership" },
            { text: "figure something out", correct: false, reason: "Too uncertain for a confident leader" },
            { text: "try our best", correct: false, reason: "Lacks conviction and strength" }
          ]
        },
        {
          context: "A shy teenager is confessing their feelings for the first time.",
          character: "Nervous, vulnerable, authentic",
          dialogue: "I've been wanting to tell you... I think I _____ you.",
          options: [
            { text: "like", correct: true, reason: "Simple and authentic for a shy character" },
            { text: "adore", correct: false, reason: "Too formal and mature for a teenager" },
            { text: "am infatuated with", correct: false, reason: "Too sophisticated and wordy" }
          ]
        },
        {
          context: "A veteran journalist is breaking a major story.",
          character: "Professional, precise, ethical",
          dialogue: "After months of investigation, we can now confirm that _____.",
          options: [
            { text: "the evidence points to", correct: true, reason: "Professional, factual, and responsible" },
            { text: "we totally caught them", correct: false, reason: "Too casual and unprofessional" },
            { text: "it's definitely true that", correct: false, reason: "Lacks journalistic precision" }
          ]
        }
      ];
      return {
        type: "writing",
        challenges: challenges,
        currentChallenge: 0
      };
    }
    // Producer Game: Manage a real production with constraints
    else if (roleLower.includes("producer")) {
      return {
        type: "budget",
        project: "Short Film: 'Midnight Train' - 15 minute drama",
        totalBudget: 50000,
        deadline: "6 weeks",
        categories: [
          { name: "Camera & Equipment", allocated: 0, min: 8000, max: 12000, priority: "High - Can't shoot without it", description: "Rental for 2 weeks" },
          { name: "Cast & Crew", allocated: 0, min: 15000, max: 20000, priority: "High - Key talent", description: "Lead actor, DP, sound recordist" },
          { name: "Location & Permits", allocated: 0, min: 5000, max: 8000, priority: "Medium - Can negotiate", description: "Train station, permits, insurance" },
          { name: "Post-Production", allocated: 0, min: 10000, max: 15000, priority: "High - Essential for delivery", description: "Editing, color, sound mix" },
          { name: "Contingency", allocated: 0, min: 2000, max: 5000, priority: "Critical - Always needed", description: "Unexpected costs (10% rule)" }
        ],
        constraint: "You must allocate exactly $50,000. Industry standard: 10% contingency is essential."
      };
    }
    // Generic Project Management Game
    else {
      return {
        type: "project",
        projectName: "Launch New Campaign",
        phase: 1,
        tasks: [
          { id: 1, name: "Define project scope and objectives", completed: false, points: 15, time: 2, description: "Foundation for everything else" },
          { id: 2, name: "Assemble and brief the team", completed: false, points: 20, time: 1, description: "Get everyone aligned" },
          { id: 3, name: "Create timeline and milestones", completed: false, points: 15, time: 1, description: "Plan the execution" },
          { id: 4, name: "Identify risks and mitigation strategies", completed: false, points: 25, time: 2, description: "Prepare for challenges" }
        ],
        totalTime: 0,
        maxTime: 8
      };
    }
  });

  // Timer effect
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameState("completed");
    }
  }, [timeLeft, gameState]);

  // Game actions based on type
  const handleGameAction = (action, data) => {
    if (gameData.type === "timeline") {
      // Timeline game: select scenes in story order
      const newSelected = [...gameData.selected, data];
      setGameData({ ...gameData, selected: newSelected });
      
      if (newSelected.length === gameData.correctOrder.length) {
        const selectedIds = newSelected.map(s => s.id);
        const isCorrect = selectedIds.every((id, idx) => id === gameData.correctOrder[idx]);
        if (isCorrect) {
          setScore(score + 50);
          setLevel(level + 1);
          // Reset for next level with new scenes
          const newScenes = [...gameData.scenes].sort(() => Math.random() - 0.5);
          setGameData({
            ...gameData,
            scenes: newScenes,
            selected: []
          });
        } else {
          // Show feedback and reset
    setTimeout(() => {
            setGameData({ ...gameData, selected: [] });
          }, 1500);
        }
      }
    } else if (gameData.type === "mixing") {
      // Mixing game: adjust track levels
      const newTracks = gameData.tracks.map(track => 
        track.name === data.name ? { ...track, level: data.level } : track
      );
      setGameData({ ...gameData, tracks: newTracks });
      
      // Check if all tracks are close to target (within 5)
      const allCorrect = newTracks.every(track => Math.abs(track.level - track.target) <= 5);
      if (allCorrect) {
        setScore(score + 40);
        setLevel(level + 1);
        // Reset for next level
        setGameData({
          ...gameData,
          tracks: gameData.tracks.map(t => ({ ...t, level: Math.floor(Math.random() * 100), target: Math.floor(Math.random() * 30) + 55 }))
        });
      }
    } else if (gameData.type === "shot") {
      // Shot selection game
      if (data.correct) {
        setScore(score + 30);
        if (gameData.currentScenario < gameData.scenarios.length - 1) {
          setGameData({
            ...gameData,
            currentScenario: gameData.currentScenario + 1
          });
      } else {
          setLevel(level + 1);
          setGameData({
            ...gameData,
            currentScenario: 0
          });
        }
      }
    } else if (gameData.type === "writing") {
      // Writing game: choose best dialogue
      if (data.correct) {
        setScore(score + 25);
        if (gameData.currentChallenge < gameData.challenges.length - 1) {
          setGameData({
            ...gameData,
            currentChallenge: gameData.currentChallenge + 1
          });
        } else {
          setLevel(level + 1);
          setGameData({
            ...gameData,
            currentChallenge: 0
          });
        }
      }
    } else if (gameData.type === "budget") {
      // Budget allocation game
      const newCategories = gameData.categories.map(cat =>
        cat.name === data.name ? { ...cat, allocated: data.allocated } : cat
      );
      setGameData({ ...gameData, categories: newCategories });
      
      const totalAllocated = newCategories.reduce((sum, cat) => sum + cat.allocated, 0);
      const allValid = newCategories.every(cat => 
        cat.allocated >= cat.min && cat.allocated <= cat.max
      ) && totalAllocated === gameData.totalBudget;
      
      if (allValid) {
        setScore(score + 50);
        setLevel(level + 1);
        // Reset for next level
        setGameData({
          ...gameData,
          categories: gameData.categories.map(c => ({ ...c, allocated: 0 }))
        });
      }
    } else if (gameData.type === "project") {
      // Project management game
      const newTasks = gameData.tasks.map(task =>
        task.id === data.id ? { ...task, completed: true } : task
      );
      const newTotalTime = gameData.totalTime + data.time;
      setGameData({ ...gameData, tasks: newTasks, totalTime: newTotalTime });
      setScore(score + data.points);
      
      if (newTasks.every(t => t.completed) && newTotalTime <= gameData.maxTime) {
        setLevel(level + 1);
        setGameData({
          ...gameData,
          tasks: gameData.tasks.map(t => ({ ...t, completed: false })),
          totalTime: 0
        });
      }
    }
  };

  const resetGame = () => {
    setGameState("playing");
    setScore(0);
    setTimeLeft(60);
    setLevel(1);
    // Reset game data based on type
    if (gameData.type === "timeline") {
      setGameData({
        ...gameData,
        scenes: [...gameData.scenes].sort(() => Math.random() - 0.5),
        selected: []
      });
    } else if (gameData.type === "mixing") {
      setGameData({
        ...gameData,
        tracks: gameData.tracks.map(t => ({ ...t, level: Math.floor(Math.random() * 100), target: Math.floor(Math.random() * 30) + 55 }))
      });
    } else if (gameData.type === "shot") {
      setGameData({
        ...gameData,
        currentScenario: 0
      });
    } else if (gameData.type === "writing") {
      setGameData({
        ...gameData,
        currentChallenge: 0
      });
    } else if (gameData.type === "budget") {
      setGameData({
        ...gameData,
        categories: gameData.categories.map(c => ({ ...c, allocated: 0 }))
      });
    } else if (gameData.type === "project") {
      setGameData({
        ...gameData,
        tasks: gameData.tasks.map(t => ({ ...t, completed: false })),
        totalTime: 0
      });
    }
  };

  const getScoreMessage = () => {
    const percentage = (score / (level * 50)) * 100;
    if (percentage >= 80) return { message: "Outstanding! You're a natural!", emoji: "🌟", color: "emerald" };
    if (percentage >= 60) return { message: "Great job! You have strong potential!", emoji: "✨", color: "blue" };
    if (percentage >= 40) return { message: "Good effort! Keep learning!", emoji: "👍", color: "amber" };
    return { message: "Keep practicing! Every expert was once a beginner.", emoji: "💪", color: "purple" };
  };

  // Render game based on type
  const renderGame = () => {
    if (gameData.type === "timeline") {
      return (
        <div className="space-y-4">
          <div className={`p-3 rounded-lg ${isDark ? "bg-blue-500/10 border border-blue-500/30" : "bg-blue-50 border border-blue-200"}`}>
            <p className={`text-sm font-medium mb-1 ${isDark ? "text-blue-300" : "text-blue-700"}`}>Story Context:</p>
            <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{gameData.storyContext}</p>
          </div>
          <p className={`text-center font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
            Arrange scenes to create emotional progression
          </p>
          <div className={`p-4 rounded-xl border-2 border-dashed ${isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-300 bg-slate-50"}`}>
            <p className={`text-sm mb-3 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Timeline:</p>
            <div className="flex gap-2 flex-wrap min-h-[60px]">
              {gameData.selected.length === 0 ? (
                <span className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>Click scenes below to add them in order</span>
              ) : (
                gameData.selected.map((scene, idx) => (
                  <div key={idx} className={`px-4 py-2 rounded-lg ${isDark ? "bg-blue-500/20 border border-blue-500/40" : "bg-blue-100 border border-blue-300"}`}>
                    <div className="text-xs font-medium">{idx + 1}. {scene.description}</div>
                    <div className="text-xs opacity-75">{scene.storyPoint}</div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="space-y-2">
            <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Available Scenes:</p>
            {gameData.scenes.filter(s => !gameData.selected.includes(s)).map((scene, idx) => (
              <button
                key={idx}
                onClick={() => handleGameAction("select", scene)}
                className={`w-full text-left p-3 rounded-lg transition-all border ${
                  isDark ? "bg-slate-800 hover:bg-slate-700 border-slate-600 hover:border-blue-500" : "bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300"
                }`}
              >
                <div className={`font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>{scene.description}</div>
                <div className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{scene.storyPoint}</div>
              </button>
            ))}
          </div>
        </div>
      );
    } else if (gameData.type === "mixing") {
      return (
        <div className="space-y-4">
          <div className={`p-3 rounded-lg ${isDark ? "bg-purple-500/10 border border-purple-500/30" : "bg-purple-50 border border-purple-200"}`}>
            <p className={`text-sm font-medium mb-1 ${isDark ? "text-purple-300" : "text-purple-700"}`}>Mixing Context:</p>
            <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{gameData.songContext}</p>
          </div>
          <p className={`text-center font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
            Adjust each track to match the target level (green marker)
          </p>
          {gameData.tracks.map((track, idx) => {
            const isCorrect = Math.abs(track.level - track.target) <= 5;
            return (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>{track.name}</span>
                    <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{track.description}</p>
                  </div>
                  <span className={`text-sm font-medium ${isCorrect ? (isDark ? "text-emerald-400" : "text-emerald-600") : (isDark ? "text-slate-400" : "text-slate-500")}`}>
                    {track.level} / {track.target}
                  </span>
                </div>
                <div className="relative">
                  <div className={`h-10 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                    <div
                      className={`h-full rounded-lg transition-all ${isCorrect ? "bg-emerald-500" : "bg-blue-500"}`}
                      style={{ width: `${track.level}%` }}
                    />
                    <div
                      className={`absolute top-0 h-full w-1 ${isDark ? "bg-emerald-300" : "bg-emerald-500"}`}
                      style={{ left: `${track.target}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={track.level}
                    onChange={(e) => handleGameAction("adjust", { name: track.name, level: parseInt(e.target.value) })}
                    className="w-full mt-2"
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    } else if (gameData.type === "shot") {
      const current = gameData.scenarios[gameData.currentScenario];
      return (
        <div className="space-y-4">
          <div className={`p-3 rounded-lg ${isDark ? "bg-amber-500/10 border border-amber-500/30" : "bg-amber-50 border border-amber-200"}`}>
            <p className={`text-sm font-medium mb-1 ${isDark ? "text-amber-300" : "text-amber-700"}`}>Scene:</p>
            <p className={`text-sm font-semibold mb-2 ${isDark ? "text-slate-200" : "text-slate-700"}`}>{current.scene}</p>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Goal: {current.goal}</p>
          </div>
          <p className={`text-center font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
            Choose the shot that best achieves the goal
          </p>
          <div className="space-y-3">
            {current.shots.map((shot) => (
              <button
                key={shot.id}
                onClick={() => handleGameAction("select", shot)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  isDark
                    ? "bg-slate-800 border-slate-700 hover:border-blue-500"
                    : "bg-white border-slate-200 hover:border-blue-300"
                }`}
              >
                <div className="text-3xl mb-2">🎬</div>
                <p className={`font-medium mb-2 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                  {shot.description}
                </p>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {shot.reason}
                </p>
              </button>
            ))}
          </div>
        </div>
      );
    } else if (gameData.type === "writing") {
      const current = gameData.challenges[gameData.currentChallenge];
      return (
        <div className="space-y-4">
          <div className={`p-3 rounded-lg ${isDark ? "bg-indigo-500/10 border border-indigo-500/30" : "bg-indigo-50 border border-indigo-200"}`}>
            <p className={`text-sm font-medium mb-1 ${isDark ? "text-indigo-300" : "text-indigo-700"}`}>Context:</p>
            <p className={`text-sm mb-2 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{current.context}</p>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Character: {current.character}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
            <p className={`text-lg text-center ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              {current.dialogue}
            </p>
          </div>
          <p className={`text-center text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Choose the word/phrase that matches the character's voice
          </p>
          <div className="space-y-3">
            {current.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleGameAction("select", option)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  isDark
                    ? "bg-slate-800 border-slate-700 hover:border-blue-500"
                    : "bg-white border-slate-200 hover:border-blue-300"
                }`}
              >
                <span className={`font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                  {option.text}
                </span>
                <p className={`text-xs mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {option.reason}
                </p>
              </button>
            ))}
          </div>
        </div>
      );
    } else if (gameData.type === "budget") {
      const totalAllocated = gameData.categories.reduce((sum, cat) => sum + cat.allocated, 0);
      const remaining = gameData.totalBudget - totalAllocated;
      return (
        <div className="space-y-4">
          <div className={`p-3 rounded-lg ${isDark ? "bg-green-500/10 border border-green-500/30" : "bg-green-50 border border-green-200"}`}>
            <p className={`text-sm font-medium mb-1 ${isDark ? "text-green-300" : "text-green-700"}`}>Project: {gameData.project}</p>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Deadline: {gameData.deadline}</p>
            <p className={`text-xs mt-2 ${isDark ? "text-amber-300" : "text-amber-600"}`}>{gameData.constraint}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
            <p className={`text-center font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              Total Budget: ${gameData.totalBudget.toLocaleString()}
            </p>
            <p className={`text-center text-sm font-medium ${remaining === 0 ? (isDark ? "text-emerald-400" : "text-emerald-600") : remaining > 0 ? (isDark ? "text-amber-400" : "text-amber-600") : (isDark ? "text-red-400" : "text-red-600")}`}>
              Remaining: ${remaining.toLocaleString()}
            </p>
          </div>
          {gameData.categories.map((category, idx) => {
            const isValid = category.allocated >= category.min && category.allocated <= category.max;
            return (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                        {category.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${category.priority.includes("High") || category.priority.includes("Critical") ? (isDark ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-700") : (isDark ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-700")}`}>
                        {category.priority}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{category.description}</p>
                  </div>
                  <span className={`text-sm font-medium ${isValid ? (isDark ? "text-emerald-400" : "text-emerald-600") : (isDark ? "text-amber-400" : "text-amber-600")}`}>
                    ${category.allocated.toLocaleString()}
                  </span>
                </div>
                <div className="space-y-1">
                  <input
                    type="range"
                    min="0"
                    max={category.max * 1000}
                    step="1000"
                    value={category.allocated}
                    onChange={(e) => handleGameAction("allocate", { name: category.name, allocated: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs">
                    <span className={isDark ? "text-slate-500" : "text-slate-400"}>Min: ${category.min.toLocaleString()}</span>
                    <span className={isDark ? "text-slate-500" : "text-slate-400"}>Max: ${category.max.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    } else {
      // Project management game
      return (
        <div className="space-y-4">
          <div className={`p-3 rounded-lg ${isDark ? "bg-teal-500/10 border border-teal-500/30" : "bg-teal-50 border border-teal-200"}`}>
            <p className={`text-sm font-medium mb-1 ${isDark ? "text-teal-300" : "text-teal-700"}`}>Project: {gameData.projectName}</p>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Time Used: {gameData.totalTime} / {gameData.maxTime} weeks
            </p>
          </div>
          <p className={`text-center font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
            Complete all tasks within the time limit
          </p>
          <div className="space-y-3">
            {gameData.tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => !task.completed && handleGameAction("complete", task)}
                disabled={task.completed || (gameData.totalTime + task.time > gameData.maxTime)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  task.completed
                    ? isDark
                      ? "bg-emerald-500/20 border-emerald-500/40"
                      : "bg-emerald-100 border-emerald-300"
                    : (gameData.totalTime + task.time > gameData.maxTime)
                    ? isDark
                      ? "bg-slate-800/30 border-slate-700/50 opacity-50 cursor-not-allowed"
                      : "bg-slate-100/50 border-slate-200/50 opacity-50 cursor-not-allowed"
                    : isDark
                    ? "bg-slate-800 border-slate-700 hover:border-blue-500"
                    : "bg-white border-slate-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                        {task.completed ? "✓ " : ""}{task.name}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{task.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                      {task.time}w
                    </span>
                    <span className={`text-xs block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      +{task.points}pts
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }
  };


  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Experience Modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isDark ? "text-white" : "text-slate-900"
      }`}>
        <div
          className={`w-full max-w-3xl max-h-[90vh] rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${
            isDark
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50/50"
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                isDark ? "bg-blue-500/20" : "bg-blue-100"
              }`}>
                🎮
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  Experience: {role}
                </h2>
                <p className={`text-sm ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Level {level} | Time: {timeLeft}s | Score: {score}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 ${
                isDark ? "text-slate-300" : "text-slate-600"
              } transition-colors`}
              aria-label="Close experience"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {gameState === "playing" ? (
              <div className="space-y-6">
                {/* Timer and Score */}
                <div className={`flex justify-between items-center p-4 rounded-xl ${
                  isDark ? "bg-slate-800/50" : "bg-slate-100"
                }`}>
                  <div>
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Level</p>
                    <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{level}</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Time</p>
                    <p className={`text-2xl font-bold ${timeLeft <= 10 ? "text-red-500" : isDark ? "text-blue-400" : "text-blue-600"}`}>
                      {timeLeft}s
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Score</p>
                    <p className={`text-2xl font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>{score}</p>
                  </div>
                </div>

                {/* Game Content */}
                <div className={`rounded-2xl border p-6 ${
                  isDark
                    ? "border-slate-800 bg-gradient-to-br from-slate-900/70 to-slate-950/90"
                    : "border-slate-200 bg-gradient-to-b from-slate-50/80 to-white"
                }`}>
                  {renderGame()}
                </div>
              </div>
            ) : (
              /* Completion Screen */
              <div className="text-center space-y-6 py-8">
                <div className="text-8xl mb-4">{getScoreMessage().emoji}</div>
                <h3 className={`text-3xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  Experience Complete!
                </h3>
                <div className={`inline-block px-6 py-3 rounded-full ${
                  getScoreMessage().color === "emerald"
                    ? isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-700"
                    : getScoreMessage().color === "blue"
                    ? isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"
                    : getScoreMessage().color === "amber"
                    ? isDark ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-700"
                    : isDark ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 text-purple-700"
                }`}>
                  <p className="text-xl font-semibold">{getScoreMessage().message}</p>
                </div>
                <div className={`p-6 rounded-xl ${
                  isDark ? "bg-slate-800/50" : "bg-slate-100"
                }`}>
                  <p className={`text-2xl font-bold mb-2 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}>
                    Final Score: {score}
                  </p>
                  <p className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}>
                    Level Reached: {level}
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={resetGame}
                    className={`px-6 py-3 rounded-full font-semibold transition-all hover:scale-105 ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                        : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                    }`}
                  >
                    Play Again
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-full bg-gradient-to-tr from-pink-500 to-amber-400 text-white font-semibold transition-all hover:scale-105 shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Mentor Chatbot Component
function MentorChatbot({ role, theme, onClose }) {
  const isDark = theme === "dark";
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I'm your career mentor for ${role}. Ask me anything about this role - salary, skills needed, career path, or how to get started! 💬`
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat-with-mentor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: role,
          message: userMessage,
          session_id: sessionId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      if (data.success) {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const messagesEndRef = React.useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Chat Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 lg:w-[420px] ${
        isDark ? "bg-slate-900/98" : "bg-white/98"
      } backdrop-blur-lg border-l ${
        isDark ? "border-slate-800" : "border-slate-200"
      } shadow-2xl z-50 flex flex-col`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-4 sm:p-5 border-b ${
          isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50/50"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDark ? "bg-purple-500/20" : "bg-purple-100"
            }`}>
              <span className="text-xl">💬</span>
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}>
                Career Mentor
              </h3>
              <p className={`text-xs sm:text-sm ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}>
                {role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 ${
              isDark ? "text-slate-300" : "text-slate-600"
            } transition-colors`}
            aria-label="Close chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? isDark
                      ? "bg-gradient-to-tr from-pink-500 to-amber-400 text-white"
                      : "bg-gradient-to-tr from-pink-500 to-amber-400 text-white"
                    : isDark
                      ? "bg-slate-800/80 text-slate-200 border border-slate-700/50"
                      : "bg-slate-100 text-slate-800 border border-slate-200"
                }`}
              >
                <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                isDark
                  ? "bg-slate-800/80 text-slate-200 border border-slate-700/50"
                  : "bg-slate-100 text-slate-800 border border-slate-200"
              }`}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      isDark ? "bg-slate-400" : "bg-slate-500"
                    } animate-bounce`} style={{ animationDelay: '0ms' }} />
                    <div className={`w-2 h-2 rounded-full ${
                      isDark ? "bg-slate-400" : "bg-slate-500"
                    } animate-bounce`} style={{ animationDelay: '150ms' }} />
                    <div className={`w-2 h-2 rounded-full ${
                      isDark ? "bg-slate-400" : "bg-slate-500"
                    } animate-bounce`} style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSendMessage}
          className={`p-4 sm:p-5 border-t ${
            isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50/50"
          }`}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about salary, skills, career path..."
              disabled={isLoading}
              className={`flex-1 rounded-xl border px-4 py-2.5 text-sm sm:text-base outline-none transition-all ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-slate-50 placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/60"
                  : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/60"
              } disabled:opacity-50`}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className={`inline-flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
                isLoading || !inputMessage.trim()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105"
              } ${
                isDark
                  ? "bg-gradient-to-tr from-pink-500 to-amber-400 text-white"
                  : "bg-gradient-to-tr from-pink-500 to-amber-400 text-white"
              } shadow-lg`}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
