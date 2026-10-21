# Reading from the database

Everything in SAP TM, every freight order, item and stop, lives in **database tables**. ABAP reads them with **ABAP SQL**, a version of SQL built into the language. The results usually go straight into an internal table.

This sandbox has small, simplified copies of three TM tables (open **Playground → Tables** to browse them):

| Table | Contains | Key fields |
|---|---|---|
| `/SCMTMS/D_TORROT` | freight order and booking headers | `DB_KEY`; `TOR_ID` is the document number |
| `/SCMTMS/D_TORITE` | items of each order | `PARENT_KEY` = the header's `DB_KEY` |
| `/SCMTMS/D_TORSTP` | stops of each order | `PARENT_KEY` = the header's `DB_KEY` |

Names starting with `/SCMTMS/` belong to SAP TM. **TOR** stands for *Transportation Order*, the object behind freight orders and freight bookings.

## Using a table as a type

A database table also works as a **structure type**. `TYPE /scmtms/d_torrot` gives you a structure with all of the table's fields, and `TYPE STANDARD TABLE OF /scmtms/d_torrot` an internal table of them.

## SELECT into an internal table

```abap
DATA lt_orders TYPE STANDARD TABLE OF /scmtms/d_torrot WITH EMPTY KEY.
DATA ls_order TYPE /scmtms/d_torrot.

SELECT * FROM /scmtms/d_torrot
  WHERE tspid = 'CARRIER_A'
  ORDER BY tor_id
  INTO TABLE @lt_orders.

WRITE / |{ sy-dbcnt } orders for CARRIER_A:|.
LOOP AT lt_orders INTO ls_order.
  WRITE / |  { ls_order-tor_id } status { ls_order-lifecycle }|.
ENDLOOP.
```

- `SELECT *` reads all fields; you can also list just the fields you need, separated by commas.
- `WHERE` filters rows, `ORDER BY` sorts them.
- `INTO TABLE @lt_orders` says where the rows go. The `@` marks an ABAP variable inside SQL.
- `sy-dbcnt` holds the number of rows read.

## Using variables in the WHERE clause

Program values go into the SQL with `@` too:

```abap
DATA lv_carrier TYPE /scmtms/d_torrot-tspid VALUE 'CARRIER_B'.
DATA lt_ids TYPE STANDARD TABLE OF /scmtms/d_torrot-tor_id WITH EMPTY KEY.
DATA lv_id TYPE /scmtms/d_torrot-tor_id.

SELECT tor_id FROM /scmtms/d_torrot
  WHERE tspid = @lv_carrier
    AND tor_cat = 'TO'
  INTO TABLE @lt_ids.

LOOP AT lt_ids INTO lv_id.
  WRITE / lv_id.
ENDLOOP.
```

`TYPE /scmtms/d_torrot-tspid` means "the same type as the `TSPID` field of that table". Typing variables after database fields keeps them compatible.

## SELECT SINGLE

When you expect exactly one row, for example looking up an order by its number, use `SELECT SINGLE` with a structure. Always check `sy-subrc`: it's 0 if a row was found and 4 if not.

```abap
DATA ls_order TYPE /scmtms/d_torrot.

SELECT SINGLE * FROM /scmtms/d_torrot
  WHERE tor_id = '6100000102'
  INTO @ls_order.

IF sy-subrc = 0.
  WRITE / |{ ls_order-tor_id }: { ls_order-gro_wei_val } { ls_order-gro_wei_uni } with { ls_order-tspid }|.
ELSE.
  WRITE / 'Order not found.'.
ENDIF.
```

## Following keys to related tables

Items and stops don't store the order number. They store the order's internal key, `DB_KEY`, in their `PARENT_KEY` field. So you first read the header, then use its key:

```abap
DATA ls_order TYPE /scmtms/d_torrot.
DATA lt_items TYPE STANDARD TABLE OF /scmtms/d_torite WITH EMPTY KEY.
DATA ls_item TYPE /scmtms/d_torite.

SELECT SINGLE * FROM /scmtms/d_torrot
  WHERE tor_id = '6100000101'
  INTO @ls_order.

SELECT * FROM /scmtms/d_torite
  WHERE parent_key = @ls_order-db_key
  ORDER BY item_id
  INTO TABLE @lt_items.

LOOP AT lt_items INTO ls_item.
  WRITE / |{ ls_item-item_id } { ls_item-item_cat } { ls_item-item_descr }|.
ENDLOOP.
```

> **Real TM systems** have hundreds of fields in these tables, their keys are generated IDs instead of readable values like `FO1`, and TM code usually reads data through the TM framework (BOPF) instead of plain SELECTs. The SQL skills are the same, though, and you'll use them constantly for reports and analysis.

## Aggregates

The database can count and add up for you, which is much faster than reading every row into ABAP:

```abap
DATA lv_count TYPE i.
DATA lv_total TYPE /scmtms/d_torrot-gro_wei_val.

SELECT COUNT(*) FROM /scmtms/d_torrot
  WHERE tor_cat = 'TO'
  INTO @lv_count.

SELECT SUM( gro_wei_val ) FROM /scmtms/d_torrot
  WHERE tor_cat = 'TO'
  INTO @lv_total.

WRITE / |{ lv_count } freight orders, { lv_total } KG in total.|.
```

