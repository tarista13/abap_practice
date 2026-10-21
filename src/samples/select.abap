REPORT zselect.

" The playground has a small in-memory database with simplified SAP TM tables:
"   /SCMTMS/D_TORROT  freight orders and bookings (header)
"   /SCMTMS/D_TORITE  their items       (PARENT_KEY = header DB_KEY)
"   /SCMTMS/D_TORSTP  their stops       (PARENT_KEY = header DB_KEY)
" Click "Tables" above to see every field and row.

DATA lt_orders TYPE STANDARD TABLE OF /scmtms/d_torrot WITH EMPTY KEY.
DATA ls_order TYPE /scmtms/d_torrot.
DATA lt_stops TYPE STANDARD TABLE OF /scmtms/d_torstp WITH EMPTY KEY.
DATA ls_stop TYPE /scmtms/d_torstp.
DATA lv_count TYPE i.

" 1. Read many rows into an internal table
SELECT * FROM /scmtms/d_torrot
  WHERE tor_cat = 'TO'
  ORDER BY tor_id
  INTO TABLE @lt_orders.

WRITE / |{ sy-dbcnt } freight orders found:|.
LOOP AT lt_orders INTO ls_order.
  WRITE / |  { ls_order-tor_id } carrier { ls_order-tspid } status { ls_order-lifecycle }|.
ENDLOOP.

" 2. Read exactly one row; sy-subrc tells you if it was found
SELECT SINGLE * FROM /scmtms/d_torrot
  WHERE tor_id = '6100000104'
  INTO @ls_order.
IF sy-subrc = 0.
  WRITE / |Order { ls_order-tor_id } weighs { ls_order-gro_wei_val } { ls_order-gro_wei_uni }.|.
ENDIF.

" 3. Follow the key from the header to its stops
SELECT * FROM /scmtms/d_torstp
  WHERE parent_key = @ls_order-db_key
  ORDER BY seq_num
  INTO TABLE @lt_stops.
LOOP AT lt_stops INTO ls_stop.
  WRITE / |  Stop { ls_stop-seq_num }: { ls_stop-log_locid } ({ ls_stop-stop_cat })|.
ENDLOOP.

" 4. Let the database do the counting
SELECT COUNT(*) FROM /scmtms/d_torstp
  WHERE log_locid = 'DC_CHI'
  INTO @lv_count.
WRITE / |{ lv_count } stops are at DC_CHI.|.
