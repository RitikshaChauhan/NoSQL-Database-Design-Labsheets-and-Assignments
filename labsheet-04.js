@@ Q1. HBase - Install, Create Table Student (personal, academic)
@sub Install and configure Apache HBase (standalone mode, Linux)
# Java 8/11 must be installed (java -version)
wget https://downloads.apache.org/hbase/2.5.8/hbase-2.5.8-bin.tar.gz
tar -xzf hbase-2.5.8-bin.tar.gz
cd hbase-2.5.8
# conf/hbase-env.sh  ->  export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
# conf/hbase-site.xml ->  set hbase.rootdir = file:///home/user/hbase-data
bin/start-hbase.sh
jps                      # should list HMaster
bin/hbase shell

@sub Create table, insert at least five records, display
create 'Student', 'personal', 'academic'
list
describe 'Student'

put 'Student', '1', 'personal:name',   'Amit Sharma'
put 'Student', '1', 'personal:city',   'Meerut'
put 'Student', '1', 'academic:course', 'BCA'
put 'Student', '1', 'academic:marks',  '78'

put 'Student', '2', 'personal:name',   'Neha Verma'
put 'Student', '2', 'personal:city',   'Delhi'
put 'Student', '2', 'academic:course', 'BCA'
put 'Student', '2', 'academic:marks',  '85'

put 'Student', '3', 'personal:name',   'Rohit Singh'
put 'Student', '3', 'personal:city',   'Noida'
put 'Student', '3', 'academic:course', 'MCA'
put 'Student', '3', 'academic:marks',  '69'

put 'Student', '4', 'personal:name',   'Priya Nair'
put 'Student', '4', 'personal:city',   'Pune'
put 'Student', '4', 'academic:course', 'BBA'
put 'Student', '4', 'academic:marks',  '91'

put 'Student', '5', 'personal:name',   'Karan Mehta'
put 'Student', '5', 'personal:city',   'Lucknow'
put 'Student', '5', 'academic:course', 'MCA'
put 'Student', '5', 'academic:marks',  '74'

scan 'Student'
count 'Student'


@@ Q2. HBase - CRUD on Employee Table
create 'Employee', 'info', 'salary'

# CREATE / PUT (insert)
put 'Employee', 'E101', 'info:name',   'Amit'
put 'Employee', 'E101', 'info:dept',   'IT'
put 'Employee', 'E101', 'salary:basic', '40000'
put 'Employee', 'E102', 'info:name',   'Neha'
put 'Employee', 'E102', 'info:dept',   'HR'
put 'Employee', 'E102', 'salary:basic', '35000'
put 'Employee', 'E103', 'info:name',   'Rohit'
put 'Employee', 'E103', 'info:dept',   'IT'
put 'Employee', 'E103', 'salary:basic', '45000'

# GET (read one row / one column)
get 'Employee', 'E101'
get 'Employee', 'E101', 'info:name'
get 'Employee', 'E101', {COLUMN => 'salary:basic'}

# SCAN (read many rows)
scan 'Employee'
scan 'Employee', {COLUMNS => ['info:name', 'salary:basic']}
scan 'Employee', {STARTROW => 'E101', STOPROW => 'E103'}
scan 'Employee', {LIMIT => 2}

# UPDATE (put on the same cell creates a newer version)
put 'Employee', 'E102', 'salary:basic', '38000'
get 'Employee', 'E102', {COLUMN => 'salary:basic', VERSIONS => 3}

# DELETE
delete 'Employee', 'E101', 'info:dept'        # one cell
deleteall 'Employee', 'E103'                  # entire row
scan 'Employee'

# Drop table (disable first)
# disable 'Employee'
# drop 'Employee'


@@ Q3. HBase - Event Logging System
# Row key = userId_timestamp_eventId  -> events of a user are stored together, sorted by time
# Families: user (user info), event (event details), status (state of the event)
create 'EventLog', 'user', 'event', 'status'

