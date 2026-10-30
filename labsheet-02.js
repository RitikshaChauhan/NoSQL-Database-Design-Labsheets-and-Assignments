@@ Q1. RDBMS (MySQL) vs NoSQL Document Model (MongoDB) - Student Data
@sub A) MySQL (run in mysql client)
CREATE DATABASE IF NOT EXISTS college;
USE college;

CREATE TABLE Student (
    Student_ID INT PRIMARY KEY,
    Name       VARCHAR(50) NOT NULL,
    Course     VARCHAR(30),
    Semester   INT,
    Marks      INT
);

INSERT INTO Student VALUES
(101, 'Amit Sharma', 'BCA', 3, 78),
(102, 'Neha Verma',  'BCA', 3, 85),
(103, 'Rohit Singh', 'MCA', 1, 69),
(104, 'Priya Nair',  'BBA', 5, 91),
(105, 'Karan Mehta', 'MCA', 2, 74);

SELECT * FROM Student;

@sub B) MongoDB (run in mongosh)
use college
db.Students.drop()
db.Students.insertMany([
  { Student_ID: 101, Name: "Amit Sharma", Course: "BCA", Semester: 3, Marks: 78 },
  { Student_ID: 102, Name: "Neha Verma",  Course: "BCA", Semester: 3, Marks: 85 },
  { Student_ID: 103, Name: "Rohit Singh", Course: "MCA", Semester: 1, Marks: 69 },
  { Student_ID: 104, Name: "Priya Nair",  Course: "BBA", Semester: 5, Marks: 91 },
  { Student_ID: 105, Name: "Karan Mehta", Course: "MCA", Semester: 2, Marks: 74,
    Hobbies: ["Chess", "Cricket"] }          // extra field: no ALTER TABLE needed
])
db.Students.find().pretty()

@sub C) Comparison
# Feature      | MySQL (RDBMS)                       | MongoDB (NoSQL document)
# -------------+-------------------------------------+---------------------------------------
# Schema       | Fixed, defined before inserting     | Dynamic / schema-less (optional validation)
# Data storage | Rows in tables, normalized          | JSON/BSON documents in collections
# Flexibility  | Adding a column needs ALTER TABLE   | Each document can have different fields
# Relations    | Joins and foreign keys              | Embedding or references ($lookup)
# Transactions | Strong ACID, multi-table            | ACID per document; multi-doc since 4.0
# Scalability  | Mostly vertical (bigger server)     | Horizontal (sharding) built in
# Query        | SQL                                 | MQL / aggregation pipeline
# Best for     | Structured, relational, banking     | Changing, hierarchical, big-data apps


@@ Q2. MongoDB CollegeDB - Students CRUD
use CollegeDB
db.Students.drop()

db.Students.insertMany([
  { Student_ID: 1, Name: "Amit Sharma", Course: "BCA", Semester: 3, Marks: 78 },
  { Student_ID: 2, Name: "Neha Verma",  Course: "BCA", Semester: 3, Marks: 85 },
  { Student_ID: 3, Name: "Rohit Singh", Course: "MCA", Semester: 1, Marks: 69 },
  { Student_ID: 4, Name: "Priya Nair",  Course: "BBA", Semester: 5, Marks: 91 },
  { Student_ID: 5, Name: "Karan Mehta", Course: "MCA", Semester: 2, Marks: 74 }
])

// 1. Display all documents
db.Students.find().pretty()

// 2. Find students from a particular course
db.Students.find({ Course: "BCA" })

// 3. Update marks of a student
db.Students.updateOne({ Student_ID: 3 }, { $set: { Marks: 80 } })
db.Students.find({ Student_ID: 3 })

// 4. Delete one student
db.Students.deleteOne({ Student_ID: 5 })

// 5. Count the total number of students
db.Students.countDocuments()


@@ Q3. MongoDB Orders Collection (embedded customer + products)
use shopDB
db.Orders.drop()

