const sharp = require("sharp");
const templatesInfo = require("./templatesInfo.json");

function splitIntoColumns(memberList, charter) {
  const lines = memberList.split("\n");

  let fontSize;
  let maxColumns;
  if (lines.length < 40) {
    fontSize = 65;
    maxColumns = templatesInfo[charter].maxColumns;
  } else {
    fontSize = 40;
    maxColumns = templatesInfo[charter].maxColumns + 4;
  }

  const numColumns = Math.ceil(lines.length / maxColumns);

  let columns = Array.from({ length: numColumns }, () => []);

  lines.forEach((line, index) => {
    const columnIndex = index % numColumns;
    columns[columnIndex].push(line);
  });

  columns.sort((a, b) => b.length - a.length);

  const sortedColumns = [];
  while (columns.length) {
    sortedColumns.push(columns.shift());
    if (columns.length) {
      sortedColumns.unshift(columns.shift());
    }
  }

  sortedColumns.reverse();

  if (
    sortedColumns[0].length < sortedColumns[sortedColumns.length - 1].length
  ) {
    sortedColumns.reverse();
  }

  return { sortedColumns, fontSize };
}

function calculateCoordinates(numColumns, columnIndex, columns, charter) {
  let x, y, maxColumnWidth;
  if (numColumns == 2) {
    maxColumnWidth = 40 / columns.length;
    x = columnIndex * maxColumnWidth + maxColumnWidth / 2 + 30;
  } else if (numColumns == 3) {
    maxColumnWidth = 60 / columns.length;
    x = columnIndex * maxColumnWidth + maxColumnWidth / 2 + 20;
  } else if (numColumns == 4 || numColumns == 5) {
    maxColumnWidth = 80 / columns.length;
    x = columnIndex * maxColumnWidth + maxColumnWidth / 2 + 10;
  } else {
    maxColumnWidth = 90 / columns.length;
    x = columnIndex * maxColumnWidth + maxColumnWidth / 2 + 5;
  }

  const longestColumnLength = columns[Math.floor(numColumns / 2)].length;

  let base = templatesInfo[charter].alignment.memberList;

  if (longestColumnLength < 7) {
    y = base + 6;
  } else if (longestColumnLength == 8 || longestColumnLength == 9) {
    y = base + 4.5;
  } else if (longestColumnLength <= 10) {
    y = base + 3;
  } else if (longestColumnLength <= 14) {
    y = base + 0.75;
  } else {
    y = base + 0.5;
  }

  return { x, y };
}

function generateSvg(memberList, chapter, community, charter) {
  let svgText;
  if (memberList) {
    const { sortedColumns, fontSize } = splitIntoColumns(memberList, charter);
    const columns = sortedColumns;
    const numColumns = columns.length;

    svgText = `
  <svg width="${templatesInfo[charter].width}" height="${templatesInfo[charter].height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .memberList { fill: black; font-weight: light; font-family: 'Graphik'; font-size: ${fontSize}px; }
    .chapter { fill: black; font-weight: bold; font-family: 'Graphik'; font-size: 115px; }
    .community { fill: black; font-weight: light; font-family: 'Graphik'; font-size:80px; }
    .date { fill: black; font-weight: light; font-family: 'Graphik'; font-size: 50px; }
  </style>`;

    let spacing;
    if (fontSize == 40) {
      spacing = 1.2;
    } else {
      spacing = 1.7;
    }
    columns.forEach((column, columnIndex) => {
      const { x, y } = calculateCoordinates(
        numColumns,
        columnIndex,
        columns,
        charter
      );
      column.forEach((line, lineIndex) => {
        let currentLine = "";
        let dy = 0; // Initialize dy
        const words = line.split(" ");
        words.forEach((word, wordIndex) => {
          if ((currentLine + word).length <= 20) {
            currentLine += word + " ";
          } else {
            svgText += `<text x="${x}%" y="${
              y + lineIndex * 1.3
            }%" class="memberList" text-anchor="middle">${currentLine.trim()}</text>`;
            currentLine = word + " ";
            dy = 0;
          }
          if (wordIndex === words.length - 1 && currentLine.trim() !== "") {
            // Last word, add the remaining part
            svgText += `<text x="${x}%" y="${
              y + lineIndex * spacing
            }%" class="memberList" text-anchor="middle">${currentLine.trim()}</text>`;
          }
        });
      });
    });
  } else {
    svgText = `
    <svg width="${templatesInfo[charter].width}" height="${templatesInfo[charter].height}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .chapter { fill: black; font-weight: bold; font-family: 'Graphik'; font-size: 115px; }
      .community { fill: black; font-weight: light; font-family: 'Graphik'; font-size:80px; }
      .date { fill: black; font-weight: light; font-family: 'Graphik'; font-size: 50px; }
    </style>`;
  }

  const currentDate = new Date();
  const formattedDate = formatJewishDate(currentDate);

  svgText += `
  <text x="50%" y="${templatesInfo[charter].alignment.chapter}%" dominant-baseline="middle" text-anchor="middle" class="chapter">${chapter}</text>
  <text x="50%" y="${templatesInfo[charter].alignment.community}%" dominant-baseline="middle" text-anchor="middle" class="community">${community}</text>`;

  if (templatesInfo[charter].alignment.date) {
    svgText += `<text x="50%" y="${templatesInfo[charter].alignment.date}%" dominant-baseline="middle" text-anchor="middle" class="date">${formattedDate}</text>`;
  }

  svgText += `</svg>`;
  return svgText;
}

async function generateJpg(svgText, charter, chapter, urlPath) {
  const buffer = Buffer.from(svgText);

  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const outputFIle = `/charters/${
    chapter.split(" ")[0]
  }-${year}-${month}-${day}.jpg`;

  const processImage = async () => {
    return new Promise((resolve, reject) => {
      sharp(urlPath + `/public/templates/${charter}.jpg`)
        .composite([{ input: buffer, left: 0, top: 0 }])
        .toFile(urlPath + "/public" + outputFIle, (err) => {
          if (err) {
            console.error("Error:", err);
            reject(err);
          } else {
            console.log("Image processed successfully!");
            resolve();
          }
        });
    });
  };

  await processImage();

  return outputFIle;
}

function formatJewishDate(date) {
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();
  const jewishYear = date.toLocaleDateString("en-US-u-ca-hebrew", {
    year: "numeric",
  });

  const dayWithSuffix = day + getOrdinalSuffix(day);

  return `${dayWithSuffix} day of ${month} ${year} in the Jewish Year ${jewishYear}.`;
}

function getOrdinalSuffix(day) {
  if (day >= 11 && day <= 13) {
    return "th";
  }

  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

module.exports = {
  generateSvg,
  generateJpg,
};
