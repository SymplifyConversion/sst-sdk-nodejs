import { footer, head, scriptLinks, testInfo } from "./components.js";
import { navbar } from "./navbar.js";

export function frontPageView() {
    return `
<!doctype html>
<html lang="en">
${head("Example App")}
<body>
${navbar("Home")}
<main role="main">
  <div class="jumbotron">
    <div class="container">
      <h1 class="display-3">Example App</h1>
      <p>
        This is an example site showing how to use the
        <code>@symplify-conversion/sst-sdk-nodejs</code> server side testing SDK
        for testing variations of a page to render for different visitors.
      </p>
      <p>
        <a class="btn btn-primary btn-lg" href="/contact" role="button">Learn more &raquo;</a>
      </p>
    </div>
  </div>
  <div class="container">
    <h2>Test Info</h2>
    ${testInfo()}
    <hr>
  </div>
</main>
${footer()}
${scriptLinks()}
</body>
</html>
`;
}
