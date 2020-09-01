import * as fs from 'fs';
import { EOL } from 'os';
import { workspace, window } from 'vscode';

import { toAbsolutePath, getCsvFileHeader } from './utils/workspace-util';

export class FileGenerator {
  private readonly defaultFileExtension = '.csv';
  private defaultFileName = 'code-review';
  private csvFileHeader = 'sha,filename,url,lines,title,comment,priority,category,additional';

  constructor(private workspaceRoot: string) {
    const configFileName = workspace.getConfiguration().get('code-review.filename') as string;
    if (configFileName) {
      this.defaultFileName = configFileName;
    }
  }

  get reviewFile(): string {
    return `${this.defaultFileName}${this.defaultFileExtension}`;
  }

  /**
   * leveraging all of the other functions to execute
   * the flow of adding a duck to a project
   */
  execute(): string {
    const absoluteFilePath = toAbsolutePath(this.workspaceRoot, this.reviewFile);
    this.create(absoluteFilePath);
    return absoluteFilePath;
  }

  /**
   * Try to create the code review file if not already exist
   * @param absoluteFilePath the absolute file path
   */
  create(absoluteFilePath: string) {
    console.log('DBG CREATE', absoluteFilePath);
    if (fs.existsSync(absoluteFilePath)) {
      const lineContent = getCsvFileHeader(absoluteFilePath);
      if (lineContent !== this.csvFileHeader) {
        window.showErrorMessage(
          `CSV header "${lineContent}" is not matching "${this.csvFileHeader}" format. Please adjust it manually`,
        );
      }
      return;
    }

    try {
      fs.writeFileSync(absoluteFilePath, `${this.csvFileHeader}${EOL}`);
      window.showInformationMessage(
        `Code review file: '${this.defaultFileName}${this.defaultFileExtension}' successfully created.`,
      );
    } catch (err) {
      window.showErrorMessage(`Error when trying to create code review file: '${absoluteFilePath}': ${err}`);
    }
  }

  /**
   * not really using anything that needs to be disposed of, but
   * including in case we need to use in a future update
   */
  dispose() {}
}
