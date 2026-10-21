CLASS ltcl_fo_weight DEFINITION FINAL FOR TESTING DURATION SHORT RISK LEVEL HARMLESS.
  PRIVATE SECTION.
    DATA mo_cut TYPE REF TO zcl_fo_weight.
    METHODS setup.
    METHODS empty_order_weighs_nothing FOR TESTING.
    METHODS sums_product_items FOR TESTING.
    METHODS ignores_packages FOR TESTING.
    METHODS converts_pounds_to_kg FOR TESTING.
ENDCLASS.

CLASS ltcl_fo_weight IMPLEMENTATION.
  METHOD setup.
    mo_cut = NEW #( ).
  ENDMETHOD.

  METHOD empty_order_weighs_nothing.
    DATA lt_items TYPE zcl_fo_weight=>ty_items.
    cl_abap_unit_assert=>assert_initial(
      act = mo_cut->get_total_weight_kg( lt_items )
      msg = 'A freight order without items should weigh 0 KG' ).
  ENDMETHOD.

  METHOD sums_product_items.
    DATA lv_exp TYPE zcl_fo_weight=>ty_weight VALUE '350.5'.
    DATA(lt_items) = VALUE zcl_fo_weight=>ty_items(
      ( item_id = '10' item_cat = 'PRD' gro_wei_val = '100'   gro_wei_uni = 'KG' )
      ( item_id = '20' item_cat = 'PRD' gro_wei_val = '250.5' gro_wei_uni = 'KG' ) ).
    cl_abap_unit_assert=>assert_equals(
      act = mo_cut->get_total_weight_kg( lt_items )
      exp = lv_exp
      msg = 'Weights of product items should be added up' ).
  ENDMETHOD.

  METHOD ignores_packages.
    DATA lv_exp TYPE zcl_fo_weight=>ty_weight VALUE '100'.
    DATA(lt_items) = VALUE zcl_fo_weight=>ty_items(
      ( item_id = '10' item_cat = 'PKG' gro_wei_val = '120' gro_wei_uni = 'KG' )
      ( item_id = '20' item_cat = 'PRD' gro_wei_val = '100' gro_wei_uni = 'KG' ) ).
    cl_abap_unit_assert=>assert_equals(
      act = mo_cut->get_total_weight_kg( lt_items )
      exp = lv_exp
      msg = 'Package items (PKG) must not be counted' ).
  ENDMETHOD.

  METHOD converts_pounds_to_kg.
    DATA lv_exp TYPE zcl_fo_weight=>ty_weight VALUE '14.536'.
    DATA(lt_items) = VALUE zcl_fo_weight=>ty_items(
      ( item_id = '10' item_cat = 'PRD' gro_wei_val = '10' gro_wei_uni = 'LB' )
      ( item_id = '20' item_cat = 'PRD' gro_wei_val = '10' gro_wei_uni = 'KG' ) ).
    cl_abap_unit_assert=>assert_equals(
      act = mo_cut->get_total_weight_kg( lt_items )
      exp = lv_exp
      msg = 'Weights in LB must be converted to KG' ).
  ENDMETHOD.
ENDCLASS.
