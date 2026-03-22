import type { NodeTypes } from "reactflow";
import TextInputNode from "./TextInputNode";
import ResultNode from "./ResultNode";

export const nodeTypes: NodeTypes = {
  textInput: TextInputNode,
  result: ResultNode,
};
