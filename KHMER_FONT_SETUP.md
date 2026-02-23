# Khmer Font Setup for PDF Generation

## Current Status
❌ **Khmer fonts are NOT installed yet**

The PDF generation code is ready to use Khmer fonts, but the font files need to be downloaded and placed in the correct location.

## Quick Fix (5 minutes)

### Step 1: Download Noto Sans Khmer Font
Click this direct download link:
```
https://github.com/notofonts/khmer/raw/main/fonts/NotoSansKhmer/full/ttf/NotoSansKhmer-Regular.ttf
```

### Step 2: Save the Font File
Save the downloaded file as:
```
public/fonts/NotoSansKhmer-Regular.ttf
```

**Important:** The file should be named exactly `NotoSansKhmer-Regular.ttf` (the code already looks for this file first)

### Step 3: (Optional) Download KhmerOS Font as Fallback
For better compatibility, also download:
```
https://github.com/khmertype/KhmerOS/raw/master/fonts/KhmerOS.ttf
```

Save it as:
```
public/fonts/KhmerOS.ttf
```

### Step 4: Restart Development Server
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Step 5: Test
1. Go to OPD → Patient History
2. Click on a prescription to view PDF
3. Khmer text should now display correctly! ✅

## File Structure After Setup

```
public/
  └── fonts/
      ├── NotoSansKhmer-Regular.ttf  ← Primary font (download this)
      ├── KhmerOS.ttf                ← Fallback font (optional)
      ├── README.md
      ├── DOWNLOAD_FONT.md
      └── download-font.html
```

## How the Font Loading Works

The PDF generation code tries to load fonts in this order:

1. **NotoSansKhmer-Regular.ttf** (Primary - best quality)
2. **KhmerOS.ttf** (Fallback - good compatibility)
3. **Helvetica** (Last resort - won't display Khmer correctly)

## Testing Khmer Text

After installing the fonts, test with this Khmer text in the PDF:

```javascript
doc.text("អាយុ:", margin, y);  // Age
doc.text("ឈ្មោះ:", margin, y); // Name
doc.text("ភេទ:", margin, y);    // Gender
```

## Current PDF Files Using Khmer Fonts

1. **Patient History PDF** (`src/app/(default)/opd/patients/[id]/history/page.tsx`)
   - Line ~147-230: buildPdf function with Khmer font loading

2. **Register Patient PDF** (`src/app/(default)/opd/create/patient/ClientPage.tsx`, `src/app/(default)/opd/edit/patient/ClientPage.tsx`)
   - Line ~520-800: buildPdf function with Khmer font loading

## Troubleshooting

### Problem: Khmer text shows as boxes or garbled characters
**Solution:** Font files are not installed. Follow steps 1-4 above.

### Problem: Console shows "Failed to load font"
**Solution:** 
1. Check file names are exactly correct (case-sensitive)
2. Check files are in `public/fonts/` directory
3. Restart development server

### Problem: Font loads but text still looks wrong
**Solution:**
1. Clear browser cache (Ctrl+Shift+R)
2. Try downloading the other font file as backup
3. Check browser console for errors

## Verification

After setup, check browser console when generating PDF:

✅ **Success:** No font errors, Khmer text displays correctly
❌ **Failed:** "Failed to load font" or garbled text

## Alternative Font Sources

### Option 1: Google Fonts (Noto Sans Khmer)
- Visit: https://fonts.google.com/noto/specimen/Noto+Sans+Khmer
- Download → Extract → Rename to `NotoSansKhmer-Regular.ttf`

### Option 2: KhmerOS (SourceForge)
- Visit: https://sourceforge.net/projects/khmer/files/Fonts/
- Download KhmerOS package → Extract `KhmerOS.ttf`

### Option 3: GitHub (Direct)
- NotoSansKhmer: https://github.com/notofonts/khmer
- KhmerOS: https://github.com/khmertype/KhmerOS

## Font File Sizes

- **NotoSansKhmer-Regular.ttf**: ~150-200 KB
- **KhmerOS.ttf**: ~100-150 KB

Both are small and won't significantly impact your project size.

## License Information

- **Noto Sans Khmer**: Open Font License (OFL) - Free for commercial use
- **KhmerOS**: GPL - Free for commercial use

Both fonts are free and safe to use in your pharmacy POS system.

## Need Help?

If you're still having issues:
1. Check the file paths are correct
2. Verify file permissions (files should be readable)
3. Check browser console for specific error messages
4. Try using only one font first (NotoSansKhmer-Regular.ttf)

---

**Quick Download Links:**

📥 **Primary Font (Recommended):**
https://github.com/notofonts/khmer/raw/main/fonts/NotoSansKhmer/full/ttf/NotoSansKhmer-Regular.ttf

📥 **Fallback Font (Optional):**
https://github.com/khmertype/KhmerOS/raw/master/fonts/KhmerOS.ttf

Save both to: `public/fonts/`