db.Orders.insertMany([
  { order_id: 1, customer: { name: "Amit", city: "Meerut", phone: "9999900001" },
    products: [ { name: "Keyboard", price: 1500, qty: 1 }, { name: "Mouse", price: 700, qty: 2 } ] },
  { order_id: 2, customer: { name: "Neha", city: "Delhi", phone: "9999900002" },
    products: [ { name: "Monitor", price: 9000, qty: 1 } ] },
  { order_id: 3, customer: { name: "Amit", city: "Meerut", phone: "9999900001" },
    products: [ { name: "Pen Drive", price: 450, qty: 3 } ] },
  { order_id: 4, customer: { name: "Rohit", city: "Noida", phone: "9999900004" },
    products: [ { name: "Laptop Bag", price: 1200, qty: 1 }, { name: "Mouse", price: 700, qty: 1 } ] },
  { order_id: 5, customer: { name: "Priya", city: "Pune", phone: "9999900005" },
    products: [ { name: "Headphones", price: 2500, qty: 2 }, { name: "Cable", price: 200, qty: 4 } ] }
])

// 1. (inserted above - at least five orders)

// 2. Orders of a particular customer
db.Orders.find({ "customer.name": "Amit" })

// 3. Update the quantity of a product (Mouse in order 1)
db.Orders.updateOne(
  { order_id: 1, "products.name": "Mouse" },
  { $set: { "products.$.qty": 5 } }
)

// 4. Total order amount using aggregation
db.Orders.aggregate([
  { $unwind: "$products" },
  { $group: { _id: "$order_id",
              customer: { $first: "$customer.name" },
              totalAmount: { $sum: { $multiply: ["$products.price", "$products.qty"] } } } },
  { $sort: { _id: 1 } }
])

// 5. Orders above a specified amount (e.g. 5000)
db.Orders.aggregate([
  { $unwind: "$products" },
  { $group: { _id: "$order_id", totalAmount: { $sum: { $multiply: ["$products.price", "$products.qty"] } } } },
  { $match: { totalAmount: { $gt: 5000 } } }
])


@@ Q4. Redis Key-Value - Simple Student Information System
# redis-cli

# 1 & 2. Store student ID as key, name as value (5 students)
SET student:101 "Amit Sharma"
SET student:102 "Neha Verma"
SET student:103 "Rohit Singh"
SET student:104 "Priya Nair"
SET student:105 "Karan Mehta"

# 3. Retrieve a student using the key
GET student:102

# 4. Update a student's value
SET student:102 "Neha Gupta"
GET student:102

# 5. Delete a student
DEL student:105

# 6. Display all available keys
KEYS student:*
# (for large datasets prefer:  SCAN 0 MATCH student:* COUNT 100)


@@ Q5. Cassandra - Keyspace CollegeDB, Table Students
-- cqlsh
CREATE KEYSPACE CollegeDB
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

USE CollegeDB;

CREATE TABLE Students (
    Student_ID INT PRIMARY KEY,
    Name       TEXT,
    Course     TEXT,
    Semester   INT,
    Marks      INT
);

-- Secondary index needed to search by Course
CREATE INDEX ON Students (Course);

-- 1. Insert at least five records
INSERT INTO Students (Student_ID, Name, Course, Semester, Marks) VALUES (1, 'Amit Sharma', 'BCA', 3, 78);
INSERT INTO Students (Student_ID, Name, Course, Semester, Marks) VALUES (2, 'Neha Verma',  'BCA', 3, 85);
INSERT INTO Students (Student_ID, Name, Course, Semester, Marks) VALUES (3, 'Rohit Singh', 'MCA', 1, 69);
INSERT INTO Students (Student_ID, Name, Course, Semester, Marks) VALUES (4, 'Priya Nair',  'BBA', 5, 91);
INSERT INTO Students (Student_ID, Name, Course, Semester, Marks) VALUES (5, 'Karan Mehta', 'MCA', 2, 74);

-- 2. Display all records
SELECT * FROM Students;

-- 3. Retrieve students from a particular course
SELECT * FROM Students WHERE Course = 'MCA';

-- 4. Update the marks of a student
UPDATE Students SET Marks = 88 WHERE Student_ID = 3;

-- 5. Delete a student record
DELETE FROM Students WHERE Student_ID = 5;


