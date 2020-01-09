"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util = __importStar(require("util"));
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
function createFolder(pathName) {
    let folders = path.dirname(pathName).split(path.sep);
    let p = "";
    while (folders.length) {
        p += folders.shift() + path.sep;
        if (!fs.existsSync(p)) {
            fs.mkdirSync(p);
        }
    }
}
function delDir(path) {
    let files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                delDir(curPath); //递归删除文件夹
            }
            else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        fs.rmdirSync(path);
    }
}
class Main {
    static main() {
        let client = new TextReplacement();
        client.start();
    }
}
class TextReplacement {
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            let json = JSON.parse(yield readFileAsync(path.join("TextReplacementConfig.json"), { encoding: "utf8" }));
            yield delDir(json["outPutPath"]);
            for (let filePath of json["filePath"]) {
                var oldPath = json["inputPath"] + "/" + filePath.replace("!moduleName!", json["oldModuleName"])
                    .replace("!Name!", json["oldFileName"]);
                var newPath = json["outPutPath"] + "/" + filePath.replace("!moduleName!", json["newModuleName"])
                    .replace("!Name!", json["newFileName"]);
                oldPath = path.normalize(oldPath);
                newPath = path.normalize(newPath);
                let uiData = yield readFileAsync(path.join(oldPath), { encoding: "utf8" });
                for (let data of json["eplacementList"]) {
                    uiData = uiData.replace(new RegExp(data.oldText, "g"), data.newText);
                }
                {
                    if (!fs.existsSync(path.dirname(newPath))) {
                        createFolder(newPath);
                    }
                    yield writeFileAsync(newPath, uiData, { encoding: "utf8" });
                }
            }
        });
    }
}
Main.main();
