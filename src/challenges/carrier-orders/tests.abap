CLASS ltcl_carrier_orders DEFINITION FINAL FOR TESTING DURATION SHORT RISK LEVEL HARMLESS.
  PRIVATE SECTION.
    DATA mo_cut TYPE REF TO zcl_carrier_orders.
    METHODS setup.
    METHODS skips_canceled_orders FOR TESTING.
    METHODS skips_completed_orders FOR TESTING.
    METHODS skips_freight_bookings FOR TESTING.
    METHODS unknown_carrier_has_none FOR TESTING.
    METHODS counts_stops FOR TESTING.
    METHODS unknown_order_has_no_stops FOR TESTING.
ENDCLASS.

CLASS ltcl_carrier_orders IMPLEMENTATION.
  METHOD setup.
    mo_cut = NEW #( ).
  ENDMETHOD.

  METHOD skips_canceled_orders.
    DATA lt_exp TYPE zcl_carrier_orders=>ty_tor_ids.
    lt_exp = VALUE #( ( '6100000101' ) ( '6100000102' ) ).
    cl_abap_unit_assert=>assert_equals(
      act = mo_cut->get_open_orders( 'CARRIER_A' )
      exp = lt_exp
      msg = 'CARRIER_A: canceled order 6100000103 (status 10) is not open' ).
  ENDMETHOD.

  METHOD skips_completed_orders.
    DATA lt_exp TYPE zcl_carrier_orders=>ty_tor_ids.
    lt_exp = VALUE #( ( '6100000105' ) ).
    cl_abap_unit_assert=>assert_equals(
      act = mo_cut->get_open_orders( 'CARRIER_B' )
      exp = lt_exp
      msg = 'CARRIER_B: completed order 6100000104 (status 05) is not open' ).
  ENDMETHOD.

  METHOD skips_freight_bookings.
    cl_abap_unit_assert=>assert_initial(
      act = mo_cut->get_open_orders( 'CARRIER_C' )
      msg = 'CARRIER_C only has a freight booking (TOR_CAT BO), not a freight order' ).
  ENDMETHOD.

  METHOD unknown_carrier_has_none.
    cl_abap_unit_assert=>assert_initial(
      act = mo_cut->get_open_orders( 'NOBODY' )
      msg = 'A carrier without orders should get an empty list' ).
  ENDMETHOD.

  METHOD counts_stops.
    cl_abap_unit_assert=>assert_equals(
      act = mo_cut->count_stops( '6100000104' )
      exp = 4
      msg = 'Freight order 6100000104 has 4 stops' ).
  ENDMETHOD.

  METHOD unknown_order_has_no_stops.
    cl_abap_unit_assert=>assert_equals(
      act = mo_cut->count_stops( '9999999999' )
      exp = 0
      msg = 'An order that does not exist has 0 stops' ).
  ENDMETHOD.
ENDCLASS.
