CLASS cx_sy_zerodivide DEFINITION PUBLIC INHERITING FROM cx_sy_arithmetic_error CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS get_text REDEFINITION.
ENDCLASS.

CLASS cx_sy_zerodivide IMPLEMENTATION.
  METHOD get_text.
    result = |Division by zero|.
  ENDMETHOD.
ENDCLASS.
