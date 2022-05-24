import { footer, head, scriptLinks } from "./components.js";
import { navbar } from "./navbar.js";

export function contactView() {
    return `
<!doctype html>
<html lang="en">
${head("Example App - Contact Us")}
<body>
${navbar("Contact Us")}
<main role="main">
  <div class="container">
    <h1 class="text-warning">Contact Us</h1>
    <p>We want to know what you think.</p>
  </div>
  <div class="container">
    <form>
      <div class="form-group">
        <label for="contactPhone">Phone Number</label>
        <input type="phone" class="form-control" id="contactPhone" aria-describedby="phoneHelp" placeholder="Enter phone number">
        <small id="phoneHelp" class="form-text text-muted">This is not a real form, no info is collected.</small>
      </div>
      <div class="form-group">
        <label for="contactEmail">Email address</label>
        <input type="email" class="form-control" id="contactEmail" aria-describedby="emailHelp" placeholder="Enter email">
        <small id="emailHelp" class="form-text text-muted">This is not a real form, no info is collected.</small>
      </div>
      <div class="form-group">
        <label for="contactName">Name</label>
        <input type="text" class="form-control" id="contextName" placeholder="Enter name">
      </div>
      <div class="form-group">
        <label for="contactMessage">Message</label>
        <textarea class="form-control" id="contactMessage" rows="3" placeholder="Type message"></textarea>
      </div>
      <div class="form-check">
        <input type="checkbox" class="form-check-input" id="subscribeNewsletter">
        <label class="form-check-label" for="subscribeNewsletter">Subscribe to our newsletter</label>
      </div>
      <button type="submit" class="btn btn-secondary">Send Message</button>
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
