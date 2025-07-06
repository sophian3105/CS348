import { MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-gray-900 text-white flex justify-center py-4">
      <div className="max-w-3xl w-full px-4 text-center space-y-2">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">&nbsp;AssaultTracker</span>
        </div>

        <p className="text-gray-400 leading-relaxed">
          Helping keep Toronto communities safe through data-driven insights and
          community reporting. 
        </p>

        <p className="text-gray-500 text-s">
          © {currentYear} Toronto Assault Tracker. All rights reserved.
        </p>
      </div>
    </div>
  );
}
