import { useEffect } from 'react';
import fs from 'fs-extra';
import { useLoading } from '../store/loading-state';
import { debugConsole } from '../helpers/console-log';

type Handler = () => void;

export function useDirectoryWatcher(directoryPath: string, handler: Handler) {
  const { isLoading } = useLoading();

  useEffect(() => {
    if (isLoading) {
      return undefined;
    }

    debugConsole.log('useEffect: useModsDirectoryWatcher');

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    const watcher = fs.watch(
      directoryPath,
      { recursive: true },
      (eventType, fileName) => {
        debugConsole.log(
          'useEffect: useDirectoryWatcher callback. eventType:',
          eventType,
          'fileName:',
          fileName
        );
        handler();
      }
    );

    // Call the handler one first time.
    handler();

    return () => watcher.close();
  }, [handler, directoryPath, isLoading]);
}
