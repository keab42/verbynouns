const fs = require("node:fs");
const readline = require('readline');

const fileName = "./rawdumps/kaikki_dot_org-dictionary-English-by-pos-noun.json";

async function processLineByLine() {
    const fileStream = fs.createReadStream(fileName);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    let jsonData = [];

    for await (const line of rl) {
        // Each line in input.txt will be successively available here as `line`.
        let jsonLine = JSON.parse(line);
        jsonData.push(jsonLine);
    }

    console.log(`Raw data parsed. Found ${jsonData.length} entries`);
    processJSON(jsonData);
}

async function processJSON(data) {
    const maxEntries = 5000;
    let content = [];
    let noFiles = 1;

    for (var i = 0; i < data.length; i++) {
        const entry = data[i];
        const word = entry.word;

        if(word.indexOf(".") >= 0 || word.indexOf(";") >= 0 || word.indexOf("'") >= 0 || word.indexOf("\\") >= 0 || word.indexOf("/") >= 0 || word.indexOf("%") >= 0) {
            console.log(`excluding ${word}`);
            continue;
        }

        // Check the first sense entry to see if the primary use is vulgar or offensive
        let sense = entry.senses[0];
        if (sense.hasOwnProperty("tags") && (sense.tags.includes("vulgar") || sense.tags.includes("offensive"))) {
            console.log(`excluding ${word} - tags = ${JSON.stringify(sense.tags)}`);
            continue;
        }

        content.push(word);
    }

    if (content.length > 0) {
        for (let i = 0; i < content.length; i += maxEntries) {
            const chunk = content.slice(i, i + maxEntries);
            await writeFile(JSON.stringify(chunk), noFiles);
            noFiles++;
        }
    }

    console.log(`Generated ${noFiles} files`);
}

async function writeFile(content = "", counter = 1) {
    const filename = "./nouns/nouns" + counter + ".json";
    fs.writeFile(filename, content, err => {
        if (err) {
            console.error(err);
        }
    });
}

processLineByLine();