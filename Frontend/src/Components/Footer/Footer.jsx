import React from "react";
import { Link } from "react-router-dom";
import { Assets } from "../../assets/Assets";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-gray-300 pt-10 pb-5">
    <div className="container mx-auto px-6 flex gap-8 justify-between">
      
      {/* Left side: Logo and Description */}
      <div className="col-span-1">
        <Link to="/"> <img src={Assets.logo} width={100}/></Link>
        <p className="text-xl mt-5">
          Helping students by sharing and solving questions with knowledge and credits.
        </p>
        <p className="text-lg mt-2">Created by <Link to="/creators" className="hover:underline text-blue-400">Team</Link>, 2025</p>
      </div>
    
      <div className="flex space-x-20">
      {/* Navigation Links */} 
      <div>
        <h3 className="text-white font-medium mb-2">Navigation</h3>
        <ul className="space-y-1 text-sm">
          <li><a href="/" className="hover:underline hover:text-white">Home</a></li>
          <li><a href="/upload" className="hover:underline hover:text-white">Upload</a></li>
          <li><a href="/about" className="hover:underline hover:text-white">About</a></li>
          <li><a href="/subscription" className="hover:underline hover:text-white">Subscription</a></li>
          <li><a href="/papers" className="hover:underline hover:text-white">Papers</a></li>
        </ul>
      </div>
  
      {/* Resources */}
      <div>
        <h3 className="text-white font-medium mb-2">Resources</h3>
        <ul className="space-y-1 text-sm">
          <li><a href="/credits" className="hover:underline hover:text-white">Papers</a></li>
          <li><a href="/faq" className="hover:underline hover:text-white">Plans and Pricing</a></li>
        </ul>
      </div>
  
      {/* Socials */}
      <div>
        <h3 className="text-white font-medium mb-2">Follow Us</h3>
        <ul className="space-y-1 text-sm">
          <li >
            {/* <img src={Assets.instagram_icon} alt=""/> */}
            <Link to="/"  className="hover:underline hover:text-white"  >Instagram</Link>
          </li>
          <li >
            {/* <img src={Assets.instagram_icon} alt=""/> */}
            <Link to="/"  className="hover:underline hover:text-white">Facebook</Link>
          </li>
          <li>
            {/* <img src={Assets.instagram_icon} alt=""/> */}
            <Link to="/"  className="hover:underline hover:text-white">Gmail</Link>
          </li>

        </ul>
      </div>
    </div>
    </div>
    {/* Bottom line */}
    <div className="mt-10 border-t border-gray-700 pt-4 text-center text-xs text-gray-500">
      © 2025 Xamgen™. All rights reserved.
    </div>
  </footer>
  
  );
};

export default Footer;