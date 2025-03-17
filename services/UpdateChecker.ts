export async function checkForUpdates(currentVersion: string) {
  try {
    const response = await fetch(
      "https://api.github.com/repos/0xarchit/CodeArc/releases/latest"
    );
    const latestRelease = await response.json();
    const latestVersion = latestRelease.tag_name;
    if (latestVersion && latestVersion !== currentVersion) {
      return {
        hasUpdate: true,
        updateUrl: latestRelease.html_url,
        version: latestVersion,
      };
    }
  } catch (err) {
    console.error("Error checking updates:", err);
  }
  return { hasUpdate: false };
}
