import mongoose from "mongoose";
import { getMongoUri } from "./config/env.js";
import { fileURLToPath } from "url";
import Admin from "./models/adminModel.js";
import Donor from "./models/donorModel.js";
import Facility from "./models/facilityModel.js";
import Blood from "./models/bloodModel.js";
import BloodRequest from "./models/bloodRequestModel.js";
import BloodCamp from "./models/bloodCampModel.js";
export const DEMO_ACCOUNTS = {
  admin: {
    name: "Demo Admin BBMS Maroc",
    email: "demo.admin@bbmsmaroc.com",
    password: "demo.admin@bbmsmaroc.com",
    role: "admin"
  },
  donorPrimary: {
    fullName: "Youssef El Idrissi",
    email: "demo.donor@bbmsmaroc.com",
    password: "demo.donor@bbmsmaroc.com",
    phone: "0612345678",
    emergencyContact: "0678123456",
    age: 29,
    gender: "Male",
    bloodGroup: "O+",
    weight: 74,
    address: {
      street: "12 Rue Zerktouni",
      city: "Casablanca",
      state: "Casablanca-Settat",
      pincode: "200000"
    },
    role: "donor"
  },
  donorSecondary: {
    fullName: "Salma Bennani",
    email: "community.donor@bbmsmaroc.com",
    password: "community.donor@bbmsmaroc.com",
    phone: "0623456789",
    emergencyContact: "0681234567",
    age: 34,
    gender: "Female",
    bloodGroup: "A-",
    weight: 61,
    address: {
      street: "44 Avenue Mohammed V",
      city: "Rabat",
      state: "Rabat-Sale-Kenitra",
      pincode: "100000"
    },
    role: "donor"
  },
  donorTertiary: {
    fullName: "Imane Alaoui",
    email: "imane.alaoui@bbmsmaroc.com",
    password: "imane.alaoui@bbmsmaroc.com",
    phone: "0634112233",
    emergencyContact: "0689112233",
    age: 26,
    gender: "Female",
    bloodGroup: "B+",
    weight: 58,
    address: {
      street: "18 Rue Al Qods",
      city: "Tangier",
      state: "Tanger-Tetouan-Al Hoceima",
      pincode: "900120"
    },
    role: "donor"
  },
  donorQuaternary: {
    fullName: "Hamza Amrani",
    email: "hamza.amrani@bbmsmaroc.com",
    password: "hamza.amrani@bbmsmaroc.com",
    phone: "0645223344",
    emergencyContact: "0699223344",
    age: 38,
    gender: "Male",
    bloodGroup: "AB+",
    weight: 82,
    address: {
      street: "7 Avenue des FAR",
      city: "Agadir",
      state: "Souss-Massa",
      pincode: "800210"
    },
    role: "donor"
  },
  donorQuinary: {
    fullName: "Khadija Tazi",
    email: "khadija.tazi@bbmsmaroc.com",
    password: "khadija.tazi@bbmsmaroc.com",
    phone: "0656334455",
    emergencyContact: "0687334455",
    age: 31,
    gender: "Female",
    bloodGroup: "O-",
    weight: 63,
    address: {
      street: "25 Quartier Administratif",
      city: "Meknes",
      state: "Fes-Meknes",
      pincode: "500110"
    },
    role: "donor"
  },
  hospital: {
    name: "Clinique Al Amal",
    email: "demo.hospital@bbmsmaroc.com",
    password: "demo.hospital@bbmsmaroc.com",
    phone: "0654321098",
    emergencyContact: "0665432109",
    address: {
      street: "88 Boulevard Abdelmoumen",
      city: "Casablanca",
      state: "Casablanca-Settat",
      pincode: "201000"
    },
    registrationNumber: "MA-HOSP-DEMO-001",
    facilityType: "hospital",
    facilityCategory: "Private",
    documents: {
      registrationProof: {
        url: "https://example.com/hospital-demo-proof.pdf",
        filename: "clinique-al-amal-proof.pdf"
      }
    },
    operatingHours: {
      open: "00:00",
      close: "23:59",
      workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    },
    is24x7: true,
    emergencyServices: true
  },
  bloodLab: {
    name: "Laboratoire Atlas Sang",
    email: "demo.lab@bbmsmaroc.com",
    password: "demo.lab@bbmsmaroc.com",
    phone: "0676543210",
    emergencyContact: "0698765432",
    address: {
      street: "21 Avenue Hassan II",
      city: "Marrakech",
      state: "Marrakech-Safi",
      pincode: "400000"
    },
    registrationNumber: "MA-LAB-DEMO-001",
    facilityType: "blood-lab",
    facilityCategory: "Private",
    documents: {
      registrationProof: {
        url: "https://example.com/lab-demo-proof.pdf",
        filename: "atlas-sang-proof.pdf"
      }
    },
    operatingHours: {
      open: "08:00",
      close: "20:00",
      workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    },
    is24x7: false,
    emergencyServices: true
  },
  pendingHospital: {
    name: "Hopital Al Farah",
    email: "pending.hospital@bbmsmaroc.com",
    password: "pending.hospital@bbmsmaroc.com",
    phone: "0619988776",
    emergencyContact: "0629988776",
    address: {
      street: "5 Route de Fes",
      city: "Fes",
      state: "Fes-Meknes",
      pincode: "300000"
    },
    registrationNumber: "MA-HOSP-DEMO-002",
    facilityType: "hospital",
    facilityCategory: "Trust",
    documents: {
      registrationProof: {
        url: "https://example.com/pending-hospital-proof.pdf",
        filename: "hopital-al-farah-proof.pdf"
      }
    }
  },
  rejectedLab: {
    name: "Laboratoire Chifaa",
    email: "rejected.lab@bbmsmaroc.com",
    password: "rejected.lab@bbmsmaroc.com",
    phone: "0634567890",
    emergencyContact: "0645678901",
    address: {
      street: "9 Boulevard Pasteur",
      city: "Tangier",
      state: "Tanger-Tetouan-Al Hoceima",
      pincode: "900000"
    },
    registrationNumber: "MA-LAB-DEMO-002",
    facilityType: "blood-lab",
    facilityCategory: "Other",
    documents: {
      registrationProof: {
        url: "https://example.com/rejected-lab-proof.pdf",
        filename: "laboratoire-chifaa-proof.pdf"
      }
    }
  },
  approvedHospitalSecondary: {
    name: "Hopital Ibn Rochd",
    email: "ibnrochd.hospital@bbmsmaroc.com",
    password: "ibnrochd.hospital@bbmsmaroc.com",
    phone: "0667445566",
    emergencyContact: "0688445566",
    address: {
      street: "1 Boulevard des Hopitaux",
      city: "Casablanca",
      state: "Casablanca-Settat",
      pincode: "202200"
    },
    registrationNumber: "MA-HOSP-DEMO-003",
    facilityType: "hospital",
    facilityCategory: "Government",
    documents: {
      registrationProof: {
        url: "https://example.com/ibn-rochd-proof.pdf",
        filename: "hopital-ibn-rochd-proof.pdf"
      }
    },
    operatingHours: {
      open: "00:00",
      close: "23:59",
      workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    },
    is24x7: true,
    emergencyServices: true
  },
  approvedLabSecondary: {
    name: "Centre Regional de Transfusion Rabat",
    email: "crt.rabat@bbmsmaroc.com",
    password: "crt.rabat@bbmsmaroc.com",
    phone: "0678556677",
    emergencyContact: "0689556677",
    address: {
      street: "10 Avenue Allal Ben Abdellah",
      city: "Rabat",
      state: "Rabat-Sale-Kenitra",
      pincode: "101200"
    },
    registrationNumber: "MA-LAB-DEMO-003",
    facilityType: "blood-lab",
    facilityCategory: "Government",
    documents: {
      registrationProof: {
        url: "https://example.com/crt-rabat-proof.pdf",
        filename: "crt-rabat-proof.pdf"
      }
    },
    operatingHours: {
      open: "08:30",
      close: "18:30",
      workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    },
    is24x7: false,
    emergencyServices: true
  },
  pendingLab: {
    name: "Laboratoire Al Massira",
    email: "pending.lab@bbmsmaroc.com",
    password: "pending.lab@bbmsmaroc.com",
    phone: "0689667788",
    emergencyContact: "0699667788",
    address: {
      street: "3 Rue Moulay Ismail",
      city: "Oujda",
      state: "Oriental",
      pincode: "600120"
    },
    registrationNumber: "MA-LAB-DEMO-004",
    facilityType: "blood-lab",
    facilityCategory: "Charity",
    documents: {
      registrationProof: {
        url: "https://example.com/lab-al-massira-proof.pdf",
        filename: "lab-al-massira-proof.pdf"
      }
    }
  },
  rejectedHospital: {
    name: "Clinique Anoual",
    email: "rejected.hospital@bbmsmaroc.com",
    password: "rejected.hospital@bbmsmaroc.com",
    phone: "0698778899",
    emergencyContact: "0688778899",
    address: {
      street: "16 Avenue Hassan Premier",
      city: "Tetouan",
      state: "Tanger-Tetouan-Al Hoceima",
      pincode: "930220"
    },
    registrationNumber: "MA-HOSP-DEMO-004",
    facilityType: "hospital",
    facilityCategory: "Private",
    documents: {
      registrationProof: {
        url: "https://example.com/clinique-anoual-proof.pdf",
        filename: "clinique-anoual-proof.pdf"
      }
    }
  }
};

