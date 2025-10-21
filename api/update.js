import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nama, comment } = req.body;

  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.APP_ID,
      privateKey: process.env.PRIVATE_KEY,
      installationId: process.env.INSTALLATION_ID,
    },
  });

  try {
    const { data: file } = await octokit.repos.getContent({
      owner: "cdndc",
      repo: "cdndc.github.io",
      path: "data.json",
    });

    const json = JSON.parse(Buffer.from(file.content, "base64").toString());
    json.nama = nama;
    json.comment = comment;

    await octokit.repos.createOrUpdateFileContents({
      owner: "cdndc",
      repo: "cdndc.github.io",
      path: "data.json",
      message: `Update comment from ${nama}`,
      content: Buffer.from(JSON.stringify(json, null, 2)).toString("base64"),
      sha: file.sha,
    });

    res.status(200).json({ success: true, message: "✅ Comment updated!" });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
}
