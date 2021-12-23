import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class TaxonomyTreeProvider implements vscode.TreeDataProvider<DataItem> {
  constructor(private workspaceRoot: string) {}

  getTreeItem(element: DataItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: DataItem): Thenable<DataItem[]> {
    console.log("getChildren");
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("No data");
      return Promise.resolve([]);
    }

    if (element) {
      console.log("element", element);
      const items: DataItem[] = [];

      const pathItems = element.path.split("/");
      const categoriesPath = pathItems.slice(0, pathItems.length - 1).join("/");
      if (this.pathExists(categoriesPath)) {
        const dirents = fs.readdirSync(categoriesPath, { withFileTypes: true });
        const dirs = dirents.filter((dirent) => !dirent.isFile());
        const categoryItems = dirs.map((dir) => {
          const label = dir.name;
          const path = `${categoriesPath}/${dir.name}`;

          const dirents = fs.readdirSync(path, { withFileTypes: true });
          const hasChildren = dirents.filter((dirent) => !dirent.isFile()).length > 0;
          const treeItemState = hasChildren
            ? vscode.TreeItemCollapsibleState.Collapsed
            : vscode.TreeItemCollapsibleState.None;

          return new DataItem(label, treeItemState, `${path}/${dir.name}.yml`);
        });

        items.push(...categoryItems);
      }

      return Promise.resolve(items);
    } else {
      const items: DataItem[] = [];

      console.log("tree.root", this.workspaceRoot);

      //   const attributesPath = path.join(this.workspaceRoot, "attributes");
      //   if (this.pathExists(attributesPath)) {
      //     console.log("tree.attrexist");
      //     const dirents = fs.readdirSync(attributesPath, { withFileTypes: true });
      //     const files = dirents.filter((dirent) => dirent.isFile() && dirent.name.endsWith(".yml"));
      //     const attrItems = files.map((file) => {
      //       const label = file.name.substring(0, file.name.length - 4);
      //       const path = `${attributesPath}/${file.name}`;
      //       return new DataItem(label, vscode.TreeItemCollapsibleState.None, path);
      //     });
      //     console.log("attritems", attrItems);

      //     items.push(...attrItems);
      //   }

      const categoriesPath = path.join(this.workspaceRoot, "categories/wish_categories");
      if (this.pathExists(categoriesPath)) {
        const dirents = fs.readdirSync(categoriesPath, { withFileTypes: true });
        const dirs = dirents.filter((dirent) => !dirent.isFile());
        const categoryItems = dirs.map((dir) => {
          const label = dir.name;
          const path = `${categoriesPath}/${dir.name}`;

          const dirents = fs.readdirSync(path, { withFileTypes: true });
          const hasChildren = dirents.filter((dirent) => !dirent.isFile()).length > 0;
          const treeItemState = hasChildren
            ? vscode.TreeItemCollapsibleState.Collapsed
            : vscode.TreeItemCollapsibleState.None;

          return new DataItem(label, treeItemState, `${path}/${dir.name}.yml`);
        });

        items.push(...categoryItems);
      }

      console.log("treeitems", items);

      return Promise.resolve(items);
    }
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }
}

class DataItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly path: string
  ) {
    super(label, collapsibleState);
    this.tooltip = label;

    this.command = {
      title: "Open",
      command: "vscode.openWith",
      arguments: [vscode.Uri.file(path), "taxonomyeditor.edit"],
    };
  }
}
