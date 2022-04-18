import React, { useEffect, useState, useCallback } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import path from 'path';
import { Box, MenuList, MenuItem } from '@material-ui/core';
import globby from 'globby';
import PageContainer from '../PageContainer';
import { useDirectoryWatcher } from '../../hooks/use-directory-watcher';

const test = `
{
	"$schema": "https://raw.githubusercontent.com/xen-42/outer-wilds-new-horizons/master/NewHorizons/schema.json",
	"name" : "Devil's Maw",
	"Base" : 
	{
		"surfaceGravity" : 20,
		"surfaceSize" : 500,
		"hasMapMarker" : true
	},
	"Orbit" :
	{
		"semiMajorAxis" : 27000,
		"inclination" : 30,
		"primaryBody" : "Sun",
		"isMoon" : false,
		"longitudeOfAscendingNode" : 50,
		"eccentricity" : 0,
		"argumentOfPeriapsis": 0
	},
	"Atmosphere" :
	{
		"size" : 500,
		"fogTint":
		{
			"r" : 50,
			"g" : 10,
			"b" : 50,
			"a" : 255
		},
		"fogSize": 250,
		"fogDensity":0.3
	},
	"Ring" : 
	{
		"innerRadius" : 550,
		"outerRadius" : 800,
		"inclination" : 10,
		"texture" : "planets/assets/accretion_disk.png",
		"unlit" : true
	},
	"Singularity" :
	{
		"Size" : 400,
		"Type" : "BlackHole"
	},
	"ShipLog" : {
		"spriteFolder": "planets/ShipLogs/sprites",
		"mapMode" : {
			"revealedSprite": "planets/ShipLogs/sprites/blackhole_map_mode.png",
			"scale": 0.5,
			"manualPosition": {
				"x": 1240,
				"y": 180
			},
			"manualNavigationPosition": {
				"x": 6,
				"y": 2
			}
		}
    }
}
`;

const planetsFolderPath = `C:\\Users\\rai\\AppData\\Roaming\\OuterWildsModManager\\OWML\\Mods\\Jammer.jammerlore\\planets`;

export const WorldEditor = () => {
  const monaco = useMonaco();
  const [jsonPaths, setJsonPaths] = useState<string[]>([]);

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

  return (
    <PageContainer>
      <Box style={{ display: 'flex', height: '100%', position: 'relative' }}>
        <MenuList>
          {jsonPaths.map((jsonPath) => (
            <MenuItem key={jsonPath}>
              {path.basename(jsonPath, '.json')}
            </MenuItem>
          ))}
        </MenuList>
        <Editor defaultLanguage="json" theme="vs-dark" defaultValue={test} />
      </Box>
    </PageContainer>
  );
};
