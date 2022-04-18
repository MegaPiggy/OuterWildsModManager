import { useDirectoryWatcher } from './use-directory-watcher';

type Handler = () => void;

export function useModsDirectoryWatcher(owmlPath: string, handler: Handler) {
  return useDirectoryWatcher(`${owmlPath}/Mods`, handler);
}
