import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, lineHeight: 1.35 },
  h1: { fontSize: 16, marginBottom: 12, fontWeight: 'bold' },
  section: { marginTop: 10 },
});

export interface SimpleContractData {
  title: string;
  employerName: string;
  employerAddress?: string;
  employeeName: string;
  employeeAddress?: string;
  effectiveDate?: string;
  body?: string;
}

export async function generateSimpleContractPdfBlob(data: SimpleContractData) {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{data.title}</Text>
        <View style={styles.section}>
          <Text>Employer: {data.employerName}{data.employerAddress ? `, ${data.employerAddress}` : ''}</Text>
          <Text>Employee: {data.employeeName}{data.employeeAddress ? `, ${data.employeeAddress}` : ''}</Text>
          {data.effectiveDate && <Text>Effective: {data.effectiveDate}</Text>}
        </View>
        {data.body && (
          <View style={styles.section}>
            <Text>{data.body}</Text>
          </View>
        )}
        <View style={styles.section}>
          <Text>Employer signature: __________________    Date: __________</Text>
          <Text>Employee signature: __________________    Date: __________</Text>
        </View>
      </Page>
    </Document>
  );
  const instance = pdf(doc);
  const blob = await instance.toBlob();
  return blob;
}



