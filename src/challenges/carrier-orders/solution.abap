CLASS zcl_carrier_orders DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    TYPES ty_tor_ids TYPE STANDARD TABLE OF /scmtms/d_torrot-tor_id WITH EMPTY KEY.

    METHODS get_open_orders
      IMPORTING iv_carrier        TYPE /scmtms/d_torrot-tspid
      RETURNING VALUE(rt_tor_ids) TYPE ty_tor_ids.

    METHODS count_stops
      IMPORTING iv_tor_id       TYPE /scmtms/d_torrot-tor_id
      RETURNING VALUE(rv_count) TYPE i.
ENDCLASS.

CLASS zcl_carrier_orders IMPLEMENTATION.
  METHOD get_open_orders.
    SELECT tor_id FROM /scmtms/d_torrot
      WHERE tspid = @iv_carrier
        AND tor_cat = 'TO'
        AND lifecycle <> '05'
        AND lifecycle <> '10'
      ORDER BY tor_id
      INTO TABLE @rt_tor_ids.
  ENDMETHOD.

  METHOD count_stops.
    DATA lv_db_key TYPE /scmtms/d_torrot-db_key.

    SELECT SINGLE db_key FROM /scmtms/d_torrot
      WHERE tor_id = @iv_tor_id
      INTO @lv_db_key.
    IF sy-subrc <> 0.
      RETURN.
    ENDIF.

    SELECT COUNT(*) FROM /scmtms/d_torstp
      WHERE parent_key = @lv_db_key
      INTO @rv_count.
  ENDMETHOD.
ENDCLASS.