put 'EventLog', 'u101_20261029090000_E1001', 'event:event_id',   'E1001'
put 'EventLog', 'u101_20261029090000_E1001', 'event:timestamp',  '2026-10-29 09:00:00'
put 'EventLog', 'u101_20261029090000_E1001', 'user:user_id',     'u101'
put 'EventLog', 'u101_20261029090000_E1001', 'user:name',        'Amit'
put 'EventLog', 'u101_20261029090000_E1001', 'event:type',       'login'
put 'EventLog', 'u101_20261029090000_E1001', 'status:state',     'success'

put 'EventLog', 'u101_20261029091500_E1002', 'event:event_id',   'E1002'
put 'EventLog', 'u101_20261029091500_E1002', 'event:timestamp',  '2026-10-29 09:15:00'
put 'EventLog', 'u101_20261029091500_E1002', 'user:user_id',     'u101'
put 'EventLog', 'u101_20261029091500_E1002', 'user:name',        'Amit'
put 'EventLog', 'u101_20261029091500_E1002', 'event:type',       'file-upload'
put 'EventLog', 'u101_20261029091500_E1002', 'status:state',     'success'

put 'EventLog', 'u102_20261029100000_E1003', 'event:event_id',   'E1003'
put 'EventLog', 'u102_20261029100000_E1003', 'event:timestamp',  '2026-10-29 10:00:00'
put 'EventLog', 'u102_20261029100000_E1003', 'user:user_id',     'u102'
put 'EventLog', 'u102_20261029100000_E1003', 'user:name',        'Neha'
put 'EventLog', 'u102_20261029100000_E1003', 'event:type',       'failed-login'
put 'EventLog', 'u102_20261029100000_E1003', 'status:state',     'failed'

put 'EventLog', 'u102_20261029100200_E1004', 'event:event_id',   'E1004'
put 'EventLog', 'u102_20261029100200_E1004', 'event:timestamp',  '2026-10-29 10:02:00'
put 'EventLog', 'u102_20261029100200_E1004', 'user:user_id',     'u102'
put 'EventLog', 'u102_20261029100200_E1004', 'user:name',        'Neha'
put 'EventLog', 'u102_20261029100200_E1004', 'event:type',       'login'
put 'EventLog', 'u102_20261029100200_E1004', 'status:state',     'success'

# Retrieve one event by full row key
get 'EventLog', 'u101_20261029090000_E1001'

# Retrieve all events of a user (row-key prefix scan)
scan 'EventLog', {STARTROW => 'u101_', STOPROW => 'u101`'}
scan 'EventLog', {ROWPREFIXFILTER => 'u102_'}

# Retrieve events of a user within a time period (range on row key)
scan 'EventLog', {STARTROW => 'u101_20261029090000', STOPROW => 'u101_20261029092000'}

# Only specific columns
scan 'EventLog', {COLUMNS => ['event:type', 'status:state']}


@@ Q4. HBase - Content Management System (CMS)
create 'CMS', 'content', 'author', 'metadata'

# INSERT
put 'CMS', 'article001', 'content:title', 'Introduction to NoSQL'
put 'CMS', 'article001', 'content:body',  'NoSQL databases store data in flexible formats...'
put 'CMS', 'article001', 'author:name',   'Ritu Sharma'
put 'CMS', 'article001', 'author:email',  'ritu@site.com'
put 'CMS', 'article001', 'metadata:category', 'Database'
put 'CMS', 'article001', 'metadata:status',   'draft'
put 'CMS', 'article001', 'metadata:created',  '2026-10-20'

put 'CMS', 'article002', 'content:title', 'HBase Basics'
put 'CMS', 'article002', 'content:body',  'HBase is a column-oriented database...'
put 'CMS', 'article002', 'author:name',   'Sumit Verma'
put 'CMS', 'article002', 'metadata:category', 'BigData'
put 'CMS', 'article002', 'metadata:status',   'published'

put 'CMS', 'article003', 'content:title', 'Cassandra Overview'
put 'CMS', 'article003', 'author:name',   'Pooja Singh'
put 'CMS', 'article003', 'metadata:category', 'Database'
put 'CMS', 'article003', 'metadata:status',   'published'

