import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, FileText, Shield, Clock, CheckCircle2 } from 'lucide-react';

interface DVSALegalDeclarationStepProps {
  driverName: string;
  vehicleReg: string;
  inspectionData: any;
  onComplete: (signature: string, declarations: string[]) => void;
}

const DVSALegalDeclarationStep: React.FC<DVSALegalDeclarationStepProps> = ({
  driverName,
  vehicleReg,
  inspectionData,
  onComplete
}) => {
  const [signature, setSignature] = useState('');
  const [checkedDeclarations, setCheckedDeclarations] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasCanvasSignature, setHasCanvasSignature] = useState(false);

  const declarations = [
    {
      id: 'completed-truthfully',
      text: 'I confirm that I have completed this vehicle inspection truthfully and to the best of my ability.',
      required: true
    },
    {
      id: 'understand-consequences',
      text: 'I understand that providing false information on this inspection can result in prosecution under the Road Traffic Act.',
      required: true
    },
    {
      id: 'defects-reported',
      text: 'I confirm that all defects have been accurately reported and documented.',
      required: true
    },
    {
      id: 'safe-to-drive',
      text: 'I declare this vehicle is safe to operate based on my inspection, or I have reported all safety concerns.',
      required: true
    },
    {
      id: 'dvsa-compliance',
      text: 'I acknowledge this inspection meets DVSA standards and regulatory requirements.',
      required: true
    }
  ];

  const handleDeclarationChange = (declarationId: string, checked: boolean) => {
    if (checked) {
      setCheckedDeclarations([...checkedDeclarations, declarationId]);
    } else {
      setCheckedDeclarations(checkedDeclarations.filter(id => id !== declarationId));
    }
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const getEventPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX || 0 : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY || 0 : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const { x, y } = getEventPos(e);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const { x, y } = getEventPos(e);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(x, y);
        ctx.stroke();
        setHasCanvasSignature(true);
      }
    }
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (e) e.preventDefault();
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.beginPath();
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignature('');
    setHasCanvasSignature(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const signatureData = canvas.toDataURL();
      setSignature(signatureData);
    }
  };

  const handleComplete = () => {
    let finalSignature = signature;
    
    // If canvas has a signature but no typed signature, save canvas signature
    if (hasCanvasSignature && !signature) {
      const canvas = canvasRef.current;
      if (canvas) {
        finalSignature = canvas.toDataURL('image/png');
      }
    }
    
    if (!finalSignature) {
      return; // Don't submit without signature
    }
    
    onComplete(finalSignature, checkedDeclarations);
  };

  const allRequiredChecked = declarations
    .filter(d => d.required)
    .every(d => checkedDeclarations.includes(d.id));

  const hasSignature = signature.trim() !== '' || hasCanvasSignature;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Legal Declaration & Signature
        </h2>
        <p className="text-gray-600">
          Complete your DVSA-compliant vehicle inspection with legal declarations
        </p>
      </div>

      {/* Inspection Summary */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Inspection Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700">Driver:</div>
              <div className="text-gray-900">{driverName}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Vehicle:</div>
              <div className="text-gray-900">{vehicleReg}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Date & Time:</div>
              <div className="text-gray-900">{new Date().toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Declarations */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Legal Declarations
          </h3>
          <div className="space-y-4">
            {declarations.map((declaration) => (
              <div key={declaration.id} className="flex items-start space-x-3">
                <Checkbox
                  id={declaration.id}
                  checked={checkedDeclarations.includes(declaration.id)}
                  onCheckedChange={(checked) => 
                    handleDeclarationChange(declaration.id, checked as boolean)
                  }
                  className="mt-1"
                />
                <Label 
                  htmlFor={declaration.id} 
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  {declaration.text}
                  {declaration.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Digital Signature */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Digital Signature
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="typed-signature">
                Type your full name to create a digital signature:
              </Label>
              <Input
                id="typed-signature"
                placeholder="Enter your full legal name"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="text-center text-gray-500 text-sm">
              OR
            </div>

            <div>
              <Label>Draw your signature below:</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={150}
                    className="border border-gray-200 rounded cursor-crosshair w-full touch-none bg-white"
                    style={{ maxWidth: '100%', height: '150px' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  {!hasCanvasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-sm">
                      Draw your signature here
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="text-xs text-gray-500">
                    {hasCanvasSignature ? (
                      <span className="text-green-600 flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Signature captured
                      </span>
                    ) : (
                      "Use your finger or mouse to sign"
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={clearSignature}>
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <div className="font-semibold mb-2">Important Legal Notice</div>
            <ul className="space-y-1 text-xs">
              <li>• This inspection record is a legal document that may be used in enforcement proceedings</li>
              <li>• Knowingly providing false information is an offence under the Road Traffic Act 1988</li>
              <li>• You may be prosecuted if this vehicle is found to have defects you failed to report</li>
              <li>• DVSA enforcement officers may inspect this record during roadside checks</li>
              <li>• Your signature confirms acceptance of legal responsibility for this inspection</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Completion Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleComplete}
          disabled={!allRequiredChecked || !hasSignature}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
        >
          <Clock className="w-5 h-5 mr-2" />
          Complete DVSA Inspection
        </Button>
      </div>

      {(!allRequiredChecked || !hasSignature) && (
        <div className="text-center text-sm text-red-600">
          {!allRequiredChecked && !hasSignature 
            ? "Please complete all required declarations and provide your signature"
            : !allRequiredChecked 
            ? "Please complete all required declarations"
            : "Please provide your signature (type your name or draw in the box above)"
          }
        </div>
      )}
    </div>
  );
};

export default DVSALegalDeclarationStep;