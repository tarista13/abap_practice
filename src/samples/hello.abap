REPORT zhello.

" Declare variables with DATA. Each one has a type.
DATA lv_name TYPE string VALUE 'SAP TM'.
DATA lv_stops TYPE i VALUE 3.

" WRITE prints to the output. "/" starts a new line.
WRITE / 'Hello from ABAP!'.
WRITE / |Welcome to { lv_name }.|.

lv_stops = lv_stops + 2.
WRITE / |This route has { lv_stops } stops.|.

IF lv_stops > 4.
  WRITE / 'That is a long route.'.
ELSE.
  WRITE / 'That is a short route.'.
ENDIF.
