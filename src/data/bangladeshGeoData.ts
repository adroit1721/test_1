export interface District {
  id: string;
  name: string;
  bnName: string;
  upazilas: string[];
}

export interface Division {
  id: string;
  name: string;
  bnName: string;
  districts: District[];
}

export const BANGLADESH_DIVISIONS: Division[] = [
  {
    id: 'dhaka',
    name: 'Dhaka',
    bnName: 'ঢাকা',
    districts: [
      { id: 'dhaka', name: 'Dhaka', bnName: 'ঢাকা', upazilas: ['Dhamrai', 'Dohar', 'Keraniganj', 'Nawabganj', 'Savar', 'Tejgaon', 'Mirpur', 'Dhanmondi', 'Gulshan', 'Mohammadpur', 'Uttara', 'Motijheel', 'Ramna', 'Jatrabari', 'Badda', 'Khilgaon', 'Demra', 'Cantonment'] },
      { id: 'gazipur', name: 'Gazipur', bnName: 'গাজীপুর', upazilas: ['Gazipur Sadar', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur', 'Tongi'] },
      { id: 'narayanganj', name: 'Narayanganj', bnName: 'নারায়ণগঞ্জ', upazilas: ['Narayanganj Sadar', 'Araihazar', 'Bandar', 'Rupganj', 'Sonargaon'] },
      { id: 'narsingdi', name: 'Narsingdi', bnName: 'নরসিংদী', upazilas: ['Narsingdi Sadar', 'Belabo', 'Monohardi', 'Palash', 'Raipura', 'Shibpur'] },
      { id: 'tangail', name: 'Tangail', bnName: 'টাঙ্গাইল', upazilas: ['Tangail Sadar', 'Basail', 'Bhuapur', 'Delduar', 'Ghatail', 'Gopalpur', 'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur', 'Dhanbari'] },
      { id: 'manikganj', name: 'Manikganj', bnName: 'মানিকগঞ্জ', upazilas: ['Manikganj Sadar', 'Daulatpur', 'Ghior', 'Harirampur', 'Saturia', 'Shivalaya', 'Singair'] },
      { id: 'munshiganj', name: 'Munshiganj', bnName: 'মুন্সীগঞ্জ', upazilas: ['Munshiganj Sadar', 'Gazaria', 'Lohajang', 'Sirajdikhan', 'Sreenagar', 'Tongibari'] },
      { id: 'faridpur', name: 'Faridpur', bnName: 'ফরিদপুর', upazilas: ['Faridpur Sadar', 'Alfadanga', 'Bhanga', 'Boalmari', 'Charbhadrasan', 'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha'] },
      { id: 'gopalganj', name: 'Gopalganj', bnName: 'গোপালগঞ্জ', upazilas: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'] },
      { id: 'madaripur', name: 'Madaripur', bnName: 'মাদারীপুর', upazilas: ['Madaripur Sadar', 'Kalkini', 'Rajoir', 'Shibchar'] },
      { id: 'rajbari', name: 'Rajbari', bnName: 'রাজবাড়ী', upazilas: ['Rajbari Sadar', 'Baliakandi', 'Goalandaghat', 'Pangsha', 'Kalukhali'] },
      { id: 'shariatpur', name: 'Shariatpur', bnName: 'শরীয়তপুর', upazilas: ['Shariatpur Sadar', 'Bhedarganj', 'Damudya', 'Gosairhat', 'Naria', 'Zajira'] },
      { id: 'kishoreganj', name: 'Kishoreganj', bnName: 'কিশোরগঞ্জ', upazilas: ['Kishoreganj Sadar', 'Austagram', 'Bajitpur', 'Bhairab', 'Hossainpur', 'Itna', 'Karimganj', 'Katiadi', 'Kuliarchar', 'Mithamain', 'Nikli', 'Pakundia', 'Tarail'] },
    ],
  },
  {
    id: 'chattogram',
    name: 'Chattogram',
    bnName: 'চট্টগ্রাম',
    districts: [
      { id: 'chattogram', name: 'Chattogram', bnName: 'চট্টগ্রাম', upazilas: ['Anwara', 'Banshkhali', 'Boalkhali', 'Chandanaish', 'Fatikchhari', 'Hathazari', 'Karnafuli', 'Lohagara', 'Mirsarai', 'Patiya', 'Rangunia', 'Raozan', 'Sandwip', 'Satkania', 'Sitakunda', 'Kotwali', 'Panchlaish', 'Double Mooring', 'Halishahar', 'Khulshi', 'Bayezid', 'Pahartali'] },
      { id: 'coxsbazar', name: 'Cox\'s Bazar', bnName: 'কক্সবাজার', upazilas: ['Cox\'s Bazar Sadar', 'Chakaria', 'Kutubdia', 'Maheshkhali', 'Ramu', 'Teknaf', 'Ukhia', 'Pekua'] },
      { id: 'cumilla', name: 'Cumilla', bnName: 'কুমিল্লা', upazilas: ['Cumilla Sadar', 'Barura', 'Brahmanpara', 'Burichang', 'Chandina', 'Chauddagram', 'Daudkandi', 'Debidwar', 'Homna', 'Laksam', 'Monohorgonj', 'Meghna', 'Muradnagar', 'Nangalkot', 'Titas', 'Lalmai'] },
      { id: 'feni', name: 'Feni', bnName: 'ফেনী', upazilas: ['Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan', 'Parshuram', 'Fulgazi', 'Sonagazi'] },
      { id: 'brahmanbaria', name: 'Brahmanbaria', bnName: 'ব্রাহ্মণবাড়িয়া', upazilas: ['Brahmanbaria Sadar', 'Akhaura', 'Ashuganj', 'Bancharampur', 'Bijoynagar', 'Kasba', 'Nabinagar', 'Nasirnagar', 'Sarail'] },
      { id: 'noakhali', name: 'Noakhali', bnName: 'নোয়াখালী', upazilas: ['Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Senbagh', 'Sonaimuri', 'Subarnachar', 'Kabirhat'] },
      { id: 'chandpur', name: 'Chandpur', bnName: 'চাঁদপুর', upazilas: ['Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj', 'Kachua', 'Matlab North', 'Matlab South', 'Shahrasti'] },
      { id: 'lakshmipur', name: 'Lakshmipur', bnName: 'লক্ষ্মীপুর', upazilas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar'] },
      { id: 'rangamati', name: 'Rangamati', bnName: 'রাঙ্গামাটি', upazilas: ['Rangamati Sadar', 'Bagaichhari', 'Barkal', 'Belaichhari', 'Juraichhari', 'Kaptai', 'Kawkhali', 'Langadu', 'Naniarchar', 'Rajasthali'] },
      { id: 'bandarban', name: 'Bandarban', bnName: 'বান্দরবান', upazilas: ['Bandarban Sadar', 'Ali Kadam', 'Lama', 'Naikhongchhari', 'Rowangchhari', 'Ruma', 'Thanchi'] },
      { id: 'khagrachhari', name: 'Khagrachhari', bnName: 'খাগড়াছড়ি', upazilas: ['Khagrachhari Sadar', 'Dighinala', 'Lakshmichhari', 'Mahalchhari', 'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh', 'Guimara'] },
    ],
  },
  {
    id: 'rajshahi',
    name: 'Rajshahi',
    bnName: 'রাজশাহী',
    districts: [
      { id: 'rajshahi', name: 'Rajshahi', bnName: 'রাজশাহী', upazilas: ['Boalia', 'Rajpara', 'Motihar', 'Shah Makhdum', 'Chandrima', 'Kasiadanga', 'Katakhali', 'Bagha', 'Bagmara', 'Charghat', 'Durgapur', 'Godagari', 'Mohanpur', 'Paba', 'Puthia', 'Tanore'] },
      { id: 'bogura', name: 'Bogura', bnName: 'বগুড়া', upazilas: ['Bogura Sadar', 'Adamdighi', 'Dhunat', 'Dhupchanchia', 'Gabtali', 'Kahaloo', 'Nandigram', 'Sariakandi', 'Sahajanpur', 'Sherpur', 'Shibganj', 'Sonatala'] },
      { id: 'pabna', name: 'Pabna', bnName: 'পাবনা', upazilas: ['Pabna Sadar', 'Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi', 'Santhia', 'Sujanagar'] },
      { id: 'sirajganj', name: 'Sirajganj', bnName: 'সিরাজগঞ্জ', upazilas: ['Sirajganj Sadar', 'Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Raiganj', 'Shahjadpur', 'Tarash', 'Ullahpara'] },
      { id: 'naogaon', name: 'Naogaon', bnName: 'নওগাঁ', upazilas: ['Naogaon Sadar', 'Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda', 'Mohadevpur', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar'] },
      { id: 'natore', name: 'Natore', bnName: 'নাটোর', upazilas: ['Natore Sadar', 'Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Singra', 'Naldanga'] },
      { id: 'chapainawabganj', name: 'Chapainawabganj', bnName: 'চাঁপাইনবাবগঞ্জ', upazilas: ['Chapainawabganj Sadar', 'Bholahat', 'Gomastapur', 'Nachole', 'Shibganj'] },
      { id: 'joypurhat', name: 'Joypurhat', bnName: 'জয়পুরহাট', upazilas: ['Joypurhat Sadar', 'Akkelpur', 'Kalai', 'Khetlal', 'Panchbibi'] },
    ],
  },
  {
    id: 'khulna',
    name: 'Khulna',
    bnName: 'খুলনা',
    districts: [
      { id: 'khulna', name: 'Khulna', bnName: 'খুলনা', upazilas: ['Khulna Sadar', 'Batiaghata', 'Dacope', 'Dumuria', 'Dighalia', 'Koyra', 'Paikgachha', 'Phultala', 'Rupsha', 'Terokhada', 'Sonadanga', 'Khalishpur', 'Daulatpur', 'Khan Jahan Ali'] },
      { id: 'jashore', name: 'Jashore', bnName: 'যশোর', upazilas: ['Jashore Sadar', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha', 'Keshabpur', 'Manirampur', 'Sharsha'] },
      { id: 'satkhira', name: 'Satkhira', bnName: 'সাতক্ষীরা', upazilas: ['Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala'] },
      { id: 'bagerhat', name: 'Bagerhat', bnName: 'বাগেরহাট', upazilas: ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'] },
      { id: 'kushtia', name: 'Kushtia', bnName: 'কুষ্টিয়া', upazilas: ['Kushtia Sadar', 'Bheramara', 'Daulatpur', 'Khoksa', 'Kumarkhali', 'Mirpur'] },
      { id: 'chuadanga', name: 'Chuadanga', bnName: 'চুয়াডাঙ্গা', upazilas: ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar'] },
      { id: 'meherpur', name: 'Meherpur', bnName: 'মেহেরপুর', upazilas: ['Meherpur Sadar', 'Gangni', 'Mujibnagar'] },
      { id: 'jhenaidah', name: 'Jhenaidah', bnName: 'ঝিনাইদহ', upazilas: ['Jhenaidah Sadar', 'Harinakunda', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa'] },
      { id: 'magura', name: 'Magura', bnName: 'মাগুরা', upazilas: ['Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'] },
      { id: 'narail', name: 'Narail', bnName: 'নড়াইল', upazilas: ['Narail Sadar', 'Kalia', 'Lohagara'] },
    ],
  },
  {
    id: 'barishal',
    name: 'Barishal',
    bnName: 'বরিশাল',
    districts: [
      { id: 'barishal', name: 'Barishal', bnName: 'বরিশাল', upazilas: ['Barishal Sadar', 'Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara', 'Gaurnadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur'] },
      { id: 'bhola', name: 'Bhola', bnName: 'ভোলা', upazilas: ['Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin'] },
      { id: 'jhalokathi', name: 'Jhalokathi', bnName: 'ঝালকাঠি', upazilas: ['Jhalokathi Sadar', 'Kathalia', 'Nalchhiti', 'Rajapur'] },
      { id: 'pirojpur', name: 'Pirojpur', bnName: 'পিরোজপুর', upazilas: ['Pirojpur Sadar', 'Bhandaria', 'Kawkhali', 'Mathbaria', 'Nazirpur', 'Nesarabad (Swarupkathi)', 'Zianagar (Indurkani)'] },
      { id: 'barguna', name: 'Barguna', bnName: 'বরগুনা', upazilas: ['Barguna Sadar', 'Amtali', 'Bamna', 'Betagi', 'Patharghata', 'Taltali'] },
      { id: 'patuakhali', name: 'Patuakhali', bnName: 'পটুয়াখালী', upazilas: ['Patuakhali Sadar', 'Bauphal', 'Dashmina', 'Galachipa', 'Kalapara', 'Mirzaganj', 'Rangabali', 'Dumki'] },
    ],
  },
  {
    id: 'sylhet',
    name: 'Sylhet',
    bnName: 'সিলেট',
    districts: [
      { id: 'sylhet', name: 'Sylhet', bnName: 'সিলেট', upazilas: ['Sylhet Sadar', 'Balaganj', 'Beanibazar', 'Bishwanath', 'Companiganj', 'Dakshin Surma', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Osmani Nagar', 'Zakiganj'] },
      { id: 'moulvibazar', name: 'Moulvibazar', bnName: 'মৌলভীবাজার', upazilas: ['Moulvibazar Sadar', 'Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Rajnagar', 'Sreemangal'] },
      { id: 'habiganj', name: 'Habiganj', bnName: 'হবিগঞ্জ', upazilas: ['Habiganj Sadar', 'Ajmiriganj', 'Bahubal', 'Baniyachong', 'Chunarughat', 'Lakhai', 'Madhabpur', 'Nabiganj', 'Sayestaganj'] },
      { id: 'sunamganj', name: 'Sunamganj', bnName: 'সুনামগঞ্জ', upazilas: ['Sunamganj Sadar', 'Bishwamvarpur', 'Chhatak', 'Derai', 'Dharampasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Shantiganj (South Sunamganj)', 'Sullah', 'Tahirpur', 'Madhyanagar'] },
    ],
  },
  {
    id: 'rangpur',
    name: 'Rangpur',
    bnName: 'রংপুর',
    districts: [
      { id: 'rangpur', name: 'Rangpur', bnName: 'রংপুর', upazilas: ['Rangpur Sadar', 'Badarganj', 'Gangachhara', 'Kaunia', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Taraganj'] },
      { id: 'dinajpur', name: 'Dinajpur', bnName: 'দিনাজপুর', upazilas: ['Dinajpur Sadar', 'Birampur', 'Birganj', 'Biral', 'Bochaganj', 'Chirirbandar', 'Phulbari', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama', 'Nawabganj', 'Parbatipur'] },
      { id: 'gaibandha', name: 'Gaibandha', bnName: 'গাইবান্ধা', upazilas: ['Gaibandha Sadar', 'Fulchhari', 'Gobindaganj', 'Palashbari', 'Sadullapur', 'Saghata', 'Sundarganj'] },
      { id: 'kurigram', name: 'Kurigram', bnName: 'কুড়িগ্রাম', upazilas: ['Kurigram Sadar', 'Bhurungamari', 'Char Rajibpur', 'Chilmari', 'Phulbari', 'Nageshwari', 'Rajarhat', 'Raomari', 'Ulipur'] },
      { id: 'lalmonirhat', name: 'Lalmonirhat', bnName: 'লালমনিরহাট', upazilas: ['Lalmonirhat Sadar', 'Aditmari', 'Hatibandha', 'Kaliganj', 'Patgram'] },
      { id: 'nilphamari', name: 'Nilphamari', bnName: 'নীলফামারী', upazilas: ['Nilphamari Sadar', 'Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Syedpur'] },
      { id: 'panchagarh', name: 'Panchagarh', bnName: 'পঞ্চগড়', upazilas: ['Panchagarh Sadar', 'Atwari', 'Boda', 'Debiganj', 'Tetulia'] },
      { id: 'thakurgaon', name: 'Thakurgaon', bnName: 'ঠাকুরগাঁও', upazilas: ['Thakurgaon Sadar', 'Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail'] },
    ],
  },
  {
    id: 'mymensingh',
    name: 'Mymensingh',
    bnName: 'ময়মনসিংহ',
    districts: [
      { id: 'mymensingh', name: 'Mymensingh', bnName: 'ময়মনসিংহ', upazilas: ['Mymensingh Sadar', 'Bhaluka', 'Dhobaura', 'Fulbaria', 'Gafargaon', 'Gauripur', 'Haluaghat', 'Ishwarganj', 'Muktagachha', 'Nandail', 'Phulpur', 'Trishal', 'Tara Khanda'] },
      { id: 'jamalpur', name: 'Jamalpur', bnName: 'জামালপুর', upazilas: ['Jamalpur Sadar', 'Bakshiganj', 'Dewanganj', 'Islampur', 'Madarganj', 'Melandaha', 'Sarishabari'] },
      { id: 'netrokona', name: 'Netrokona', bnName: 'নেত্রকোণা', upazilas: ['Netrokona Sadar', 'Atpara', 'Barhatta', 'Durgapur', 'Khaliajuri', 'Kalmakanda', 'Kendua', 'Madan', 'Mohanganj', 'Purbadhala'] },
      { id: 'sherpur', name: 'Sherpur', bnName: 'শেরপুর', upazilas: ['Sherpur Sadar', 'Jhenaigati', 'Nakla', 'Nalitabari', 'Sreebardi'] },
    ],
  },
];

export const BANGLADESH_EDUCATION_BOARDS = [
  'Dhaka',
  'Chattogram',
  'Rajshahi',
  'Cumilla',
  'Jessore',
  'Barishal',
  'Sylhet',
  'Dinajpur',
  'Mymensingh',
  'Madrasah',
  'Technical',
];

export const DIVISION_GROUP_OPTIONS = [
  'Science',
  'Humanities / Arts',
  'Business Studies / Commerce',
  'Vocational / Technical',
];

export function getDistrictsByDivision(divisionIdOrName: string): District[] {
  if (!divisionIdOrName) return [];
  const normalized = divisionIdOrName.trim().toLowerCase();
  const div = BANGLADESH_DIVISIONS.find(
    (d) => d.id.toLowerCase() === normalized || d.name.toLowerCase() === normalized || d.bnName === divisionIdOrName
  );
  return div ? div.districts : [];
}

export function getUpazilasByDistrict(districtIdOrName: string): string[] {
  if (!districtIdOrName) return ['Sadar'];
  const normalized = districtIdOrName.trim().toLowerCase();
  for (const div of BANGLADESH_DIVISIONS) {
    const dist = div.districts.find(
      (d) => d.id.toLowerCase() === normalized || d.name.toLowerCase() === normalized || d.bnName === districtIdOrName
    );
    if (dist && dist.upazilas && dist.upazilas.length > 0) {
      return dist.upazilas;
    }
  }
  return ['Sadar'];
}