@@ Q6. HBase - Table Students (column families: personal, academic)
# hbase shell
create 'Students', 'personal', 'academic'

# 1. Insert at least five student records
put 'Students', '1', 'personal:name',     'Amit Sharma'
put 'Students', '1', 'personal:city',     'Meerut'
put 'Students', '1', 'academic:course',   'BCA'
put 'Students', '1', 'academic:marks',    '78'

put 'Students', '2', 'personal:name',     'Neha Verma'
put 'Students', '2', 'personal:city',     'Delhi'
put 'Students', '2', 'academic:course',   'BCA'
put 'Students', '2', 'academic:marks',    '85'

put 'Students', '3', 'personal:name',     'Rohit Singh'
put 'Students', '3', 'personal:city',     'Noida'
put 'Students', '3', 'academic:course',   'MCA'
put 'Students', '3', 'academic:marks',    '69'

put 'Students', '4', 'personal:name',     'Priya Nair'
put 'Students', '4', 'personal:city',     'Pune'
put 'Students', '4', 'academic:course',   'BBA'
put 'Students', '4', 'academic:marks',    '91'

put 'Students', '5', 'personal:name',     'Karan Mehta'
put 'Students', '5', 'personal:city',     'Lucknow'
put 'Students', '5', 'academic:course',   'MCA'
put 'Students', '5', 'academic:marks',    '74'

# 2. Retrieve a particular student's details
get 'Students', '3'

# 3. Update student information (put on same row/column creates a new version)
put 'Students', '3', 'academic:marks', '80'
get 'Students', '3', 'academic:marks'

# 4. Display all records
scan 'Students'

# 5. Delete a student record
deleteall 'Students', '5'
scan 'Students'


@@ Q7. Neo4j - Student-Course Relationship Graph (Cypher)
// 1. Create at least five students and three courses
CREATE (s1:Student {id: 1, name: 'Amit Sharma'}),
       (s2:Student {id: 2, name: 'Neha Verma'}),
       (s3:Student {id: 3, name: 'Rohit Singh'}),
       (s4:Student {id: 4, name: 'Priya Nair'}),
       (s5:Student {id: 5, name: 'Karan Mehta'}),
       (c1:Course  {code: 'C1', title: 'Database Systems'}),
       (c2:Course  {code: 'C2', title: 'Web Technology'}),
       (c3:Course  {code: 'C3', title: 'Python Programming'});

// Create ENROLLED_IN relationships
MATCH (s:Student {id: 1}), (c:Course {code: 'C1'}) CREATE (s)-[:ENROLLED_IN]->(c);
MATCH (s:Student {id: 1}), (c:Course {code: 'C2'}) CREATE (s)-[:ENROLLED_IN]->(c);
MATCH (s:Student {id: 2}), (c:Course {code: 'C1'}) CREATE (s)-[:ENROLLED_IN]->(c);
MATCH (s:Student {id: 3}), (c:Course {code: 'C3'}) CREATE (s)-[:ENROLLED_IN]->(c);
MATCH (s:Student {id: 4}), (c:Course {code: 'C2'}) CREATE (s)-[:ENROLLED_IN]->(c);
MATCH (s:Student {id: 5}), (c:Course {code: 'C1'}) CREATE (s)-[:ENROLLED_IN]->(c);

// 2. Display all students
MATCH (s:Student) RETURN s;

// 3. Find students enrolled in a particular course
MATCH (s:Student)-[:ENROLLED_IN]->(c:Course {title: 'Database Systems'})
RETURN s.name;

// 4. Display all courses taken by a particular student
MATCH (s:Student {name: 'Amit Sharma'})-[:ENROLLED_IN]->(c:Course)
RETURN c.title;

// 5. Add a relationship
MATCH (s:Student {id: 3}), (c:Course {code: 'C1'})
CREATE (s)-[:ENROLLED_IN]->(c);

// 5. Remove a relationship
MATCH (s:Student {id: 3})-[r:ENROLLED_IN]->(c:Course {code: 'C1'})
DELETE r;

// View whole graph
MATCH (s:Student)-[r:ENROLLED_IN]->(c:Course) RETURN s, r, c;


