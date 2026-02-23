# Khmer Font Support - Current Status

## ✅ What's Already Done

### 1. PDF Generation Code is Ready
- ✅ Font loading code implemented in both PDF generators:
  - `src/app/(default)/opd/patients/[id]/history/page.tsx` (Patient History PDF)
  - `src/app/(default)/opd/create/patient/ClientPage.tsx` (Register Patient PDF)
  - `src/app/(default)/opd/edit/patient/ClientPage.tsx` (Register Patient PDF)
- ✅ Tries to load fonts in this order:
  1. NotoSansKhmer-Regular.ttf (Primary)
  2. KhmerOS.ttf (Fallback)
  3. Helvetica (Last resort - won't show Khmer correctly)

### 2. Console Logging Added
- ✅ Detailed console messages to help debug font loading
- ✅ Shows which font is being loaded
- ✅ Shows success/failure messages
- ✅ Provides download link if fonts are missing

### 3. Documentation Created
- ✅ `KHMER_FONT_SETUP.md` - Complete setup guide
- ✅ `public/fonts/README.md` - Font directory instructions
- ✅ `public/fonts/DOWNLOAD_FONT.md` - Step-by-step download guide
- ✅ `public/fonts/download-fonts.html` - Interactive download page

## ❌ What's Missing

### Font Files Not Installed Yet
The Khmer font files need to be downloaded and placed in `public/fonts/`:

**Required:**
- ❌ `NotoSansKhmer-Regular.ttf` (Primary font)

**Optional:**
- ❌ `KhmerOS.ttf` (Fallback font)

## 🚀 Quick Fix (2 Minutes)

### Option 1: Use Download Page (Easiest)
1. Open in browser: `http://localhost:3000/fonts/download-fonts.html`
2. Click the download buttons
3. Save files to `public/fonts/`
4. Restart server: `npm run dev`

### Option 2: Direct Download
1. Download this file:
   ```
   https://github.com/notofonts/khmer/raw/main/fonts/NotoSansKhmer/full/ttf/NotoSansKhmer-Regular.ttf
   ```
2. Save as: `public/fonts/NotoSansKhmer-Regular.ttf`
3. Restart server: `npm run dev`

### Option 3: Manual Download
1. Visit: https://fonts.google.com/noto/specimen/Noto+Sans+Khmer
2. Click "Download family"
3. Extract the ZIP file
4. Find `NotoSansKhmer-Regular.ttf`
5. Copy to `public/fonts/NotoSansKhmer-Regular.ttf`
6. Restart server: `npm run dev`

## 🧪 Testing

After installing fonts:

1. **Generate a PDF:**
   - Go to OPD → Patient History
   - Click on any prescription
   - Click "View Prescription PDF"

2. **Check Console:**
   - Open browser DevTools (F12)
   - Look for: `✅ NotoSansKhmer font loaded successfully!`

3. **Test Khmer Text:**
   ```javascript
   // These should display correctly in PDF:
   doc.text("អាយុ:", margin, y);      // Age
   doc.text("ឈ្មោះ:", margin, y);     // Name
   doc.text("ភេទ:", margin, y);       // Gender
   doc.text("អាសយដ្ឋាន:", margin, y); // Address
   ```

## 📊 Console Messages

### ✅ Success (Font Loaded)
```
🔤 Attempting to load Khmer fonts for PDF...
📥 Trying to load NotoSansKhmer-Regular.ttf...
✅ NotoSansKhmer font loaded successfully!
```

### ⚠️ Warning (Font Not Found)
```
🔤 Attempting to load Khmer fonts for PDF...
📥 Trying to load NotoSansKhmer-Regular.ttf...
⚠️ NotoSansKhmer-Regular.ttf not found (status: 404)
📥 Trying to load KhmerOS.ttf as fallback...
⚠️ KhmerOS.ttf not found (status: 404)
❌ No Khmer fonts found! Using Helvetica fallback.
📖 Please download Khmer fonts. See: KHMER_FONT_SETUP.md
📥 Quick download: https://github.com/notofonts/khmer/raw/main/fonts/NotoSansKhmer/full/ttf/NotoSansKhmer-Regular.ttf
```

## 📁 Expected File Structure

After setup, your `public/fonts/` directory should look like:

```
public/
  └── fonts/
      ├── NotoSansKhmer-Regular.ttf  ← Download this (REQUIRED)
      ├── KhmerOS.ttf                ← Download this (OPTIONAL)
      ├── README.md
      ├── DOWNLOAD_FONT.md
      ├── download-font.html
      └── download-fonts.html        ← New interactive page
```

## 🔧 Troubleshooting

### Problem: "Font not found" in console
**Solution:** Download the font files using one of the methods above

### Problem: Khmer text shows as boxes (□□□)
**Solution:** Font files are not loaded. Check file names and paths.

### Problem: Khmer text shows as garbled characters
**Solution:** Font files might be corrupted. Re-download them.

### Problem: Console shows success but text still wrong
**Solution:** 
1. Clear browser cache (Ctrl+Shift+R)
2. Restart development server
3. Try generating PDF again

## 📝 Next Steps

1. **Download fonts** using one of the methods above
2. **Restart server** (`npm run dev`)
3. **Test PDF generation** with Khmer text
4. **Check console** for success messages

## 🎯 Current Status Summary

| Component | Status |
|-----------|--------|
| PDF Generation Code | ✅ Ready |
| Font Loading Logic | ✅ Implemented |
| Console Logging | ✅ Added |
| Documentation | ✅ Complete |
| Font Files | ❌ **Need to Download** |

**Action Required:** Download and install the Khmer font files to enable Khmer text in PDFs.

---

**Quick Links:**

- 📥 Download Page: `http://localhost:3000/fonts/download-fonts.html`
- 📖 Setup Guide: `KHMER_FONT_SETUP.md`
- 🔗 Direct Download: https://github.com/notofonts/khmer/raw/main/fonts/NotoSansKhmer/full/ttf/NotoSansKhmer-Regular.ttf
