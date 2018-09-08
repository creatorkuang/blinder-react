import React from "react";
import { Switch } from "react-router-dom";
import Loadable from 'react-loadable';
import Loading from './components/Loading';
import AppliedRoute from './components/AppliedRoute';
import AuthenticatedRoute from './components/AuthenticatedRoute';


const AsyncHome = Loadable({
  loader: () => import("./app/Home/index"),
  loading: Loading
});
const AsyncProfile = Loadable({
  loader: () => import("./app/Profile/index"),
  loading: Loading
});

const AsyncNotFound = Loadable({
  loader: () => import("./app/NotFound/index"),
  loading: Loading
})
const AsyncLogin = Loadable({
  loader: () => import("./app/Login/index"),
  loading: Loading
});

const AsyncPhotoMark = Loadable({
  loader: () => import("./app/PhotoMark/index"),
  loading: Loading
});

const AsyncDownloadPhotoMark = Loadable({
  loader: () => import("./app/DownloadPhoto/index"),
  loading: Loading
});

export default ({ childProps }) =>
  <Switch>
    <AppliedRoute
      path="/"
      exact
      component={AsyncHome}
      props={childProps}
    />
    <AppliedRoute
      path="/login"
      exact
      component={AsyncLogin}
      props={childProps}
    />
     <AuthenticatedRoute
      path="/profile"
      exact
      component={AsyncProfile}
      props={childProps}
    />
     <AuthenticatedRoute
      path="/photo/originDownload"
      exact
      component={AsyncDownloadPhotoMark}
      props={childProps}
    />
      <AuthenticatedRoute
      path="/photo/:photoId"
      exact
      component={AsyncPhotoMark}
      props={childProps}
    />
     <AuthenticatedRoute
      path="/photomark/:photoId"
      exact
      component={AsyncPhotoMark}
      props={childProps}
    />
    
    {/* Finally, catch all unmatched routes */}
    <AppliedRoute component={AsyncNotFound} />
  </Switch>;