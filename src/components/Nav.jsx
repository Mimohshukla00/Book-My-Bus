import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import mylogo from "../assets/bookMyBusLogo.jpg";
import CTAButton from "../Utls/Home/Button";
import { useAuth } from "../contexts/AuthProvider";

function Nav() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Add isAdmin check
  const isAdmin = user?.role === 'Admin';

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
      // Only close mobile menu on scroll, not dropdown
      if (isMobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileMenuOpen]);

  // Close dropdown and mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !avatarRef.current?.contains(event.target)
      ) {
        setDropdownOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !hamburgerRef.current?.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    return () => setMobileMenuOpen(false);
  }, [navigate]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
    if (isDropdownOpen) setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <header 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-lg shadow-lg' 
          : 'bg-grayWhite'
      }`}
    >
      <nav className="mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Link to="/" className="flex items-center space-x-2 relative">
            <img
              src={mylogo}
              alt="Logo"
              className="w-[80px] h-[50px] sm:w-[120px] sm:h-[80px] object-contain"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive ? 'text-Darkgreen' : 'text-gray-700 hover:text-Darkgreen'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive ? 'text-Darkgreen' : 'text-gray-700 hover:text-Darkgreen'
                }`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/FAQs"
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive ? 'text-Darkgreen' : 'text-gray-700 hover:text-Darkgreen'
                }`
              }
            >
              FAQs
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive ? 'text-Darkgreen' : 'text-gray-700 hover:text-Darkgreen'
                }`
              }
            >
              Contact
            </NavLink>
            <NavLink
              to="/blogs"
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive ? 'text-Darkgreen' : 'text-gray-700 hover:text-Darkgreen'
                }`
              }
            >
              Blogs
            </NavLink>
            <NavLink
              to="/support"
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive ? 'text-Darkgreen' : 'text-gray-700 hover:text-Darkgreen'
                }`
              }
            >
              Support
            </NavLink>
          </div>

          {/* Mobile Menu Button - Three Dots */}
          <button
            ref={hamburgerRef}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {user ? (
              <div className="w-8 h-8 rounded-full bg-Darkgreen text-white flex items-center justify-center text-sm font-medium">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            ) : (
              <svg
                className="w-5 h-5 text-neutral-700"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            )}
          </button>

          {/* Mobile Menu */}
          <div
            ref={mobileMenuRef}
            className={`lg:hidden fixed inset-x-0 top-[68px] sm:top-[96px] transition-all duration-300 transform ${
              isMobileMenuOpen 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-full opacity-0'
            } max-h-[calc(100vh-68px)] sm:max-h-[calc(100vh-96px)] overflow-y-auto`}
          >
            <div className="bg-white shadow-lg rounded-b-2xl border-t border-neutral-100">
              {user ? (
                <div className="px-4 py-3 border-b border-neutral-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-Darkgreen text-white flex items-center justify-center text-lg font-medium">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 border-b border-neutral-100">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      className="flex items-center justify-center px-4 py-2 text-sm font-medium text-Darkgreen bg-white border border-Darkgreen rounded-md hover:bg-gray-50 transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-Darkgreen to-LightGreen rounded-md shadow-sm hover:shadow transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}

              <div className="px-4 py-3 space-y-1">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `block w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive 
                        ? 'text-Darkgreen bg-gray-100' 
                        : 'text-gray-700 hover:text-Darkgreen hover:bg-gray-100'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </NavLink>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `block w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive 
                        ? 'text-Darkgreen bg-gray-100' 
                        : 'text-gray-700 hover:text-Darkgreen hover:bg-gray-100'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </NavLink>
                <NavLink
                  to="/FAQs"
                  className={({ isActive }) =>
                    `block w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive 
                        ? 'text-Darkgreen bg-gray-100' 
                        : 'text-gray-700 hover:text-Darkgreen hover:bg-gray-100'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQs
                </NavLink>
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `block w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive 
                        ? 'text-Darkgreen bg-gray-100' 
                        : 'text-gray-700 hover:text-Darkgreen hover:bg-gray-100'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </NavLink>
                <NavLink
                  to="/blogs"
                  className={({ isActive }) =>
                    `block w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive 
                        ? 'text-Darkgreen bg-gray-100' 
                        : 'text-gray-700 hover:text-Darkgreen hover:bg-gray-100'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blogs
                </NavLink>
                <NavLink
                  to="/support"
                  className={({ isActive }) =>
                    `block w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive 
                        ? 'text-Darkgreen bg-gray-100' 
                        : 'text-gray-700 hover:text-Darkgreen hover:bg-gray-100'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Support
                </NavLink>
              </div>
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          {!user ? (
            <div className="hidden lg:flex items-center space-x-3">
              <CTAButton active={false} linkto="/login">
                Login
              </CTAButton>
              <CTAButton active={true} linkto="/signup">
                Sign Up
              </CTAButton>
            </div>
          ) : (
            <div className="hidden lg:flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-Darkgreen text-white flex items-center justify-center text-lg font-medium cursor-pointer hover:bg-Darkgreen/90 transition-colors"
                   onClick={toggleMobileMenu}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Nav;
