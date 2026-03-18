import dotenv from "dotenv";
dotenv.config();
const token = process.env.GITLAB_TOKEN;

async function run() {
  const projectName = `test-merge-${Date.now()}`;
  const createRes = await fetch("https://gitlab.com/api/v4/projects", {
    method: "POST",
    headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
    body: JSON.stringify({ 
      name: projectName, 
      visibility: "private", 
      default_branch: "primary",
      merge_method: "merge"
    })
  });
  const project = await createRes.json();
  if (!createRes.ok) {
    console.error("Failed to create project:", project);
    return;
  }
  const projectId = project.id;
  console.log("Created project", projectId);

  // Initial commit
  await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits`, {
    method: "POST",
    headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
    body: JSON.stringify({ branch: "primary", commit_message: "Initial", actions: [{ action: "create", file_path: "README.md", content: "Hello" }] })
  });

  // Branch A
  await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/branches?branch=prjA&ref=primary`, { method: "POST", headers: { "PRIVATE-TOKEN": token } });

  // Commit A
  await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits`, {
    method: "POST",
    headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
    body: JSON.stringify({ branch: "prjA", commit_message: "Commit A", actions: [{ action: "create", file_path: "A.txt", content: "A" }] })
  });

  // Merge A to primary
  const mrRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/merge_requests`, {
    method: "POST",
    headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
    body: JSON.stringify({ source_branch: "prjA", target_branch: "primary", title: "Merge A" })
  });
  const mr = await mrRes.json();
  
  await fetch(`https://gitlab.com/api/v4/projects/${projectId}/merge_requests/${mr.iid}/merge`, {
    method: "PUT",
    headers: { "PRIVATE-TOKEN": token }
  });

  // Check commits
  const commitsRes = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits?all=true`, { headers: { "PRIVATE-TOKEN": token } });
  const commits = await commitsRes.json();
  console.log(commits.map(c => `${c.id.substring(0, 7)} ${c.parent_ids.map(p => p.substring(0, 7)).join(',')} ${c.title}`));
}
run();
