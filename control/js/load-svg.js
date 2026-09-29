fetch('images/final/maindiv2.svg')
  .then(res => res.text())
  .then(svgText => {
    document.getElementById('motorroom-svg-container').innerHTML = svgText;
  });