@@ Q8. Same Student Dataset in MongoDB, Cassandra and Neo4j + Comparison
# Dataset: (1, Amit, BCA, 78) (2, Neha, BCA, 85) (3, Rohit, MCA, 69)
@sub A) MongoDB
use uniDB
db.students.insertMany([
  { Student_ID: 1, Name: "Amit", Course: "BCA", Marks: 78 },
  { Student_ID: 2, Name: "Neha", Course: "BCA", Marks: 85 },
  { Student_ID: 3, Name: "Rohit", Course: "MCA", Marks: 69 }
])
db.students.find({ Course: "BCA" })

@sub B) Cassandra
CREATE KEYSPACE uniDB WITH replication = {'class':'SimpleStrategy','replication_factor':1};
USE uniDB;
CREATE TABLE students (Student_ID INT PRIMARY KEY, Name TEXT, Course TEXT, Marks INT);
CREATE INDEX ON students (Course);
INSERT INTO students (Student_ID, Name, Course, Marks) VALUES (1, 'Amit', 'BCA', 78);
INSERT INTO students (Student_ID, Name, Course, Marks) VALUES (2, 'Neha', 'BCA', 85);
INSERT INTO students (Student_ID, Name, Course, Marks) VALUES (3, 'Rohit', 'MCA', 69);
SELECT * FROM students WHERE Course = 'BCA';

@sub C) Neo4j
CREATE (:Student {id:1, name:'Amit',  marks:78})-[:ENROLLED_IN]->(bca:Course {name:'BCA'});
MATCH (bca:Course {name:'BCA'}) CREATE (:Student {id:2, name:'Neha',  marks:85})-[:ENROLLED_IN]->(bca);
CREATE (:Student {id:3, name:'Rohit', marks:69})-[:ENROLLED_IN]->(:Course {name:'MCA'});
MATCH (s:Student)-[:ENROLLED_IN]->(:Course {name:'BCA'}) RETURN s.name, s.marks;

@sub D) Comparison
# Aspect       | MongoDB                    | Cassandra                    | Neo4j
# -------------+----------------------------+------------------------------+--------------------------
# Data model   | Document (JSON/BSON)       | Wide-column (rows/partitions)| Property graph (nodes+edges)
# Storage      | Collections of documents   | SSTables, partitioned by key | Native graph store, linked records
# Query method | MQL / aggregation          | CQL (SQL-like, key based)    | Cypher (pattern matching)
# Scalability  | Sharding + replica sets    | Linear horizontal, peer-to-peer | Vertical + read replicas / fabric
# Suitable apps| CMS, catalogs, user profiles| IoT, logs, time-series, high writes| Social networks, recommendations, fraud


@@ Q9. Deploy MongoDB on a Single Server / Local Machine
@sub 1. Install / configure MongoDB (Ubuntu example; Windows: use the MSI installer)
sudo apt-get install -y gnupg curl
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

@sub 2. Start the database server
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
# or manually:
mkdir -p ~/data/db
mongod --dbpath ~/data/db --port 27017

@sub 3. Create database and collection (mongosh)
mongosh
use singleServerDB
db.createCollection("employees")

@sub 4. Insert sample records
db.employees.insertMany([
  { emp_id: 1, name: "Amit",  dept: "IT",  salary: 40000 },
  { emp_id: 2, name: "Neha",  dept: "HR",  salary: 35000 },
  { emp_id: 3, name: "Rohit", dept: "IT",  salary: 45000 },
  { emp_id: 4, name: "Priya", dept: "Fin", salary: 50000 }
])

@sub 5. CRUD operations
db.employees.insertOne({ emp_id: 5, name: "Karan", dept: "IT", salary: 38000 })   // Create
db.employees.find({ dept: "IT" })                                                 // Read
db.employees.updateOne({ emp_id: 2 }, { $set: { salary: 37000 } })                // Update
db.employees.deleteOne({ emp_id: 4 })                                             // Delete

@sub 6. Verify everything works on the single server
db.hello()                    // isWritablePrimary: true, no "hosts" list -> standalone
db.serverStatus().host
db.employees.countDocuments()
db.stats()
# Only one mongod process serves all reads and writes (no replication, no sharding).


