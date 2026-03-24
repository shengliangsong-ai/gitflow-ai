import { execSync } from "child_process";
try {
  console.log(execSync("git --version").toString());
} catch (e) {
  console.error(e);
}
