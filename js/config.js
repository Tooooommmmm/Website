/*(function () {
  var isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  window.SITE_CONFIG = {
    menuApiUrl: isLocal ? '' : 'https://admin-login-jjgr.onrender.com'
  };
})();
*/

window.SITE_CONFIG = {
  menuApiUrl: 'http://192.168.178.45:3000'
};
