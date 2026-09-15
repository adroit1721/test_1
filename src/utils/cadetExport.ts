import { CadetUserAccount } from '../types';

export async function downloadCadetsFile(
  cadets: CadetUserAccount[],
  filterOrFormat: string = 'all',
  formatOrFilter: string = 'xlsx'
): Promise<void> {
  const isFormatFirst = ['csv', 'xlsx', 'excel', 'pdf'].includes(filterOrFormat.toLowerCase());
  const format = isFormatFirst ? filterOrFormat.toLowerCase() : formatOrFilter.toLowerCase();
  const filter = isFormatFirst ? formatOrFilter.toLowerCase() : filterOrFormat.toLowerCase();

  const isPendingApplicant = (c: CadetUserAccount) => {
    const status = String((c as any).approvalStatus || (c as any).status || '').toLowerCase();
    return c.isApproved === false || status === 'pending' || status === 'unapproved';
  };

  let filtered = Array.isArray(cadets) ? [...cadets] : [];
  if (filter === 'serving') {
    filtered = filtered.filter(
      (c) =>
        !isPendingApplicant(c) &&
        (c.cadetType || '').toLowerCase() !== 'ex-cadet' &&
        (c.category || '').toLowerCase() !== 'ex-cadets' &&
        (c.status || '').toLowerCase() !== 'alumni'
    );
  } else if (filter === 'ex') {
    filtered = filtered.filter(
      (c) =>
        !isPendingApplicant(c) &&
        ((c.status || '').toLowerCase() === 'alumni' ||
          (c.cadetType || '').toLowerCase() === 'ex' ||
          (c.cadetType || '').toLowerCase() === 'ex-cadet' ||
          (c.category || '').toLowerCase() === 'ex-cadets')
    );
  } else if (filter === 'applicants') {
    filtered = filtered.filter(isPendingApplicant);
  } else {
    // 'all' includes all approved cadets by default (or all cadets if none approved)
    const approved = filtered.filter((c) => !isPendingApplicant(c));
    if (approved.length > 0) {
      filtered = approved;
    }
  }

  // Format full cadet data mapping every single field
  const exportData =
    filtered.length === 0
      ? [
          {
            'SL No': 1,
            'Cadet ID / Cadet No': 'N/A',
            'Cadet Category': 'No records found',
            'Platoon / Wing': '',
            'Section': '',
            'Rank': '',
            'Appointment': '',
            'Batch': '',
            'Approval Status': '',
            'Account Status': '',
            'Full Name (English)': 'No records found',
            'Full Name (Bangla)': '',
            'Father\'s Name (English)': '',
            'Father\'s Name (Bangla)': '',
            'Mother\'s Name (English)': '',
            'Mother\'s Name (Bangla)': '',
            'Date of Birth': '',
            'Gender': '',
            'Blood Group': '',
            'Religion': '',
            'Class / Academic Level': '',
            'Department / Group': '',
            'College Roll / ID': '',
            'Current Profession / Job': '',
            'Cadet Mobile / Phone': '',
            'Guardian Contact Phone': '',
            'Email Address': '',
            'Social Media / Profile': '',
            'Present Address': '',
            'Permanent Address': '',
            'Additional Skills & Talents': '',
            'Achievements & Awards': '',
            'Enrolment / Joining Date': '',
            'Attendance Percentage (%)': '',
            'Parades Attended': '',
            'Total Parades': '',
            'Camps Attended': '',
            'Certificates & Badges': '',
            'Photo / Avatar URL': '',
          },
        ]
      : filtered.map((c, idx) => {
          const isEx =
            (c.cadetType || '').toLowerCase().includes('ex') ||
            (c.category || '').toLowerCase().includes('ex') ||
            (c.status || '').toLowerCase() === 'alumni';

          const cadetTypeStr = isEx ? 'Ex-Cadet Alumni' : 'Currently Serving';
          const approvalStr = c.isApproved !== false ? 'Approved' : 'Pending Approval';
          const statusStr = c.status || 'Active';

          const formatAddress = (addr: any) => {
            if (!addr) return '';
            if (typeof addr === 'string') return addr;
            if (typeof addr === 'object') {
              const parts = [
                addr.villageOrArea || addr.village,
                addr.postOffice,
                addr.upazila,
                addr.district,
                addr.division,
              ].filter(Boolean);
              return parts.join(', ');
            }
            return String(addr);
          };

          const campsStr = Array.isArray(c.campsAttended)
            ? c.campsAttended.join('; ')
            : typeof c.campsAttended === 'object' && c.campsAttended !== null
            ? JSON.stringify(c.campsAttended)
            : c.campsAttended || '';

          const certsStr = Array.isArray(c.certificates)
            ? c.certificates.join('; ')
            : typeof c.certificates === 'object' && c.certificates !== null
            ? JSON.stringify(c.certificates)
            : c.certificates || '';

          return {
            'SL No': idx + 1,
            'Cadet ID / Cadet No': c.cadetNumber || c.cadetNo || c.id || '',
            'Cadet Category': cadetTypeStr,
            'Platoon / Wing': c.platoon || c.category || '',
            'Section': c.section || '',
            'Rank': c.rank || '',
            'Appointment': c.appointment || '',
            'Batch': c.batch || '',
            'Approval Status': approvalStr,
            'Account Status': statusStr,
            'Full Name (English)': c.fullName || c.name || '',
            'Full Name (Bangla)': c.nameBangla || '',
            'Father\'s Name (English)': c.fatherName || '',
            'Father\'s Name (Bangla)': c.fatherNameBangla || '',
            'Mother\'s Name (English)': c.motherName || '',
            'Mother\'s Name (Bangla)': c.motherNameBangla || '',
            'Date of Birth': c.dob || '',
            'Gender': c.gender || '',
            'Blood Group': c.bloodGroup || '',
            'Religion': c.religion || '',
            'Class / Academic Level': c.className || '',
            'Department / Group': c.department || '',
            'College Roll / ID': c.collegeId || c.collegeRoll || '',
            'Current Profession / Job': c.currentJob || '',
            'Cadet Mobile / Phone': c.mobile || c.phone || '',
            'Guardian Contact Phone': c.guardianPhone || '',
            'Email Address': c.email || '',
            'Social Media / Profile': c.socialMedia || '',
            'Present Address': formatAddress(c.presentAddress),
            'Permanent Address': formatAddress(c.permanentAddress),
            'Additional Skills & Talents': c.additionalSkills || '',
            'Achievements & Awards': c.achievements || '',
            'Enrolment / Joining Date': c.joiningDate || '',
            'Attendance Percentage (%)': c.attendancePercentage ?? '',
            'Parades Attended': c.paradesAttended ?? '',
            'Total Parades': c.totalParades ?? '',
            'Camps Attended': campsStr,
            'Certificates & Badges': certsStr,
            'Photo / Avatar URL': c.avatarUrl || c.photoUrl || '',
          };
        });

  const filterLabel =
    filter === 'serving'
      ? 'Currently_Serving'
      : filter === 'ex'
      ? 'Ex_Cadets_Alumni'
      : filter === 'applicants'
      ? 'Applicants'
      : 'All_Cadets';
  const fileName = `NGDC_BNCC_${filterLabel}_Directory_${new Date().toISOString().slice(0, 10)}`;

  const xlsxModule = await import('xlsx');
  const XLSX = xlsxModule.default || xlsxModule;
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
    wch: Math.max(key.length + 3, 14),
  }));
  worksheet['!cols'] = colWidths;

  if (format === 'csv') {
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, filterLabel.slice(0, 31));
    try {
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('XLSX ArrayBuffer export failed, attempting CSV fallback:', err);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
}
