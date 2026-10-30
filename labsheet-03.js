/*******************************************************************
 MongoDB Practical File - All 15 Programs (single file)
 Run in mongosh:  load("mongodb_all_15_programs.js")
 Each program uses its own database. Program 11 needs a replica set
 (transactions are not supported on a standalone server).
*******************************************************************/


/*=================================================================
 1. STUDENT ACTIVITY TRACKING SYSTEM
=================================================================*/
db = db.getSiblingDB("student_activity");
db.students.drop();

db.students.insertMany([
  {
    _id: 1, name: "Aman Sharma", email: "aman@college.edu", age: 20, city: "Meerut",
    courses: [{ code: "CS101", title: "Programming in C", grade: "A" },
              { code: "CS102", title: "Databases", grade: "B+" }],
    attendance: [{ course: "CS101", total: 40, attended: 38 },
                 { course: "CS102", total: 40, attended: 30 }],
    skills: ["Python", "MongoDB", "SQL"],
    recentActivities: [
      { type: "assignment_submitted", date: new Date("2026-10-25") },
      { type: "quiz_attempted",       date: new Date("2026-10-27") }]
  },
  {
    _id: 2, name: "Neha Verma", email: "neha@college.edu", age: 21, city: "Delhi",
    courses: [{ code: "CS101", title: "Programming in C", grade: "A+" }],
    attendance: [{ course: "CS101", total: 40, attended: 25 }],
    skills: ["Java", "React"],
    recentActivities: [{ type: "event_participation", date: new Date("2026-09-10") }]
  },
  {
    _id: 3, name: "Rohit Singh", email: "rohit@college.edu", age: 22, city: "Noida",
    courses: [{ code: "CS103", title: "Web Technology", grade: "B" },
              { code: "CS102", title: "Databases", grade: "A" }],
    attendance: [{ course: "CS103", total: 30, attended: 29 },
                 { course: "CS102", total: 40, attended: 36 }],
    skills: ["MongoDB", "Node.js", "Python"],
    recentActivities: [{ type: "quiz_attempted", date: new Date("2026-10-28") },
                       { type: "lab_completed",  date: new Date("2026-10-29") }]
  }
]);

// 1a. Students enrolled in a particular course
db.students.find({ "courses.code": "CS102" }, { name: 1, _id: 0 });

// 1b. Students having BOTH Python and MongoDB skills
db.students.find({ skills: { $all: ["Python", "MongoDB"] } }, { name: 1, skills: 1 });

// 1c. Students with any activity in the last 30 days
var since = new Date(); since.setDate(since.getDate() - 30);
db.students.find({ "recentActivities.date": { $gte: since } }, { name: 1 });

// 1d. Students with attendance below 75% in any course
db.students.aggregate([
  { $unwind: "$attendance" },
  { $project: { name: 1, course: "$attendance.course",
      pct: { $multiply: [{ $divide: ["$attendance.attended", "$attendance.total"] }, 100] } } },
  { $match: { pct: { $lt: 75 } } }
]);

// 1e. Students who attempted a quiz AND know Python
db.students.find({ "recentActivities.type": "quiz_attempted", skills: "Python" }, { name: 1 });

// 1f. Students enrolled in 2 or more courses
db.students.find({ courses: { $exists: true }, $expr: { $gte: [{ $size: "$courses" }, 2] } }, { name: 1 });


/*=================================================================
 2. EVENT LOGGING SYSTEM
=================================================================*/
db = db.getSiblingDB("event_logging");
db.events.drop();

