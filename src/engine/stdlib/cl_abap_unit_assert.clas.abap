CLASS cl_abap_unit_assert DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    CLASS-METHODS assert_equals
      IMPORTING
        act  TYPE any
        exp  TYPE any
        msg  TYPE csequence OPTIONAL
        quit TYPE i OPTIONAL.
    CLASS-METHODS assert_differs
      IMPORTING
        act  TYPE any
        exp  TYPE any
        msg  TYPE csequence OPTIONAL
        quit TYPE i OPTIONAL.
    CLASS-METHODS assert_true
      IMPORTING
        act  TYPE abap_bool
        msg  TYPE csequence OPTIONAL
        quit TYPE i OPTIONAL.
    CLASS-METHODS assert_false
      IMPORTING
        act  TYPE abap_bool
        msg  TYPE csequence OPTIONAL
        quit TYPE i OPTIONAL.
    CLASS-METHODS assert_initial
      IMPORTING
        act  TYPE any
        msg  TYPE csequence OPTIONAL
        quit TYPE i OPTIONAL.
    CLASS-METHODS assert_not_initial
      IMPORTING
        act  TYPE any
        msg  TYPE csequence OPTIONAL
        quit TYPE i OPTIONAL.
    CLASS-METHODS assert_bound
      IMPORTING
        act  TYPE any
        msg  TYPE csequence OPTIONAL
        quit TYPE i OPTIONAL.
    CLASS-METHODS fail
      IMPORTING
        msg  TYPE csequence OPTIONAL
        quit TYPE i OPTIONAL.
  PRIVATE SECTION.
    CLASS-METHODS describe
      IMPORTING val           TYPE any
      RETURNING VALUE(result) TYPE string.
    CLASS-METHODS raise
      IMPORTING msg     TYPE csequence OPTIONAL
                default TYPE string.
ENDCLASS.

CLASS cl_abap_unit_assert IMPLEMENTATION.
  METHOD assert_equals.
    IF act <> exp.
      raise( msg = msg default = |Expected { describe( exp ) } but got { describe( act ) }| ).
    ENDIF.
  ENDMETHOD.

  METHOD assert_differs.
    IF act = exp.
      raise( msg = msg default = |Expected a value different from { describe( exp ) }| ).
    ENDIF.
  ENDMETHOD.

  METHOD assert_true.
    IF act <> abap_true.
      raise( msg = msg default = |Expected true but got false| ).
    ENDIF.
  ENDMETHOD.

  METHOD assert_false.
    IF act = abap_true.
      raise( msg = msg default = |Expected false but got true| ).
    ENDIF.
  ENDMETHOD.

  METHOD assert_initial.
    IF act IS NOT INITIAL.
      raise( msg = msg default = |Expected an initial value but got { describe( act ) }| ).
    ENDIF.
  ENDMETHOD.

  METHOD assert_not_initial.
    IF act IS INITIAL.
      raise( msg = msg default = |Expected a non-initial value| ).
    ENDIF.
  ENDMETHOD.

  METHOD assert_bound.
    IF act IS NOT BOUND.
      raise( msg = msg default = |Expected the reference to be bound| ).
    ENDIF.
  ENDMETHOD.

  METHOD fail.
    raise( msg = msg default = |Test failed| ).
  ENDMETHOD.

  METHOD describe.
    DATA lv_kind TYPE c LENGTH 1.
    DATA lv_row_kind TYPE c LENGTH 1.
    DATA lv_rows TYPE string.
    FIELD-SYMBOLS <lt_table> TYPE ANY TABLE.
    FIELD-SYMBOLS <lv_row> TYPE any.
    DESCRIBE FIELD val TYPE lv_kind.
    CASE lv_kind.
      WHEN 'h'.
        ASSIGN val TO <lt_table>.
        IF lines( <lt_table> ) = 0.
          result = |an empty table|.
          RETURN.
        ENDIF.
        " list the lines of small tables of simple values, e.g. [6100000101, 6100000102]
        LOOP AT <lt_table> ASSIGNING <lv_row>.
          DESCRIBE FIELD <lv_row> TYPE lv_row_kind.
          IF lv_row_kind CA 'huvrl' OR sy-tabix > 10.
            result = |a table with { lines( <lt_table> ) } line(s)|.
            RETURN.
          ENDIF.
          IF lv_rows IS INITIAL.
            lv_rows = |{ <lv_row> }|.
          ELSE.
            lv_rows = |{ lv_rows }, { <lv_row> }|.
          ENDIF.
        ENDLOOP.
        result = |[{ lv_rows }]|.
      WHEN 'u' OR 'v'.
        result = |a structure|.
      WHEN 'r' OR 'l'.
        result = |a reference|.
      WHEN OTHERS.
        result = |"{ val }"|.
    ENDCASE.
  ENDMETHOD.

  METHOD raise.
    DATA lv_text TYPE string.
    IF msg IS INITIAL.
      lv_text = default.
    ELSE.
      lv_text = |{ msg } ({ default })|.
    ENDIF.
    RAISE EXCEPTION TYPE cx_aunit_failure EXPORTING msg = lv_text.
  ENDMETHOD.
ENDCLASS.
