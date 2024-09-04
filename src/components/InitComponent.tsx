import { Box, Button } from "@mui/material";
import { stardust } from "@nebula.js/stardust";
import React, { useState } from "react";
import type { Models } from "../types";
import AutoMLExpressionComponent from "./AutoMLComponent";

export interface InitComponentProps {
  models: Models;
  translator: stardust.Translator;
}

const InitComponent = ({ models, translator }: InitComponentProps) => {
  const { app } = models;
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{height: "100%"}} position="relative">
      <AutoMLExpressionComponent app={app} translator={translator} open={open} setOpen={setOpen}></AutoMLExpressionComponent>
    </Box>
  );
};

export default InitComponent;
