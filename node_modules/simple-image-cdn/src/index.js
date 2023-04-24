const THUMBNAIL_URL = `https://images.weserv.nl/?url=`;

/**
 * Get URL
 *
 * @param {String} url
 * @param {Object} options
 */
const getUrl = (url, options = {}) => {
  try {
    //prevent encode an encoded url
    const urlEncoded = window.encodeURIComponent(
      window.decodeURIComponent(url)
    );

    const params = getParams(options);

    return `${THUMBNAIL_URL}${urlEncoded}${params}`;
  } catch {
    return;
  }
};

/**
 *
 * @param {Object} options
 */
const getParams = (options) => {
  let params = "";

  Object.entries({ ...options }).forEach((el) => {
    params = params + `&${el[0]}=${el[1]}`;
  });

  return params || "";
};

export { getUrl as default };
