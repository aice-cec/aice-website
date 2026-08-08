import formsFallback from "@/data/forms.json";
import fs from "fs";
import path from "path";

const formsFilePath = path.join(process.cwd(), "data", "forms.json");

export function getLocalForms(): any[] {
  try {
    if (fs.existsSync(formsFilePath)) {
      return JSON.parse(fs.readFileSync(formsFilePath, "utf8"));
    }
  } catch {}
  return formsFallback as any[];
}
