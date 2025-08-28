
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  MapPin, 
  Eye,
  Timer,
  Footprints
} from 'lucide-react';

interface SafetyGuidelinesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartInspection: () => void;
}

const SafetyGuidelinesModal: React.FC<SafetyGuidelinesModalProps> = ({
  open,
  onOpenChange,
  onStartInspection
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Shield className="w-8 h-8 text-red-600" />
            Daily Vehicle Safety Inspection Guidelines
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Critical Alert */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>LEGAL REQUIREMENT:</strong> Daily vehicle safety inspections are mandatory under DVLA regulations. 
              Failure to complete proper inspections can result in fines, penalty points, and serious safety risks.
            </AlertDescription>
          </Alert>

          {/* Key Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Time Requirements
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800"><strong>Minimum 5-10 minutes</strong> for thorough inspection</span>
                </div>
                <div className="flex items-center gap-3">
                  <Footprints className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">Complete <strong>walk-around</strong> of entire vehicle</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">Location tracking ensures <strong>compliance</strong></span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Safety Focus Areas
              </h3>
              <div className="space-y-2">
                <Badge variant="outline" className="bg-green-100 text-green-800">🔧 Engine & Mechanical</Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800">🛑 Braking System</Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800">🛞 Tires & Wheels</Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800">💡 Lighting System</Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800">🪞 Mirrors & Visibility</Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800">🔒 Safety Equipment</Badge>
              </div>
            </div>
          </div>

          {/* Why It Matters */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">Why Daily Inspections Are Critical</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-yellow-800">Safety</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Prevent accidents and breakdowns</li>
                  <li>• Protect passengers and public</li>
                  <li>• Identify issues before they become dangerous</li>
                  <li>• Ensure emergency systems function</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-yellow-800">Legal Compliance</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• DVLA mandatory requirement</li>
                  <li>• Insurance claim protection</li>
                  <li>• Avoid fines and penalties</li>
                  <li>• Maintain operator license</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Inspection Process */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              What to Expect
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-medium">Vehicle Selection</h4>
                  <p className="text-sm text-gray-600">Choose your assigned vehicle from the active fleet</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-medium">Guided Inspection</h4>
                  <p className="text-sm text-gray-600">Follow step-by-step checks with detailed guidance for each component</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-medium">Documentation</h4>
                  <p className="text-sm text-gray-600">All responses are recorded with location and time stamps for compliance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Reminders */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-4">⚠️ Important Reminders</h3>
            <ul className="space-y-2 text-red-800">
              <li>• <strong>Never skip</strong> any inspection points</li>
              <li>• <strong>Take your time</strong> - safety is more important than speed</li>
              <li>• <strong>Report any defects</strong> immediately to management</li>
              <li>• <strong>Do not drive</strong> if critical safety issues are found</li>
              <li>• <strong>Location tracking</strong> ensures you complete a proper walk-around</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={onStartInspection}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              I Understand - Begin Safety Inspection
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12"
            >
              Cancel
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 bg-gray-100 p-3 rounded">
            📋 This inspection will be recorded for DVLA compliance and safety audit purposes
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SafetyGuidelinesModal;
