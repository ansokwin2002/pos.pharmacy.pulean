
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { PrescriptionData } from '@/types/pdf';

// Register Khmer font
Font.register({
  family: 'NotoSansKhmer',
  src: '/fonts/NotoSansKhmer-Regular.ttf',
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansKhmer',
    fontSize: 11,
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1a202c',
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  subtitle: {
    fontSize: 12,
    color: '#718096',
  },
  patientInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  patientInfoColumn: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#718096',
  },
  value: {
    fontSize: 11,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e0',
    paddingBottom: 5,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '10%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f7fafc',
    padding: 5,
  },
  tableCol: {
    width: '10%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 5,
  },
  tableHeader: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 35,
    right: 35,
    textAlign: 'center',
    fontSize: 10,
    color: '#a0aec0',
  },
  total: {
    textAlign: 'right',
    marginTop: 20,
  },
  totalText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export const PrescriptionDocument: React.FC<{ data: PrescriptionData, recordCreatedAt: string }> = ({ data, recordCreatedAt }) => {
  const patientInfo = data.patient || data.patient_info;
  const prescriptions = data.prescriptions || data.prescription || [];
  const totalAmount = data.totalAmount ?? data.total ?? 0;
  const now = new Date(recordCreatedAt);
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Prescription</Text>
            <Text style={styles.subtitle}>SOKLEAN HEALTH & MEDICAL CLINIC</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{dateStr}</Text>
          </View>
        </View>

        <View style={styles.patientInfo}>
          <View style={styles.patientInfoColumn}>
            <Text style={styles.label}>Patient</Text>
            <Text style={styles.value}>{patientInfo?.name || 'N/A'}</Text>
            <Text style={styles.label}>Age</Text>
            <Text style={styles.value}>{patientInfo?.age || 'N/A'}</Text>
          </View>
          <View style={styles.patientInfoColumn}>
            <Text style={styles.label}>Gender</Text>
            <Text style={styles.value}>{patientInfo?.gender || 'N/A'}</Text>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{patientInfo?.address || 'N/A'}</Text>
          </View>
        </View>

        <View>
          <Text style={styles.label}>Vital Signs</Text>
          <Text style={styles.value}>{patientInfo?.signs_of_life || 'N/A'}</Text>
          <Text style={styles.label}>Symptoms</Text>
          <Text style={styles.value}>{patientInfo?.symptom || 'N/A'}</Text>
          <Text style={styles.label}>Physical Examination (PE)</Text>
          <Text style={styles.value}>{patientInfo?.pe || 'N/A'}</Text>
          <Text style={styles.label}>Diagnosis</Text>
          <Text style={styles.value}>{patientInfo?.diagnosis || 'N/A'}</Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionTitle}>Medications</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableColHeader, width: '5%' }}><Text style={styles.tableHeader}>No.</Text></View>
              <View style={{ ...styles.tableColHeader, width: '25%' }}><Text style={styles.tableHeader}>Medication</Text></View>
              <View style={{ ...styles.tableColHeader, width: '10%' }}><Text style={styles.tableHeader}>Morning</Text></View>
              <View style={{ ...styles.tableColHeader, width: '10%' }}><Text style={styles.tableHeader}>Afternoon</Text></View>
              <View style={{ ...styles.tableColHeader, width: '10%' }}><Text style={styles.tableHeader}>Evening</Text></View>
              <View style={{ ...styles.tableColHeader, width: '10%' }}><Text style={styles.tableHeader}>Night</Text></View>
              <View style={{ ...styles.tableColHeader, width: '10%' }}><Text style={styles.tableHeader}>Period</Text></View>
              <View style={{ ...styles.tableColHeader, width: '10%' }}><Text style={styles.tableHeader}>QTY</Text></View>
              <View style={{ ...styles.tableColHeader, width: '10%' }}><Text style={styles.tableHeader}>Price</Text></View>
            </View>
            {prescriptions.map((p, i) => (
              <View key={i} style={styles.tableRow}>
                <View style={{ ...styles.tableCol, width: '5%' }}><Text>{i + 1}</Text></View>
                <View style={{ ...styles.tableCol, width: '25%' }}><Text>{p.name}</Text></View>
                <View style={{ ...styles.tableCol, width: '10%' }}><Text>{p.morning || ''}</Text></View>
                <View style={{ ...styles.tableCol, width: '10%' }}><Text>{p.afternoon || ''}</Text></View>
                <View style={{ ...styles.tableCol, width: '10%' }}><Text>{p.evening || ''}</Text></View>
                <View style={{ ...styles.tableCol, width: '10%' }}><Text>{p.night || ''}</Text></View>
                <View style={{ ...styles.tableCol, width: '10%' }}><Text>{p.period || ''}</Text></View>
                <View style={{ ...styles.tableCol, width: '10%' }}><Text>{p.qty || ''}</Text></View>
                <View style={{ ...styles.tableCol, width: '10%' }}><Text>${(p.price || 0).toFixed(2)}</Text></View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.total}>
          <Text style={styles.totalText}>Total Amount: ${totalAmount.toFixed(2)}</Text>
        </View>

        <Text style={styles.footer}>
          Note: Please follow your doctor&apos;s instructions.
        </Text>
      </Page>
    </Document>
  );
};
