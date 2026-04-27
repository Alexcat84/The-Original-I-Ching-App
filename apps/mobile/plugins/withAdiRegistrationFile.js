const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("node:fs");
const path = require("node:path");

function withAdiRegistrationFile(config, props = {}) {
  return withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const token = (props.token || "").trim();
      if (!token) {
        // Keep builds working when verification token is not needed.
        return modConfig;
      }

      const projectRoot = modConfig.modRequest.projectRoot;
      const assetsDir = path.join(projectRoot, "android", "app", "src", "main", "assets");
      const tokenFilePath = path.join(assetsDir, "adi-registration.properties");

      fs.mkdirSync(assetsDir, { recursive: true });
      fs.writeFileSync(tokenFilePath, `${token}\n`, "utf8");

      return modConfig;
    },
  ]);
}

module.exports = withAdiRegistrationFile;
