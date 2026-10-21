CLASS zcl_fo_weight DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    TYPES:
      BEGIN OF ty_item,
        item_id     TYPE c LENGTH 10,
        item_cat    TYPE c LENGTH 3,
        gro_wei_val TYPE p LENGTH 10 DECIMALS 3,
        gro_wei_uni TYPE c LENGTH 3,
      END OF ty_item,
      ty_items  TYPE STANDARD TABLE OF ty_item WITH EMPTY KEY,
      ty_weight TYPE p LENGTH 10 DECIMALS 3.

    CONSTANTS c_kg_per_lb TYPE p LENGTH 10 DECIMALS 8 VALUE '0.45359237'.

    METHODS get_total_weight_kg
      IMPORTING it_items         TYPE ty_items
      RETURNING VALUE(rv_weight) TYPE ty_weight.
ENDCLASS.

CLASS zcl_fo_weight IMPLEMENTATION.
  METHOD get_total_weight_kg.
    LOOP AT it_items INTO DATA(ls_item) WHERE item_cat = 'PRD'.
      CASE ls_item-gro_wei_uni.
        WHEN 'LB'.
          rv_weight = rv_weight + ls_item-gro_wei_val * c_kg_per_lb.
        WHEN OTHERS.
          rv_weight = rv_weight + ls_item-gro_wei_val.
      ENDCASE.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
