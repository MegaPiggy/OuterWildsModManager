import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Editor, { loader, useMonaco } from '@monaco-editor/react';
import fs from 'fs-extra';
import path from 'path';
import { Box, MenuList, MenuItem, Select } from '@material-ui/core';
import globby from 'globby';
import { useRecoilValue } from 'recoil';
import PageContainer from '../PageContainer';
import { useDirectoryWatcher } from '../../hooks/use-directory-watcher';
import { filteredModList } from '../../store';

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

export const WorldEditor = () => {
  const monaco = useMonaco();
  const [jsonPaths, setJsonPaths] = useState<string[]>([]);
  const [fileContent, setFileContent] = useState('');
  const [selectedFilePath, setSelectedFilePath] = useState('');
  const [modPath, setModPath] = useState('');

  const updateFileContent = async (filePath: string) => {
    setSelectedFilePath(filePath);
    const content = (await fs.readFile(filePath)).toString();
    if (content) {
      setFileContent(content.toString());
    } else {
      throw new Error(`Failed to read json from path ${filePath}`);
    }
  };

  const directoryWatcherCallback = useCallback(() => {
    const paths = globby.sync(`**/*.json`, {
      cwd: `${modPath}/planets`,
      absolute: true,
    });

    setJsonPaths(paths);
    updateFileContent(paths[0]);
  }, [modPath]);

  useDirectoryWatcher(`${modPath}/planets`, directoryWatcherCallback);

  useEffect(() => {
    if (!monaco) return;

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: true,
    });
  }, [monaco]);

  const addonMods = useRecoilValue(filteredModList);
  const installedAddons = useMemo(
    () =>
      addonMods.filter(
        (addon) => addon.localVersion && addon.parent === 'xen.NewHorizons'
      ),
    [addonMods]
  );

  useEffect(() => {
    if (!installedAddons || !installedAddons[0]) return;
    setModPath(installedAddons[0].modPath);
  }, [installedAddons]);

  return (
    <PageContainer maxWidth={false}>
      <Box
        style={{
          display: 'flex',
          height: '100%',
          position: 'relative',
        }}
      >
        <MenuList
          style={{
            maxHeight: '100%',
            overflowY: 'auto',
            width: 300,
            minWidth: 200,
          }}
        >
          <Select
            onChange={(event) => setModPath(event.target.value as string)}
            value={modPath}
            variant="outlined"
            fullWidth
          >
            {installedAddons.map((addon) => (
              <MenuItem
                selected={modPath === addon.modPath}
                key={addon.uniqueName}
                value={addon.modPath}
              >
                {addon.name}
              </MenuItem>
            ))}
          </Select>
          {jsonPaths.map((jsonPath) => (
            <MenuItem
              key={jsonPath}
              onClick={() => updateFileContent(jsonPath)}
              selected={jsonPath === selectedFilePath}
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
