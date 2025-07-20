# 🔧 Troubleshooting Guide - Backend Frontend Connection

## Quick Status Check

1. **Open your browser** and go to: http://localhost:5173
2. **Scroll down** to see the "Backend Connection Status" section
3. **Click "Run All Tests"** to check everything

---

## ✅ Expected Results

### ✅ When Everything Works:
- **Backend Server**: `online` (green badge)  
- **Database**: `connected` (green badge)
- **Authentication**: `working` (green badge)
- **Test Logs**: Should show successful connections

### ❌ Common Issues & Solutions:

## 🚨 Problem: Backend Server shows "offline"

**Symptoms:** 
- Backend Server badge is red/offline
- Logs show "Backend connection failed"

**Solutions:**
1. **Check if backend is running**:
   ```bash
   # Look for a PowerShell window with backend running
   # You should see: "🚀 Server running in development mode"
   ```

2. **If backend is NOT running**, start it:
   ```bash
   # Open PowerShell and run:
   cd "E:\mse\MedicalAssistant\server"
   npm run dev
   ```

3. **Check the port**: Backend should be on `http://localhost:5000`

---

## 🚨 Problem: Database shows "disconnected"

**Symptoms:**
- Database badge is red/disconnected  
- Backend is online but database fails

**Solutions:**
1. **Check if MongoDB is running**:
   - Look for `mongod.exe` in Task Manager
   - Or try starting MongoDB service

2. **Start MongoDB** (if not running):
   ```bash
   # Option 1: Start MongoDB service
   net start MongoDB
   
   # Option 2: Run mongod directly
   mongod
   ```

3. **Check connection string** in backend `.env`:
   ```
   MONGO_URI=mongodb://localhost:27017/medical_assistant
   ```

---

## 🚨 Problem: Authentication fails

**Symptoms:**
- Auth badge shows "failed" 
- Login doesn't work

**Solutions:**
1. **Check sample data exists**:
   ```bash
   cd "E:\mse\MedicalAssistant\server"
   npm run seed
   ```

2. **Try the test credentials**:
   - Email: `sarah.johnson@citygeneral.com`  
   - Password: `doctor123`

3. **Check backend logs** for errors

---

## 🚨 Problem: CORS Errors

**Symptoms:**
- Browser console shows CORS errors
- "Access to fetch blocked by CORS policy"

**Solutions:**
1. **Backend CORS is configured** for `localhost:5173`
2. **Make sure frontend is on port 5173**
3. **Check backend console** for CORS messages

---

## 🚨 Problem: Frontend not loading

**Symptoms:**
- Can't access http://localhost:5173
- Page won't load

**Solutions:**
1. **Check if frontend is running**:
   ```bash
   # Look for PowerShell window with frontend
   # Should show: "Local: http://localhost:5173/"
   ```

2. **If frontend is NOT running**, start it:
   ```bash
   # Open PowerShell and run:
   cd "E:\mse\MedicalAssistant"
   npm run dev
   ```

---

## 📋 Full Setup Checklist

### Step 1: Start Backend
```bash
# Terminal 1
cd "E:\mse\MedicalAssistant\server"
npm run dev
```
**Expected output:** 
```
🚀 Server running in development mode
📡 Port: 5000
MongoDB Connected: localhost
```

### Step 2: Start Frontend  
```bash
# Terminal 2 (new window)
cd "E:\mse\MedicalAssistant"
npm run dev
```
**Expected output:**
```
Local: http://localhost:5173/
```

### Step 3: Verify Connection
1. Open: http://localhost:5173
2. Scroll to "Backend Connection Status"
3. Click "Run All Tests"
4. All badges should be green ✅

### Step 4: Test Login
1. Go to: http://localhost:5173/login
2. Use credentials:
   - Email: `sarah.johnson@citygeneral.com`
   - Password: `doctor123`
3. Should redirect to dashboard with real data

---

## 🆘 Still Having Issues?

### Check These URLs Manually:

1. **Backend Health**: http://localhost:5000/health
   - Should return JSON with "Server is running!"

2. **Frontend**: http://localhost:5173
   - Should show the landing page

3. **Backend API**: http://localhost:5000/api/doctor/all
   - Should return 401 (needs authentication) - that's expected!

### Debug Steps:

1. **Check PowerShell windows** - both should be running
2. **Look at console logs** in both terminals
3. **Check browser console** (F12) for error messages
4. **Try the API test page** on the landing page

### Sample Data Available:

- **3 Doctors** with login credentials  
- **4 Patients** assigned to doctors
- **3 Medical Records** with AI analysis
- **1 Organization** (City General Hospital)

---

## 🎉 Success Indicators

When everything is working correctly:
- ✅ Landing page loads with green connection status
- ✅ Login works with test credentials  
- ✅ Dashboard shows real data from database
- ✅ No console errors
- ✅ Both servers running in their terminals

---

**Need help?** Check the terminal logs and browser console for specific error messages!
