import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Department from './models/Department.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import Appointment from './models/Appointment.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/carepoint';

const departmentsData = [
  {
    name: 'Cardiology',
    description: 'Comprehensive heart and cardiovascular care with state-of-the-art diagnostic and surgical capabilities.',
    icon: 'Heart',
    headDoctorName: 'Dr. Marcus Reynolds',
    image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Neurology',
    description: 'Expert neurological diagnosis and advanced therapeutics for brain, spine, and nerve disorders.',
    icon: 'Brain',
    headDoctorName: 'Dr. Sarah Chen',
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Orthopedics',
    description: 'Advanced joint replacement, sports injury rehab, spinal treatment, and bone trauma care.',
    icon: 'Bone',
    headDoctorName: 'Dr. David Miller',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Pediatrics',
    description: 'Compassionate, family-centered medical care for infants, children, and adolescents.',
    icon: 'Baby',
    headDoctorName: 'Dr. Emily Watson',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'General Medicine',
    description: 'Primary care, preventive screenings, annual physicals, and management of chronic diseases.',
    icon: 'Stethoscope',
    headDoctorName: 'Dr. James Wilson',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dermatology',
    description: 'Comprehensive dermatologic consultations, skin cancer screening, and therapeutic treatments.',
    icon: 'Sparkles',
    headDoctorName: 'Dr. Sophia Patel',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Ophthalmology',
    description: 'State-of-the-art vision correction, cataract laser surgery, glaucoma therapy, and retinal care.',
    icon: 'Eye',
    headDoctorName: 'Dr. Alan Vance',
    image: 'https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dentistry',
    description: 'Modern aesthetic dentistry, oral reconstructive surgeries, periodontal health, and root canal therapy.',
    icon: 'Smile',
    headDoctorName: 'Dr. Chloe Bennett',
    image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Gynecology',
    description: 'Comprehensive womens reproductive health, maternal-fetal medicine, and prenatal guidance.',
    icon: 'UserCheck',
    headDoctorName: 'Dr. Rebecca Hughes',
    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'ENT (Otolaryngology)',
    description: 'Specialized diagnostic and surgical care for disorders of the ear, nose, throat, head, and neck.',
    icon: 'Mic',
    headDoctorName: 'Dr. Kevin Brooks',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
  },
];

