import * as fs from "fs"
import * as path from "path"
import * as util from "util"

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

function createFolder(pathName: string) {
    let folders = path.dirname(pathName).split(path.sep);
    let p = "";
    while (folders.length) {
        p += folders.shift() + path.sep;
        if (!fs.existsSync(p)) {
            fs.mkdirSync(p);
        }
    }
}

function delDir(path: string) {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                delDir(curPath); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        fs.rmdirSync(path);
    }
}


class Main {
    public static main(): void {
        let client = new TextReplacement();
        client.start();
    }
}

class TextReplacement {
    public async start(): Promise<void> {
        let json = JSON.parse(await readFileAsync(path.join("TextReplacementConfig.json"), { encoding: "utf8" }));
        await delDir(json["outPutPath"]);
        for (let filePath of json["filePath"]) {
            var oldPath = json["inputPath"] + "/" + filePath.replace("!moduleName!", json["oldModuleName"])
                .replace("!Name!", json["oldFileName"]);

            var newPath = json["outPutPath"] + "/" + filePath.replace("!moduleName!", json["newModuleName"])
                .replace("!Name!", json["newFileName"]);

            oldPath = path.normalize(oldPath);
            newPath = path.normalize(newPath);

            let uiData = await readFileAsync(path.join(oldPath), { encoding: "utf8" });

            for (let data of json["eplacementList"]) {
                uiData = uiData.replace(new RegExp(data.oldText, "g"), data.newText);
            }
            {
                if (!fs.existsSync(path.dirname(newPath))) {
                    createFolder(newPath);
                }
                await writeFileAsync(newPath, uiData, { encoding: "utf8" });
            }
        }
    }
}

Main.main();
