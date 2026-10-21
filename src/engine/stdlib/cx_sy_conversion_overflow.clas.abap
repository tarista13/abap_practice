CLASS cx_sy_conversion_overflow DEFINITION PUBLIC INHERITING FROM cx_sy_conversion_error CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS get_text REDEFINITION.
ENDCLASS.

CLASS cx_sy_conversion_overflow IMPLEMENTATION.
  METHOD get_text.
    result = |Overflow during conversion|.
  ENDMETHOD.
ENDCLASS.
