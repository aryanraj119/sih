import { Navbar } from './Navbar';
import { AnimatedHeading } from './AnimatedHeading';
import { FadeIn } from './FadeIn';

export const Hero = () => {
  return (
    <section className="relative w-full min-h-screen h-screen flex flex-col justify-between overflow-hidden bg-black text-white">
      {/* Video Background (Raw video with no dark/gradient overlay) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
      />

      {/* Top Navbar */}
      <Navbar />

      {/* Hero Content (Bottom of Viewport) */}
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-16 flex-1 flex flex-col justify-end pb-12 lg:pb-16">
        <div className="w-full lg:grid lg:grid-cols-2 lg:items-end gap-8">
          
          {/* Left Column - Main Content */}
          <div className="flex flex-col items-start">
            {/* Animated Character-by-Character Heading */}
            <AnimatedHeading
              text={"Shaping tomorrow\nwith vision and action."}
              initialDelay={200}
              charDelay={30}
              duration={500}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-4"
            />

            {/* Subheading with FadeIn */}
            <FadeIn delay={800} duration={1000}>
              <p className="text-base md:text-lg text-gray-300 mb-5 max-w-xl">
                We back visionaries and craft ventures that define what comes next.
              </p>
            </FadeIn>

            {/* Buttons Row with FadeIn */}
            <FadeIn delay={1200} duration={1000}>
              <div className="flex flex-wrap gap-4 items-center">
                <button
                  type="button"
                  className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                >
                  Start a Chat
                </button>
                <button
                  type="button"
                  className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-colors duration-300 cursor-pointer"
                >
                  Explore Now
                </button>
              </div>
            </FadeIn>
          </div>

          {/* Right Column - Tag */}
          <div className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0">
            <FadeIn delay={1400} duration={1000}>
              <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                <span className="text-lg md:text-xl lg:text-2xl font-light text-white tracking-wide">
                  Investing. Building. Advisory.
                </span>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  );
};
