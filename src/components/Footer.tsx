
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Logistics Solution Resources</h3>
            </div>
            <p className="text-gray-300 text-base leading-relaxed mb-6">
              Comprehensive transport management platform for schools, businesses, and organizations.
              Streamlining logistics operations with real-time tracking and compliance management.
            </p>
            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">ICO Application: C1752755 (Processing)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/vehicles" className="text-gray-300 hover:text-white transition-colors">
                  Vehicles
                </Link>
              </li>
              <li>
                <Link to="/drivers" className="text-gray-300 hover:text-white transition-colors">
                  Drivers
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="text-gray-300 hover:text-white transition-colors">
                  Jobs
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Privacy */}
          <div>
            <h4 className="text-md font-semibold mb-4">Legal & Privacy</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/data-rights" className="text-gray-300 hover:text-white transition-colors">
                  Your Data Rights
                </Link>
              </li>
              <li>
                <Link to="/dpia" className="text-gray-300 hover:text-white transition-colors">
                  Data Protection Assessment
                </Link>
              </li>
              <li>
                <Link to="/location-consent" className="text-gray-300 hover:text-white transition-colors">
                  Location Services
                </Link>
              </li>
              <li>
                <a 
                  href="https://ico.org.uk/make-a-complaint/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                >
                  ICO Complaints
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
                           <li>
               <a 
                 href="mailto:transport@logisticssolutionresources.com"
                 className="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
               >
                 <Mail className="w-3 h-3" />
                 Contact DPO
               </a>
             </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Logistics Solution Resources. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <span className="text-gray-400 text-sm">Data Protection Officer</span>
                         <a 
               href="mailto:transport@logisticssolutionresources.com"
               className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
             >
               <Mail className="w-3 h-3" />
               transport@logisticssolutionresources.com
             </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
