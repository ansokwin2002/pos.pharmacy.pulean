# PDF After/Before Meal Columns Added

## Summary
Added "After Meal" and "Before Meal" columns to the prescription table in the PDF to show when medications should be taken.

## Changes Made

### 1. Updated Table Headers
**Before:**
```typescript
["No.", "Medication", "Morning", "Afternoon", "Evening", "Night", "Period", "QTY", "Price"]
```

**After:**
```typescript
["No.", "Medication", "Morning", "Afternoon", "Evening", "Night", "Period", "QTY", "After Meal", "Before Meal", "Price"]
```

### 2. Updated Table Body Data
**Before:**
```typescript
[
  i + 1,
  p.name,
  p.morning || "",
  p.afternoon || "",
  p.evening || "",
  p.night || "",
  p.period || "",
  p.qty || "",
  p.price ? `$${p.price.toFixed(2)}` : ""
]
```

**After:**
```typescript
[
  i + 1,
  p.name,
  p.morning || "",
  p.afternoon || "",
  p.evening || "",
  p.night || "",
  p.period || "",
  p.qty || "",
  p.afterMeal ? "Yes" : "No",      // ✅ New column
  p.beforeMeal ? "Yes" : "No",     // ✅ New column
  p.price ? `$${p.price.toFixed(2)}` : ""
]
```

### 3. Updated Empty Row Padding
**Before:**
```typescript
while (body.length < 10) body.push(["", "", "", "", "", "", "", "", ""]);  // 9 columns
```

**After:**
```typescript
while (body.length < 10) body.push(["", "", "", "", "", "", "", "", "", "", ""]);  // 11 columns
```

### 4. Updated Column Styles
**Before:**
```typescript
columnStyles: {
  0: { halign: "center" },
  1: { },
  2: { halign: "center" },
  3: { halign: "center" },
  4: { halign: "center" },
  5: { halign: "center" },
  6: { halign: "center" },
  7: { halign: "center" },
  8: { halign: "right" }  // Price (was column 8)
}
```

**After:**
```typescript
columnStyles: {
  0: { halign: "center" },
  1: { },
  2: { halign: "center" },
  3: { halign: "center" },
  4: { halign: "center" },
  5: { halign: "center" },
  6: { halign: "center" },
  7: { halign: "center" },
  8: { halign: "center" },  // After Meal ✅
  9: { halign: "center" },  // Before Meal ✅
  10: { halign: "right" }   // Price (now column 10)
}
```

## Table Structure

### Complete Column Layout:

| Index | Column | Alignment | Data | Example |
|-------|--------|-----------|------|---------|
| 0 | No. | Center | Row number | 1, 2, 3... |
| 1 | Medication | Left | Drug name | Paracetamol 500mg |
| 2 | Morning | Center | Morning dose | 1 |
| 3 | Afternoon | Center | Afternoon dose | 1 |
| 4 | Evening | Center | Evening dose | 1 |
| 5 | Night | Center | Night dose | 0 |
| 6 | Period | Center | Number of days | 5 |
| 7 | QTY | Center | Total quantity | 15 |
| 8 | **After Meal** | Center | Yes/No | **Yes** |
| 9 | **Before Meal** | Center | Yes/No | **No** |
| 10 | Price | Right | Unit price | $0.50 |

## Visual Example

### PDF Table Output:
```
┌────┬────────────────────┬─────────┬───────────┬─────────┬───────┬────────┬─────┬────────────┬─────────────┬────────┐
│ No.│ Medication         │ Morning │ Afternoon │ Evening │ Night │ Period │ QTY │ After Meal │ Before Meal │  Price │
├────┼────────────────────┼─────────┼───────────┼─────────┼───────┼────────┼─────┼────────────┼─────────────┼────────┤
│ 1  │ Paracetamol 500mg  │    1    │     1     │    1    │   0   │   5    │ 15  │    Yes     │     No      │  $0.50 │
│ 2  │ Amoxicillin 250mg  │    1    │     0     │    1    │   0   │   7    │ 14  │    No      │     Yes     │  $1.25 │
│ 3  │ Ibuprofen 400mg    │    0    │     1     │    1    │   1   │   3    │  9  │    Yes     │     No      │  $0.75 │
└────┴────────────────────┴─────────┴───────────┴─────────┴───────┴────────┴─────┴────────────┴─────────────┴────────┘

                                                                                    Total Amount: $32.50
```

