CLASS cx_sy_move_cast_error DEFINITION PUBLIC INHERITING FROM cx_dynamic_check CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS get_text REDEFINITION.
ENDCLASS.

CLASS cx_sy_move_cast_error IMPLEMENTATION.
  METHOD get_text.
    result = |Cast error: object is not of the expected type|.
  ENDMETHOD.
ENDCLASS.
