import {
  stardust,
  useElement,
  useTranslator,
  useApp
} from "@nebula.js/stardust";
import properties from "./object-properties";
import data from "./data";
import ext from "./ext";
import useInitComponent from "./hooks/use-init-component";
import useModels from "./hooks/use-models";
import useReactElement from "./hooks/use-react-elements";
import './index.css';
/**
 * Entrypoint for your sense visualization
 * @param {object} galaxy Contains global settings from the environment.
 * Useful for cases when stardust hooks are unavailable (ie: outside the component function)
 * @param {object} galaxy.anything Extra environment dependent options
 * @param {object=} galaxy.anything.sense Optional object only present within Sense,
 * see: https://qlik.dev/libraries-and-tools/nebulajs/in-qlik-sense
 */

export default function supernova(galaxy: stardust.Galaxy) {
  const {
    flags,
    translator,
    anything,
  } = galaxy;
  return {
    qae: {
      properties,
      data,
    },
    ext: ext(),
    component() {
      const element = useElement();
      const translator = useTranslator();
      const models = useModels();
      useInitComponent({ element: useReactElement(element, "init-component"), translator, models });
    },
  };
}
