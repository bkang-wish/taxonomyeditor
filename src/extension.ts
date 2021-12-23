import * as fs from "fs";
import * as path from "path";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as yaml from "js-yaml";
import { CategoryEditorProvider } from "./category-editor-provider";

interface TranslationObject {
  lang: string;
  value: string;
}

interface AttributeObject {
  id: string;
  name: string;
  translations: TranslationObject[];
  datatype: string;
}

interface CategoryObject {
  id: string;
  name: string;
  translations: TranslationObject[];
  attributes: string[];
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "taxonomyeditor" is now active!');

  console.log("files", vscode.workspace.workspaceFolders);
  const rootDir = vscode.workspace.workspaceFolders!.find((folder) => folder.name === "data")!.uri;

  const attributesDir = path.join(rootDir.path, "attributes");
  const categoriesDir = path.join(rootDir.path, "categories");

  const attributesMap: { [key: string]: AttributeObject } = {};
  const categoriesMap: { [key: string]: CategoryObject } = {};

  fs.readdir(attributesDir, (err, files) => {
    console.log("files", files);

    files.forEach((file) => {
      try {
        const doc = yaml.load(
          fs.readFileSync(`${attributesDir}/${file}`, "utf-8")
        ) as AttributeObject;
        attributesMap[doc.id] = {
          ...doc,
        };
      } catch (e) {
        console.log(e);
      }
    });

    console.log("attributesMap", attributesMap);
  });

  function parseRootCategories(path: string) {
    const dirents = fs.readdirSync(path, { withFileTypes: true });
    const directories = dirents.filter((dirent) => !dirent.isFile());
    directories.forEach((dir) => {
      parseCategories(`${path}/${dir.name}`);
    });
  }

  function parseCategories(path: string) {
    const dirents = fs.readdirSync(path, { withFileTypes: true });
    const file = dirents.filter((dirent) => dirent.isFile() && dirent.name.endsWith(".yml"))[0];
    const directories = dirents.filter((dirent) => !dirent.isFile());

    try {
      const doc = yaml.load(fs.readFileSync(`${path}/${file.name}`, "utf-8")) as CategoryObject;
      categoriesMap[doc.id] = {
        ...doc,
      };
    } catch (e) {
      console.error("parseCategories", file.name, e);
    }

    directories.forEach((dir) => {
      parseCategories(`${path}/${dir.name}`);
    });
  }

  parseRootCategories(`${categoriesDir}/wish_categories`);

  console.log("categoriesMap", categoriesMap);

  context.workspaceState.update("attributesMap", attributesMap);
  context.workspaceState.update("categoriesMap", categoriesMap);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("taxonomyeditor.helloWorld", () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage("Sup from TaxonomyEditor!");
  });

  context.subscriptions.push(disposable);

  context.subscriptions.push(CategoryEditorProvider.register(context));
}

// this method is called when your extension is deactivated
export function deactivate() {}
