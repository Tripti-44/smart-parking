// ============================================================
//  Smart Parking System — Complete Seed Data
//  File: backend/seeders/seed.js
//  Run:  node seeders/seed.js
// ============================================================

const bcrypt = require('bcrypt');

// ============================================================
// TABLE 1: USERS (25 entries — mix of user + admin roles)
// ============================================================
const users = [
  { id:1,  name:"Rahul Sharma",      email:"rahul.sharma@gmail.com",    phone:"9876543210", role:"admin",  password:"admin123"  },
  { id:2,  name:"Priya Mehta",       email:"priya.mehta@gmail.com",     phone:"9823456781", role:"admin",  password:"admin123"  },
  { id:3,  name:"Amit Kumar",        email:"amit.kumar@yahoo.com",      phone:"9712345678", role:"user",   password:"user123"   },
  { id:4,  name:"Sneha Verma",       email:"sneha.verma@gmail.com",     phone:"9654321987", role:"user",   password:"user123"   },
  { id:5,  name:"Rohan Gupta",       email:"rohan.gupta@hotmail.com",   phone:"9543219876", role:"user",   password:"user123"   },
  { id:6,  name:"Anjali Singh",      email:"anjali.singh@gmail.com",    phone:"9432198765", role:"user",   password:"user123"   },
  { id:7,  name:"Vikram Patel",      email:"vikram.patel@gmail.com",    phone:"9321987654", role:"user",   password:"user123"   },
  { id:8,  name:"Deepika Nair",      email:"deepika.nair@gmail.com",    phone:"9219876543", role:"user",   password:"user123"   },
  { id:9,  name:"Suresh Yadav",      email:"suresh.yadav@yahoo.com",    phone:"9198765432", role:"user",   password:"user123"   },
  { id:10, name:"Kavya Reddy",       email:"kavya.reddy@gmail.com",     phone:"9987654321", role:"user",   password:"user123"   },
  { id:11, name:"Manish Joshi",      email:"manish.joshi@gmail.com",    phone:"9876541230", role:"user",   password:"user123"   },
  { id:12, name:"Pooja Agarwal",     email:"pooja.agarwal@gmail.com",   phone:"9765430129", role:"user",   password:"user123"   },
  { id:13, name:"Arjun Bose",        email:"arjun.bose@gmail.com",      phone:"9654329018", role:"user",   password:"user123"   },
  { id:14, name:"Ritu Mishra",       email:"ritu.mishra@yahoo.com",     phone:"9543218907", role:"user",   password:"user123"   },
  { id:15, name:"Karan Malhotra",    email:"karan.malhotra@gmail.com",  phone:"9432107896", role:"user",   password:"user123"   },
  { id:16, name:"Nisha Pillai",      email:"nisha.pillai@gmail.com",    phone:"9321096785", role:"user",   password:"user123"   },
  { id:17, name:"Tarun Saxena",      email:"tarun.saxena@hotmail.com",  phone:"9210985674", role:"user",   password:"user123"   },
  { id:18, name:"Swati Chauhan",     email:"swati.chauhan@gmail.com",   phone:"9109874563", role:"user",   password:"user123"   },
  { id:19, name:"Nikhil Desai",      email:"nikhil.desai@gmail.com",    phone:"9098763452", role:"user",   password:"user123"   },
  { id:20, name:"Megha Tiwari",      email:"megha.tiwari@gmail.com",    phone:"9987652341", role:"user",   password:"user123"   },
  { id:21, name:"Rajesh Iyer",       email:"rajesh.iyer@yahoo.com",     phone:"9876541232", role:"user",   password:"user123"   },
  { id:22, name:"Simran Kaur",       email:"simran.kaur@gmail.com",     phone:"9765430123", role:"user",   password:"user123"   },
  { id:23, name:"Harsh Vardhan",     email:"harsh.vardhan@gmail.com",   phone:"9654329014", role:"user",   password:"user123"   },
  { id:24, name:"Divya Shetty",      email:"divya.shetty@gmail.com",    phone:"9543218905", role:"user",   password:"user123"   },
  { id:25, name:"Pranav Kulkarni",   email:"pranav.kulkarni@gmail.com", phone:"9432107896", role:"user",   password:"user123"   },
];

