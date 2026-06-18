import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv();

const { default: bcrypt } = await import("bcrypt");
const { connectDB } = await import("../src/lib/mongodb");
const { default: User } = await import("../src/models/User");
const { default: WorkerProfile } = await import("../src/models/WorkerProfile");
const { default: FacilityProfile } = await import("../src/models/FacilityProfile");
const { default: Shift } = await import("../src/models/Shift");
const { default: Application } = await import("../src/models/Application");
const { default: Assignment } = await import("../src/models/Assignment");
const { default: VerificationLog } = await import("../src/models/VerificationLog");
const { default: PaymentLog } = await import("../src/models/PaymentLog");
const { default: Notification } = await import("../src/models/Notification");
const { default: EmailLog } = await import("../src/models/EmailLog");
const { default: EmailQueueJob } = await import("../src/models/EmailQueueJob");
const { default: AuditLog } = await import("../src/models/AuditLog");
const { default: WebhookEventLog } = await import("../src/models/WebhookEventLog");

const DEMO_EMAIL_DOMAIN = "@demo.careconnect.local";
const DEMO_EMAIL_REGEX = /@demo\.careconnect\.local$/i;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD?.trim() || "CareConnectDemo123!";
const PASSWORD_HASH = await bcrypt.hash(DEMO_PASSWORD, 12);

function makeDate(daysFromNow: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + daysFromNow);
  return date;
}

function makeDocument(name: string, publicId: string, expiresInDays: number) {
  return {
    name,
    publicId,
    secureUrl: `https://files.careconnect.local/${publicId}`,
    resourceType: "raw",
    uploadedAt: new Date(),
    expiresAt: makeDate(expiresInDays)
  };
}

async function clearPreviousDemoData() {
  const demoUsers = await User.find({ email: DEMO_EMAIL_REGEX })
    .select("_id")
    .lean();
  const demoUserIds = demoUsers.map((user) => user._id);

  const demoWorkerProfiles = await WorkerProfile.find({ userId: { $in: demoUserIds } })
    .select("_id")
    .lean();
  const demoWorkerProfileIds = demoWorkerProfiles.map((profile) => profile._id);

  const demoFacilityProfiles = await FacilityProfile.find({ userId: { $in: demoUserIds } })
    .select("_id")
    .lean();
  const demoFacilityProfileIds = demoFacilityProfiles.map((profile) => profile._id);

  const demoShifts = await Shift.find({ facilityId: { $in: demoFacilityProfileIds } })
    .select("_id")
    .lean();
  const demoShiftIds = demoShifts.map((shift) => shift._id);

  const applicationFilters: Record<string, unknown>[] = [];
  if (demoWorkerProfileIds.length > 0) {
    applicationFilters.push({ workerId: { $in: demoWorkerProfileIds } });
  }
  if (demoShiftIds.length > 0) {
    applicationFilters.push({ shiftId: { $in: demoShiftIds } });
  }

  const assignmentFilters: Record<string, unknown>[] = [];
  if (demoWorkerProfileIds.length > 0) {
    assignmentFilters.push({ workerId: { $in: demoWorkerProfileIds } });
  }
  if (demoFacilityProfileIds.length > 0) {
    assignmentFilters.push({ facilityId: { $in: demoFacilityProfileIds } });
  }
  if (demoShiftIds.length > 0) {
    assignmentFilters.push({ shiftId: { $in: demoShiftIds } });
  }

  const deletionTasks: Promise<unknown>[] = [];

  if (applicationFilters.length > 0) {
    deletionTasks.push(Application.deleteMany({ $or: applicationFilters }));
  }

  if (assignmentFilters.length > 0) {
    deletionTasks.push(Assignment.deleteMany({ $or: assignmentFilters }));
  }

  if (demoWorkerProfileIds.length > 0) {
    deletionTasks.push(VerificationLog.deleteMany({ workerId: { $in: demoWorkerProfileIds } }));
  }

  if (demoShiftIds.length > 0) {
    deletionTasks.push(PaymentLog.deleteMany({ shiftId: { $in: demoShiftIds } }));
  }

  if (demoUserIds.length > 0) {
    deletionTasks.push(Notification.deleteMany({ userId: { $in: demoUserIds } }));
    deletionTasks.push(AuditLog.deleteMany({ adminId: { $in: demoUserIds } }));
  }

  deletionTasks.push(EmailLog.deleteMany({ recipientEmail: DEMO_EMAIL_REGEX }));
  deletionTasks.push(EmailQueueJob.deleteMany({ "recipients.email": DEMO_EMAIL_REGEX }));
  deletionTasks.push(WebhookEventLog.deleteMany({ eventId: /^demo-/i }));

  if (demoShiftIds.length > 0) {
    deletionTasks.push(Shift.deleteMany({ _id: { $in: demoShiftIds } }));
  }

  if (demoWorkerProfileIds.length > 0) {
    deletionTasks.push(WorkerProfile.deleteMany({ _id: { $in: demoWorkerProfileIds } }));
  }

  if (demoFacilityProfileIds.length > 0) {
    deletionTasks.push(FacilityProfile.deleteMany({ _id: { $in: demoFacilityProfileIds } }));
  }

  if (demoUserIds.length > 0) {
    deletionTasks.push(User.deleteMany({ _id: { $in: demoUserIds } }));
  }

  await Promise.all(deletionTasks);
}