# RETRIEVE
get  'CMS', 'article001'
scan 'CMS'
scan 'CMS', {COLUMNS => ['content:title', 'metadata:status']}
scan 'CMS', {FILTER => "SingleColumnValueFilter('metadata','status',=,'binary:published')"}

# UPDATE
put 'CMS', 'article001', 'metadata:status', 'published'
put 'CMS', 'article001', 'content:title',   'Introduction to NoSQL Databases'
get 'CMS', 'article001'

# DELETE
delete 'CMS', 'article002', 'content:body'      # delete one column
deleteall 'CMS', 'article003'                    # delete whole record
scan 'CMS'


@@ Q5. HBase - Blogging Platform
# Families: blog (details), author (author info), comments (one qualifier per comment)
create 'Blog', 'blog', 'author', 'comments'

put 'Blog', 'blog001', 'blog:title',    'Getting Started with HBase'
put 'Blog', 'blog001', 'blog:category', 'Database'
put 'Blog', 'blog001', 'blog:tags',     'hbase,nosql,beginner'
put 'Blog', 'blog001', 'blog:date',     '2026-10-01'
put 'Blog', 'blog001', 'author:name',   'Asha Gupta'
put 'Blog', 'blog001', 'author:email',  'asha@blog.com'
put 'Blog', 'blog001', 'comments:c1',   'raj: Very useful!'
put 'Blog', 'blog001', 'comments:c2',   'meena: Thanks for sharing'

put 'Blog', 'blog002', 'blog:title',    'Cassandra vs MongoDB'
put 'Blog', 'blog002', 'blog:category', 'Comparison'
put 'Blog', 'blog002', 'blog:tags',     'cassandra,mongodb'
put 'Blog', 'blog002', 'blog:date',     '2026-10-12'
put 'Blog', 'blog002', 'author:name',   'Vikas Rao'
put 'Blog', 'blog002', 'author:email',  'vikas@blog.com'
put 'Blog', 'blog002', 'comments:c1',   'anil: Great comparison'

put 'Blog', 'blog003', 'blog:title',    'Row Key Design Tips'
put 'Blog', 'blog003', 'blog:category', 'Design'
put 'Blog', 'blog003', 'blog:tags',     'hbase,rowkey'
put 'Blog', 'blog003', 'blog:date',     '2026-10-25'
put 'Blog', 'blog003', 'author:name',   'Asha Gupta'
put 'Blog', 'blog003', 'author:email',  'asha@blog.com'

# Retrieve a particular blog using its row key
get 'Blog', 'blog001'
get 'Blog', 'blog002', {COLUMNS => ['blog:title', 'author:name']}
get 'Blog', 'blog001', {COLUMN => 'comments'}        # all comments of the blog

scan 'Blog'


@@ Q6. HBase Column-Family Data Model (multiple families, different qualifiers)
create 'Profile', 'contact', 'work', 'hobby'

# Different rows use different qualifiers inside the same family (sparse, no fixed schema)
put 'Profile', 'p1', 'contact:email',    'amit@mail.com'
put 'Profile', 'p1', 'contact:phone',    '9999900001'
put 'Profile', 'p1', 'work:company',     'TCS'
put 'Profile', 'p1', 'work:designation', 'Developer'
put 'Profile', 'p1', 'hobby:sport',      'Cricket'

put 'Profile', 'p2', 'contact:email',    'neha@mail.com'
put 'Profile', 'p2', 'contact:twitter',  '@neha'              # qualifier not present in p1
put 'Profile', 'p2', 'work:company',     'Infosys'
put 'Profile', 'p2', 'hobby:music',      'Guitar'
put 'Profile', 'p2', 'hobby:travel',     'Hills'

put 'Profile', 'p3', 'contact:phone',    '9999900003'