## Practice

What does this print? You can look at the data under **Playground → Tables**.

```abap predict
DATA lv_count TYPE i.
DATA ls_order TYPE /scmtms/d_torrot.

SELECT COUNT(*) FROM /scmtms/d_torrot
  WHERE tspid = 'CARRIER_A'
  INTO @lv_count.
WRITE / |{ lv_count }|.

SELECT SINGLE * FROM /scmtms/d_torrot
  WHERE tor_id = '6100000999'
  INTO @ls_order.
WRITE / |{ sy-subrc }|.
WRITE / |[{ ls_order-tspid }]|.
--- explain ---
CARRIER_A has three orders, including the canceled one, since the `WHERE` doesn't filter by status. Order `6100000999` doesn't exist, so `SELECT SINGLE` sets `sy-subrc` to `4` and leaves `ls_order` empty, so the carrier prints as nothing between the brackets.
```

Build a small carrier report against the TM tables.

```abap steps
" Write your program here
--- step ---
Read all freight orders (`TOR_CAT = 'TO'`) of `CARRIER_B` from `/SCMTMS/D_TORROT` into an internal table and print how many there are: `CARRIER_B: 2 orders`.
--- expected ---
CARRIER_B: 2 orders
--- requires ---
SELECT[\s\S]*INTO\s+TABLE :: Read the orders with SELECT ... INTO TABLE.
--- hint ---
Declare the table as `TYPE STANDARD TABLE OF /scmtms/d_torrot WITH EMPTY KEY`.
--- hint ---
Both `sy-dbcnt` and `lines( )` give you the count.
--- solution ---
DATA lt_orders TYPE STANDARD TABLE OF /scmtms/d_torrot WITH EMPTY KEY.

SELECT * FROM /scmtms/d_torrot
  WHERE tspid = 'CARRIER_B'
    AND tor_cat = 'TO'
  INTO TABLE @lt_orders.

WRITE / |CARRIER_B: { lines( lt_orders ) } orders|.
--- step ---
List the orders under that line, sorted by order number, as `<TOR_ID> status <LIFECYCLE>`.
--- expected ---
CARRIER_B: 2 orders
6100000104 status 05
6100000105 status 02
--- requires ---
ORDER\s+BY :: Let the database sort the rows with ORDER BY.
--- hint ---
`ORDER BY tor_id` goes before `INTO TABLE`.
--- solution ---
DATA lt_orders TYPE STANDARD TABLE OF /scmtms/d_torrot WITH EMPTY KEY.
DATA ls_order TYPE /scmtms/d_torrot.

SELECT * FROM /scmtms/d_torrot
  WHERE tspid = 'CARRIER_B'
    AND tor_cat = 'TO'
  ORDER BY tor_id
  INTO TABLE @lt_orders.

WRITE / |CARRIER_B: { lines( lt_orders ) } orders|.
LOOP AT lt_orders INTO ls_order.
  WRITE / |{ ls_order-tor_id } status { ls_order-lifecycle }|.
ENDLOOP.
--- step ---
Add a line with their total gross weight, calculated **by the database**: `Total: 2850.000 KG`.
--- expected ---
CARRIER_B: 2 orders
6100000104 status 05
6100000105 status 02
Total: 2850.000 KG
--- requires ---
SUM\s*\( :: Use SELECT SUM( ... ) so the database adds the weights up.
--- hint ---
Type the result variable like the weight field: `TYPE /scmtms/d_torrot-gro_wei_val`.
--- hint ---
`SELECT SUM( gro_wei_val ) FROM ... WHERE ... INTO @lv_total.`
--- solution ---
DATA lt_orders TYPE STANDARD TABLE OF /scmtms/d_torrot WITH EMPTY KEY.
DATA ls_order TYPE /scmtms/d_torrot.
DATA lv_total TYPE /scmtms/d_torrot-gro_wei_val.

SELECT * FROM /scmtms/d_torrot
  WHERE tspid = 'CARRIER_B'
    AND tor_cat = 'TO'
  ORDER BY tor_id
  INTO TABLE @lt_orders.

SELECT SUM( gro_wei_val ) FROM /scmtms/d_torrot
  WHERE tspid = 'CARRIER_B'
    AND tor_cat = 'TO'
  INTO @lv_total.

WRITE / |CARRIER_B: { lines( lt_orders ) } orders|.
LOOP AT lt_orders INTO ls_order.
  WRITE / |{ ls_order-tor_id } status { ls_order-lifecycle }|.
ENDLOOP.
WRITE / |Total: { lv_total } KG|.
--- step ---
Show each order's number of stops at the end of its line: `6100000104 status 05, 4 stops`.
--- expected ---
CARRIER_B: 2 orders
6100000104 status 05, 4 stops
6100000105 status 02, 2 stops
Total: 2850.000 KG
--- requires ---
parent_key :: Find each order's stops through PARENT_KEY.
--- hint ---
Inside the loop, count the rows in `/SCMTMS/D_TORSTP` that belong to the current order.
--- hint ---
Stops point to the order's `DB_KEY`, not its `TOR_ID`: `WHERE parent_key = @ls_order-db_key`.
--- solution ---
DATA lt_orders TYPE STANDARD TABLE OF /scmtms/d_torrot WITH EMPTY KEY.
DATA ls_order TYPE /scmtms/d_torrot.
DATA lv_total TYPE /scmtms/d_torrot-gro_wei_val.
DATA lv_stops TYPE i.

SELECT * FROM /scmtms/d_torrot
  WHERE tspid = 'CARRIER_B'
    AND tor_cat = 'TO'
  ORDER BY tor_id
  INTO TABLE @lt_orders.

SELECT SUM( gro_wei_val ) FROM /scmtms/d_torrot
  WHERE tspid = 'CARRIER_B'
    AND tor_cat = 'TO'
  INTO @lv_total.

WRITE / |CARRIER_B: { lines( lt_orders ) } orders|.
LOOP AT lt_orders INTO ls_order.
  SELECT COUNT(*) FROM /scmtms/d_torstp
    WHERE parent_key = @ls_order-db_key
    INTO @lv_stops.
  WRITE / |{ ls_order-tor_id } status { ls_order-lifecycle }, { lv_stops } stops|.
ENDLOOP.
WRITE / |Total: { lv_total } KG|.
```

