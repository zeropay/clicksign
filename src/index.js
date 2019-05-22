import fs from "fs";
import request from "request";
import download from "download";
import temp from "temp";

const url = "https://api.clicksign.com/";
const version = "v1";
const accessToken = process.env.CLICKSIGN_TOKEN;
/**
 *  constant that contains methods for basic operations
 *  @author: Paulo Nascimento
 */
const clicksign = {
  /**
   *  method that returns all documents
   *  @author: Paulo Nascimento
   *  @return {Promise} with documents
   */
  all: () => {
    return new Promise((resolve, reject) => {
      request(
        {
          method: "GET",
          uri: `${url}/${version}/documents`,
          headers: {
            "Content-Type": "application/json"
          },
          qs: {
            access_token: accessToken
          }
        },
        (err, res, body) => {
          if (err) return reject(err);
          resolve(body);
        }
      );
    });
  },
  /**
   *  method that returns only one document
   *  @author: Paulo Nascimento
   *  @param {String} single document key
   *  @return {Promise} with document
   */
  find: documentKey => {
    return new Promise((resolve, reject) => {
      request(
        {
          method: "GET",
          uri: `${url}/${version}/documents/${documentKey}`,
          headers: {
            "Content-Type": "application/json"
          },
          qs: {
            access_token: accessToken
          }
        },
        (err, res, body) => {
          if (err) return reject(err);
          resolve(body);
        }
      );
    });
  },

  /**
   *  method to upload files
   *  @author: Paulo Nascimento
   *  @param {String} local file path to upload
   *  @return {Promise} with data
   */

  upload: filePath => {
    return new Promise(async (resolve, reject) => {
      let tempPath = temp.path();

      await download(filePath).pipe(fs.createWriteStream(tempPath));

      request(
        {
          method: "POST",
          uri: `${url}/${version}/documents`,
          headers: {
            "Content-Type": "multipart/mixed; boundary=frontier"
          },
          qs: {
            access_token: accessToken
          },
          formData: {
            "document[archive][original]": fs.createReadStream(tempPath)
          }
        },
        (err, res, body) => {
          if (err) return reject(err);
          resolve(body);
        }
      );
    });
  },

  /**
   *  method to download files
   *  @author: Paulo Nascimento
   *  @param {String} documentKey single document key
   *  @param {String} location path where to save the downloaded file
   *  @return {Promise}
   */
  download: (documentKey, location) => {
    return download(`${url}/${version}/documents/${documentKey}/download`).pipe(
      fs.createWriteStream(location)
    );
  },

  /**
   *  cancel a document that has not yet been fully signed
   *  @author: Paulo Nascimento
   *  @param {String} documentKey single document key
   *  @return {Promise}
   */

  cancel: documentKey => {
    return new Promise((resolve, reject) => {
      request(
        {
          method: "POST",
          uri: `${url}/${version}/documents/${documentKey}/cancel`,
          headers: {
            "Content-Type": "application/json"
          },
          qs: {
            access_token: accessToken
          }
        },
        (err, res, body) => {
          if (err) return reject(err);
          resolve(body);
        }
      );
    });
  },

  /**
   *  resend an email to a signer who has not yet signed the document
   *  @author: Paulo Nascimento
   *  @param {String} documentKey single document key
   *  @return {Promise}
   */

  resend: (documentKey, data) => {
    return new Promise((resolve, reject) => {
      request(
        {
          method: "POST",
          uri: `${url}/${version}/documents/${documentKey}/resend`,
          headers: {
            "Content-Type": "application/json"
          },
          qs: {
            access_token: accessToken
          },
          body: {
            email: data.email,
            message: data.message
          }
        },
        (err, res, body) => {
          if (err) return reject(err);
          resolve(body);
        }
      );
    });
  }
};

export default clicksign;
