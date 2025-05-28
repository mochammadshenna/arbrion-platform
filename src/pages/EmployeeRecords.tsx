
import React, { useState, useEffect } from 'react';
import { useAttendance } from '@/hooks/useAttendance';
import { ModernButton } from '@/components/ui/modern-button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Trash2 } from 'lucide-react';

const EmployeeRecords = () => {
  const { getAttendanceRecords } = useAttendance();
  const [records, setRecords] = useState<any[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, filterType, filterDate]);

  const loadRecords = () => {
    const allRecords = getAttendanceRecords();
    setRecords(allRecords.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  };

  const filterRecords = () => {
    let filtered = [...records];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.includes(searchTerm)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(record => record.type === filterType);
    }

    // Date filter
    if (filterDate) {
      const filterDateObj = new Date(filterDate);
      filtered = filtered.filter(record => 
        record.timestamp.toDateString() === filterDateObj.toDateString()
      );
    }

    setFilteredRecords(filtered);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Employee Name', 'Employee ID', 'Type', 'Date', 'Time', 'Latitude', 'Longitude', 'Photo'],
      ...filteredRecords.map(record => [
        record.employeeName,
        record.employeeId,
        record.type,
        record.timestamp.toLocaleDateString(),
        record.timestamp.toLocaleTimeString(),
        record.location.latitude,
        record.location.longitude,
        record.photo ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_records_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const deleteRecord = (recordId: string) => {
    const updatedRecords = records.filter(record => record.id !== recordId);
    localStorage.setItem('attendance_records', JSON.stringify(updatedRecords));
    setRecords(updatedRecords);
  };

  const getStatusColor = (type: string) => {
    return type === 'clock-in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getUniqueEmployees = () => {
    const employees = new Map();
    records.forEach(record => {
      if (!employees.has(record.employeeId)) {
        employees.set(record.employeeId, {
          id: record.employeeId,
          name: record.employeeName,
          totalRecords: 0,
          lastSeen: new Date(0)
        });
      }
      const emp = employees.get(record.employeeId);
      emp.totalRecords++;
      if (record.timestamp > emp.lastSeen) {
        emp.lastSeen = record.timestamp;
      }
    });
    return Array.from(employees.values());
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Employee Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {getUniqueEmployees().length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {records.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {records.filter(r => r.timestamp.toDateString() === new Date().toDateString()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Export */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Employee Attendance Records</CardTitle>
              <CardDescription>Search, filter, and manage all employee attendance</CardDescription>
            </div>
            <ModernButton
              variant="success"
              onClick={exportToCSV}
              icon={Download}
              className="w-full sm:w-auto"
            >
              Export CSV
            </ModernButton>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Search by employee name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="clock-in">Clock In</SelectItem>
                <SelectItem value="clock-out">Clock Out</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full sm:w-40"
            />
          </div>

          {/* Records Table */}
          <div className="space-y-4">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(record.type)}>
                      {record.type === 'clock-in' ? '🕐 In' : '🕐 Out'}
                    </Badge>
                    <div>
                      <p className="font-medium">{record.employeeName}</p>
                      <p className="text-sm text-gray-600">ID: {record.employeeId}</p>
                      <p className="text-xs text-gray-500">
                        📍 {record.location.latitude.toFixed(4)}, {record.location.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {record.timestamp.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {record.timestamp.toLocaleTimeString()}
                      </p>
                      {record.photo && (
                        <Badge variant="outline" className="mt-1">
                          📸 Photo
                        </Badge>
                      )}
                    </div>
                    <ModernButton
                      variant="danger"
                      size="sm"
                      onClick={() => deleteRecord(record.id)}
                      icon={Trash2}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">📝</span>
                <p>No records found</p>
                <p className="text-sm">Try adjusting your search filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeRecords;
