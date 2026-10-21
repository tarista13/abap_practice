CLASS cx_sy_conversion_error DEFINITION PUBLIC INHERITING FROM cx_dynamic_check CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS get_text REDEFINITION.
ENDCLASS.

CLASS cx_sy_conversion_error IMPLEMENTATION.
  METHOD get_text.
    result = |Conversion error|.
  ENDMETHOD.
ENDCLASS.
