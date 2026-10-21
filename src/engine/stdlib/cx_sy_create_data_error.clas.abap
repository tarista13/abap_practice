CLASS cx_sy_create_data_error DEFINITION PUBLIC INHERITING FROM cx_dynamic_check CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS get_text REDEFINITION.
ENDCLASS.

CLASS cx_sy_create_data_error IMPLEMENTATION.
  METHOD get_text.
    result = |CREATE DATA failed|.
  ENDMETHOD.
ENDCLASS.