scan 'Profile'
get  'Profile', 'p1', {COLUMN => 'work'}                        # a whole column family
scan 'Profile', {COLUMNS => ['contact:email', 'hobby']}
get  'Profile', 'p1', {COLUMN => 'work:company', TIMESTAMP => nil}

@sub How HBase stores columns within column families
# 1. Each column family is stored in a SEPARATE Store (separate HFiles on HDFS), so reading
#    only 'contact' never touches the 'work' or 'hobby' files.
# 2. A cell is stored as a key-value:
#        (RowKey, ColumnFamily:Qualifier, Timestamp) -> Value
# 3. Qualifiers are NOT predefined; they are created at put time, so every row can have a
#    different set of qualifiers (sparse storage - empty cells take no space).
# 4. Within a family, cells are sorted by RowKey, then Qualifier, then Timestamp (newest first).
# 5. Each cell keeps multiple versions (default VERSIONS = 1; configurable per family).
describe 'Profile'


@@ Q7. HBase - WebsiteCounter (page-view counters)
create 'WebsiteCounter', 'visits'

# incr <table>, <row>, <column>, <amount>
incr 'WebsiteCounter', 'home',     'visits:count', 1
incr 'WebsiteCounter', 'home',     'visits:count', 1
incr 'WebsiteCounter', 'home',     'visits:count', 5
incr 'WebsiteCounter', 'products', 'visits:count', 1
incr 'WebsiteCounter', 'products', 'visits:count', 3
incr 'WebsiteCounter', 'contact',  'visits:count', 1
incr 'WebsiteCounter', 'about',    'visits:count', 2

# Display updated counter values (use get_counter - counters are stored as 8-byte longs)
get_counter 'WebsiteCounter', 'home',     'visits:count'      # 7
get_counter 'WebsiteCounter', 'products', 'visits:count'      # 4
get_counter 'WebsiteCounter', 'contact',  'visits:count'      # 1
get_counter 'WebsiteCounter', 'about',    'visits:count'      # 2

# Increment again and verify
incr 'WebsiteCounter', 'home', 'visits:count', 10
get_counter 'WebsiteCounter', 'home', 'visits:count'          # 17

scan 'WebsiteCounter'      # values look like binary (\x00\x00...) because they are long values


@@ Q8. HBase - Expiring Session Data using TTL
# TTL (seconds) is set on the column family 'session'
create 'UserSession', {NAME => 'session', TTL => 60}
describe 'UserSession'

put 'UserSession', 'sess_1001', 'session:user',  'amit'
put 'UserSession', 'sess_1001', 'session:token', 'a1b2c3'
put 'UserSession', 'sess_1002', 'session:user',  'neha'
put 'UserSession', 'sess_1002', 'session:token', 'x9y8z7'
put 'UserSession', 'sess_1003', 'session:user',  'rohit'
put 'UserSession', 'sess_1003', 'session:token', 'q5w4e3'

# Immediately after insert - rows are visible
scan 'UserSession'
get  'UserSession', 'sess_1001'

# Wait for more than 60 seconds (in another terminal:  sleep 65), then check again
scan 'UserSession'
get  'UserSession', 'sess_1001'          # returns empty -> session expired

# Expired cells are hidden at read time and physically removed during compaction
flush 'UserSession'
major_compact 'UserSession'

# Change TTL later (example: 1 hour)
alter 'UserSession', {NAME => 'session', TTL => 3600}


@@ Q9. HBase - Large-Scale Table and Row-Key Design for Horizontal Scaling
@sub Problem
# Sequential keys (timestamps, auto-increment ids) always write to the LAST region -> HOTSPOT.
@sub Solution: salted row key  =  <salt bucket>_<userId>_<reverse timestamp>
# salt = hash(userId) % number_of_buckets, so writes spread over all regions/RegionServers.
# Pre-split the table into one region per salt bucket.
create 'UserActivity', 'act', SPLITS => ['1', '2', '3']      # buckets 0,1,2,3 -> 4 regions

