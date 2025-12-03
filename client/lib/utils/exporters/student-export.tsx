import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from '@react-pdf/renderer';
import type { Student } from '@/lib/storage';

Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf',
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRowAlt: {
    backgroundColor: '#f5f7fa',
  },
  headerCell: {
    fontSize: 9,
    fontWeight: 700,
    color: '#fff',
  },
  cell: {
    fontSize: 9,
    color: '#333',
  },
  col1: { width: '12%' },
  col2: { width: '20%' },
  col3: { width: '20%' },
  col4: { width: '18%' },
  col5: { width: '15%' },
  col6: { width: '15%' },
});

interface StudentListDocumentProps {
  students: Student[];
}

const StudentListDocument: React.FC<StudentListDocumentProps> = ({ students }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Öğrenci Listesi</Text>
          <Text style={styles.subtitle}>Toplam: {students.length} öğrenci</Text>
          <Text style={styles.subtitle}>
            Tarih: {new Date().toLocaleDateString('tr-TR')}
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.col1]}>No</Text>
            <Text style={[styles.headerCell, styles.col2]}>Ad</Text>
            <Text style={[styles.headerCell, styles.col3]}>Soyad</Text>
            <Text style={[styles.headerCell, styles.col4]}>Sınıf</Text>
            <Text style={[styles.headerCell, styles.col5]}>Cinsiyet</Text>
            <Text style={[styles.headerCell, styles.col6]}>Risk</Text>
          </View>

          {students.map((student, index) => (
            <View
              key={student.id}
              style={[styles.tableRow, ...(index % 2 === 1 ? [styles.tableRowAlt] : [])]}
            >
              <Text style={[styles.cell, styles.col1]}>{student.id}</Text>
              <Text style={[styles.cell, styles.col2]}>{student.name}</Text>
              <Text style={[styles.cell, styles.col3]}>{student.surname}</Text>
              <Text style={[styles.cell, styles.col4]}>{student.class || ''}</Text>
              <Text style={[styles.cell, styles.col5]}>
                {student.gender === 'E' ? 'Erkek' : 'Kız'}
              </Text>
              <Text style={[styles.cell, styles.col6]}>{student.risk || 'Düşük'}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export function exportToCSV(students: Student[], filename: string = 'ogrenciler.csv') {
  const headers = ['Numara', 'Ad', 'Soyad', 'Sınıf', 'Cinsiyet', 'Risk Seviyesi'];
  const rows = students.map((s) => [
    s.id,
    s.name,
    s.surname,
    s.class,
    s.gender === 'E' ? 'Erkek' : 'Kız',
    s.risk || 'Düşük',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportToPDF(students: Student[], filename: string = 'ogrenciler.pdf') {
  const blob = await pdf(<StudentListDocument students={students} />).toBlob();
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToExcel(students: Student[], filename: string = 'ogrenciler.xlsx') {
  import('xlsx').then((XLSX) => {
    const worksheet = XLSX.utils.json_to_sheet(
      students.map((s) => ({
        'Öğrenci No': s.id,
        Ad: s.name,
        Soyad: s.surname,
        Sınıf: s.class,
        Cinsiyet: s.gender === 'E' ? 'Erkek' : 'Kız',
        'Risk Seviyesi': s.risk || 'Düşük',
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Öğrenciler');

    XLSX.writeFile(workbook, filename);
  });
}
