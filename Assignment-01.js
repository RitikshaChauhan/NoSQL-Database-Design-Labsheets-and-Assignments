/*
=====================================================================
                         ASSIGNMENT-01
        MongoDB CRUD Operations using MongoDB Shell and Compass
=====================================================================
Run in mongosh:   load("Assignment-01.js")
Or step by step:  copy each block into mongosh.
Note: In a .js file, "use StudentDB" is not valid syntax, so
db.getSiblingDB("StudentDB") is used instead (same effect).
=====================================================================
*/

// ---------------------------------------------------------------
// TASK 1: Create database StudentDB and verify
// ---------------------------------------------------------------
// MongoDB creates a database only when it holds data, so a
// collection is created first (see Task 2).
var db = db.getSiblingDB("StudentDB");        // equivalent to: use StudentDB
print("Current DB: " + db.getName());

// ---------------------------------------------------------------
// TASK 2: Create collections Students, Faculty, Courses
// ---------------------------------------------------------------
db.createCollection("Students");
db.createCollection("Faculty");
db.createCollection("Courses");

// Verification of Task 1 and 2
print("--- Databases ---");
printjson(db.adminCommand({ listDatabases: 1 }).databases.map(d => d.name));
print("--- Collections in StudentDB ---");
printjson(db.getCollectionNames());           // same as: show collections

// ---------------------------------------------------------------
// TASK 3: Insert a single document (insertOne)
// ---------------------------------------------------------------
db.Students.insertOne({
  RollNo: 101,
  Name: "Aarav Sharma",
  Department: "Computer Science",
  Semester: 5,
  CGPA: 8.7
});

// ---------------------------------------------------------------
// TASK 4: Insert multiple documents (insertMany)
// ---------------------------------------------------------------
db.Students.insertMany([
  { RollNo: 102, Name: "Priya Verma",   Department: "Computer Science", Semester: 5, CGPA: 9.1 },
  { RollNo: 103, Name: "Rohan Gupta",   Department: "Electronics",      Semester: 3, CGPA: 7.8 },
  { RollNo: 104, Name: "Sneha Singh",   Department: "Mechanical",       Semester: 7, CGPA: 8.2 },
  { RollNo: 105, Name: "Karan Mehta",   Department: "Electronics",      Semester: 3, CGPA: 6.9 },
  { RollNo: 106, Name: "Ananya Iyer",   Department: "Civil",            Semester: 1, CGPA: 8.9 },
  { RollNo: 107, Name: "Vikram Yadav",  Department: "Mechanical",       Semester: 7, CGPA: 7.4 }
]);

// ---------------------------------------------------------------
// TASK 5: Retrieve all documents
// ---------------------------------------------------------------
print("--- All students ---");
db.Students.find().forEach(printjson);        // or db.Students.find().pretty()

// ---------------------------------------------------------------
// TASK 6: Retrieve a specific student by Roll Number
// ---------------------------------------------------------------
print("--- Student with RollNo 103 ---");
printjson(db.Students.findOne({ RollNo: 103 }));

// ---------------------------------------------------------------
// TASK 7: Retrieve documents by condition on Department
// ---------------------------------------------------------------
print("--- Electronics students ---");
db.Students.find({ Department: "Electronics" }).forEach(printjson);

// ---------------------------------------------------------------
// TASK 8: Field projection (Name and Department only)
// ---------------------------------------------------------------
print("--- Projection: Name and Department ---");
db.Students.find({}, { _id: 0, Name: 1, Department: 1 }).forEach(printjson);

// ---------------------------------------------------------------
// TASK 9: updateOne() - change department of one student
// ---------------------------------------------------------------
db.Students.updateOne(
  { RollNo: 106 },
  { $set: { Department: "Architecture" } }
);
printjson(db.Students.findOne({ RollNo: 106 }));

// ---------------------------------------------------------------
// TASK 10: updateMany() - change semester for a whole department
// ---------------------------------------------------------------
db.Students.updateMany(
  { Department: "Electronics" },
  { $set: { Semester: 4 } }
);
db.Students.find({ Department: "Electronics" }).forEach(printjson);

