CLASS cx_sy_ref_is_initial DEFINITION PUBLIC INHERITING FROM cx_dynamic_check CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS get_text REDEFINITION.
ENDCLASS.

CLASS cx_sy_ref_is_initial IMPLEMENTATION.
  METHOD get_text.
    result = |Dereferencing an initial (null) reference|.
  ENDMETHOD.
ENDCLASS.
