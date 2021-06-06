import React from 'react';
import { CssBaseline } from '@material-ui/core';
import { useRecoilValue } from 'recoil';

import TopBar from './TopBar/TopBar';
import { tabList } from './TopBar/AppTabs';
import { selectedTabState } from '../store';
import LoadingSuspense from './LoadingSuspense';

// const useStyles = makeStyles({
//   wrapper: {
//     display: 'flex',
//     height: '100vh',
//     flexDirection: 'column',
//   },
// });

const MainView = () => {
  // const styles = useStyles();
  const selectedTab = useRecoilValue(selectedTabState);

  return (
    <CssBaseline>
      <div className="styles.wrapper">
        <TopBar />
        {tabList.map(
          (tab) =>
            tabList[selectedTab].name === tab.name && (
              <LoadingSuspense key={tab.name}>
                <tab.component />
              </LoadingSuspense>
            )
        )}
      </div>
    </CssBaseline>
  );
};

export default MainView;
