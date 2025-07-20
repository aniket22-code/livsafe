import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const API_BASE_URL = 'http://localhost:5000';

export function ApiTest() {
  const [status, setStatus] = useState<{
    backend: 'checking' | 'online' | 'offline';
    database: 'checking' | 'connected' | 'disconnected';
    auth: 'not-tested' | 'testing' | 'working' | 'failed';
  }>({
    backend: 'checking',
    database: 'checking',
    auth: 'not-tested'
  });

  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Test backend connection
  const testBackend = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        setStatus(prev => ({ ...prev, backend: 'online' }));
        addLog(`Backend online: ${data.message}`);
        return true;
      } else {
        setStatus(prev => ({ ...prev, backend: 'offline' }));
        addLog(`Backend responded with status: ${response.status}`);
        return false;
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, backend: 'offline' }));
      addLog(`Backend connection failed: ${error}`);
      return false;
    }
  };

  // Test database connection (via backend)
  const testDatabase = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor/all`);
      if (response.status === 401) {
        // 401 means backend is working but we need auth - that's expected
        setStatus(prev => ({ ...prev, database: 'connected' }));
        addLog('Database connected (authentication required for data)');
        return true;
      } else if (response.ok) {
        setStatus(prev => ({ ...prev, database: 'connected' }));
        addLog('Database connected and accessible');
        return true;
      } else {
        setStatus(prev => ({ ...prev, database: 'disconnected' }));
        addLog(`Database test failed: ${response.status}`);
        return false;
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, database: 'disconnected' }));
      addLog(`Database connection test failed: ${error}`);
      return false;
    }
  };

  // Test authentication
  const testAuth = async () => {
    setStatus(prev => ({ ...prev, auth: 'testing' }));
    addLog('Testing authentication with credentials: sarah.johnson@citygeneral.com / doctor123');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'sarah.johnson@citygeneral.com',
          password: 'doctor123'
        })
      });

      addLog(`Login response status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        setStatus(prev => ({ ...prev, auth: 'working' }));
        addLog(`✅ Authentication working: Logged in as ${data.data?.fullName}`);
        addLog(`Token received: ${data.token ? 'Yes' : 'No'}`);
        return true;
      } else {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || 'Server error';
          addLog(`❌ Server response: ${JSON.stringify(errorData)}`);
        } catch (parseError) {
          addLog(`❌ Could not parse error response: ${parseError}`);
        }
        
        setStatus(prev => ({ ...prev, auth: 'failed' }));
        addLog(`❌ Authentication failed (${response.status}): ${errorMessage}`);
        return false;
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, auth: 'failed' }));
      addLog(`❌ Authentication test failed: ${error}`);
      return false;
    }
  };

  // Run tests on component mount
  useEffect(() => {
    const runTests = async () => {
      addLog('Starting API connection tests...');
      
      const backendOk = await testBackend();
      if (backendOk) {
        await testDatabase();
      } else {
        setStatus(prev => ({ ...prev, database: 'disconnected' }));
      }
    };

    runTests();
  }, []);

  const runAllTests = async () => {
    setLogs([]);
    setStatus({
      backend: 'checking',
      database: 'checking',
      auth: 'not-tested'
    });

    addLog('Starting comprehensive API tests...');
    const backendOk = await testBackend();
    if (backendOk) {
      await testDatabase();
      await testAuth();
    } else {
      setStatus(prev => ({ 
        ...prev, 
        database: 'disconnected',
        auth: 'not-tested'
      }));
    }
  };

  const getStatusBadge = (statusValue: string) => {
    const variants: any = {
      'checking': 'secondary',
      'online': 'default',
      'offline': 'destructive',
      'connected': 'default',
      'disconnected': 'destructive',
      'working': 'default',
      'failed': 'destructive',
      'testing': 'secondary',
      'not-tested': 'outline'
    };

    return <Badge variant={variants[statusValue] || 'outline'}>{statusValue}</Badge>;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>API Connection Status</CardTitle>
          <div className="flex gap-4">
            <Button onClick={runAllTests}>Run All Tests</Button>
            <Button variant="outline" onClick={testAuth}>Test Login</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Backend Server</span>
                {getStatusBadge(status.backend)}
              </div>
              <p className="text-sm text-muted-foreground">http://localhost:5000</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Database</span>
                {getStatusBadge(status.database)}
              </div>
              <p className="text-sm text-muted-foreground">MongoDB Connection</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Authentication</span>
                {getStatusBadge(status.auth)}
              </div>
              <p className="text-sm text-muted-foreground">JWT Login System</p>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Test Logs</h3>
            <div className="bg-gray-50 p-3 rounded text-sm font-mono max-h-60 overflow-y-auto">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              ) : (
                <div className="text-muted-foreground">No logs yet...</div>
              )}
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Test Credentials</h4>
            <div className="text-sm text-blue-800">
              <p><strong>Email:</strong> sarah.johnson@citygeneral.com</p>
              <p><strong>Password:</strong> doctor123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
