import { useEffect, useState } from "@nebula.js/stardust";

import { createRoot, type Root } from "react-dom/client";

const useReactElement = (element: HTMLElement, className: string) => {
  const [child, setChild] = useState<Root | undefined>(undefined);

  useEffect(() => {
    if (element.getElementsByClassName(className).length === 0) {
      const div = document.createElement("div");
      div.className = className;
      element.appendChild(div);
      const reactNode = createRoot(div);
      setChild(reactNode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element]);
  return child;
};

export default useReactElement;