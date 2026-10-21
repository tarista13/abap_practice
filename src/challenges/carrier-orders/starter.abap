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
    " TODO: select the TOR_IDs of the carrier's open freight orders, sorted by TOR_ID

  ENDMETHOD.

  METHOD count_stops.
    " TODO: find the freight order, then count its stops

  ENDMETHOD.
ENDCLASS.