@@ Q10. Sharding in MongoDB (20+ records, multiple logical shards)
@sub Step 1: Start config server, two shards and a mongos router (local machine)
mkdir -p /data/cfg /data/shard1 /data/shard2

mongod --configsvr --replSet cfgRS --port 27019 --dbpath /data/cfg    --fork --logpath /data/cfg.log
mongod --shardsvr  --replSet sh1RS --port 27018 --dbpath /data/shard1 --fork --logpath /data/s1.log
mongod --shardsvr  --replSet sh2RS --port 27020 --dbpath /data/shard2 --fork --logpath /data/s2.log

mongosh --port 27019 --eval 'rs.initiate({_id:"cfgRS",configsvr:true,members:[{_id:0,host:"localhost:27019"}]})'
mongosh --port 27018 --eval 'rs.initiate({_id:"sh1RS",members:[{_id:0,host:"localhost:27018"}]})'
mongosh --port 27020 --eval 'rs.initiate({_id:"sh2RS",members:[{_id:0,host:"localhost:27020"}]})'

mongos --configdb cfgRS/localhost:27019 --port 27017 --fork --logpath /data/mongos.log

@sub Step 2 & 3: Add shards, enable sharding, choose shard key (mongosh --port 27017)
sh.addShard("sh1RS/localhost:27018")
sh.addShard("sh2RS/localhost:27020")

sh.enableSharding("collegeShardDB")
use collegeShardDB
db.students.createIndex({ Student_ID: "hashed" })
// Shard key = hashed Student_ID : high cardinality, evenly distributed, no hot spot
sh.shardCollection("collegeShardDB.students", { Student_ID: "hashed" })

@sub Step 4: Sample dataset with 25 records -> distributed across shards
let courses = ["BCA", "MCA", "BBA", "BSc"];
let docs = [];
for (let i = 1; i <= 25; i++) {
  docs.push({ Student_ID: i, Name: "Student" + i, Course: courses[i % 4], Marks: 50 + (i * 7) % 50 });
}
db.students.insertMany(docs)

@sub Step 5: Verify how the data is distributed
db.students.getShardDistribution()
sh.status()
db.students.countDocuments()
# Run on each shard directly to see its own share:
#   mongosh --port 27018 --eval 'db.getSiblingDB("collegeShardDB").students.countDocuments()'
#   mongosh --port 27020 --eval 'db.getSiblingDB("collegeShardDB").students.countDocuments()'

@sub Step 6: Benefit of sharding
# - Horizontal scalability: data and load are split across many machines.
# - Higher throughput: reads/writes run in parallel on different shards.
# - Storage capacity grows by adding shards, not by buying a bigger server.
# - Targeted queries on the shard key go to only one shard.


@@ Q11. Master-Slave (Primary-Secondary) Replication in MongoDB
@sub Step 1 & 2: Start three mongod members of replica set rs0
mkdir -p /data/r0 /data/r1 /data/r2
mongod --replSet rs0 --port 27017 --dbpath /data/r0 --bind_ip localhost --fork --logpath /data/r0.log
mongod --replSet rs0 --port 27018 --dbpath /data/r1 --bind_ip localhost --fork --logpath /data/r1.log
mongod --replSet rs0 --port 27019 --dbpath /data/r2 --bind_ip localhost --fork --logpath /data/r2.log

@sub Initiate the replica set (connect to 27017)
mongosh --port 27017
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017", priority: 2 },   // primary
    { _id: 1, host: "localhost:27018", priority: 1 },   // secondary
    { _id: 2, host: "localhost:27019", priority: 1 }    // secondary
  ]
})
rs.status()

@sub Step 3: Insert data into the primary
use replDB
db.students.insertMany([
  { Student_ID: 1, Name: "Amit",  Marks: 78 },
  { Student_ID: 2, Name: "Neha",  Marks: 85 },
  { Student_ID: 3, Name: "Rohit", Marks: 69 }
])

