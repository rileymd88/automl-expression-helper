import { ThemeProvider } from "@mui/material/styles";
import { useEffect, useOptions } from "@nebula.js/stardust";
import React from "react";
import type { Root } from "react-dom/client";
import InitComponent, { type InitComponentProps } from "../components/InitComponent";
import muiSetup from "../components/mui-setup";
import type { Options } from "../types";

interface Props extends InitComponentProps {
  element: Root | undefined;
}
const useInitComponent = ({ element, translator, models }: Props) => {
  const { layout } = models;
  const options = useOptions() as Options;
  const muiTheme = muiSetup(options.direction);
  useEffect(() => {
    element?.render(
      <ThemeProvider theme={muiTheme}>
        <InitComponent models={models} translator={translator} />
      </ThemeProvider>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, layout, models]);
};

export default useInitComponent;