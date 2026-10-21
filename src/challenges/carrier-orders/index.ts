import type { Challenge } from "../types";
import starter from "./starter.abap?raw";
import solution from "./solution.abap?raw";
import tests from "./tests.abap?raw";

export const carrierOrders: Challenge = {
  id: "carrier-orders",
  title: "Open orders per carrier",
  level: "Intermediate",
  topics: ["SELECT", "SELECT SINGLE", "COUNT(*)", "sy-subrc"],
  className: "zcl_carrier_orders",
  usesDatabase: true,
  description: [
    "A dispatcher wants to see what each carrier still has to deliver. Answer their questions by reading the TM tables with ABAP SQL.",
    "Implement **get_open_orders** so that it returns the **TOR_ID** of every row in **/SCMTMS/D_TORROT** that:",
    "- belongs to the carrier **iv_carrier** (field **TSPID**),",
    "- is a freight order (**TOR_CAT** = **TO**), not a freight booking (**BO**),",
    "- is still open: **LIFECYCLE** is neither **05** (completed) nor **10** (canceled).",
    "Sort the result by **TOR_ID**.",
    "Implement **count_stops** so that it returns how many rows in **/SCMTMS/D_TORSTP** belong to the freight order **iv_tor_id**. Stops point to their order through **PARENT_KEY**, which holds the order's **DB_KEY** (not its TOR_ID). Return 0 if the order doesn't exist.",
    "Open **Database tables** below to see the data the tests run against.",
  ],
  starter,
  solution,
  tests,
};