export const DEMO_LOGIN_ACCOUNTS = {
  admin: {
    email: DEMO_ACCOUNTS.admin.email,
    password: DEMO_ACCOUNTS.admin.password,
    redirect: "/admin"
  },
  donor: {
    email: DEMO_ACCOUNTS.donorPrimary.email,
    password: DEMO_ACCOUNTS.donorPrimary.password,
    redirect: "/donor"
  },
  hospital: {
    email: DEMO_ACCOUNTS.hospital.email,
    password: DEMO_ACCOUNTS.hospital.password,
    redirect: "/hospital"
  },
  "blood-lab": {
    email: DEMO_ACCOUNTS.bloodLab.email,
    password: DEMO_ACCOUNTS.bloodLab.password,
    redirect: "/lab"
  }
};
const LEGACY_DEMO_IDENTIFIERS = {
  emails: ["suraj@admin.com", "recruiter.donor@bbmsdemo.com", "community.donor@bbmsdemo.com", "recruiter.hospital@bbmsdemo.com", "recruiter.lab@bbmsdemo.com", "pending.hospital@bbmsdemo.com", "rejected.lab@bbmsdemo.com", "ibnrochd.hospital@bbmsdemo.com", "crt.rabat@bbmsdemo.com", "pending.lab@bbmsdemo.com", "rejected.hospital@bbmsdemo.com"],
  registrationNumbers: ["HOSP-DEMO-001", "LAB-DEMO-001", "HOSP-DEMO-002", "LAB-DEMO-002", "HOSP-DEMO-003", "LAB-DEMO-003", "LAB-DEMO-004", "HOSP-DEMO-004"],
  campTitles: ["Downtown Donation Drive", "University Health Camp"],
  campVenues: ["Civic Convention Hall", "National University Auditorium"]
};
const pastDate = daysAgo => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};
const futureDate = daysAhead => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date;
};
export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  await mongoose.connect(getMongoUri());
  console.log("MongoDB connected for demo seed");
  return mongoose.connection;
};
export const cleanExistingDemoData = async () => {
  const demoEmails = [DEMO_ACCOUNTS.admin.email, DEMO_ACCOUNTS.donorPrimary.email, DEMO_ACCOUNTS.donorSecondary.email, DEMO_ACCOUNTS.donorTertiary.email, DEMO_ACCOUNTS.donorQuaternary.email, DEMO_ACCOUNTS.donorQuinary.email, DEMO_ACCOUNTS.hospital.email, DEMO_ACCOUNTS.bloodLab.email, DEMO_ACCOUNTS.pendingHospital.email, DEMO_ACCOUNTS.rejectedLab.email, DEMO_ACCOUNTS.approvedHospitalSecondary.email, DEMO_ACCOUNTS.approvedLabSecondary.email, DEMO_ACCOUNTS.pendingLab.email, DEMO_ACCOUNTS.rejectedHospital.email, ...LEGACY_DEMO_IDENTIFIERS.emails];
  const demoRegistrationNumbers = [DEMO_ACCOUNTS.hospital.registrationNumber, DEMO_ACCOUNTS.bloodLab.registrationNumber, DEMO_ACCOUNTS.pendingHospital.registrationNumber, DEMO_ACCOUNTS.rejectedLab.registrationNumber, DEMO_ACCOUNTS.approvedHospitalSecondary.registrationNumber, DEMO_ACCOUNTS.approvedLabSecondary.registrationNumber, DEMO_ACCOUNTS.pendingLab.registrationNumber, DEMO_ACCOUNTS.rejectedHospital.registrationNumber, ...LEGACY_DEMO_IDENTIFIERS.registrationNumbers];
  const existingFacilities = await Facility.find({
    $or: [{
      email: {
        $in: demoEmails
      }
    }, {
      registrationNumber: {
        $in: demoRegistrationNumbers
      }
    }, {
      email: /@fasttestdemo\.com$/i
    }, {
      name: /^Recruiter /i
    }, {
      registrationNumber: /^(HOSPITAL|LAB)-\d+$/i
    }]
  }).select("_id");
  const existingDonors = await Donor.find({
    $or: [{
      email: {
        $in: demoEmails
      }
    }, {
      email: /@fasttestdemo\.com$/i
    }]
  }).select("_id");
  const facilityIds = existingFacilities.map(facility => facility._id);
  const donorIds = existingDonors.map(donor => donor._id);
  if (facilityIds.length) {
    await Blood.deleteMany({
      $or: [{
        bloodLab: {
          $in: facilityIds
        }
      }, {
        hospital: {
          $in: facilityIds
        }
      }]
    });
    await BloodRequest.deleteMany({
      $or: [{
        hospitalId: {
          $in: facilityIds
        }
      }, {
        labId: {
          $in: facilityIds
        }
      }]
    });
    await BloodCamp.deleteMany({
      hospital: {
        $in: facilityIds
      }
    });
  }
  await BloodCamp.deleteMany({
    $or: [{
      title: {
        $in: LEGACY_DEMO_IDENTIFIERS.campTitles
      }
    }, {
      "location.venue": {
        $in: LEGACY_DEMO_IDENTIFIERS.campVenues
      }
    }]
  });
  if (donorIds.length) {
    await Donor.deleteMany({
      _id: {
        $in: donorIds
      }
    });
  }
  if (facilityIds.length) {
    await Facility.deleteMany({
      _id: {
        $in: facilityIds
      }
    });
  }
  await Admin.deleteMany({
    email: {
      $in: [DEMO_ACCOUNTS.admin.email, ...LEGACY_DEMO_IDENTIFIERS.emails]
    }
  });
};
export const createFacilities = async adminId => {
  const hospital = await Facility.create({
    ...DEMO_ACCOUNTS.hospital,
    status: "approved",
    approvedBy: adminId,
    approvedAt: pastDate(25),
    history: [{
      eventType: "Login",
      description: "Connexion de demonstration recruteur pour la clinique",
      date: pastDate(1)
    }, {
      eventType: "Stock Update",
      description: "Reception urgente de poches O+ depuis Laboratoire Atlas Sang",
      date: pastDate(2)
    }, {
      eventType: "Request Approved",
      description: "Demande urgente de sang O+ acceptee par le laboratoire",
      date: pastDate(2)
    }, {
      eventType: "Profile Update",
      description: "Mise a jour du protocole de contact urgence SAMU",
      date: pastDate(5)
    }]
  });
  const bloodLab = await Facility.create({
    ...DEMO_ACCOUNTS.bloodLab,
    status: "approved",
    approvedBy: adminId,
    approvedAt: pastDate(28),
    history: [{
      eventType: "Verification",
      description: "Admin approved facility verification",
      date: pastDate(28)
    }, {
      eventType: "Login",
      description: "Connexion de demonstration recruteur pour le laboratoire",
      date: pastDate(1)
    }, {
      eventType: "Blood Camp",
      description: 'Organisation de la campagne "Don du coeur Gueliz" a Marrakech',
      date: pastDate(4)
    }, {
      eventType: "Stock Update",
      description: "Ajout de stock frais O+ et A- apres la collecte citoyenne",
      date: pastDate(3)
    }, {
      eventType: "Donation",
      description: "Don enregistre de Youssef El Idrissi - 1 unite de O+",
      date: pastDate(3)
    }]
  });
  const pendingHospital = await Facility.create({
    ...DEMO_ACCOUNTS.pendingHospital,
    status: "pending",
    history: [{
      eventType: "Verification",
      description: "En attente de validation administrative pour integration",
      date: pastDate(1)
    }]
  });
  const rejectedLab = await Facility.create({
    ...DEMO_ACCOUNTS.rejectedLab,
    status: "rejected",
    rejectionReason: "Attestation d accreditation manquante dans le dossier soumis.",
    history: [{
      eventType: "Verification",
      description: "Dossier de verification examine puis refuse",
      date: pastDate(2)
    }]
  });
  const approvedHospitalSecondary = await Facility.create({
    ...DEMO_ACCOUNTS.approvedHospitalSecondary,
    status: "approved",
    approvedBy: adminId,
    approvedAt: pastDate(34),
    history: [{
      eventType: "Verification",
      description: "Etablissement public deja valide pour la plateforme nationale.",
      date: pastDate(34)
    }, {
      eventType: "Stock Update",
      description: "Reception programmee de stocks AB+ et O- pour le service de chirurgie.",
      date: pastDate(3)
    }]
  });
  const approvedLabSecondary = await Facility.create({
    ...DEMO_ACCOUNTS.approvedLabSecondary,
    status: "approved",
    approvedBy: adminId,
    approvedAt: pastDate(31),
    history: [{
      eventType: "Verification",
      description: "Centre regional valide et raccorde au reseau de transfusion.",
      date: pastDate(31)
    }, {
      eventType: "Donation",
      description: "Collecte mobile a Rabat Agdal avec 27 dons verifies.",
      date: pastDate(6)
    }, {
      eventType: "Stock Update",
      description: "Mise a jour des poches A+ et B- apres une collecte associative.",
      date: pastDate(5)
    }]
  });
  const pendingLab = await Facility.create({
    ...DEMO_ACCOUNTS.pendingLab,
    status: "pending",
    history: [{
      eventType: "Verification",
      description: "Demande en attente de visite de conformite et controle technique.",
      date: pastDate(1)
    }]
  });
  const rejectedHospital = await Facility.create({
    ...DEMO_ACCOUNTS.rejectedHospital,
    status: "rejected",
    rejectionReason: "Convention medecin responsable et autorisation sanitaire non jointes.",
    history: [{
      eventType: "Verification",
      description: "Dossier retourne pour pieces administratives manquantes.",
      date: pastDate(4)
    }]
  });
  return {
    hospital,
    bloodLab,
    pendingHospital,
    rejectedLab,
    approvedHospitalSecondary,
    approvedLabSecondary,
    pendingLab,
    rejectedHospital
  };
};
export const createDonors = async bloodLabId => {
  const donor = await Donor.create({
    ...DEMO_ACCOUNTS.donorPrimary,
    eligibleToDonate: true,
    lastDonationDate: pastDate(120),
    donationHistory: [{
      donationDate: pastDate(210),
      facility: bloodLabId,
      bloodGroup: "O+",
      quantity: 1,
      remarks: "Collecte annuelle organisee apres Ramadan",
      verified: true
    }, {
      donationDate: pastDate(120),
      facility: bloodLabId,
      bloodGroup: "O+",
      quantity: 1,
      remarks: "Don de remplacement pour une urgence hospitaliere",
      verified: true
    }]
  });
  const secondaryDonor = await Donor.create({
    ...DEMO_ACCOUNTS.donorSecondary,
    eligibleToDonate: true,
    lastDonationDate: pastDate(45),
    donationHistory: [{
      donationDate: pastDate(45),
      facility: bloodLabId,
      bloodGroup: "A-",
      quantity: 1,
      remarks: "Participation a une caravane regionale de don du sang",
      verified: true
    }]
  });
  const tertiaryDonor = await Donor.create({
    ...DEMO_ACCOUNTS.donorTertiary,
    eligibleToDonate: true,
    lastDonationDate: pastDate(140),
    donationHistory: [{
      donationDate: pastDate(320),
      facility: bloodLabId,
      bloodGroup: "B+",
      quantity: 1,
      remarks: "Collecte organisee avec une association estudiantine a Tanger.",
      verified: true
    }, {
      donationDate: pastDate(140),
      facility: bloodLabId,
      bloodGroup: "B+",
      quantity: 1,
      remarks: "Don volontaire pour reconstituer le stock regional.",
      verified: true
    }]
  });
  const quaternaryDonor = await Donor.create({
    ...DEMO_ACCOUNTS.donorQuaternary,
    eligibleToDonate: false,
    lastDonationDate: pastDate(22),
    donationHistory: [{
      donationDate: pastDate(190),
      facility: bloodLabId,
      bloodGroup: "AB+",
      quantity: 1,
      remarks: "Don au profit d une campagne mobile sur le littoral.",
      verified: true
    }, {
      donationDate: pastDate(22),
      facility: bloodLabId,
      bloodGroup: "AB+",
      quantity: 1,
      remarks: "Don recent, encore en periode de repos medical.",
      verified: true
    }]
  });
  const quinaryDonor = await Donor.create({
    ...DEMO_ACCOUNTS.donorQuinary,
    eligibleToDonate: true,
    lastDonationDate: pastDate(170),
    donationHistory: [{
      donationDate: pastDate(420),
      facility: bloodLabId,
      bloodGroup: "O-",
      quantity: 1,
      remarks: "Don exceptionnel pour une urgence obstetricale.",
      verified: true
    }, {
      donationDate: pastDate(170),
      facility: bloodLabId,
      bloodGroup: "O-",
      quantity: 1,
      remarks: "Participation a une caravane de solidarite inter-regionale.",
      verified: true
    }]
  });
  return {
    donor,
    secondaryDonor,
    tertiaryDonor,
    quaternaryDonor,
    quinaryDonor
  };
};
export const createOperationalData = async ({
  hospital,
  bloodLab,
  donor,
  donors,
  approvedHospitalSecondary,
  approvedLabSecondary
}) => {
  await Blood.insertMany([{
    bloodGroup: "O+",
    quantity: 18,
    expiryDate: futureDate(25),
    bloodLab: bloodLab._id
  }, {
    bloodGroup: "A-",
    quantity: 7,
    expiryDate: futureDate(18),
    bloodLab: bloodLab._id
  }, {
    bloodGroup: "B+",
    quantity: 12,
    expiryDate: futureDate(31),
    bloodLab: bloodLab._id
  }, {
    bloodGroup: "AB+",
    quantity: 6,
    expiryDate: futureDate(20),
    bloodLab: bloodLab._id
  }, {
    bloodGroup: "O-",
    quantity: 5,
    expiryDate: futureDate(16),
    bloodLab: bloodLab._id
  }, {
    bloodGroup: "A+",
    quantity: 14,
    expiryDate: futureDate(29),
    bloodLab: approvedLabSecondary._id
  }, {
    bloodGroup: "B-",
    quantity: 8,
    expiryDate: futureDate(23),
    bloodLab: approvedLabSecondary._id
  }, {
    bloodGroup: "AB-",
    quantity: 3,
    expiryDate: futureDate(12),
    bloodLab: approvedLabSecondary._id
  }, {
    bloodGroup: "O+",
    quantity: 9,
    expiryDate: futureDate(12),
    hospital: hospital._id
  }, {
    bloodGroup: "A-",
    quantity: 4,
    expiryDate: futureDate(5),
    hospital: hospital._id
  }, {
    bloodGroup: "B+",
    quantity: 6,
    expiryDate: futureDate(9),
    hospital: hospital._id
  }, {
    bloodGroup: "A+",
    quantity: 11,
    expiryDate: futureDate(14),
    hospital: approvedHospitalSecondary._id
  }, {
    bloodGroup: "O-",
    quantity: 2,
    expiryDate: futureDate(4),
    hospital: approvedHospitalSecondary._id
  }]);
  await BloodCamp.insertMany([{
    hospital: bloodLab._id,
    title: "Caravane Jemaa el-Fna",
    description: "Campagne ouverte au public avec associations locales et donateurs de quartier.",
    date: futureDate(6),
    time: {
      start: "10:00",
      end: "16:00"
    },
    location: {
      venue: "Place Jemaa el-Fna - espace mobile",
      city: "Marrakech",
      state: "Marrakech-Safi",
      pincode: "400010"
    },
    expectedDonors: 40,
    actualDonors: 0,
    status: "Upcoming"
  }, {
    hospital: bloodLab._id,
    title: "Collecte Quartier Gueliz",
    description: "Collecte de proximite avec rendez-vous rapides pour jeunes actifs et familles.",
    date: futureDate(14),
    time: {
      start: "09:30",
      end: "17:00"
    },
    location: {
      venue: "Maison des Jeunes Gueliz",
      city: "Marrakech",
      state: "Marrakech-Safi",
      pincode: "400220"
    },
    expectedDonors: 60,
    actualDonors: 0,
    status: "Upcoming"
  }, {
    hospital: bloodLab._id,
    title: "Caravane Universitaire Ibn Tofail",
    description: "Collecte recente sur campus ayant renforce le stock des groupes les plus demandes.",
    date: pastDate(12),
    time: {
      start: "09:00",
      end: "15:00"
    },
    location: {
      venue: "Campus universitaire - amphitheatre central",
      city: "Kenitra",
      state: "Rabat-Sale-Kenitra",
      pincode: "140012"
    },
    expectedDonors: 55,
    actualDonors: 42,
    status: "Completed"
  }, {
    hospital: bloodLab._id,
    title: "Journée Solidaire Sidi Youssef",
    description: "Campagne en cours avec unités mobiles et sensibilisation citoyenne.",
    date: futureDate(1),
    time: {
      start: "08:30",
      end: "15:30"
    },
    location: {
      venue: "Centre de proximite Sidi Youssef Ben Ali",
      city: "Marrakech",
      state: "Marrakech-Safi",
      pincode: "400330"
    },
    expectedDonors: 35,
    actualDonors: 11,
    status: "Ongoing"
  }, {
    hospital: approvedLabSecondary._id,
    title: "Collecte Rabat Agdal",
    description: "Partenariat avec des entreprises et associations locales de Rabat.",
    date: futureDate(9),
    time: {
      start: "10:00",
      end: "16:30"
    },
    location: {
      venue: "Salle couverte Agdal",
      city: "Rabat",
      state: "Rabat-Sale-Kenitra",
      pincode: "101400"
    },
    expectedDonors: 75,
    actualDonors: 0,
    status: "Upcoming"
  }, {
    hospital: approvedLabSecondary._id,
    title: "Campagne Port de Salé",
    description: "Collecte reportee suite a des contraintes logistiques et meteo.",
    date: futureDate(18),
    time: {
      start: "09:00",
      end: "14:00"
    },
    location: {
      venue: "Esplanade du port de Sale",
      city: "Sale",
      state: "Rabat-Sale-Kenitra",
      pincode: "110220"
    },
    expectedDonors: 50,
    actualDonors: 0,
    status: "Cancelled"
  }]);
  await BloodRequest.insertMany([{
    hospitalId: hospital._id,
    labId: bloodLab._id,
    bloodType: "O+",
    units: 2,
    status: "accepted",
    processedAt: pastDate(2),
    notes: "Acceptee pour prise en charge d une urgence traumatique.",
    createdAt: pastDate(2),
    updatedAt: pastDate(2)
  }, {
    hospitalId: hospital._id,
    labId: bloodLab._id,
    bloodType: "A-",
    units: 1,
    status: "pending",
    notes: "En attente de confirmation pour reserve neonatale.",
    createdAt: pastDate(1),
    updatedAt: pastDate(1)
  }, {
    hospitalId: hospital._id,
    labId: approvedLabSecondary._id,
    bloodType: "AB-",
    units: 1,
    status: "rejected",
    processedAt: pastDate(5),
    notes: "Rejetee faute de stock suffisant sur la date demandee.",
    createdAt: pastDate(6),
    updatedAt: pastDate(5)
  }, {
    hospitalId: approvedHospitalSecondary._id,
    labId: bloodLab._id,
    bloodType: "O-",
    units: 2,
    status: "accepted",
    processedAt: pastDate(4),
    notes: "Acceptee pour bloc operatoire et urgences traumatologiques.",
    createdAt: pastDate(4),
    updatedAt: pastDate(4)
  }, {
    hospitalId: approvedHospitalSecondary._id,
    labId: approvedLabSecondary._id,
    bloodType: "A+",
    units: 3,
    status: "pending",
    notes: "Demande programmee pour interventions de la semaine prochaine.",
    createdAt: pastDate(2),
    updatedAt: pastDate(2)
  }]);
  donor.lastLogin = pastDate(1);
  await donor.save();
  donors.secondaryDonor.lastLogin = pastDate(4);
  donors.tertiaryDonor.lastLogin = pastDate(7);
  donors.quaternaryDonor.lastLogin = pastDate(2);
  donors.quinaryDonor.lastLogin = pastDate(10);
  await Promise.all([donors.secondaryDonor.save(), donors.tertiaryDonor.save(), donors.quaternaryDonor.save(), donors.quinaryDonor.save()]);
};
export const seedDemoData = async () => {
  await cleanExistingDemoData();
  const admin = await Admin.create(DEMO_ACCOUNTS.admin);
  const facilities = await createFacilities(admin._id);
  const donors = await createDonors(facilities.bloodLab._id);
  await createOperationalData({
    hospital: facilities.hospital,
    bloodLab: facilities.bloodLab,
    donor: donors.donor,
    donors,
    approvedHospitalSecondary: facilities.approvedHospitalSecondary,
    approvedLabSecondary: facilities.approvedLabSecondary
  });
  console.log("Demo data seeded successfully");
  console.log("Admin:", DEMO_ACCOUNTS.admin.email);
  console.log("Donor:", DEMO_ACCOUNTS.donorPrimary.email);
  console.log("Hospital:", DEMO_ACCOUNTS.hospital.email);
  console.log("Blood Lab:", DEMO_ACCOUNTS.bloodLab.email);
  return {
    admin,
    facilities,
    donors
  };
};
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  connectDB().then(() => seedDemoData()).then(() => process.exit(0)).catch(error => {
    console.error("Demo seed failed", error);
    process.exit(1);
  });
}