@sub Step 4: Verify replication on the secondary
mongosh --port 27018
db.getMongo().setReadPref("secondary")
use replDB
db.students.find()            // same 3 documents appear -> data replicated
rs.status().members.forEach(m => print(m.name, m.stateStr))

@sub Step 5: What happens when the primary becomes unavailable?
# Simulate failure:
mongosh --port 27017 --eval 'db.getSiblingDB("admin").shutdownServer()'
# Then on port 27018:   rs.status()
# - Secondaries stop receiving heartbeats from the primary (about 10 seconds).
# - An automatic ELECTION is held; a secondary with the latest oplog gets a majority vote.
# - It becomes the NEW PRIMARY and accepts writes; the application reconnects automatically.
# - When the old primary comes back, it rejoins as a SECONDARY and syncs missed writes.
# - With only 1 of 3 members down, majority (2 of 3) is still available, so no data loss.


@@ Q12. Peer-to-Peer Replication using Cassandra
@sub Step 1: Configure multiple Cassandra nodes (Docker, 3 nodes)
docker network create cass-net
docker run -d --name cass1 --network cass-net -e CASSANDRA_CLUSTER_NAME=CollegeCluster -e CASSANDRA_DC=dc1 cassandra:4.1
docker run -d --name cass2 --network cass-net -e CASSANDRA_CLUSTER_NAME=CollegeCluster -e CASSANDRA_DC=dc1 -e CASSANDRA_SEEDS=cass1 cassandra:4.1
docker run -d --name cass3 --network cass-net -e CASSANDRA_CLUSTER_NAME=CollegeCluster -e CASSANDRA_DC=dc1 -e CASSANDRA_SEEDS=cass1 cassandra:4.1

# Wait for all nodes, then check status (all should show UN = Up/Normal)
docker exec cass1 nodetool status

@sub Step 2: Keyspace with an appropriate replication factor
docker exec -it cass1 cqlsh
CREATE KEYSPACE p2pDB
WITH replication = {'class': 'NetworkTopologyStrategy', 'dc1': 3};
-- RF = 3 : every row is stored on all 3 peer nodes

USE p2pDB;
CREATE TABLE students (Student_ID INT PRIMARY KEY, Name TEXT, Course TEXT, Marks INT);

@sub Step 3: Insert sample data (any node can accept the write)
CONSISTENCY QUORUM;
INSERT INTO students (Student_ID, Name, Course, Marks) VALUES (1, 'Amit',  'BCA', 78);
INSERT INTO students (Student_ID, Name, Course, Marks) VALUES (2, 'Neha',  'BCA', 85);
INSERT INTO students (Student_ID, Name, Course, Marks) VALUES (3, 'Rohit', 'MCA', 69);

@sub Step 4: Verify data availability across nodes
docker exec -it cass2 cqlsh -e "SELECT * FROM p2pDB.students;"
docker exec -it cass3 cqlsh -e "SELECT * FROM p2pDB.students;"
docker exec cass1 nodetool getendpoints p2pDB students 1      # shows the 3 replica nodes

# Stop one node and read again - data is still available:
docker stop cass3
docker exec -it cass1 cqlsh -e "CONSISTENCY QUORUM; SELECT * FROM p2pDB.students;"

@sub Step 5: Peer-to-peer vs master-slave
# Master-slave : one primary accepts writes, secondaries copy it. Primary failure -> election/downtime,
#                single write point, writes limited by one machine.
# Peer-to-peer : all nodes are equal, no master. Any node accepts reads AND writes; nodes
#                exchange data using gossip. No single point of failure, writes scale with
#                node count, tunable consistency (ONE / QUORUM / ALL).


@@ Q13. Sharding + Replication Combined (MongoDB Sharded Cluster, each shard a replica set)
@sub Step 1 & 2: Create two shards, each as a 3-member replica set, plus config servers and mongos
mkdir -p /data/{cfg,s1a,s1b,s1c,s2a,s2b,s2c}

# Config server replica set
mongod --configsvr --replSet cfgRS --port 26001 --dbpath /data/cfg --fork --logpath /data/cfg.log
mongosh --port 26001 --eval 'rs.initiate({_id:"cfgRS",configsvr:true,members:[{_id:0,host:"localhost:26001"}]})'

