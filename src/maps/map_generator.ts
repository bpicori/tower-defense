import { GridPosition } from "../utils/helper";
import map1 from "./map1.json";

export const mapGenerator = (map: string): GridPosition[] => {
  switch (map) {
    case "1":
      return map1;
    default:
      return map1;
  }
};
