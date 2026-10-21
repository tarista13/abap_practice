import hello from "./hello.abap?raw";
import stops from "./stops.abap?raw";
import classes from "./classes.abap?raw";
import exceptions from "./exceptions.abap?raw";
import select from "./select.abap?raw";

export interface Sample {
  id: string;
  title: string;
  code: string;
}

export const samples: Sample[] = [
  { id: "hello", title: "Hello, variables & IF", code: hello },
  { id: "stops", title: "Internal tables: freight order stops", code: stops },
  { id: "classes", title: "Classes: a freight order object", code: classes },
  { id: "exceptions", title: "Exceptions: TRY / CATCH", code: exceptions },
  { id: "select", title: "Database: SELECT freight orders", code: select },
];
