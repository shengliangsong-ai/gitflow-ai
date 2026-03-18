global.window = { setTimeout: setTimeout, clearTimeout: clearTimeout };
import { GitgraphCore } from "@gitgraph/core";
const core = new GitgraphCore();
const api = core.getUserApi();
api.import([
  {
    "hash": "c5",
    "parents": ["c3", "c4"],
    "subject": "Merge prjB",
    "refs": ["primary"],
    "author": { "name": "John", "email": "j@d.com" }
  },
  {
    "hash": "c4",
    "parents": ["c2"],
    "subject": "prjB commit 2",
    "refs": ["prjB"],
    "author": { "name": "John", "email": "j@d.com" }
  },
  {
    "hash": "c3",
    "parents": ["c1"],
    "subject": "prjA commit 2",
    "refs": ["prjA"],
    "author": { "name": "John", "email": "j@d.com" }
  },
  {
    "hash": "c2",
    "parents": ["c0"],
    "subject": "prjB commit 1",
    "refs": [],
    "author": { "name": "John", "email": "j@d.com" }
  },
  {
    "hash": "c1",
    "parents": ["c0"],
    "subject": "prjA commit 1",
    "refs": [],
    "author": { "name": "John", "email": "j@d.com" }
  },
  {
    "hash": "c0",
    "parents": [],
    "subject": "Initial commit",
    "refs": [],
    "author": { "name": "John", "email": "j@d.com" }
  }
]);
console.log(core.commits.map(c => c.subject + " - " + (c.branches ? Array.from(c.branches).join(",") : "")));