// ============================================================
// TABLE 2: PARKING LOTS (5 entries — real Indian locations)
// ============================================================
const parkingLots = [
  {
    id: 1,
    name: "Andheri East Multilevel Parking",
    address: "Marol Naka, Andheri East, Mumbai - 400059",
    city: "Mumbai",
    latitude: 19.1136,
    longitude: 72.8697,
    total_slots: 40,
    price_per_hour: 40,
    opening_time: "06:00",
    closing_time: "23:00",
  },
  {
    id: 2,
    name: "Connaught Place Underground Parking",
    address: "CP Inner Circle, Connaught Place, New Delhi - 110001",
    city: "Delhi",
    latitude: 28.6315,
    longitude: 77.2167,
    total_slots: 60,
    price_per_hour: 60,
    opening_time: "05:00",
    closing_time: "00:00",
  },
  {
    id: 3,
    name: "MG Road Smart Parking Complex",
    address: "MG Road, Near Trinity Circle, Bangalore - 560001",
    city: "Bangalore",
    latitude: 12.9757,
    longitude: 77.6011,
    total_slots: 50,
    price_per_hour: 50,
    opening_time: "06:00",
    closing_time: "22:00",
  },
  {
    id: 4,
    name: "Banjara Hills Parking Hub",
    address: "Road No. 12, Banjara Hills, Hyderabad - 500034",
    city: "Hyderabad",
    latitude: 17.4156,
    longitude: 78.4347,
    total_slots: 45,
    price_per_hour: 35,
    opening_time: "06:00",
    closing_time: "23:00",
  },
  {
    id: 5,
    name: "Anna Nagar Tower Parking",
    address: "Anna Nagar Tower, Chennai - 600040",
    city: "Chennai",
    latitude: 13.0850,
    longitude: 80.2101,
    total_slots: 55,
    price_per_hour: 30,
    opening_time: "05:30",
    closing_time: "23:30",
  },
];

// ============================================================
// TABLE 3: SLOTS — auto-generated (25 per lot shown here)
// Script generates all slots for all 5 lots
// ============================================================

function generateSlots() {
  const slots = [];
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const typeMap = { 1: '2W', 2: '4W', 0: 'EV' }; // i%3 decides type

  parkingLots.forEach((lot) => {
    let slotId = (lot.id - 1) * (rows.length * 5) + 1;
    rows.forEach((row) => {
      for (let i = 1; i <= 5; i++) {
        slots.push({
          id: slotId++,
          lot_id: lot.id,
          slot_number: `${row}${i}`,
          type: typeMap[i % 3],
          status: 'available',         // default — app changes this
          price_per_hour: lot.price_per_hour,
        });
      }
    });
  });
  return slots;
}

