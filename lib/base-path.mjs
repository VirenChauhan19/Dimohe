// Prefixes root-relative URLs so the static build works from a sub-path such as /Dimohe on GitHub Pages.
// Dependency-free so the browser runtime can apply it to pages it renders.
export function withBase(html, base) {
  if (!base) return html;
  return html
    .replace(/(\s(?:href|src|action|poster|data-image)=["'])\/(?!\/)/g, `$1${base}/`)
    .replace(/(\ssrcset=["'])([^"']*)/g, (match, attr, set) => attr + set.replace(/(^|,\s*)\/(?!\/)/g, `$1${base}/`))
    .replace(/url\((['"]?)\/(?!\/)/g, `url($1${base}/`);
}

// Prefixes root-relative string literals ("/cart.js", '/cdn/...', `/products/...`) in browser scripts.
export function scriptWithBase(source, base) {
  return base ? source.replace(/(["'`])\/(?=[a-z])/g, `$1${base}/`) : source;
}
