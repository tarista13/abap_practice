CLASS cx_aunit_failure DEFINITION PUBLIC INHERITING FROM cx_no_check CREATE PUBLIC.
  PUBLIC SECTION.
    DATA msg TYPE string.
    METHODS constructor IMPORTING msg TYPE string OPTIONAL.
    METHODS get_text REDEFINITION.
ENDCLASS.

CLASS cx_aunit_failure IMPLEMENTATION.
  METHOD constructor.
    super->constructor( ).
    me->msg = msg.
  ENDMETHOD.

  METHOD get_text.
    result = msg.
  ENDMETHOD.
ENDCLASS.