// Preview — first 25 slots (Lot 1: Andheri)
const sampleSlots = [
  { id:1,  lot_id:1, slot_number:"A1", type:"2W", status:"available",    price_per_hour:40 },
  { id:2,  lot_id:1, slot_number:"A2", type:"4W", status:"available",    price_per_hour:40 },
  { id:3,  lot_id:1, slot_number:"A3", type:"EV", status:"maintenance",  price_per_hour:40 },
  { id:4,  lot_id:1, slot_number:"A4", type:"2W", status:"available",    price_per_hour:40 },
  { id:5,  lot_id:1, slot_number:"A5", type:"4W", status:"booked",       price_per_hour:40 },
  { id:6,  lot_id:1, slot_number:"B1", type:"EV", status:"available",    price_per_hour:40 },
  { id:7,  lot_id:1, slot_number:"B2", type:"2W", status:"booked",       price_per_hour:40 },
  { id:8,  lot_id:1, slot_number:"B3", type:"4W", status:"available",    price_per_hour:40 },
  { id:9,  lot_id:1, slot_number:"B4", type:"EV", status:"available",    price_per_hour:40 },
  { id:10, lot_id:1, slot_number:"B5", type:"2W", status:"available",    price_per_hour:40 },
  { id:11, lot_id:1, slot_number:"C1", type:"4W", status:"available",    price_per_hour:40 },
  { id:12, lot_id:1, slot_number:"C2", type:"EV", status:"booked",       price_per_hour:40 },
  { id:13, lot_id:1, slot_number:"C3", type:"2W", status:"available",    price_per_hour:40 },
  { id:14, lot_id:1, slot_number:"C4", type:"4W", status:"maintenance",  price_per_hour:40 },
  { id:15, lot_id:1, slot_number:"C5", type:"EV", status:"available",    price_per_hour:40 },
  { id:16, lot_id:2, slot_number:"A1", type:"4W", status:"available",    price_per_hour:60 },
  { id:17, lot_id:2, slot_number:"A2", type:"4W", status:"booked",       price_per_hour:60 },
  { id:18, lot_id:2, slot_number:"A3", type:"2W", status:"available",    price_per_hour:60 },
  { id:19, lot_id:2, slot_number:"A4", type:"EV", status:"available",    price_per_hour:60 },
  { id:20, lot_id:2, slot_number:"A5", type:"4W", status:"available",    price_per_hour:60 },
  { id:21, lot_id:3, slot_number:"A1", type:"2W", status:"available",    price_per_hour:50 },
  { id:22, lot_id:3, slot_number:"A2", type:"EV", status:"booked",       price_per_hour:50 },
  { id:23, lot_id:3, slot_number:"A3", type:"4W", status:"available",    price_per_hour:50 },
  { id:24, lot_id:4, slot_number:"A1", type:"4W", status:"available",    price_per_hour:35 },
  { id:25, lot_id:5, slot_number:"A1", type:"2W", status:"available",    price_per_hour:30 },
];