# Shard 1 = replica set shard1RS (3 members)
for p in 27101 27102 27103; do
  mongod --shardsvr --replSet shard1RS --port $p --dbpath /data/s1$(echo $p | tail -c 2) --fork --logpath /data/s1_$p.log
done
mongosh --port 27101 --eval 'rs.initiate({_id:"shard1RS",members:[
  {_id:0,host:"localhost:27101"},{_id:1,host:"localhost:27102"},{_id:2,host:"localhost:27103"}]})'

# Shard 2 = replica set shard2RS (3 members)
for p in 27201 27202 27203; do
  mongod --shardsvr --replSet shard2RS --port $p --dbpath /data/s2$(echo $p | tail -c 2) --fork --logpath /data/s2_$p.log
done
mongosh --port 27201 --eval 'rs.initiate({_id:"shard2RS",members:[
  {_id:0,host:"localhost:27201"},{_id:1,host:"localhost:27202"},{_id:2,host:"localhost:27203"}]})'

# Router
mongos --configdb cfgRS/localhost:26001 --port 27017 --fork --logpath /data/mongos.log

@sub Add shards and shard the collection (mongosh --port 27017)
sh.addShard("shard1RS/localhost:27101,localhost:27102,localhost:27103")
sh.addShard("shard2RS/localhost:27201,localhost:27202,localhost:27203")
sh.enableSharding("hybridDB")
sh.shardCollection("hybridDB.students", { Student_ID: "hashed" })

@sub Step 3: Insert sample data
use hybridDB
let docs = [];
for (let i = 1; i <= 30; i++) docs.push({ Student_ID: i, Name: "Student" + i, Marks: 40 + (i * 3) % 60 });
db.students.insertMany(docs)

@sub Step 4: Verify data distribution
db.students.getShardDistribution()
sh.status()

@sub Step 5: Verify replica availability
mongosh --port 27101 --eval 'rs.status().members.map(m => m.name + " " + m.stateStr)'
mongosh --port 27201 --eval 'rs.status().members.map(m => m.name + " " + m.stateStr)'
# Kill the primary of shard1 and re-run a count through mongos:
#   db.students.countDocuments()   -> still returns 30 (a secondary was elected primary)

@sub Step 6: How it provides scalability and fault tolerance
# - Sharding splits the data across shard1 and shard2 -> horizontal SCALABILITY (storage + throughput).
# - Each shard is a replica set holding 3 copies of its data -> FAULT TOLERANCE; if a
#   shard's primary fails, a secondary is elected automatically and no data is lost.
# - Add more shards for scale, add more replicas for availability, independently.


@@ Q14. MapReduce on a Student Dataset (MongoDB)
use mrDB
db.students.drop()
db.students.insertMany([
  { Student_ID: 1, Name: "Amit",  Course: "BCA", Marks: 78 },
  { Student_ID: 2, Name: "Neha",  Course: "BCA", Marks: 85 },
  { Student_ID: 3, Name: "Rohit", Course: "MCA", Marks: 69 },
  { Student_ID: 4, Name: "Priya", Course: "BBA", Marks: 91 },
  { Student_ID: 5, Name: "Karan", Course: "MCA", Marks: 74 },
  { Student_ID: 6, Name: "Isha",  Course: "BCA", Marks: 66 }
])

@sub 1. Number of students in each course
var mapCount = function () { emit(this.Course, 1); };
var reduceCount = function (key, values) { return Array.sum(values); };

db.students.mapReduce(mapCount, reduceCount, { out: "course_count" })
db.course_count.find()

@sub 2. Average marks for each course (reduce returns {count,total}, finalize computes average)
var mapAvg = function () { emit(this.Course, { count: 1, total: this.Marks }); };
var reduceAvg = function (key, values) {
  var r = { count: 0, total: 0 };
  values.forEach(function (v) { r.count += v.count; r.total += v.total; });
  return r;
};
var finalizeAvg = function (key, v) { v.avg = v.total / v.count; return v; };

db.students.mapReduce(mapAvg, reduceAvg, { out: "course_avg", finalize: finalizeAvg })

