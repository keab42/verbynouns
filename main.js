const verbsFolder = './verbs/';
const nounsFolder = './nouns/';

const capitalize = require('capitalize');
require('dotenv').config();
const fs = require('fs');
const masto = require('masto');
const path = require('path');

async function getRandomVerb() {
    const files = await getAllFilesFromFolder(verbsFolder);

    const fileNumber = Math.floor(Math.random() * files.length);
    const filePath = path.join(verbsFolder, files[fileNumber]);

    const verbs = await readJSONFromFile(filePath);

    const verbNumber = Math.floor(Math.random() * (verbs.length - 1));
    
    const verbInfo = verbs[verbNumber];

    return sillifyVerb(verbInfo);
}

function sillifyVerb(verbInfo) {
    
    let presentParticiple = "";

    for (form of verbInfo.forms) {
        const tags = form.tags;
        if (tags.length > 0 && tags.includes("participle") && tags.includes("present")) {
            presentParticiple = form.form;
            break;
        }
    }

    var sillyVerb = presentParticiple.replace(/ing$/g, "y");
    sillyVerb = sillyVerb.replace(/yy$/g, "y");

    console.log(`${verbInfo.word} => ${presentParticiple} => ${sillyVerb}`);

    return sillyVerb
}

async function getRandomNoun() {
    const files = await getAllFilesFromFolder(nounsFolder);

    const fileNumber = Math.floor(Math.random() * files.length);
    const filePath = path.join(nounsFolder, files[fileNumber]);

    const nouns = await readJSONFromFile(filePath);

    const nounNumber = Math.floor(Math.random() * (nouns.length - 1));

    return nouns[nounNumber];
}

async function getAllFilesFromFolder(filepath) {
    const files = await fs.promises.readdir(filepath, (err, files) => {
        if (err) {
            console.error(err);
            return Error(err);
        }
    });

    return files;
}

async function readJSONFromFile(filepath) {
    const data = await fs.promises.readFile(filepath, "utf8", (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

    });

    return JSON.parse(data);
}

async function generateVerbyNoun() {
    const verb = await getRandomVerb();
    const noun = await getRandomNoun();

    const tootText = capitalize.words(`${verb} ${noun}`);

    console.log(tootText);
    return tootText;
}

async function toot(message) {
    const client = masto.createRestAPIClient({
      url: process.env.URL,
      accessToken: process.env.TOKEN,
    });

    const status = await client.v1.statuses.create({
      status: message,
      visibility: "public",
    });

    console.log(status.url);
}

async function start() {
    const message = await generateVerbyNoun();
    toot(message);
}

start();