One order in detail. This one has the least guidance of all; check the tables if you're unsure about a field.

```abap steps
" Write your program here
--- step ---
Look up freight order `6100000104` and print its carrier: `Carrier: CARRIER_B`.
--- expected ---
Carrier: CARRIER_B
--- requires ---
SELECT\s+SINGLE :: Use SELECT SINGLE for a lookup by order number.
--- hint ---
The carrier is in the `TSPID` field.
--- solution ---
DATA ls_order TYPE /scmtms/d_torrot.

SELECT SINGLE * FROM /scmtms/d_torrot
  WHERE tor_id = '6100000104'
  INTO @ls_order.

WRITE / |Carrier: { ls_order-tspid }|.
--- step ---
Print its stops in stop order, as `<SEQ_NUM>: <LOG_LOCID>`.
--- expected ---
Carrier: CARRIER_B
1: PLANT_ATH
2: HUB_DTW
3: DC_CHI
4: DC_MSP
--- hint ---
Same idea as the stop count above, but read the rows with `ORDER BY seq_num` and loop over them.
--- solution ---
DATA ls_order TYPE /scmtms/d_torrot.
DATA lt_stops TYPE STANDARD TABLE OF /scmtms/d_torstp WITH EMPTY KEY.
DATA ls_stop TYPE /scmtms/d_torstp.

SELECT SINGLE * FROM /scmtms/d_torrot
  WHERE tor_id = '6100000104'
  INTO @ls_order.

SELECT * FROM /scmtms/d_torstp
  WHERE parent_key = @ls_order-db_key
  ORDER BY seq_num
  INTO TABLE @lt_stops.

WRITE / |Carrier: { ls_order-tspid }|.
LOOP AT lt_stops INTO ls_stop.
  WRITE / |{ ls_stop-seq_num }: { ls_stop-log_locid }|.
ENDLOOP.
--- step ---
Finally, print the order's product items (`ITEM_CAT = 'PRD'`) as `Item <ITEM_ID>: <ITEM_DESCR>`.
--- expected ---
Carrier: CARRIER_B
1: PLANT_ATH
2: HUB_DTW
3: DC_CHI
4: DC_MSP
Item 10: Conference tables
--- requires ---
/scmtms/d_torite :: Read the items from /SCMTMS/D_TORITE.
--- hint ---
Items are linked to the order the same way stops are.
--- solution ---
DATA ls_order TYPE /scmtms/d_torrot.
DATA lt_stops TYPE STANDARD TABLE OF /scmtms/d_torstp WITH EMPTY KEY.
DATA ls_stop TYPE /scmtms/d_torstp.
DATA lt_items TYPE STANDARD TABLE OF /scmtms/d_torite WITH EMPTY KEY.
DATA ls_item TYPE /scmtms/d_torite.

SELECT SINGLE * FROM /scmtms/d_torrot
  WHERE tor_id = '6100000104'
  INTO @ls_order.

SELECT * FROM /scmtms/d_torstp
  WHERE parent_key = @ls_order-db_key
  ORDER BY seq_num
  INTO TABLE @lt_stops.

SELECT * FROM /scmtms/d_torite
  WHERE parent_key = @ls_order-db_key
    AND item_cat = 'PRD'
  INTO TABLE @lt_items.

WRITE / |Carrier: { ls_order-tspid }|.
LOOP AT lt_stops INTO ls_stop.
  WRITE / |{ ls_stop-seq_num }: { ls_stop-log_locid }|.
ENDLOOP.
LOOP AT lt_items INTO ls_item.
  WRITE / |Item { ls_item-item_id }: { ls_item-item_descr }|.
ENDLOOP.
```
