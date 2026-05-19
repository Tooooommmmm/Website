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
  menuApiUrl: 'https://admin-login-jjgr.onrender.com'
};
