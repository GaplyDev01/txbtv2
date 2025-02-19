'use client';

import { ChevronLeft, ChevronRight, Copy, MessageCircle, Twitter, Github, Send } from 'lucide-react';
import Image from 'next/image';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showSocials, setShowSocials] = useState(false);
  const [showAboutCards, setShowAboutCards] = useState(false);
  const contractAddress = '0x57fd3480581f72b0df1adead72b4181a52a1d7de';
  const socialMenuRef = useRef<HTMLDivElement>(null);
  const aboutCardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (socialMenuRef.current && !socialMenuRef.current.contains(event.target as Node)) {
        setShowSocials(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const aboutCards = useMemo(() => [
    {
      title: "Autonomous Trading",
      description: "Advanced AI algorithms execute trades 24/7 across multiple markets",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#36C58C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      title: "Risk Management",
      description: "Sophisticated risk assessment and portfolio balancing systems",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#36C58C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 16V12" stroke="#36C58C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 8H12.01" stroke="#36C58C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      title: "Market Analysis",
      description: "Real-time data processing and predictive market modeling",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 20V10" stroke="#36C58C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 20V4" stroke="#36C58C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 20V14" stroke="#36C58C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    }
  ], []);
  const socialLinks = [
    { icon: <Twitter className="w-5 h-5" />, label: 'Twitter', href: '#' },
    { icon: <Send className="w-5 h-5" />, label: 'Telegram', href: '#' },
    { icon: <MessageCircle className="w-5 h-5" />, label: 'Discord', href: '#' },
    { icon: <Github className="w-5 h-5" />, label: 'Github', href: '#' },
  ];

  const teamMembers = [
    { name: 'Rayka Moradi', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=100&w=800&auto=format&fit=crop' },
    { name: 'Melanie Mohr', role: 'Blockchain Officer', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=100&w=800&auto=format&fit=crop' },
    { name: 'Konstantinos Papadakis', role: 'CPO', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=100&w=800&auto=format&fit=crop' },
    { name: 'Michael Krützfeldt', role: 'CMO', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=100&w=800&auto=format&fit=crop' },
    { name: 'Sarah Chen', role: 'CTO', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=100&w=800&auto=format&fit=crop' },
    { name: 'David Park', role: 'Lead Developer', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=100&w=800&auto=format&fit=crop' },
    { name: 'Elena Rodriguez', role: 'Head of Research', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=100&w=800&auto=format&fit=crop' },
    { name: 'James Wilson', role: 'Security Lead', image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?q=100&w=800&auto=format&fit=crop' },
  ];

  const itemsPerPage = 4;
  const totalPages = Math.ceil(teamMembers.length / itemsPerPage);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTeamMembers = teamMembers.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <main className="min-h-screen bg-[#181719] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="max-w-[1440px] mx-auto py-8 px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="h-8 flex items-center">
            <Image src="/logo.svg" alt="TradesXBT Logo" width={39} height={24} />
          </div>
          <h1 className="text-2xl font-bold font-mono">TradesXBT</h1>
        </div>
        
        <div className="flex gap-12 font-mono font-semibold">
          <a href="#" className="hover:text-[#36C58C] transition-colors">Home</a>
          <a href="#" className="hover:text-[#36C58C] transition-colors">Roadmap</a>
          <a href="#" className="hover:text-[#36C58C] transition-colors">About</a>
          <a href="#" className="hover:text-[#36C58C] transition-colors">Team</a>
          <div className="flex items-start gap-1">
            <span className="text-[#878787]">PNL</span>
            <span className="text-[#36C58C] text-xs">Soon</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div 
            ref={socialMenuRef}
            className="relative"
            onMouseEnter={() => setShowSocials(true)}
          >
            <div className="w-10 h-10 bg-[#1C2620] border border-[#36C58C] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#243830] transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 97 61" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M43.111 60.071C39.3934 59.7635 36.3343 59.2583 30.3649 57.9185C25.6064 56.8422 19.0209 54.1845 14.1137 51.373C11.3945 49.7915 6.99711 46.8043 5.25515 45.3547C3.36448 43.7512 0.645327 40.9837 0.284188 40.2808C-0.0981946 39.512 -0.0981998 38.0624 0.305426 37.2497C1.04895 35.7561 4.27796 34.1087 11.5007 31.5389C20.6354 28.2441 22.9722 27.102 25.2028 24.7518C26.4986 23.3899 27.6882 21.1495 28.1344 19.2167C28.538 17.4155 28.538 16.6468 28.1131 14.8676C27.1147 10.6504 23.6732 7.0482 19.5945 5.94997C14.836 4.65405 9.46136 7.72911 6.84841 13.2642L5.82873 15.3948L4.61785 15.4607L3.40697 15.5266L3.25827 14.7359C3.00335 13.2642 4.32044 9.48628 5.95618 7.00427C6.99711 5.44478 9.01525 3.51188 10.6085 2.52347C14.6235 0.0634251 20.1681 -0.48569 24.8416 1.1397C27.8157 2.17204 29.9825 3.86332 32.3831 7.0482C35.3784 11.0019 38.5861 12.803 44.1944 13.6376C47.0623 14.0549 49.4628 14.0549 52.0333 13.6376C57.1317 12.781 59.3623 11.7267 62.0177 8.84931C66.3513 4.14886 67.2861 3.24831 68.5819 2.45758C73.2342 -0.353902 79.756 -0.573549 84.727 1.90846C86.1715 2.6333 86.8725 3.18241 88.3596 4.71994C90.4202 6.82855 91.4399 8.49787 92.5233 11.3972C93.2668 13.396 93.4368 14.9335 93.0331 15.7462C92.757 16.2514 91.2274 16.3393 90.6114 15.878C90.4202 15.7243 89.8891 14.7578 89.443 13.7255C88.9969 12.6931 88.3171 11.3533 87.9347 10.7602C85.3005 6.80659 80.8394 4.8737 76.8881 5.94997C69.2192 8.03661 65.5866 16.6028 69.6653 22.9287C71.9171 26.4211 74.1689 27.6731 84.7482 31.473C90.7176 33.6035 93.9466 35.1411 95.2849 36.4809C96.1559 37.3156 96.2197 37.4693 96.2197 38.5236C96.2197 40.1051 96.0072 40.5224 94.2865 42.4114C89.2306 47.9245 78.0777 54.4261 69.0918 57.1058C59.9783 59.8294 51.7358 60.7739 43.111 60.071Z" fill="white"/>
              </svg>
            </div>
            
            {/* Social Media Menu */}
            <div 
              className={`absolute top-full right-0 mt-4 bg-[#1C2620] border border-[#36C58C] rounded-xl p-4 transition-all duration-300 z-50 ${
                showSocials ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="flex flex-col gap-3 min-w-[160px]">
                {socialLinks.map((link, index) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-3 text-white hover:text-[#36C58C] transition-colors px-4 py-2 rounded-lg hover:bg-[#243830]"
                  >
                    {link.icon}
                    <span className="font-mono text-sm whitespace-nowrap">{link.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="bg-gradient-to-r from-[#36C58C] to-[#2ba572] text-white font-mono font-bold px-8 py-3 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">Jump</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#2ba572] to-[#36C58C] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-[1440px] mx-auto px-6 pt-16">
        <div className="max-w-3xl">
          <h2 className="text-[#B2FFE1] text-5xl font-mono font-semibold mb-5">
            Welcome to<br />TradesXBT ($XBT)
          </h2>
          <h3 className="text-6xl font-mono font-semibold mb-12">
            The <span className="text-[#36C58C]">first</span> Fully Autonomous <span className="text-[#36C58C]">Hedge Fund</span>
          </h3>
          
          <div className="flex gap-5 mb-12">
            <button className="bg-[#1C2620] text-[#36C58C] border border-[#36C58C] font-mono font-semibold px-6 py-3 rounded-xl hover:bg-[#243830] transition-colors">
              Terminal
            </button>
            <button className="bg-[#1C2620] text-[#36C58C] border border-[#36C58C] font-mono font-semibold px-6 py-3 rounded-xl hover:bg-[#243830] transition-colors">
              Invest With Us
            </button>
          </div>

          <div className="bg-gradient-to-r from-[#1C2620] to-[#24392C] border border-dotted border-[#565556] rounded-xl p-5 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#36C58C]/40 rounded-full flex items-center justify-center">
                <Image src="/logo.svg" alt="TradesXBT Logo" width={30} height={30} className="opacity-80" />
              </div>
              <div>
                <p className="text-[#B2FFE1] font-mono font-semibold text-sm mb-1">Contract Address</p>
                <p className="font-mono text-lg">{contractAddress}</p>
              </div>
            </div>
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 hover:text-[#36C58C] transition-colors"
            >
              <Copy className="w-5 h-5" />
              <span className="font-mono">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* What is TradesXBT Section */}
      <section className="max-w-[1440px] mx-auto px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-base font-mono font-semibold mb-6">
            A Swarm of Analyzer and Trader Agents to profit from all Financial Markets with Low, Medium and High Risk investment Baskets. 
            With a veteran team in crypto since 2012 and +20 years in Financial and Business Markets from PWC, UBS, BNY and more than 10 Venture and Hedge Funds Under Management.
          </p>
          <button className="inline-flex bg-[#1C2620] text-[#36C58C] border border-[#36C58C] font-mono font-semibold px-6 py-3 rounded-xl hover:bg-[#243830] transition-colors">
            Learn More
          </button>
        </div>

        <div className="relative mt-24 flex justify-center">
          {/* Center Diamond with Frog Logo */}
          <div className="relative w-64 h-64 rotate-45 bg-[#1C2620] border border-[#36C58C] rounded-xl">
            <div 
              className="absolute inset-0 -rotate-45 flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-110"
              onMouseEnter={() => setShowAboutCards(true)}
              onMouseLeave={() => setShowAboutCards(false)}
            >
              <div className="w-32 h-32">
                <svg viewBox="0 0 97 61" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M43.111 60.071C39.3934 59.7635 36.3343 59.2583 30.3649 57.9185C25.6064 56.8422 19.0209 54.1845 14.1137 51.373C11.3945 49.7915 6.99711 46.8043 5.25515 45.3547C3.36448 43.7512 0.645327 40.9837 0.284188 40.2808C-0.0981946 39.512 -0.0981998 38.0624 0.305426 37.2497C1.04895 35.7561 4.27796 34.1087 11.5007 31.5389C20.6354 28.2441 22.9722 27.102 25.2028 24.7518C26.4986 23.3899 27.6882 21.1495 28.1344 19.2167C28.538 17.4155 28.538 16.6468 28.1131 14.8676C27.1147 10.6504 23.6732 7.0482 19.5945 5.94997C14.836 4.65405 9.46136 7.72911 6.84841 13.2642L5.82873 15.3948L4.61785 15.4607L3.40697 15.5266L3.25827 14.7359C3.00335 13.2642 4.32044 9.48628 5.95618 7.00427C6.99711 5.44478 9.01525 3.51188 10.6085 2.52347C14.6235 0.0634251 20.1681 -0.48569 24.8416 1.1397C27.8157 2.17204 29.9825 3.86332 32.3831 7.0482C35.3784 11.0019 38.5861 12.803 44.1944 13.6376C47.0623 14.0549 49.4628 14.0549 52.0333 13.6376C57.1317 12.781 59.3623 11.7267 62.0177 8.84931C66.3513 4.14886 67.2861 3.24831 68.5819 2.45758C73.2342 -0.353902 79.756 -0.573549 84.727 1.90846C86.1715 2.6333 86.8725 3.18241 88.3596 4.71994C90.4202 6.82855 91.4399 8.49787 92.5233 11.3972C93.2668 13.396 93.4368 14.9335 93.0331 15.7462C92.757 16.2514 91.2274 16.3393 90.6114 15.878C90.4202 15.7243 89.8891 14.7578 89.443 13.7255C88.9969 12.6931 88.3171 11.3533 87.9347 10.7602C85.3005 6.80659 80.8394 4.8737 76.8881 5.94997C69.2192 8.03661 65.5866 16.6028 69.6653 22.9287C71.9171 26.4211 74.1689 27.6731 84.7482 31.473C90.7176 33.6035 93.9466 35.1411 95.2849 36.4809C96.1559 37.3156 96.2197 37.4693 96.2197 38.5236C96.2197 40.1051 96.0072 40.5224 94.2865 42.4114C89.2306 47.9245 78.0777 54.4261 69.0918 57.1058C59.9783 59.8294 51.7358 60.7739 43.111 60.071Z" fill="white"/>
                </svg>
              </div>
            </div>
          </div>

          {/* About Cards */}
          <div 
            ref={aboutCardsRef}
            className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-full max-w-[1200px] flex justify-center gap-8"
          >
            {aboutCards.map((card, index) => (
              <div
                key={card.title}
                className={`w-80 bg-[#1C2620] border border-[#36C58C] rounded-xl p-6 transition-all duration-500 transform
                  ${showAboutCards 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-20 pointer-events-none'}
                  ${index === 0 ? '-translate-x-full' : index === 2 ? 'translate-x-full' : ''}`}
                style={{
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <div className="w-16 h-16 bg-[#36C58C]/10 rounded-full flex items-center justify-center mb-6">
                  {card.icon}
                </div>
                <h3 className="font-mono font-bold text-2xl mb-4">{card.title}</h3>
                <p className="font-mono text-gray-400">{card.description}</p>
              </div>
            ))}
          </div>
          {/* Connected Cards */}
          <div className="absolute -left-32 top-0 w-96 bg-[#1C2620] border border-[#36C58C] rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#36C58C]/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#36C58C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="#36C58C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 9H9.01" stroke="#36C58C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 9H15.01" stroke="#36C58C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-mono font-bold text-xl">98%</h3>
                <p className="font-mono text-sm text-gray-400">Customer satisfaction</p>
              </div>
            </div>
          </div>

          <div className="absolute -right-32 top-0 w-96 bg-[#1C2620] border border-[#36C58C] rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#36C58C]/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#36C58C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16V12" stroke="#36C58C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8H12.01" stroke="#36C58C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-mono font-bold text-xl">97.6%</h3>
                <p className="font-mono text-sm text-gray-400">Safety Rate</p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-32 w-96 bg-[#1C2620] border border-[#36C58C] rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#36C58C]/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#36C58C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#36C58C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="#36C58C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#36C58C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-mono font-bold text-xl">Community Benefit</h3>
                <p className="font-mono text-sm text-gray-400">Our system are enabling stakeholder to join create coin</p>
              </div>
            </div>
          </div>

          {/* Connecting Lines */}
          <div className="absolute left-1/2 top-1/2 w-32 h-px bg-[#393939] -translate-x-full -translate-y-1/2 -rotate-45" />
          <div className="absolute left-1/2 top-1/2 w-32 h-px bg-[#393939] translate-x-0 -translate-y-1/2 rotate-45" />
          <div className="absolute left-1/2 top-1/2 w-px h-32 bg-[#393939] -translate-x-1/2 translate-y-1/2" />
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-[1440px] mx-auto px-6 py-24">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-6xl font-mono font-bold tracking-wide">
            Meet <span className="text-[#36C58C]">TradesXBT</span> Team
          </h2>
          <div className="flex gap-5">
            <button 
              onClick={prevPage}
              className="w-14 h-14 bg-[#1C2620] border border-[#36C58C] rounded-full flex items-center justify-center hover:bg-[#243830] transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-[#36C58C]" />
            </button>
            <button 
              onClick={nextPage}
              className="w-14 h-14 bg-[#1C2620] border border-[#36C58C] rounded-full flex items-center justify-center hover:bg-[#243830] transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-[#36C58C]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-8 mb-16 transition-all duration-500">
          {currentTeamMembers.map((member, index) => (
            <div key={member.name} className="text-center">
              <div className="w-56 h-56 mx-auto border-2 border-[#36C58C] rounded-full p-1.5 mb-4 overflow-hidden shadow-lg">
                <Image 
                  src={member.image}
                  alt={member.name}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover rounded-full transform hover:scale-105 transition-transform duration-300"
                  quality={100}
                  priority={index < 4}
                />
              </div>
              <h3 className="font-mono font-bold text-2xl mb-2">{member.name}</h3>
              <p className="font-mono text-lg text-gray-400">{member.role}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono font-semibold text-lg">+ 10's More</span>
          <div className="flex -space-x-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-14 h-14 rounded-full bg-[#1C2620] border-2 border-[#36C58C] overflow-hidden">
                <Image
                  src={`https://images.unsplash.com/photo-${1500000000000 + i}?q=80&w=387&auto=format&fit=crop`}
                  alt={`Team member ${i + 1}`}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#393939] mt-12">
        <div className="max-w-[1440px] mx-auto px-6 py-6 flex justify-between items-center">
          <p className="font-mono font-semibold">
            Automated By <span className="text-[#36C58C]">@GaplyLabs</span>
          </p>
          
          <div className="flex gap-12 font-mono font-semibold">
            <a href="#" className="hover:text-[#36C58C] transition-colors">Home</a>
            <a href="#" className="hover:text-[#36C58C] transition-colors">Roadmap</a>
            <a href="#" className="hover:text-[#36C58C] transition-colors">About</a>
            <a href="#" className="hover:text-[#36C58C] transition-colors">Team</a>
            <div className="flex items-start gap-1">
              <span className="text-[#878787]">PNL</span>
              <span className="text-[#36C58C] text-xs">Soon</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Background Decorations */}
      <div className="fixed top-0 right-0 w-[790px] h-[878px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[#7FDDAD]/10 blur-[151.5px]" />
      </div>
      <div className="fixed bottom-0 right-0 w-[677px] h-[1600px] opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#A8DD7F]/5 to-[#11FFF1]/7 blur-[151.5px]" />
      </div>
      <div className="fixed bottom-0 left-0 w-[680px] h-[1880px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#A8DD7F]/5 to-[#11FFF1]/7 blur-[151.5px]" />
      </div>
    </main>
  );
}