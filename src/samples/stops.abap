REPORT zstops.

" A structure type describing one stop of a freight order
TYPES: BEGIN OF ty_stop,
         seq      TYPE i,
         location TYPE string,
         stop_cat TYPE c LENGTH 1, " O = outbound, I = inbound
       END OF ty_stop.

" An internal table holds many rows of a structure
DATA lt_stops TYPE STANDARD TABLE OF ty_stop WITH EMPTY KEY.

lt_stops = VALUE #(
  ( seq = 30 location = 'Customer DC Chicago' stop_cat = 'I' )
  ( seq = 10 location = 'Plant Grand Rapids'  stop_cat = 'O' )
  ( seq = 20 location = 'Hub Detroit'         stop_cat = 'I' ) ).

SORT lt_stops BY seq.

WRITE / |The freight order has { lines( lt_stops ) } stops:|.
LOOP AT lt_stops INTO DATA(ls_stop).
  WRITE / |  { ls_stop-seq }: { ls_stop-location } ({ ls_stop-stop_cat })|.
ENDLOOP.

" Read a single row by key
READ TABLE lt_stops INTO ls_stop WITH KEY seq = 20.
IF sy-subrc = 0.
  WRITE / |Stop 20 is { ls_stop-location }.|.
ENDIF.

" Table expressions are the modern alternative to READ TABLE
WRITE / |First stop: { lt_stops[ 1 ]-location }|.
