"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface Slide {
  image: string;
  subtitle: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const slides: Slide[] = [
  {
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1600",
    subtitle: "NEW SEASON 2026/2027",
    title: "ENGRAVE YOUR LINES",
    description: "Explore our latest collection of premium carbon-fiber snowboards engineered for high stability and maximum edge hold.",
    buttonText: "Shop Snowboards",
    buttonLink: "/hydrogen",
  },
  {
    image: "https://images.unsplash.com/photo-1551698618-1ffdfe1d9772?w=1600",
    subtitle: "RIDE WITHOUT BOUNDARIES",
    title: "PREMIUM FLEX DESIGNS",
    description: "Whether you favor the terrain park or untracked backcountry powder, we have the perfect flex profile for you.",
    buttonText: "Explore Collection",
    buttonLink: "/automated-collection",
  },
  {
    image: "https://images.unsplash.com/photo-1520690216127-6f7312c322b6?w=1600",
    subtitle: "COMPLETE OVERHAUL",
    title: "TUNED TO PERFECTION",
    description: "Shop custom ski wax, tuning kits, and protective accessories to maintain speed and control on high-altitude runs.",
    buttonText: "Shop All Gear",
    buttonLink: "/products",
  }
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 7000); // auto-scroll every 7 seconds
    return () => clearInterval(timer);
  }, [current]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const transitionTimer = setTimeout(() => {
      setIsAnimating(false);
    }, 800); // match duration-800
    return () => clearTimeout(transitionTimer);
  }, [current]);

  return (
    <div className="relative w-full h-[65vh] sm:h-[80vh] overflow-hidden bg-black select-none">
      {/* Slides Container */}
      {slides.map((slide, index) => {
        const isActive = index === current;
        return (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
          >
            {/* Background Image with slight Parallax zoom */}
            <div className="relative w-full h-full transform scale-105 transition-transform duration-[7000ms] ease-out">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className={`object-cover object-center brightness-[0.55] transition-all duration-[2000ms] ${isActive ? "scale-100 blur-0" : "scale-105 blur-sm"
                  }`}
              />
            </div>

            {/* Slide Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:px-24 max-w-4xl z-20 text-white pt-16 sm:pt-24">
              <span
                className={`text-xs sm:text-sm font-bold tracking-[0.3em] text-gray-300 uppercase transition-all duration-700 delay-300 ${isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
              >
                {slide.subtitle}
              </span>
              <h2
                className={`mt-4 text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none uppercase transition-all duration-700 delay-500 bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent ${isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
              >
                {slide.title}
              </h2>
              <p
                className={`mt-6 text-sm sm:text-base text-gray-300 max-w-lg leading-relaxed transition-all duration-700 delay-700 ${isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
              >
                {slide.description}
              </p>
              <div
                className={`mt-8 transition-all duration-700 delay-[900ms] ${isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
              >
                <Link
                  href={slide.buttonLink}
                  className="inline-flex items-center justify-center bg-white text-black font-semibold text-xs sm:text-sm uppercase tracking-wider px-8 py-3.5 hover:bg-gray-200 transition-all rounded-md"
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full border border-solid border-white/20 bg-black/30 hover:bg-white/10 text-white transition-colors"
        aria-label="Previous Slide"
      >
        <FiChevronLeft size={20} />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full border border-solid border-white/20 bg-black/30 hover:bg-white/10 text-white transition-colors"
        aria-label="Next Slide"
      >
        <FiChevronRight size={20} />
      </button>

      {/* Pagination Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => !isAnimating && setCurrent(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${index === current ? "w-8 bg-white" : "w-2 bg-white/40"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
