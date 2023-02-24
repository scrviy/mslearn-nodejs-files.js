const fs = require("fs").promises;
const path = require("path");

async function calculateSalesTotal(salesFiles)
{
  let salesTotal = 0;

  for (file of salesFiles) {
    const data = JSON.parse(await fs.readFile(file));
    salesTotal += data.total;
  }
  return salesTotal;
}

async function findSalesFiles(folderName) {
  let salesFiles = [];

  async function findFiles(folderName) {
    const items = await fs.readdir(folderName, { withFileTypes: true });

    for (item of items) {
      if (item.isDirectory()) {
        await findFiles(path.join(folderName, item.name));
      } else {
        if (path.extname(item.name) === ".json") {
          salesFiles.push(path.join(folderName, item.name));
        }
      }
    }
  }

  await findFiles(folderName);

  return salesFiles;
}

async function main() {
  const salesDir = path.join(__dirname, "stores");
  const salesTotalsDir = path.join(__dirname, "salesTotals");

  try {
    await fs.mkdir(salesTotalsDir);
  } catch {
    console.log(`${salesTotalsDir} already exists.`);
  }

  const salesFiles = await findSalesFiles(salesDir);

  const salesTotal = await calculateSalesTotal(salesFiles);

  await fs.writeFile(
    path.join(salesTotalsDir, "totals.txt"),
    `${salesTotal}\r\n`,
    { flag: "a" }
  );
  console.log(`Wrote sales totals to ${salesTotalsDir}`);
}

main();