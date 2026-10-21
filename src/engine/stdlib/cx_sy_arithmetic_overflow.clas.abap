CLASS cx_sy_arithmetic_overflow DEFINITION PUBLIC INHERITING FROM cx_sy_arithmetic_error CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS get_text REDEFINITION.
ENDCLASS.

CLASS cx_sy_arithmetic_overflow IMPLEMENTATION.
  METHOD get_text.
    result = |Arithmetic overflow|.
  ENDMETHOD.
ENDCLASS.
