import { createTheme, type Direction } from "@mui/material/styles";
import theme from "@qlik-trial/sprout/theme/theme";

export default function muiSetup(direction: Direction | undefined) {
  return createTheme({ ...theme("light"), direction });
}