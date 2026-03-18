global.window = { setTimeout: setTimeout, clearTimeout: clearTimeout };
import { GitgraphCore } from "@gitgraph/core";
const core = new GitgraphCore();
const api = core.getUserApi();

const commits = [
  {
    hash: "c0",
    parents: [],
    subject: "Initial commit",
    refs: [],
    author: { name: "Test", email: "test@example.com" }
  },
  {
    hash: "c1",
    parents: ["c0"],
    subject: "prjA commit 1",
    refs: [],
    author: { name: "Test", email: "test@example.com" }
  },
  {
    hash: "c2",
    parents: ["c0"],
    subject: "prjB commit 1",
    refs: [],
    author: { name: "Test", email: "test@example.com" }
  },
  {
    hash: "c3",
    parents: ["c1"],
    subject: "prjA commit 2",
    refs: ["prjA"],
    author: { name: "Test", email: "test@example.com" }
  },
  {
    hash: "c4",
    parents: ["c2"],
    subject: "prjB commit 2",
    refs: ["prjB"],
    author: { name: "Test", email: "test@example.com" }
  },
  {
    hash: "c5",
    parents: ["c3", "c4"],
    subject: "Merge prjB into prjA",
    refs: ["primary"],
    author: { name: "Test", email: "test@example.com" }
  }
];

api.import(commits.reverse());

console.log(core.commits.map(c => c.subject + " - " + (c.branches ? Array.from(c.branches).join(",") : "")));
