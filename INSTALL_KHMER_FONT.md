# 📥 Install Khmer Font - Manual Instructions

## ⚠️ Current Status
**Khmer font is NOT installed.** You need to download it manually.

## 🎯 Quick Solution (3 Steps)

### Step 1: Download the Font

**Option A: Google Fonts (Recommended)**
1. Visit: https://fonts.google.com/noto/specimen/Noto+Sans+Khmer
2. Click the **"Download family"** button (top right)
3. A ZIP file will download: `Noto_Sans_Khmer.zip`

**Option B: Alternative Source**
1. Visit: https://www.fontsquirrel.com/fonts/noto-sans-khmer
2. Click **"Download TTF"**

### Step 2: Extract and Rename

1. **Extract** the downloaded ZIP file
2. **Find** the file: `NotoSansKhmer-Regular.ttf`
   - It might be in a subfolder like `static/` or `ttf/`
3. **Copy** this file

### Step 3: Install in Project

1. **Navigate** to your project folder:
   ```
   D:\pos.pharmacy.pulean\public\fonts\
   ```

2. **Paste** the `NotoSansKhmer-Regular.ttf` file there

3. **Verify** the file path is exactly:
   ```
   D:\pos.pharmacy.pulean\public\fonts\NotoSansKhmer-Regular.ttf
   ```

### Step 4: Restart Server

```bash
# Stop the server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### Step 5: Test

1. Go to **OPD → Patient History**
2. Click on any prescription
3. Open **Browser Console** (F12)
4. Look for: `✅ NotoSansKhmer font loaded successfully!`

## 📁 Expected File Structure

After installation:

```
public/
  └── fonts/
      ├── NotoSansKhmer-Regular.ttf  ← This file should exist
      ├── README.md
      ├── DOWNLOAD_FONT.md
      └── download-fonts.html
```

## 🧪 Testing Khmer Text

After installation, these Khmer characters should display correctly in PDFs:

```
អាយុ     (Age)
ឈ្មោះ    (Name)
ភេទ      (Gender)
អាសយដ្ឋាន (Address)
```

## ❓ Troubleshooting

### Problem: Can't find the download button
**Solution:** 
- Make sure you're on: https://fonts.google.com/noto/specimen/Noto+Sans+Khmer
- Look for "Download family" button in the top right corner
- If not visible, try a different browser

### Problem: Downloaded file has wrong name
**Solution:**
- The file MUST be named exactly: `NotoSansKhmer-Regular.ttf`
- Case-sensitive! Not `notosanskhmer-regular.ttf`
- Not `NotoSansKhmer.ttf` (missing `-Regular`)

### Problem: File is in wrong location
**Solution:**
- File must be in: `public\fonts\NotoSansKhmer-Regular.ttf`
- NOT in: `public\NotoSansKhmer-Regular.ttf`
- NOT in: `fonts\NotoSansKhmer-Regular.ttf`

### Problem: Still not working after installation
**Solution:**
1. Verify file name is EXACTLY: `NotoSansKhmer-Regular.ttf`
2. Verify file is in: `public\fonts\` directory
3. Restart development server completely
4. Clear browser cache (Ctrl+Shift+R)
5. Check browser console for error messages

## 🔍 Verification Checklist

- [ ] Downloaded font from Google Fonts
- [ ] Extracted ZIP file
- [ ] Found `NotoSansKhmer-Regular.ttf` file
- [ ] Copied to `public\fonts\` directory
- [ ] File name is exactly: `NotoSansKhmer-Regular.ttf`
- [ ] Restarted development server
- [ ] Tested PDF generation
- [ ] Checked browser console for success message

## 📸 Visual Guide

### Where to Download:
1. Go to: https://fonts.google.com/noto/specimen/Noto+Sans+Khmer
2. Look for this button: **[Download family]** (top right)
3. Click it to download ZIP file

### Where to Put the File:
```
Your Project Folder
  └── public
      └── fonts
          └── NotoSansKhmer-Regular.ttf  ← Put file here!
```

## 🎯 Quick Check

After installation, run this in your browser console when viewing a PDF:

```javascript
// Should see this in console:
🔤 Attempting to load Khmer fonts for PDF...
📥 Trying to load NotoSansKhmer-Regular.ttf...
✅ NotoSansKhmer font loaded successfully!
```

## 📞 Still Need Help?

If you're still having issues:

1. **Check file size**: Should be around 150-200 KB
2. **Check file type**: Should be `.ttf` (TrueType Font)
3. **Try opening the font file**: Double-click it - Windows should show a font preview
4. **Check permissions**: Make sure the file is not read-only

## 🔗 Direct Links

- **Google Fonts**: https://fonts.google.com/noto/specimen/Noto+Sans+Khmer
- **Font Squirrel**: https://www.fontsquirrel.com/fonts/noto-sans-khmer
- **Project Fonts Folder**: `D:\pos.pharmacy.pulean\public\fonts\`

---

**Remember:** The file MUST be named exactly `NotoSansKhmer-Regular.ttf` and placed in `public\fonts\` directory!
