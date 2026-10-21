REPORT zclasses.

CLASS lcl_freight_order DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING iv_id TYPE string.
    METHODS add_item IMPORTING iv_weight TYPE i.
    METHODS get_total RETURNING VALUE(rv_total) TYPE i.
    METHODS describe RETURNING VALUE(rv_text) TYPE string.
  PRIVATE SECTION.
    DATA mv_id TYPE string.
    DATA mt_weights TYPE STANDARD TABLE OF i WITH EMPTY KEY.
ENDCLASS.

CLASS lcl_freight_order IMPLEMENTATION.
  METHOD constructor.
    mv_id = iv_id.
  ENDMETHOD.

  METHOD add_item.
    APPEND iv_weight TO mt_weights.
  ENDMETHOD.

  METHOD get_total.
    LOOP AT mt_weights INTO DATA(lv_weight).
      rv_total = rv_total + lv_weight.
    ENDLOOP.
  ENDMETHOD.

  METHOD describe.
    rv_text = |Freight order { mv_id }: { lines( mt_weights ) } items, { get_total( ) } KG|.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA lo_order TYPE REF TO lcl_freight_order.
  lo_order = NEW #( '6100000123' ).
  lo_order->add_item( 120 ).
  lo_order->add_item( 80 ).
  WRITE / lo_order->describe( ).
