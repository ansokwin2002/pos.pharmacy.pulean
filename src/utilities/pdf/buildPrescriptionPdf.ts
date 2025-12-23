import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PrescriptionData {
      patient?: {
        name?: string;
        age?: number | string;
        gender?: string;
        address?: string;
        signs_of_life?: string;
        symptom?: string;
        diagnosis?: string;
        pe?: string; // Added PE field
      };  patient_info?: {
    name?: string;
    age?: number | string;
    gender?: string;
    address?: string;
    signs_of_life?: string;
    symptom?: string;
    diagnosis?: string;
  };
  prescriptions?: any[];
  prescription?: any[];
  totalAmount?: number;
  total?: number;
}

/**
 * Builds a prescription PDF with consistent styling
 * @param data - The prescription data
 * @param recordCreatedAt - The date the prescription was created
 * @returns Object containing the jsPDF document and suggested filename
 */
export async function buildPrescriptionPdf(
  data: PrescriptionData,
  recordCreatedAt: string
): Promise<{ doc: jsPDF; fileName: string }> {
  // Support both data formats
  const patientInfo = data.patient || data.patient_info;
  const prescriptions = data.prescriptions || data.prescription || [];
  const totalAmount = data.totalAmount ?? data.total ?? 0;

  const pdfData = {
    patient: patientInfo,
    prescriptions: prescriptions,
    totalAmount: totalAmount
  };

  const doc = new jsPDF({
    unit: "mm",
    format: "a4"
  });

  /* ----------------------------------------------------------
     LOAD KHMER FONT (still needed for names, districts, etc.)
  ----------------------------------------------------------- */
  let fontLoaded = false;
  let khmerFontName = "helvetica";

  console.log('🔤 Attempting to load Khmer fonts for PDF...');

  try {
    console.log('📥 Trying to load NotoSansKhmer-Regular.ttf...');
    const fontResponse = await fetch("/fonts/NotoSansKhmer-Regular.ttf");

    if (fontResponse.ok) {
      const fontArrayBuffer = await fontResponse.arrayBuffer();
      const uint8Array = new Uint8Array(fontArrayBuffer);
      let binaryString = "";
      uint8Array.forEach((byte) => (binaryString += String.fromCharCode(byte)));
      const base64Font = btoa(binaryString);

      doc.addFileToVFS("NotoSansKhmer-Regular.ttf", base64Font);
      doc.addFont("NotoSansKhmer-Regular.ttf", "NotoSansKhmer", "normal");
      doc.setFont("NotoSansKhmer");
      khmerFontName = "NotoSansKhmer";
      fontLoaded = true;
      console.log('✅ NotoSansKhmer font loaded successfully!');
    } else {
      console.warn('⚠️ NotoSansKhmer-Regular.ttf not found (status:', fontResponse.status, ')');
    }
  } catch (error) {
    console.warn('⚠️ Failed to load NotoSansKhmer-Regular.ttf:', error);
  }

  if (!fontLoaded) {
    try {
      console.log('📥 Trying to load KhmerOS.ttf as fallback...');
      const fontResponse = await fetch("/fonts/KhmerOS.ttf");

      if (fontResponse.ok) {
        const fontArrayBuffer = await fontResponse.arrayBuffer();
        const uint8Array = new Uint8Array(fontArrayBuffer);
        let binaryString = "";
        uint8Array.forEach((byte) => (binaryString += String.fromCharCode(byte)));
        const base64Font = btoa(binaryString);

        doc.addFileToVFS("KhmerOS.ttf", base64Font);
        doc.addFont("KhmerOS.ttf", "KhmerOS", "normal");
        doc.setFont("KhmerOS");
        khmerFontName = "KhmerOS";
        fontLoaded = true;
        console.log('✅ KhmerOS font loaded successfully!');
      } else {
        console.warn('⚠️ KhmerOS.ttf not found (status:', fontResponse.status, ')');
      }
    } catch (error) {
      console.warn('⚠️ Failed to load KhmerOS.ttf:', error);
    }
  }

  if (!fontLoaded) {
    console.error('❌ No Khmer fonts found! Using Helvetica fallback.');
    console.error('📖 Please download Khmer fonts. See: KHMER_FONT_SETUP.md');
    console.error('📥 Quick download: https://github.com/notofonts/khmer/raw/main/fonts/NotoSansKhmer/full/ttf/NotoSansKhmer-Regular.ttf');
    doc.setFont("helvetica", "normal");
  }

  /* ----------------------------------------------------------
     BASE SETTINGS
  ----------------------------------------------------------- */
  const now = new Date(recordCreatedAt);
  const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${now.getFullYear()}`;

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  /* ----------------------------------------------------------
     HEADER (Correct drawing order for cross)
  ----------------------------------------------------------- */

  // Blue block
  doc.setFillColor(11, 59, 145);
  doc.rect(15, 10, 35, 16, "F");

  // Red block (draw BEFORE the cross!)
  doc.setFillColor(210, 0, 0);
  doc.rect(50, 10, 15, 16, "F");

  // White cross (now visible on red box)
  doc.setFillColor(255, 255, 255);

  // vertical bar
  doc.rect(57, 13, 4, 10, "F");

  // horizontal bar
  doc.rect(54, 17, 10, 4, "F");

  // Blue text "SOKLEAN"
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("SOKLEAN", 33, 20, { align: "center" });

  // Center header text
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text("SOKLEAN", pageWidth / 2 + 10, 15, { align: "center" });

  doc.setFontSize(10);
  doc.text("CABINET MEDICAL", pageWidth / 2 + 10, 20, { align: "center" });

  doc.setFontSize(12);
  doc.text("HEALTH & MEDICAL CLINIC", pageWidth / 2 + 10, 25, { align: "center" });

  // Underline
  doc.setLineWidth(0.4);
  doc.line(pageWidth / 2 - 25, 27, pageWidth / 2 + 25, 27);

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Prescription", pageWidth / 2, 37, { align: "center" });
  doc.line(pageWidth / 2 - 20, 38, pageWidth / 2 + 20, 38);

  // Back to Khmer font for content
  doc.setFont(khmerFontName);

  /* ----------------------------------------------------------
     PATIENT INFO (English labels)
  ----------------------------------------------------------- */
  let y = 50;

  doc.setFontSize(12);
  doc.text("Patient:", margin, y);
  doc.text(pdfData.patient?.name || "N/A", margin + 25, y);

  doc.text("Gender:", pageWidth - 80, y);
  doc.text(pdfData.patient?.gender || "N/A", pageWidth - 58, y);

  y += 7;
  doc.text("Age:", margin, y);
  doc.text(String(pdfData.patient?.age || "N/A"), margin + 20, y);

  doc.text("District:", pageWidth - 80, y);
  doc.text(pdfData.patient?.address || "N/A", pageWidth - 58, y);

  y += 7;
  doc.text(`Vital Signs:  ${pdfData.patient?.signs_of_life || "N/A"}`, margin, y);

  y += 7;
  doc.text(`Symptoms: ${pdfData.patient?.symptom || "N/A"}`, margin, y);

  y += 7;
  doc.text(`Diagnosis: ${pdfData.patient?.diagnosis || "N/A"}`, margin, y);

  y += 7; // Add new line for PE
  doc.text(`PE: ${pdfData.patient?.pe || "N/A"}`, margin, y);

  y += 5;
  doc.line(margin, y, pageWidth - margin, y);

  /* ----------------------------------------------------------
     TABLE (English headers, same layout)
  ----------------------------------------------------------- */
  y += 5;

  const head = [
    ["No.", "Medication", "Morning", "Afternoon", "Evening", "Night", "Period", "QTY", "After Meal", "Before Meal", "Price"]
  ];

  const body = (pdfData.prescriptions || []).map((p: any, i: number) => {
    const price = Number(p.price) || 0; // Ensure price is a number
    const qty = Number(p.qty) || 0; // Ensure qty is a number
    return [
      i + 1,
      p.name,
      p.morning || "",
      p.afternoon || "",
      p.evening || "",
      p.night || "",
      p.period || "",
      qty || "", // Display numeric qty
      p.afterMeal ? "Yes" : "No",
      p.beforeMeal ? "Yes" : "No",
      `$${price.toFixed(2)}` // Use numeric price
    ];
  });

  while (body.length < 10) body.push(["", "", "", "", "", "", "", "", "", "", ""]);

  autoTable(doc, {
    startY: y,
    head: head,
    body: body,
    tableWidth: doc.internal.pageSize.getWidth() - (margin * 2),
    styles: {
      font: khmerFontName,
      fontSize: 10,
      cellPadding: 2,
      lineWidth: 0.3,
      lineColor: [0, 0, 0]
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      halign: "center",
      fontStyle: "bold"
    },
    columnStyles: {
      0: { halign: "center" },
      1: {},
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "center" },
      5: { halign: "center" },
      6: { halign: "center" },
      7: { halign: "center" },
      8: { halign: "center" },
      9: { halign: "center" },
      10: { halign: "right" }
    }
  });

  // Calculate and display grand total
  const grandTotal = (pdfData.prescriptions || []).reduce((sum: number, p: any) => {
    const price = Number(p.price) || 0; // Ensure price is a number
    const qty = Number(p.qty) || 0; // Ensure qty is a number
    return sum + (price * qty);
  }, 0);

  let afterTable = (doc as any).lastAutoTable.finalY + 8;

  // Draw a box around the total amount for emphasis
  const boxX = pageWidth - 95;
  const boxY = afterTable - 5;
  const boxWidth = 80;
  const boxHeight = 12;

  doc.setFillColor(240, 240, 240); // Light gray background
  doc.rect(boxX, boxY, boxWidth, boxHeight, "F");
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(boxX, boxY, boxWidth, boxHeight, "S");

  // Add total amount text
  doc.setFontSize(14);
  doc.setFont(khmerFontName, "bold");
  doc.text("Total Amount:", boxX + 3, afterTable + 2);
  doc.text(`$${grandTotal.toFixed(2)}`, pageWidth - margin - 3, afterTable + 2, { align: "right" });
  doc.setFont(khmerFontName, "normal");

  afterTable = afterTable + 15;

  doc.setFontSize(10);
  doc.text("Note: Please follow your doctor's instructions d.", margin, afterTable);

  /* ----------------------------------------------------------
     FOOTER (English)
  ----------------------------------------------------------- */
  const footerY = doc.internal.pageSize.height - 20;

  doc.text(
    "No. St. 7  PHUM KREK TBONG, KHOM KREK, PONHEA KREK, CAMBODIA.",
    margin,
    footerY
  );
  doc.text(`DATE: ${dateStr}`, pageWidth - 60, footerY);

  doc.text("TEL: 010511178", margin, footerY + 6);
  doc.text("Dr. IM SOKLEAN", pageWidth - 60, footerY + 6);

  /* ----------------------------------------------------------
     FINISH
  ----------------------------------------------------------- */
  const fileName = `prescription-${(patientInfo?.name || 'patient').replace(/\s/g, '_')}-${dateStr.replace(/\//g, "")}.pdf`;

  return { doc, fileName };
}
