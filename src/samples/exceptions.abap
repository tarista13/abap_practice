REPORT zexceptions.

DATA lv_capacity TYPE i VALUE 0.
DATA lv_load TYPE i VALUE 500.
DATA lv_ratio TYPE i.
DATA lx_error TYPE REF TO cx_root.

TRY.
    lv_ratio = lv_load / lv_capacity.
    WRITE / |Utilization: { lv_ratio }|.
  CATCH cx_sy_zerodivide INTO lx_error.
    WRITE / |Caught: { lx_error->get_text( ) }|.
ENDTRY.

" Reading a table line that does not exist raises CX_SY_ITAB_LINE_NOT_FOUND
DATA lt_locations TYPE STANDARD TABLE OF string WITH EMPTY KEY.
APPEND 'Grand Rapids' TO lt_locations.

TRY.
    WRITE / lt_locations[ 5 ].
  CATCH cx_sy_itab_line_not_found INTO lx_error.
    WRITE / |Caught: { lx_error->get_text( ) }|.
ENDTRY.