// ---------------------------------------------------------------
// TASK 11: replaceOne() - replace an entire document
// ---------------------------------------------------------------
db.Students.replaceOne(
  { RollNo: 107 },
  { RollNo: 107, Name: "Vikram Yadav", Department: "Mechanical", Semester: 8, CGPA: 7.9, Status: "Final Year" }
);
printjson(db.Students.findOne({ RollNo: 107 }));

// ---------------------------------------------------------------
// TASK 12: Add new field Email to all documents
// ---------------------------------------------------------------
db.Students.updateMany({}, { $set: { Email: "not_provided@college.edu" } });
// Personalised email from the name (optional, uses an update pipeline):
db.Students.updateMany({}, [
  { $set: { Email: { $concat: [ { $toLower: { $replaceAll: { input: "$Name", find: " ", replacement: "." } } }, "@college.edu" ] } } }
]);
db.Students.find({}, { _id: 0, RollNo: 1, Name: 1, Email: 1 }).forEach(printjson);

// ---------------------------------------------------------------
// TASK 13: Remove a field from all documents ($unset)
// ---------------------------------------------------------------
db.Students.updateMany({}, { $unset: { Email: "" } });
db.Students.find().limit(2).forEach(printjson);   // Email no longer present

// ---------------------------------------------------------------
// TASK 14: deleteOne() by Roll Number
// ---------------------------------------------------------------
db.Students.deleteOne({ RollNo: 105 });
print("RollNo 105 exists after delete? " + (db.Students.findOne({ RollNo: 105 }) !== null));

// ---------------------------------------------------------------
// TASK 15: deleteMany() with a condition (CGPA below 7.5)
// ---------------------------------------------------------------
db.Students.deleteMany({ CGPA: { $lt: 7.5 } });
db.Students.find({}, { _id: 0, RollNo: 1, Name: 1, CGPA: 1 }).forEach(printjson);

// ---------------------------------------------------------------
// TASK 16: Count documents
// ---------------------------------------------------------------
print("Total students: " + db.Students.countDocuments({}));
print("Estimated count: " + db.Students.estimatedDocumentCount());

// ---------------------------------------------------------------
// TASK 17: Rename Students to StudentDetails and verify
// ---------------------------------------------------------------
db.Students.renameCollection("StudentDetails");
print("--- Collections after rename ---");
printjson(db.getCollectionNames());
print("Documents in StudentDetails: " + db.StudentDetails.countDocuments({}));

// ---------------------------------------------------------------
// TASK 18: Create Departments collection with sample data
// ---------------------------------------------------------------
db.createCollection("Departments");
db.Departments.insertMany([
  { DeptID: 1, DeptName: "Computer Science", HOD: "Dr. R. Kapoor",  Block: "A" },
  { DeptID: 2, DeptName: "Electronics",      HOD: "Dr. S. Nair",    Block: "B" },
  { DeptID: 3, DeptName: "Mechanical",       HOD: "Dr. A. Khan",    Block: "C" },
  { DeptID: 4, DeptName: "Civil",            HOD: "Dr. M. Pandey",  Block: "D" }
]);
db.Departments.find().forEach(printjson);

// ---------------------------------------------------------------
// TASK 19: Drop Departments collection and verify
// ---------------------------------------------------------------
print("Dropped Departments? " + db.Departments.drop());   // true on success
print("--- Collections after drop ---");
printjson(db.getCollectionNames());

// ---------------------------------------------------------------
// TASK 20: Drop StudentDB database and confirm
// ---------------------------------------------------------------
printjson(db.dropDatabase());
print("--- Databases after drop ---");
printjson(db.adminCommand({ listDatabases: 1 }).databases.map(d => d.name));
print("Collections left in StudentDB: " + JSON.stringify(db.getCollectionNames())); // []

