var color = localStorage.getObject('iconBgColor');

if (typeof color != 'string' || !color) {
  // [200, 0, 0, 255]
  color = '#FF0000';
}

localStorage.setObject('iconBgColor', color);


window.addEventListener("load", initPopup);