// ============================================================
// TABLE 4: BOOKINGS (25 entries)
// ============================================================
const bookings = [
  { id:1,  user_id:3,  slot_id:2,  start_time:"2025-04-01 09:00:00", end_time:"2025-04-01 11:00:00", total_amount:80,  status:"confirmed",  qr_code:"QR-BK-001" },
  { id:2,  user_id:4,  slot_id:5,  start_time:"2025-04-01 10:00:00", end_time:"2025-04-01 12:00:00", total_amount:80,  status:"confirmed",  qr_code:"QR-BK-002" },
  { id:3,  user_id:5,  slot_id:7,  start_time:"2025-04-01 11:00:00", end_time:"2025-04-01 14:00:00", total_amount:120, status:"completed",  qr_code:"QR-BK-003" },
  { id:4,  user_id:6,  slot_id:12, start_time:"2025-04-02 08:00:00", end_time:"2025-04-02 10:00:00", total_amount:80,  status:"completed",  qr_code:"QR-BK-004" },
  { id:5,  user_id:7,  slot_id:17, start_time:"2025-04-02 09:30:00", end_time:"2025-04-02 12:30:00", total_amount:180, status:"confirmed",  qr_code:"QR-BK-005" },
  { id:6,  user_id:8,  slot_id:19, start_time:"2025-04-02 13:00:00", end_time:"2025-04-02 15:00:00", total_amount:120, status:"cancelled",  qr_code:"QR-BK-006" },
  { id:7,  user_id:9,  slot_id:21, start_time:"2025-04-03 07:00:00", end_time:"2025-04-03 09:00:00", total_amount:100, status:"completed",  qr_code:"QR-BK-007" },
  { id:8,  user_id:10, slot_id:4,  start_time:"2025-04-03 10:00:00", end_time:"2025-04-03 13:00:00", total_amount:120, status:"confirmed",  qr_code:"QR-BK-008" },
  { id:9,  user_id:11, slot_id:8,  start_time:"2025-04-04 09:00:00", end_time:"2025-04-04 11:00:00", total_amount:80,  status:"completed",  qr_code:"QR-BK-009" },
  { id:10, user_id:12, slot_id:11, start_time:"2025-04-04 14:00:00", end_time:"2025-04-04 17:00:00", total_amount:120, status:"confirmed",  qr_code:"QR-BK-010" },
  { id:11, user_id:13, slot_id:16, start_time:"2025-04-05 08:00:00", end_time:"2025-04-05 10:00:00", total_amount:120, status:"completed",  qr_code:"QR-BK-011" },
  { id:12, user_id:14, slot_id:18, start_time:"2025-04-05 11:00:00", end_time:"2025-04-05 14:00:00", total_amount:180, status:"cancelled",  qr_code:"QR-BK-012" },
  { id:13, user_id:15, slot_id:22, start_time:"2025-04-06 09:00:00", end_time:"2025-04-06 11:00:00", total_amount:100, status:"confirmed",  qr_code:"QR-BK-013" },
  { id:14, user_id:16, slot_id:24, start_time:"2025-04-06 10:00:00", end_time:"2025-04-06 12:00:00", total_amount:70,  status:"completed",  qr_code:"QR-BK-014" },
  { id:15, user_id:17, slot_id:25, start_time:"2025-04-07 07:30:00", end_time:"2025-04-07 09:30:00", total_amount:60,  status:"confirmed",  qr_code:"QR-BK-015" },
  { id:16, user_id:18, slot_id:1,  start_time:"2025-04-07 11:00:00", end_time:"2025-04-07 13:00:00", total_amount:80,  status:"completed",  qr_code:"QR-BK-016" },
  { id:17, user_id:19, slot_id:6,  start_time:"2025-04-08 08:00:00", end_time:"2025-04-08 10:00:00", total_amount:80,  status:"confirmed",  qr_code:"QR-BK-017" },
  { id:18, user_id:20, slot_id:9,  start_time:"2025-04-08 12:00:00", end_time:"2025-04-08 15:00:00", total_amount:120, status:"completed",  qr_code:"QR-BK-018" },
  { id:19, user_id:21, slot_id:13, start_time:"2025-04-09 09:00:00", end_time:"2025-04-09 11:00:00", total_amount:80,  status:"cancelled",  qr_code:"QR-BK-019" },
  { id:20, user_id:22, slot_id:20, start_time:"2025-04-09 10:00:00", end_time:"2025-04-09 14:00:00", total_amount:240, status:"confirmed",  qr_code:"QR-BK-020" },
  { id:21, user_id:23, slot_id:23, start_time:"2025-04-10 08:00:00", end_time:"2025-04-10 10:00:00", total_amount:100, status:"completed",  qr_code:"QR-BK-021" },
  { id:22, user_id:24, slot_id:3,  start_time:"2025-04-10 13:00:00", end_time:"2025-04-10 15:00:00", total_amount:80,  status:"confirmed",  qr_code:"QR-BK-022" },
  { id:23, user_id:25, slot_id:10, start_time:"2025-04-11 09:00:00", end_time:"2025-04-11 12:00:00", total_amount:120, status:"completed",  qr_code:"QR-BK-023" },
  { id:24, user_id:3,  slot_id:15, start_time:"2025-04-11 14:00:00", end_time:"2025-04-11 16:00:00", total_amount:80,  status:"expired",    qr_code:"QR-BK-024" },
  { id:25, user_id:4,  slot_id:2,  start_time:"2025-04-12 10:00:00", end_time:"2025-04-12 13:00:00", total_amount:120, status:"confirmed",  qr_code:"QR-BK-025" },
];

