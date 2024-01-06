const streamifier = require("streamifier");
const csv = require("csv-parser");
const Airtable = require("airtable");
const fs = require("fs");
const storageFile = require("@/app/api/storage.json");
const programs = require("./programs.json");

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_API_KEY,
});
const base = Airtable.base(process.env.AIRTABLE_BASE_ID);
const table = base("Leads");

const parseCSVBuffer = function (buffer) {
  return new Promise((resolve, reject) => {
    const results = [];

    // Using streamifier to create a readable stream from the buffer
    const stream = streamifier.createReadStream(buffer).pipe(csv());

    stream
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

const formatForComp = function (value) {
  return String(value).replace(/\s/g, "").toLowerCase();
};

const removeEmptyFields = function (fields) {
  Object.keys(fields).forEach(
    (key) =>
      (fields[key] === "" ||
        fields[key] === undefined ||
        fields[key].length === 0 ||
        fields[key] === null) &&
      delete fields[key]
  );

  return fields;
};

const getCurrentDateFormatted = function () {
  const options = {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZoneName: "short",
  };

  const date = new Date();
  const formattedDate = date.toLocaleString("en-US", options);

  return `${formattedDate}`;
};

const convertPrograms = function (airtablePrograms) {
  const listOfPrograms = airtablePrograms.split(",");

  listOfPrograms.forEach((program, index) => {
    const checkProgram = formatForComp(program);

    programs.forEach((program) => {
      if (checkProgram === formatForComp(program.programName)) {
        listOfPrograms[index] = program.airtableId;
      }
    });
  });

  // If both Kallah and ILTC are selected,
  // remove them and add Full Perlman
  if (
    listOfPrograms.includes("recUKSHNQiTkcKO4D") &&
    listOfPrograms.includes("rec4imJ35LMVZiHyI")
  ) {
    listOfPrograms.splice(listOfPrograms.indexOf("recUKSHNQiTkcKO4D"), 1);
    listOfPrograms.splice(listOfPrograms.indexOf("rec4imJ35LMVZiHyI"), 1);
    listOfPrograms.push("rec58p7px6pxRHXWY");
  }

  return listOfPrograms.join(",");
};

const findChangedRecords = async function (csvRecords, fields) {
  try {
    // Convert all programs to their ID's
    csvRecords.forEach((csvRecord) => {
      csvRecord["Summer Registration Info"] = convertPrograms(
        csvRecord["Summer Registration Info"]
      );
    });

    const airtableRecords = await fetchRecords();

    const updatedRecords = [];
    const newRecords = [];

    csvRecords.forEach(async (csvRecord) => {
      const matchingAirtableRecord = airtableRecords.find(
        (airtableRecord) =>
          airtableRecord.get("myBBYO ID") === csvRecord["myBBYO ID"]
      );

      if (matchingAirtableRecord) {
        const updatedRecord = {
          id: matchingAirtableRecord.getId(),
          fields: {},
        };

        fields.forEach((field) => {
          if (field["checkforComparison"]) {
            const airtableValue = formatForComp(
              matchingAirtableRecord.get(field["airtableValue"])
            );
            const csvValue = formatForComp(csvRecord[field["csvValue"]]);

            if (
              (airtableValue === "undefined" && csvValue === "") ||
              airtableValue === csvValue
            ) {
              return;
            } else {
              if (field["isNum"]) {
                updatedRecord.fields[field["airtableValue"]] = parseInt(
                  csvRecord[field["csvValue"]]
                );
              } else if (field["isList"]) {
                updatedRecord.fields[field["airtableValue"]] =
                  csvRecord[field["csvValue"]] == ""
                    ? []
                    : csvRecord[field["csvValue"]].split(",");
              } else if (
                field["airtableValue"] === "Parent 1 MyBBYO ID" ||
                field["airtableValue"] === "Parent 2 MyBBYO ID"
              ) {
                const csvValue = parseInt(csvRecord[field["csvValue"]]);
                const airtableParent1ID = parseInt(
                  matchingAirtableRecord.get("Parent 1 MyBBYO ID")
                );
                const airtableParent2ID = parseInt(
                  matchingAirtableRecord.get("Parent 2 MyBBYO ID")
                );

                if (
                  csvValue !== airtableParent1ID &&
                  csvValue !== airtableParent2ID &&
                  csvRecord[field["csvValue"]] !== ""
                ) {
                  updatedRecord.fields[field["airtableValue"]] = csvValue;
                }
              } else {
                updatedRecord.fields[field["airtableValue"]] =
                  csvRecord[field["csvValue"]];
              }
            }
          }
        });

        // Remove empty fields
        updatedRecord.fields = removeEmptyFields(updatedRecord.fields);

        if (Object.keys(updatedRecord.fields).length !== 0) {
          updatedRecord.fields["Updated?"] = getCurrentDateFormatted();
          updatedRecords.push(updatedRecord);
        }
      } else {
        // Create new record
        const newRecord = {
          fields: {},
        };

        fields.forEach((field) => {
          if (
            (field["isNum"] ||
              field["csvValue"] === "Parent 1 MyBBYO ID" ||
              field["csvValue"] === "Parent 2 MyBBYO ID") &&
            csvRecord[field["csvValue"]] !== ""
          ) {
            newRecord.fields[field["airtableValue"]] = parseInt(
              csvRecord[field["csvValue"]]
            );
          } else if (field["isList"]) {
            newRecord.fields[field["airtableValue"]] =
              csvRecord[field["csvValue"]] == ""
                ? []
                : csvRecord[field["csvValue"]].split(",");
          } else if (field["csvValue"] == "First Name") {
            newRecord.fields[field["airtableValue"]] =
              csvRecord[Object.keys(csvRecord)[0]];
          } else {
            newRecord.fields[field["airtableValue"]] =
              csvRecord[field["csvValue"]];
          }
        });

        // Remove empty fields
        newRecord.fields = removeEmptyFields(newRecord.fields);
        newRecord.fields["Updated?"] = getCurrentDateFormatted();
        newRecords.push(newRecord);
      }
    });

    storageFile.updatedRecords = updatedRecords;
    storageFile.newRecords = newRecords;
    storageFile.lastTotal = airtableRecords.length;
    storageFile.totalChanges = updatedRecords.length + newRecords.length;
    fs.writeFileSync(
      process.cwd() + "/app/api/storage.json",
      JSON.stringify(storageFile)
    );

    return { updated: updatedRecords, new: newRecords };
  } catch (error) {
    console.error("Error:", error);
  }
};

const fetchRecords = async function () {
  return new Promise(async (resolve, reject) => {
    let totalRecords = 0;
    const airtableRecords = [];

    storageFile.finishedChecking = false;
    storageFile.totalChecked = 0;
    fs.writeFileSync(
      process.cwd() + "/app/api/storage.json",
      JSON.stringify(storageFile)
    );

    table.select().eachPage(
      async function page(records, fetchNextPage) {
        console.log("hi");
        totalRecords += records.length;
        airtableRecords.push(records);

        storageFile.totalChecked = totalRecords;
        fs.writeFileSync(
          process.cwd() + "/app/api/storage.json",
          JSON.stringify(storageFile)
        );

        fetchNextPage();
      },
      function done(err) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          const flattenedRecords = [].concat(...airtableRecords);

          storageFile.finishedChecking = true;
          fs.writeFileSync(
            process.cwd() + "/app/api/storage.json",
            JSON.stringify(storageFile)
          );

          resolve(flattenedRecords);
        }
      }
    );
  });
};

module.exports = {
  getTable: () => {
    return table;
  },
  processCSVInBackground: async (csvBuffer, fields) => {
    try {
      console.log("Processing started...");
      const csvRecords = await parseCSVBuffer(csvBuffer);
      await findChangedRecords(csvRecords, fields);

      console.log("Processing completed.");
    } catch (error) {
      console.error("Error during background processing:", error);
    }
  },
};
