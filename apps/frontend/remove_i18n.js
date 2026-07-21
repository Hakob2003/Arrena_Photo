const fs = require("fs");
let code = fs.readFileSync("apps/frontend/app/admin/users/page.tsx", "utf8");

// Remove import
code = code.replace(/import \{ useTranslation \} from 'react-i18next';\n/, "");

// Remove hook
code = code.replace(/  const \{ t \} = useTranslation\(\);\n/, "");

// Replace t("key", "Default text") with "Default text"
code = code.replace(/t\([^,]+,\s*"([^"]+)"\)/g, '"$1"');

// Replace {"Default text"} with "Default text" if outside tags, or keep it inside.
// Actually just replace {t("key", "Default text")} with "Default text"
code = code.replace(/\{t\([^,]+,\s*"([^"]+)"\)\}/g, '"$1"');

fs.writeFileSync("apps/frontend/app/admin/users/page.tsx", code);