db.events.insertMany([
  { user: "amit",  event: "login",           ip: "10.0.0.1", ts: new Date("2026-10-29T09:00:00Z") },
  { user: "amit",  event: "file-upload",     ip: "10.0.0.1", ts: new Date("2026-10-29T09:10:00Z") },
  { user: "amit",  event: "logout",          ip: "10.0.0.1", ts: new Date("2026-10-29T10:00:00Z") },
  { user: "ravi",  event: "failed-login",    ip: "10.0.0.7", ts: new Date("2026-10-29T11:00:00Z") },
  { user: "ravi",  event: "failed-login",    ip: "10.0.0.7", ts: new Date("2026-10-29T11:01:00Z") },
  { user: "ravi",  event: "failed-login",    ip: "10.0.0.7", ts: new Date("2026-10-29T11:02:00Z") },
  { user: "ravi",  event: "login",           ip: "10.0.0.7", ts: new Date("2026-10-29T11:05:00Z") },
  { user: "sita",  event: "password-change", ip: "10.0.0.9", ts: new Date("2026-10-29T12:00:00Z") },
  { user: "sita",  event: "failed-login",    ip: "10.0.0.9", ts: new Date("2026-10-29T12:30:00Z") },
  { user: "sita",  event: "login",           ip: "10.0.0.9", ts: new Date("2026-10-29T12:31:00Z") }
]);
db.events.createIndex({ event: 1, user: 1, ts: -1 });

// 2a. Users with 3 or more failed logins
db.events.aggregate([
  { $match: { event: "failed-login" } },
  { $group: { _id: "$user", attempts: { $sum: 1 }, lastTry: { $max: "$ts" } } },
  { $match: { attempts: { $gte: 3 } } },
  { $sort: { attempts: -1 } }
]);

