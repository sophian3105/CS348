// components/Footer.js
import { MapPin, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12 flex justify-center">
      <div className="max-w-3xl w-full px-4 text-center space-y-10">
        {/* Brand */}
        <div className="flex items-center justify-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold">&nbsp;AssaultTracker</span>
        </div>

        {/* Tagline */}
        <p className="text-gray-400 leading-relaxed">
          Helping keep Toronto communities safe through data-driven insights and
          community reporting. Together, we can build a safer city for
          everyone.
        </p>

        {/* Emergency */}
        <div className="flex items-center justify-center text-gray-400 space-x-3">
          <Phone className="w-6 h-6" />
          <span className="text-base font-medium">Emergency: 911</span>
        </div>

        {/* Copyright */}
        <p className="text-gray-500 text-sm">
          © {currentYear} Toronto Assault Tracker. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