# Insert records using the salted row-key strategy
put 'UserActivity', '0_user1004_9999999990', 'act:page',   '/home'
put 'UserActivity', '0_user1004_9999999980', 'act:page',   '/cart'
put 'UserActivity', '1_user1001_9999999990', 'act:page',   '/products'
put 'UserActivity', '1_user1005_9999999970', 'act:page',   '/login'
put 'UserActivity', '2_user1002_9999999990', 'act:page',   '/home'
put 'UserActivity', '2_user1006_9999999960', 'act:page',   '/checkout'
put 'UserActivity', '3_user1003_9999999990', 'act:page',   '/contact'
put 'UserActivity', '3_user1007_9999999950', 'act:page',   '/about'

scan 'UserActivity'
# All activity of one user -> only one salt bucket is scanned:
scan 'UserActivity', {ROWPREFIXFILTER => '1_user1001'}

@sub How the row-key design supports horizontal scaling
# - HBase splits a table into REGIONS by row-key ranges; each region is served by one RegionServer.
# - Salting makes keys uniformly distributed, so inserts hit all regions in parallel.
# - Adding more RegionServers lets HBase move regions to them -> throughput grows linearly.
# - Reverse timestamp puts newest events first within a user; prefix = fast range scans.
# - Keep keys short; avoid monotonically increasing keys as the first part of the key.


@@ Q10. HBase - Multiple Regions and RegionServers
create 'RegionDemo', 'cf', SPLITS => ['g', 'n', 't']        # 4 regions: <g, g-n, n-t, >=t

put 'RegionDemo', 'apple',  'cf:v', '1'
put 'RegionDemo', 'banana', 'cf:v', '2'
put 'RegionDemo', 'grape',  'cf:v', '3'
put 'RegionDemo', 'lemon',  'cf:v', '4'
put 'RegionDemo', 'mango',  'cf:v', '5'
put 'RegionDemo', 'orange', 'cf:v', '6'
put 'RegionDemo', 'papaya', 'cf:v', '7'
put 'RegionDemo', 'tomato', 'cf:v', '8'
put 'RegionDemo', 'zebra',  'cf:v', '9'

# Show how the table is divided into regions and which RegionServer hosts each
list_regions 'RegionDemo'
status 'detailed'
scan 'hbase:meta', {COLUMNS => 'info:regioninfo', FILTER => "PrefixFilter('RegionDemo')"}

# Force a split of a region and watch region count increase
split 'RegionDemo', 'k'
list_regions 'RegionDemo'
# Web UI:  http://localhost:16010  (Master)  and  http://localhost:16030  (RegionServer)

@sub Role of RegionServers (scalability and availability)
# - A RegionServer hosts many regions and handles ALL client reads/writes for them.
# - Write path: WAL (write-ahead log) -> MemStore -> flush to HFiles on HDFS.
# - Scalability: more RegionServers can be added; the Master (HMaster) balances regions
#   across them, and regions auto-split when they become too large.
# - Availability: data (HFiles + WAL) is stored on HDFS with 3 replicas. If a RegionServer
#   dies, ZooKeeper detects it, HMaster reassigns its regions to other servers and the WAL
#   is replayed, so the data becomes available again automatically.
# - Clients locate regions through the hbase:meta table, then talk directly to the RegionServer.


@@ Q11. Cassandra - Install, Keyspace CollegeDB with Replication, Students Table
@sub Install and configure Apache Cassandra (Linux)
# Java 11 required
echo "deb [signed-by=/etc/apt/keyrings/apache-cassandra.asc] https://debian.cassandra.apache.org 41x main" | sudo tee /etc/apt/sources.list.d/cassandra.sources.list
sudo curl -o /etc/apt/keyrings/apache-cassandra.asc https://downloads.apache.org/cassandra/KEYS
sudo apt-get update
sudo apt-get install cassandra
sudo systemctl start cassandra
nodetool status             # UN = Up / Normal
cqlsh

@sub Keyspace, table, insert and retrieve
CREATE KEYSPACE CollegeDB
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 3};
-- (use replication_factor 1 on a single local node)

