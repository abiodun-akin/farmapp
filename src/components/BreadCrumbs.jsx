import "./BreadCrumbs.css";

import BreadCrumbsDivider from "./BreadCrumbsDivider";

function BreadCrumbs() {
  return (
    <>
      <div className="BreadCrumbs">
        <div className="AdsList">Sign Up</div>
        <div className="Location">
          <span className="BreadCrumbItem">Home</span>
          <BreadCrumbsDivider />
          <span className="BreadCrumbItem">Accounts</span>
          <BreadCrumbsDivider />
          <span className="BreadCrumbItem">Sign Up</span>
        </div>
      </div>
    </>
  );
}

export default BreadCrumbs;
