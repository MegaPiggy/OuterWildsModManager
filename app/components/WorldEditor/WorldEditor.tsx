import React, { useEffect, useState, useCallback } from 'react';
import Editor, { loader, useMonaco } from '@monaco-editor/react';
import fs from 'fs-extra';
import path from 'path';
import { Box, MenuList, MenuItem } from '@material-ui/core';
import globby from 'globby';
import PageContainer from '../PageContainer';
import { useDirectoryWatcher } from '../../hooks/use-directory-watcher';

function ensureFirstBackSlash(str: string) {
  return str.length > 0 && str.charAt(0) !== '/' ? `/${str}` : str;
}

function uriFromPath(_path: string) {
  const pathName = path.resolve(_path).replace(/\\/g, '/');
  return encodeURI(`file://${ensureFirstBackSlash(pathName)}`);
}

loader.config({
  paths: {
    vs: uriFromPath(
      path.join(__dirname, '../node_modules/monaco-editor/min/vs')
    ),
  },
});

const planetsFolderPath = `C:\\Users\\rai\\AppData\\Roaming\\OuterWildsModManager\\OWML\\Mods\\Jammer.jammerlore\\planets`;

export const WorldEditor = () => {
  const monaco = useMonaco();
  const [jsonPaths, setJsonPaths] = useState<string[]>([]);
  const [fileContent, setFileContent] = useState('');

  const directoryWatcherCallback = useCallback(() => {
    setJsonPaths(
      globby.sync(`*.json`, {
        cwd: planetsFolderPath,
        absolute: true,
      })
    );
  }, []);

  useDirectoryWatcher(planetsFolderPath, directoryWatcherCallback);

  useEffect(() => {
    if (!monaco) return;

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: true,
    });
  }, [monaco]);

  const updateFileContent = async (filePath: string) => {
    const content = (await fs.readFile(filePath)).toString();
    if (content) {
      setFileContent(content.toString());
    } else {
      throw new Error(`Failed to read json from path ${filePath}`);
    }
  };

  return (
    <PageContainer>
      <Box style={{ display: 'flex', height: '100%', position: 'relative' }}>
        <MenuList>
          {jsonPaths.map((jsonPath) => (
            <MenuItem
              key={jsonPath}
              onClick={() => updateFileContent(jsonPath)}
            >
              {path.basename(jsonPath, '.json')}
            </MenuItem>
          ))}
        </MenuList>
        <Editor defaultLanguage="json" theme="vs-dark" value={fileContent} />
      </Box>
    </PageContainer>
  );
};
