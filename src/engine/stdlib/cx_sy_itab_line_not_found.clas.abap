CLASS cx_sy_itab_line_not_found DEFINITION PUBLIC INHERITING FROM cx_dynamic_check CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS get_text REDEFINITION.
ENDCLASS.

CLASS cx_sy_itab_line_not_found IMPLEMENTATION.
  METHOD get_text.
    result = |Table line not found|.
  ENDMETHOD.
ENDCLASS.
