CLASS cx_sy_conversion_no_number DEFINITION PUBLIC INHERITING FROM cx_sy_conversion_error CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS get_text REDEFINITION.
ENDCLASS.

CLASS cx_sy_conversion_no_number IMPLEMENTATION.
  METHOD get_text.
    result = |Value cannot be interpreted as a number|.
  ENDMETHOD.
ENDCLASS.
