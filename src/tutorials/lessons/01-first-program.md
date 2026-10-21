# Your first ABAP program

ABAP (Advanced Business Application Programming) is the language SAP's business applications are written in, including SAP Transportation Management (TM). Every freight order, carrier selection and charge calculation you see in TM ends up running ABAP code.

In this course you write real ABAP right in the browser. Every code box on these pages is a small editor: change the code, then click **Run** (or press **Ctrl+Enter**) to see what it does.

## Hello, ABAP

```abap
REPORT zhello.

WRITE 'Hello, SAP TM!'.
```

Two things to notice:

- `REPORT zhello.` names the program. Programs you write yourself start with **Z** (or **Y**); SAP reserves the other letters for its own code. In these small examples you can leave the `REPORT` line out.
- `WRITE` prints text to the output. Text in single quotes `'...'` is a **text literal**.

## Every statement ends with a period

An ABAP program is a list of **statements**, and every statement ends with a period `.` — forgetting it is the most common beginner mistake. Line breaks and extra spaces don't matter, and ABAP doesn't care about upper or lower case in keywords: `WRITE`, `write` and `Write` are the same.

Use `/` to start a new line in the output:

```abap
WRITE / 'Freight order 6100000101'.
WRITE / 'Carrier: CARRIER_A'.
write /
  'Status: In process'.
```

## Comments

Comments explain your code to other people. ABAP has two kinds:

- A `*` in the **first column** turns the whole line into a comment.
- A `"` turns the rest of the line into a comment.

```abap
* This whole line is a comment
WRITE / 'Loading at plant'. " and this is a comment at the end of a line
" WRITE / 'This line does not run'.
```

## Chained statements

When several statements start with the same keyword, you can write the keyword once, followed by a colon `:`, and separate the parts with commas. This is called a **chain**:

```abap
WRITE: / 'Stop 1: PLANT_GRR',
       / 'Stop 2: HUB_DTW',
       / 'Stop 3: DC_CHI'.
```

> **Try breaking things.** Delete a period in one of the examples above and click Run. The red underline and the message tell you exactly where the problem is. Reading these messages is a skill worth practicing.

## Exercise

Make the program below print the three lines shown under **Show expected output**. Click **Run** to check your answer.

```abap exercise
WRITE / 'Freight order 6100000104'.
--- solution ---
WRITE / 'Freight order 6100000104'.
WRITE / 'From: PLANT_ATH'.
WRITE / 'To: DC_MSP'.
--- expected ---
Freight order 6100000104
From: PLANT_ATH
To: DC_MSP
```
