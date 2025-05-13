import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { useHistory } from '@docusaurus/router';
import useIsBrowser from '@docusaurus/useIsBrowser'; // https://docusaurus.io/docs/advanced/ssg#useisbrowser
import { PostHogProvider } from 'posthog-js/react';
import posthog from 'posthog-js';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import { initializeGleap } from '../utils/gleap';

function Root({ children, location }) {
  const isBrowser = useIsBrowser();
  const history = useHistory();
  const { siteConfig: {customFields} } = useDocusaurusContext();
  
    // Determine if this is a new tab in the session
  let newTab = false;
  if (typeof window !== 'undefined') {
    if (!sessionStorage.getItem('docs_tab_opened')) {
      sessionStorage.setItem('docs_tab_opened', 'true');
      newTab = true;
    }
  }
  // 'https://dev.near.org/'
  useEffect(() => {
    // Pass message to dev.near.org (docs is embedded there)
    const sendMessage = url => parent.postMessage({ type: 'urlChange', url }, 'http://localhost:3000');
    sendMessage(location.pathname);

    const unlisten = history.listen(loc => sendMessage(loc.pathname));
    return () => { unlisten() };
  }, [history]);

  useEffect(() => {
    if (isBrowser) {

      //initialize Gleap
      initializeGleap(location, newTab);

      // Initialize PostHog
      posthog.init(customFields.REACT_APP_PUBLIC_POSTHOG_KEY, {
        api_host: customFields.REACT_APP_PUBLIC_POSTHOG_HOST,
      });

      // Track initial page view
      posthog.capture('$pageview');

      // Track page views on route changes
      history.listen((location) => {
        posthog.capture('$pageview', { path: location.pathname });
      });
    }
  }, [isBrowser, history]);

  return (
    <PostHogProvider client={posthog}>
      {children}
    </PostHogProvider>
  );
}

const router = withRouter(Root);

export default router;