// 2b. Frequency of each event type
db.events.aggregate([
  { $group: { _id: "$event", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);

// 2c. IPs with repeated failed logins
db.events.aggregate([
  { $match: { event: "failed-login" } },
  { $group: { _id: "$ip", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
]);

// 2d. Most recent event of every user
db.events.aggregate([
  { $sort: { ts: -1 } },
  { $group: { _id: "$user", lastEvent: { $first: "$event" }, at: { $first: "$ts" } } }
]);


/*=================================================================
 3. MINI BLOGGING PLATFORM
=================================================================*/
db = db.getSiblingDB("mini_blog");
db.blogs.drop();

db.blogs.insertMany([
  { title: "Intro to MongoDB", author: "Asha", category: "Database",
    tags: ["mongodb", "nosql", "beginner"],
    comments: [{ user: "raj", text: "Nice!", date: new Date() }],
    publication: { status: "published", date: new Date("2026-10-01") } },
  { title: "Node.js REST API", author: "Vikas", category: "Web",
    tags: ["nodejs", "api", "beginner"],
    comments: [],
    publication: { status: "published", date: new Date("2026-10-10") } },
  { title: "Advanced Indexing", author: "Asha", category: "Database",
    tags: ["mongodb", "performance", "index"],
    comments: [{ user: "meena", text: "Helpful", date: new Date() },
               { user: "raj", text: "Great", date: new Date() }],
    publication: { status: "draft", date: null } },
  { title: "Learning React", author: "Vikas", category: "Web",
    tags: ["react", "javascript", "beginner"],
    comments: [],
    publication: { status: "published", date: new Date("2026-10-20") } }
]);

// 3a. Category = Database AND tag = mongodb
db.blogs.find({ category: "Database", tags: "mongodb" }, { title: 1, _id: 0 });

// 3b. Blogs having ANY of the tags
db.blogs.find({ tags: { $in: ["react", "nodejs"] } }, { title: 1, _id: 0 });

// 3c. Blogs having ALL tags
db.blogs.find({ tags: { $all: ["mongodb", "beginner"] } }, { title: 1, _id: 0 });

// 3d. Published blogs in Web OR Database category with tag 'beginner'
db.blogs.find({
  "publication.status": "published",
  $or: [{ category: "Web" }, { category: "Database" }],
  tags: "beginner"
}, { title: 1, author: 1, _id: 0 });

// 3e. Blogs with at least one comment, newest first
db.blogs.find({ "comments.0": { $exists: true } }).sort({ "publication.date": -1 });

// 3f. Blog count per category
db.blogs.aggregate([{ $group: { _id: "$category", total: { $sum: 1 } } }]);


/*=================================================================
 4. FLEXIBLE PRODUCT CATALOG (laptops, mobiles, cameras)
=================================================================*/
db = db.getSiblingDB("product_catalog");
db.products.drop();

db.products.insertMany([
  { name: "ProBook 450", category: "laptop", brand: "HP", price: 65000,
    attributes: { ram_gb: 16, storage_gb: 512, processor: "i7", screen_in: 15.6 } },
  { name: "Aero 14", category: "laptop", brand: "Gigabyte", price: 90000,
    attributes: { ram_gb: 32, storage_gb: 1024, processor: "Ryzen 9", screen_in: 14 } },
  { name: "Galaxy S24", category: "mobile", brand: "Samsung", price: 70000,
    attributes: { ram_gb: 8, storage_gb: 256, battery_mah: 4000, camera_mp: 50, network: "5G" } },
  { name: "Redmi Note 13", category: "mobile", brand: "Xiaomi", price: 18000,
    attributes: { ram_gb: 6, storage_gb: 128, battery_mah: 5000, camera_mp: 108, network: "5G" } },
  { name: "EOS R50", category: "camera", brand: "Canon", price: 78000,
    attributes: { megapixels: 24.2, sensor: "APS-C", lens_mount: "RF", video: "4K" } },
  { name: "Alpha 7 IV", category: "camera", brand: "Sony", price: 215000,
    attributes: { megapixels: 33, sensor: "Full Frame", lens_mount: "E", video: "4K" } }
]);

// 4a. Laptops with 16 GB or more RAM
db.products.find({ category: "laptop", "attributes.ram_gb": { $gte: 16 } });

// 4b. 5G mobiles with battery >= 4500 mAh
db.products.find({ category: "mobile", "attributes.network": "5G", "attributes.battery_mah": { $gte: 4500 } });

// 4c. Full-frame cameras
db.products.find({ category: "camera", "attributes.sensor": "Full Frame" });

// 4d. Products having a particular attribute (works across categories)
db.products.find({ "attributes.camera_mp": { $exists: true } }, { name: 1, category: 1 });

// 4e. Average price per category
db.products.aggregate([{ $group: { _id: "$category", avgPrice: { $avg: "$price" } } }]);

// 4f. Index for faster category-specific searches
db.products.createIndex({ category: 1, price: 1 });


/*=================================================================
 5. E-COMMERCE ORDER MANAGEMENT SYSTEM
=================================================================*/
db = db.getSiblingDB("ecommerce");
db.customers.drop(); db.products.drop(); db.orders.drop();

db.customers.insertMany([
  { _id: 1, name: "Karan Mehta", email: "karan@mail.com", city: "Lucknow" },
  { _id: 2, name: "Priya Nair",  email: "priya@mail.com", city: "Pune" }
]);
db.products.insertMany([
  { _id: 101, name: "Keyboard", price: 1500 },
  { _id: 102, name: "Mouse",    price: 700 },
  { _id: 103, name: "Monitor",  price: 9000 }
]);
db.orders.insertMany([
  { _id: 5001, customerId: 1, orderDate: new Date("2026-09-15"),
    items: [{ productId: 101, qty: 1 }, { productId: 102, qty: 2 }] },
  { _id: 5002, customerId: 1, orderDate: new Date("2026-10-05"),
    items: [{ productId: 103, qty: 1 }] },
  { _id: 5003, customerId: 2, orderDate: new Date("2026-10-12"),
    items: [{ productId: 102, qty: 3 }, { productId: 101, qty: 1 }] }
]);

// 5a. Complete purchase history of customer 1 (orders + product details)
db.orders.aggregate([
  { $match: { customerId: 1 } },
  { $unwind: "$items" },
  { $lookup: { from: "products", localField: "items.productId", foreignField: "_id", as: "p" } },
  { $unwind: "$p" },
  { $project: { orderId: "$_id", orderDate: 1, product: "$p.name", qty: "$items.qty",
                price: "$p.price", lineTotal: { $multiply: ["$items.qty", "$p.price"] } } },
  { $sort: { orderDate: 1 } }
]);

// 5b. Total amount of every order
db.orders.aggregate([
  { $unwind: "$items" },
  { $lookup: { from: "products", localField: "items.productId", foreignField: "_id", as: "p" } },
  { $unwind: "$p" },
  { $group: { _id: "$_id", customerId: { $first: "$customerId" },
              orderTotal: { $sum: { $multiply: ["$items.qty", "$p.price"] } } } }
]);

// 5c. Total spending per customer with name
db.orders.aggregate([
  { $unwind: "$items" },
  { $lookup: { from: "products", localField: "items.productId", foreignField: "_id", as: "p" } },
  { $unwind: "$p" },
  { $group: { _id: "$customerId", spent: { $sum: { $multiply: ["$items.qty", "$p.price"] } } } },
  { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "c" } },
  { $unwind: "$c" },
  { $project: { _id: 0, customer: "$c.name", spent: 1 } }
]);


/*=================================================================
 6. WEBSITE ANALYTICS SYSTEM
=================================================================*/
db = db.getSiblingDB("web_analytics");
db.visits.drop();

db.visits.insertMany([
  { page: "/home",     userId: "u1", device: "mobile",  browser: "Chrome",  location: "Delhi",  ts: new Date("2026-10-28T10:00:00Z") },
  { page: "/home",     userId: "u2", device: "desktop", browser: "Firefox", location: "Mumbai", ts: new Date("2026-10-28T10:05:00Z") },
  { page: "/products", userId: "u1", device: "mobile",  browser: "Chrome",  location: "Delhi",  ts: new Date("2026-10-28T10:10:00Z") },
  { page: "/home",     userId: "u3", device: "tablet",  browser: "Safari",  location: "Pune",   ts: new Date("2026-10-29T09:00:00Z") },
  { page: "/contact",  userId: "u4", device: "mobile",  browser: "Chrome",  location: "Delhi",  ts: new Date("2026-10-29T09:30:00Z") },
  { page: "/products", userId: "u2", device: "desktop", browser: "Edge",    location: "Mumbai", ts: new Date("2026-10-29T11:00:00Z") },
  { page: "/home",     userId: "u5", device: "mobile",  browser: "Chrome",  location: "Noida",  ts: new Date("2026-10-30T08:00:00Z") }
]);

// 6a. Most visited pages
db.visits.aggregate([
  { $group: { _id: "$page", visits: { $sum: 1 } } },
  { $sort: { visits: -1 } }, { $limit: 5 }
]);

// 6b. Commonly used devices
db.visits.aggregate([
  { $group: { _id: "$device", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);

// 6c. Browser usage
db.visits.aggregate([{ $group: { _id: "$browser", count: { $sum: 1 } } }, { $sort: { count: -1 } }]);

// 6d. Unique visitors per page
db.visits.aggregate([
  { $group: { _id: "$page", users: { $addToSet: "$userId" } } },
  { $project: { uniqueVisitors: { $size: "$users" } } }
]);

// 6e. Visits per day
db.visits.aggregate([
  { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } }, visits: { $sum: 1 } } },
  { $sort: { _id: 1 } }
]);

// 6f. Top locations
db.visits.aggregate([{ $group: { _id: "$location", count: { $sum: 1 } } }, { $sort: { count: -1 } }]);


/*=================================================================
 7. CONTENT MANAGEMENT SYSTEM
=================================================================*/
db = db.getSiblingDB("cms");
db.articles.drop();

db.articles.insertMany([
  { title: "Cloud Basics",     author: "Ritu",  category: "Technology", tags: ["cloud", "aws"],
    status: "published",   publishedOn: new Date("2026-09-01") },
  { title: "Healthy Habits",   author: "Sumit", category: "Health",     tags: ["fitness", "diet"],
    status: "published",   publishedOn: new Date("2026-10-15") },
  { title: "AI in 2027",       author: "Ritu",  category: "Technology", tags: ["ai", "future"],
    status: "draft",       publishedOn: null },
  { title: "Budget Travel",    author: "Pooja", category: "Travel",     tags: ["budget", "tips"],
    status: "unpublished", publishedOn: null },
  { title: "Docker Guide",     author: "Sumit", category: "Technology", tags: ["docker", "devops"],
    status: "published",   publishedOn: new Date("2026-10-25") }
]);

// 7a. All published articles, latest first
db.articles.find({ status: "published" }).sort({ publishedOn: -1 });

// 7b. Unpublished content (draft or unpublished)
db.articles.find({ status: { $in: ["draft", "unpublished"] } });

// 7c. Published Technology articles by Ritu
db.articles.find({ status: "published", category: "Technology", author: "Ritu" });

// 7d. Published in the last 30 days
var d30 = new Date(); d30.setDate(d30.getDate() - 30);
db.articles.find({ status: "published", publishedOn: { $gte: d30 } });

// 7e. Articles by tag
db.articles.find({ tags: "docker" });

// 7f. Count by status
db.articles.aggregate([{ $group: { _id: "$status", total: { $sum: 1 } } }]);

// 7g. Publish a draft
db.articles.updateOne({ title: "AI in 2027" },
  { $set: { status: "published", publishedOn: new Date() } });


/*=================================================================
 8. SHOPPING CART SYSTEM (embedded documents)
=================================================================*/
db = db.getSiblingDB("shopping_cart");
db.carts.drop();

db.carts.insertOne({ _id: "cart1", userId: "u100", items: [], updatedAt: new Date() });

// 8a. Add products
db.carts.updateOne({ _id: "cart1" }, { $push: { items: { productId: 1, name: "Shoes",  price: 2500, qty: 1 } } });
db.carts.updateOne({ _id: "cart1" }, { $push: { items: { productId: 2, name: "T-Shirt", price: 800,  qty: 2 } } });
db.carts.updateOne({ _id: "cart1" }, { $push: { items: { productId: 3, name: "Cap",     price: 300,  qty: 1 } } });

// 8b. Add product only if not present, else increase qty
db.carts.updateOne({ _id: "cart1", "items.productId": 2 }, { $inc: { "items.$.qty": 1 } });

// 8c. Change quantity to a fixed value
db.carts.updateOne({ _id: "cart1", "items.productId": 1 }, { $set: { "items.$.qty": 3 } });

// 8d. Remove a product
db.carts.updateOne({ _id: "cart1" }, { $pull: { items: { productId: 3 } } });

// 8e. Calculate cart value
db.carts.aggregate([
  { $match: { _id: "cart1" } },
  { $project: { total: { $sum: { $map: { input: "$items", as: "i",
                 in: { $multiply: ["$$i.price", "$$i.qty"] } } } },
                itemCount: { $sum: "$items.qty" } } }
]);

// 8f. View cart
db.carts.findOne({ _id: "cart1" });


/*=================================================================
 9. PRODUCT REVIEW AND RATING SYSTEM
=================================================================*/
db = db.getSiblingDB("review_system");
db.reviews.drop();

db.reviews.insertMany([
  { productId: "P1", customer: "Anil",  rating: 5, comment: "Excellent",  date: new Date("2026-10-01") },
  { productId: "P1", customer: "Bina",  rating: 4, comment: "Good",       date: new Date("2026-10-03") },
  { productId: "P1", customer: "Chirag",rating: 3, comment: "Okay",       date: new Date("2026-10-07") },
  { productId: "P2", customer: "Anil",  rating: 2, comment: "Poor",       date: new Date("2026-10-09") },
  { productId: "P2", customer: "Dev",   rating: 4, comment: "Value",      date: new Date("2026-10-11") },
  { productId: "P3", customer: "Esha",  rating: 5, comment: "Loved it",   date: new Date("2026-10-15") }
]);

// 9a. Average rating and review count per product
db.reviews.aggregate([
  { $group: { _id: "$productId", avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
  { $sort: { avgRating: -1 } }
]);

// 9b. Products with average rating >= 4 and at least 2 reviews
db.reviews.aggregate([
  { $group: { _id: "$productId", avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
  { $match: { avgRating: { $gte: 4 }, totalReviews: { $gte: 2 } } }
]);

// 9c. Rating distribution of one product
db.reviews.aggregate([
  { $match: { productId: "P1" } },
  { $group: { _id: "$rating", count: { $sum: 1 } } },
  { $sort: { _id: -1 } }
]);

// 9d. Reviews by a customer
db.reviews.find({ customer: "Anil" });


/*=================================================================
 10. INVENTORY MONITORING SYSTEM
=================================================================*/
db = db.getSiblingDB("inventory_monitor");
db.stock.drop();

db.stock.insertMany([
  { sku: "A100", name: "Printer Ink", stock: 5,  minStock: 20, supplier: "InkCorp",   restockDate: new Date("2026-11-05") },
  { sku: "A200", name: "A4 Paper",    stock: 150, minStock: 100, supplier: "PaperWorld", restockDate: new Date("2026-11-20") },
  { sku: "A300", name: "Stapler",     stock: 0,  minStock: 10, supplier: "OfficeMart", restockDate: new Date("2026-10-28") },
  { sku: "A400", name: "Marker",      stock: 12, minStock: 12, supplier: "InkCorp",   restockDate: new Date("2026-11-10") },
  { sku: "A500", name: "Folder",      stock: 80, minStock: 30, supplier: "PaperWorld", restockDate: new Date("2026-12-01") }
]);

// 10a. Products below minimum stock level
db.stock.find({ $expr: { $lt: ["$stock", "$minStock"] } });

// 10b. At or below minimum
db.stock.find({ $expr: { $lte: ["$stock", "$minStock"] } });

// 10c. Out of stock
db.stock.find({ stock: 0 });

// 10d. Immediate restock: below minimum AND restock date already passed / within 7 days
var in7 = new Date(); in7.setDate(in7.getDate() + 7);
db.stock.find({ $expr: { $lt: ["$stock", "$minStock"] }, restockDate: { $lte: in7 } });

// 10e. Shortage quantity per product, supplier-wise
db.stock.aggregate([
  { $match: { $expr: { $lt: ["$stock", "$minStock"] } } },
  { $project: { name: 1, supplier: 1, shortage: { $subtract: ["$minStock", "$stock"] } } },
  { $sort: { shortage: -1 } }
]);

// 10f. Restock a product
db.stock.updateOne({ sku: "A100" }, { $inc: { stock: 50 } });


/*=================================================================
 11. BANK WALLET TRANSFER SYSTEM (TRANSACTIONS)
 Requires replica set:  mongod --replSet rs0  ->  rs.initiate()
=================================================================*/
db = db.getSiblingDB("wallet_bank");
db.wallets.drop(); db.transfers.drop();

db.createCollection("wallets");
db.createCollection("transfers");
db.wallets.insertMany([
  { _id: "alice", balance: 5000 },
  { _id: "bob",   balance: 2000 }
]);

function transferMoney(from, to, amount) {
  var session = db.getMongo().startSession();
  var w = session.getDatabase("wallet_bank").wallets;
  var t = session.getDatabase("wallet_bank").transfers;
  try {
    session.withTransaction(function () {
      var src = w.findOne({ _id: from }, { session });
      if (!src || src.balance < amount) throw new Error("Insufficient balance");

      w.updateOne({ _id: from }, { $inc: { balance: -amount } }, { session });
      w.updateOne({ _id: to },   { $inc: { balance:  amount } }, { session });
      t.insertOne({ from, to, amount, ts: new Date(), status: "success" }, { session });
    });
    print("Transfer successful: " + from + " -> " + to + " : " + amount);
  } catch (e) {
    print("Transfer failed, rolled back: " + e.message);
  } finally {
    session.endSession();
  }
}

transferMoney("alice", "bob", 1500);    // succeeds
transferMoney("bob", "alice", 99999);   // fails -> rolled back

db.wallets.find();
db.transfers.find();


/*=================================================================
 12. USER NOTIFICATION SYSTEM
=================================================================*/
db = db.getSiblingDB("notifications");
db.notifications.drop();

db.notifications.insertMany([
  { userId: "u1", type: "message",      text: "New message from Raj",      isRead: false, createdAt: new Date("2026-10-30T08:00:00Z") },
  { userId: "u1", type: "order_update", text: "Order #5001 shipped",        isRead: false, createdAt: new Date("2026-10-30T09:00:00Z") },
  { userId: "u1", type: "system_alert", text: "Password expires in 3 days", isRead: true,  createdAt: new Date("2026-10-29T09:00:00Z") },
  { userId: "u2", type: "message",      text: "You have a friend request",  isRead: false, createdAt: new Date("2026-10-30T10:00:00Z") }
]);
db.notifications.createIndex({ userId: 1, isRead: 1, createdAt: -1 });

// 12a. Unread notifications of a user, newest first
db.notifications.find({ userId: "u1", isRead: false }).sort({ createdAt: -1 });

// 12b. Unread count per type
db.notifications.aggregate([
  { $match: { userId: "u1", isRead: false } },
  { $group: { _id: "$type", count: { $sum: 1 } } }
]);

// 12c. Mark ONE notification as read after viewing
var n = db.notifications.findOne({ userId: "u1", isRead: false });
db.notifications.updateOne({ _id: n._id }, { $set: { isRead: true, readAt: new Date() } });

// 12d. Mark ALL unread notifications of a user as read
db.notifications.updateMany({ userId: "u1", isRead: false }, { $set: { isRead: true, readAt: new Date() } });

// 12e. Only order updates that are unread
db.notifications.find({ userId: "u1", type: "order_update", isRead: false });


/*=================================================================
 13. COURSE LEARNING PLATFORM
=================================================================*/
db = db.getSiblingDB("learning_platform");
db.instructors.drop(); db.courses.drop(); db.students.drop(); db.enrollments.drop();

db.instructors.insertMany([
  { _id: "i1", name: "Dr. Mehra", expertise: "Databases" },
  { _id: "i2", name: "Ms. Kapoor", expertise: "Web Development" }
]);
db.courses.insertMany([
  { _id: "c1", title: "MongoDB Mastery", instructorId: "i1",
    modules: [{ no: 1, title: "Basics" }, { no: 2, title: "CRUD" },
              { no: 3, title: "Aggregation" }, { no: 4, title: "Transactions" }] },
  { _id: "c2", title: "Full Stack Web", instructorId: "i2",
    modules: [{ no: 1, title: "HTML/CSS" }, { no: 2, title: "JavaScript" }] }
]);
db.students.insertMany([
  { _id: "s1", name: "Aarav" }, { _id: "s2", name: "Diya" },
  { _id: "s3", name: "Ishaan" }, { _id: "s4", name: "Kavya" }
]);
db.enrollments.insertMany([
  { studentId: "s1", courseId: "c1", completedModules: [1, 2, 3, 4], progress: 100, status: "completed" },
  { studentId: "s2", courseId: "c1", completedModules: [1, 2],       progress: 50,  status: "in-progress" },
  { studentId: "s3", courseId: "c1", completedModules: [],           progress: 0,   status: "not-started" },
  { studentId: "s4", courseId: "c2", completedModules: [1],          progress: 50,  status: "in-progress" },
  { studentId: "s1", courseId: "c2", completedModules: [1, 2],       progress: 100, status: "completed" }
]);

// 13a. Students who completed a course
db.enrollments.find({ courseId: "c1", status: "completed" });

// 13b. Students with progress between 25% and 75%
db.enrollments.find({ courseId: "c1", progress: { $gte: 25, $lte: 75 } });

// 13c. Students who have not started
db.enrollments.find({ status: "not-started" });

// 13d. Students (with names) and course titles for in-progress enrollments
db.enrollments.aggregate([
  { $match: { status: "in-progress" } },
  { $lookup: { from: "students", localField: "studentId", foreignField: "_id", as: "s" } },
  { $lookup: { from: "courses",  localField: "courseId",  foreignField: "_id", as: "c" } },
  { $unwind: "$s" }, { $unwind: "$c" },
  { $project: { _id: 0, student: "$s.name", course: "$c.title", progress: 1 } }
]);

// 13e. Average progress per course with instructor name
db.enrollments.aggregate([
  { $group: { _id: "$courseId", avgProgress: { $avg: "$progress" }, students: { $sum: 1 } } },
  { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "c" } },
  { $unwind: "$c" },
  { $lookup: { from: "instructors", localField: "c.instructorId", foreignField: "_id", as: "i" } },
  { $unwind: "$i" },
  { $project: { _id: 0, course: "$c.title", instructor: "$i.name", avgProgress: 1, students: 1 } }
]);

// 13f. Mark a module as completed and update progress
db.enrollments.updateOne({ studentId: "s3", courseId: "c1" },
  { $addToSet: { completedModules: 1 }, $set: { progress: 25, status: "in-progress" } });


/*=================================================================
 14. REAL-TIME ORDER TRACKING SYSTEM
=================================================================*/
db = db.getSiblingDB("order_tracking");
db.orders.drop();

db.orders.insertOne({
  _id: "ORD1001", customer: "Rahul", item: "Smart Watch", amount: 4999,
  currentStatus: "Placed",
  statusHistory: [{ status: "Placed", at: new Date("2026-10-27T10:00:00Z") }]
});

function updateStatus(orderId, newStatus) {
  db.orders.updateOne({ _id: orderId }, {
    $set:  { currentStatus: newStatus },
    $push: { statusHistory: { status: newStatus, at: new Date() } }
  });
}

updateStatus("ORD1001", "Confirmed");
updateStatus("ORD1001", "Shipped");
updateStatus("ORD1001", "Delivered");

// 14a. Current status
db.orders.find({ _id: "ORD1001" }, { currentStatus: 1, _id: 0 });

// 14b. Complete status history
db.orders.findOne({ _id: "ORD1001" }, { statusHistory: 1, _id: 0 });

// 14c. Current status computed from the last history element
db.orders.aggregate([
  { $match: { _id: "ORD1001" } },
  { $project: { latest: { $arrayElemAt: ["$statusHistory", -1] } } }
]);

// 14d. All orders that are currently Shipped
db.orders.find({ currentStatus: "Shipped" });

// 14e. Count of orders per current stage
db.orders.aggregate([{ $group: { _id: "$currentStatus", total: { $sum: 1 } } }]);


/*=================================================================
 15. FLEXIBLE NEWS DATABASE
=================================================================*/
db = db.getSiblingDB("news_db");
db.articles.drop();

db.articles.insertMany([
  { headline: "Heavy Rain in Delhi", author: "Seema", location: "Delhi", category: "Weather",
    tags: ["rain", "delhi"], images: ["rain1.jpg", "rain2.jpg"], source: "PTI" },
  { headline: "Stock Market Hits High", category: "Business", tags: ["sensex", "market"],
    source: "Reuters" },
  { headline: "Local Cricket Final", author: "Manoj", location: "Meerut", category: "Sports",
    images: ["cricket.jpg"] },
  { headline: "New Metro Line Opens", location: "Lucknow", category: "City",
    tags: ["metro", "transport"], sources: ["ANI", "Local Desk"] },
  { headline: "Tech Summit 2026", author: "Rhea", category: "Technology",
    tags: ["ai", "summit"], images: [], source: "TechDesk" }
]);
db.articles.createIndex({ headline: "text", tags: "text" });

// 15a. Articles that contain an author field
db.articles.find({ author: { $exists: true } }, { headline: 1, author: 1, _id: 0 });

// 15b. Articles WITHOUT location
db.articles.find({ location: { $exists: false } }, { headline: 1, _id: 0 });

// 15c. Articles having at least one image
db.articles.find({ "images.0": { $exists: true } }, { headline: 1, images: 1, _id: 0 });

// 15d. Articles from either 'source' or 'sources' (field variation)
db.articles.find({ $or: [{ source: "PTI" }, { sources: "ANI" }] }, { headline: 1, _id: 0 });

// 15e. Articles by location regardless of other fields (case-insensitive)
db.articles.find({ location: /^delhi$/i });

// 15f. Tag search where tags may be missing
db.articles.find({ tags: { $in: ["ai", "rain"] } }, { headline: 1, _id: 0 });

// 15g. Full-text search
db.articles.find({ $text: { $search: "market summit" } }, { headline: 1, _id: 0 });

// 15h. Find which fields each article actually has
db.articles.aggregate([{ $project: { headline: 1, fields: { $map: { input: { $objectToArray: "$$ROOT" }, as: "f", in: "$$f.k" } } } }]);

print("All 15 programs loaded successfully.");
