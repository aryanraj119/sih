export const Navbar = () => {
  const navLinks = ['Story', 'Investing', 'Building', 'Advisory'];

  return (
    <header className="w-full px-6 md:px-12 lg:px-16 pt-6 relative z-10">
      <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center">
          <a href="#" className="text-2xl font-semibold tracking-tight text-white">
            VEX
          </a>
        </div>

        {/* Center: Navigation Links (hidden on mobile, visible md+) */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm text-white hover:text-gray-300 transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Right: CTA Button */}
        <div>
          <button
            type="button"
            className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
          >
            Start a Chat
          </button>
        </div>
      </nav>
    </header>
  );
};