USE CollegeDB;

CREATE TABLE Students (
    Student_ID INT PRIMARY KEY,
    Name       TEXT,
    Course     TEXT,
    Semester   INT,
    Marks      INT
);

INSERT INTO Students (Student_ID, Name, Course, Semester, Marks) VALUES (1, 'Amit Sharma', 'BCA', 3, 78);
INSERT INTO Students (Student_ID, Name, Course, Semester, Marks) VALUES (2, 'Neha Verma',  'BCA', 3, 85);
INSERT INTO Students (Student_ID, Name, Course, Semester, Marks) VALUES (3, 'Rohit Singh', 'MCA', 1, 69);
INSERT INTO Students (Student_ID, Name, Course, Semester, Marks) VALUES (4, 'Priya Nair',  'BBA', 5, 91);
INSERT INTO Students (Student_ID, Name, Course, Semester, Marks) VALUES (5, 'Karan Mehta', 'MCA', 2, 74);

SELECT * FROM Students;
SELECT * FROM Students WHERE Student_ID = 3;
SELECT Name, Marks FROM Students;
DESCRIBE KEYSPACE CollegeDB;


@@ Q12. Cassandra - CRUD on Employees Table
CREATE KEYSPACE IF NOT EXISTS CompanyDB
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
USE CompanyDB;

CREATE TABLE Employees (
    Emp_ID  INT PRIMARY KEY,
    Name    TEXT,
    Dept    TEXT,
    Salary  INT
);

-- INSERT
INSERT INTO Employees (Emp_ID, Name, Dept, Salary) VALUES (101, 'Amit',  'IT', 40000);
INSERT INTO Employees (Emp_ID, Name, Dept, Salary) VALUES (102, 'Neha',  'HR', 35000);
INSERT INTO Employees (Emp_ID, Name, Dept, Salary) VALUES (103, 'Rohit', 'IT', 45000);
INSERT INTO Employees (Emp_ID, Name, Dept, Salary) VALUES (104, 'Priya', 'Finance', 50000);

-- SELECT
SELECT * FROM Employees;
SELECT * FROM Employees WHERE Emp_ID = 102;

-- UPDATE
UPDATE Employees SET Salary = 38000 WHERE Emp_ID = 102;
UPDATE Employees SET Dept = 'Admin', Salary = 52000 WHERE Emp_ID = 104;
SELECT * FROM Employees;

-- DELETE
DELETE FROM Employees WHERE Emp_ID = 103;          -- delete a row
DELETE Salary FROM Employees WHERE Emp_ID = 101;   -- delete one column value
SELECT * FROM Employees;


@@ Q13. Cassandra - Event Logging Application
CREATE KEYSPACE IF NOT EXISTS EventsDB
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
USE EventsDB;

-- Partition key = user_id (all events of a user together)
-- Clustering key = event_time (events sorted by time, newest first)
CREATE TABLE events_by_user (
    user_id    TEXT,
    event_time TIMESTAMP,
    event_id   UUID,
    event_type TEXT,
    status     TEXT,
    ip_address TEXT,
    PRIMARY KEY ((user_id), event_time, event_id)
) WITH CLUSTERING ORDER BY (event_time DESC, event_id ASC);

INSERT INTO events_by_user (user_id, event_time, event_id, event_type, status, ip_address)
VALUES ('u101', '2026-10-29 09:00:00', uuid(), 'login',        'success', '10.0.0.1');
INSERT INTO events_by_user (user_id, event_time, event_id, event_type, status, ip_address)
VALUES ('u101', '2026-10-29 09:15:00', uuid(), 'file-upload',  'success', '10.0.0.1');
INSERT INTO events_by_user (user_id, event_time, event_id, event_type, status, ip_address)
VALUES ('u101', '2026-10-30 08:00:00', uuid(), 'logout',       'success', '10.0.0.1');
INSERT INTO events_by_user (user_id, event_time, event_id, event_type, status, ip_address)
VALUES ('u102', '2026-10-29 10:00:00', uuid(), 'failed-login', 'failed',  '10.0.0.7');
INSERT INTO events_by_user (user_id, event_time, event_id, event_type, status, ip_address)
VALUES ('u102', '2026-10-29 10:02:00', uuid(), 'login',        'success', '10.0.0.7');

