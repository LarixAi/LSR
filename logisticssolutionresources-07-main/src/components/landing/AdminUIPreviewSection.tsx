
import React from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Zap, Shield, BarChart3, Users, Truck, ArrowRight, Play } from 'lucide-react';

const AdminUIPreviewSection = () => {
  return (
    <section id="admin-preview" className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-green-400 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-teal-400 rounded-full blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-blue-400 rounded-full blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl shadow-xl">
              <Monitor className="w-8 h-8 text-yellow-300" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-blue-50 mb-4">
            Admin Dashboard Preview
          </h2>
          <p className="text-base md:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Experience the power of comprehensive transport management with our intuitive admin interface
          </p>
        </div>

        {/* Main Preview Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Mock Browser Frame */}
          <div className="bg-slate-800 rounded-t-2xl p-4 shadow-2xl">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="flex-1 bg-slate-700 rounded-lg px-4 py-2 ml-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300 text-sm">lsr-admin.com/dashboard</span>
                </div>
              </div>
            </div>
          </div>

          {/* Screenshot Container */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-b-2xl p-8 shadow-2xl border border-slate-700">
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg overflow-hidden shadow-inner min-h-[400px] flex items-center justify-center">
              {/* Placeholder for Admin UI Screenshot */}
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 relative">
                {/* Mock Dashboard Elements */}
                <div className="p-6 space-y-6">
                  {/* Mock Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <Truck className="w-4 h-4 text-blue-50" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">LSR Admin Dashboard</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <span className="text-sm text-gray-600">Live</span>
                    </div>
                  </div>

                  {/* Mock Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-4 shadow border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Active Vehicles</p>
                          <p className="text-2xl font-bold text-gray-900">142</p>
                        </div>
                        <Truck className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 shadow border border-green-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Drivers Online</p>
                          <p className="text-2xl font-bold text-gray-900">89</p>
                        </div>
                        <Users className="w-8 h-8 text-green-500" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 shadow border border-indigo-100">
                      <div>
                        <p className="text-sm text-gray-600">Compliance Score</p>
                        <p className="text-2xl font-bold text-gray-900">96%</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 shadow border border-purple-100">
                      <div>
                        <p className="text-sm text-gray-600">Active Routes</p>
                        <p className="text-2xl font-bold text-gray-900">24</p>
                      </div>
                    </div>
                  </div>

                  {/* Mock Chart Area */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 shadow border border-yellow-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Fleet Performance</h4>
                    <div className="h-32 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg flex items-end justify-around p-4">
                      {[40, 65, 80, 45, 90, 75, 60].map((height, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-t from-blue-500 to-green-500 rounded-t-sm"
                          style={{ width: '20px', height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Overlay Message */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-green-600/20 flex items-center justify-center">
                  <div className="bg-gradient-to-br from-blue-50/95 to-green-50/95 backdrop-blur-sm rounded-xl p-6 text-center shadow-xl max-w-md mx-4">
                    <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Powerful Admin Tools</h4>
                    <p className="text-gray-600 mb-4">
                      Comprehensive dashboard for managing compliance, routes, vehicles, and driver performance
                    </p>
                    <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-green-50">
                      <Play className="w-4 h-4 mr-2" />
                      View Live Demo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Highlight */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
          <div className="text-center p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-yellow-300" />
            </div>
            <h3 className="text-lg font-semibold text-blue-50 mb-2">Real-time Analytics</h3>
            <p className="text-blue-100 text-sm">
              Monitor fleet performance, driver metrics, and compliance scores in real-time
            </p>
          </div>
          
          <div className="text-center p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-orange-300" />
            </div>
            <h3 className="text-lg font-semibold text-blue-50 mb-2">Compliance Management</h3>
            <p className="text-blue-100 text-sm">
              Automated compliance tracking with DVLA requirements and safety protocols
            </p>
          </div>
          
          <div className="text-center p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-green-300" />
            </div>
            <h3 className="text-lg font-semibold text-blue-50 mb-2">Intelligent Automation</h3>
            <p className="text-blue-100 text-sm">
              AI-powered scheduling, route optimization, and predictive maintenance alerts
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 animate-fade-in">
          <Button size="lg" className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-green-50 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            Experience the Admin Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-blue-200 text-sm mt-4">
            See how LSR can transform your transport operations
          </p>
        </div>
      </div>
    </section>
  );
};

export default AdminUIPreviewSection;
