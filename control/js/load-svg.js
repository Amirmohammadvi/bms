fetch('images/hmi-final.svg')
  .then(res => res.text())
  .then(svgText => {
    document.getElementById('motorroom-svg-container').innerHTML = svgText;
  });