-- All events of a particular user (newest first)
SELECT * FROM events_by_user WHERE user_id = 'u101';

-- Events of a user for a particular time period
SELECT event_time, event_type, status
FROM events_by_user
WHERE user_id = 'u101'
  AND event_time >= '2026-10-29 00:00:00'
  AND event_time <  '2026-10-30 00:00:00';

-- Latest 2 events of a user
SELECT * FROM events_by_user WHERE user_id = 'u102' LIMIT 2;


@@ Q14. Cassandra - Availability and Consistency Levels (ONE, QUORUM, ALL)
@sub Setup: 3-node cluster (see Q12 of Lab Sheet 2 for Docker commands), replication strategy
CREATE KEYSPACE ConsistencyDB
WITH replication = {'class': 'NetworkTopologyStrategy', 'dc1': 3};     -- RF = 3
USE ConsistencyDB;
CREATE TABLE accounts (id INT PRIMARY KEY, name TEXT, balance INT);

@sub Reads/writes with different consistency levels (all 3 nodes UP)
CONSISTENCY ONE;                                 -- 1 replica must respond
INSERT INTO accounts (id, name, balance) VALUES (1, 'Amit', 5000);
SELECT * FROM accounts WHERE id = 1;

CONSISTENCY QUORUM;                              -- majority = (RF/2)+1 = 2 replicas
INSERT INTO accounts (id, name, balance) VALUES (2, 'Neha', 7000);
SELECT * FROM accounts WHERE id = 2;

CONSISTENCY ALL;                                 -- all 3 replicas must respond
INSERT INTO accounts (id, name, balance) VALUES (3, 'Rohit', 9000);
SELECT * FROM accounts WHERE id = 3;

TRACING ON;                                      -- shows which replicas were contacted
SELECT * FROM accounts WHERE id = 1;
TRACING OFF;

@sub Observe behaviour when ONE node is down (docker stop cass3 / nodetool drain)
CONSISTENCY ONE;      SELECT * FROM accounts WHERE id = 1;      -- works
CONSISTENCY QUORUM;   SELECT * FROM accounts WHERE id = 1;      -- works (2 of 3 alive)
CONSISTENCY ALL;      SELECT * FROM accounts WHERE id = 1;      -- FAILS: Unavailable exception

@sub Observe behaviour when TWO nodes are down
CONSISTENCY ONE;      SELECT * FROM accounts WHERE id = 1;      -- still works
CONSISTENCY QUORUM;   SELECT * FROM accounts WHERE id = 1;      -- FAILS (needs 2, only 1 alive)
CONSISTENCY ALL;      SELECT * FROM accounts WHERE id = 1;      -- FAILS

@sub Summary
# Level   | Replicas needed (RF=3) | Consistency | Availability
# --------+------------------------+-------------+-----------------------------
# ONE     | 1                      | Weakest     | Highest (works with 2 nodes down)
# QUORUM  | 2                      | Strong when R + W > RF | Tolerates 1 node down
# ALL     | 3                      | Strongest   | Lowest (fails if any node down)
# Rule: R + W > RF gives strong consistency (e.g. QUORUM read + QUORUM write).


@@ Q15. Column-Oriented Application using Cassandra - Event Logging System
@sub 1. Create keyspace and tables
CREATE KEYSPACE LogApp
WITH replication = {'class': 'NetworkTopologyStrategy', 'dc1': 3};
USE LogApp;

CREATE TABLE logs_by_user (
    user_id    TEXT,
    event_time TIMESTAMP,
    event_type TEXT,
    status     TEXT,
    details    TEXT,
    PRIMARY KEY ((user_id), event_time)
) WITH CLUSTERING ORDER BY (event_time DESC);

