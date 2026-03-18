global.window = { setTimeout: setTimeout, clearTimeout: clearTimeout };
import { GitgraphCore } from "@gitgraph/core";
const core = new GitgraphCore();
const api = core.getUserApi();
api.import([
  {
    "refs": ["master", "feature"],
    "hash": "2",
    "parents": ["1"],
    "subject": "Feature commit",
    "author": { "name": "John", "email": "j@d.com" }
  },
  {
    "refs": [],
    "hash": "1",
    "parents": ["0"],
    "subject": "Master commit",
    "author": { "name": "John", "email": "j@d.com" }
  },
  {
    "refs": [],
    "hash": "0",
    "parents": [],
    "subject": "Initial commit",
    "author": { "name": "John", "email": "j@d.com" }
  }
]);
console.log(core.commits.map(c => c.subject + " - " + (c.branches ? Array.from(c.branches).join(",") : "")));
