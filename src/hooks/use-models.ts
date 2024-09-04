import {
    useApp,
    useEffect,
    useElement,
    useEmbed,
    useEmitter,
    useInteractionState,
    useLayout,
    useModel,
    useRect,
    useState,
    useTheme,
  } from "@nebula.js/stardust";
  import { EventEmitter } from "node:events";
  import type { Layout } from "../types";
  import type { Models } from "../types";
  
  const useModels = () => {
    const element = useElement();
    const app = useApp();
    const layout = useLayout();
    const embed = useEmbed();
    const model = useModel();
    const emitter = useEmitter() as EventEmitter;
    const interactions = useInteractionState();
    const rect = useRect();
    const theme = useTheme();
  
    const createModels = () => ({
      element,
      app,
      layout: layout as Layout,
      embed,
      model,
      emitter,
      interactions,
      rect,
      theme,
    });
    const [models, setModels] = useState<Models>(createModels());
  
    useEffect(() => {
      setModels(createModels());
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [element, theme, layout, embed, model, app, emitter, interactions]);
    return models;
  };
  
  export default useModels;