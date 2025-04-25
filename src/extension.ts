// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

// パイプライン順序を抽出する関数
async function extractPipelineOrder(
  handlersFilePath: string
): Promise<string[]> {
  try {
    const content = await fs.promises.readFile(handlersFilePath, "utf-8");

    // start と bypass パターンを検索
    const pipelinePattern =
      /pipe\(\s*start\(([^)]+)\)[,\s]*((?:bypass\([^)]+\)[,\s]*)*)/;
    const match = content.match(pipelinePattern);

    if (!match) {
      return [];
    }

    const pipelineFunctions: string[] = [];

    // start関数の引数を取得
    const startFuncMatch = match[1].match(/([a-zA-Z0-9_]+)\(/);
    if (startFuncMatch) {
      pipelineFunctions.push(startFuncMatch[1]);
    }

    // bypass関数の引数を取得
    const bypassPattern = /bypass\(([^)]+)\)/g;
    let bypassMatch;
    while ((bypassMatch = bypassPattern.exec(match[2])) !== null) {
      const funcName = bypassMatch[1].trim();
      pipelineFunctions.push(funcName);
    }

    return pipelineFunctions;
  } catch (error) {
    console.error("パイプライン順序の抽出に失敗しました:", error);
    return [];
  }
}

// ファイルをソートする関数
async function sortFiles(
  directoryPath: string,
  pipelineOrder: string[]
): Promise<void> {
  try {
    const files = await fs.promises.readdir(directoryPath);

    // ファイル名とパイプライン内の位置をマッピング
    const fileOrderMap: { [key: string]: number } = {};

    for (const file of files) {
      // 関数名をファイル名から抽出
      const funcName = path.parse(file).name;
      const orderIndex = pipelineOrder.indexOf(funcName);

      if (orderIndex !== -1) {
        fileOrderMap[file] = orderIndex;
      } else {
        // パイプラインに含まれない場合は後ろに配置
        fileOrderMap[file] = Number.MAX_SAFE_INTEGER;
      }
    }

    // ファイルをソート順に表示
    const sortedFiles = files.sort((a, b) => fileOrderMap[a] - fileOrderMap[b]);

    return;
  } catch (error) {
    console.error("ファイルのソートに失敗しました:", error);
  }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "sort-pipeline-service" is now active!'
  );

  // パイプラインソートコマンドを登録
  const sortPipelineCommand = vscode.commands.registerCommand(
    "sort-pipeline-service.sortPipeline",
    async () => {
      try {
        // ワークスペースフォルダが選択されているか確認
        if (!vscode.workspace.workspaceFolders) {
          vscode.window.showErrorMessage("ワークスペースが開かれていません");
          return;
        }

        // apps/server/src/routes ディレクトリのパスを探索
        const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        const routesPath = path.join(
          rootPath,
          "apps",
          "server",
          "src",
          "routes"
        );

        if (!fs.existsSync(routesPath)) {
          vscode.window.showErrorMessage("routes ディレクトリが見つかりません");
          return;
        }

        // routes ディレクトリ内を探索
        const routeDirs = await fs.promises.readdir(routesPath);

        for (const routeDir of routeDirs) {
          const routeDirPath = path.join(routesPath, routeDir);
          const stats = await fs.promises.stat(routeDirPath);

          if (!stats.isDirectory()) {
            continue;
          }

          // -GET, -POST, -PUT, -DELETE ディレクトリを探す
          const httpMethodDirs = ["GET", "POST", "PUT", "DELETE"];

          for (const httpMethod of httpMethodDirs) {
            const methodDirName = `-${httpMethod}`;
            const methodDirPath = path.join(routeDirPath, methodDirName);

            if (!fs.existsSync(methodDirPath)) {
              continue;
            }

            // _handlers.ts ファイルのパスを構築
            const handlersFilePath = path.join(routeDirPath, "_handlers.ts");

            if (!fs.existsSync(handlersFilePath)) {
              continue;
            }

            // パイプライン順序を抽出
            const pipelineOrder = await extractPipelineOrder(handlersFilePath);

            if (pipelineOrder.length === 0) {
              continue;
            }

            // ファイルをソート
            await sortFiles(methodDirPath, pipelineOrder);

            vscode.window.showInformationMessage(
              `${routeDir} の ${methodDirName} ディレクトリのファイルをソートしました`
            );
          }
        }

        vscode.window.showInformationMessage(
          "パイプラインの順序に基づいてファイルのソートが完了しました"
        );
      } catch (error) {
        console.error("ソート処理中にエラーが発生しました:", error);
        vscode.window.showErrorMessage("ソート処理中にエラーが発生しました");
      }
    }
  );

  // パイプライン順序を表示するコマンドを登録
  const showPipelineOrderCommand = vscode.commands.registerCommand(
    "sort-pipeline-service.showPipelineOrder",
    async () => {
      try {
        // アクティブなエディタがあるか確認
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showErrorMessage("エディタがアクティブではありません");
          return;
        }

        const filePath = editor.document.uri.fsPath;
        const fileName = path.basename(filePath);

        // _handlers.ts ファイルか確認
        if (fileName !== "_handlers.ts") {
          vscode.window.showErrorMessage(
            "現在のファイルは _handlers.ts ではありません"
          );
          return;
        }

        // パイプライン順序を抽出
        const pipelineOrder = await extractPipelineOrder(filePath);

        if (pipelineOrder.length === 0) {
          vscode.window.showInformationMessage(
            "パイプラインが見つかりませんでした"
          );
          return;
        }

        // 結果を表示
        const output = vscode.window.createOutputChannel("Pipeline Order");
        output.clear();
        output.appendLine("パイプラインの順序:");
        pipelineOrder.forEach((func, index) => {
          output.appendLine(`${index + 1}. ${func}`);
        });
        output.show();
      } catch (error) {
        console.error("パイプライン順序の表示中にエラーが発生しました:", error);
        vscode.window.showErrorMessage(
          "パイプライン順序の表示中にエラーが発生しました"
        );
      }
    }
  );

  context.subscriptions.push(sortPipelineCommand);
  context.subscriptions.push(showPipelineOrderCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
