import { footer, head, scriptLinks, testInfo } from "./components.js";
import { navbar } from "./navbar.js";

export function contactViewNew() {
    return `
<!doctype html>
<html lang="en">
${head("Example App - Contact Us")}
<body>
${navbar("Contact Us")}
<main role="main">
  <div class="container">
    <h1 class="text-info">Contact Us <small class="text-muted">(new)</small></h1>
    ${testInfo()}
    <p>Please let us know what you think below!</p>
  </div>
  <div class="container">
    <form>
      <div class="form-group">
        <label for="contactName">Name</label>
        <input type="text" class="form-control" id="contextName" placeholder="Please enter your name">
      </div>
      <div class="form-group">
        <label for="contactMessage">Message</label>
        <textarea class="form-control" id="contactMessage" rows="3" placeholder="Type your message here"></textarea>
      </div>
      <div class="form-group">
        <label for="contactEmail">Email address</label>
        <input type="email" class="form-control" id="contactEmail" aria-describedby="emailHelp" placeholder="Enter your email here so we can reply">
        <small id="emailHelp" class="form-text text-muted">This is not a real form, no info is collected.</small>
      </div>
      <button type="submit" class="btn btn-primary">Send Message</button>
    </form>
    <hr>
  </div>
</main>
${footer()}
${scriptLinks()}
</body>
</html>
`;
}
