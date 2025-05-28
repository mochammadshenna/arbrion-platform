
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendance } from '@/hooks/useAttendance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Calendar, Clock, Briefcase } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { getAttendanceRecords } = useAttendance();
  const [stats, setStats] = useState({
    totalAttendance: 0,
    thisMonth: 0,
    thisWeek: 0,
    lastClockIn: null as Date | null,
    leaveBalance: 15,
  });
  const [recentRecords, setRecentRecords] = useState<any[]>([]);

  const avatar3D = "https://static.vecteezy.com/system/resources/previews/045/647/937/non_2x/3d-character-people-close-up-portrait-smiling-nice-3d-avartar-or-icon-free-png.png";

  useEffect(() => {
    const records = user?.role === 'admin' 
      ? getAttendanceRecords() 
      : getAttendanceRecords(user?.id);

    const now = new Date();
    const thisMonth = records.filter(record => 
      record.timestamp.getMonth() === now.getMonth() &&
      record.timestamp.getFullYear() === now.getFullYear()
    );
    
    const thisWeek = records.filter(record => {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return record.timestamp >= weekStart;
    });

    const lastClockIn = records
      .filter(record => record.type === 'clock-in')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    setStats({
      totalAttendance: records.length,
      thisMonth: thisMonth.length,
      thisWeek: thisWeek.length,
      lastClockIn: lastClockIn?.timestamp || null,
      leaveBalance: 15,
    });

    setRecentRecords(
      records
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5)
    );
  }, [user, getAttendanceRecords]);

  return (
    <div className="space-y-6">
      {/* Welcome Section with Avatar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
            <img 
              src={avatar3D} 
              alt="3D Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="text-blue-100">
              {user?.role === 'admin' ? 'Admin Dashboard' : 'Employee Dashboard'}
            </p>
            <p className="text-sm text-blue-200 mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalAttendance}</div>
            <p className="text-xs text-muted-foreground">All time attendance</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-6 w-6 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">Monthly attendance</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <BarChart3 className="h-6 w-6 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.thisWeek}</div>
            <p className="text-xs text-muted-foreground">Weekly attendance</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
            <Briefcase className="h-6 w-6 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.leaveBalance}</div>
            <p className="text-xs text-muted-foreground">Days remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Last Clock In Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Clock In</CardTitle>
          <Clock className="h-6 w-6 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-blue-600">
            {stats.lastClockIn 
              ? stats.lastClockIn.toLocaleDateString()
              : 'No records'
            }
          </div>
          <p className="text-sm text-muted-foreground">
            {stats.lastClockIn 
              ? stats.lastClockIn.toLocaleTimeString()
              : 'N/A'
            }
          </p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            {user?.role === 'admin' ? 'Latest attendance records from all employees' : 'Your recent attendance records'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRecords.length > 0 ? (
              recentRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      record.type === 'clock-in' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium">{record.employeeName}</p>
                      <p className="text-sm text-gray-600">
                        {record.type === 'clock-in' ? 'Clocked In' : 'Clocked Out'}
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
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No attendance records yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