// ============================================================
// TABLE 5: PAYMENTS (25 entries — linked to bookings above)
// ============================================================
const payments = [
  { id:1,  booking_id:1,  razorpay_order_id:"order_001ABC", razorpay_payment_id:"pay_001XYZ", amount:80,  status:"paid",     paid_at:"2025-04-01 08:55:00" },
  { id:2,  booking_id:2,  razorpay_order_id:"order_002ABC", razorpay_payment_id:"pay_002XYZ", amount:80,  status:"paid",     paid_at:"2025-04-01 09:58:00" },
  { id:3,  booking_id:3,  razorpay_order_id:"order_003ABC", razorpay_payment_id:"pay_003XYZ", amount:120, status:"paid",     paid_at:"2025-04-01 10:58:00" },
  { id:4,  booking_id:4,  razorpay_order_id:"order_004ABC", razorpay_payment_id:"pay_004XYZ", amount:80,  status:"paid",     paid_at:"2025-04-02 07:55:00" },
  { id:5,  booking_id:5,  razorpay_order_id:"order_005ABC", razorpay_payment_id:"pay_005XYZ", amount:180, status:"paid",     paid_at:"2025-04-02 09:28:00" },
  { id:6,  booking_id:6,  razorpay_order_id:"order_006ABC", razorpay_payment_id:"pay_006XYZ", amount:120, status:"refunded", paid_at:"2025-04-02 12:55:00" },
  { id:7,  booking_id:7,  razorpay_order_id:"order_007ABC", razorpay_payment_id:"pay_007XYZ", amount:100, status:"paid",     paid_at:"2025-04-03 06:55:00" },
  { id:8,  booking_id:8,  razorpay_order_id:"order_008ABC", razorpay_payment_id:"pay_008XYZ", amount:120, status:"paid",     paid_at:"2025-04-03 09:55:00" },
  { id:9,  booking_id:9,  razorpay_order_id:"order_009ABC", razorpay_payment_id:"pay_009XYZ", amount:80,  status:"paid",     paid_at:"2025-04-04 08:58:00" },
  { id:10, booking_id:10, razorpay_order_id:"order_010ABC", razorpay_payment_id:"pay_010XYZ", amount:120, status:"paid",     paid_at:"2025-04-04 13:55:00" },
  { id:11, booking_id:11, razorpay_order_id:"order_011ABC", razorpay_payment_id:"pay_011XYZ", amount:120, status:"paid",     paid_at:"2025-04-05 07:58:00" },
  { id:12, booking_id:12, razorpay_order_id:"order_012ABC", razorpay_payment_id:"pay_012XYZ", amount:180, status:"refunded", paid_at:"2025-04-05 10:55:00" },
  { id:13, booking_id:13, razorpay_order_id:"order_013ABC", razorpay_payment_id:"pay_013XYZ", amount:100, status:"paid",     paid_at:"2025-04-06 08:55:00" },
  { id:14, booking_id:14, razorpay_order_id:"order_014ABC", razorpay_payment_id:"pay_014XYZ", amount:70,  status:"paid",     paid_at:"2025-04-06 09:58:00" },
  { id:15, booking_id:15, razorpay_order_id:"order_015ABC", razorpay_payment_id:"pay_015XYZ", amount:60,  status:"paid",     paid_at:"2025-04-07 07:25:00" },
  { id:16, booking_id:16, razorpay_order_id:"order_016ABC", razorpay_payment_id:"pay_016XYZ", amount:80,  status:"paid",     paid_at:"2025-04-07 10:58:00" },
  { id:17, booking_id:17, razorpay_order_id:"order_017ABC", razorpay_payment_id:"pay_017XYZ", amount:80,  status:"paid",     paid_at:"2025-04-08 07:55:00" },
  { id:18, booking_id:18, razorpay_order_id:"order_018ABC", razorpay_payment_id:"pay_018XYZ", amount:120, status:"paid",     paid_at:"2025-04-08 11:55:00" },
  { id:19, booking_id:19, razorpay_order_id:"order_019ABC", razorpay_payment_id:"pay_019XYZ", amount:80,  status:"refunded", paid_at:"2025-04-09 08:55:00" },
  { id:20, booking_id:20, razorpay_order_id:"order_020ABC", razorpay_payment_id:"pay_020XYZ", amount:240, status:"paid",     paid_at:"2025-04-09 09:55:00" },
  { id:21, booking_id:21, razorpay_order_id:"order_021ABC", razorpay_payment_id:"pay_021XYZ", amount:100, status:"paid",     paid_at:"2025-04-10 07:55:00" },
  { id:22, booking_id:22, razorpay_order_id:"order_022ABC", razorpay_payment_id:"pay_022XYZ", amount:80,  status:"paid",     paid_at:"2025-04-10 12:55:00" },
  { id:23, booking_id:23, razorpay_order_id:"order_023ABC", razorpay_payment_id:"pay_023XYZ", amount:120, status:"paid",     paid_at:"2025-04-11 08:55:00" },
  { id:24, booking_id:24, razorpay_order_id:"order_024ABC", razorpay_payment_id:"pay_024XYZ", amount:80,  status:"failed",   paid_at:"2025-04-11 13:55:00" },
  { id:25, booking_id:25, razorpay_order_id:"order_025ABC", razorpay_payment_id:"pay_025XYZ", amount:120, status:"paid",     paid_at:"2025-04-12 09:55:00" },
];