async function seedDemoData() {
  await connectDB();
  await clearPreviousDemoData();

  const hashedPassword = PASSWORD_HASH;

  const [
    adminUser,
    sunriseUser,
    harbourUser,
    workerAUser,
    workerBUser,
    workerCUser,
    workerDUser,
    workerEUser
  ] =
    await User.create([
      {
        firstName: "Hannah",
        lastName: "Cole",
        email: `hannah.cole${DEMO_EMAIL_DOMAIN}`,
        password: hashedPassword,
        phone: "+44 20 7946 0120",
        role: "ADMIN",
        isActive: true
      },
      {
        firstName: "Sarah",
        lastName: "Bennett",
        email: `sarah.bennett${DEMO_EMAIL_DOMAIN}`,
        password: hashedPassword,
        phone: "+44 20 7946 0170",
        role: "FACILITY",
        isActive: true
      },
      {
        firstName: "Omar",
        lastName: "Khan",
        email: `omar.khan${DEMO_EMAIL_DOMAIN}`,
        password: hashedPassword,
        phone: "+44 20 7946 0188",
        role: "FACILITY",
        isActive: true
      },
      {
        firstName: "Amina",
        lastName: "Yusuf",
        email: `amina.yusuf${DEMO_EMAIL_DOMAIN}`,
        password: hashedPassword,
        phone: "+44 7700 900111",
        role: "WORKER",
        isActive: true
      },
      {
        firstName: "Lewis",
        lastName: "Grant",
        email: `lewis.grant${DEMO_EMAIL_DOMAIN}`,
        password: hashedPassword,
        phone: "+44 7700 900222",
        role: "WORKER",
        isActive: true
      },
      {
        firstName: "Priya",
        lastName: "Shah",
        email: `priya.shah${DEMO_EMAIL_DOMAIN}`,
        password: hashedPassword,
        phone: "+44 7700 900333",
        role: "WORKER",
        isActive: true
      },
      {
        firstName: "Daniel",
        lastName: "Morgan",
        email: `daniel.morgan${DEMO_EMAIL_DOMAIN}`,
        password: hashedPassword,
        phone: "+44 7700 900444",
        role: "WORKER",
        isActive: true
      },
      {
        firstName: "Chloe",
        lastName: "Evans",
        email: `chloe.evans${DEMO_EMAIL_DOMAIN}`,
        password: hashedPassword,
        phone: "+44 7700 900555",
        role: "WORKER",
        isActive: true
      }
    ]);

  const [sunriseProfile, harbourProfile] = await FacilityProfile.create([
    {
      userId: sunriseUser._id,
      companyName: "Sunrise House Care Home",
      address: "12 Meadow Lane, Leeds, LS1 2AB",
      contactNumber: "+44 113 555 0180"
    },
    {
      userId: harbourUser._id,
      companyName: "Harbour View Supported Living",
      address: "44 Seafront Road, Liverpool, L1 8DQ",
      contactNumber: "+44 151 555 0124"
    }
  ]);

  const [aminaProfile, lewisProfile, priyaProfile, danielProfile, chloeProfile] = await WorkerProfile.create([
    {
      userId: workerAUser._id,
      phone: workerAUser.phone,
      addressHistory: [
        "18 North Street, Leeds, LS1 1AA",
        "7 Rose Court, Leeds, LS3 2FF"
      ],
      niNumber: "QQ123456C",
      shareCode: "SC-1024-81",
      roleType: "CARE_SUPPORT",
      verificationStatus: "VERIFIED",
      isVerified: true,
      cloudinaryDocuments: [
        makeDocument("Right to work", "demo/workers/amina/right-to-work", 180),
        makeDocument("Enhanced DBS check", "demo/workers/amina/dbs", 150)
      ]
    },
    {
      userId: workerBUser._id,
      phone: workerBUser.phone,
      addressHistory: ["91 King Street, Liverpool, L1 4ED"],
      niNumber: "QQ223456C",
      shareCode: "SC-2048-12",
      roleType: "PERSONAL_CARE",
      verificationStatus: "IN_REVIEW",
      isVerified: false,
      cloudinaryDocuments: [
        makeDocument("Right to work", "demo/workers/lewis/right-to-work", 12)
      ]
    },
    {
      userId: workerCUser._id,
      phone: workerCUser.phone,
      addressHistory: ["22 Birch Avenue, Manchester, M1 2QB"],
      niNumber: "QQ323456C",
      shareCode: "SC-4096-73",
      roleType: "CLEANING",
      verificationStatus: "REJECTED",
      isVerified: false,
      cloudinaryDocuments: [
        makeDocument("Identity document", "demo/workers/priya/id", 7)
      ]
    },
    {
      userId: workerDUser._id,
      phone: workerDUser.phone,
      addressHistory: ["8 Victoria Road, Leeds, LS6 1PP"],
      niNumber: "QQ423456C",
      shareCode: "SC-5120-64",
      roleType: "PERSONAL_CARE",
      verificationStatus: "VERIFIED",
      isVerified: true,
      cloudinaryDocuments: [
        makeDocument("Right to work", "demo/workers/daniel/right-to-work", 210),
        makeDocument("Enhanced DBS check", "demo/workers/daniel/dbs", 190)
      ]
    },
    {
      userId: workerEUser._id,
      phone: workerEUser.phone,
      addressHistory: ["35 Willow Drive, Liverpool, L7 3AA"],
      niNumber: "QQ523456C",
      shareCode: "SC-6144-29",
      roleType: "CARE_SUPPORT",
      verificationStatus: "PENDING",
      isVerified: false,
      cloudinaryDocuments: [
        makeDocument("Right to work", "demo/workers/chloe/right-to-work", 60)
      ]
    }
  ]);

  const [
    shiftFilled,
    shiftOpen,
    shiftOpenTwo,
    shiftClosed,
    shiftOpenThree,
    shiftOpenFour,
    shiftFilledTwo,
    shiftClosedTwo,
    shiftOpenFive,
    shiftOpenSix
  ] = await Shift.create([
    {
      facilityId: sunriseProfile._id,
      date: makeDate(1),
      startTime: "07:00",
      endTime: "19:00",
      hourlyRate: 18,
      roleRequired: "Care Support Worker",
      notes: "Morning support with personal care, meals, and companionship.",
      status: "FILLED",
      paymentStatus: "PAID"
    },
    {
      facilityId: harbourProfile._id,
      date: makeDate(2),
      startTime: "20:00",
      endTime: "08:00",
      hourlyRate: 20,
      roleRequired: "Personal Care Assistant",
      notes: "Night cover for one resident floor with hourly observations.",
      status: "OPEN",
      paymentStatus: "PENDING"
    },
    {
      facilityId: sunriseProfile._id,
      date: makeDate(3),
      startTime: "09:00",
      endTime: "15:00",
      hourlyRate: 16,
      roleRequired: "Domestic Support Worker",
      notes: "Light cleaning, laundry, and shared space upkeep.",
      status: "OPEN",
      paymentStatus: "PENDING"
    },
    {
      facilityId: harbourProfile._id,
      date: makeDate(-2),
      startTime: "21:00",
      endTime: "07:00",
      hourlyRate: 19,
      roleRequired: "Night Care Assistant",
      notes: "Completed shift for overnight observation and comfort checks.",
      status: "CLOSED",
      paymentStatus: "PAID"
    },
    {
      facilityId: harbourProfile._id,
      date: makeDate(4),
      startTime: "08:00",
      endTime: "16:00",
      hourlyRate: 17,
      roleRequired: "Care Support Worker",
      notes: "Day shift supporting residents with meals and mobility.",
      status: "OPEN",
      paymentStatus: "PENDING"
    },
    {
      facilityId: sunriseProfile._id,
      date: makeDate(5),
      startTime: "14:00",
      endTime: "22:00",
      hourlyRate: 18,
      roleRequired: "Personal Care Assistant",
      notes: "Afternoon and evening support for personal care routines.",
      status: "OPEN",
      paymentStatus: "PENDING"
    },
    {
      facilityId: harbourProfile._id,
      date: makeDate(6),
      startTime: "07:30",
      endTime: "19:30",
      hourlyRate: 19,
      roleRequired: "Senior Care Support",
      notes: "Lead support for a busy day shift with medication prompts.",
      status: "FILLED",
      paymentStatus: "PAID"
    },
    {
      facilityId: sunriseProfile._id,
      date: makeDate(-5),
      startTime: "08:00",
      endTime: "14:00",
      hourlyRate: 17,
      roleRequired: "Domestic Support Worker",
      notes: "Completed domestic support shift across communal areas.",
      status: "CLOSED",
      paymentStatus: "PAID"
    },
    {
      facilityId: sunriseProfile._id,
      date: makeDate(7),
      startTime: "22:00",
      endTime: "08:00",
      hourlyRate: 21,
      roleRequired: "Night Care Assistant",
      notes: "Overnight cover with observation rounds and handover notes.",
      status: "OPEN",
      paymentStatus: "PENDING"
    },
    {
      facilityId: harbourProfile._id,
      date: makeDate(8),
      startTime: "10:00",
      endTime: "18:00",
      hourlyRate: 18,
      roleRequired: "Personal Care Assistant",
      notes: "Support with activities, hydration, and individual care plans.",
      status: "OPEN",
      paymentStatus: "PENDING"
    }
  ]);

  const demoApplications = await Application.create([
      {
        workerId: aminaProfile._id,
        shiftId: shiftFilled._id,
        status: "ACCEPTED"
      },
      {
        workerId: lewisProfile._id,
        shiftId: shiftOpen._id,
        status: "PENDING"
      },
      {
        workerId: priyaProfile._id,
        shiftId: shiftOpenTwo._id,
        status: "REJECTED"
      },
      {
        workerId: aminaProfile._id,
        shiftId: shiftClosed._id,
        status: "ACCEPTED"
      },
      {
        workerId: danielProfile._id,
        shiftId: shiftFilledTwo._id,
        status: "ACCEPTED"
      },
      {
        workerId: chloeProfile._id,
        shiftId: shiftOpenThree._id,
        status: "PENDING"
      },
      {
        workerId: aminaProfile._id,
        shiftId: shiftOpenFour._id,
        status: "PENDING"
      },
      {
        workerId: danielProfile._id,
        shiftId: shiftClosedTwo._id,
        status: "ACCEPTED"
      },
      {
        workerId: lewisProfile._id,
        shiftId: shiftOpenFive._id,
        status: "PENDING"
      },
      {
        workerId: chloeProfile._id,
        shiftId: shiftOpenSix._id,
        status: "PENDING"
      }
    ]);

  const demoAssignments = await Assignment.create([
    {
      workerId: aminaProfile._id,
      facilityId: sunriseProfile._id,
      shiftId: shiftFilled._id,
      assignedAt: new Date(),
      status: "UPCOMING"
    },
    {
      workerId: aminaProfile._id,
      facilityId: harbourProfile._id,
      shiftId: shiftClosed._id,
      assignedAt: makeDate(-3),
      status: "COMPLETED"
    },
    {
      workerId: danielProfile._id,
      facilityId: harbourProfile._id,
      shiftId: shiftFilledTwo._id,
      assignedAt: new Date(),
      status: "UPCOMING"
    },
    {
      workerId: danielProfile._id,
      facilityId: sunriseProfile._id,
      shiftId: shiftClosedTwo._id,
      assignedAt: makeDate(-6),
      status: "COMPLETED"
    }
  ]);

  const demoVerifications = await VerificationLog.create([
    {
      workerId: aminaProfile._id,
      ebcApplicantId: "EBC-DEMO-1001",
      status: "VERIFIED",
      reportUrl: "https://reports.careconnect.local/verification/amina-yusuf",
      payload: {
        documentName: "Enhanced DBS check",
        result: "VERIFIED",
        workerProfileId: String(aminaProfile._id)
      },
      adminId: adminUser._id,
      adminNotes: "Verification approved for Care Support shifts.",
      decisionAt: new Date()
    },
    {
      workerId: lewisProfile._id,
      ebcApplicantId: "EBC-DEMO-1002",
      status: "IN_REVIEW",
      reportUrl: "",
      payload: {
        documentName: "Right to work",
        result: "IN_REVIEW",
        workerProfileId: String(lewisProfile._id)
      },
      adminNotes: "",
      decisionAt: null
    },
    {
      workerId: priyaProfile._id,
      ebcApplicantId: "EBC-DEMO-1003",
      status: "REJECTED",
      reportUrl: "https://reports.careconnect.local/verification/priya-shah",
      payload: {
        documentName: "Identity document",
        result: "REJECTED",
        workerProfileId: String(priyaProfile._id)
      },
      adminId: adminUser._id,
      adminNotes: "Please submit a clearer copy of the identity document.",
      decisionAt: makeDate(-1)
    },
    {
      workerId: danielProfile._id,
      ebcApplicantId: "EBC-DEMO-1004",
      status: "VERIFIED",
      reportUrl: "https://reports.careconnect.local/verification/daniel-morgan",
      payload: {
        documentName: "Enhanced DBS check",
        result: "VERIFIED",
        workerProfileId: String(danielProfile._id)
      },
      adminId: adminUser._id,
      adminNotes: "Verification approved for Personal Care shifts.",
      decisionAt: makeDate(-4)
    },
    {
      workerId: chloeProfile._id,
      ebcApplicantId: "EBC-DEMO-1005",
      status: "PENDING",
      reportUrl: "",
      payload: {
        documentName: "Right to work",
        result: "PENDING",
        workerProfileId: String(chloeProfile._id)
      },
      adminNotes: "",
      decisionAt: null
    }
  ]);

  const demoPayments = await PaymentLog.create([
    {
      shiftId: shiftFilled._id,
      facilityId: sunriseProfile._id,
      stripeSessionId: "cs_demo_paid_001",
      stripePaymentIntentId: "pi_demo_paid_001",
      stripeChargeId: "ch_demo_paid_001",
      amount: 216,
      status: "PAID",
      currency: "GBP"
    },
    {
      shiftId: shiftClosed._id,
      facilityId: harbourProfile._id,
      stripeSessionId: "cs_demo_paid_002",
      stripePaymentIntentId: "pi_demo_paid_002",
      stripeChargeId: "ch_demo_paid_002",
      amount: 209,
      status: "PAID",
      currency: "GBP"
    },
    {
      shiftId: shiftFilledTwo._id,
      facilityId: harbourProfile._id,
      stripeSessionId: "cs_demo_paid_003",
      stripePaymentIntentId: "pi_demo_paid_003",
      stripeChargeId: "ch_demo_paid_003",
      amount: 228,
      status: "PAID",
      currency: "GBP"
    },
    {
      shiftId: shiftClosedTwo._id,
      facilityId: sunriseProfile._id,
      stripeSessionId: "cs_demo_paid_004",
      stripePaymentIntentId: "pi_demo_paid_004",
      stripeChargeId: "ch_demo_paid_004",
      amount: 102,
      status: "PAID",
      currency: "GBP"
    }
  ]);

  const notifications = await Notification.create([
    {
      userId: workerAUser._id,
      title: "Shift confirmed",
      message: "Congratulations! You have been selected for this shift.",
      type: "SUCCESS",
      isRead: false
    },
    {
      userId: workerBUser._id,
      title: "Application received",
      message: "Your application has been received.",
      type: "INFO",
      isRead: false
    },
    {
      userId: workerCUser._id,
      title: "Verification update",
      message: "Your verification review needs another document.",
      type: "WARNING",
      isRead: false
    },
    {
      userId: harbourUser._id,
      title: "New application received",
      message: "A worker has applied for your open shift.",
      type: "INFO",
      isRead: false
    },
    {
      userId: adminUser._id,
      title: "Verification review needed",
      message: "A new worker is awaiting verification review.",
      type: "ALERT",
      isRead: false
    },
    {
      userId: workerDUser._id,
      title: "Shift confirmed",
      message: "Congratulations! You have been selected for this shift.",
      type: "SUCCESS",
      isRead: false
    },
    {
      userId: workerEUser._id,
      title: "Documents received",
      message: "Your verification documents have been submitted successfully.",
      type: "INFO",
      isRead: false
    }
  ]);

  const emailLogs = await EmailLog.create([
    {
      provider: "BREVO",
      recipientEmail: workerAUser.email,
      recipientName: "Amina Yusuf",
      template: "VERIFICATION_APPROVED",
      subject: "Your verification was approved",
      dedupeKey: "demo-email-001",
      providerMessageId: "msg_demo_001",
      status: "SENT",
      attempts: 1,
      payload: {
        firstName: "Amina",
        lastName: "Yusuf",
        workerDashboardUrl: "https://careconnect.local/dashboard/worker"
      },
      errorMessage: "",
      sentAt: new Date()
    },
    {
      provider: "BREVO",
      recipientEmail: workerBUser.email,
      recipientName: "Lewis Grant",
      template: "APPLICATION_SUBMITTED",
      subject: "Your application was submitted",
      dedupeKey: "demo-email-002",
      providerMessageId: "msg_demo_002",
      status: "SENT",
      attempts: 1,
      payload: {
        firstName: "Lewis",
        lastName: "Grant",
        shiftTitle: "Personal Care Assistant at Harbour View Supported Living",
        applicationUrl: "https://careconnect.local/dashboard/worker/applications"
      },
      errorMessage: "",
      sentAt: new Date()
    },
    {
      provider: "BREVO",
      recipientEmail: harbourUser.email,
      recipientName: "Omar Khan",
      template: "APPLICATION_SUBMITTED",
      subject: "A new application has been received",
      dedupeKey: "demo-email-003",
      providerMessageId: "msg_demo_003",
      status: "SENT",
      attempts: 1,
      payload: {
        firstName: "Omar",
        lastName: "Khan",
        shiftTitle: "Personal Care Assistant at Harbour View Supported Living",
        facilityName: "Harbour View Supported Living"
      },
      errorMessage: "",
      sentAt: new Date()
    }
  ]);

  const queueJob = await EmailQueueJob.create({
    dedupeKey: "demo-email-queue-001",
    recipients: [
      {
        email: workerCUser.email,
        name: "Priya Shah"
      }
    ],
    template: "VERIFICATION_REJECTED",
    subject: "Your verification needs attention",
    payload: {
      firstName: "Priya",
      lastName: "Shah",
      notes: "Please upload a clearer identity document.",
      workerDashboardUrl: "https://careconnect.local/dashboard/worker/verification"
    },
    status: "PENDING",
    attempts: 0,
    maxAttempts: 5,
    nextRunAt: new Date(),
    lastError: "",
    providerMessageId: ""
  });

  const auditLogs = await AuditLog.create([
    {
      adminId: adminUser._id,
      action: "VERIFICATION_APPROVED",
      entityType: "VERIFICATION",
      entityId: String(demoVerifications[0]._id),
      metadata: {
        workerName: "Amina Yusuf",
        verificationStatus: "VERIFIED"
      }
    },
    {
      adminId: adminUser._id,
      action: "VERIFICATION_REJECTED",
      entityType: "VERIFICATION",
      entityId: String(demoVerifications[2]._id),
      metadata: {
        workerName: "Priya Shah",
        verificationStatus: "REJECTED"
      }
    },
    {
      adminId: adminUser._id,
      action: "PAYMENT_RECEIVED",
      entityType: "PAYMENT",
      entityId: String(demoPayments[0]._id),
      metadata: {
        shiftLabel: "Care Support Worker at Sunrise House Care Home",
        amount: demoPayments[0].amount,
        currency: demoPayments[0].currency
      }
    }
  ]);

  const webhookEvents = await WebhookEventLog.create([
    {
      provider: "EBC",
      eventId: "demo-ebc-verified-001",
      eventType: "VERIFICATION_COMPLETED",
      status: "PROCESSED",
      payload: {
        applicantId: "EBC-DEMO-1001",
        workerProfileId: String(aminaProfile._id),
        status: "VERIFIED"
      },
      lastError: "",
      processedAt: new Date()
    },
    {
      provider: "STRIPE",
      eventId: "demo-stripe-payment-001",
      eventType: "checkout.session.completed",
      status: "PROCESSED",
      payload: {
        shiftId: String(shiftFilled._id),
        paymentLogId: String(demoPayments[0]._id),
        amount: demoPayments[0].amount
      },
      lastError: "",
      processedAt: new Date()
    }
  ]);

  console.log("Seeded demo data for CareConnect.");
  console.log("");
  console.log("Demo login details:");
  console.log(`Password: ${DEMO_PASSWORD}`);
  console.log(`Admin: ${adminUser.email}`);
  console.log(`Facility: ${sunriseUser.email}`);
  console.log(`Facility: ${harbourUser.email}`);
  console.log(`Worker: ${workerAUser.email}`);
  console.log(`Worker: ${workerBUser.email}`);
  console.log(`Worker: ${workerCUser.email}`);
  console.log(`Worker: ${workerDUser.email}`);
  console.log(`Worker: ${workerEUser.email}`);
  console.log("");
  console.log(
    `Created ${demoApplications.length} applications, ${demoAssignments.length} assignments, ${demoVerifications.length} verification logs, ${demoPayments.length} payment logs, ${notifications.length} notifications, ${emailLogs.length} email logs, 1 email queue job, ${auditLogs.length} audit logs, and ${webhookEvents.length} webhook events.`
  );
}

seedDemoData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Demo seed failed:", error);
    process.exit(1);
  });
