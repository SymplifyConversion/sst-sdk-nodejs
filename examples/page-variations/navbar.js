export function navbar(page) {
    const links = {
        "Home": "/",
        "Contact Us": "/contact",
    };
    return `
<nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
  <a class="navbar-brand" href="#">Example App</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#defaultNav" aria-controls="defaultNav" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="defaultNav">
    <ul class="navbar-nav mr-auto">
      ${Object.entries(links).map(([text, href]) => {
          let active = "";
        if (page === text) {
            active = "active";
            href = "#";
        }
        return `<li class="nav-item ${active}"><a class="nav-link" href="${href}">${text}</a></li>`;
      })}
      <li class="nav-item">
        <a class="nav-link disabled" href="#">Members Area</a>
      </li>
    </ul>
  </div>
</nav>
`;
}
