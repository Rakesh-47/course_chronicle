import React from "react";
import { motion } from "framer-motion";
import rk from "../../assets/rk.jpg"; 
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa"; 

const developers = [
  {
    image: rk,
    name: 'Rakesh Kumar',
    role: 'Fullstack Architect & Competitive Programmar',
    text: `As a Final Year undergrad at IIT (ISM) Dhanbad, I thrive on the challenge of building elegant, high-performance applications and diving deep into the architecture that makes them run.`,
    socials: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
    }
  },
];

const DeveloperProfile = () => {
  const developer = developers[0]; 
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <motion.div
        className="w-full max-w-5xl mx-auto overflow-hidden rounded-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-800/50 backdrop-blur-xl border border-gray-700">

          {/* === Image Side === */}
          <div className="relative p-8 flex items-center justify-center">
            {/* Glow Effect Background */}
            <div className="absolute w-4/5 h-4/5 bg-indigo-600/50 rounded-full blur-3xl animate-pulse-slow z-0"></div>
            
            {/* Image with container */}
            <motion.div
              className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-4 border-gray-700 shadow-2xl"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img
                src={developer.image}
                alt={developer.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* === Text Content Side === */}
          <div className="flex flex-col justify-center p-8 md:p-12 text-center md:text-left">
            <motion.p
              className="text-lg font-semibold text-indigo-400 tracking-widest uppercase"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              The Creator
            </motion.p>
            <motion.h1
              className="text-4xl sm:text-5xl font-extrabold text-white mt-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {developer.name}
            </motion.h1>
            <motion.h2
              className="text-xl text-gray-300 mt-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {developer.role}
            </motion.h2>
            <motion.p
              className="text-gray-400 mt-6 leading-relaxed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              {developer.text}
            </motion.p>
            
            {/* Social Media Links */}
            <motion.div
              className="flex justify-center md:justify-start items-center gap-6 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <a href={developer.socials.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition-colors duration-300">
                <FaGithub size={28} />
              </a>
              <a href={developer.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition-colors duration-300">
                <FaLinkedin size={28} />
              </a>
              <a href={developer.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition-colors duration-300">
                <FaTwitter size={28} />
              </a>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeveloperProfile;