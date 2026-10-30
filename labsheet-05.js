@@ Q1. Riak KV - Install, Bucket 'students', Basic Key-Value Operations
@sub Install and configure Riak KV on Linux (Ubuntu/Debian example)
# Download the Riak KV 3.x .deb package for your Ubuntu version from the official Riak KV
# (TI Tokyo) releases page / packagecloud, then:
sudo dpkg -i riak_3.0.*_amd64.deb
# Edit /etc/riak/riak.conf :
#   nodename = riak@127.0.0.1
#   listener.http.internal = 0.0.0.0:8098        # HTTP API
#   listener.protobuf.internal = 0.0.0.0:8087    # Protocol Buffers API
sudo riak start
riak ping                       # expected output: pong
riak admin status | head        # (Riak 2.x: riak-admin status)
curl -i http://localhost:8098/ping      # expected: OK

@sub Create bucket 'students' (a bucket is created automatically on first write) and store records
curl -XPUT -H "Content-Type: application/json" -d '{"name":"Amit Sharma","course":"BCA","marks":78}'  http://localhost:8098/buckets/students/keys/101
curl -XPUT -H "Content-Type: application/json" -d '{"name":"Neha Verma","course":"BCA","marks":85}'   http://localhost:8098/buckets/students/keys/102
curl -XPUT -H "Content-Type: application/json" -d '{"name":"Rohit Singh","course":"MCA","marks":69}'  http://localhost:8098/buckets/students/keys/103
curl -XPUT -H "Content-Type: application/json" -d '{"name":"Priya Nair","course":"BBA","marks":91}'   http://localhost:8098/buckets/students/keys/104

@sub Retrieve
curl -i http://localhost:8098/buckets/students/keys/101
curl "http://localhost:8098/buckets/students/keys?keys=true"       # list keys (use only for small/dev data)

@sub Update (PUT again on the same key replaces the value)
curl -XPUT -H "Content-Type: application/json" -d '{"name":"Amit Sharma","course":"BCA","marks":82}' http://localhost:8098/buckets/students/keys/101
curl http://localhost:8098/buckets/students/keys/101

@sub Delete
curl -XDELETE http://localhost:8098/buckets/students/keys/104
curl -i http://localhost:8098/buckets/students/keys/104            # 404 Not Found


@@ Q2. Riak KV - user_sessions Bucket
@sub Store session ID (key), user ID, login time and session status (value)
curl -XPUT -H "Content-Type: application/json" \
  -d '{"session_id":"S1001","user_id":"u101","login_time":"2026-10-30T09:00:00","status":"active"}' \
  http://localhost:8098/buckets/user_sessions/keys/S1001

curl -XPUT -H "Content-Type: application/json" \
  -d '{"session_id":"S1002","user_id":"u102","login_time":"2026-10-30T09:10:00","status":"active"}' \
  http://localhost:8098/buckets/user_sessions/keys/S1002

curl -XPUT -H "Content-Type: application/json" \
  -d '{"session_id":"S1003","user_id":"u103","login_time":"2026-10-30T09:20:00","status":"active"}' \
  http://localhost:8098/buckets/user_sessions/keys/S1003

@sub Retrieve session information using its key
curl http://localhost:8098/buckets/user_sessions/keys/S1001

@sub Logout -> update the status
curl -XPUT -H "Content-Type: application/json" \
  -d '{"session_id":"S1001","user_id":"u101","login_time":"2026-10-30T09:00:00","status":"closed"}' \
  http://localhost:8098/buckets/user_sessions/keys/S1001
curl http://localhost:8098/buckets/user_sessions/keys/S1001

@sub Remove an expired session
curl -XDELETE http://localhost:8098/buckets/user_sessions/keys/S1003
# (Bitcask backend also supports automatic expiry:  bitcask.expiry = 1h  in riak.conf)


@@ Q3. Riak KV - User Profiles and Preferences (PUT and GET)
# Key = user id, Value = JSON profile
curl -XPUT -H "Content-Type: application/json" -d '{
  "name":"Amit Sharma","email":"amit@mail.com","city":"Meerut","language":"Hindi",
  "theme":"dark","notifications":{"email":true,"sms":false,"push":true}}' \
  http://localhost:8098/buckets/user_profiles/keys/u101

curl -XPUT -H "Content-Type: application/json" -d '{
  "name":"Neha Verma","email":"neha@mail.com","city":"Delhi","language":"English",
  "theme":"light","notifications":{"email":true,"sms":true,"push":false}}' \
  http://localhost:8098/buckets/user_profiles/keys/u102

curl -XPUT -H "Content-Type: application/json" -d '{
  "name":"Rohit Singh","email":"rohit@mail.com","city":"Noida","language":"English",
  "theme":"dark","notifications":{"email":false,"sms":false,"push":true}}' \
  http://localhost:8098/buckets/user_profiles/keys/u103

# GET
curl http://localhost:8098/buckets/user_profiles/keys/u101
curl -s http://localhost:8098/buckets/user_profiles/keys/u102 | python3 -m json.tool

# Update a preference (read-modify-write because a key-value store replaces the whole value)
curl -s http://localhost:8098/buckets/user_profiles/keys/u101 \
 | python3 -c "import sys,json; d=json.load(sys.stdin); d['theme']='light'; d['notifications']['sms']=True; print(json.dumps(d))" \
 | curl -XPUT -H "Content-Type: application/json" -d @- http://localhost:8098/buckets/user_profiles/keys/u101
curl http://localhost:8098/buckets/user_profiles/keys/u101


@@ Q4. Riak KV - Shopping Cart Application
# Key = user id, Value = JSON cart {product_id: {qty, price}}
@sub Create / add products
curl -XPUT -H "Content-Type: application/json" -d '{
  "user_id":"u101",
  "items":{"P1":{"qty":1,"price":1500},"P2":{"qty":2,"price":700}}}' \
  http://localhost:8098/buckets/carts/keys/u101

@sub Retrieve the cart
curl -s http://localhost:8098/buckets/carts/keys/u101 | python3 -m json.tool

@sub Add another product and update quantity (read-modify-write using Python)
python3 - <<'EOF'
import requests, json
URL = "http://localhost:8098/buckets/carts/keys/u101"
H = {"Content-Type": "application/json"}

cart = requests.get(URL).json()
cart["items"]["P3"] = {"qty": 1, "price": 450}          # add product
cart["items"]["P2"]["qty"] = 5                          # update quantity
requests.put(URL, data=json.dumps(cart), headers=H)

cart = requests.get(URL).json()
print(json.dumps(cart, indent=2))
print("Cart value =", sum(i["qty"] * i["price"] for i in cart["items"].values()))
EOF

@sub Remove a product from the cart
python3 - <<'EOF'
import requests, json
URL = "http://localhost:8098/buckets/carts/keys/u101"
cart = requests.get(URL).json()
cart["items"].pop("P1", None)
requests.put(URL, data=json.dumps(cart), headers={"Content-Type": "application/json"})
print(requests.get(URL).text)
EOF

@sub Empty / delete the whole cart
curl -XDELETE http://localhost:8098/buckets/carts/keys/u101


@@ Q5. Riak KV - Structure of Data: Strings, JSON, Lists
@sub String value
curl -XPUT -H "Content-Type: text/plain" -d "Hello Riak" http://localhost:8098/buckets/demo/keys/greeting
curl http://localhost:8098/buckets/demo/keys/greeting

@sub JSON document value
curl -XPUT -H "Content-Type: application/json" -d '{"id":1,"name":"Amit","skills":["Python","SQL"]}' \
  http://localhost:8098/buckets/demo/keys/user1
curl http://localhost:8098/buckets/demo/keys/user1

@sub List value (stored as a JSON array)
curl -XPUT -H "Content-Type: application/json" -d '["apple","banana","mango","orange"]' \
  http://localhost:8098/buckets/demo/keys/fruits
curl http://localhost:8098/buckets/demo/keys/fruits

@sub Binary / other value (image, file)
curl -XPUT -H "Content-Type: image/png" --data-binary @logo.png http://localhost:8098/buckets/demo/keys/logo

@sub Retrieve everything stored in the bucket
curl "http://localhost:8098/buckets/demo/keys?keys=true"
curl -i http://localhost:8098/buckets/demo/keys/user1       # headers show Content-Type, Etag, X-Riak-Vclock

@sub Role of bucket, key and value
# BUCKET : a namespace / logical group of keys (like a table or folder); holds properties such as
#          n_val (replicas), r/w quorums, backend. Same key can exist in different buckets.
# KEY    : the unique identifier of an object inside a bucket; the only way to look up a value
#          directly. Riak hashes (bucket, key) to find the partition/nodes that store it.
# VALUE  : the data itself - Riak stores it as an opaque blob (string, JSON, list, binary) and
#          does not interpret its structure. Metadata (content-type, vclock, links) is stored with it.


@@ Q6. Riak KV - Consistency using Read/Write Quorums
@sub Check and set bucket properties (n_val = number of replicas)
curl http://localhost:8098/buckets/accounts/props
curl -XPUT -H "Content-Type: application/json" \
  -d '{"props":{"n_val":3,"allow_mult":true,"last_write_wins":false,"r":2,"w":2}}' \
  http://localhost:8098/buckets/accounts/props

@sub Write with write quorum w=2 (2 of 3 replicas must acknowledge)
curl -XPUT -H "Content-Type: application/json" -d '{"name":"Amit","balance":5000}' \
  "http://localhost:8098/buckets/accounts/keys/a1?w=2"

@sub Read with read quorum r=2
curl "http://localhost:8098/buckets/accounts/keys/a1?r=2"

@sub Different quorum values per request
curl "http://localhost:8098/buckets/accounts/keys/a1?r=1"           # fastest, may be stale
curl "http://localhost:8098/buckets/accounts/keys/a1?r=quorum"      # majority
curl "http://localhost:8098/buckets/accounts/keys/a1?r=all"         # strongest, fails if a node is down
curl -XPUT -H "Content-Type: application/json" -d '{"name":"Amit","balance":4500}' \
  "http://localhost:8098/buckets/accounts/keys/a1?w=all&dw=all"

@sub Conflicting writes -> siblings (concurrent updates on different nodes)
curl -i http://localhost:8098/buckets/accounts/keys/a1             # HTTP 300 = multiple siblings
# The client reads all siblings, merges them, and writes back with the X-Riak-Vclock header:
curl -i -XPUT -H "Content-Type: application/json" -H "X-Riak-Vclock: <vclock from GET>" \
  -d '{"name":"Amit","balance":4500}' http://localhost:8098/buckets/accounts/keys/a1

@sub How Riak handles consistency in a distributed environment
# - Riak is an AP (available + partition-tolerant) system with EVENTUAL consistency by default.
# - Each object is replicated to N nodes (n_val). Writes succeed when W replicas respond,
#   reads when R replicas respond. If R + W > N, reads see the latest write (strong-like).
# - Concurrent updates are tracked with vector clocks / dotted version vectors; conflicts become
#   siblings (allow_mult) or are resolved by last-write-wins.
# - Background mechanisms heal replicas: read repair, hinted handoff, active anti-entropy (AAE).
# - Riak 2.0+ also offers strongly consistent buckets (consistent=true, Raft-based, needs 5+ nodes).


@@ Q7. Riak KV - Scaling: Multiple Buckets and Many Records
@sub Insert a large number of records into several buckets (bash loop)
for i in $(seq 1 1000); do
  curl -s -XPUT -H "Content-Type: application/json" \
    -d "{\"id\":$i,\"name\":\"User$i\",\"city\":\"City$((i % 10))\"}" \
    http://localhost:8098/buckets/users/keys/user$i > /dev/null
done

for i in $(seq 1 1000); do
  curl -s -XPUT -H "Content-Type: application/json" \
    -d "{\"id\":$i,\"name\":\"Product$i\",\"price\":$((i * 10))}" \
    http://localhost:8098/buckets/products/keys/prod$i > /dev/null
done

for i in $(seq 1 1000); do
  curl -s -XPUT -H "Content-Type: application/json" \
    -d "{\"order_id\":$i,\"user\":\"user$((i % 1000 + 1))\",\"amount\":$((i * 5))}" \
    http://localhost:8098/buckets/orders/keys/order$i > /dev/null
done

@sub Verify
curl -s "http://localhost:8098/buckets/users/keys?keys=true" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['keys']))"
curl http://localhost:8098/buckets/users/keys/user500

@sub Add nodes to the cluster (run on the NEW node, then commit on any node)
riak admin cluster join riak@node1.example.com
riak admin cluster plan
riak admin cluster commit
riak admin member-status
riak admin ring-status
riak admin transfers             # shows partitions being handed off to the new node

@sub How Riak distributes data and supports horizontal scaling
# - Riak uses CONSISTENT HASHING: hash(bucket + key) -> a position on a ring of 2^160 values.
# - The ring is divided into 64 (default) equal PARTITIONS (vnodes); each physical node owns
#   several vnodes. Each key is stored on the owner vnode and the next N-1 vnodes (replicas).
# - Adding a node: the ring is rebalanced and only a fraction of partitions (about 1/number_of_nodes)
#   moves to it - no full reshuffle, no downtime.
# - There is no master: any node can accept any request and forward it to the right replicas.
# - Capacity and throughput grow almost linearly with the number of nodes.


@@ Q8. Riak KV - Transaction-like Scenario (Shopping Application)
# Riak has NO multi-key transactions, so related operations are done in order by application code.
# Keys: cart:u101 (items + total), stock:P1 (inventory)
@sub Setup
curl -XPUT -H "Content-Type: application/json" -d '{"user":"u101","items":{},"total":0}' http://localhost:8098/buckets/carts/keys/u101
curl -XPUT -H "Content-Type: application/json" -d '{"name":"Keyboard","price":1500,"stock":10}' http://localhost:8098/buckets/products/keys/P1

@sub Multiple related operations: add item, update quantity, update cart total
python3 - <<'EOF'
import requests, json
B = "http://localhost:8098/buckets"
H = {"Content-Type": "application/json"}
def get(b, k):  return requests.get(f"{B}/{b}/keys/{k}").json()
def put(b, k, v): return requests.put(f"{B}/{b}/keys/{k}?w=quorum", data=json.dumps(v), headers=H)

done = []                                   # log of completed steps for compensation
try:
    # Step 1: add item to the cart
    cart = get("carts", "u101"); prod = get("products", "P1")
    cart["items"]["P1"] = {"qty": 1, "price": prod["price"]}
    put("carts", "u101", cart); done.append("cart_item_added")

    # Step 2: update its quantity
    cart["items"]["P1"]["qty"] = 3
    put("carts", "u101", cart); done.append("qty_updated")

    # Step 3: update cart total
    cart["total"] = sum(i["qty"] * i["price"] for i in cart["items"].values())
    put("carts", "u101", cart); done.append("total_updated")

    # Step 4: reduce stock
    if prod["stock"] < 3: raise Exception("Out of stock")
    prod["stock"] -= 3
    put("products", "P1", prod); done.append("stock_reduced")
    print("Success:", get("carts", "u101"))

except Exception as e:
    # Compensating action (manual rollback) because Riak cannot roll back automatically
    print("Failed:", e, "-> compensating steps done:", done)
    cart = get("carts", "u101"); cart["items"].pop("P1", None); cart["total"] = 0
    put("carts", "u101", cart)
EOF

@sub Create-only-if-not-exists (a simple guard)
curl -i -XPUT -H "If-None-Match: *" -H "Content-Type: application/json" -d '{"x":1}' http://localhost:8098/buckets/carts/keys/u101

@sub Limitations of transactions in a key-value database
# 1. No multi-key / multi-bucket ACID transactions - each put/get is atomic only for ONE key.
# 2. No automatic rollback: if step 3 fails, steps 1-2 stay; application must compensate (saga pattern).
# 3. No isolation: other clients can read or change the cart between your steps (dirty / lost updates).
# 4. Eventual consistency + siblings: concurrent updates may create conflicts to merge manually.
# 5. No joins or constraints (foreign keys, uniqueness) - integrity is the application's job.
# Use an RDBMS for strict transactions (banking), or Riak data types / strong consistency for narrow cases.


@@ Q9. Riak - Query-by-Data on User Records (application-level logic)
@sub Store JSON user records
curl -XPUT -H "Content-Type: application/json" -d '{"name":"Amit","city":"Meerut","age":21,"prefs":["music","cricket"]}' http://localhost:8098/buckets/people/keys/u1
curl -XPUT -H "Content-Type: application/json" -d '{"name":"Neha","city":"Delhi","age":24,"prefs":["travel","music"]}'   http://localhost:8098/buckets/people/keys/u2
curl -XPUT -H "Content-Type: application/json" -d '{"name":"Rohit","city":"Meerut","age":27,"prefs":["gaming"]}'        http://localhost:8098/buckets/people/keys/u3
curl -XPUT -H "Content-Type: application/json" -d '{"name":"Priya","city":"Pune","age":22,"prefs":["travel","art"]}'    http://localhost:8098/buckets/people/keys/u4

@sub Application logic: list keys, fetch values, filter by city / age / preference
python3 - <<'EOF'
import requests
B = "http://localhost:8098/buckets/people"

keys = requests.get(f"{B}/keys?keys=true").json()["keys"]
users = {k: requests.get(f"{B}/keys/{k}").json() for k in keys}

print("Users in Meerut      :", [u["name"] for u in users.values() if u["city"] == "Meerut"])
print("Users with age > 22  :", [u["name"] for u in users.values() if u["age"] > 22])
print("Users liking music   :", [u["name"] for u in users.values() if "music" in u["prefs"]])
print("Meerut AND age < 25  :", [u["name"] for u in users.values() if u["city"] == "Meerut" and u["age"] < 25])
EOF

@sub Better approach 1: build your own index (application maintained)
# bucket 'city_index', key = city, value = list of user keys
curl -XPUT -H "Content-Type: application/json" -d '["u1","u3"]' http://localhost:8098/buckets/city_index/keys/Meerut
curl -XPUT -H "Content-Type: application/json" -d '["u2"]'      http://localhost:8098/buckets/city_index/keys/Delhi
curl http://localhost:8098/buckets/city_index/keys/Meerut          # -> then GET each user key

@sub Better approach 2: Secondary Indexes (2i, needs leveldb backend: storage_backend = leveldb)
curl -XPUT -H "Content-Type: application/json" -H "x-riak-index-city_bin: Meerut" -H "x-riak-index-age_int: 21" \
  -d '{"name":"Amit","city":"Meerut","age":21}' http://localhost:8098/buckets/people2/keys/u1
curl http://localhost:8098/buckets/people2/index/city_bin/Meerut
curl http://localhost:8098/buckets/people2/index/age_int/20/25        # range query

@sub Better approach 3: Riak Search (Yokozuna / Solr)  - set  search = on  in riak.conf
# curl -XPUT http://localhost:8098/search/index/people_idx
# curl "http://localhost:8098/search/query/people_idx?wt=json&q=city:Meerut%20AND%20age:[20%20TO%2025]"


@@ Q10. Riak - Set Operations (CRDT Sets)
@sub Create and activate a bucket type for sets
riak admin bucket-type create sets '{"props":{"datatype":"set"}}'
riak admin bucket-type activate sets
riak admin bucket-type status sets

@sub Create sets and ADD elements
curl -XPOST -H "Content-Type: application/json" -d '{"add_all":["music","cricket","travel"]}' \
  http://localhost:8098/types/sets/buckets/interests/datatypes/amit
curl -XPOST -H "Content-Type: application/json" -d '{"add_all":["travel","gaming","music","art"]}' \
  http://localhost:8098/types/sets/buckets/interests/datatypes/neha
curl -XPOST -H "Content-Type: application/json" -d '{"add":"photography"}' \
  http://localhost:8098/types/sets/buckets/interests/datatypes/amit

@sub Fetch the set
curl http://localhost:8098/types/sets/buckets/interests/datatypes/amit
# {"type":"set","value":["cricket","music","photography","travel"],"context":"g2wAAAAB..."}

@sub REMOVE an element (observed-remove: the causal "context" from a fetch is required)
CTX=$(curl -s http://localhost:8098/types/sets/buckets/interests/datatypes/amit | python3 -c "import sys,json; print(json.load(sys.stdin)['context'])")
curl -XPOST -H "Content-Type: application/json" -d "{\"remove\":\"cricket\",\"context\":\"$CTX\"}" \
  http://localhost:8098/types/sets/buckets/interests/datatypes/amit
curl http://localhost:8098/types/sets/buckets/interests/datatypes/amit

@sub CHECK membership and find COMMON elements (application-level set logic)
python3 - <<'EOF'
import requests
B = "http://localhost:8098/types/sets/buckets/interests/datatypes"
amit = set(requests.get(f"{B}/amit").json()["value"])
neha = set(requests.get(f"{B}/neha").json()["value"])

print("Amit interests :", amit)
print("Neha interests :", neha)
print("Is 'music' in Amit's set?  ", "music" in amit)
print("Is 'cricket' in Amit's set?", "cricket" in amit)
print("Common elements (intersection):", amit & neha)
print("Union                          :", amit | neha)
print("Only Amit (difference)         :", amit - neha)
EOF
# Riak sets are add-wins/observed-remove CRDTs, so concurrent updates on different nodes merge automatically.


@@ Q11. Neo4j - Install, Graph of Student, Course, Department
@sub Install and start Neo4j (Ubuntu example)
# Java 17 required
wget -O - https://debian.neo4j.com/neotechnology.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/neotechnology.gpg
echo 'deb [signed-by=/etc/apt/keyrings/neotechnology.gpg] https://debian.neo4j.com stable latest' | sudo tee /etc/apt/sources.list.d/neo4j.list
sudo apt-get update
sudo apt-get install neo4j
sudo systemctl start neo4j
cypher-shell -u neo4j -p <password>            # or open the browser: http://localhost:7474

@sub Create nodes and relationships with sample data
CREATE (d1:Department {name: 'Computer Applications'}),
       (d2:Department {name: 'Management'}),
       (c1:Course {code: 'C1', title: 'Database Systems'}),
       (c2:Course {code: 'C2', title: 'Web Technology'}),
       (c3:Course {code: 'C3', title: 'Marketing'}),
       (s1:Student {id: 1, name: 'Amit Sharma'}),
       (s2:Student {id: 2, name: 'Neha Verma'}),
       (s3:Student {id: 3, name: 'Rohit Singh'}),
       (s4:Student {id: 4, name: 'Priya Nair'}),
       (s5:Student {id: 5, name: 'Karan Mehta'}),
       (c1)-[:OFFERED_BY]->(d1),
       (c2)-[:OFFERED_BY]->(d1),
       (c3)-[:OFFERED_BY]->(d2),
       (s1)-[:BELONGS_TO]->(d1), (s2)-[:BELONGS_TO]->(d1), (s3)-[:BELONGS_TO]->(d1),
       (s4)-[:BELONGS_TO]->(d2), (s5)-[:BELONGS_TO]->(d2),
       (s1)-[:ENROLLED_IN {grade: 'A'}]->(c1),
       (s1)-[:ENROLLED_IN {grade: 'B'}]->(c2),
       (s2)-[:ENROLLED_IN {grade: 'A'}]->(c1),
       (s3)-[:ENROLLED_IN {grade: 'B'}]->(c2),
       (s4)-[:ENROLLED_IN {grade: 'A'}]->(c3),
       (s5)-[:ENROLLED_IN {grade: 'C'}]->(c3);

@sub Visualize the resulting graph (Neo4j Browser at http://localhost:7474)
MATCH (n) RETURN n;
MATCH p = (s:Student)-[:ENROLLED_IN]->(c:Course)-[:OFFERED_BY]->(d:Department) RETURN p;

@sub Some queries
MATCH (s:Student)-[:ENROLLED_IN]->(c:Course {title: 'Database Systems'}) RETURN s.name;
MATCH (d:Department)<-[:BELONGS_TO]-(s:Student) RETURN d.name, count(s) AS students;
MATCH (s:Student {name: 'Amit Sharma'})-[e:ENROLLED_IN]->(c:Course) RETURN c.title, e.grade;


@@ Q12. Neo4j Cypher - Social Network (Person, FRIENDS_WITH, FOLLOWS, WORKS_AT)
CREATE (a:Person {name: 'Amit',  city: 'Meerut'}),
       (b:Person {name: 'Neha',  city: 'Delhi'}),
       (c:Person {name: 'Rohit', city: 'Noida'}),
       (d:Person {name: 'Priya', city: 'Pune'}),
       (e:Person {name: 'Karan', city: 'Lucknow'}),
       (co1:Company {name: 'TCS'}),
       (co2:Company {name: 'Infosys'}),
       (a)-[:FRIENDS_WITH]->(b),
       (a)-[:FRIENDS_WITH]->(c),
       (b)-[:FRIENDS_WITH]->(d),
       (c)-[:FRIENDS_WITH]->(e),
       (b)-[:FOLLOWS]->(a),
       (c)-[:FOLLOWS]->(a),
       (d)-[:FOLLOWS]->(a),
       (a)-[:FOLLOWS]->(e),
       (a)-[:WORKS_AT {since: 2022}]->(co1),
       (b)-[:WORKS_AT {since: 2021}]->(co2),
       (c)-[:WORKS_AT {since: 2023}]->(co1);

// Find a person's friends (direction ignored, friendship is mutual)
MATCH (p:Person {name: 'Amit'})-[:FRIENDS_WITH]-(f:Person) RETURN f.name;

// Find a person's followers (people who follow Amit)
MATCH (f:Person)-[:FOLLOWS]->(p:Person {name: 'Amit'}) RETURN f.name AS follower;

// Whom does Amit follow?
MATCH (p:Person {name: 'Amit'})-[:FOLLOWS]->(x:Person) RETURN x.name;

// Colleagues (people working at the same company)
MATCH (p:Person {name: 'Amit'})-[:WORKS_AT]->(c:Company)<-[:WORKS_AT]-(col:Person) RETURN col.name, c.name;

// Friends of friends (suggestions)
MATCH (p:Person {name: 'Amit'})-[:FRIENDS_WITH]-(:Person)-[:FRIENDS_WITH]-(fof:Person)
WHERE fof <> p AND NOT (p)-[:FRIENDS_WITH]-(fof)
RETURN DISTINCT fof.name;

// Number of followers per person
MATCH (f:Person)-[:FOLLOWS]->(p:Person) RETURN p.name, count(f) AS followers ORDER BY followers DESC;


@@ Q13. Neo4j - Shopping / E-Commerce Graph
CREATE (c1:Customer {id: 1, name: 'Amit'}),
       (c2:Customer {id: 2, name: 'Neha'}),
       (cat1:Category {name: 'Electronics'}),
       (cat2:Category {name: 'Accessories'}),
       (p1:Product {id: 'P1', name: 'Laptop',   price: 55000}),
       (p2:Product {id: 'P2', name: 'Mouse',    price: 700}),
       (p3:Product {id: 'P3', name: 'Keyboard', price: 1500}),
       (p4:Product {id: 'P4', name: 'Monitor',  price: 9000}),
       (o1:Order {id: 'O1', date: date('2026-10-01')}),
       (o2:Order {id: 'O2', date: date('2026-10-12')}),
       (o3:Order {id: 'O3', date: date('2026-10-20')}),
       (p1)-[:IN_CATEGORY]->(cat1),
       (p4)-[:IN_CATEGORY]->(cat1),
       (p2)-[:IN_CATEGORY]->(cat2),
       (p3)-[:IN_CATEGORY]->(cat2),
       (c1)-[:PLACED]->(o1), (c1)-[:PLACED]->(o2), (c2)-[:PLACED]->(o3),
       (o1)-[:CONTAINS {qty: 1}]->(p1),
       (o1)-[:CONTAINS {qty: 2}]->(p2),
       (o2)-[:CONTAINS {qty: 1}]->(p3),
       (o3)-[:CONTAINS {qty: 1}]->(p4),
       (o3)-[:CONTAINS {qty: 1}]->(p2);

// Products purchased by a particular customer
MATCH (c:Customer {name: 'Amit'})-[:PLACED]->(o:Order)-[ct:CONTAINS]->(p:Product)
RETURN o.id AS order, p.name AS product, ct.qty AS qty, p.price AS price;

// Distinct products + total spent by a customer
MATCH (c:Customer {name: 'Amit'})-[:PLACED]->(:Order)-[ct:CONTAINS]->(p:Product)
RETURN c.name, collect(DISTINCT p.name) AS products, sum(ct.qty * p.price) AS totalSpent;

// Categories a customer bought from
MATCH (c:Customer {name: 'Amit'})-[:PLACED]->(:Order)-[:CONTAINS]->(:Product)-[:IN_CATEGORY]->(cat:Category)
RETURN DISTINCT cat.name;

// Customers who bought a Mouse
MATCH (c:Customer)-[:PLACED]->(:Order)-[:CONTAINS]->(:Product {name: 'Mouse'}) RETURN DISTINCT c.name;

// Recommendation: products bought by others who bought the same products as Amit
MATCH (a:Customer {name:'Amit'})-[:PLACED]->(:Order)-[:CONTAINS]->(p:Product)<-[:CONTAINS]-(:Order)<-[:PLACED]-(o:Customer),
      (o)-[:PLACED]->(:Order)-[:CONTAINS]->(rec:Product)
WHERE NOT (a)-[:PLACED]->(:Order)-[:CONTAINS]->(rec)
RETURN DISTINCT rec.name;


@@ Q14. Neo4j - Transactions, Consistency and Availability
@sub Explicit transaction in cypher-shell (several CREATE / MATCH / SET / DELETE operations)
CREATE CONSTRAINT account_id IF NOT EXISTS FOR (a:Account) REQUIRE a.id IS UNIQUE;
CREATE (:Account {id: 'A1', owner: 'Amit', balance: 5000}), (:Account {id: 'A2', owner: 'Neha', balance: 2000});

:begin
CREATE (t:Transfer {id: 'T1', amount: 1500, date: datetime()});
MATCH (a:Account {id: 'A1'}), (b:Account {id: 'A2'}), (t:Transfer {id: 'T1'})
CREATE (a)-[:SENT]->(t)-[:TO]->(b);
MATCH (a:Account {id: 'A1'}) SET a.balance = a.balance - 1500;
MATCH (b:Account {id: 'A2'}) SET b.balance = b.balance + 1500;
:commit

MATCH (a:Account) RETURN a.id, a.balance;               -- A1 = 3500, A2 = 3500

@sub Rollback: nothing from the transaction is saved
:begin
MATCH (a:Account {id: 'A1'}) SET a.balance = a.balance - 9999;
MATCH (a:Account {id: 'A1'}) DELETE a;                   -- (error: node still has relationships)
:rollback
MATCH (a:Account {id: 'A1'}) RETURN a.balance;           -- still 3500

@sub Failure inside a transaction -> whole transaction is undone (constraint violation)
:begin
MATCH (a:Account {id: 'A2'}) SET a.balance = 0;
CREATE (:Account {id: 'A1', owner: 'Duplicate'});        -- fails: unique constraint on id
:commit
MATCH (a:Account {id: 'A2'}) RETURN a.balance;           -- still 3500 (the SET was rolled back)

@sub Same idea from Python (transaction function: auto commit / rollback / retry)
python3 - <<'EOF'
from neo4j import GraphDatabase
driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))

def transfer(tx, src, dst, amt):
    bal = tx.run("MATCH (a:Account {id:$s}) RETURN a.balance AS b", s=src).single()["b"]
    if bal < amt:
        raise ValueError("Insufficient balance")          # exception -> automatic rollback
    tx.run("MATCH (a:Account {id:$s}) SET a.balance = a.balance - $x", s=src, x=amt)
    tx.run("MATCH (b:Account {id:$d}) SET b.balance = b.balance + $x", d=dst, x=amt)

with driver.session() as session:
    try:
        session.execute_write(transfer, "A1", "A2", 500)
        print("Committed")
    except Exception as e:
        print("Rolled back:", e)
driver.close()
EOF

@sub How transaction management keeps the graph consistent
# - ATOMICITY   : all operations in a transaction are applied or none (rollback on error).
# - CONSISTENCY : constraints (unique, existence) and relationship integrity are checked; a violation aborts the transaction.
# - ISOLATION   : default read-committed - other transactions never see uncommitted changes; locks are taken on modified nodes/relationships.
# - DURABILITY  : changes are written to the transaction log (write-ahead log) before commit is acknowledged.
# - AVAILABILITY: In a Neo4j cluster, writes go to the PRIMARY (leader elected using Raft), and are
#   replicated to a majority of primaries before commit; SECONDARIES serve read queries and scale reads.
#   If the leader fails, a new leader is elected automatically, so the database stays available.