## Data Logic

### After Meal Column:
```typescript
p.afterMeal ? "Yes" : "No"
```

- If `afterMeal` is `true` → Shows "Yes"
- If `afterMeal` is `false` or `undefined` → Shows "No"

### Before Meal Column:
```typescript
p.beforeMeal ? "Yes" : "No"
```

- If `beforeMeal` is `true` → Shows "Yes"
- If `beforeMeal` is `false` or `undefined` → Shows "No"

## Example Data

### Sample Prescription:
```javascript
{
  name: "Paracetamol 500mg",
  morning: 1,
  afternoon: 1,
  evening: 1,
  night: 0,
  period: "5",
  qty: 15,
  afterMeal: true,   // ← Shows "Yes" in After Meal column
  beforeMeal: false, // ← Shows "No" in Before Meal column
  price: 0.50
}
```

### PDF Output:
```
| 1 | Paracetamol 500mg | 1 | 1 | 1 | 0 | 5 | 15 | Yes | No | $0.50 |
```

## Use Cases

### 1. Take After Meals:
```javascript
{ afterMeal: true, beforeMeal: false }
```
**PDF Shows:** After Meal: Yes, Before Meal: No

### 2. Take Before Meals:
```javascript
{ afterMeal: false, beforeMeal: true }
```
**PDF Shows:** After Meal: No, Before Meal: Yes

### 3. No Meal Timing Specified:
```javascript
{ afterMeal: false, beforeMeal: false }
```
**PDF Shows:** After Meal: No, Before Meal: No

### 4. Both Selected (Edge Case):
```javascript
{ afterMeal: true, beforeMeal: true }
```
**PDF Shows:** After Meal: Yes, Before Meal: Yes
*(Note: This shouldn't happen in normal use, but the PDF will display it)*

## Benefits

1. ✅ **Clear Instructions**: Patients know when to take medications
2. ✅ **Medical Compliance**: Helps patients follow doctor's orders
3. ✅ **Professional**: Standard medical prescription format
4. ✅ **Complete Information**: All dosing details in one place
5. ✅ **Easy to Read**: Simple Yes/No format

## Alignment

- **After Meal**: Center-aligned (easy to scan)
- **Before Meal**: Center-aligned (consistent with other columns)
- **Yes/No**: Short text, centered for clarity

## Files Modified

- `src/app/(default)/opd/register/ClientPage.tsx`
  - Line 695: Added "After Meal" and "Before Meal" to headers
  - Lines 705-706: Added afterMeal and beforeMeal data
  - Line 709: Updated empty row padding (11 columns)
  - Lines 738-740: Added column styles for columns 8, 9, and updated 10

## Testing

### Test Case 1: After Meal Only
```javascript
Input: { afterMeal: true, beforeMeal: false }
Expected: After Meal: Yes, Before Meal: No
```

### Test Case 2: Before Meal Only
```javascript
Input: { afterMeal: false, beforeMeal: true }
Expected: After Meal: No, Before Meal: Yes
```

### Test Case 3: Neither
```javascript
Input: { afterMeal: false, beforeMeal: false }
Expected: After Meal: No, Before Meal: No
```

### Test Case 4: Missing Data
```javascript
Input: { }  // No afterMeal or beforeMeal properties
Expected: After Meal: No, Before Meal: No
```

## Visual Comparison

### Before:
```
| No. | Medication  | ... | QTY | Price |
|-----|-------------|-----|-----|-------|
| 1   | Drug A      | ... | 15  | $0.50 |
```
❌ No meal timing information

### After:
```
| No. | Medication  | ... | QTY | After Meal | Before Meal | Price |
|-----|-------------|-----|-----|------------|-------------|-------|
| 1   | Drug A      | ... | 15  |    Yes     |     No      | $0.50 |
```
✅ Clear meal timing instructions

---

**Your PDF now includes complete medication timing instructions!** 💊