@sub 3. Display the result
db.course_count.find()
db.course_avg.find()
# Expected: BCA -> count 3, avg 76.33 | MCA -> count 2, avg 71.5 | BBA -> count 1, avg 91

@sub Note: mapReduce is deprecated since MongoDB 5.0. Equivalent aggregation pipeline:
db.students.aggregate([
  { $group: { _id: "$Course", count: { $sum: 1 }, avgMarks: { $avg: "$Marks" } } }
])


@@ Q15. Database Distribution Models
@sub 1. SINGLE SERVER
#   +--------+       +----------------------+
#   | Client | <---> |  DB Server (1 node)  |
#   +--------+       +----------------------+
# How data is distributed : All data lives on one machine.
# How failure is handled  : No built-in handling; restore from backup (downtime).
# Advantage               : Simple to set up and manage, no consistency problems.
# Limitation              : Single point of failure; limited by one machine's capacity.
# Suitable application    : Small apps, development/testing, college lab projects.

@sub 2. SHARDING
#                    +---------+
#   Client -------> | mongos  |  (router)
#                    +----+----+
#              +-----------+-----------+
#         +----v----+ +----v----+ +----v----+
#         | Shard 1 | | Shard 2 | | Shard 3 |
#         | (part A)| | (part B)| | (part C)|
#         +---------+ +---------+ +---------+
# How data is distributed : Data is split by a shard key; each shard holds a different subset.
# How failure is handled  : A failed shard makes its portion unavailable (needs replicas).
# Advantage               : Horizontal scalability for large data and heavy load.
# Limitation              : Complex setup; a bad shard key causes uneven load; no fault tolerance alone.
# Suitable application    : Big-data apps such as social media feeds, IoT, analytics.

@sub 3. MASTER-SLAVE (PRIMARY-SECONDARY) REPLICATION
#   +--------+  writes   +-----------+
#   | Client | --------> |  PRIMARY  |
#   +--------+           +-----+-----+
#        ^   reads(opt)        | replicates (oplog)
#        |            +-------+--------+
#        |       +----v-----+    +-----v----+
#        +-------| SECONDARY|    | SECONDARY|
#                +----------+    +----------+
# How data is distributed : Same full copy of data on every node; only primary takes writes.
# How failure is handled  : Secondaries elect a new primary automatically (failover).
# Advantage               : High availability and read scaling; backup copies exist.
# Limitation              : Writes limited to one primary; replication lag can give stale reads.
# Suitable application    : Banking/e-commerce back ends needing availability and consistency.

@sub 4. PEER-TO-PEER REPLICATION
#            +--------+
#       +--->| Node A |<---+
#       |    +---+----+    |
#       |        ^         |
#   +---+----+   |    +----+---+
#   | Node D |<--+--->| Node B |      (every node = equal, gossip between all)
#   +---+----+        +----+---+
#       |    +--------+    |
#       +--->| Node C |<---+
#            +--------+
# How data is distributed : Data is partitioned by hashing and replicated to N peers (replication factor).
# How failure is handled  : No master; any other replica serves requests; hinted handoff and repair later.
# Advantage               : No single point of failure; reads and writes on any node; linear scalability.
# Limitation              : Eventual consistency; conflicts must be resolved (last write wins).
# Suitable application    : Messaging, IoT/time-series data, always-on global services (Cassandra).

@sub 5. SHARDING + REPLICATION
#                     +---------+
#   Client ---------> |  mongos |
#                     +----+----+
#              +-----------+-----------+
#      +-------v------+         +------v-------+
#      |  SHARD 1     |         |  SHARD 2     |
#      | P  S   S     |         | P  S   S     |   P = primary, S = secondary
#      +--------------+         +--------------+
# How data is distributed : Split across shards by shard key; each shard's part is copied to its replica set.
# How failure is handled  : If a shard's primary fails, a secondary of that shard is elected; other shards unaffected.
# Advantage               : Both scalability and high availability together.
# Limitation              : Most complex and costly (many servers to run and monitor).
# Suitable application    : Large production systems - e-commerce, banking, telecom, streaming platforms.
