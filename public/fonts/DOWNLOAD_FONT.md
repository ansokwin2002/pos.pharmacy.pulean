# Download Khmer Font - Step by Step

## The Problem
You're seeing garbled text like: `¢Ò"€‡Æ„ºÖ` instead of proper Khmer characters.

## The Solution
Download and install the Khmer font file.

---

## QUICK FIX - Download Noto Sans Khmer (Recommended)

### Step 1: Download the Font
Click this link to download:
**https://github.com/notofonts/khmer/raw/main/fonts/NotoSansKhmer/full/ttf/NotoSansKhmer-Regular.ttf**

Or visit: https://fonts.google.com/noto/specimen/Noto+Sans+Khmer

### Step 2: Rename the File
After downloading, rename the file from:
- `NotoSansKhmer-Regular.ttf` 
TO:
- `KhmerOS.ttf`

### Step 3: Place the File
Move `KhmerOS.ttf` to this directory:
```
D:\pos.pharmacy.pulean\public\fonts\KhmerOS.ttf
```

### Step 4: Restart Server
Stop your development server (Ctrl+C) and restart:
```bash
npm run dev
```

### Step 5: Test
1. Go to OPD Register page
2. Generate a PDF
3. Khmer text should now display correctly! ✅

---

## Alternative: Download KhmerOS Font

### Option A: Direct Download
1. Visit: https://www.wfonts.com/font/khmer-os
2. Click "Download"
3. Extract the ZIP file
4. Find `KhmerOS.ttf`
5. Place it in `public/fonts/KhmerOS.ttf`

### Option B: Google Fonts
1. Visit: https://fonts.google.com/specimen/Khmer
2. Click "Download family"
3. Extract the ZIP
4. Rename the .ttf file to `KhmerOS.ttf`
5. Place it in `public/fonts/KhmerOS.ttf`

---

## Verify Installation

After adding the font, check the browser console when generating PDF:
- ✅ Success: "Khmer font loaded successfully"
- ❌ Failed: "Khmer font not available..."

---

## File Structure Should Look Like:

```
public/
  └── fonts/
      ├── README.md
      ├── DOWNLOAD_FONT.md (this file)
      └── KhmerOS.ttf  ← Add this file here!
```

---

## Still Having Issues?

1. Make sure the file is named exactly: `KhmerOS.ttf` (case-sensitive)
2. Make sure it's in the correct directory: `public/fonts/`
3. Restart your development server
4. Clear browser cache (Ctrl+Shift+R)
5. Check browser console for error messages

---

## Quick Download Link

**Direct Download (Recommended):**
https://github.com/notofonts/khmer/raw/main/fonts/NotoSansKhmer/full/ttf/NotoSansKhmer-Regular.ttf

Remember to rename it to `KhmerOS.ttf` after downloading!