const seedDatabase = async () => {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected! Purging existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      Appointment.deleteMany({}),
    ]);

    console.log('Old records cleared.');

    // 1. Create Departments
    console.log('Seeding departments...');
    const insertedDepts = await Department.insertMany(departmentsData);
    const deptMap = {};
    insertedDepts.forEach((d) => {
      deptMap[d.name] = d._id;
    });

    // 2. Create Admin
    console.log('Seeding Admin user...');
    const adminUser = await User.create({
      name: 'Dr. Eleanor Vance (Chief Admin)',
      email: 'admin@carepoint.com',
      password: 'Admin@1234',
      role: 'admin',
      phone: '+1 (555) 019-2834',
      address: 'CarePoint Health Plaza, Suite 900, New York, NY',
      gender: 'female',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      status: 'active',
    });

    // 3. Create Doctors
    console.log('Seeding Doctors...');
    const doctorConfigs = [
      {
        name: 'Dr. Marcus Reynolds',
        email: 'dr.reynolds@carepoint.com',
        phone: '+1 (555) 234-5671',
        gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
        department: deptMap['Cardiology'],
        specialization: 'Interventional Cardiology & Electrophysiology',
        qualifications: ['MD - Harvard Medical School', 'FACC Fellow', 'Board Certified Cardiology'],
        experienceYears: 14,
        consultationFee: 120,
        rating: 4.9,
        reviewCount: 48,
        bio: 'Dr. Reynolds is a renowned interventional cardiologist specializing in coronary artery disease, heart rhythm disorders, and minimally invasive catheter therapies with over 14 years of clinical distinction.',
        roomNumber: 'Tower A - Suite 402',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      {
        name: 'Dr. Sarah Chen',
        email: 'dr.chen@carepoint.com',
        phone: '+1 (555) 345-6782',
        gender: 'female',
        avatar: 'https://images.unsplash.com/photo-1594824813626-d62f40c74147?w=300&auto=format&fit=crop&q=80',
        department: deptMap['Neurology'],
        specialization: 'Clinical Neurophysiology & Stroke Care',
        qualifications: ['MD PhD - Johns Hopkins', 'FAAN Fellow', 'Cerebrovascular Specialist'],
        experienceYears: 11,
        consultationFee: 110,
        rating: 4.85,
        reviewCount: 39,
        bio: 'Dr. Chen provides expert compassionate treatment for complex neurological conditions including chronic migraine, neuromuscular disorders, Parkinson’s disease, and post-stroke rehabilitation.',
        roomNumber: 'Tower B - Suite 310',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
      },
      {
        name: 'Dr. David Miller',
        email: 'dr.miller@carepoint.com',
        phone: '+1 (555) 456-7893',
        gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
        department: deptMap['Orthopedics'],
        specialization: 'Orthopedic Surgery & Sports Medicine',
        qualifications: ['MD - Stanford University', 'AAOS Member', 'Fellowship Adult Reconstruction'],
        experienceYears: 16,
        consultationFee: 95,
        rating: 4.92,
        reviewCount: 64,
        bio: 'Specializing in computer-navigated total knee and hip arthroplasty, rotator cuff repair, and elite athletic performance restoration.',
        roomNumber: 'West Pavilion - Suite 105',
        availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
      },
      {
        name: 'Dr. Emily Watson',
        email: 'dr.watson@carepoint.com',
        phone: '+1 (555) 567-8904',
        gender: 'female',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
        department: deptMap['Pediatrics'],
        specialization: 'General Pediatrics & Adolescent Medicine',
        qualifications: ['MD - Columbia Vagelos', 'FAAP Certified', 'Pediatric Life Support Lead'],
        experienceYears: 9,
        consultationFee: 80,
        rating: 4.95,
        reviewCount: 52,
        bio: 'Dedicated to helping children thrive through developmental milestone tracking, gentle pediatric consultations, vaccinations, and supportive family counseling.',
        roomNumber: 'Children’s Wing - Suite 201',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      {
        name: 'Dr. James Wilson',
        email: 'dr.wilson@carepoint.com',
        phone: '+1 (555) 678-9015',
        gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80',
        department: deptMap['General Medicine'],
        specialization: 'Internal Medicine & Preventive Care',
        qualifications: ['MD - Yale School of Medicine', 'FACP Member', 'Internal Medicine Certified'],
        experienceYears: 12,
        consultationFee: 65,
        rating: 4.78,
        reviewCount: 41,
        bio: 'Focuses on holistic adult primary care, hypertension management, diabetes mellitus control, executive health assessments, and longevity strategies.',
        roomNumber: 'Main Building - Suite 112',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
      {
        name: 'Dr. Sophia Patel',
        email: 'dr.patel@carepoint.com',
        phone: '+1 (555) 789-0126',
        gender: 'female',
        avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300&auto=format&fit=crop&q=80',
        department: deptMap['Dermatology'],
        specialization: 'Clinical Dermatology & Dermatologic Surgery',
        qualifications: ['MD - UCLA David Geffen', 'FAAD Certified', 'Cosmetic & Medical Dermatology'],
        experienceYears: 8,
        consultationFee: 90,
        rating: 4.88,
        reviewCount: 33,
        bio: 'Expertise in mole mapping, eczema management, psoriasis biologic therapy, acne scar resurfacing, and advanced clinical aesthetics.',
        roomNumber: 'East Clinic - Suite 304',
        availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
      },
    ];

    const doctorsList = [];

    for (const d of doctorConfigs) {
      const user = await User.create({
        name: d.name,
        email: d.email,
        password: 'Doctor@1234',
        role: 'doctor',
        phone: d.phone,
        gender: d.gender,
        avatar: d.avatar,
        status: 'active',
      });

      const doctor = await Doctor.create({
        user: user._id,
        department: d.department,
        specialization: d.specialization,
        qualifications: d.qualifications,
        experienceYears: d.experienceYears,
        consultationFee: d.consultationFee,
        rating: d.rating,
        reviewCount: d.reviewCount,
        bio: d.bio,
        roomNumber: d.roomNumber,
        availableDays: d.availableDays,
        timeSlots: [
          '09:00 AM',
          '09:30 AM',
          '10:00 AM',
          '10:30 AM',
          '11:00 AM',
          '11:30 AM',
          '02:00 PM',
          '02:30 PM',
          '03:00 PM',
          '03:30 PM',
          '04:00 PM',
          '04:30 PM',
        ],
        isAvailable: true,
      });

      doctorsList.push(doctor);
    }

    // 4. Create Patients
    console.log('Seeding Patients...');
    const patientConfigs = [
      {
        name: 'John Doe',
        email: 'patient@carepoint.com',
        phone: '+1 (555) 901-2345',
        gender: 'male',
        dateOfBirth: new Date('1990-05-14'),
        address: '742 Evergreen Terrace, Springfield, OR',
        bloodGroup: 'O+',
        allergies: ['Penicillin'],
        medicalHistory: ['Mild Seasonal Asthma', 'Appendectomy (2018)'],
        emergencyContact: { name: 'Mary Doe', phone: '+1 (555) 901-9999', relationship: 'Spouse' },
      },
      {
        name: 'Maria Garcia',
        email: 'maria.g@example.com',
        phone: '+1 (555) 912-3456',
        gender: 'female',
        dateOfBirth: new Date('1995-11-20'),
        address: '104 Ocean View Drive, Miami, FL',
        bloodGroup: 'A+',
        allergies: ['Latex', 'Sulfa drugs'],
        medicalHistory: ['Migraine with aura'],
        emergencyContact: { name: 'Carlos Garcia', phone: '+1 (555) 912-8888', relationship: 'Brother' },
      },
      {
        name: 'Robert Taylor',
        email: 'robert.t@example.com',
        phone: '+1 (555) 923-4567',
        gender: 'male',
        dateOfBirth: new Date('1982-08-03'),
        address: '512 Pinecrest Blvd, Chicago, IL',
        bloodGroup: 'B+',
        allergies: [],
        medicalHistory: ['Hypertension', 'Elevated LDL Cholesterol'],
        emergencyContact: { name: 'Emma Taylor', phone: '+1 (555) 923-7777', relationship: 'Wife' },
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa.a@example.com',
        phone: '+1 (555) 934-5678',
        gender: 'female',
        dateOfBirth: new Date('1988-02-18'),
        address: '89 Maple Avenue, Austin, TX',
        bloodGroup: 'AB+',
        allergies: ['Aspirin'],
        medicalHistory: ['Hypothyroidism'],
        emergencyContact: { name: 'James Anderson', phone: '+1 (555) 934-6666', relationship: 'Father' },
      },
      {
        name: 'Michael Scott',
        email: 'michael.s@example.com',
        phone: '+1 (555) 945-6789',
        gender: 'male',
        dateOfBirth: new Date('1980-03-15'),
        address: '1725 Slough Avenue, Scranton, PA',
        bloodGroup: 'O-',
        allergies: ['Peanuts'],
        medicalHistory: ['Foot burn on George Foreman grill (resolved)'],
        emergencyContact: { name: 'Dwight Schrute', phone: '+1 (555) 945-5555', relationship: 'Colleague' },
      },
      {
        name: 'Emily Davis',
        email: 'emily.d@example.com',
        phone: '+1 (555) 956-7890',
        gender: 'female',
        dateOfBirth: new Date('1998-07-29'),
        address: '333 West End Ave, New York, NY',
        bloodGroup: 'A-',
        allergies: [],
        medicalHistory: ['Sports Knee Sprain (2023)'],
        emergencyContact: { name: 'Sarah Davis', phone: '+1 (555) 956-4444', relationship: 'Mother' },
      },
    ];

    const patientsList = [];

    for (const p of patientConfigs) {
      const user = await User.create({
        name: p.name,
        email: p.email,
        password: 'Patient@1234',
        role: 'patient',
        phone: p.phone,
        gender: p.gender,
        dateOfBirth: p.dateOfBirth,
        address: p.address,
        status: 'active',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.name)}`,
      });

      const patient = await Patient.create({
        user: user._id,
        bloodGroup: p.bloodGroup,
        allergies: p.allergies,
        medicalHistory: p.medicalHistory,
        emergencyContact: p.emergencyContact,
        insuranceProvider: 'BlueCross BlueShield CarePlus',
        insurancePolicyNumber: `BCBS-${Math.floor(100000 + Math.random() * 900000)}`,
      });

      patientsList.push({ user, patient });
    }

    // 5. Create Appointments (Historical, Today, and Upcoming)
    console.log('Seeding Appointments...');

    const today = new Date();
    const getDateOffset = (days) => {
      const d = new Date(today);
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    const appointmentsData = [
      // Today appointments
      {
        patient: patientsList[0].user._id,
        doctor: doctorsList[0]._id, // Dr. Reynolds (Cardio)
        department: deptMap['Cardiology'],
        appointmentDate: getDateOffset(0),
        appointmentTime: '10:00 AM',
        reason: 'Annual cardiovascular checkup and ECG reading evaluation',
        status: 'approved',
        fee: 120,
        notes: 'Patient reports occasional shortness of breath after heavy cardio.',
      },
      {
        patient: patientsList[1].user._id,
        doctor: doctorsList[1]._id, // Dr. Chen (Neuro)
        department: deptMap['Neurology'],
        appointmentDate: getDateOffset(0),
        appointmentTime: '02:30 PM',
        reason: 'Severe persistent migraine headaches with visual aura',
        status: 'approved',
        fee: 110,
        notes: 'Episode frequency has increased to 3 times per week.',
      },
      {
        patient: patientsList[2].user._id,
        doctor: doctorsList[4]._id, // Dr. Wilson (General Med)
        department: deptMap['General Medicine'],
        appointmentDate: getDateOffset(0),
        appointmentTime: '11:00 AM',
        reason: 'Quarterly hypertension and prescription review',
        status: 'pending',
        fee: 65,
        notes: 'Needs refill for Lisinopril 10mg daily.',
      },
      // Upcoming appointments
      {
        patient: patientsList[0].user._id,
        doctor: doctorsList[2]._id, // Dr. Miller (Ortho)
        department: deptMap['Orthopedics'],
        appointmentDate: getDateOffset(2),
        appointmentTime: '09:30 AM',
        reason: 'Post-rehabilitation knee stiffness assessment',
        status: 'pending',
        fee: 95,
        notes: 'Left knee has slight swelling after long standing.',
      },
      {
        patient: patientsList[3].user._id,
        doctor: doctorsList[5]._id, // Dr. Patel (Derm)
        department: deptMap['Dermatology'],
        appointmentDate: getDateOffset(3),
        appointmentTime: '03:00 PM',
        reason: 'Skin lesion check and recurring dermatitis flare-up',
        status: 'approved',
        fee: 90,
      },
      {
        patient: patientsList[4].user._id,
        doctor: doctorsList[3]._id, // Dr. Watson (Pediatrics)
        department: deptMap['Pediatrics'],
        appointmentDate: getDateOffset(4),
        appointmentTime: '10:30 AM',
        reason: 'Routine pediatric wellness checkup and school health certificate',
        status: 'pending',
        fee: 80,
      },
      {
        patient: patientsList[5].user._id,
        doctor: doctorsList[0]._id, // Dr. Reynolds
        department: deptMap['Cardiology'],
        appointmentDate: getDateOffset(5),
        appointmentTime: '04:00 PM',
        reason: 'Family history of arrhythmia, requests preventive consultation',
        status: 'approved',
        fee: 120,
      },
      // Past Completed Appointments
      {
        patient: patientsList[0].user._id,
        doctor: doctorsList[4]._id,
        department: deptMap['General Medicine'],
        appointmentDate: getDateOffset(-2),
        appointmentTime: '09:00 AM',
        reason: 'Annual complete metabolic panel and preventive screening',
        status: 'completed',
        fee: 65,
        doctorNotes: 'BP 118/76 mmHg. Cholesterol panel within normal limits. Continued healthy diet.',
        prescription: 'Multivitamins once daily. Follow up in 12 months.',
      },
      {
        patient: patientsList[1].user._id,
        doctor: doctorsList[1]._id,
        department: deptMap['Neurology'],
        appointmentDate: getDateOffset(-4),
        appointmentTime: '11:00 AM',
        reason: 'Initial consultation for tension headaches',
        status: 'completed',
        fee: 110,
        doctorNotes: 'Cranial nerve exam normal. Recommended lifestyle adjustments and magnesium supplements.',
        prescription: 'Sumatriptan 50mg PRN for acute migraine. Magnesium glycinate 400mg daily.',
      },
      {
        patient: patientsList[2].user._id,
        doctor: doctorsList[2]._id,
        department: deptMap['Orthopedics'],
        appointmentDate: getDateOffset(-7),
        appointmentTime: '02:00 PM',
        reason: 'Right ankle ligament sprain following tennis match',
        status: 'completed',
        fee: 95,
        doctorNotes: 'Grade 1 sprain. X-ray negative for fracture. Swelling subsiding.',
        prescription: 'RICE protocol, supportive ankle brace for 2 weeks.',
      },
      {
        patient: patientsList[3].user._id,
        doctor: doctorsList[5]._id,
        department: deptMap['Dermatology'],
        appointmentDate: getDateOffset(-10),
        appointmentTime: '03:30 PM',
        reason: 'Allergic contact dermatitis on hands and wrists',
        status: 'completed',
        fee: 90,
        doctorNotes: 'Irritant contact dermatitis confirmed. Patch testing recommended.',
        prescription: 'Hydrocortisone 2.5% topical cream twice daily for 7 days.',
      },
      // Cancelled & Rejected appointments
      {
        patient: patientsList[4].user._id,
        doctor: doctorsList[0]._id,
        department: deptMap['Cardiology'],
        appointmentDate: getDateOffset(-3),
        appointmentTime: '10:00 AM',
        reason: 'Schedule conflict with work travel',
        status: 'cancelled',
        fee: 120,
        notes: 'Cancelled by patient due to out-of-town business meeting.',
      },
      {
        patient: patientsList[5].user._id,
        doctor: doctorsList[1]._id,
        department: deptMap['Neurology'],
        appointmentDate: getDateOffset(-5),
        appointmentTime: '04:00 PM',
        reason: 'Doctor emergency surgery duty call',
        status: 'rejected',
        fee: 110,
        doctorNotes: 'Doctor was called to emergency neuro-trauma room. Patient notified for free reschedule.',
      },
    ];

    await Appointment.insertMany(appointmentsData);

    console.log('\n==========================================');
    console.log('CarePoint Database Seeded Successfully!');
    console.log('==========================================');
    console.log('Demo Credentials for testing:');
    console.log('1. Admin:   admin@carepoint.com / Admin@1234');
    console.log('2. Doctor:  dr.reynolds@carepoint.com / Doctor@1234');
    console.log('            dr.chen@carepoint.com / Doctor@1234');
    console.log('3. Patient: patient@carepoint.com / Patient@1234');
    console.log('            maria.g@example.com / Patient@1234');
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
