export function head(title) {
    return `
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
  <title>${title}</title>
  <style>
    body {
      /* move content top below fixed navbar*/
      padding-top: 3.5rem;
    }
  </style>
  <script>
    function clearSgCookiesAndReload() {
        document.cookie = "sg_cookies=;Max-Age=0;";
        document.location.reload();
    }
  </script>
</head>
`;
}

export function testInfo() {
    return `
<p class="text-muted">
  The <a href="/contact">Contact Us</a> page has two variants, one of
  which you will be randomly assigned (in an even distribution). You
  can use the reload button in the top right to reset your allocation.
</p>
`;
}

export function footer() {
    return `
<footer class="container">
  <p>&copy; 2022 Symplify Technologies AB</p>
</footer>
`;
}

export function scriptLinks() {
    return `
<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.14.7/dist/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
`;
}
