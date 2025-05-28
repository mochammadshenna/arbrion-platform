import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendance } from '@/hooks/useAttendance';
import { ModernButton } from '@/components/ui/modern-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { MapPin, Camera, LogIn, LogOut, RefreshCw, Clock } from 'lucide-react';

const MyAttendance = () => {
  const { user } = useAuth();
  const { submitAttendance, getAttendanceRecords, isLoading } = useAttendance();
  const [includePhoto, setIncludePhoto] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Detecting location...');
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [lastAction, setLastAction] = useState<'clock-in' | 'clock-out' | null>(null);

  useEffect(() => {
    if (user) {
      loadAttendanceRecords();
      detectLocation();
    }
  }, [user]);

  const loadAttendanceRecords = () => {
    if (user) {
      const records = user.role === 'admin' 
        ? getAttendanceRecords() 
        : getAttendanceRecords(user.id);
      
      setAttendanceRecords(
        records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      );

      // Get last action
      const userRecords = records.filter(r => r.employeeId === user.id);
      if (userRecords.length > 0) {
        setLastAction(userRecords[0].type);
      }
    }
  };

  const detectLocation = () => {
    setLocationStatus('Getting location...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          setLocationStatus(`Location captured: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
        },
        (error) => {
          setLocationStatus('Unable to detect location');
          console.error('Location error:', error);
        }
      );
    } else {
      setLocationStatus('Geolocation not supported');
    }
  };

  const handleClockIn = async () => {
    if (!user) return;
    
    try {
      await submitAttendance('clock-in', user.id, user.name, includePhoto);
      setLastAction('clock-in');
      loadAttendanceRecords();
    } catch (error) {
      console.error('Clock in failed:', error);
    }
  };

  const handleClockOut = async () => {
    if (!user) return;
    
    try {
      await submitAttendance('clock-out', user.id, user.name, includePhoto);
      setLastAction('clock-out');
      loadAttendanceRecords();
    } catch (error) {
      console.error('Clock out failed:', error);
    }
  };

  const getStatusColor = (type: string) => {
    return type === 'clock-in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Attendance</h1>
        <p className="text-gray-600 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Tracking Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Location Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ModernButton
              variant="outline"
              onClick={detectLocation}
              icon={MapPin}
              className="w-full"
            >
              Get Current Location
            </ModernButton>
            
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-medium text-gray-900 mb-2">Current Location</h3>
              {currentLocation ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Latitude: {currentLocation.lat.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Longitude: {currentLocation.lng.toFixed(6)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Location not available</p>
              )}
            </div>

            <div className="bg-gray-100 p-4 rounded-lg min-h-[200px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="font-medium">Map View</p>
                <p className="text-sm">
                  Location: {currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 'No location'}
                </p>
              </div>
            </div>

            {currentLocation && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-medium">
                  Location captured: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photo Verification Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-600" />
              Photo Verification (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-100 p-8 rounded-lg min-h-[200px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="font-medium mb-2">Camera not active</p>
              </div>
            </div>

            <ModernButton
              variant="primary"
              onClick={() => setIncludePhoto(!includePhoto)}
              icon={Camera}
              className="w-full bg-gray-800 hover:bg-gray-900"
            >
              Start Camera
            </ModernButton>
          </CardContent>
        </Card>
      </div>

      {/* Clock In/Out Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ModernButton
          onClick={handleClockIn}
          disabled={isLoading || lastAction === 'clock-in'}
          className="h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-lg"
          icon={LogIn}
          size="lg"
        >
          {isLoading ? 'Processing...' : 'Clock In'}
        </ModernButton>
        <ModernButton
          onClick={handleClockOut}
          disabled={isLoading || lastAction === 'clock-out' || !lastAction}
          className="h-16 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold text-lg"
          icon={LogOut}
          size="lg"
        >
          {isLoading ? 'Processing...' : 'Clock Out'}
        </ModernButton>
      </div>

      {lastAction && (
        <div className="text-center">
          <Badge className={getStatusColor(lastAction)}>
            Last action: {lastAction === 'clock-in' ? 'Clocked In' : 'Clocked Out'}
          </Badge>
        </div>
      )}

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>
            {user?.role === 'admin' ? 'All Attendance Records' : 'My Attendance History'}
          </CardTitle>
          <CardDescription>
            {user?.role === 'admin' 
              ? 'View all employee attendance records' 
              : 'Your recent clock in/out records'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceRecords.length > 0 ? (
              attendanceRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(record.type)}>
                      {record.type === 'clock-in' ? <LogIn className="w-3 h-3 mr-1" /> : <LogOut className="w-3 h-3 mr-1" />}
                      {record.type === 'clock-in' ? 'In' : 'Out'}
                    </Badge>
                    <div>
                      <p className="font-medium">{record.employeeName}</p>
                      <p className="text-sm text-gray-600">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        Lat: {record.location.latitude.toFixed(4)}, Lng: {record.location.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {record.timestamp.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {record.timestamp.toLocaleTimeString()}
                    </p>
                    {record.photo && (
                      <Badge variant="outline" className="mt-1">
                        <Camera className="w-3 h-3 mr-1" />
                        Photo
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">📝</span>
                <p>No attendance records yet</p>
                <p className="text-sm">Start by clocking in!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyAttendance;