// ============================================================
// MAIN FUNCTION — Run this to insert everything into DB
// ============================================================
async function seedDatabase() {
  const { Sequelize, DataTypes } = require('sequelize');
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'smart_parking',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'root',
    { host: 'localhost', dialect: 'mysql', logging: false }
  );

  try {
    await sequelize.authenticate();
    console.log('DB connected.');

    // Insert Users
    for (const u of users) {
      const hashed = await bcrypt.hash(u.password, 10);
      await sequelize.query(
        `INSERT IGNORE INTO users (id,name,email,password,phone,role,created_at)
         VALUES (?,?,?,?,?,?,NOW())`,
        { replacements: [u.id, u.name, u.email, hashed, u.phone, u.role] }
      );
    }
    console.log('✓ Users seeded (25)');

    // Insert Parking Lots
    for (const lot of parkingLots) {
      await sequelize.query(
  `INSERT IGNORE INTO parking_lots
   (id,name,address,city,latitude,longitude,total_slots,price_per_hour,opening_time,closing_time)
   VALUES (?,?,?,?,?,?,?,?,?,?)`,
  { replacements: [lot.id,lot.name,lot.address,lot.city,
      lot.latitude,lot.longitude,lot.total_slots,
      lot.price_per_hour,lot.opening_time,lot.closing_time] }
);
    }
    console.log('✓ Parking Lots seeded (5)');

    // Insert Slots (generated)
    const allSlots = generateSlots();
    for (const s of allSlots) {
      await sequelize.query(
        `INSERT IGNORE INTO slots (id,lot_id,slot_number,type,status,price_per_hour)
         VALUES (?,?,?,?,?,?)`,
        { replacements: [s.id,s.lot_id,s.slot_number,s.type,s.status,s.price_per_hour] }
      );
    }
    console.log(`✓ Slots seeded (${allSlots.length})`);

    // Insert Bookings
    for (const b of bookings) {
      await sequelize.query(
        `INSERT IGNORE INTO bookings
         (id,user_id,slot_id,start_time,end_time,total_amount,status,qr_code)
         VALUES (?,?,?,?,?,?,?,?)`,
        { replacements: [b.id,b.user_id,b.slot_id,b.start_time,
            b.end_time,b.total_amount,b.status,b.qr_code] }
      );
    }
    console.log('✓ Bookings seeded (25)');

    // Insert Payments
    for (const p of payments) {
      await sequelize.query(
        `INSERT IGNORE INTO payments
         (id,booking_id,razorpay_order_id,razorpay_payment_id,amount,status,paid_at)
         VALUES (?,?,?,?,?,?,?)`,
        { replacements: [p.id,p.booking_id,p.razorpay_order_id,
            p.razorpay_payment_id,p.amount,p.status,p.paid_at] }
      );
    }
    console.log('✓ Payments seeded (25)');

    console.log('\n All done! Database is ready.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seedDatabase();
