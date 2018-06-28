const writeFile = (filePath, data) => new Promise((resolve, reject) => {
  window.electronFS.writeFile(filePath, data, (err) => {
    if (err) reject(err);
    else resolve();
  });
});
const readFile = filePath => new Promise((resolve, reject) => {
  window.electronFS.readFile(filePath, (err, data) => {
    if (err) reject(err);
    else resolve(data);
  });
});
let JsonObj = null;
export async function getConfig(type) {
  try {
    const data = await readFile(window.dirname + "/../config.json");
    JsonObj = JSON.parse(data);
    return JsonObj[type];
  }
  catch (E) {
    console.log(E);
  }
  return null;
}
export async function updateConfig(type, value) {
  try {
    const filename = window.dirname + "/../config.json";
    const data = await readFile(filename);
    JsonObj = JSON.parse(data);
    JsonObj[type] = value;
    await writeFile(filename, JSON.stringify(JsonObj));
  }
  catch (E) {
    console.log(E);
  }
  return null;
}
export async function updateProfileConfig(value) {
  await updateConfig("prfldb", value);
}
export default async function getProfileConfig() {
  const d = await getConfig("prfldb");
  return d;
}
