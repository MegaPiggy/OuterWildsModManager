import path from 'path';
import { shell } from 'electron';
import fs from 'fs-extra';

import { modsText } from '../static-text';
import { deleteFolder, getConfig, saveConfig } from '.';
import { unzipRemoteFile } from './files';

export function isInstalled(mod: Mod): boolean {
  if (!mod) {
    return false;
  }
  return Boolean(mod.localVersion);
}

export function isOutdated(mod: Mod): boolean {
  if (
    !isInstalled(mod) ||
    mod.remoteVersion === undefined ||
    mod.localVersion === undefined
  ) {
    return false;
  }

  return mod.remoteVersion !== mod.localVersion;
}

async function upstall(mod: Mod, onProgress: ProgressHandler) {
  if (!mod.downloadUrl) {
    return;
  }

  await unzipRemoteFile(mod.downloadUrl, mod.modPath, onProgress);
}

export async function install(mod: Mod, onProgress: ProgressHandler) {
  if (isInstalled(mod)) {
    throw new Error(modsText.installAlreadyInstalledError);
  }
  await upstall(mod, onProgress);
}

export async function update(mod: Mod, onProgress: ProgressHandler) {
  if (!isOutdated) {
    throw new Error(modsText.updateNotOutOfDateError);
  }
  await upstall(mod, onProgress);
}

export function uninstall(mod: Mod) {
  if (!isInstalled(mod)) {
    throw new Error(modsText.uninstallNotInstalledError);
  }
  return deleteFolder(mod.modPath);
}

export function openDirectory(mod: Mod) {
  if (!mod.modPath) {
    throw new Error(modsText.modPathNotDefinedError);
  }
  if (!fs.existsSync(mod.modPath)) {
    throw new Error(modsText.openNonExistingDirectoryError);
  }
  shell.openPath(path.resolve(mod.modPath));
}

export function openRepo(mod: Mod) {
  if (!mod.repo) {
    throw new Error(modsText.undefinedRepoUrlError);
  }
  shell.openExternal(mod.repo);
}

export function isEnabled(mod: Mod) {
  if (!isInstalled(mod)) {
    return false;
  }
  const config = getConfig(mod);
  return config?.enabled ?? false;
}

export function isBroken(mod: Mod) {
  return mod.errors.length > 0;
}

export const getMissingDependencies = (modMap: ModMap, mod: Mod) => {
  if (!isEnabled(mod)) {
    return '';
  }
  const missingDependencies = [];
  for (const dependencyName of mod.dependencies) {
    const dependency = modMap[dependencyName];
    if (!isEnabled(dependency)) {
      missingDependencies.push(dependency?.name ?? dependencyName);
    }
  }
  return missingDependencies.join(', ');
};

export const isModNeededDependency = (modMap: ModMap, mod: Mod) => {
  if (isEnabled(mod)) {
    return false;
  }

  for (const otherMod of Object.values(modMap)) {
    if (!isEnabled(otherMod)) {
      continue;
    }
    if (otherMod.dependencies.includes(mod.uniqueName)) {
      return true;
    }
  }

  return false;
};

export function toggleEnabled(mod: Mod) {
  const config = getConfig(mod);
  if (!config) {
    return;
  }
  config.enabled = !config.enabled;
  saveConfig(mod, config);
}
