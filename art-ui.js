'use strict';
// Small pixel-grid symbols, drawn as code-native UI assets.
const iconPaths={
 flame:'M11 1h2v4h2v3h3v4h2v6h-2v3H6v-3H4v-6h2V9h3V5h2zm0 12v3H9v3h6v-5h-2v-3h-2z',
 shield:'M4 2h16v13h-2v3h-3v3h-6v-3H6v-3H4zm3 3v9h2v3h2V5zm6 0v12h2v-3h2V5z',
 sword:'M17 1h6v6h-2v2h-2v2h-2v2h-2v2l3 3-2 2-4-4-6 6H2v-4l6-6-4-4 2-2 3 3h2V7h2V5h2V3h2z',
 heart:'M3 4h6v2h6V4h6v2h2v7h-2v3h-3v3h-3v3H9v-3H6v-3H3v-3H1V6h2z',
 bow:'M4 1h4v2h4v2h3v3h3v4h2v4h2v6h-6v-2h-4v-2H8v-3H5v-3H3V8H1V4h3zm2 4v6h2v3h3v2h5v-5h-2V8h-3V6z',
 staff:'M9 1h6v2h3v6h-3v3h-2v10h-3V12H7V9H4V3h5zm0 3v4h5V4z',
 skull:'M6 2h12v2h3v12h-4v6h-3v-4h-4v4H7v-6H3V4h3zm0 5v5h5V7zm8 0v5h4V7z',
 axe:'M9 1h4v6h3V4h5v3h2v7h-7v-3h-3v12H9V11H6v3H1V7h2V4h3v3h3z',
 hourglass:'M5 1h14v3h-2v4h-2v3h-2v2h2v3h2v4h2v3H5v-3h2v-4h2v-3h2v-2H9V8H7V4H5zm5 3v3h4V4zm0 14v2h4v-2h-2v-2h-1v2z',
 arrow:'M10 2h4v3h3v3h3v3h-6v11h-4V11H4V8h3V5h3z',
 spark:'M10 1h4v6h3V4h3v3h-3v3h6v4h-6v3h3v3h-3v-3h-3v6h-4v-6H7v3H4v-3h3v-3H1v-4h6V7H4V4h3v3h3z'
};
function pixelIcon(name){return '<svg class="pixel-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" shape-rendering="crispEdges"><path fill="currentColor" fill-rule="evenodd" d="'+(iconPaths[name]||iconPaths.spark)+'"/></svg>';}
const skillIcons={thorns:'shield',slam:'shield',bastion:'shield',counter:'sword',second:'heart'};
