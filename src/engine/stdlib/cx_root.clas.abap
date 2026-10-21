CLASS cx_root DEFINITION PUBLIC ABSTRACT CREATE PUBLIC.
  PUBLIC SECTION.
    DATA textid TYPE c LENGTH 32.
    DATA previous TYPE REF TO cx_root.
    METHODS constructor
      IMPORTING
        textid   LIKE textid OPTIONAL
        previous TYPE REF TO cx_root OPTIONAL.
    METHODS get_text RETURNING VALUE(result) TYPE string.
ENDCLASS.

CLASS cx_root IMPLEMENTATION.
  METHOD constructor.
    me->textid = textid.
    me->previous = previous.
  ENDMETHOD.

  METHOD get_text.
    result = |An exception was raised|.
  ENDMETHOD.
ENDCLASS.
