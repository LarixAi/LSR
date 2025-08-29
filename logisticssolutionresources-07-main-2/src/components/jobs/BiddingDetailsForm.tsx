
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Clock, DollarSign, Calendar, Gavel } from 'lucide-react';

interface BiddingDetailsFormProps {
  maxBidAmount: string;
  setMaxBidAmount: (value: string) => void;
  biddingDeadline: string;
  setBiddingDeadline: (value: string) => void;
  jobDescription: string;
  setJobDescription: (value: string) => void;
}

const BiddingDetailsForm: React.FC<BiddingDetailsFormProps> = ({
  maxBidAmount,
  setMaxBidAmount,
  biddingDeadline,
  setBiddingDeadline,
  jobDescription,
  setJobDescription
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
          <Gavel className="w-4 h-4 mr-2" />
          Bidding Configuration
        </h4>
        <p className="text-sm text-blue-800">
          Set the maximum bid amount and deadline for drivers to submit their bids.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="maxBidAmount" className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Maximum Bid Amount (R)</span>
          </Label>
          <Input
            id="maxBidAmount"
            type="number"
            step="0.01"
            value={maxBidAmount}
            onChange={(e) => setMaxBidAmount(e.target.value)}
            placeholder="e.g., 1500.00"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            The maximum amount drivers can bid for this job
          </p>
        </div>

        <div>
          <Label htmlFor="biddingDeadline" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Bidding Deadline</span>
          </Label>
          <Input
            id="biddingDeadline"
            type="datetime-local"
            value={biddingDeadline}
            onChange={(e) => setBiddingDeadline(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Last date and time for bid submissions
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="jobDescription" className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>Job Description & Requirements</span>
        </Label>
        <Textarea
          id="jobDescription"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Describe the job requirements, pickup/drop-off locations, special instructions, etc."
          rows={4}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Provide detailed information to help drivers make informed bids
        </p>
      </div>
    </div>
  );
};

export default BiddingDetailsForm;
