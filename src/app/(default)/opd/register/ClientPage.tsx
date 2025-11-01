'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Flex, Button, TextField, Text, Select, Card, TextArea, Table, Switch, IconButton, Dialog, Tabs } from "@radix-ui/themes";
import { PageHeading } from '@/components/common/PageHeading';
// PDF generation libs will be loaded dynamically in the browser to avoid SSR issues
import { Plus, User, Pill, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPatientPage() {
  // Existing patient selection (fake dataset)
  type Patient = {
    id: string;
    name: string;
    gender: 'male' | 'female';
    age: number;
    telephone: string;
    address: string;
    signOfLife: 'BP' | 'P' | 'T' | 'RR';
    symptom: string;
    diagnosis: string;
  };

  const fakePatients: Patient[] = Array.from({ length: 20 }).map((_, i) => {
    const id = `P${String(i + 1).padStart(3, '0')}`;
    const male = i % 2 === 0;
    const names = male ? ['Sophea', 'Vannak', 'Rith', 'Borey', 'Dara', 'Sokchea'] : ['Sokha', 'Chantha', 'Sreymom', 'Leakena', 'Malika', 'Rachana'];
    const name = `${names[i % names.length]} ${male ? 'Chan' : 'Kim'}`;
    const age = 18 + (i % 50);
    const telephone = `0975${String(111111 + i * 123).slice(0, 6)}`;
    const address = `Street ${100 + i}, Phnom Penh`;
    const sol: Patient['signOfLife'][] = ['BP', 'P', 'T', 'RR'];
    const signOfLife = sol[i % sol.length];
    const symptom = ['Headache', 'Cough', 'Fever', 'Stomach ache'][i % 4];
    const diagnosis = ['Migraine', 'Flu', 'Common cold', 'Gastritis'][i % 4];
    return { id, name, gender: male ? 'male' : 'female', age, telephone, address, signOfLife, symptom, diagnosis };
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [age, setAge] = useState<string>('');
  const [telephone, setTelephone] = useState('');
  const [address, setAddress] = useState('');
  const [signOfLife, setSignOfLife] = useState<'BP' | 'P' | 'T' | 'RR' | ''>('');
  const [symptom, setSymptom] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

  // Prescription entries
  type Presc = {
    id: string;
    name: string;
    price: number;
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
    period: string; // e.g., 5 days
    qty: number;
    afterMeal: boolean;
    beforeMeal: boolean;
  };

  const [prescriptions, setPrescriptions] = useState<Presc[]>([]);

  // Tab management
  const [currentTab, setCurrentTab] = useState<'patient-info' | 'prescription' | 'complete'>('patient-info');
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(() => new Set());

  // Get search params for secure patient ID lookup
  const searchParams = useSearchParams();

  // Extract patient ID from URL parameters (secure approach)
  const patientIdParam = searchParams.get('id');

  // Find patient by ID for secure auto-fill
  const selectedPatient = patientIdParam ? fakePatients.find(p => p.id === patientIdParam) : null;

  // Auto-fill form when patient ID is provided (secure approach)
  useEffect(() => {
    if (selectedPatient && patientIdParam) {
      // React 18 automatically batches these state updates
      setName(selectedPatient.name);
      setGender(selectedPatient.gender);
      setAge(String(selectedPatient.age));

      // Ensure telephone meets validation requirements (8-12 digits)
      let validTelephone = selectedPatient.telephone;
      if (validTelephone && /^\d+$/.test(validTelephone)) {
        // Pad with leading zeros if too short, truncate if too long
        if (validTelephone.length < 8) {
          validTelephone = validTelephone.padStart(8, '0');
        } else if (validTelephone.length > 12) {
          validTelephone = validTelephone.slice(0, 12);
        }
      }
      setTelephone(validTelephone);

      setAddress(selectedPatient.address);
      setSignOfLife(selectedPatient.signOfLife);
      setSymptom(selectedPatient.symptom);
      setDiagnosis(selectedPatient.diagnosis);
      setErrors({});
    }
  }, [selectedPatient, patientIdParam]);

  // Form validation state
  const [errors, setErrors] = useState<{ 
    name?: string;
    gender?: string;
    age?: string;
    telephone?: string;
    address?: string;
    signOfLife?: string;
    symptom?: string;
    diagnosis?: string;
  }>({});

  const validatePatientInfo = useCallback(() => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!gender) e.gender = 'Gender is required';
    const ageNum = Number(age);
    if (!age || isNaN(ageNum) || ageNum <= 0) e.age = 'Age must be greater than 0';
    if (!telephone.trim()) e.telephone = 'Telephone is required';
    else if (!/^\d{8,12}$/.test(telephone.trim())) e.telephone = 'Telephone must be 8–12 digits';
    if (!address.trim()) e.address = 'Address is required';
    if (!signOfLife) e.signOfLife = 'Please select a sign of life';
    if (!symptom.trim()) e.symptom = 'Symptom is required';
    if (!diagnosis.trim()) e.diagnosis = 'Diagnosis is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [name, gender, age, telephone, address, signOfLife, symptom, diagnosis]);

  // Memoized validation result for use in render (without side effects)
  const isPatientInfoValid = useMemo(() => {
    if (!name.trim()) return false;
    if (!gender) return false;
    const ageNum = Number(age);
    if (!age || isNaN(ageNum) || ageNum <= 0) return false;
    if (!telephone.trim()) return false;
    if (!/^\d{8,12}$/.test(telephone.trim())) return false;
    if (!address.trim()) return false;
    if (!signOfLife) return false;
    if (!symptom.trim()) return false;
    if (!diagnosis.trim()) return false;
    return true;
  }, [name, gender, age, telephone, address, signOfLife, symptom, diagnosis]);

  const validateAll = () => {
    return validatePatientInfo();
  };

  // Tab navigation functions
  const canProceedToTab = useCallback((tabId: string): boolean => {
    switch (tabId) {
      case 'patient-info':
        return true;
      case 'prescription':
        return isPatientInfoValid;
      case 'complete':
        return isPatientInfoValid && prescriptions.length > 0;
      default:
        return false;
    }
  }, [isPatientInfoValid, prescriptions.length]);

  const handleTabChange = useCallback((tabId: string) => {
    if (canProceedToTab(tabId)) {
      setCurrentTab(tabId as 'patient-info' | 'prescription' | 'complete');

      // Mark previous tabs as completed
      if (tabId === 'prescription' && isPatientInfoValid) {
        setCompletedTabs(prev => new Set([...prev, 'patient-info']));
      } else if (tabId === 'complete' && isPatientInfoValid && prescriptions.length > 0) {
        setCompletedTabs(prev => new Set([...prev, 'patient-info', 'prescription']));
      }
    } else {
      // Show validation errors
      if (tabId === 'prescription') {
        validatePatientInfo();
        toast.error('Please complete patient information first');
      } else if (tabId === 'complete') {
        if (!isPatientInfoValid) {
          validatePatientInfo();
          toast.error('Please complete patient information first');
        } else if (prescriptions.length === 0) {
          toast.error('Please add at least one prescription');
        }
      }
    }
  }, [canProceedToTab, isPatientInfoValid, prescriptions.length, validatePatientInfo]);

  const proceedToNextTab = useCallback(() => {
    if (currentTab === 'patient-info' && isPatientInfoValid) {
      // Call validatePatientInfo to set errors state, but we already know it's valid
      validatePatientInfo();
      setCompletedTabs(prev => new Set([...prev, 'patient-info']));
      handleTabChange('prescription');
      toast.success('Patient information completed!');
    } else if (currentTab === 'prescription' && prescriptions.length > 0) {
      setCompletedTabs(prev => new Set([...prev, 'patient-info', 'prescription']));
      handleTabChange('complete');
      toast.success('Prescription completed!');
    }
  }, [currentTab, isPatientInfoValid, prescriptions.length, validatePatientInfo, handleTabChange]);

  // Fake drugs dataset
  const baseDrugOptions = [
    { id: 'D001', name: 'Paracetamol 500mg', price: 1.00 },
    { id: 'D002', name: 'Amoxicillin 500mg', price: 2.50 },
    { id: 'D003', name: 'Ibuprofen 200mg', price: 1.20 },
    { id: 'D004', name: 'Metformin 500mg', price: 3.10 },
    { id: 'D005', name: 'Amlodipine 5mg', price: 2.20 },
    { id: 'D006', name: 'Losartan 50mg', price: 2.80 },
    { id: 'D007', name: 'Omeprazole 20mg', price: 1.90 },
    { id: 'D008', name: 'Cetirizine 10mg', price: 0.90 },
    { id: 'D009', name: 'Azithromycin 500mg', price: 4.50 },
    { id: 'D010', name: 'Atorvastatin 10mg', price: 3.80 },
    { id: 'D011', name: 'Diclofenac 50mg', price: 1.70 },
    { id: 'D012', name: 'Doxycycline 100mg', price: 2.60 },
    { id: 'D013', name: 'Ciprofloxacin 500mg', price: 3.40 },
    { id: 'D014', name: 'Loratadine 10mg', price: 1.10 },
    { id: 'D015', name: 'Pantoprazole 40mg', price: 2.00 },
    { id: 'D016', name: 'Vitamin C 500mg', price: 0.80 },
    { id: 'D017', name: 'Calcium 600mg', price: 2.10 },
    { id: 'D018', name: 'Ferrous Sulfate 325mg', price: 1.50 },
    { id: 'D019', name: 'Metoprolol 50mg', price: 2.70 },
    { id: 'D020', name: 'Clopidogrel 75mg', price: 3.20 },
  ];

  const [selectedDrugId, setSelectedDrugId] = useState<string>('');

  // Manual drug dialog state
  const [isManualDrugOpen, setManualDrugOpen] = useState(false);
  const [manualDrugName, setManualDrugName] = useState('');
  const [manualDrugPrice, setManualDrugPrice] = useState<string>('');
  const [manualErrors, setManualErrors] = useState<{ name?: string; price?: string }>({});
  const [customDrugs, setCustomDrugs] = useState<{ id: string; name: string; price: number }[]>([]);

  // Prescription form validation (drug select)
  const [prescErrors, setPrescErrors] = useState<{ drug?: string; meal?: string }>({});

  const allDrugOptions = useMemo(() => [...customDrugs, ...baseDrugOptions], [customDrugs]);

  const addManualDrug = () => {
    const name = manualDrugName.trim();
    const priceNum = Number(manualDrugPrice);
    const errs: { name?: string; price?: string } = {};
    if (!name) errs.name = 'Drug name is required';
    if (!manualDrugPrice || isNaN(priceNum) || priceNum <= 0) errs.price = 'Price must be greater than 0';
    setManualErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const tempId = `MD-${Date.now()}`;
    const newDrug = { id: tempId, name: `${name} (manual)`, price: priceNum };
    setCustomDrugs(prev => [newDrug, ...prev]);
    setSelectedDrugId(tempId);
    setManualDrugName('');
    setManualDrugPrice('');
    setManualErrors({});
    setManualDrugOpen(false);
  };


  // Dosing & quantity
  const [doseMorning, setDoseMorning] = useState<string>('0');
  const [doseAfternoon, setDoseAfternoon] = useState<string>('0');
  const [doseEvening, setDoseEvening] = useState<string>('0');
  const [doseNight, setDoseNight] = useState<string>('0');
  const [period, setPeriod] = useState<string>('');
  const [qty, setQty] = useState<string>('');

  // Recompute QTY whenever any dose or period changes to avoid stale state issues
  useEffect(() => {
    const m = Number(doseMorning) || 0;
    const a = Number(doseAfternoon) || 0;
    const e = Number(doseEvening) || 0;
    const n = Number(doseNight) || 0;
    const p = Number(period) || 0;
    const totalPerDay = m + a + e + n;
    const total = totalPerDay * p;
    setQty(String(total));
  }, [doseMorning, doseAfternoon, doseEvening, doseNight, period]);

  const [afterMeal, setAfterMeal] = useState<boolean>(false);
  const [beforeMeal, setBeforeMeal] = useState<boolean>(false);

  // Show export actions only after successful save
  const [hasSaved, setHasSaved] = useState(false);

  const addDrugToTable = () => {
    // Validate required Drug selection
    const d = allDrugOptions.find(x => x.id === selectedDrugId);
    if (!d) {
      setPrescErrors(prev => ({ ...prev, drug: 'Drug is required' }));
      return;
    }
    // Require at least one meal selection
    if (!afterMeal && !beforeMeal) {
      setPrescErrors(prev => ({ ...prev, meal: 'Please choose After Meal or Before Meal' }));
      return;
    }
    setPrescErrors({});
    const entry: Presc = {
      id: d.id,
      name: d.name,
      price: d.price,
      morning: Number(doseMorning) || 0,
      afternoon: Number(doseAfternoon) || 0,
      evening: Number(doseEvening) || 0,
      night: Number(doseNight) || 0,
      period: period || '',
      qty: Number(qty) || 0,
      afterMeal,
      beforeMeal,
    };
    setPrescriptions(prev => [...prev, entry]);

    // reset inputs
    setSelectedDrugId('');
    setDoseMorning('0');
    setDoseAfternoon('0');
    setDoseEvening('0');
    setDoseNight('0');
    setPeriod('');
    setQty('');
    setAfterMeal(false);
    setBeforeMeal(false);
  };

  // Build PDF document and return { doc, fileName }
 
// Build PDF document and return { doc, fileName }
 
  const buildPdf = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();

    // Register Khmer font dynamically from public folder
    const registerKhmerFonts = async () => {
      async function fetchAsBase64(url: string): Promise<string> {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load font: ${url}`);
        const blob = await res.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(((reader.result || '') as string).split(',')[1] || '');
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
      try {
        const regularBase64 = await fetchAsBase64('/fonts/khmer/NotoSansKhmer-Regular.ttf');
        (doc as any).addFileToVFS('NotoSansKhmer-Regular.ttf', regularBase64);
        (doc as any).addFont('NotoSansKhmer-Regular.ttf', 'NotoSansKhmer', 'normal');
      } catch (e) {
        console.warn('Khmer Regular font not found, Khmer may not render correctly', e);
      }
      try {
        const boldBase64 = await fetchAsBase64('/fonts/khmer/NotoSansKhmer-Bold.ttf');
        (doc as any).addFileToVFS('NotoSansKhmer-Bold.ttf', boldBase64);
        (doc as any).addFont('NotoSansKhmer-Bold.ttf', 'NotoSansKhmer', 'bold');
      } catch {
        // Bold is optional; fallback to normal
      }
      try { doc.setFont('NotoSansKhmer', 'normal'); } catch {}
    };
    await registerKhmerFonts();

    const now = new Date();
    const fileName = `prescription-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}.pdf`;

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // === HEADER SECTION ===
    let currentY = 20;

    // Try to load logo
    try {
      const res = await fetch('/images/invoice/logo.png');
      if (res.ok) {
        const blob = await res.blob();
        const reader = new FileReader();
        const dataUrl: string = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        doc.addImage(dataUrl, 'PNG', margin, 15, 30, 12);
      }
    } catch (e) {
      console.warn('Failed to load logo for PDF header', e);
    }

    // Pharmacy name and title
    doc.setTextColor(0, 102, 204); // Professional blue
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PUNLEUKREK PHARMACY', pageWidth / 2, currentY, { align: 'center' });

    currentY += 8;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Medical Prescription / បង្កាន់ដៃថ្នាំ', pageWidth / 2, currentY, { align: 'center' });

    // Date and prescription number
    currentY += 15;
    const dateStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
    const prescriptionNo = `RX-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${dateStr}`, pageWidth - margin, currentY, { align: 'right' });
    doc.text(`Prescription No: ${prescriptionNo}`, pageWidth - margin, currentY + 5, { align: 'right' });

    // === PATIENT INFORMATION SECTION ===
    currentY += 15;

    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('PATIENT INFORMATION', margin, currentY);

    // Underline
    currentY += 2;
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, margin + 60, currentY);

    currentY += 10;

    // Patient info in a clean grid layout
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const leftCol = margin;
    const rightCol = pageWidth / 2 + 10;
    const lineHeight = 8;

    // Left column
    doc.setFont('helvetica', 'bold');
    doc.text('Name:', leftCol, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(name || '-', leftCol + 20, currentY);

    doc.setFont('helvetica', 'bold');
    doc.text('Gender:', rightCol, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(gender || '-', rightCol + 20, currentY);

    currentY += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Age:', leftCol, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(age || '-', leftCol + 20, currentY);

    doc.setFont('helvetica', 'bold');
    doc.text('Phone:', rightCol, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(telephone || '-', rightCol + 20, currentY);

    currentY += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Address:', leftCol, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(address || '-', leftCol + 20, currentY);

    currentY += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Vital Signs:', leftCol, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${signOfLife || '-'}`, leftCol + 30, currentY);

    currentY += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Symptoms:', leftCol, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(symptom || '-', leftCol + 25, currentY);

    currentY += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnosis:', leftCol, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(diagnosis || '-', leftCol + 25, currentY);

    // === PRESCRIPTION SECTION ===
    currentY += 20;

    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text('PRESCRIPTION DETAILS', margin, currentY);

    // Underline
    currentY += 2;
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, margin + 70, currentY);

    currentY += 10;

    // Simplified table headers - focus on essential information
    const head = [['No.', 'Medication', 'Morning', 'Afternoon', 'Evening', 'Night', 'Duration', 'Qty', 'Price', 'Total']];
    const body = prescriptions.map((p, idx) => {
      // Add meal timing info to medication name if specified
      let medicationName = p.name;
      const mealTiming = [];
      if (p.beforeMeal) mealTiming.push('Before meal');
      if (p.afterMeal) mealTiming.push('After meal');
      if (mealTiming.length > 0) {
        medicationName += `\n(${mealTiming.join(', ')})`;
      }

      return [
        idx + 1,
        medicationName,
        p.morning || '-',
        p.afternoon || '-',
        p.evening || '-',
        p.night || '-',
        p.period ? `${p.period} days` : '-',
        p.qty || '-',
        `$${p.price.toFixed(2)}`,
        `$${(p.price * p.qty).toFixed(2)}`,
      ];
    });

    // Add minimum empty rows for consistent layout
    while (body.length < 5) {
      body.push(['', '', '', '', '', '', '', '', '', '']);
    }

    const totalAmount = prescriptions.reduce((sum, p) => sum + (p.price * p.qty), 0);

    // Generate clean table
    // @ts-ignore
    autoTable(doc, {
      head,
      body,
      startY: currentY,
      margin: { left: margin, right: margin },
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
        lineColor: [220, 220, 220],
        lineWidth: 0.3,
        halign: 'center',
        valign: 'middle',
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [0, 102, 204],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        minCellHeight: 12,
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        minCellHeight: 10,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },  // No.
        1: { cellWidth: 45, halign: 'left' },    // Medication
        2: { cellWidth: 18, halign: 'center' },  // Morning
        3: { cellWidth: 18, halign: 'center' },  // Afternoon
        4: { cellWidth: 18, halign: 'center' },  // Evening
        5: { cellWidth: 18, halign: 'center' },  // Night
        6: { cellWidth: 20, halign: 'center' },  // Duration
        7: { cellWidth: 15, halign: 'center' },  // Qty
        8: { cellWidth: 20, halign: 'right' },   // Price
        9: { cellWidth: 25, halign: 'right' },   // Total
      },
      theme: 'grid',
    });

    // === TOTAL SECTION ===
    const afterTableY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : currentY + 15;

    // Total amount box
    const totalBoxWidth = 60;
    const totalBoxHeight = 15;
    const totalBoxX = pageWidth - margin - totalBoxWidth;

    doc.setFillColor(0, 102, 204);
    doc.rect(totalBoxX, afterTableY, totalBoxWidth, totalBoxHeight, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: $${totalAmount.toFixed(2)}`, totalBoxX + totalBoxWidth/2, afterTableY + 10, { align: 'center' });

    // === INSTRUCTIONS SECTION ===
    const instructionsY = afterTableY + 30;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('INSTRUCTIONS:', margin, instructionsY);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('• Take medication exactly as prescribed', margin, instructionsY + 8);
    doc.text('• Complete the full course even if you feel better', margin, instructionsY + 16);
    doc.text('• Contact doctor if you experience any side effects', margin, instructionsY + 24);

    // === SIGNATURE SECTION ===
    const signatureY = pageHeight - 40;

    // Patient signature
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Patient Signature:', margin, signatureY);
    doc.setLineWidth(0.5);
    doc.setDrawColor(150, 150, 150);
    doc.line(margin + 35, signatureY + 2, margin + 100, signatureY + 2);

    // Date
    doc.text('Date:', margin, signatureY + 15);
    doc.line(margin + 15, signatureY + 17, margin + 60, signatureY + 17);

    // Doctor info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Dr. IM SOKLEAN', pageWidth - margin, signatureY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Licensed Pharmacist', pageWidth - margin, signatureY + 6, { align: 'right' });
    doc.text('Tel: 0975111789', pageWidth - margin, signatureY + 12, { align: 'right' });
    doc.text('PUNLEUKREK PHARMACY', pageWidth - margin, signatureY + 18, { align: 'right' });

    return { doc, fileName };
  };
  
  const downloadPdf = async () => {
    try {
      const { doc, fileName } = await buildPdf();
      doc.save(fileName);
      toast.success('Prescription PDF downloaded');
    } catch (e) {
      console.error(e);
      toast.error('Failed to download PDF');
    }
  };

  const previewPrintPdf = async () => {
    try {
      const { doc } = await buildPdf();
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const win = window.open(url);
      if (!win) {
        toast.error('Popup blocked. Allow popups to preview/print.');
        return;
      }
      // Give the browser a bit of time to load before printing
      const onLoad = () => {
        win.focus();
        win.print();
      };
      // Some browsers fire load on window, some on document
      win.addEventListener('load', onLoad);
      // Fallback: try printing after short delay
      setTimeout(() => {
        try { win.focus(); win.print(); } catch {}
      }, 800);
    } catch (e) {
      console.error(e);
      toast.error('Failed to preview/print PDF');
    }
  };

  const handleSubmit = async () => {
    const ok = validateAll();
    if (!ok) return;
    try {
      const { normalizePatientPayload } = await import('@/utilities/api/normalizePatient');
      const raw = {
        name,
        gender,
        age,
        telephone,
        address,
        signs_of_life: signOfLife,
        symptom,
        diagnosis,
      };
      const payload = normalizePatientPayload(raw);
      const { createPodPatient } = await import('@/utilities/api/podPatients');
      const saved = await createPodPatient(payload as any);
      setHasSaved(true);
      setCompletedTabs(prev => new Set([...prev, 'patient-info', 'prescription', 'complete']));
      toast.success('Patient saved successfully!');
      // Update selectedPatientId to new id if backend returns it
      if (saved?.id) setSelectedPatientId(String(saved.id));
    } catch (e: any) {
      console.error(e);
      if (e?.detail && typeof e.detail === 'object') {
        // Map backend validation errors if available
        const be = e.detail.errors || e.detail;
        const newErrs: any = {};
        if (be?.name) newErrs.name = String(be.name);
        if (be?.gender) newErrs.gender = String(be.gender);
        if (be?.age) newErrs.age = String(be.age);
        if (be?.telephone) newErrs.telephone = String(be.telephone);
        if (be?.address) newErrs.address = String(be.address);
        if (be?.signs_of_life) newErrs.signOfLife = String(be.signs_of_life);
        if (be?.symptom) newErrs.symptom = String(be.symptom);
        if (be?.diagnosis) newErrs.diagnosis = String(be.diagnosis);
        setErrors(newErrs);
      }
      toast.error('Failed to save patient');
    }
  };


  const isAutoFilled = selectedPatient !== null;

  // Progress calculation
  const getProgressPercentage = useCallback(() => {
    const steps = ['patient-info', 'prescription', 'complete'];
    const currentIndex = steps.indexOf(currentTab);
    const completedCount = Array.from(completedTabs).length;
    return Math.max(((currentIndex + 1) / steps.length) * 100, (completedCount / steps.length) * 100);
  }, [currentTab, completedTabs]);

  const getStepStatus = useCallback((step: string) => {
    if (completedTabs.has(step)) return 'completed';
    if (step === currentTab) return 'current';
    return 'pending';
  }, [completedTabs, currentTab]);

  return (
    <Box className="space-y-4 w-full px-4">
      <PageHeading
        title={isAutoFilled ? "Add New Patient (Auto-filled)" : "Add New Patient"}
        description={isAutoFilled ? "Patient information has been auto-filled. Review and modify as needed." : "Complete the patient registration process step by step."}
      />

      {/* Progress Indicator */}
      <Card>
        <Box p="3">
          <Flex justify="between" align="center" mb="2">
            <Text size="2" weight="bold">Progress</Text>
            <Text size="2" color="gray">{Math.round(getProgressPercentage())}% Complete</Text>
          </Flex>

          {/* Progress Bar */}
          <Box style={{ backgroundColor: 'var(--gray-3)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
            <Box
              style={{
                backgroundColor: 'var(--blue-9)',
                height: '100%',
                width: `${getProgressPercentage()}%`,
                transition: 'width 0.3s ease'
              }}
            />
          </Box>

          {/* Step Indicators */}
          <Flex justify="between" mt="3">
            <Flex align="center" gap="1">
              {getStepStatus('patient-info') === 'completed' ? (
                <CheckCircle size={16} color="green" />
              ) : getStepStatus('patient-info') === 'current' ? (
                <User size={16} color="blue" />
              ) : (
                <User size={16} color="gray" />
              )}
              <Text size="1" color={getStepStatus('patient-info') === 'pending' ? 'gray' : undefined}>
                Patient Info
              </Text>
            </Flex>

            <Flex align="center" gap="1">
              {getStepStatus('prescription') === 'completed' ? (
                <CheckCircle size={16} color="green" />
              ) : getStepStatus('prescription') === 'current' ? (
                <Pill size={16} color="blue" />
              ) : (
                <Pill size={16} color="gray" />
              )}
              <Text size="1" color={getStepStatus('prescription') === 'pending' ? 'gray' : undefined}>
                Prescription
              </Text>
            </Flex>

            <Flex align="center" gap="1">
              {getStepStatus('complete') === 'completed' ? (
                <CheckCircle size={16} color="green" />
              ) : getStepStatus('complete') === 'current' ? (
                <FileText size={16} color="blue" />
              ) : (
                <FileText size={16} color="gray" />
              )}
              <Text size="1" color={getStepStatus('complete') === 'pending' ? 'gray' : undefined}>
                Complete
              </Text>
            </Flex>
          </Flex>
        </Box>
      </Card>
      <Card style={{ width: '100%' }}>
        <Box p="4">
          {isAutoFilled && (
            <Box mb="4" p="3" style={{ backgroundColor: 'var(--blue-2)', borderRadius: '6px', border: '1px solid var(--blue-6)' }}>
              <Text size="2" style={{ color: 'var(--blue-11)' }}>
                ℹ️ Patient information has been auto-filled from the patient list. You can modify any field as needed.
              </Text>
            </Box>
          )}

          <Tabs.Root value={currentTab} onValueChange={handleTabChange}>
            <Tabs.List>
              <Tabs.Trigger value="patient-info">
                <Flex align="center" gap="2">
                  <User size={16} />
                  <Text>Patient Info</Text>
                  {completedTabs.has('patient-info') && <CheckCircle size={14} color="green" />}
                </Flex>
              </Tabs.Trigger>
              <Tabs.Trigger value="prescription" disabled={!canProceedToTab('prescription')}>
                <Flex align="center" gap="2">
                  <Pill size={16} />
                  <Text>Prescription</Text>
                  {completedTabs.has('prescription') && <CheckCircle size={14} color="green" />}
                </Flex>
              </Tabs.Trigger>
              <Tabs.Trigger value="complete" disabled={!canProceedToTab('complete')}>
                <Flex align="center" gap="2">
                  <FileText size={16} />
                  <Text>Complete</Text>
                  {completedTabs.has('complete') && <CheckCircle size={14} color="green" />}
                </Flex>
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="patient-info">
              <Box mt="4">
                <Box mb="4" p="3" style={{ backgroundColor: 'var(--gray-2)', borderRadius: '6px' }}>
                  <Text size="2" color="gray">
                    📋 <strong>Step 1:</strong> Enter patient information. All fields marked with * are required to proceed to the next step.
                  </Text>
                </Box>
                <Flex direction="column" gap="3">
            {/* Existing Patient */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Existing Patient</Text>
              <Flex direction="row" align="end" gap="2" className="w-full">
                <Flex direction="column" align="start" className="w-[320px]">
                  <Select.Root value={selectedPatientId} onValueChange={(val) => {
                    setSelectedPatientId(val);
                    if (!val) return;
                    const p = fakePatients.find(x => x.id === val);
                    if (p) {
                      setName(p.name);
                      setGender(p.gender);
                      setAge(String(p.age));
                      setTelephone(p.telephone);
                      setAddress(p.address);
                      setSignOfLife(p.signOfLife);
                      setSymptom(p.symptom);
                      setDiagnosis(p.diagnosis);
                      setErrors({});
                    }
                  }}>
                    <Select.Trigger placeholder="Select existing patient" style={{ width: '100%' }} />
                    <Select.Content>
                      <Select.Group>
                        <Select.Label>Patients</Select.Label>
                        {fakePatients.map(p => (
                          <Select.Item key={p.id} value={p.id}>{p.id} — {p.name} ({p.gender}), {p.age}y</Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select.Root>
                </Flex>
                <Button variant="soft" color="gray" className="ml-1" onClick={() => {
                  setSelectedPatientId('');
                  setName('');
                  setGender('');
                  setAge('');
                  setTelephone('');
                  setAddress('');
                  setSignOfLife('');
                  setSymptom('');
                  setDiagnosis('');
                  setErrors({});
                }}>
                  Reset
                </Button>
              </Flex>
            </label>

            {/* Name */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Name *</Text>
              <TextField.Root
                value={name}
                onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(prev => ({...prev, name: undefined})); }}
                placeholder="Enter full name"
                required
              />
              {errors.name && <Text size="1" className="text-red-500">{errors.name}</Text>}
            </label>

            {/* Gender */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Gender *</Text>
              <Flex direction="column" align="start" className="w-full">
                <Select.Root value={gender} onValueChange={(value: 'male' | 'female') => { setGender(value); if (errors.gender) setErrors(prev => ({...prev, gender: undefined})); }}>
                  <Select.Trigger placeholder="Select gender" />
                  <Select.Content>
                    <Select.Item value="male">Male</Select.Item>
                    <Select.Item value="female">Female</Select.Item>
                  </Select.Content>
                </Select.Root>
                {errors.gender && (
                  <Text size="1" className="text-red-500 mt-1 pt-4">Gender is required</Text>
                )}
              </Flex>
            </label>

            {/* Age */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Age *</Text>
              <TextField.Root
                type="number"
                value={age}
                onChange={(e) => { setAge(e.target.value); if (errors.age) setErrors(prev => ({...prev, age: undefined})); }}
                placeholder="Enter age"
                inputMode="numeric"
                min={1}
                step={1}
              />
              {errors.age && <Text size="1" className="text-red-500">{errors.age}</Text>}
            </label>

            {/* Telephone */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Telephone</Text>
              <TextField.Root
                value={telephone}
                onChange={(e) => { setTelephone(e.target.value); if (errors.telephone) setErrors(prev => ({...prev, telephone: undefined})); }}
                placeholder="Enter telephone number"
                inputMode="tel"
              />
              {errors.telephone && <Text size="1" className="text-red-500">{errors.telephone}</Text>}
            </label>

            {/* Address */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Address</Text>
              <TextField.Root
                value={address}
                onChange={(e) => { setAddress(e.target.value); if (errors.address) setErrors(prev => ({...prev, address: undefined})); }}
                placeholder="Enter address"
              />
              {errors.address && <Text size="1" className="text-red-500">{errors.address}</Text>}
            </label>

            {/* Signs of Life */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Signs of Life</Text>
              <Flex direction="column" align="start" className="w-full">
                <Select.Root value={signOfLife} onValueChange={(value: 'BP' | 'P' | 'T' | 'RR') => { setSignOfLife(value); if (errors.signOfLife) setErrors(prev => ({...prev, signOfLife: undefined})); }}>
                  <Select.Trigger placeholder="Select sign" />
                  <Select.Content>
                    <Select.Item value="BP">BP</Select.Item>
                    <Select.Item value="P">P</Select.Item>
                    <Select.Item value="T">T</Select.Item>
                    <Select.Item value="RR">RR</Select.Item>
                  </Select.Content>
                </Select.Root>
                {errors.signOfLife && <Text size="1" className="text-red-500 mt-1 pt-4">Please select a sign of life</Text>}
              </Flex>
            </label>

            {/* Symptom */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Symptom</Text>
              <TextArea
                value={symptom}
                onChange={(e) => { setSymptom((e.target as HTMLTextAreaElement).value); if (errors.symptom) setErrors(prev => ({...prev, symptom: undefined})); }}
                placeholder="Describe patient symptoms"
              />
              {errors.symptom && <Text size="1" className="text-red-500">{errors.symptom}</Text>}
            </label>

            {/* Diagnosis */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Diagnosis</Text>
              <TextArea
                value={diagnosis}
                onChange={(e) => { setDiagnosis((e.target as HTMLTextAreaElement).value); if (errors.diagnosis) setErrors(prev => ({...prev, diagnosis: undefined})); }}
                placeholder="Enter diagnosis"
              />
              {errors.diagnosis && <Text size="1" className="text-red-500">{errors.diagnosis}</Text>}
            </label>
                </Flex>

                {/* Tab Navigation */}
                <Flex justify="end" mt="4" gap="2">
                  <Button onClick={proceedToNextTab} disabled={!isPatientInfoValid}>
                    Next: Prescription
                  </Button>
                </Flex>
              </Box>
            </Tabs.Content>

            <Tabs.Content value="prescription">
              <Box mt="4">
                <Box mb="4" p="3" style={{ backgroundColor: 'var(--gray-2)', borderRadius: '6px' }}>
                  <Text size="2" color="gray">
                    💊 <strong>Step 2:</strong> Add medications to the prescription. Select drugs, set dosages, and specify meal timing. At least one medication is required.
                  </Text>
                </Box>
                {/* Drug selection */}
          <Box mt="5">
            <Text as="div" size="3" weight="bold" mb="3">Prescription</Text>
            <Box className="rounded-md border" style={{ borderColor: 'var(--gray-3)' }}>
              <Box className="p-4">
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' }}>
                  {/* Drug */}
                  <div className="col-span-12 sm:col-span-6 lg:col-span-6 min-w-[240px]">
                    <Text as="div" size="2" mb="1" weight="bold">Drug</Text>
                    <Flex align="center" gap="2">
                      <Box className="flex-1">
                        <Flex direction="column" align="start" className="w-full">
                          <Select.Root value={selectedDrugId} onValueChange={(val) => {
                            if (val === '__add_custom__') {
                              setManualDrugOpen(true);
                              return;
                            }
                            setSelectedDrugId(val);
                            if (prescErrors.drug) setPrescErrors(prev => ({ ...prev, drug: undefined }));
                          }}>
                            <Select.Trigger placeholder="Select a drug" style={{ width: '100%' }} />
                            <Select.Content>
                              <Select.Group>
                                <Select.Label>Actions</Select.Label>
                                <Select.Item value="__add_custom__">➕ Add custom…</Select.Item>
                              </Select.Group>
                              <Select.Separator />
                              <Select.Group>
                                <Select.Label>Drugs</Select.Label>
                                {allDrugOptions.map(d => (
                                  <Select.Item key={d.id} value={d.id}>{d.name} — ${d.price.toFixed(2)}</Select.Item>
                                ))}
                              </Select.Group>
                            </Select.Content>
                          </Select.Root>
                          {prescErrors.drug && (
                            <Text size="1" className="text-red-500 mt-1 pt-4">{prescErrors.drug}</Text>
                          )}
                        </Flex>
                      </Box>
                      <Dialog.Root open={isManualDrugOpen} onOpenChange={(open) => {
                        setManualDrugOpen(open);
                        if (!open) setManualErrors({});
                      }}>
                        <Dialog.Content style={{ maxWidth: 380 }}>
                          <Dialog.Title>Add Manual Drug</Dialog.Title>
                          <Dialog.Description size="2" mb="3">
                            Enter a custom medication and price
                          </Dialog.Description>
                          <Flex direction="column" gap="3">
                            <label>
                              <Text as="div" size="2" mb="1" weight="bold">Drug Name</Text>
                              <TextField.Root value={manualDrugName} onChange={(e) => setManualDrugName(e.target.value)} placeholder="e.g., Custom Syrup 100ml" />
                              {manualErrors.name && <Text size="1" className="text-red-500">{manualErrors.name}</Text>}
                            </label>
                            <label>
                              <Text as="div" size="2" mb="1" weight="bold">Price</Text>
                              <TextField.Root value={manualDrugPrice} onChange={(e) => setManualDrugPrice(e.target.value)} inputMode="decimal" placeholder="e.g., 1.50" />
                              {manualErrors.price && <Text size="1" className="text-red-500">{manualErrors.price}</Text>}
                            </label>
                          </Flex>
                          <Flex gap="3" mt="4" justify="end">
                            <Dialog.Close>
                              <Button variant="soft" color="gray">Cancel</Button>
                            </Dialog.Close>
                            <Button onClick={addManualDrug}>Add</Button>
                          </Flex>
                        </Dialog.Content>
                      </Dialog.Root>
                    </Flex>
                  </div>

                  {/* Dose grid */}
                  <div className="col-span-6 sm:col-span-3 lg:col-span-1">
                    <Text as="div" size="2" mb="1" weight="bold">Morning</Text>
                    <TextField.Root type="number" value={doseMorning} onChange={(e) => { setDoseMorning(e.target.value); }} inputMode="numeric" min={0} step={1} placeholder="0" />
                  </div>
                  <div className="col-span-6 sm:col-span-3 lg:col-span-1">
                    <Text as="div" size="2" mb="1" weight="bold">Afternoon</Text>
                    <TextField.Root type="number" value={doseAfternoon} onChange={(e) => { setDoseAfternoon(e.target.value); }} inputMode="numeric" min={0} step={1} placeholder="0" />
                  </div>
                  <div className="col-span-6 sm:col-span-3 lg:col-span-1">
                    <Text as="div" size="2" mb="1" weight="bold">Evening</Text>
                    <TextField.Root type="number" value={doseEvening} onChange={(e) => { setDoseEvening(e.target.value); }} inputMode="numeric" min={0} step={1} placeholder="0" />
                  </div>
                  <div className="col-span-6 sm:col-span-3 lg:col-span-1">
                    <Text as="div" size="2" mb="1" weight="bold">Night</Text>
                    <TextField.Root type="number" value={doseNight} onChange={(e) => { setDoseNight(e.target.value); }} inputMode="numeric" min={0} step={1} placeholder="0" />
                  </div>

                  {/* Period & Qty */}
                  <div className="col-span-6 sm:col-span-3 lg:col-span-1">
                    <Text as="div" size="2" mb="1" weight="bold">Period (days)</Text>
                    <TextField.Root type="number" value={period} onChange={(e) => { setPeriod(e.target.value); }} inputMode="numeric" min={0} step={1} placeholder="e.g. 5" />
                  </div>
                  <div className="col-span-6 sm:col-span-3 lg:col-span-1">
                    <Text as="div" size="2" mb="1" weight="bold">QTY</Text>
                    <TextField.Root type="number" value={qty} readOnly inputMode="numeric" min={0} step={1} placeholder="0" />
                  </div>
                </div>

                {/* Action row */}
                <Flex mt="3" align="center" justify="between" className="gap-4 flex-wrap">
                  <Flex align="center" gap="5" className="flex-wrap">
                    <Flex align="center" gap="2">
                      <Switch checked={afterMeal} onCheckedChange={(val) => { setAfterMeal(val); if (val) setBeforeMeal(false); if (val || beforeMeal) setPrescErrors(prev => ({ ...prev, meal: undefined })); }} />
                      <Text size="2">After Meal</Text>
                    </Flex>
                    <Flex align="center" gap="2">
                      <Switch checked={beforeMeal} onCheckedChange={(val) => { setBeforeMeal(val); if (val) setAfterMeal(false); if (val || afterMeal) setPrescErrors(prev => ({ ...prev, meal: undefined })); }} />
                      <Text size="2">Before Meal</Text>
                    </Flex>
                  </Flex>
                  {prescErrors.meal && (
                    <Text size="1" className="text-red-500 mt-1 pl-4">{prescErrors.meal}</Text>
                  )}
                  <Button onClick={addDrugToTable}>Add</Button>
                </Flex>
              </Box>
            </Box>

            {/* Prescription table */}
            <Box mt="4">
              <Table.Root variant="surface" style={{ width: '100%' }}>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>No</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Name Medication</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Morning</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Afternoon</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Evening</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Night</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Period</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>QTY</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>After Meal</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Before Meal</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Price</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Total</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {prescriptions.map((p, idx) => (
                    <Table.Row key={idx}>
                      <Table.Cell>{idx + 1}</Table.Cell>
                      <Table.Cell>{p.name}</Table.Cell>
                      <Table.Cell>{p.morning}</Table.Cell>
                      <Table.Cell>{p.afternoon}</Table.Cell>
                      <Table.Cell>{p.evening}</Table.Cell>
                      <Table.Cell>{p.night}</Table.Cell>
                      <Table.Cell>{p.period}</Table.Cell>
                      <Table.Cell>{p.qty}</Table.Cell>
                      <Table.Cell>{p.afterMeal ? 'Yes' : 'No'}</Table.Cell>
                      <Table.Cell>{p.beforeMeal ? 'Yes' : 'No'}</Table.Cell>
                      <Table.Cell>${p.price.toFixed(2)}</Table.Cell>
                      <Table.Cell>${(p.price * p.qty).toFixed(2)}</Table.Cell>
                    </Table.Row>
                  ))}
                  {prescriptions.length === 0 && (
                    <Table.Row>
                      <Table.Cell colSpan={12}>
                        <Text size="2" className="text-gray-500">No drugs added yet</Text>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Root>
              {/* Running total */}
              <Flex justify="end" mt="3">
                <Text weight="bold">Total: ${prescriptions.reduce((sum, p) => sum + (p.price * p.qty), 0).toFixed(2)}</Text>
              </Flex>
            </Box>
          </Box>

          {/* Tab Navigation */}
          <Flex justify="between" mt="4">
            <Button variant="soft" onClick={() => handleTabChange('patient-info')}>
              Back: Patient Info
            </Button>
            <Button onClick={proceedToNextTab} disabled={prescriptions.length === 0}>
              Next: Complete
            </Button>
          </Flex>
        </Box>
            </Tabs.Content>

            <Tabs.Content value="complete">
              <Box mt="4">
                <Box mb="4" p="3" style={{ backgroundColor: 'var(--gray-2)', borderRadius: '6px' }}>
                  <Text size="2" color="gray">
                    ✅ <strong>Step 3:</strong> Review the patient information and prescription details. Save the patient record and export/print the prescription.
                  </Text>
                </Box>
                {/* Summary Section */}
                <Box mb="4">
                  <Text size="4" weight="bold" mb="3">Summary</Text>

                  {/* Patient Summary */}
                  <Card mb="3">
                    <Box p="3">
                      <Text size="3" weight="bold" mb="2">Patient Information</Text>
                      <Flex direction="column" gap="1">
                        <Text size="2"><strong>Name:</strong> {name}</Text>
                        <Text size="2"><strong>Gender:</strong> {gender}</Text>
                        <Text size="2"><strong>Age:</strong> {age}</Text>
                        <Text size="2"><strong>Phone:</strong> {telephone}</Text>
                        <Text size="2"><strong>Address:</strong> {address}</Text>
                        <Text size="2"><strong>Signs of Life:</strong> {signOfLife}</Text>
                        <Text size="2"><strong>Symptom:</strong> {symptom}</Text>
                        <Text size="2"><strong>Diagnosis:</strong> {diagnosis}</Text>
                      </Flex>
                    </Box>
                  </Card>

                  {/* Prescription Summary */}
                  <Card mb="3">
                    <Box p="3">
                      <Text size="3" weight="bold" mb="2">Prescription Summary</Text>
                      <Text size="2" mb="2">Total Medications: {prescriptions.length}</Text>
                      <Text size="2" weight="bold">Total Cost: ${prescriptions.reduce((sum, p) => sum + (p.price * p.qty), 0).toFixed(2)}</Text>
                    </Box>
                  </Card>
                </Box>

                {/* Action Buttons */}
                <Flex gap="3" mt="4" justify="between">
                  <Button variant="soft" onClick={() => handleTabChange('prescription')}>
                    Back: Prescription
                  </Button>
                  <Flex gap="2">
                    <Button variant="soft" color="gray">
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Save Patient</Button>
                  </Flex>
                </Flex>

                {hasSaved && (
                  <Box mt="4" p="3" style={{ backgroundColor: 'var(--green-2)', borderRadius: '6px', border: '1px solid var(--green-6)' }}>
                    <Text size="2" style={{ color: 'var(--green-11)' }} mb="2">
                      ✅ Patient saved successfully! You can now export or print the prescription.
                    </Text>
                    <Flex gap="2" mt="2">
                      <Button variant="outline" onClick={downloadPdf}>Export PDF</Button>
                      <Button variant="soft" onClick={previewPrintPdf}>Print Prescription</Button>
                    </Flex>
                  </Box>
                )}
              </Box>
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      </Card>
    </Box>
  );
}
