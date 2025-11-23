# 🔧 Khmer Font Troubleshooting Guide

## Current Status Check

### ✅ Font File Installed
- **File:** `NotoSansKhmer-Regular.ttf`
- **Location:** `D:\pos.pharmacy.pulean\public\fonts\NotoSansKhmer-Regular.ttf`
- **Size:** 105,696 bytes (103 KB)
- **Status:** ✅ File exists

## 🚨 Common Issues & Solutions

### Issue 1: Server Not Restarted
**Problem:** Font file was added but server wasn't restarted

**Solution:**
1. Stop your development server (Ctrl+C in terminal)
2. Restart it:
   ```bash
   npm run dev
   ```
3. Wait for "Ready" message
4. Try generating PDF again

### Issue 2: Browser Cache
**Problem:** Browser is using cached version without font

**Solution:**
1. Open browser DevTools (F12)
2. Hard refresh: **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
3. Or clear cache:
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files
4. Try generating PDF again

### Issue 3: Font Not Loading in PDF
**Problem:** Console shows font errors

**Solution:**
1. Open browser console (F12)
2. Generate a PDF
3. Look for these messages:

**✅ Success (should see):**
```
🔤 Attempting to load Khmer fonts for PDF...
📥 Trying to load NotoSansKhmer-Regular.ttf...
✅ NotoSansKhmer font loaded successfully!
```

**❌ Error (if you see this):**
```
⚠️ NotoSansKhmer-Regular.ttf not found (status: 404)
```

If you see 404 error:
- Server wasn't restarted
- File is in wrong location
- File name is incorrect

### Issue 4: Wrong File Location
**Problem:** Font file is in subfolder

**Check:**
```powershell
# Run this in PowerShell to verify:
Test-Path public\fonts\NotoSansKhmer-Regular.ttf
```

Should return: `True`

**If False:**
```powershell
# Check where the file actually is:
Get-ChildItem public\fonts -Recurse -Filter "NotoSansKhmer-Regular.ttf"
```

**Fix:**
Move the file to the correct location:
```powershell
Copy-Item "public\fonts\Noto_Sans_Khmer\static\NotoSansKhmer-Regular.ttf" "public\fonts\NotoSansKhmer-Regular.ttf"
```

### Issue 5: Wrong File Name
**Problem:** File has wrong name

**Check:**
```powershell
Get-ChildItem public\fonts\*.ttf
```

**Must be exactly:**
- ✅ `NotoSansKhmer-Regular.ttf`
- ❌ NOT `notosanskhmer-regular.ttf` (wrong case)
- ❌ NOT `NotoSansKhmer.ttf` (missing -Regular)
- ❌ NOT `Noto Sans Khmer Regular.ttf` (spaces)

**Fix:**
```powershell
# Rename if needed:
Rename-Item "public\fonts\OLD_NAME.ttf" "NotoSansKhmer-Regular.ttf"
```

## 🧪 Step-by-Step Testing

### Test 1: Verify File Exists
```powershell
Get-Item public\fonts\NotoSansKhmer-Regular.ttf
```

**Expected output:**
```
Name                      Length
----                      ------
NotoSansKhmer-Regular.ttf 105696
```

### Test 2: Check File is Accessible
```powershell
# Try to access the file via URL (server must be running)
# Open in browser:
http://localhost:3000/fonts/NotoSansKhmer-Regular.ttf
```

**Expected:** File should download or show in browser

**If 404:** Server not serving static files correctly

### Test 3: Check Console Messages
1. Open browser (Chrome/Edge)
2. Press F12 (DevTools)
3. Go to Console tab
4. Generate a PDF
5. Look for font loading messages

### Test 4: Test Khmer Text
Try adding this to your PDF code temporarily:

```javascript
// After font is loaded, test it:
doc.setFont(khmerFontName);
doc.text("អាយុ", 20, 20);  // Should show Khmer text
doc.text("Test", 20, 30);   // Should show English
```

## 🔍 Detailed Diagnostics

### Check 1: Server Configuration
Make sure Next.js is serving static files from `public/`:

