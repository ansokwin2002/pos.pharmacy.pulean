'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Flex, Button, TextField, Text, Select, Card, TextArea, Table, Switch, Dialog, Tabs, IconButton } from "@radix-ui/themes";
import { PageHeading } from '@/components/common/PageHeading';
import SearchableSelect from '@/components/common/SearchableSelect';
// PDF generation libs will be loaded dynamically in the browser to avoid SSR issues
import { User, Pill, CheckCircle, FileText, Trash2, Plus, ArrowRight, Save, ArrowLeft } from 'lucide-react';
import useDebounce from '@/hooks/useDebounce';
import { toast } from 'sonner';

export default function RegisterPatientPage() {
  // Existing patient selection (fake dataset)
  type Patient = {
    id: string;
    name: string;
    gender: 'male' | 'female';
    age: string;
    telephone: string;
    address: string;
    signOfLife: string;
    pe: string;
    symptom: string;
    diagnosis: string;
    phone?: string | null;
    signs_of_life?: string | null;
  };

  const [allPatients, setAllPatients] = useState<Patient[]>([]);

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [age, setAge] = useState<string>('');
  const [telephone, setTelephone] = useState('');
  const [address, setAddress] = useState('');
  const [signOfLife, setSignOfLife] = useState('');
  const [pe, setPe] = useState('');
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
    unitType: 'box' | 'strip' | 'tablet'; // Added for stock deduction
  };

  const [prescriptions, setPrescriptions] = useState<Presc[]>([]);
  const [tempPrescriptionRecordId, setTempPrescriptionRecordId] = useState<string | null>(null);
  const [renderKey, setRenderKey] = useState(0);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);
  const [isAddingDrug, setIsAddingDrug] = useState(false);
  const [removingDrugIndex, setRemovingDrugIndex] = useState<number | null>(null);

  // Tab management
  const [currentTab, setCurrentTab] = useState<'patient-info' | 'prescription' | 'complete'>('patient-info');
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTab = localStorage.getItem('currentRegisterTab') as 'patient-info' | 'prescription' | 'complete';
      if (storedTab) {
        setCurrentTab(storedTab);
      }
    }
  }, []); // Run once on client mount

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentRegisterTab', currentTab);
    }
  }, [currentTab]);

  // Get search params for secure patient ID lookup
  const searchParams = useSearchParams();

  // Extract patient ID from URL parameters (secure approach)
  const patientIdParam = searchParams.get('id');

  // Load temp drugs on mount
  useEffect(() => {
    if (currentTab === 'prescription') {
      loadTempDrugs();
    }
  }, [currentTab, patientIdParam]);

  // Prompt user to add prescriptions if none found
  useEffect(() => {
    if (currentTab === 'prescription' && prescriptions.length === 0 && !isLoadingPrescriptions) {
      toast.info('No prescriptions found for this patient. Please add medications.');
    }
  }, [currentTab, prescriptions.length, isLoadingPrescriptions]);
  const [isFetchingSelectedDrug, setIsFetchingSelectedDrug] = useState(false);

  // State for real patient data from API


  // Find patient by ID - first check fake patients, then try to load from API
  const selectedPatient = patientIdParam ? allPatients.find(p => String(p.id) === patientIdParam) : null;

  // Fetch all patients from API on component mount
  useEffect(() => {
    const loadAllPatients = async () => {
      try {
        const { listPodPatients } = await import('@/utilities/api/podPatients');
        const response = await listPodPatients();
        const patients = Array.isArray(response?.data) ? response.data : response;
        setAllPatients(patients || []);
      } catch (error) {
        console.error('Failed to load all patients:', error);
        toast.error('Failed to load patient list');
      }
    };

    loadAllPatients();
  }, []);

  // Auto-fill form when patient data is available (secure approach)
      useEffect(() => {
        const patient = selectedPatient;
    
        console.log('Auto-fill effect triggered. patientIdParam:', patientIdParam, 'selectedPatient:', selectedPatient);
    
        if (patient && patientIdParam) {
          console.log('Auto-filling with patient data:', patient);
          // React 18 automatically batches these state updates
          setTimeout(() => setSelectedPatientId(String(patient.id)), 0);
          setName(patient.name || 'N/A');
    
          // Handle gender field (API uses string, fake uses 'male'|'female')
          const genderValue = patient.gender;
          if (genderValue === 'male' || genderValue === 'female') {
            setGender(genderValue);
          } else {
            setGender('male'); // Default to 'male' if not specified
          }
    
          setAge(String(patient.age || '1')); // Default to '1' if not specified
    
          // Handle telephone field (API might use 'telephone' or 'phone')
          const phoneValue = patient.telephone || patient.phone || '';
          let validTelephone = String(phoneValue);
          if (validTelephone && /^\d+$/.test(validTelephone)) {
            // Pad with leading zeros if too short, truncate if too long
            if (validTelephone.length < 8) {
              validTelephone = validTelephone.padStart(8, '0');
            } else if (validTelephone.length > 12) {
              validTelephone = validTelephone.slice(0, 12);
            }
          }
          setTelephone(validTelephone || '00000000'); // Default to a valid 8-digit number
    
          setAddress(patient.address || 'N/A');
    
          // Handle signOfLife field (API uses 'signs_of_life', fake uses 'signOfLife')
          const signOfLifeValue = patient.signOfLife || patient.signs_of_life;
          setSignOfLife(signOfLifeValue || 'N/A');

          setPe(patient.pe || 'N/A');
    
          setSymptom(patient.symptom || 'N/A'); // Changed this
          setDiagnosis(patient.diagnosis || 'N/A'); // Changed this
          setErrors({});
          console.log('Auto-fill completed. Current state:', { name, gender, age, telephone, address, signOfLife, symptom, diagnosis });
        } else {
          console.log('Auto-fill skipped. patient or patientIdParam is missing.');
        }
      }, [selectedPatient, patientIdParam, name, gender, age, telephone, address, signOfLife, pe, symptom, diagnosis]);
    
      // Form validation state
      const [errors, setErrors] = useState<{
        name?: string;
        gender?: string;
        age?: string;
        telephone?: string;
        address?: string;
        signOfLife?: string;
        pe?: string;
        symptom?: string;
        diagnosis?: string;
      }>({});
    
      const validatePatientInfo = useCallback(() => {
        const e: typeof errors = {};
        if (!name.trim()) e.name = 'Name is required';
        if (!gender) e.gender = 'Gender is required';
        if (!age.trim()) e.age = 'Age is required';
        if (!telephone.trim()) e.telephone = 'Telephone is required';
        else if (!/^\d{8,12}$/.test(telephone.trim())) e.telephone = 'Telephone must be 8–12 digits';
        if (!address.trim()) e.address = 'Address is required';
        if (!pe.trim()) e.pe = 'PE is required';
        if (!symptom.trim()) e.symptom = 'Symptom is required';
        if (!diagnosis.trim()) e.diagnosis = 'Diagnosis is required';
        setErrors(e);
        return Object.keys(e).length === 0;
      }, [name, gender, age, telephone, address, signOfLife, pe, symptom, diagnosis, setErrors]);
    

    
      const validateAll = () => {
        return validatePatientInfo();
      };
    
  // Show export actions only after successful save
  const [hasSaved, setHasSaved] = useState(false);
  const [savedHistoryId, setSavedHistoryId] = useState<number | null>(null);

  // Tab navigation functions


  const handleTabChange = useCallback((tabId: string) => {
    const isPatientInfoValid = validatePatientInfo();

    if (tabId === 'prescription' && !isPatientInfoValid) {
      toast.error('Please complete patient information first');
      return;
    }

    if (tabId === 'complete' && (!isPatientInfoValid || prescriptions.length === 0)) {
      if (!isPatientInfoValid) {
        toast.error('Please complete patient information first');
      } else {
        toast.error('Please add at least one prescription');
      }
      return;
    }

    // Reset hasSaved state when switching away from complete tab
    if (tabId !== 'complete' && hasSaved) {
      setHasSaved(false);
    }

    setCurrentTab(tabId as 'patient-info' | 'prescription' | 'complete');

    // Mark previous tabs as completed
    if (tabId === 'prescription' && isPatientInfoValid) {
      setCompletedTabs(prev => new Set([...prev, 'patient-info']));
    } else if (tabId === 'complete' && isPatientInfoValid && prescriptions.length > 0) {
      setCompletedTabs(prev => new Set([...prev, 'patient-info', 'prescription']));
    }
  }, [prescriptions.length, validatePatientInfo, hasSaved]);

  const proceedToNextTab = useCallback(() => {
    const isPatientInfoValid = validatePatientInfo();
    if (currentTab === 'patient-info' && isPatientInfoValid) {
      setCompletedTabs(prev => new Set([...prev, 'patient-info']));
      handleTabChange('prescription');
      toast.success('Patient information completed!');
    } else if (currentTab === 'prescription' && prescriptions.length > 0) {
      setCompletedTabs(prev => new Set([...prev, 'patient-info', 'prescription']));
      handleTabChange('complete');
      toast.success('Prescription completed!');
    }
  }, [currentTab, prescriptions.length, validatePatientInfo, handleTabChange]);

  const [drugOptions, setDrugOptions] = useState<{ id: string; name: string; price: number; generic_name?: string; unit?: string; box_price?: number; tablet_price?: number; strip_price?: number; type_drug?: string; }[]>([]);
  const [drugSearchTerm, setDrugSearchTerm] = useState('');
  const [drugPage, setDrugPage] = useState(1);
  const [hasMoreDrugs, setHasMoreDrugs] = useState(true);
  const [isFetchingMoreDrugs, setIsFetchingMoreDrugs] = useState(false);
  const debouncedDrugSearchTerm = useDebounce(drugSearchTerm, 300);
  const [selectedDrugId, setSelectedDrugId] = useState<string>('');
  const [medicineTypeFilter, setMedicineTypeFilter] = useState<'box-strip-tablet' | 'box-only' | 'strip-only'>('box-strip-tablet');


  const fetchDrugs = useCallback(async (searchTerm = '', page = 1, append = false) => {
    if (!append) {
      setIsLoadingPrescriptions(true);
    } else {
      setIsFetchingMoreDrugs(true);
    }
    try {
      const { listDrugs } = await import('@/utilities/api/drugs');
      const response = await listDrugs({
        search: searchTerm,
        page: page,
        per_page: 15, // as requested
      });
      
      const newDrugs = response.data.map((drug: any) => ({
        id: drug.id,
        name: drug.name,
        price: Number(medicineTypeFilter === 'box-only' ? drug.box_price : (medicineTypeFilter === 'strip-only' ? drug.strip_price : drug.tablet_price)),
        generic_name: drug.generic_name,
        unit: drug.unit,
        box_price: Number(drug.box_price || 0),
        tablet_price: Number(drug.tablet_price || 0),
        strip_price: Number(drug.strip_price || 0),
        type_drug: drug.type_drug,
      }));

      setDrugOptions(prev => append ? [...prev, ...newDrugs] : newDrugs);
      setHasMoreDrugs(response.data.length > 0 && response.total > (page * response.per_page));
      setDrugPage(page);

    } catch (error) {
      console.error('Failed to fetch drugs:', error);
      toast.error('Failed to load drug options');
    } finally {
      setIsLoadingPrescriptions(false);
      setIsFetchingMoreDrugs(false);
    }
  }, [medicineTypeFilter]);

  useEffect(() => {
    fetchDrugs(debouncedDrugSearchTerm, 1);
  }, [debouncedDrugSearchTerm, fetchDrugs]);

  const handleMenuScrollToBottom = () => {
    if (hasMoreDrugs && !isFetchingMoreDrugs) {
      fetchDrugs(drugSearchTerm, drugPage + 1, true);
    }
  };




  // Manual drug dialog state
  const [isManualDrugOpen, setManualDrugOpen] = useState(false);
  const [manualDrugName, setManualDrugName] = useState('');
  const [manualDrugPrice, setManualDrugPrice] = useState<string>('');
  const [manualErrors, setManualErrors] = useState<{ name?: string; price?: string }>({});

  // Prescription form validation (drug select)
  const [prescErrors, setPrescErrors] = useState<{ drug?: string; meal?: string }>({});

  const addManualDrug = () => {
    const name = manualDrugName.trim();
    const priceNum = Number(manualDrugPrice);
    const errs: { name?: string; price?: string } = {};
    if (!name) errs.name = 'Drug name is required';
    if (!manualDrugPrice || isNaN(priceNum) || priceNum <= 0) errs.price = 'Price must be greater than 0';
    setManualErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // This should ideally save the drug to the backend and then refetch.
    // For now, we will just refetch the list.
    fetchDrugs(drugSearchTerm, 1);
    setManualDrugName('');
    setManualDrugPrice('');
    setManualErrors({});
    setManualDrugOpen(false);
  };


  // Dosing & quantity
  const [doseMorning, setDoseMorning] = useState<string>('');
  const [doseAfternoon, setDoseAfternoon] = useState<string>('');
  const [doseEvening, setDoseEvening] = useState<string>('');
  const [doseNight, setDoseNight] = useState<string>('');
  const [period, setPeriod] = useState<string>('');
  const [qty, setQty] = useState<string>('');
  const [stripQty, setStripQty] = useState<string>(''); // New state for strip quantity
  const [boxQty, setBoxQty] = useState<string>(''); // New state for box quantity

  // Recompute QTY whenever any dose or period changes to avoid stale state issues
  useEffect(() => {
    if (medicineTypeFilter === 'box-strip-tablet') { // Only compute if tablet price
      const m = Number(doseMorning) || 0;
      const a = Number(doseAfternoon) || 0;
      const e = Number(doseEvening) || 0;
      const n = Number(doseNight) || 0;
      const p = Number(period) || 0;
      const totalPerDay = m + a + e + n;
      const total = totalPerDay * p;
      setQty(String(total));
    }
  }, [doseMorning, doseAfternoon, doseEvening, doseNight, period, medicineTypeFilter]); // Add medicineTypeFilter to dependencies

  const [afterMeal, setAfterMeal] = useState<boolean>(false);
  const [beforeMeal, setBeforeMeal] = useState<boolean>(false);

  const savePrescriptionsToTempAPI = async (drugsToSave: Presc[]) => {
    try {
      const { createTempPrescriptionForPatient } = await import('@/utilities/api/tempPrescriptions');
      const currentPatientId = patientIdParam;

      if (!currentPatientId) {
          console.error("Cannot save temp prescription: patientId is missing.");
          toast.error("Error: Patient ID is missing.");
          return null;
      }
      
      const result = await createTempPrescriptionForPatient(currentPatientId, drugsToSave);
      
      console.log('Saved prescriptions to temp API:', result);
      setTempPrescriptionRecordId(result.id); 
      return result;
    } catch (error: any) {
      console.warn('Temp API interaction failed:', error.message);
      toast.error('Failed to save temporary prescription.');
      return null;
    }
  };



  const loadTempDrugs = async () => {
    setIsLoadingPrescriptions(true);
    console.log('loadTempDrugs: Fetching for patientIdParam:', patientIdParam);

    try {
      const { listTempPrescriptions } = await import('@/utilities/api/tempPrescriptions');
      const currentPatientId = patientIdParam;
      if (!currentPatientId) {
        console.warn('loadTempDrugs: No patient ID found in URL.');
        setPrescriptions([]);
        setIsLoadingPrescriptions(false);
        return;
      }
      
      const temps = await listTempPrescriptions(currentPatientId);
      console.log('loadTempDrugs: Raw temporary prescriptions received:', temps);

      if (temps && Array.isArray(temps) && temps.length > 0) {
        // Sort by ID (descending) as a fallback for created_at, assuming higher ID is newer.
        temps.sort((a, b) => {
          const idA = a.id ? parseInt(a.id, 10) : 0;
          const idB = b.id ? parseInt(b.id, 10) : 0;
          return idB - idA;
        });
        const tempPrescriptionRecord = temps[0];
        console.log('loadTempDrugs: Latest temporary prescription record selected (by ID):', tempPrescriptionRecord);

        setTempPrescriptionRecordId(tempPrescriptionRecord.id);
        
        let drugs = [];
        if (tempPrescriptionRecord) { // Ensure record is not null/undefined
            // Check if json_data is already an object (parsed by Laravel/ORM)
            if (typeof tempPrescriptionRecord.json_data === 'object' && tempPrescriptionRecord.json_data !== null) {
                console.log('loadTempDrugs: json_data is already an object:', tempPrescriptionRecord.json_data);
                if (Array.isArray(tempPrescriptionRecord.json_data.drugs)) {
                    drugs = tempPrescriptionRecord.json_data.drugs;
                } else {
                    console.warn('loadTempDrugs: json_data.drugs is not an array, defaulting to empty.');
                }
            } else if (typeof tempPrescriptionRecord.json_data === 'string') {
                // Otherwise, treat it as a string and attempt parsing
                console.log('loadTempDrugs: json_data before parsing (string assumption):', tempPrescriptionRecord.json_data);
                try {
                    const parsedData = JSON.parse(tempPrescriptionRecord.json_data);
                    console.log('loadTempDrugs: parsedData after first parse:', parsedData);

                    // Check if the parsed data is another string (double-encoded)
                    if (typeof parsedData === 'string') {
                        const innerParsed = JSON.parse(parsedData);
                        console.log('loadTempDrugs: innerParsed data:', innerParsed);
                        drugs = innerParsed.drugs || [];
                    } else {
                        drugs = parsedData.drugs || [];
                    }
                } catch (e) {
                    console.error("loadTempDrugs: Failed to parse temp prescription json_data (string assumed)", e);
                    drugs = [];
                }
            } else {
                console.warn('loadTempDrugs: tempPrescriptionRecord.json_data is neither object nor string, defaulting to empty drugs array.');
            }
        }
        
        setPrescriptions(drugs);
        console.log('loadTempDrugs: Final drugs array set to state:', drugs);
      } else {
        console.log('loadTempDrugs: No temporary prescriptions found or response is not an array.');
        setPrescriptions([]);
      }
    } catch (error: any) {
      if (error.status === 404) {
        console.warn('loadTempDrugs: No temporary prescriptions found for this patient (API returned 404).');
      } else {
        console.error('loadTempDrugs: Failed to load temp prescriptions:', error);
        toast.error(`Failed to load temporary prescriptions: ${error.message || 'Unknown error'} ${error.detail?.message ? ` - ${error.detail.message}` : ''}`);
      }
      setPrescriptions([]);
    } finally {
      setIsLoadingPrescriptions(false);
    }
  };

  const addDrugToTable = async () => {
    // Validate required Drug selection
    const d = drugOptions.find(x => x.id === selectedDrugId);
    if (!d) {
      setPrescErrors(prev => ({ ...prev, drug: 'Drug is required' }));
      return;
    }
    const morning = Number(doseMorning) || 0;
    const afternoon = Number(doseAfternoon) || 0;
    const evening = Number(doseEvening) || 0;
    const night = Number(doseNight) || 0;
    const days = Number(period) || 0;
    
    let quantity: number;

    if (medicineTypeFilter === 'strip-only') {
      quantity = Number(stripQty) || 0;
      if (quantity <= 0) {
        setPrescErrors(prev => ({ ...prev, qty: 'QTY for strips is required and must be greater than 0' }));
        toast.error('Please enter the quantity for strips (must be > 0)');
        return;
      }
    } else if (medicineTypeFilter === 'box-only') { // New condition for box-only
      quantity = Number(boxQty) || 0;
      if (quantity <= 0) {
        setPrescErrors(prev => ({ ...prev, qty: 'QTY for boxes is required and must be greater than 0' }));
        toast.error('Please enter the quantity for boxes (must be > 0)');
        return;
      }
    } else {
      // Original logic for box-strip-tablet
      quantity = Number(qty) || 0;
      if (quantity === 0 && days > 0) {
        const dailyDose = morning + afternoon + evening + night;
        quantity = dailyDose > 0 ? dailyDose * days : days;
      }
      if ((morning + afternoon + evening + night === 0 || days === 0) && quantity === 0) {
        setPrescErrors(prev => ({ ...prev, period: 'Dosage or Period (days) / QTY is required' }));
        toast.error('Please enter dosage and period, or QTY');
        return;
      }
    }

    const priceToUse = medicineTypeFilter === 'box-only' ? d.box_price : (medicineTypeFilter === 'strip-only' ? d.strip_price : d.tablet_price);
    
    console.log('Adding drug:', {
      name: d.name,
      morning, afternoon, evening, night,
      days,
      quantity,
      price: priceToUse,
      total: (priceToUse || 0) * quantity
    });
    
    const entry: Presc = {
      id: d.id,
      name: d.name,
      price: priceToUse || 0,
      morning: (medicineTypeFilter === 'strip-only' || medicineTypeFilter === 'box-only') ? 0 : morning, // Set to 0 if strip-only or box-only
      afternoon: (medicineTypeFilter === 'strip-only' || medicineTypeFilter === 'box-only') ? 0 : afternoon, // Set to 0 if strip-only or box-only
      evening: (medicineTypeFilter === 'strip-only' || medicineTypeFilter === 'box-only') ? 0 : evening, // Set to 0 if strip-only or box-only
      night: (medicineTypeFilter === 'strip-only' || medicineTypeFilter === 'box-only') ? 0 : night, // Set to 0 if strip-only or box-only
      period: (medicineTypeFilter === 'strip-only' || medicineTypeFilter === 'box-only') ? '' : period || '', // Set to empty if strip-only or box-only
      qty: quantity,
      afterMeal,
      beforeMeal,
      unitType: medicineTypeFilter === 'box-only' ? 'box' : (medicineTypeFilter === 'strip-only' ? 'strip' : 'tablet'),
    };

    // Show loading state
    setIsAddingDrug(true);

    try {
      const newPrescriptions = [...prescriptions, entry];
      const result = await savePrescriptionsToTempAPI(newPrescriptions);
      if (result) {
        // API save successful, update state
        setPrescriptions(newPrescriptions);
      } else {
        // API not available, use local state but show error
        setPrescriptions(newPrescriptions);
        toast.error('Failed to save medication to the server. Your changes are saved locally for now.');
      }
      toast.success('Medication added');
    } catch (error) {
      console.error('Failed to add drug:', error);
      toast.error('Failed to add medication');
    } finally {
      setIsAddingDrug(false);
    }

    // reset inputs
    setSelectedDrugId('');
    setDoseMorning('');
    setDoseAfternoon('');
    setDoseEvening('');
    setDoseNight('');
    setPeriod('');
    setQty('');
    setStripQty(''); // Reset stripQty
    setBoxQty(''); // Reset boxQty
    setAfterMeal(false);
    setBeforeMeal(false);
  };

  const removeDrug = async (index: number) => {
    console.log('=== REMOVE DRUG START ===');
    console.log('Removing drug at index:', index);
    
    setRemovingDrugIndex(index);
    
    try {
      const newPrescriptions = prescriptions.filter((_, i) => i !== index);
      const result = await savePrescriptionsToTempAPI(newPrescriptions);

      if (result) {
        setPrescriptions(newPrescriptions);
        toast.success('Medication removed.');
      } else {
        toast.error('Failed to remove medication on the server. Please try again.');
      }
      
      setRenderKey(prev => prev + 1);
      
      console.log('=== REMOVE DRUG END ===');
    } catch (error) {
      console.error('Failed to remove drug:', error);
      toast.error('Failed to remove medication');
    } finally {
      setRemovingDrugIndex(null);
    }
  };


  
  const downloadPdf = async () => {
    try {
      let historyData = null;
      
      // Fetch the latest patient history by patient ID
      const patientId = selectedPatientId || patientIdParam;
      if (patientId) {
        const { getPatientHistoriesByPatientId } = await import('@/utilities/api/patientHistories');
        const histories = await getPatientHistoriesByPatientId(patientId);
        
        if (histories && histories.length > 0) {
          // Use the most recent history (first one, since it's ordered by created_at desc)
          const latestHistory = histories[0];
          historyData = JSON.parse(latestHistory.json_data);
          console.log('Fetched latest history data for PDF:', historyData);
        }
      }
      
      const { buildPrescriptionPdf } = await import('@/utilities/pdf');
      const createdAt = historyData?.created_at || new Date().toISOString();
      const { doc, fileName } = await buildPrescriptionPdf(historyData, createdAt);
      doc.save(fileName);
      toast.success('Prescription PDF downloaded');
    } catch (e) {
      console.error(e);
      toast.error('Failed to download PDF');
    }
  };

  const previewPrintPdf = async () => {
    try {
      let historyData = null;
      
      // Fetch the latest patient history by patient ID
      const patientId = selectedPatientId || patientIdParam;
      if (patientId) {
        const { getPatientHistoriesByPatientId } = await import('@/utilities/api/patientHistories');
        const histories = await getPatientHistoriesByPatientId(patientId);
        
        if (histories && histories.length > 0) {
          // Use the most recent history (first one, since it's ordered by created_at desc)
          const latestHistory = histories[0];
          historyData = JSON.parse(latestHistory.json_data);
          console.log('Fetched latest history data for PDF:', historyData);
        }
      }
      
      const { buildPrescriptionPdf } = await import('@/utilities/pdf');
      const createdAt = historyData?.created_at || new Date().toISOString();
      const { doc } = await buildPrescriptionPdf(historyData, createdAt);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      
      // Create hidden iframe for printing (same as other pages)
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.print();
      };
    } catch (e) {
      console.error(e);
      toast.error('Failed to preview/print PDF');
    }
  };

  const handleSubmit = async () => {
    const ok = validateAll();
    if (!ok) return;
    try {
      // Prepare patient data
      const patientData = {
        id: selectedPatientId || patientIdParam || undefined, // Include patient ID
        name,
        gender,
        age: age,
        telephone,
        address,
        signs_of_life: signOfLife,
        pe,
        symptom,
        diagnosis,
      };

      // Prepare prescription data with all medications
      const prescriptionData = prescriptions.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        morning: p.morning,
        afternoon: p.afternoon,
        evening: p.evening,
        night: p.night,
        period: p.period,
        qty: p.qty,
        afterMeal: p.afterMeal,
        beforeMeal: p.beforeMeal,
        total: p.price * p.qty,
      }));

      // Calculate total amount
      const totalAmount = prescriptions.reduce((sum, p) => sum + (p.price * p.qty), 0);

      // Combine all data into json_data
      const historyData = {
        patient: patientData,
        prescriptions: prescriptionData,
        totalAmount,
        createdAt: new Date().toISOString(),
      };

      // Save to patient-histories API
      const { createPatientHistory } = await import('@/utilities/api/patientHistories');
      const { deductDrugStock } = await import('@/utilities/api/stock'); // Import the new stock deduction API
      const payload = {
        type: 'opd',
        json_data: JSON.stringify(historyData),
        patient_id: selectedPatientId || patientIdParam || undefined, // Add patient_id for database filtering
      };
      
      const saved = await createPatientHistory(payload);
      setHasSaved(true);
      setSavedHistoryId(saved.id); // Store the saved history ID
      setCompletedTabs(prev => new Set([...prev, 'patient-info', 'prescription', 'complete']));
      
      // --- Stock Deduction Logic ---
      try {
        const stockDeductions = prescriptions.map(p => ({
          drug_id: p.id,
          deducted_quantity: p.qty,
          deduction_unit: p.unitType,
        }));
        await deductDrugStock({ deductions: stockDeductions });
        toast.success('Drug stock deducted successfully!');
      } catch (stockErr: any) {
        console.error('Failed to deduct drug stock:', stockErr);
        toast.error(stockErr.detail?.message || stockErr.message || 'Failed to deduct drug stock');
      }
      // --- End Stock Deduction Logic ---

      // Clear prescriptions from UI immediately
      setPrescriptions([]);
      setTempPrescriptionRecordId(null);
      
      // Clear all temp prescriptions from API in background using the new API
      try {
        const { deleteTempPrescriptionsByPatientId } = await import('@/utilities/api/tempPrescriptions');
        await deleteTempPrescriptionsByPatientId(patientIdParam || '0'); // Pass current patientIdParam
        
        console.log(`Cleared all temp prescriptions from API for patient ID ${patientIdParam}`);
      } catch (error) {
        console.error('Failed to clear temp prescriptions from API:', error);
      }
      
      toast.success('OPD history saved successfully!');
      console.log('Saved patient history:', saved);
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
        if (be?.pe) newErrs.pe = String(be.pe);
        if (be?.symptom) newErrs.symptom = String(be.symptom);
        if (be?.diagnosis) newErrs.diagnosis = String(be.diagnosis);
        setErrors(newErrs);
      }
      toast.error('Failed to save OPD history');
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
        title="Add New Patient"
        description="Complete the patient registration process step by step."
      />


      <Card style={{ width: '100%' }}>
        <Box p="4">
          <Tabs.Root value={currentTab} onValueChange={handleTabChange}>
            <Tabs.List style={{ gap: '8px', backgroundColor: 'transparent', borderBottom: 'none' }}>
              <Tabs.Trigger 
                value="patient-info"
                style={{
                  backgroundColor: currentTab === 'patient-info' ? 'var(--blue-9)' : completedTabs.has('patient-info') ? 'var(--green-9)' : 'var(--gray-3)',
                  color: currentTab === 'patient-info' || completedTabs.has('patient-info') ? 'white' : 'var(--gray-11)',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  border: 'none',
                  borderBottom: currentTab === 'patient-info' ? '3px solid var(--blue-9)' : completedTabs.has('patient-info') ? '3px solid var(--green-9)' : '3px solid var(--gray-3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: '500'
                }}
              >
                <Flex align="center" gap="2">
                  <User size={16} />
                  <Text>Patient Info</Text>
                  {completedTabs.has('patient-info') && <CheckCircle size={14} />}
                </Flex>
              </Tabs.Trigger>
              <Tabs.Trigger 
                value="prescription"
                style={{
                  backgroundColor: currentTab === 'prescription' ? 'var(--blue-9)' : completedTabs.has('prescription') ? 'var(--green-9)' : 'var(--gray-3)',
                  color: currentTab === 'prescription' || completedTabs.has('prescription') ? 'white' : 'var(--gray-11)',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  border: 'none',
                  borderBottom: currentTab === 'prescription' ? '3px solid var(--blue-9)' : completedTabs.has('prescription') ? '3px solid var(--green-9)' : '3px solid var(--gray-3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: '500'
                }}
              >
                <Flex align="center" gap="2">
                  <Pill size={16} />
                  <Text>Prescription</Text>
                  {completedTabs.has('prescription') && <CheckCircle size={14} />}
                </Flex>
              </Tabs.Trigger>
              <Tabs.Trigger 
                value="complete"
                style={{
                  backgroundColor: currentTab === 'complete' ? 'var(--blue-9)' : completedTabs.has('complete') ? 'var(--green-9)' : 'var(--gray-3)',
                  color: currentTab === 'complete' || completedTabs.has('complete') ? 'white' : 'var(--gray-11)',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  border: 'none',
                  borderBottom: currentTab === 'complete' ? '3px solid var(--blue-9)' : completedTabs.has('complete') ? '3px solid var(--green-9)' : '3px solid var(--gray-3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: '500'
                }}
              >
                <Flex align="center" gap="2">
                  <FileText size={16} />
                  <Text>Complete</Text>
                  {completedTabs.has('complete') && <CheckCircle size={14} />}
                </Flex>
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="patient-info">
              <Box mt="4">
                <Box mb="4" p="3" style={{ backgroundColor: 'var(--gray-2)', borderRadius: '6px' }}>
                  <Text size="2" color="gray">
                    📋 <strong>Step 1:</strong> Fill in patient details. Fields marked with * are required.
                  </Text>
                </Box>
                <Flex direction="column" gap="3">
            {/* Name */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Name <Text color="red">*</Text></Text>
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
              <Text as="div" size="2" mb="1" weight="bold">Gender <Text color="red">*</Text></Text>
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
              <Text as="div" size="2" mb="1" weight="bold">Age <Text color="red">*</Text></Text>
              <TextField.Root
                type="text"
                value={age}
                onChange={(e) => { setAge(e.target.value); if (errors.age) setErrors(prev => ({...prev, age: undefined})); }}
                placeholder="Enter age"
                inputMode="numeric"
              />
              {errors.age && <Text size="1" className="text-red-500">{errors.age}</Text>}
            </label>

            {/* Telephone */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Telephone <Text color="red">*</Text></Text>
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
              <Text as="div" size="2" mb="1" weight="bold">Address <Text color="red">*</Text></Text>
              <TextField.Root
                value={address}
                onChange={(e) => { setAddress(e.target.value); if (errors.address) setErrors(prev => ({...prev, address: undefined})); }}
                placeholder="Enter address"
              />
              {errors.address && <Text size="1" className="text-red-500">{errors.address}</Text>}
            </label>

            {/* Vital sign */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Vital sign</Text>
              <TextArea
                value={signOfLife}
                onChange={(e) => { setSignOfLife((e.target as HTMLTextAreaElement).value); if (errors.signOfLife) setErrors(prev => ({...prev, signOfLife: undefined})); }}
                placeholder="Enter vital sign"
              />
              {errors.signOfLife && <Text size="1" className="text-red-500">{errors.signOfLife}</Text>}
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

            {/* PE */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">PE</Text>
              <TextArea
                value={pe}
                onChange={(e) => { setPe((e.target as HTMLTextAreaElement).value); if (errors.pe) setErrors(prev => ({...prev, pe: undefined})); }}
                placeholder="Enter PE"
              />
              {errors.pe && <Text size="1" className="text-red-500">{errors.pe}</Text>}
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
                  <Button onClick={proceedToNextTab}>
                    Next: Prescription
                    <ArrowRight size={16} />
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
                  <div className="col-span-12 sm:col-span-6 lg:col-span-6">
                    <Text as="div" size="2" mb="1" weight="bold">Drug</Text>
                    <Flex align="center" gap="2">
                                            <Box className="flex-1">
                                              <Flex direction="row" align="center" gap="1" className="w-full">
                                                <Box style={{ position: 'relative', flexShrink: 0, width: '137px' }}> {/* Adjust width for Select.Root */}
                                                  <Select.Root
                                                    value={medicineTypeFilter}
                                                    onValueChange={(value: 'box-strip-tablet' | 'box-only' | 'strip-only') => {
                                                      setMedicineTypeFilter(value);
                                                      fetchDrugs(debouncedDrugSearchTerm, 1);
                                                      setQty(''); // Clear existing QTY
                                                      setStripQty(''); // Clear strip QTY
                                                      setBoxQty(''); // Clear box QTY
                                                      setDoseMorning(''); // Clear dose fields
                                                      setDoseAfternoon('');
                                                      setDoseEvening('');
                                                      setDoseNight('');
                                                      setPeriod(''); // Clear period
                                                      setPrescErrors({}); // Clear prescription errors
                                                    }}
                                                  >
                                                    <Select.Trigger placeholder="Price Type" className="w-full" />
                                                    <Select.Content>
                                                      <Select.Item value="box-strip-tablet">Tablet Price</Select.Item>
                                                      <Select.Item value="box-only">Box Price</Select.Item>
                                                      <Select.Item value="strip-only">Strip Price</Select.Item>
                                                    </Select.Content>
                                                  </Select.Root>
                                                </Box>
                                                <Box style={{ position: 'relative', flexGrow: 1 }}>
                                                  <SearchableSelect
                                                    options={drugOptions.map(d => {
                                                      let priceDisplay = '';
                                                      const tabletPrice = (d.tablet_price || 0).toFixed(2);
                                                      const stripPrice = (d.strip_price || 0).toFixed(2);
                                                      const boxPrice = (d.box_price || 0).toFixed(2);
                                                      priceDisplay = `T: $${tabletPrice} | S: $${stripPrice} | B: $${boxPrice}`;
                                                      return {
                                                        value: d.id,
                                                        label: `${d.name} ${d.generic_name ? `(${d.generic_name})` : ''} ${d.unit ? `(${d.unit})` : ''} — ${priceDisplay}`
                                                      };
                                                    })}
                                                    value={selectedDrugId}
                                                    onChange={async (val) => {
                                                      const value = val as string;
                                                      if (value === '__add_custom__') {
                                                        setManualDrugOpen(true);
                                                        return;
                                                      }
                                                      setSelectedDrugId(value);
                                                      if (prescErrors.drug) setPrescErrors(prev => ({ ...prev, drug: undefined }));
                            
                                                      // Fetch latest drug data when selected
                                                      if (value) {
                                                        setIsFetchingSelectedDrug(true);
                                                        try {
                                                          const { getDrug } = await import('@/utilities/api/drugs');
                                                          const fetchedDrug = await getDrug(value);
                                                          // Update the specific drug in allDrugOptions with the latest data
                                                                                                                      setDrugOptions(prev => prev.map(d => d.id === fetchedDrug.id ? {
                                                                                                                        ...d, // Keep existing fields
                                                                                                                        ...fetchedDrug,
                                                                                                                        price: Number(fetchedDrug.price),
                                                                                                                        generic_name: fetchedDrug.generic_name,
                                                                                                                        unit: fetchedDrug.unit,
                                                                                                                        tablet_price: Number(fetchedDrug.tablet_price || 0),
                                                                                                                        box_price: Number(fetchedDrug.box_price || 0),
                                                                                                                        strip_price: Number(fetchedDrug.strip_price || 0),
                                                                                                                      } : d));                                                        } catch (error) {
                                                          console.error('Failed to fetch selected drug details:', error);
                                                          toast.error('Failed to load selected drug details');
                                                        } finally {
                                                          setIsFetchingSelectedDrug(false);
                                                        }
                                                      }
                                                    }}
                                                    placeholder="Search a drug..."
                                                    usePortal={true}
                                                    customStyles={{ width: '100%', maxWidth: '700px', height: '35px' }}
                                                    onInputChange={(value) => setDrugSearchTerm(value)}
                                                    onMenuScrollToBottom={handleMenuScrollToBottom}
                                                    isLoading={isFetchingMoreDrugs}
                                                  />
                                                </Box>
                                                {isFetchingSelectedDrug && <Text size="1" color="gray">Loading...</Text>}
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
                  {medicineTypeFilter === 'box-strip-tablet' && ( // Conditional rendering for dose and period fields
                    <>
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

                      {/* Period & QTY */}
                      <div className="col-span-6 sm:col-span-3 lg:col-span-1">
                        <Text as="div" size="2" mb="1" weight="bold">Period (days)</Text>
                        <TextField.Root type="number" value={period} onChange={(e) => { setPeriod(e.target.value); }} inputMode="numeric" min={0} step={1} placeholder="e.g. 5" />
                      </div>
                      <div className="col-span-6 sm:col-span-3 lg:col-span-1">
                        <Text as="div" size="2" mb="1" weight="bold">QTY</Text>
                        <TextField.Root type="number" value={qty} readOnly inputMode="numeric" min={0} step={1} placeholder="0" />
                      </div>
                    </>
                  )}
                  {medicineTypeFilter === 'strip-only' && ( // New QTY field for strip-only
                    <div className="col-span-6 sm:col-span-3 lg:col-span-1">
                      <Text as="div" size="2" mb="1" weight="bold">QTY (Strips)</Text>
                      <TextField.Root type="number" value={stripQty} onChange={(e) => { setStripQty(e.target.value); }} inputMode="numeric" min={0} step={1} placeholder="0" />
                    </div>
                  )}
                  {medicineTypeFilter === 'box-only' && ( // New QTY field for box-only
                    <div className="col-span-6 sm:col-span-3 lg:col-span-1">
                      <Text as="div" size="2" mb="1" weight="bold">QTY (Boxes)</Text>
                      <TextField.Root type="number" value={boxQty} onChange={(e) => { setBoxQty(e.target.value); }} inputMode="numeric" min={0} step={1} placeholder="0" />
                    </div>
                  )}
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
                  <Button onClick={addDrugToTable} disabled={isAddingDrug || isLoadingPrescriptions}>
                    <Plus size={16} />
                    {isAddingDrug ? 'Adding...' : 'Add'}
                  </Button>
                </Flex>
              </Box>
            </Box>

            {/* Prescription table */}
            <Box mt="4" key={`prescription-table-${renderKey}`}>
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
                  {isLoadingPrescriptions ? (
                    // Loading skeleton rows
                    Array.from({ length: 3 }).map((_, idx) => (
                      <Table.Row key={`skeleton-${idx}`}>
                        <Table.Cell><Box className="animate-pulse bg-gray-200 h-4 w-8 rounded" /></Table.Cell>
                        <Table.Cell><Box className="animate-pulse bg-gray-200 h-4 w-32 rounded" /></Table.Cell>
                        <Table.Cell><Box className="animate-pulse bg-gray-200 h-4 w-12 rounded" /></Table.Cell>
                        <Table.Cell><Box className="animate-pulse bg-gray-200 h-4 w-12 rounded" /></Table.Cell>
                        <Table.Cell><Box className="animate-pulse bg-gray-200 h-4 w-12 rounded" /></Table.Cell>
                        <Table.Cell><Box className="animate-pulse bg-gray-200 h-4 w-12 rounded" /></Table.Cell>
                        <Table.Cell><Box className="animate-pulse bg-gray-200 h-4 w-16 rounded" /></Table.Cell>
                        <Table.Cell><Box className="animate-pulse bg-gray-200 h-4 w-12 rounded" /></Table.Cell>
                        <Table.Cell><Box className="animate-pulse bg-gray-200 h-4 w-12 rounded" /></Table.Cell>
                        <Table.Cell><Box className="animate-pulse bg-gray-200 h-4 w-12 rounded" /></Table.Cell>
                        <Table.Cell><Box className="animate-pulse bg-gray-200 h-4 w-16 rounded" /></Table.Cell>
                        <Table.Cell><Box className="animate-pulse bg-gray-200 h-4 w-16 rounded" /></Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <>
                      {prescriptions.map((p, idx) => (
                        <Table.Row 
                          key={`${p.id}-${p.name}-${idx}`}
                          style={{
                            opacity: removingDrugIndex === idx ? 0.5 : 1,
                            transition: 'opacity 0.3s ease',
                            position: 'relative'
                          }}
                        >
                          <Table.Cell>
                            {removingDrugIndex === idx ? (
                              <Box className="animate-pulse bg-gray-200 h-4 w-8 rounded" />
                            ) : (
                              idx + 1
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {removingDrugIndex === idx ? (
                              <Box className="animate-pulse bg-gray-200 h-4 w-32 rounded" />
                            ) : (
                              <Flex align="center" gap="2">
                                <Text>{p.name}</Text>
                                <IconButton
                                  size="1"
                                  variant="ghost"
                                  color="red"
                                  onClick={() => removeDrug(idx)}
                                  title="Remove medication"
                                  disabled={removingDrugIndex !== null}
                                >
                                  <Trash2 size={14} />
                                </IconButton>
                              </Flex>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {removingDrugIndex === idx ? (
                              <Box className="animate-pulse bg-gray-200 h-4 w-12 rounded" />
                            ) : (
                              p.morning
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {removingDrugIndex === idx ? (
                              <Box className="animate-pulse bg-gray-200 h-4 w-12 rounded" />
                            ) : (
                              p.afternoon
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {removingDrugIndex === idx ? (
                              <Box className="animate-pulse bg-gray-200 h-4 w-12 rounded" />
                            ) : (
                              p.evening
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {removingDrugIndex === idx ? (
                              <Box className="animate-pulse bg-gray-200 h-4 w-12 rounded" />
                            ) : (
                              p.night
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {removingDrugIndex === idx ? (
                              <Box className="animate-pulse bg-gray-200 h-4 w-16 rounded" />
                            ) : (
                              p.period
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {removingDrugIndex === idx ? (
                              <Box className="animate-pulse bg-gray-200 h-4 w-12 rounded" />
                            ) : (
                              p.qty
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {removingDrugIndex === idx ? (
                              <Box className="animate-pulse bg-gray-200 h-4 w-12 rounded" />
                            ) : (
                              p.afterMeal ? 'Yes' : 'No'
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {removingDrugIndex === idx ? (
                              <Box className="animate-pulse bg-gray-200 h-4 w-12 rounded" />
                            ) : (
                              p.beforeMeal ? 'Yes' : 'No'
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {removingDrugIndex === idx ? (
                              <Box className="animate-pulse bg-gray-200 h-4 w-16 rounded" />
                            ) : (
                                                             `$${(p.price || 0).toFixed(2)}`                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {removingDrugIndex === idx ? (
                              <Box className="animate-pulse bg-gray-200 h-4 w-16 rounded" />
                            ) : (
                              `$${(p.price * p.qty).toFixed(2)}`
                            )}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                      {isAddingDrug && (
                        <Table.Row style={{ backgroundColor: 'var(--blue-2)' }}>
                          <Table.Cell><Box className="animate-pulse bg-blue-300 h-4 w-8 rounded" /></Table.Cell>
                          <Table.Cell><Box className="animate-pulse bg-blue-300 h-4 w-32 rounded" /></Table.Cell>
                          <Table.Cell><Box className="animate-pulse bg-blue-300 h-4 w-12 rounded" /></Table.Cell>
                          <Table.Cell><Box className="animate-pulse bg-blue-300 h-4 w-12 rounded" /></Table.Cell>
                          <Table.Cell><Box className="animate-pulse bg-blue-300 h-4 w-12 rounded" /></Table.Cell>
                          <Table.Cell><Box className="animate-pulse bg-blue-300 h-4 w-12 rounded" /></Table.Cell>
                          <Table.Cell><Box className="animate-pulse bg-blue-300 h-4 w-16 rounded" /></Table.Cell>
                          <Table.Cell><Box className="animate-pulse bg-blue-300 h-4 w-12 rounded" /></Table.Cell>
                          <Table.Cell><Box className="animate-pulse bg-blue-300 h-4 w-12 rounded" /></Table.Cell>
                          <Table.Cell><Box className="animate-pulse bg-blue-300 h-4 w-12 rounded" /></Table.Cell>
                          <Table.Cell><Box className="animate-pulse bg-blue-300 h-4 w-16 rounded" /></Table.Cell>
                          <Table.Cell><Box className="animate-pulse bg-blue-300 h-4 w-16 rounded" /></Table.Cell>
                        </Table.Row>
                      )}
                      {prescriptions.length === 0 && !isAddingDrug && (
                        <Table.Row>
                          <Table.Cell colSpan={12}>
                            <Flex direction="column" align="center" justify="center" py="6">
                              <Pill size={48} color="gray" style={{ opacity: 0.3, marginBottom: '12px' }} />
                              <Text size="2" color="gray">No medications added yet</Text>
                              <Text size="1" color="gray" mt="1">Add your first medication using the form above</Text>
                            </Flex>
                          </Table.Cell>
                        </Table.Row>
                      )}
                    </>
                  )}
                </Table.Body>
              </Table.Root>
              {/* Running total */}
              <Flex justify="end" mt="4" p="4" direction="column" gap="2" style={{ backgroundColor: 'var(--gray-12)', borderRadius: '8px', border: '1px solid var(--gray-10)' }}>
                {(() => {
                  const usdTotal = prescriptions.reduce((sum, p) => sum + (p.price * p.qty), 0);
                  const khrExchangeRate = 4000;
                  const khrTotal = usdTotal * khrExchangeRate;
                  return (
                    <Flex direction="column" gap="1" align="end">
                      <Text size="3" weight="bold" style={{ color: 'var(--gray-1)' }}>
                        Total Amount (USD): ${usdTotal.toFixed(2)}
                      </Text>
                      <Text size="3" weight="bold" style={{ color: 'var(--gray-4)' }}>
                        Total Amount (KHR): ៛{khrTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </Text>
                    </Flex>
                  );
                })()}
              </Flex>
            </Box>
          </Box>

          {/* Tab Navigation */}
          <Flex justify="between" mt="4">
            <Button variant="soft" onClick={() => handleTabChange('patient-info')}>
              <ArrowLeft size={16} />
              Back: Patient Info
            </Button>
            <Button onClick={proceedToNextTab} disabled={prescriptions.length === 0}>
              Next: Complete
              <ArrowRight size={16} />
            </Button>
          </Flex>
        </Box>
            </Tabs.Content>

            <Tabs.Content value="complete">
              <Box mt="4">
                <Box mb="4" p="3" style={{ 
                  backgroundColor: hasSaved ? 'var(--green-3)' : 'var(--gray-2)', 
                  borderRadius: '6px',
                  border: hasSaved ? '1px solid var(--green-6)' : 'none'
                }}>
                  <Text size="2" style={{ color: hasSaved ? 'var(--green-11)' : 'var(--gray-11)' }}>
                    {hasSaved ? '✅ Success! OPD history has been saved.' : '✅ Step 3: Review the patient information and prescription details. Save the patient record and export/print the prescription.'}
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
                        <Text size="2"><strong>Vital sign:</strong> {signOfLife}</Text>
                        <Text size="2"><strong>PE:</strong> {pe}</Text>
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
                    <Button onClick={handleSubmit}>
                      <Save size={16} />
                      Save OPD History
                    </Button>
                  </Flex>
                </Flex>

                {hasSaved && (
                  <Box mt="4" p="3" style={{ backgroundColor: 'var(--green-2)', borderRadius: '6px', border: '1px solid var(--green-6)' }}>
                    <Text size="2" style={{ color: 'var(--green-11)' }} mb="2">
                      ✅ OPD history saved successfully! You can now export or print the prescription.
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
