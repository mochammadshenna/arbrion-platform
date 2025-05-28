
import { useState } from 'react';
import { toast } from 'sonner';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'clock-in' | 'clock-out';
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  photo?: string;
}

export const useAttendance = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  const capturePhoto = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          const video = document.createElement('video');
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          video.srcObject = stream;
          video.play();

          video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            setTimeout(() => {
              ctx?.drawImage(video, 0, 0);
              const dataURL = canvas.toDataURL('image/jpeg', 0.8);
              
              stream.getTracks().forEach(track => track.stop());
              resolve(dataURL);
            }, 100);
          };
        })
        .catch(reject);
    });
  };

  const submitAttendance = async (
    type: 'clock-in' | 'clock-out',
    employeeId: string,
    employeeName: string,
    includePhoto = false
  ): Promise<AttendanceRecord> => {
    setIsLoading(true);

    try {
      // Get location
      const location = await getCurrentLocation();
      
      // Get photo if requested
      let photo: string | undefined;
      if (includePhoto) {
        try {
          photo = await capturePhoto();
          toast.success('Photo captured successfully!');
        } catch (error) {
          toast.warning('Could not capture photo, proceeding without it');
        }
      }

      // Create attendance record
      const record: AttendanceRecord = {
        id: Date.now().toString(),
        employeeId,
        employeeName,
        type,
        timestamp: new Date(),
        location,
        photo,
      };

      // Save to localStorage (in real app, this would be API call)
      const existingRecords = JSON.parse(localStorage.getItem('attendance_records') || '[]');
      existingRecords.push(record);
      localStorage.setItem('attendance_records', JSON.stringify(existingRecords));

      toast.success(`Successfully ${type === 'clock-in' ? 'clocked in' : 'clocked out'}!`);
      return record;
    } catch (error) {
      console.error('Attendance submission error:', error);
      toast.error('Failed to submit attendance. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceRecords = (employeeId?: string): AttendanceRecord[] => {
    const records = JSON.parse(localStorage.getItem('attendance_records') || '[]');
    
    // Convert timestamp strings back to Date objects
    const parsedRecords = records.map((record: any) => ({
      ...record,
      timestamp: new Date(record.timestamp),
    }));

    if (employeeId) {
      return parsedRecords.filter((record: AttendanceRecord) => record.employeeId === employeeId);
    }
    
    return parsedRecords;
  };

  return {
    isLoading,
    submitAttendance,
    getAttendanceRecords,
    getCurrentLocation,
    capturePhoto,
  };
};
