CLASS cx_sy_range_out_of_bounds DEFINITION PUBLIC INHERITING FROM cx_dynamic_check CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS get_text REDEFINITION.
ENDCLASS.

CLASS cx_sy_range_out_of_bounds IMPLEMENTATION.
  METHOD get_text.
    result = |Offset or length out of bounds|.
  ENDMETHOD.
ENDCLASS.
