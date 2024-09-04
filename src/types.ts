import { stardust } from "@nebula.js/stardust";
import type { EventEmitter } from "node:events";

export type Options = {
  direction: "ltr" | "rtl";
}

export interface Models {
  element: HTMLElement;
  app?: EngineAPI.IApp;
  layout: EngineAPI.IGenericObjectLayout;
  model?: EngineAPI.IGenericObject;
  embed: stardust.Embed;
  emitter: EventEmitter;
  interactions: stardust.Interactions;
  rect: stardust.Rect;
  theme: stardust.Theme;
}

export interface ComponentProps {
  props: EngineAPI.IGenericObjectLayout;
  app: EngineAPI.IApp | undefined;
  rect: stardust.Rect;
}

export type Field = {
  field: string;
  expression: string;
}

export type Model = {
  id: string;
  name: string;
}

export type Props = {
  fields: Field[],
  model: string;
}

export interface Layout extends EngineAPI.IGenericObjectLayout {
  props: Props
}

export type VariableModel = {
  id: string;
  getLayout: (i?: boolean | Variable[]) => Promise<Variable[]>;
  Invalidated: {
    bind: (f: () => Promise<void>) => void;
    unbind: (f: () => Promise<void>) => void;
  };
  getProperties(): Promise<Variable>;
  setProperties(variable: CreateVariableEx): Promise<void>;
};

export type VariableObject = {
  getLayout: () => Promise<Variable>;
};

export type Variable = {
  qName: string;
  qDefinition: string;
  qDescription?: string;
  qIsReserved: boolean;
  qIsConfig: boolean;
  qData: {
    tags: string | string[];
  };
  qInfo: {
    qId: string;
    qType: string;
  };
  qIsScriptCreated?: boolean;
  qMeta: {
    privileges: 'read' | 'update' | 'delete' | 'exportdata';
  };
  qNum?: number;
  qText?: string;
};

export type CreateVariableEx = {
  qInfo: { qType: string };
  qName: string;
  qDefinition: string;
  qComment: string;
  tags: string[];
};

export type Expression = string | { qExpr: string };

type ExpressionDialogNotUsed = (expression: string) => void;
type ExpressionDialogWasUsed = (expression: { qExpr: string }) => void;

export type ExpressionCallback = ExpressionDialogNotUsed | ExpressionDialogWasUsed;

export type Feature = {
  name: string;
  expression: string;
  type: "Categorical" | "Number";
};

export type AutoMLConnection = {
  id: string;
  name: string;
  deploymentId: string;
  deplyomentName: string;
  spaceId: string;
};

export type Target = {
  type: "binary" | "multiclass" | "regression";
  field: string;
};