// ---------------------------------------------------------------
// TASK 21: Recreate StudentDB and insert sample data
// ---------------------------------------------------------------
db = db.getSiblingDB("StudentDB");
db.Students.insertMany([
  { RollNo: 101, Name: "Aarav Sharma", Department: "Computer Science", Semester: 5, CGPA: 8.7 },
  { RollNo: 102, Name: "Priya Verma",  Department: "Computer Science", Semester: 5, CGPA: 9.1 },
  { RollNo: 103, Name: "Rohan Gupta",  Department: "Electronics",      Semester: 3, CGPA: 7.8 },
  { RollNo: 104, Name: "Sneha Singh",  Department: "Mechanical",       Semester: 7, CGPA: 8.2 }
]);
db.Faculty.insertOne({ FacultyID: "F01", Name: "Dr. R. Kapoor", Department: "Computer Science" });
db.Courses.insertOne({ CourseCode: "CS301", Title: "Database Systems", Credits: 4 });
print("--- Recreated DB collections ---");
printjson(db.getCollectionNames());
print("Students count: " + db.Students.countDocuments({}));

/*
=====================================================================
 TASK 22: CRUD using MongoDB Compass and comparison with Shell
=====================================================================
Connection string: mongodb://localhost:27017

Operation | MongoDB Compass (GUI)                            | MongoDB Shell equivalent
----------|--------------------------------------------------|-----------------------------------------
Create DB | Click "+" next to Databases, enter StudentDB and | db.getSiblingDB("StudentDB") +
          | first collection name                            | db.createCollection("Students")
Create    | ADD DATA > Insert Document, paste JSON           | db.Students.insertOne({...})
          | e.g. { "RollNo":108,"Name":"Neha","Department":  |
          | "Civil","Semester":1,"CGPA":8.0 }                |
          | ADD DATA > Import JSON/CSV file for many docs    | db.Students.insertMany([...])
Read      | Documents tab; Filter box: { "Department":       | db.Students.find({Department:"Civil"})
          | "Civil" }                                        |
Project   | Filter > Options > Project: { "Name":1,          | db.Students.find({}, {Name:1,Department:1})
          | "Department":1 }                                 |
Update    | Hover on document > pencil icon > edit field >   | db.Students.updateOne({RollNo:108},
          | Update                                           |   {$set:{CGPA:8.5}})
Delete    | Hover on document > trash icon > Delete          | db.Students.deleteOne({RollNo:108})
Count     | Shown at top of Documents tab (1 - N of N)       | db.Students.countDocuments({})
Rename    | Collection menu (...) > Rename collection        | db.Students.renameCollection("StudentDetails")
Drop      | Trash icon next to collection / database         | db.Students.drop() / db.dropDatabase()

Comparison: Both produce the same results because both talk to the same
server. Compass is visual, good for browsing, schema analysis and
quick edits; the Shell is scriptable, repeatable and better for bulk
operations and automation.

=====================================================================
 TASK 23: Using both tools to manage databases and collections
=====================================================================
Shell   : show dbs; use StudentDB; show collections;
          db.stats(); db.Students.stats();
Compass : Left sidebar lists databases and collections with sizes;
          Schema tab shows field types; Indexes tab manages indexes;
          Aggregations tab builds pipelines; mongosh pane is built in
          at the bottom of Compass.
Demonstration (run the same task in both):
          1. Create collection "Labs" (Shell: db.createCollection("Labs");
             Compass: "+" icon beside StudentDB > Create Collection)
          2. Insert one document in each tool.
          3. Verify in the other tool that the same data appears.
          4. Drop "Labs" in either tool.

=====================================================================
 TASK 24: MongoDB CRUD vs SQL
=====================================================================
Operation     | SQL                                   | MongoDB
--------------|---------------------------------------|-----------------------------------------
Create DB     | CREATE DATABASE StudentDB;            | use StudentDB (created on first insert)
Create table  | CREATE TABLE Students(...);           | db.createCollection("Students")
Insert one    | INSERT INTO Students VALUES(...);     | db.Students.insertOne({...})
Insert many   | INSERT INTO Students VALUES(..),(..); | db.Students.insertMany([{...},{...}])
Select all    | SELECT * FROM Students;               | db.Students.find()
Select where  | SELECT * FROM Students WHERE          | db.Students.find({Department:"Electronics"})
              |   Department='Electronics';           |
Projection    | SELECT Name, Department FROM Students;| db.Students.find({}, {Name:1,Department:1,_id:0})
Update        | UPDATE Students SET Department='X'    | db.Students.updateOne({RollNo:101},
              |   WHERE RollNo=101;                   |   {$set:{Department:"X"}})
Update many   | UPDATE Students SET Semester=4 WHERE  | db.Students.updateMany({Department:"E"},
              |   Department='E';                     |   {$set:{Semester:4}})
Replace row   | (UPDATE all columns / DELETE+INSERT)  | db.Students.replaceOne({RollNo:107},{...})
Add column    | ALTER TABLE Students ADD Email VARCHAR| db.Students.updateMany({}, {$set:{Email:""}})
Drop column   | ALTER TABLE Students DROP COLUMN Email| db.Students.updateMany({}, {$unset:{Email:""}})
Delete        | DELETE FROM Students WHERE RollNo=105;| db.Students.deleteOne({RollNo:105})
Delete many   | DELETE FROM Students WHERE CGPA<7.5;  | db.Students.deleteMany({CGPA:{$lt:7.5}})
Count         | SELECT COUNT(*) FROM Students;        | db.Students.countDocuments({})
Rename table  | ALTER TABLE Students RENAME TO X;     | db.Students.renameCollection("X")
Drop table    | DROP TABLE Departments;               | db.Departments.drop()
Drop DB       | DROP DATABASE StudentDB;              | db.dropDatabase()

Key differences:
 1. Structure   : SQL has fixed schema, tables, rows; MongoDB has flexible
                  schema, collections, JSON/BSON documents.
 2. Schema      : Adding a field in MongoDB needs no ALTER TABLE.
 3. Joins       : SQL uses JOIN; MongoDB prefers embedding, or $lookup.
 4. Query lang  : SQL is declarative text; MongoDB uses JSON-style
                  query objects and operators ($set, $lt, $gt ...).
 5. Transactions: SQL is ACID by default; MongoDB supports multi-document
                  ACID transactions but single-document ops are atomic.
 6. Scaling     : SQL scales mostly vertically; MongoDB scales
                  horizontally via sharding.

=====================================================================
 TASK 25: LABORATORY REPORT
=====================================================================
Title      : Assignment-01 - MongoDB CRUD Operations

1. OBJECTIVES
   - Create and manage a MongoDB database and collections.
   - Perform Create, Read, Update and Delete operations with
     MongoDB Shell and MongoDB Compass.
   - Compare MongoDB operations with SQL.

2. TOOLS USED
   MongoDB Server, MongoDB Shell (mongosh), MongoDB Compass.

3. COMMANDS EXECUTED
   All commands are in the numbered Task blocks 1-21 of this file.

4. OUTPUTS / SCREENSHOTS (to be attached by the student)
   Take a screenshot after each task:
   - Task 1-2  : output of show dbs / show collections
   - Task 3-4  : insertOne / insertMany acknowledgement
   - Task 5-8  : find() results, findOne(), filter and projection
   - Task 9-13 : update results (matchedCount, modifiedCount)
   - Task 14-15: deletedCount output
   - Task 16-17: countDocuments and collection list after rename
   - Task 18-20: Departments creation, drop (true), dropDatabase
   - Task 21   : recreated data
   - Task 22   : same operations in Compass UI

5. OBSERVATIONS
   - A database appears only after it holds a collection with data.
   - insertMany returns all inserted _id values; updates return
     matchedCount and modifiedCount; deletes return deletedCount.
   - $set adds or changes fields; $unset removes them; replaceOne
     swaps the entire document except _id.
   - renameCollection keeps all documents and indexes.
   - dropDatabase removes all its collections.
   - Compass and Shell results were identical for the same operations.

6. CONCLUSION
   CRUD operations were carried out successfully using both the Shell
   and Compass. MongoDB's flexible document model allowed fields to be
   added or removed without altering a schema, unlike SQL. The Shell
   suits scripting and automation, while Compass suits visual
   exploration, making them complementary tools.
=====================================================================
*/
