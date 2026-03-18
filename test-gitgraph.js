import { GitgraphCore } from "@gitgraph/core";
const core = new GitgraphCore();
const api = core.getUserApi();
console.log(api.import.toString());