**File:** `next.config.js` or `next.config.mjs`

Should have:
```javascript
// Static files in public/ are automatically served
// No special configuration needed for Next.js
```

### Check 2: Font File Integrity
```powershell
# Check file size (should be ~103 KB)
(Get-Item public\fonts\NotoSansKhmer-Regular.ttf).Length

# Should output: 105696
```

If size is different, re-download the font.

### Check 3: Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Generate PDF
4. Look for `NotoSansKhmer-Regular.ttf` request

**✅ Success:** Status 200, Size ~103 KB
**❌ Failed:** Status 404 or not found

## 🛠️ Complete Reset Procedure

If nothing works, try this complete reset:

### Step 1: Clean Up
```powershell
# Remove all font files
Remove-Item public\fonts\*.ttf -ErrorAction SilentlyContinue
Remove-Item -Recurse public\fonts\Noto_Sans_Khmer -ErrorAction SilentlyContinue
Remove-Item public\fonts\Noto_Sans_Khmer.zip -ErrorAction SilentlyContinue
```

### Step 2: Re-download Font
1. Visit: https://fonts.google.com/noto/specimen/Noto+Sans+Khmer
2. Click "Download family"
3. Extract ZIP
4. Find `NotoSansKhmer-Regular.ttf` in `static/` folder

### Step 3: Copy to Correct Location
```powershell
# Copy the file
Copy-Item "PATH_TO_EXTRACTED\static\NotoSansKhmer-Regular.ttf" "public\fonts\NotoSansKhmer-Regular.ttf"
```

### Step 4: Verify
```powershell
Test-Path public\fonts\NotoSansKhmer-Regular.ttf
# Should return: True
```

### Step 5: Restart Everything
```bash
# Stop server (Ctrl+C)
npm run dev
# Clear browser cache (Ctrl+Shift+R)
# Try PDF generation
```

## 📊 Expected vs Actual

### Expected Behavior:
1. Generate PDF → Font loads → Khmer text displays correctly
2. Console shows: `✅ NotoSansKhmer font loaded successfully!`
3. Khmer characters like `អាយុ` display properly (not boxes)

### If You See:
- **Boxes (□□□):** Font not loaded
- **Garbled text:** Wrong encoding or font
- **404 Error:** File not found or wrong path
- **No console message:** Code not running or error occurred

## 🎯 Quick Checklist

Run through this checklist:

- [ ] Font file exists: `public\fonts\NotoSansKhmer-Regular.ttf`
- [ ] File size is 105,696 bytes
- [ ] File name is EXACTLY `NotoSansKhmer-Regular.ttf`
- [ ] Development server has been restarted
- [ ] Browser cache has been cleared (Ctrl+Shift+R)
- [ ] Console shows font loading messages
- [ ] Console shows success: `✅ NotoSansKhmer font loaded successfully!`
- [ ] No 404 errors in Network tab
- [ ] Khmer text displays (not boxes)

## 🆘 Still Not Working?

### Last Resort Options:

#### Option 1: Try KhmerOS Font Instead
Download alternative font:
```
https://www.wfonts.com/font/khmer-os
```
Save as: `public\fonts\KhmerOS.ttf`

#### Option 2: Check File Permissions
```powershell
# Make sure file is readable
Get-Acl public\fonts\NotoSansKhmer-Regular.ttf
```

#### Option 3: Use Different Browser
Try Chrome, Edge, or Firefox to rule out browser issues

#### Option 4: Check Next.js Version
```bash
npm list next
```

Make sure you're on a recent version (14.x or 15.x)

## 📝 Report Issue

If still not working, provide these details:

1. **Console output** when generating PDF
2. **Network tab** screenshot showing font request
3. **File verification:**
   ```powershell
   Get-Item public\fonts\NotoSansKhmer-Regular.ttf | Format-List
   ```
4. **Browser** and version
5. **Next.js version:** `npm list next`

---

**Most Common Fix:** Restart server + Clear browser cache (Ctrl+Shift+R)
