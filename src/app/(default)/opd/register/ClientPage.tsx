'use client';
import { useState, useEffect } from 'react';
import { Box, Flex, Button, TextField, Text, Select, Card, TextArea, Table, Switch, IconButton, Dialog } from "@radix-ui/themes";
import { PageHeading } from '@/components/common/PageHeading';
// PDF generation libs will be loaded dynamically in the browser to avoid SSR issues
import { Plus } from 'lucide-react';
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

  const validateAll = () => {
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
  };

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

  const [selectedDrugId, setSelectedDrugId] = useState<string>('');
  const [prescriptions, setPrescriptions] = useState<Presc[]>([]);

  // Manual drug dialog state
  const [isManualDrugOpen, setManualDrugOpen] = useState(false);
  const [manualDrugName, setManualDrugName] = useState('');
  const [manualDrugPrice, setManualDrugPrice] = useState<string>('');
  const [manualErrors, setManualErrors] = useState<{ name?: string; price?: string }>({});
  const [customDrugs, setCustomDrugs] = useState<{ id: string; name: string; price: number }[]>([]);

  // Prescription form validation (drug select)
  const [prescErrors, setPrescErrors] = useState<{ drug?: string; meal?: string }>({});

  const allDrugOptions = [...customDrugs, ...baseDrugOptions];

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
    const margin = 8;

    // Try to load real logo from public/images/invoice/logo.png
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
        const imgW = 35;
        const imgH = 14;
        doc.addImage(dataUrl, 'PNG', margin, 8, imgW, imgH);
      }
    } catch (e) {
      console.warn('Failed to load logo for PDF header', e);
    }

    // Header title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    try { doc.setFont('NotoSansKhmer', 'bold'); } catch { doc.setFont('helvetica', 'bold'); }
    doc.text('PUNLEUKREK PHARMACY', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(11);
    try { doc.setFont('NotoSansKhmer', 'normal'); } catch { doc.setFont('helvetica', 'normal'); }
    doc.text('បង្កាន់ដៃថ្នាំ / Prescription', pageWidth / 2, 24, { align: 'center' });

    // Date (top right)
    const dateStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
    doc.setFontSize(9);
    doc.text(dateStr, pageWidth - margin, 34, { align: 'right' });

    // Patient information box - full width with margins
    const boxX = margin;
    const boxY = 37;
    const boxWidth = pageWidth - (margin * 2);
    const boxHeight = 44;
    
    doc.setDrawColor(100);
    doc.setLineWidth(0.4);
    doc.rect(boxX, boxY, boxWidth, boxHeight);

    // Patient information inside box
    doc.setFontSize(8.5);
    try { doc.setFont('NotoSansKhmer', 'normal'); } catch { doc.setFont('helvetica', 'normal'); }
    let yPos = boxY + 7;
    const leftCol = boxX + 4;
    const midCol = boxX + boxWidth * 0.48;
    const rightCol = boxX + boxWidth * 0.73;
    
    // Row 1: Name, Gender, Age
    doc.text(`Name: ${name}`, leftCol, yPos);
    doc.text(`Gender: ${gender}`, midCol, yPos);
    doc.text(`Age: ${age}`, rightCol, yPos);
    
    // Row 2: Address
    yPos += 8;
    doc.text(`Address: ${address}`, leftCol, yPos);
    
    // Row 3: Signs of Life
    yPos += 7;
    doc.text('សញ្ញានៃជីវិត / Signs of Life:', leftCol, yPos);
    const solStartX = leftCol + 26;
    doc.text(`BP: ${signOfLife === 'BP' ? '✓' : ''}`, solStartX, yPos);
    doc.text(`P: ${signOfLife === 'P' ? '✓' : ''}`, solStartX + 22, yPos);
    doc.text(`T: ${signOfLife === 'T' ? '✓' : ''}`, solStartX + 40, yPos);
    doc.text(`RR: ${signOfLife === 'RR' ? '✓' : ''}`, solStartX + 58, yPos);
    
    // Row 4: Telephone
    yPos += 7;
    doc.text(`Telephone: ${telephone}`, leftCol, yPos);
    
    // Row 5: Symptom
    yPos += 7;
    doc.text(`រោគសញ្ញា / Symptom: ${symptom || '-'}`, leftCol, yPos);
    
    // Row 6: Diagnosis
    yPos += 7;
    doc.text(`រោគវិនិច្ឆ័យ / Diagnosis: ${diagnosis || '-'}`, leftCol, yPos);

    // "Prescription" title
    yPos = boxY + boxHeight + 12;
    doc.setFontSize(13);
    try { doc.setFont('NotoSansKhmer', 'bold'); } catch { doc.setFont('helvetica', 'bold'); }
    doc.setTextColor(41, 98, 255);
    doc.text('ការកំណត់ថ្នាំ / Prescription', pageWidth / 2, yPos, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    // Table with Khmer labels
    yPos += 6;
    const head = [['លេខ\nNo', 'ឈ្មោះថ្នាំ\nMedication', 'ពេលព្រឹក\nMorn', 'ពេលរសៀល\nAfter', 'ពេលល្ងាច\nEven', 'ពេលយប់\nNight', 'រយៈពេល\nPeriod', 'បរិមាណ\nQTY', 'ក្រោយពេលបាយ\nAfter Meal', 'មុនពេលបាយ\nBefore Meal', 'តម្លៃ\nPrice', 'សរុប\nTotal']];
    const body = prescriptions.map((p, idx) => [
      idx + 1,
      p.name,
      p.morning || '-',
      p.afternoon || '-',
      p.evening || '-',
      p.night || '-',
      p.period ? `${p.period}d` : '-',
      p.qty || '-',
      p.afterMeal ? 'Yes' : '-',
      p.beforeMeal ? 'Yes' : '-',
      `$${p.price.toFixed(2)}`,
      `$${(p.price * p.qty).toFixed(2)}`,
    ]);

    // Add empty rows
    while (body.length < 10) {
      body.push(['', '', '', '', '', '', '', '', '', '', '', '']);
    }

    const totalAmount = prescriptions.reduce((sum, p) => sum + (p.price * p.qty), 0);

    // Calculate available width for table
    const availableWidth = pageWidth - (margin * 2);

    // @ts-ignore
    autoTable(doc, {
      head,
      body,
      startY: yPos,
      margin: { left: margin, right: margin },
      tableWidth: availableWidth,
      styles: { 
        font: 'NotoSansKhmer',
        fontSize: 8.5,
        cellPadding: { top: 2, right: 1, bottom: 2, left: 1 },
        lineColor: [200, 200, 200],
        lineWidth: 0.25,
        halign: 'center',
        valign: 'middle',
        overflow: 'linebreak',
      },
      headStyles: { 
        font: 'NotoSansKhmer',
        fillColor: [245, 248, 252],
        textColor: [30, 30, 30],
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.3,
        lineColor: [180, 180, 180],
        minCellHeight: 11,
      },
      bodyStyles: {
        font: 'NotoSansKhmer',
        textColor: [40, 40, 40],
        minCellHeight: 9,
      },
      alternateRowStyles: {
        fillColor: [253, 253, 253],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 50, halign: 'left' },
        2: { cellWidth: 13, halign: 'center' },
        3: { cellWidth: 13, halign: 'center' },
        4: { cellWidth: 13, halign: 'center' },
        5: { cellWidth: 13, halign: 'center' },
        6: { cellWidth: 15, halign: 'center' },
        7: { cellWidth: 12, halign: 'center' },
        8: { cellWidth: 17, halign: 'center' },
        9: { cellWidth: 17, halign: 'center' },
        10: { cellWidth: 16, halign: 'right' },
        11: { cellWidth: 16, halign: 'right' },
      },
      theme: 'grid',
    });

    // Total line
    const afterTableY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 4 : yPos + 10;
    
    doc.setDrawColor(180);
    doc.setLineWidth(0.4);
    doc.line(pageWidth - 70, afterTableY, pageWidth - margin, afterTableY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: $${totalAmount.toFixed(2)}`, pageWidth - margin, afterTableY + 5, { align: 'right' });

    // Footer note
    const noteY = afterTableY + 14;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Note: Take medication as prescribed by doctor', margin, noteY);
    doc.setTextColor(0, 0, 0);

    // Bottom section - Signature and Doctor info
    const bottomY = pageHeight - 22;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('( Signature )', margin, bottomY);
    doc.setLineWidth(0.3);
    doc.line(margin, bottomY + 1.5, margin + 38, bottomY + 1.5);
    
    doc.text('DATE:', pageWidth - 68, bottomY);
    doc.line(pageWidth - 54, bottomY + 1.5, pageWidth - margin, bottomY + 1.5);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Dr. IM SOKLEAN', pageWidth - margin, bottomY + 7, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('Tel: 0975111789', pageWidth - margin, bottomY + 11, { align: 'right' });

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
      toast.success('Patient saved');
      // optionally reset prescriptions after save
      // setPrescriptions([]);
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


  return (
    <Box className="space-y-4 w-full px-4">
      <PageHeading title="Add New Patient" description="Fill in the details of the new patient." />
      <Card style={{ width: '100%' }}>
        <Box p="4">
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
              <Text as="div" size="2" mb="1" weight="bold">Name</Text>
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
              <Text as="div" size="2" mb="1" weight="bold">Gender</Text>
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
              <Text as="div" size="2" mb="1" weight="bold">Age</Text>
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

          <Flex gap="3" mt="4" justify="end">
            <Button variant="soft" color="gray">
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save</Button>
            {hasSaved && (
              <>
                <Button variant="outline" onClick={downloadPdf}>Export</Button>
                <Button variant="soft" onClick={previewPrintPdf}>Download PDF / Print</Button>
              </>
            )}
          </Flex>
        </Box>
      </Card>
    </Box>
  );
}
