const token = process.env.GITLAB_TOKEN;
async function run() {
  const createRes = await fetch("https://gitlab.com/api/v4/projects", {
    method: "POST",
    headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "test-merge-" + Date.now(), visibility: "private" })
  });
  const project = await createRes.json();
  console.log("Project merge_method:", project.merge_method);
}
run();
