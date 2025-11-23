# Khmer Font for PDF Generation

## Required Font

To display Khmer text correctly in PDF prescriptions, you need to add the **KhmerOS.ttf** font file to this directory.

## How to Get the Font

### Option 1: Download from Google Fonts
1. Visit: https://fonts.google.com/specimen/Khmer
2. Download the font family
3. Extract the .ttf file
4. Rename it to `KhmerOS.ttf`
5. Place it in this `public/fonts/` directory

### Option 2: Download KhmerOS Font
1. Visit: https://sourceforge.net/projects/khmer/files/Fonts/
2. Download KhmerOS font package
3. Extract `KhmerOS.ttf`
4. Place it in this `public/fonts/` directory

### Option 3: Use Noto Sans Khmer
1. Visit: https://fonts.google.com/noto/specimen/Noto+Sans+Khmer
2. Download the font
3. Rename the .ttf file to `KhmerOS.ttf`
4. Place it in this `public/fonts/` directory

## File Location

The font file should be located at:
```
public/fonts/KhmerOS.ttf
```

## Verification

After adding the font:
1. Restart your development server
2. Generate a PDF prescription
3. Khmer text should display correctly

## Fallback

If the font is not found, the system will automatically fall back to Helvetica font.