@@ Q15. Graph Database Application - Neo4j with Python (CRUD + Cypher Queries)
@sub Install driver:   pip install neo4j
@sub File: graph_app.py
from neo4j import GraphDatabase

URI, USER, PASSWORD = "bolt://localhost:7687", "neo4j", "password"
driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))

def run(query, **params):
    with driver.session() as session:
        return [r.data() for r in session.run(query, **params)]

# ---------------- CREATE ----------------
def add_person(name, city):
    run("MERGE (p:Person {name: $name}) SET p.city = $city", name=name, city=city)

def add_friendship(a, b):
    run("""MATCH (x:Person {name: $a}), (y:Person {name: $b})
           MERGE (x)-[:FRIENDS_WITH]->(y)""", a=a, b=b)

def add_follow(a, b):
    run("""MATCH (x:Person {name: $a}), (y:Person {name: $b})
           MERGE (x)-[:FOLLOWS]->(y)""", a=a, b=b)

# ---------------- READ ----------------
def all_people():
    return run("MATCH (p:Person) RETURN p.name AS name, p.city AS city ORDER BY name")

def friends_of(name):
    return run("MATCH (:Person {name: $n})-[:FRIENDS_WITH]-(f:Person) RETURN f.name AS friend", n=name)

def followers_of(name):
    return run("MATCH (f:Person)-[:FOLLOWS]->(:Person {name: $n}) RETURN f.name AS follower", n=name)

def recommend_friends(name):                       # relationship-based query (friend of friend)
    return run("""MATCH (p:Person {name: $n})-[:FRIENDS_WITH]-()-[:FRIENDS_WITH]-(s:Person)
                  WHERE s <> p AND NOT (p)-[:FRIENDS_WITH]-(s)
                  RETURN s.name AS suggestion, count(*) AS mutual
                  ORDER BY mutual DESC""", n=name)

def shortest_path(a, b):
    return run("""MATCH path = shortestPath((x:Person {name: $a})-[:FRIENDS_WITH*..6]-(y:Person {name: $b}))
                  RETURN [n IN nodes(path) | n.name] AS route""", a=a, b=b)

# ---------------- UPDATE ----------------
def update_city(name, new_city):
    run("MATCH (p:Person {name: $n}) SET p.city = $c", n=name, c=new_city)

# ---------------- DELETE ----------------
def remove_friendship(a, b):
    run("MATCH (:Person {name: $a})-[r:FRIENDS_WITH]-(:Person {name: $b}) DELETE r", a=a, b=b)

def delete_person(name):
    run("MATCH (p:Person {name: $n}) DETACH DELETE p", n=name)

# ---------------- DEMO ----------------
if __name__ == "__main__":
    run("MATCH (n) DETACH DELETE n")                                  # start clean
    for n, c in [("Amit","Meerut"),("Neha","Delhi"),("Rohit","Noida"),("Priya","Pune"),("Karan","Lucknow")]:
        add_person(n, c)
    for a, b in [("Amit","Neha"),("Amit","Rohit"),("Neha","Priya"),("Rohit","Karan")]:
        add_friendship(a, b)
    for a, b in [("Neha","Amit"),("Rohit","Amit"),("Priya","Amit")]:
        add_follow(a, b)

    print("All people      :", all_people())
    print("Amit's friends  :", friends_of("Amit"))
    print("Amit's followers:", followers_of("Amit"))
    print("Suggestions     :", recommend_friends("Amit"))
    print("Shortest path   :", shortest_path("Priya", "Karan"))

    update_city("Karan", "Kanpur")
    remove_friendship("Rohit", "Karan")
    delete_person("Priya")
    print("After update/delete:", all_people())
    driver.close()

@sub Fraud-detection style query (accounts sharing the same device)
MATCH (a1:Account)-[:USES]->(d:Device)<-[:USES]-(a2:Account)
WHERE a1 <> a2
RETURN d.id AS device, collect(DISTINCT a1.id) AS shared_accounts;

@sub How graph databases support the requirements
# RELATIONSHIP-BASED QUERIES: relationships are stored as direct pointers between nodes
#   (index-free adjacency), so traversals such as friends-of-friends or shortest path cost
#   proportional to the part of graph visited, not to table size - no expensive joins.
# SCALING      : vertical scaling and read scaling with secondary servers; very large graphs
#   can be split into several databases/shards using Neo4j Fabric / Infinity.
# AVAILABILITY : clustering with leader election (Raft) and replicas; automatic failover.
# SUITABLE USE CASES:
#   - Social networks      : friends, followers, mutual connections
#   - Recommendation systems: "people who bought X also bought Y"
#   - Fraud detection      : rings of accounts sharing devices, cards, addresses
#   - Knowledge graphs     : linked entities, semantic search, network/IT dependency maps