-- Second table for a different query pattern (query-driven design, data duplicated)
CREATE TABLE logs_by_type (
    event_type TEXT,
    event_time TIMESTAMP,
    user_id    TEXT,
    status     TEXT,
    PRIMARY KEY ((event_type), event_time, user_id)
) WITH CLUSTERING ORDER BY (event_time DESC, user_id ASC);

-- Counter table for failed logins
CREATE TABLE failed_login_count (
    user_id TEXT PRIMARY KEY,
    attempts COUNTER
);

@sub 2. Insert data (BATCH keeps both denormalized tables in sync)
BEGIN BATCH
  INSERT INTO logs_by_user (user_id, event_time, event_type, status, details)
         VALUES ('u101', '2026-10-30 09:00:00', 'login', 'success', 'web');
  INSERT INTO logs_by_type (event_type, event_time, user_id, status)
         VALUES ('login', '2026-10-30 09:00:00', 'u101', 'success');
APPLY BATCH;

BEGIN BATCH
  INSERT INTO logs_by_user (user_id, event_time, event_type, status, details)
         VALUES ('u102', '2026-10-30 09:05:00', 'failed-login', 'failed', 'wrong password');
  INSERT INTO logs_by_type (event_type, event_time, user_id, status)
         VALUES ('failed-login', '2026-10-30 09:05:00', 'u102', 'failed');
APPLY BATCH;

INSERT INTO logs_by_user (user_id, event_time, event_type, status, details)
       VALUES ('u101', '2026-10-30 09:30:00', 'file-upload', 'success', 'report.pdf');

UPDATE failed_login_count SET attempts = attempts + 1 WHERE user_id = 'u102';
UPDATE failed_login_count SET attempts = attempts + 1 WHERE user_id = 'u102';

-- Expiring log entries: auto-delete after 30 days (2592000 seconds)
INSERT INTO logs_by_user (user_id, event_time, event_type, status, details)
       VALUES ('u103', '2026-10-30 10:00:00', 'login', 'success', 'mobile') USING TTL 2592000;

@sub 3. Querying
SELECT * FROM logs_by_user WHERE user_id = 'u101';
SELECT * FROM logs_by_user WHERE user_id = 'u101' AND event_time > '2026-10-30 09:10:00';
SELECT * FROM logs_by_type WHERE event_type = 'failed-login';
SELECT * FROM failed_login_count WHERE user_id = 'u102';

@sub 4. Updating and deleting
UPDATE logs_by_user SET status = 'reviewed' WHERE user_id = 'u102' AND event_time = '2026-10-30 09:05:00';
DELETE FROM logs_by_user WHERE user_id = 'u101' AND event_time = '2026-10-30 09:30:00';
DELETE FROM logs_by_user WHERE user_id = 'u103';           -- whole partition

@sub 5. How Cassandra handles the key features
# CONSISTENCY   : Tunable per query (ONE / QUORUM / ALL). R + W > RF gives strong consistency;
#                 otherwise EVENTUAL consistency, repaired by read repair, hinted handoff, anti-entropy repair.
# AVAILABILITY  : Peer-to-peer ring, no master. Data replicated to RF nodes, so the cluster keeps
#                 serving requests when nodes fail (AP system in CAP theorem).
# TRANSACTIONS  : No multi-row ACID transactions. Single-partition writes are atomic and isolated.
#                 BATCH gives atomicity (all or nothing, eventually); lightweight transactions
#                 (INSERT ... IF NOT EXISTS, UPDATE ... IF col = value) use Paxos for compare-and-set.
# QUERY FEATURES: CQL (SQL-like) but NO joins, no subqueries; queries must use the partition key.
#                 Data is modelled per query (denormalization), clustering columns allow range
#                 queries, TTL for expiry, counters, secondary/SAI indexes.
# SCALING       : Linear horizontal scaling - add nodes and data is automatically redistributed
#                 using consistent hashing (token ring + vnodes). Very high write throughput
#                 (LSM tree: commit log -> memtable -> SSTable).
