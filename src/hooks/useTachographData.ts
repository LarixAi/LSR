import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useTachographData = () => {
  const { profile } = useAuth();

  // Fetch drivers and vehicles for tachograph calculations
  const { data: drivers = [] } = useQuery({
    queryKey: ['tachograph-drivers', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver')
        .eq('organization_id', profile.organization_id);
      
      if (error) {
        console.error('Error fetching drivers for tachograph:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['tachograph-vehicles', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('organization_id', profile.organization_id);
      
      if (error) {
        console.error('Error fetching vehicles for tachograph:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Generate realistic tachograph records based on available drivers and vehicles
  const generateTachographRecords = () => {
    if (drivers.length === 0 || vehicles.length === 0) return [];

    const records = [];
    const today = new Date();
    
    // Generate records for the last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create 1-3 records per day based on available drivers
      const recordsPerDay = Math.min(Math.floor(Math.random() * 3) + 1, drivers.length);
      
      for (let j = 0; j < recordsPerDay; j++) {
        const driver = drivers[j % drivers.length];
        const vehicle = vehicles[j % vehicles.length];
        
        const startTime = new Date(date);
        startTime.setHours(6 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60));
        
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 8 + Math.floor(Math.random() * 4));
        
        const totalWorkTime = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        const drivingTime = totalWorkTime * (0.6 + Math.random() * 0.3); // 60-90% driving
        const restTime = Math.max(0.5, Math.random() * 2); // 0.5-2 hours rest
        const availabilityTime = totalWorkTime - drivingTime - restTime;
        
        // Generate occasional violations
        const violations = [];
        const hasViolation = Math.random() < 0.15; // 15% chance of violation
        
        if (hasViolation) {
          const possibleViolations = [
            'Driving time exceeded',
            'Insufficient rest period', 
            'Daily driving limit exceeded',
            'Weekly driving limit exceeded',
            'Tachograph card not inserted'
          ];
          violations.push(possibleViolations[Math.floor(Math.random() * possibleViolations.length)]);
        }
        
        records.push({
          id: `TACH-${String(records.length + 1).padStart(3, '0')}`,
          driverId: driver.id,
          driverName: `${driver.first_name || 'Driver'} ${driver.last_name || driver.id.slice(-3)}`,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicle_number || `LSR-${vehicle.id.slice(-3)}`,
          recordType: Math.random() > 0.1 ? 'digital' : 'analogue',
          startDate: startTime.toISOString(),
          endDate: endTime.toISOString(),
          totalDrivingTime: Math.round(drivingTime * 100) / 100,
          restTime: Math.round(restTime * 100) / 100,
          workTime: Math.round(totalWorkTime * 100) / 100,
          availabilityTime: Math.round(Math.max(0, availabilityTime) * 100) / 100,
          violations,
          status: violations.length > 0 ? 'violation' : 'valid',
          uploadedAt: new Date(endTime.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          fileName: `TACH_${date.toISOString().split('T')[0].replace(/-/g, '')}_${String(j + 1).padStart(3, '0')}.ddd`,
          analysisStatus: Math.random() > 0.05 ? 'completed' : 'pending'
        });
      }
    }
    
    return records.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  };

  // Generate violation summary
  const generateViolationSummary = (records: any[]) => {
    const violations = records.filter(r => r.violations.length > 0);
    
    return violations.map((record, index) => ({
      id: `VIO-${String(index + 1).padStart(3, '0')}`,
      type: record.violations[0] || 'Unknown violation',
      severity: Math.random() > 0.3 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
      driverId: record.driverId,
      driverName: record.driverName,
      vehicleId: record.vehicleId,
      vehicleNumber: record.vehicleNumber,
      violationDate: record.startDate,
      detectedAt: record.uploadedAt,
      status: Math.random() > 0.6 ? 'resolved' : Math.random() > 0.3 ? 'acknowledged' : 'open'
    }));
  };

  // Calculate statistics
  const calculateStats = (records: any[]) => {
    if (records.length === 0) {
      return {
        totalRecords: 0,
        validRecords: 0,
        violationRecords: 0,
        pendingAnalysis: 0,
        averageDrivingTime: 0,
        complianceRate: 100
      };
    }

    const totalRecords = records.length;
    const validRecords = records.filter(r => r.status === 'valid').length;
    const violationRecords = records.filter(r => r.status === 'violation').length;
    const pendingAnalysis = records.filter(r => r.analysisStatus === 'pending').length;
    const averageDrivingTime = records.reduce((sum, r) => sum + r.totalDrivingTime, 0) / totalRecords;
    const complianceRate = totalRecords > 0 ? (validRecords / totalRecords) * 100 : 100;

    return {
      totalRecords,
      validRecords,
      violationRecords,
      pendingAnalysis,
      averageDrivingTime: Math.round(averageDrivingTime * 100) / 100,
      complianceRate: Math.round(complianceRate * 100) / 100
    };
  };

  const tachographRecords = generateTachographRecords();
  const violationSummary = generateViolationSummary(tachographRecords);
  const stats = calculateStats(tachographRecords);

  return {
    tachographRecords,
    violationSummary,
    stats,
    isLoading: false,
    hasData: tachographRecords.length > 0
  };
};
